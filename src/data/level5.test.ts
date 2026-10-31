import { describe, expect, it } from 'vitest';
import { geoContains } from 'd3-geo';
import { buildGameData } from './gameData';
import { testSources } from './testSources';
import { itemsInLevel, itemSchema } from '../core/item';

const data = buildGameData(testSources);
const inside = (id: string, lon: number, lat: number): boolean => {
  const f = data.featureOf(id);
  if (!f) throw new Error(`no geometry for ${id}`);
  return geoContains(f, [lon, lat]);
};

describe('Level 5 data', () => {
  const items = itemsInLevel(data.items, 5);

  it('has every unit from the curriculum lists, valid and with geometry', () => {
    // 67 units in the curriculum lists: 66 new ones plus Sredozemsko morje, shared with Level 4.
    expect(items).toHaveLength(67);
    expect(data.itemById.get('sea-sredozemsko')?.levels).toEqual([4, 5]);
    for (const item of items) {
      expect(itemSchema.safeParse(item).success, item.id).toBe(true);
      expect(data.featureOf(item.id), item.id).toBeDefined();
    }
  });

  it('puts known places inside the right units', () => {
    expect(inside('continent-evrazija', 14.5, 46.05)).toBe(true); // Ljubljana
    expect(inside('continent-evrazija', 116.4, 39.9)).toBe(true); // Peking
    expect(inside('peninsula-indokitajski', 100.5, 13.75)).toBe(true); // Bangkok
    expect(inside('islands-indonezijsko', 106.8, -6.2)).toBe(true); // Džakarta
    expect(inside('desert-sahara', 5, 24)).toBe(true);
    expect(inside('island-grenlandija', -40, 72)).toBe(true);
    expect(inside('island-madagaskar', 46.9, -19)).toBe(true);
    expect(inside('lake-velika-jezera', -87.5, 47.7)).toBe(true); // Lake Superior
    expect(inside('lake-viktorijino', 33, -1)).toBe(true);
    expect(inside('lake-kaspijsko', 51, 42)).toBe(true);
    expect(inside('gulf-mehiski', -90, 25)).toBe(true);
    expect(inside('lowland-cadska', 14.5, 13)).toBe(true); // Lake Chad
    // Hand-drawn outlines are wound the right way: a point far away is outside.
    expect(inside('lowland-cadska', -60, -30)).toBe(false);
    expect(inside('reef-veliki-koralni', 0, 0)).toBe(false);
  });

  it('offers a question its own family on its own continent', () => {
    expect(data.choicesFor(5, 'river-nil')).toEqual([
      'river-nil',
      'river-niger',
      'river-kongo',
      'river-zambezi',
    ]);
    expect(data.choicesFor(5, 'sea-sredozemsko')).toEqual(
      expect.arrayContaining(['gulf-gvinejski', 'lake-viktorijino', 'sea-sredozemsko']),
    );
  });
});
