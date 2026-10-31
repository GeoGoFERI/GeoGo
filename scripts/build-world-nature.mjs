// Builds Level 5 geometry from Natural Earth (public domain): geography regions, rivers, lakes
// and marine polygons, all 1:50m, read from .downloads/ne (not committed; fetched from
// github.com/nvkelso/natural-earth-vector, geojson folder).
// Output: src/data/generated/world-nature.json (committed). Items Natural Earth lacks are
// hand-drawn in src/data/custom/worldNature.ts or derived from country shapes at runtime.
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { geoArea } from 'd3-geo';

const load = (name) => JSON.parse(readFileSync(`.downloads/ne/${name}.geojson`, 'utf8')).features;
const regions = load('ne_50m_geography_regions_polys');
const rivers = load('ne_50m_rivers_lake_centerlines');
const lakes = load('ne_50m_lakes');
const marine = load('ne_50m_geography_marine_polys');

// Item id -> [layer, names...]. Region names are NAME_EN; others use `name`.
const AREAS = {
  'mountain-kavkaz': ['regions', 'Caucasus Mountains'],
  'mountain-himalaja': ['regions', 'Himalayas'],
  'plateau-tibetanska': ['regions', 'Tibetan Plateau'],
  'region-sibirija': ['regions', 'Siberia'],
  'region-mezopotamija': ['regions', 'Mesopotamia'],
  'lowland-veliko-kitajsko': ['regions', 'North China Plain'],
  // Natural Earth has no "Arabian Desert"; its largest part, the Rub' al Khali, stands in.
  'desert-velika-arabska': ['regions', "Rub' al Khali"],
  'peninsula-arabski': ['regions', 'Arabian Peninsula'],
  'peninsula-dekanski': ['regions', 'Deccan Plateau'],
  'peninsula-korejski': ['regions', 'Korean Peninsula'],
  'islands-filipinsko': ['regions', 'Philippines'],
  'islands-japonsko': ['regions', 'Japan'],
  'lake-kaspijsko': ['marine', 'Caspian Sea'],
  'gulf-perzijski': ['marine', 'Persian Gulf'],
  'mountain-veliko-razvodno': ['regions', 'Great Dividing Range'],
  'islands-nova-zelandija': ['regions', 'New Zealand'],
  'islands-mikronezija': ['regions', 'Micronesia'],
  'islands-melanezija': ['regions', 'Melanesia'],
  'islands-polinezija': ['regions', 'Polynesia'],
  'mountain-skalno': ['regions', 'Rocky Mountains'],
  'mountain-apalaci': ['regions', 'Appalachian Mountains'],
  'lowland-osrednje': ['regions', 'Central Lowlands'],
  'lowland-priatlantsko': ['regions', 'Atlantic coastal plain'],
  'region-aljaska': ['regions', 'Alaska'],
  'peninsula-kalifornijski': ['regions', 'Baja California Peninsula'],
  'peninsula-jukatan': ['regions', 'Yucatan Peninsula'],
  'peninsula-florida': ['regions', 'Florida'],
  'peninsula-labrador': ['regions', 'Labrador'],
  'island-grenlandija': ['regions', 'Greenland'],
  'islands-karibsko': ['regions', 'West Indies'],
  'gulf-mehiski': ['marine', 'Gulf of Mexico'],
  'lake-velika-jezera': [
    'lakes',
    'Lake Superior',
    'Lake Michigan',
    'Lake Huron',
    'Lake Erie',
    'Lake Ontario',
  ],
  'mountain-andi': ['regions', 'Andes'],
  'plateau-brazilsko': ['regions', 'Brazilian Highlands'],
  'lowland-amazonsko': ['regions', 'Amazon basin'],
  'desert-atakama': ['regions', 'Atacama Desert'],
  'island-ognjena-zemlja': ['regions', 'Tierra del Fuego'],
  'lowland-kongovska': ['regions', 'Congo basin'],
  'desert-kalahari': ['regions', 'Kalahari Desert'],
  'desert-sahara': ['regions', 'Sahara'],
  'desert-namib': ['regions', 'Namib'],
  'mountain-atlas': ['regions', 'Atlas Mountains'],
  'plateau-etiopsko': ['regions', 'Ethiopian Highlands'],
  'peninsula-somalski': ['regions', 'horn of Africa'],
  'gulf-gvinejski': ['marine', 'Gulf of Guinea'],
  'island-madagaskar': ['regions', 'Madagascar'],
  'lake-viktorijino': ['lakes', 'Lake Victoria'],
};

const RIVERS = {
  'river-evfrat': ['Euphrates'],
  'river-tigris': ['Tigris'],
  'river-ganges': ['Ganges'],
  'river-chang-jiang': ['Chang Jiang', 'Yangtze'],
  'river-huang-he': ['Huang'],
  'river-misisipi': ['Mississippi'],
  'river-sv-lovrenca': ['St. Lawrence'],
  'river-amazonka': ['Amazonas'],
  // Natural Earth names the White Nile by its local names (Bahr el Jebel, El Bahr el Abyad).
  'river-nil': [
    'Nile',
    'Victoria Nile',
    'Albert Nile',
    'Bahr el Jebel',
    'El Bahr el Abyad',
    'Damietta Branch',
    'Rosetta Branch',
  ],
  'river-niger': ['Niger'],
  // The upper Congo is the Lualaba.
  'river-kongo': ['Congo', 'Lualaba'],
  'river-zambezi': ['Zambezi'],
};

const LAYERS = { regions, lakes, marine };
const nameOf = (layer, f) => (layer === 'regions' ? f.properties.NAME_EN : f.properties.name);
const round = (v) => Math.round(v * 1000) / 1000;

function decimate(points, step) {
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
}

const rewind = (polygon) =>
  geoArea({ type: 'Polygon', coordinates: polygon }) > 2 * Math.PI
    ? polygon.map((r) => [...r].reverse())
    : polygon;

const out = {};
for (const [id, [layer, ...names]] of Object.entries(AREAS)) {
  const polygons = [];
  for (const name of names) {
    const f = LAYERS[layer].find((x) => nameOf(layer, x) === name);
    if (!f) throw new Error(`${id}: no ${layer} feature ${name}`);
    const g = f.geometry;
    for (const polygon of g.type === 'Polygon' ? [g.coordinates] : g.coordinates) {
      // Exterior rings only; large shapes are simplified harder than small ones.
      const step = layer === 'lakes' ? 0.02 : 0.08;
      const ring = decimate(polygon[0], step);
      if (ring.length >= 4) polygons.push(rewind([ring]));
    }
  }
  out[id] = { type: 'MultiPolygon', coordinates: polygons };
}

for (const [id, names] of Object.entries(RIVERS)) {
  const lines = rivers
    .filter((r) => names.includes(r.properties.name))
    .flatMap((r) =>
      r.geometry.type === 'LineString' ? [r.geometry.coordinates] : r.geometry.coordinates,
    )
    .map((line) => decimate(line, 0.05))
    .filter((line) => line.length >= 2);
  if (lines.length === 0) throw new Error(`${id}: no river pieces`);
  out[id] = { type: 'MultiLineString', coordinates: lines };
}

mkdirSync('src/data/generated', { recursive: true });
writeFileSync('src/data/generated/world-nature.json', JSON.stringify(out));
console.log(
  `Wrote ${Object.keys(out).length} items, ${Math.round(JSON.stringify(out).length / 1024)} KB`,
);
