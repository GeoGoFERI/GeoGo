import type { Feature, Geometry } from 'geojson';
import type { Item, LevelId } from '../core/item';
import type { MapShape } from '../map/types';
import { loadWorld50, type WorldTopology } from '../map/world';
import { CONTEXT_GEOS } from './countriesWorld';
import { europeCountryItems } from './countryItems';
import { computeGeoFacts, sortByName, type GeoFacts } from './geoFacts';
import { placeFeatures } from './geometry';
import { PLACES, PLACE_BY_GEO, PLACE_BY_ID, placeId } from './places';
import { buildLevel1, type MarineData } from './level1';
import { buildLevel2 } from './level2';
import type { OrientationConfig } from '../core/orientation';
import type { Question } from '../core/round';

export type PlaceName = { nameSl: string; plural: boolean };

export type CountryFact = { coastal: boolean; neighbours: string[] };

export type GameData = {
  items: readonly Item[];
  itemById: ReadonlyMap<string, Item>;
  countryShapes: readonly MapShape[];
  shapesFor: (level: LevelId, question?: Question) => readonly MapShape[];
  orientation: OrientationConfig;
  nameOf: (id: string) => PlaceName | undefined;
  countryFact: (id: string) => CountryFact | undefined;
  featureOf: (id: string) => Feature<Geometry> | undefined;
};

export type MapSources = { topology: WorldTopology; marine: MarineData };

export const buildGameData = ({ topology, marine }: MapSources): GameData => {
  const features = placeFeatures(topology);
  const facts: ReadonlyMap<string, GeoFacts> = computeGeoFacts(topology);
  const level1 = buildLevel1(topology, marine);
  const items = [...level1.items, ...europeCountryItems(facts)];
  const itemById = new Map(items.map((i) => [i.id, i]));

  const countryShapes: MapShape[] = [];
  const featureById = new Map<string, Feature<Geometry>>();
  for (const row of PLACES) {
    const f = features.get(row.geo);
    if (!f) continue;
    const id = placeId(row);
    featureById.set(id, f);
    countryShapes.push({ id, kind: 'area', feature: f, interactive: true });
  }
  for (const key of CONTEXT_GEOS) {
    const f = features.get(key);
    if (f) countryShapes.push({ id: key, kind: 'area', feature: f, interactive: false });
  }

  // Level 2 uses the sovereign countries for "which hemisphere" questions and as context.
  const sovereign = new Map(
    PLACES.filter((r) => r.status === 'country').flatMap((r) => {
      const f = featureById.get(placeId(r));
      return f ? [[placeId(r), f] as const] : [];
    }),
  );
  const level2 = buildLevel2(sovereign);
  items.push(...level2.items);
  for (const item of level2.items) itemById.set(item.id, item);
  const contextCountries: MapShape[] = countryShapes.map((s) => ({ ...s, interactive: false }));

  return {
    items,
    itemById,
    countryShapes,
    shapesFor: (level, question) => {
      if (level === 1) return level1.shapes;
      if (level === 2) return level2.shapesFor(question?.choiceIds, contextCountries);
      return countryShapes;
    },
    orientation: level2.config,
    nameOf: (id) => {
      const row = PLACE_BY_ID.get(id);
      const item = itemById.get(id);
      if (item) return { nameSl: item.nameSl, plural: item.plural ?? false };
      return row ? { nameSl: row.nameSl, plural: row.plural ?? false } : undefined;
    },
    countryFact: (id) => {
      const row = PLACE_BY_ID.get(id);
      const f = row ? facts.get(row.geo) : undefined;
      if (!row || !f) return undefined;
      const neighbourRows = f.neighbours.flatMap((g) => {
        const r = PLACE_BY_GEO.get(g);
        return r ? [r] : [];
      });
      return { coastal: f.coastal, neighbours: sortByName(neighbourRows).map((r) => placeId(r)) };
    },
    featureOf: (id) => featureById.get(id) ?? level1.features.get(id) ?? level2.features.get(id),
  };
};

let cached: Promise<GameData> | undefined;

export const loadGameData = (): Promise<GameData> => {
  cached ??= Promise.all([loadWorld50(), import('./generated/marine.json')]).then(
    ([topology, marine]) => buildGameData({ topology, marine: marine.default as MarineData }),
  );
  return cached;
};
