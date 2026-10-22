import { describe, expect, it } from 'vitest';
import { seededRng } from './random';
import { buildFindRound, buildFixedRound, buildReplayRound, ROUND_SIZE } from './round';
import { makeItems } from './testItems';
import type { ItemStats } from './leitner';

describe('buildFindRound', () => {
  const pool = makeItems(40);

  it('has 10 questions without repeats', () => {
    const round = buildFindRound(pool, {}, 0, seededRng(1));
    expect(round).toHaveLength(ROUND_SIZE);
    expect(new Set(round.map((q) => q.itemId)).size).toBe(ROUND_SIZE);
    for (const q of round) expect(q.acceptIds).toEqual([q.itemId]);
  });

  it('uses the whole pool when it is smaller than a round', () => {
    expect(buildFindRound(makeItems(7), {}, 0, seededRng(2))).toHaveLength(7);
  });

  it('brings weak items back more often than mastered ones', () => {
    const stats: Record<string, ItemStats> = {};
    pool.forEach((item, i) => {
      stats[item.id] = { box: i < 20 ? 1 : 5, seen: 3, firstTry: 0, lastRound: 9 };
    });
    let weak = 0;
    const rng = seededRng(5);
    for (let r = 0; r < 200; r += 1) {
      for (const q of buildFindRound(pool, stats, 10, rng)) {
        if (Number(q.itemId.split('-')[1]) < 20) weak += 1;
      }
    }
    // 2000 questions; weak items (weight 32 overdue vs 1) should dominate.
    expect(weak).toBeGreaterThan(1600);
  });
});

describe('replay and fixed rounds', () => {
  it('replays exactly the given items', () => {
    const items = makeItems(3);
    expect(
      buildReplayRound(items, seededRng(1))
        .map((q) => q.itemId)
        .sort(),
    ).toEqual(items.map((i) => i.id).sort());
  });
  it('builds a fixed round in the given order and skips unknown ids', () => {
    const round = buildFixedRound(makeItems(5), ['country-3', 'nope', 'country-1']);
    expect(round.map((q) => q.itemId)).toEqual(['country-3', 'country-1']);
  });
});
