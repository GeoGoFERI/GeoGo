import { describe, expect, it } from 'vitest';
import { clipLinesAtMeridian, clipRingAtMeridian, type Position } from './clip';

const square: Position[] = [
  [50, 50],
  [50, 60],
  [70, 60],
  [70, 50],
  [50, 50],
];

describe('clipRingAtMeridian', () => {
  it('cuts a square at 60 degrees east into its west half', () => {
    const { ring, crossings } = clipRingAtMeridian(square, 60, true);
    expect(Math.max(...ring.map((p) => p[0]))).toBe(60);
    expect(ring[0]).toEqual(ring[ring.length - 1]);
    expect(crossings.sort()).toEqual([50, 60]);
  });
  it('returns nothing when the ring lies wholly on the other side', () => {
    expect(clipRingAtMeridian(square, 40, true).ring).toEqual([]);
  });
});

describe('clipLinesAtMeridian', () => {
  it('keeps the west part of a line', () => {
    const lines = clipLinesAtMeridian(
      [
        [
          [50, 0],
          [55, 0],
          [65, 0],
        ],
      ],
      60,
      true,
    );
    expect(lines).toEqual([
      [
        [50, 0],
        [55, 0],
      ],
    ]);
  });
});
