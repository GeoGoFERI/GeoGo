// Builds Level 4 geometry that Natural Earth provides (public domain):
//   regions from ne_50m_geography_regions_polys, rivers from ne_50m_rivers_lake_centerlines.
// Inputs live in .downloads/ne (fetched from github.com/nvkelso/natural-earth-vector, geojson
// folder, not committed). Output: src/data/generated/europe-nature.json (committed).
// Items not in Natural Earth are hand-drawn in src/data/custom/ or derived from country shapes.
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { geoArea } from 'd3-geo';

const load = (name) => JSON.parse(readFileSync(`.downloads/ne/${name}.geojson`, 'utf8')).features;
const regions = load('ne_50m_geography_regions_polys');
const rivers = load('ne_50m_rivers_lake_centerlines');

// Item id -> Natural Earth region NAME.
const REGIONS = {
  'peninsula-skandinavski': 'SCANDINAVIA',
  'peninsula-pirenejski': 'PENÍNSULA IBÉRICA',
  'peninsula-balkanski': 'BALKAN PEN.',
  'islands-britansko-otocje': 'BRITISH ISLES',
  'island-islandija': 'ICELAND',
  'island-korzika': 'Corse',
  'island-sardinija': 'Sardegna',
  'island-sicilija': 'Sicilia',
  'mountain-pireneji': 'PYRENEES',
  'mountain-alpe': 'ALPS',
  'mountain-apenini': 'APPENNINI',
  'mountain-karpati': 'CARPATHIAN MOUNTAINS',
  'mountain-dinarsko-gorstvo': 'Dinaric Alps',
  'mountain-skandinavsko-gorstvo': 'KJØLEN MOUNTAINS',
  'mountain-ural': 'URAL MOUNTAINS',
};
// Vzhodnoevropsko nižavje is hand-drawn: Natural Earth's "Northern European Plain" is a narrow
// northern band that misses Belarus and Ukraine (see src/data/custom/europeNature.ts).
const CUT_WEST_OF = {};

// Item id -> river pieces (Natural Earth splits rivers by local name).
const RIVERS = {
  'river-ren': ['Rhein', 'Rhin', 'Rhine', 'Nederrijn', 'Lek', 'Waal'],
  'river-donava': ['Donau', 'Danube'],
  'river-volga': ['Volga'],
};

const round = (v) => Math.round(v * 1000) / 1000;

const decimate = (points, step) => {
  const out = [];
  for (const [lon, lat] of points) {
    const last = out[out.length - 1];
    if (!last || Math.abs(lon - last[0]) + Math.abs(lat - last[1]) >= step)
      out.push([round(lon), round(lat)]);
  }
  const lastIn = points[points.length - 1];
  const lastOut = out[out.length - 1];
  if (lastIn && lastOut && (lastOut[0] !== round(lastIn[0]) || lastOut[1] !== round(lastIn[1]))) {
    out.push([round(lastIn[0]), round(lastIn[1])]);
  }
  return out;
};

// sutherland-Hodgman against the half-plane lon >= cut
const clipEast = (ring, cut) => {
  const out = [];
  for (let i = 0; i < ring.length - 1; i += 1) {
    const a = ring[i];
    const b = ring[i + 1];
    const aIn = a[0] >= cut;
    const bIn = b[0] >= cut;
    if (aIn) out.push(a);
    if (aIn !== bIn) out.push([cut, a[1] + ((cut - a[0]) / (b[0] - a[0])) * (b[1] - a[1])]);
  }
  if (out.length > 0) out.push(out[0]);
  return out.length >= 4 ? out : null;
};

// d3-geo wants clockwise exterior rings; flip polygons that would cover the rest of the globe
const rewind = (polygon) => {
  return geoArea({ type: 'Polygon', coordinates: polygon }) > 2 * Math.PI
    ? polygon.map((ring) => [...ring].reverse())
    : polygon;
};

const out = {};
for (const [id, name] of Object.entries(REGIONS)) {
  const f = regions.find((r) => r.properties.NAME === name);
  if (!f) throw new Error(`${id}: no region ${name}`);
  const g = f.geometry;
  const polygons = (g.type === 'Polygon' ? [g.coordinates] : g.coordinates).flatMap((polygon) => {
    let exterior = polygon[0];
    if (CUT_WEST_OF[id] !== undefined) exterior = clipEast(exterior, CUT_WEST_OF[id]);
    if (!exterior) return [];
    const ring = decimate(exterior, 0.05);
    return ring.length >= 4 ? [rewind([ring])] : [];
  });
  out[id] = { type: 'MultiPolygon', coordinates: polygons };
}

for (const [id, names] of Object.entries(RIVERS)) {
  const lines = rivers
    .filter((r) => names.includes(r.properties.name))
    .flatMap((r) =>
      r.geometry.type === 'LineString' ? [r.geometry.coordinates] : r.geometry.coordinates,
    )
    .map((line) => decimate(line, 0.03))
    .filter((line) => line.length >= 2);
  if (lines.length === 0) throw new Error(`${id}: no river pieces`);
  out[id] = { type: 'MultiLineString', coordinates: lines };
}

mkdirSync('src/data/generated', { recursive: true });
writeFileSync('src/data/generated/europe-nature.json', JSON.stringify(out));
console.log(
  `Wrote ${Object.keys(out).length} items, ${Math.round(JSON.stringify(out).length / 1024)} KB`,
);
