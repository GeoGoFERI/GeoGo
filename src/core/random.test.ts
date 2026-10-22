import { describe, expect, it } from 'vitest';
import { seededRng, shuffle, weightedSample } from './random';

describe('seededRng', () => {
  it('is deterministic for a seed and stays in [0, 1)', () => {
    const a = seededRng(42);
    const b = seededRng(42);
    for (let i = 0; i < 100; i += 1) {
      const x = a();
      expect(x).toBe(b());
      expect(x).toBeGreaterThanOrEqual(0);
      expect(x).toBeLessThan(1);
    }
  });
});

describe('weightedSample', () => {
  it('returns distinct entries and skips zero weights', () => {
    const out = weightedSample([1, 2, 3, 4, 5], (n) => (n === 3 ? 0 : 1), 10, seededRng(1));
    expect(out).toHaveLength(4);
    expect(new Set(out).size).toBe(4);
    expect(out).not.toContain(3);
  });
  it('prefers heavier entries', () => {
    const rng = seededRng(7);
    let heavy = 0;
    for (let i = 0; i < 1000; i += 1) {
      const [first] = weightedSample(['light', 'heavy'], (e) => (e === 'heavy' ? 9 : 1), 1, rng);
      if (first === 'heavy') heavy += 1;
    }
    expect(heavy).toBeGreaterThan(850);
    expect(heavy).toBeLessThan(950);
  });
});

describe('shuffle', () => {
  it('keeps all entries', () => {
    expect(shuffle([1, 2, 3, 4], seededRng(3)).sort()).toEqual([1, 2, 3, 4]);
  });
});
