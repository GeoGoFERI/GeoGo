import { describe, expect, it } from 'vitest';
import { buildGameData } from './gameData';
import { testSources } from './testSources';
import { itemsInLevel, itemSchema } from '../core/item';
import { buildOrientationRound } from '../core/orientation';
import { seededRng } from '../core/random';

const data = buildGameData(testSources);
const fact = (id: string) => data.orientation.hemispheres.find((h) => h.countryId === id);

describe('Level 2 data', () => {
  it('has the 8 orientation items from the curriculum, all valid', () => {
    const items = itemsInLevel(data.items, 2);
    expect(items.map((i) => i.nameSl)).toEqual([
      'ekvator',
      'začetni (greenwiški) poldnevnik',
      'severna polobla',
      'južna polobla',
      'vzhodna polobla',
      'zahodna polobla',
      'severni pol',
      'južni pol',
    ]);
    for (const item of items) {
      expect(itemSchema.safeParse(item).success).toBe(true);
      expect(data.featureOf(item.id)).toBeDefined();
    }
  });

  it('knows which hemispheres a country lies wholly in', () => {
    expect(fact('country-au')).toEqual({
      countryId: 'country-au',
      ns: 'hemisphere-juzna',
      ew: 'hemisphere-vzhodna',
    });
    // Brazil crosses the equator; the UK and France cross the prime meridian.
    expect(fact('country-br')?.ns).toBeUndefined();
    expect(fact('country-br')?.ew).toBe('hemisphere-zahodna');
    expect(fact('country-gb')?.ew).toBeUndefined();
    // Small countries are left out: too hard to see at world zoom.
    expect(fact('country-si')).toBeUndefined();
    expect(fact('country-de')).toMatchObject({
      ns: 'hemisphere-severna',
      ew: 'hemisphere-vzhodna',
    });
  });

  it('builds a full round with only the choice pair clickable', () => {
    const round = buildOrientationRound(data.orientation, {}, 0, seededRng(4));
    expect(round).toHaveLength(10);
    const q = round.find((x) => x.mode === 'hemisphere');
    if (!q) throw new Error('no hemisphere question');
    const clickable = data
      .shapesFor(2, q)
      .filter((s) => s.interactive)
      .map((s) => s.id);
    expect(clickable.sort()).toEqual([...(q.choiceIds ?? [])].sort());
  });
});
