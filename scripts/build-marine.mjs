// Builds the ocean (and sea) polygons for Levels 1 and 4 from Natural Earth marine polygons.
// Input: .downloads/ne/ne_110m_geography_marine_polys.geojson and ..._50m_... (public domain),
// fetched from github.com/nvkelso/natural-earth-vector (geojson folder). Not committed.
// Output: src/data/generated/marine.json, small and committed.
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { geoArea } from 'd3-geo';

const SOURCES = {
  '110m': '.downloads/ne/ne_110m_geography_marine_polys.geojson',
  '50m': '.downloads/ne/ne_50m_geography_marine_polys.geojson',
};

// Which Natural Earth features make up each game item, as [source, name] pairs. Marginal seas
// that clearly belong to an ocean are included so a tap on, say, the Caribbean or the North Sea
// still counts as the Atlantic. Seas whose ocean is disputed (Norwegian, Greenland) are left out.
const a110 = (...names) => names.map((n) => ['110m', n]);
const a50 = (...names) => names.map((n) => ['50m', n]);
const ITEMS = {
  'ocean-atlantski': [
    ...a110(
      'North Atlantic Ocean',
      'South Atlantic Ocean',
      'Caribbean Sea',
      'Gulf of Mexico',
      'Labrador Sea',
    ),
    ...a50(
      'North Sea',
      'Irish Sea',
      'Bay of Biscay',
      'English Channel',
      'Bristol Channel',
      'Inner Seas',
    ),
  ],
  'ocean-tihi': a110(
    'North Pacific Ocean',
    'South Pacific Ocean',
    'Philippine Sea',
    'Tasman Sea',
    'South China Sea',
    'Gulf of Alaska',
    'Sea of Okhotsk',
    'Coral Sea',
    'Sea of Japan',
  ),
  'ocean-indijski': a110('INDIAN OCEAN', 'Bay of Bengal', 'Arabian Sea'),
  'ocean-arkticni': [
    ...a110('Arctic Ocean', 'Beaufort Sea', 'Baffin Bay'),
    ...a50('Barents Sea', 'Kara Sea', 'White Sea'),
  ],
  'ocean-juzni': a110('SOUTHERN OCEAN', 'Weddell Sea', 'Ross Sea'),
  // Level 4 seas, from the more detailed 50m layer.
  'sea-sredozemsko': a50(
    'Mediterranean Sea',
    'Tyrrhenian Sea',
    'Ionian Sea',
    'Aegean Sea',
    'Balearic Sea',
    'Golfe du Lion',
  ),
  'sea-jadransko': a50('Adriatic Sea'),
  'sea-crno': a50('Black Sea'),
};

// drops points closer than `step` degrees to the last kept one; land is drawn on top anyway
const decimate = (ring, step) => {
  const out = [];
  for (const [lon, lat] of ring) {
    const last = out[out.length - 1];
    if (!last || Math.abs(lon - last[0]) + Math.abs(lat - last[1]) >= step) {
      out.push([Math.round(lon * 100) / 100, Math.round(lat * 100) / 100]);
    }
  }
  const first = out[0];
  const last = out[out.length - 1];
  if (first && last && (first[0] !== last[0] || first[1] !== last[1])) out.push(first);
  return out.length >= 4 ? out : null;
};

// d3-geo wants clockwise exterior rings (spherical); flip polygons that cover "everything else"
const rewind = (polygon) => {
  const area = geoArea({ type: 'Polygon', coordinates: polygon });
  return area > 2 * Math.PI ? polygon.map((ring) => [...ring].reverse()) : polygon;
};

const loaded = {};
const featuresOf = (source) => {
  loaded[source] ??= JSON.parse(readFileSync(SOURCES[source], 'utf8')).features;
  return loaded[source];
};

const out = {};
for (const [id, parts] of Object.entries(ITEMS)) {
  const polygons = [];
  for (const [source, name] of parts) {
    const step = source === '50m' ? 0.1 : 0.3;
    const feature = featuresOf(source).find((f) => f.properties.name === name);
    if (!feature) throw new Error(`${id}: no feature named ${name}`);
    const g = feature.geometry;
    const list = g.type === 'Polygon' ? [g.coordinates] : g.coordinates;
    for (const polygon of list) {
      // Exterior ring only: holes are other named seas (the Sargasso Sea) and would leave
      // untappable patches in the middle of an ocean.
      const exterior = decimate(polygon[0], step);
      if (exterior) polygons.push(rewind([exterior]));
    }
  }
  out[id] = { type: 'MultiPolygon', coordinates: polygons };
}

mkdirSync('src/data/generated', { recursive: true });
writeFileSync('src/data/generated/marine.json', JSON.stringify(out));
console.log(
  `Wrote ${Object.keys(out).length} items, ${Math.round(JSON.stringify(out).length / 1024)} KB`,
);
