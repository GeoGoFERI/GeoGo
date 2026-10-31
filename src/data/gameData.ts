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
import { buildLevel2, type Level2 } from './level2';
import { geoContains } from 'd3-geo';
import { buildLevel4, type NatureData } from './level4';
import { FACTS } from './facts';
import { buildLevel5, type WorldNatureData } from './level5';
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
  choicesFor: (level: LevelId, itemId: string) => readonly string[] | undefined;
  nameOf: (id: string) => PlaceName | undefined;
  countryFact: (id: string) => CountryFact | undefined;
  gridAnnotations: Level2['gridAnnotations'];
  placeAt: (lonLat: [number, number]) => string | undefined;
  featureOf: (id: string) => Feature<Geometry> | undefined;
};

export type MapSources = {
  topology: WorldTopology;
  marine: MarineData;
  nature: NatureData;
  world: WorldNatureData;
};

export function buildGameData({ topology, marine, nature, world }: MapSources): GameData {
  const features = placeFeatures(topology);
  const facts: ReadonlyMap<string, GeoFacts> = computeGeoFacts(topology);
  const level1 = buildLevel1(topology, marine);
  const items = [...level1.items, ...europeCountryItems(facts)];
  const itemById = new Map(items.map((i) => [i.id, i]));
  // Hand-written facts are attached once every item exists (see the end of this function).

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

  const level4 = buildLevel4({ nature, marine, countries: featureById });
  items.push(...level4.items);
  for (const item of level4.items) itemById.set(item.id, item);

  const level5 = buildLevel5(topology, world);
  items.push(...level5.items);
  for (const item of level5.items) itemById.set(item.id, item);
  // Sredozemsko morje is listed both under Evropa (Level 4) and Afrika (Level 5).
  const med = itemById.get('sea-sredozemsko');
  if (med) {
    const shared = { ...med, levels: [4, 5] as Item['levels'] };
    items[items.indexOf(med)] = shared;
    itemById.set(med.id, shared);
  }
  const seas = new Map([...level4.features].filter(([id]) => id.startsWith('sea-')));

  for (const [index, item] of items.entries()) {
    const fact = FACTS[item.id];
    if (!fact) continue;
    const withFact = { ...item, fact };
    items[index] = withFact;
    itemById.set(item.id, withFact);
  }

  return {
    items,
    itemById,
    countryShapes,
    shapesFor: (level, question) => {
      if (level === 1) return level1.shapes;
      if (level === 2 && question?.mode === 'coords') return level2.gridShapes(contextCountries);
      if (level === 2) return level2.shapesFor(question?.choiceIds, contextCountries);
      if (level === 4) {
        const group = question ? level4.groupOf(question.itemId) : undefined;
        return level4.shapesFor(group, contextCountries, level1.oceanShapes);
      }
      if (level === 5) return level5.shapesFor(question?.itemId, contextCountries, seas);
      return countryShapes;
    },
    orientation: level2.config,
    gridAnnotations: level2.gridAnnotations,
    placeAt: (lonLat) => {
      for (const [id, f] of featureById) if (geoContains(f, lonLat)) return id;
      for (const ocean of level1.oceanShapes)
        if (geoContains(ocean.feature, lonLat)) return ocean.id;
      return undefined;
    },
    choicesFor: (level, itemId) => {
      if (level === 2) return level2.config.choiceSets.find((set) => set.includes(itemId));
      if (level === 4) {
        const group = level4.groupOf(itemId);
        return group ? level4.membersOf(group) : undefined;
      }
      if (level === 5) return level5.choicesFor(itemId);
      return undefined;
    },
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
    featureOf: (id) =>
      featureById.get(id) ??
      level1.features.get(id) ??
      level2.features.get(id) ??
      level4.features.get(id) ??
      level5.features.get(id),
  };
}

let cached: Promise<GameData> | undefined;

export const loadGameData = (): Promise<GameData> => {
  cached ??= Promise.all([
    loadWorld50(),
    import('./generated/marine.json'),
    import('./generated/europe-nature.json'),
    import('./generated/world-nature.json'),
  ]).then(([topology, marine, nature, world]) =>
    buildGameData({
      topology,
      marine: marine.default as MarineData,
      nature: nature.default as unknown as NatureData,
      world: world.default as unknown as WorldNatureData,
    }),
  );
  return cached;
};
