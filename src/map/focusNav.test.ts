import { describe, expect, it } from 'vitest';
import { nearestAnchor, nextInDirection } from './focusNav';

const anchors = new Map<string, [number, number]>([
  ['centre', [0, 0]],
  ['east', [10, 1]],
  ['far-east', [30, 0]],
  ['north-east', [6, -8]],
  ['south', [0, 10]],
]);

describe('nextInDirection', () => {
  it('moves to the nearest shape roughly in the pressed direction', () => {
    expect(nextInDirection(anchors, 'centre', 'right')).toBe('east');
    expect(nextInDirection(anchors, 'centre', 'down')).toBe('south');
    expect(nextInDirection(anchors, 'centre', 'up')).toBe('north-east');
  });
  it('returns undefined at the edge', () => {
    expect(nextInDirection(anchors, 'centre', 'left')).toBeUndefined();
  });
});

describe('nearestAnchor', () => {
  it('finds the closest anchor', () => {
    expect(nearestAnchor(anchors, [28, 2])).toBe('far-east');
  });
});
