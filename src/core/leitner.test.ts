import { describe, expect, it } from 'vitest';
import { isMastered, itemWeight, updateStats } from './leitner';

describe('updateStats', () => {
  it('moves up on 3 stars, stays on 2, drops to box 1 on 1', () => {
    const first = updateStats(undefined, 3, 1);
    expect(first).toEqual({ box: 2, seen: 1, firstTry: 1, lastRound: 1 });
    expect(updateStats(first, 2, 2).box).toBe(2);
    expect(updateStats(first, 1, 2).box).toBe(1);
  });
  it('caps at box 5', () => {
    let s = updateStats(undefined, 3, 0);
    for (let r = 1; r < 10; r += 1) s = updateStats(s, 3, r);
    expect(s.box).toBe(5);
  });
  it('counts as mastered from box 3: two first-try answers in a row', () => {
    const once = updateStats(undefined, 3, 1);
    expect(isMastered(once)).toBe(false);
    expect(isMastered(updateStats(once, 3, 2))).toBe(true);
  });
});

describe('itemWeight', () => {
  it('weighs weak items above unseen above mastered ones', () => {
    const weak = { box: 1 as const, seen: 3, firstTry: 0, lastRound: 5 };
    const known = { box: 5 as const, seen: 9, firstTry: 9, lastRound: 5 };
    expect(itemWeight(weak, 5)).toBeGreaterThan(itemWeight(undefined, 5));
    expect(itemWeight(undefined, 5)).toBeGreaterThan(itemWeight(known, 5));
  });
  it('doubles the weight of overdue items', () => {
    const s = { box: 3 as const, seen: 2, firstTry: 2, lastRound: 0 };
    expect(itemWeight(s, 4)).toBe(2 * itemWeight(s, 1));
  });
});
