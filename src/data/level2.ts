import { geoArea, geoCircle, geoGraticule10 } from 'd3-geo';
import type { Feature, Geometry } from 'geojson';
import type { Item } from '../core/item';
import type { HemisphereFact, OrientationConfig } from '../core/orientation';
import type { MapShape } from '../map/types';
import { hemispheresOf } from './geoFacts';

const CURRICULUM = 'Planet Zemlja > Orientacija';

// Level 2 items, names exactly as in the curriculum.
const ITEMS: readonly { id: string; nameSl: string; kind: Item['kind'] }[] = [
  { id: 'line-ekvator', nameSl: 'ekvator', kind: 'line' },
  { id: 'line-zacetni-poldnevnik', nameSl: 'začetni (greenwiški) poldnevnik', kind: 'line' },
  { id: 'hemisphere-severna', nameSl: 'severna polobla', kind: 'hemisphere' },
  { id: 'hemisphere-juzna', nameSl: 'južna polobla', kind: 'hemisphere' },
  { id: 'hemisphere-vzhodna', nameSl: 'vzhodna polobla', kind: 'hemisphere' },
  { id: 'hemisphere-zahodna', nameSl: 'zahodna polobla', kind: 'hemisphere' },
  { id: 'pole-severni', nameSl: 'severni pol', kind: 'pole' },
  { id: 'pole-juzni', nameSl: 'južni pol', kind: 'pole' },
];

// Shown together in one question, so the pupil chooses between a matching pair.
export const CHOICE_SETS: readonly (readonly string[])[] = [
  ['line-ekvator', 'line-zacetni-poldnevnik'],
  ['hemisphere-severna', 'hemisphere-juzna'],
  ['hemisphere-vzhodna', 'hemisphere-zahodna'],
  ['pole-severni', 'pole-juzni'],
];

// Countries smaller than this (steradians, about 80 000 km²) are hard to see on a world map.
const MIN_COUNTRY_AREA = 0.002;

// A line of constant latitude or longitude, densified so it bends with the projection.
function line(points: [number, number][]): Feature<Geometry> {
  return { type: 'Feature', properties: {}, geometry: { type: 'LineString', coordinates: points } };
}

const steps = (from: number, to: number, n: number): number[] =>
  Array.from({ length: n + 1 }, (_, i) => from + ((to - from) * i) / n);

function geometryFor(id: string): Feature<Geometry> {
  const cap = (center: [number, number]): Feature<Geometry> => ({
    type: 'Feature',
    properties: {},
    geometry: geoCircle().center(center).radius(90).precision(2)(),
  });
  switch (id) {
    case 'line-ekvator':
      return line(steps(-180, 180, 72).map((lon) => [lon, 0]));
    case 'line-zacetni-poldnevnik':
      return line(steps(-90, 90, 36).map((lat) => [0, lat]));
    case 'hemisphere-severna':
      return cap([0, 90]);
    case 'hemisphere-juzna':
      return cap([0, -90]);
    case 'hemisphere-vzhodna':
      return cap([90, 0]);
    case 'hemisphere-zahodna':
      return cap([-90, 0]);
    case 'pole-severni':
      return { type: 'Feature', properties: {}, geometry: { type: 'Point', coordinates: [0, 90] } };
    default:
      return {
        type: 'Feature',
        properties: {},
        geometry: { type: 'Point', coordinates: [0, -90] },
      };
  }
}

export interface Level2 {
  items: Item[];
  features: Map<string, Feature<Geometry>>;
  hemispheres: HemisphereFact[];
  config: OrientationConfig;
  // Shapes for a question: the countries and grid as context plus one choice pair.
  shapesFor: (choiceIds: readonly string[] | undefined, context: readonly MapShape[]) => MapShape[];
}

export function buildLevel2(countries: ReadonlyMap<string, Feature<Geometry>>): Level2 {
  const features = new Map(ITEMS.map((i) => [i.id, geometryFor(i.id)]));
  const items: Item[] = ITEMS.map((i) => ({
    id: i.id,
    levels: [2],
    kind: i.kind,
    nameSl: i.nameSl,
    geo: i.id,
    region: 'world',
    curriculum: CURRICULUM,
  }));

  // Countries wholly in one hemisphere, large enough to see at world zoom.
  const hemispheres: HemisphereFact[] = [];
  for (const [countryId, f] of countries) {
    if (geoArea(f) < MIN_COUNTRY_AREA) continue;
    const h = hemispheresOf(f);
    const fact: HemisphereFact = { countryId };
    if (h.north !== undefined) fact.ns = h.north ? 'hemisphere-severna' : 'hemisphere-juzna';
    if (h.east !== undefined) fact.ew = h.east ? 'hemisphere-vzhodna' : 'hemisphere-zahodna';
    if (fact.ns || fact.ew) hemispheres.push(fact);
  }

  const grid: MapShape = {
    id: 'grid',
    kind: 'line',
    feature: { type: 'Feature', properties: {}, geometry: geoGraticule10() },
    interactive: false,
    tone: 'grid',
  };

  const cache = new Map<string, MapShape[]>();
  const shapesFor = (
    choiceIds: readonly string[] | undefined,
    context: readonly MapShape[],
  ): MapShape[] => {
    const key = (choiceIds ?? []).join(',');
    const cached = cache.get(key);
    if (cached) return cached;
    const choices: MapShape[] = (choiceIds ?? []).flatMap((id): MapShape[] => {
      const feature = features.get(id);
      const item = ITEMS.find((i) => i.id === id);
      if (!feature || !item) return [];
      if (item.kind === 'line')
        return [{ id, kind: 'line', feature, interactive: true, variant: 'wide', tone: 'orange' }];
      if (item.kind === 'pole') return [{ id, kind: 'point', feature, interactive: true }];
      return [{ id, kind: 'area', feature, interactive: true, variant: 'overlay' }];
    });
    // Hemisphere pairs show their dividing line (not clickable), so the pupil can reason from it.
    const divider = choiceIds?.includes('hemisphere-severna')
      ? 'line-ekvator'
      : choiceIds?.includes('hemisphere-vzhodna')
        ? 'line-zacetni-poldnevnik'
        : undefined;
    const dividerFeature = divider ? features.get(divider) : undefined;
    const dividerShape: MapShape[] = dividerFeature
      ? [
          {
            id: `${divider ?? ''}-context`,
            kind: 'line',
            feature: dividerFeature,
            interactive: false,
            variant: 'wide',
            tone: 'orange',
          },
        ]
      : [];
    const shapes = [...context, grid, ...dividerShape, ...choices];
    cache.set(key, shapes);
    return shapes;
  };

  return {
    items,
    features,
    hemispheres,
    config: { items, choiceSets: CHOICE_SETS, hemispheres },
    shapesFor,
  };
}
