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

describe('Level 4 data', () => {
  const items = itemsInLevel(data.items, 4);

  it('has all 28 items from the curriculum list with exact names and geometry', () => {
    expect(items).toHaveLength(28);
    expect(items.map((i) => i.nameSl)).toEqual(
      expect.arrayContaining([
        'Skandinavski polotok',
        'Britansko otočje',
        'Dinarsko gorstvo',
        'Evropska sredogorja',
        'Panonska nižina',
        'Vzhodnoevropsko nižavje',
        'Črno morje',
        'Atlantski ocean',
        'Arktični ocean (Severno ledeno morje)',
      ]),
    );
    for (const item of items) {
      expect(itemSchema.safeParse(item).success, item.id).toBe(true);
      expect(data.featureOf(item.id), item.id).toBeDefined();
    }
  });

  it('puts known places inside the right features', () => {
    expect(inside('mountain-alpe', 10.5, 46.5)).toBe(true);
    expect(inside('lowland-panonska', 16.17, 46.66)).toBe(true); // Murska Sobota
    expect(inside('lowland-panonska', 20.1, 46.3)).toBe(true); // Szeged
    expect(inside('lowland-vzhodnoevropsko', 37.6, 55.75)).toBe(true); // Moskva
    expect(inside('peninsula-apeninski', 12.5, 41.9)).toBe(true); // Rim
    expect(inside('island-kreta', 25.1, 35.3)).toBe(true);
    expect(inside('island-sicilija', 14.0, 37.5)).toBe(true);
    expect(inside('island-islandija', -19, 64.9)).toBe(true);
    expect(inside('sea-jadransko', 15, 43)).toBe(true);
    expect(inside('sea-crno', 34, 43)).toBe(true);
    expect(inside('sea-sredozemsko', 5, 38)).toBe(true);
    expect(inside('ocean-atlantski', 3, 56)).toBe(true); // the North Sea counts as the Atlantic
    expect(inside('ocean-arkticni', 40, 73)).toBe(true); // the Barents Sea counts as Arctic
  });

  it('offers a question only its own family', () => {
    expect(data.choicesFor(4, 'river-ren')).toEqual(['river-ren', 'river-donava', 'river-volga']);
    expect(data.choicesFor(4, 'ocean-atlantski')).toEqual(
      expect.arrayContaining(['sea-jadransko', 'ocean-atlantski', 'ocean-arkticni']),
    );
    expect(data.choicesFor(1, 'ocean-atlantski')).toBeUndefined();
  });
});
