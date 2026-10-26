import { describe, expect, it } from 'vitest';
import world from 'world-atlas/countries-50m.json';
import { itemSchema } from '../core/item';
import { countryKeys, type WorldTopology } from '../map/world';
import { testSources } from './testSources';
import { buildGameData } from './gameData';
import { CONTEXT_GEOS, GEO_MERGES } from './countriesWorld';
import { EUROPE_ROWS } from './countriesEurope';
import { PLACES, placeId } from './places';
import { flagUrl } from './flags';

const topology = world as unknown as WorldTopology;
const data = buildGameData(testSources);

describe('game data', () => {
  it('has valid items with unique ids', () => {
    for (const item of data.items) expect(itemSchema.safeParse(item).success).toBe(true);
    expect(new Set(data.items.map((i) => i.id)).size).toBe(data.items.length);
  });

  it('has unique place ids and geo keys', () => {
    expect(new Set(PLACES.map(placeId)).size).toBe(PLACES.length);
    expect(new Set(PLACES.map((r) => r.geo)).size).toBe(PLACES.length);
  });

  it('gives every item a Slovenian name and geometry', () => {
    for (const item of data.items) {
      expect(item.nameSl.trim().length).toBeGreaterThan(1);
      expect(data.featureOf(item.id), item.id).toBeDefined();
    }
  });

  it('gives every Europe country a name, a flag and a group', () => {
    expect(EUROPE_ROWS).toHaveLength(47);
    for (const row of EUROPE_ROWS) {
      expect(data.nameOf(placeId(row))?.nameSl).toBe(row.nameSl);
      expect(flagUrl(row.a2), row.a2).toBeDefined();
      expect(row.europe).toBeDefined();
    }
  });

  it('accounts for every feature in the map: a place, a merged part or context', () => {
    const known = new Set([
      ...PLACES.map((r) => r.geo),
      ...Object.values(GEO_MERGES).flat(),
      ...CONTEXT_GEOS,
    ]);
    const unknown = countryKeys(topology).filter((k) => !known.has(k));
    expect(unknown).toEqual([]);
  });

  it('lists neighbours in Slovenian alphabetical order', () => {
    const fact = data.countryFact('country-si');
    expect(fact?.neighbours.map((id) => data.nameOf(id)?.nameSl)).toEqual([
      'Avstrija',
      'Hrvaška',
      'Italija',
      'Madžarska',
    ]);
  });
});
