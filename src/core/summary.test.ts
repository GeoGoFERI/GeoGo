import { describe, expect, it } from 'vitest';
import { buildSummary } from './summary';
import { makeItems } from './testItems';
import type { QuestionResult } from './question';
import type { Item } from './item';

const items = makeItems(10).map((item, i): Item => ({
  ...item,
  group: i < 5 ? 'balkan' : 'skandinavija',
}));
const lookup = new Map(items.map((i) => [i.id, i]));
const res = (i: number, stars: 1 | 2 | 3): QuestionResult => ({
  questionId: `q${String(i)}`,
  itemId: `country-${String(i)}`,
  stars,
  attempts: 4 - stars,
  hintsUsed: 0,
  wrongIds: [],
});

describe('buildSummary', () => {
  it('praises a perfect round and names nothing to practise', () => {
    const s = buildSummary(
      items.map((_, i) => res(i, 3)),
      lookup,
    );
    expect(s.headline).toBe('excellent');
    expect(s.stars).toBe(30);
    expect(s.maxStars).toBe(30);
    expect(s.practiceGroups).toEqual([]);
    expect(s.weakItemIds).toEqual([]);
    expect(s.perfect).toBe(10);
  });

  it('names the group with gaps and lists weak items for replay', () => {
    const results = items.map((_, i) => res(i, i < 5 && i % 2 === 0 ? 1 : 3));
    const s = buildSummary(results, lookup);
    expect(s.headline).toBe('good');
    expect(s.practiceGroups).toEqual(['balkan']);
    expect(s.weakItemIds).toEqual(['country-0', 'country-2', 'country-4']);
  });

  it('does not name a group for a single small slip', () => {
    const results = items.map((_, i) => res(i, i === 7 ? 2 : 3));
    expect(buildSummary(results, lookup).practiceGroups).toEqual([]);
  });

  it('uses the practice headline for a hard round', () => {
    const s = buildSummary(
      items.map((_, i) => res(i, 1)),
      lookup,
    );
    expect(s.headline).toBe('practice');
    expect(s.practiceGroups).toHaveLength(2);
  });

  it('handles an empty round', () => {
    expect(buildSummary([], lookup).headline).toBe('practice');
  });
});
