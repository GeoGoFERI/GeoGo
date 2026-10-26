import type { Feature, Geometry, MultiPolygon } from 'geojson';
import type { Item } from '../core/item';
import type { MapShape } from '../map/types';
import type { WorldTopology } from '../map/world';
import { buildContinents } from './continents';
import type { ContinentId } from './continentTable';

// ocean polygons by item id, built by scripts/build-marine.mjs from Natural Earth
export type MarineData = Readonly<Record<string, MultiPolygon>>;

const CURRICULUM = 'Planet Zemlja > Celine in oceani';

// Level 1 continents, names exactly as in the curriculum
const CONTINENTS: readonly [ContinentId, string][] = [
  ['continent-evropa', 'Evropa'],
  ['continent-azija', 'Azija'],
  ['continent-afrika', 'Afrika'],
  ['continent-severna-amerika', 'Severna Amerika'],
  ['continent-juzna-amerika', 'Južna Amerika'],
  ['continent-avstralija', 'Avstralija'],
  ['continent-antarktika', 'Antarktika'],
];

// Level 1 oceans
const OCEANS: readonly { id: string; nameSl: string; levels: (1 | 4)[] }[] = [
  { id: 'ocean-atlantski', nameSl: 'Atlantski ocean', levels: [1, 4] },
  { id: 'ocean-tihi', nameSl: 'Tihi ocean (Pacifik)', levels: [1] },
  { id: 'ocean-indijski', nameSl: 'Indijski ocean', levels: [1] },
  { id: 'ocean-arkticni', nameSl: 'Arktični ocean (Severno ledeno morje)', levels: [1, 4] },
  { id: 'ocean-juzni', nameSl: 'Južni (Antarktični) ocean', levels: [1] },
];

export interface Level1 {
  items: Item[];
  // oceans first (drawn underneath), then continents, then the outline on top
  shapes: MapShape[];
  oceanShapes: MapShape[];
  features: Map<string, Feature<Geometry>>;
}

export const buildLevel1 = (topology: WorldTopology, marine: MarineData): Level1 => {
  const { continents, outline } = buildContinents(topology);
  const features = new Map<string, Feature<Geometry>>();
  const items: Item[] = [];

  const oceanShapes: MapShape[] = [];
  for (const ocean of OCEANS) {
    const geometry = marine[ocean.id];
    if (!geometry) continue;
    const feature: Feature<Geometry> = { type: 'Feature', properties: {}, geometry };
    features.set(ocean.id, feature);
    oceanShapes.push({ id: ocean.id, kind: 'area', feature, interactive: true, variant: 'water' });
    items.push({
      id: ocean.id,
      levels: ocean.levels,
      kind: 'ocean',
      nameSl: ocean.nameSl,
      geo: ocean.id,
      region: 'world',
      curriculum: CURRICULUM,
    });
  }

  const continentShapes: MapShape[] = [];
  for (const [id, nameSl] of CONTINENTS) {
    const feature = continents.get(id);
    if (!feature) continue;
    features.set(id, feature);
    continentShapes.push({ id, kind: 'area', feature, interactive: true, variant: 'borderless' });
    items.push({
      id,
      levels: [1],
      kind: 'continent',
      nameSl,
      geo: id,
      region: 'world',
      curriculum: CURRICULUM,
    });
  }

  const outlineShape: MapShape = {
    id: 'outline-continents',
    kind: 'line',
    feature: outline,
    interactive: false,
  };
  return {
    items,
    shapes: [...oceanShapes, ...continentShapes, outlineShape],
    oceanShapes,
    features,
  };
};
