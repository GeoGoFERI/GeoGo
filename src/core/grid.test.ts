import { describe, expect, it } from 'vitest';
import { buildGridRound, gridPoints, parsePointId, pointId } from './grid';
import { seededRng } from './random';

describe('grid', () => {
  it('has 5 rows and 12 columns at 30 degrees', () => {
    const points = gridPoints();
    expect(points).toHaveLength(60);
    expect(points).toContainEqual({ lat: 0, lon: 0 });
    expect(points).toContainEqual({ lat: -60, lon: 180 });
  });

  it('round-trips point ids', () => {
    expect(parsePointId(pointId({ lat: -30, lon: 120 }))).toEqual({ lat: -30, lon: 120 });
    expect(parsePointId('country-si')).toBeUndefined();
  });

  it('builds a round of distinct points', () => {
    const round = buildGridRound(seededRng(1));
    expect(round).toHaveLength(10);
    expect(new Set(round.map((q) => q.itemId)).size).toBe(10);
    expect(round.every((q) => q.mode === 'coords')).toBe(true);
  });
});
