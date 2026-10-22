import { describe, expect, it } from 'vitest';
import { geoPath } from 'd3-geo';
import { createProjection } from './projection';
import { HIT_RADIUS_PX, hitSizes, hitTargets } from './hitAreas';
import type { MapShape } from './types';

const square = (id: string, lon: number, lat: number, size: number): MapShape => ({
  id,
  kind: 'area',
  interactive: true,
  feature: {
    type: 'Feature',
    properties: {},
    geometry: {
      type: 'Polygon',
      coordinates: [
        [
          [lon, lat],
          [lon, lat + size],
          [lon + size, lat + size],
          [lon + size, lat],
          [lon, lat],
        ],
      ],
    },
  },
});

describe('hitTargets', () => {
  const path = geoPath(createProjection(1000, 520));

  it('adds targets for tiny shapes and points only', () => {
    const shapes: MapShape[] = [
      square('big', 10, 45, 5),
      square('tiny', 12, 43, 0.2),
      {
        id: 'dot',
        kind: 'point',
        interactive: true,
        feature: {
          type: 'Feature',
          properties: {},
          geometry: { type: 'Point', coordinates: [14, 36] },
        },
      },
    ];
    const ids = hitTargets(shapes, path).map((t) => t.id);
    expect(ids).toContain('tiny');
    expect(ids).toContain('dot');
    expect(ids).not.toContain('big');
    // Points (size 0) are last, so they are on top.
    expect(ids[ids.length - 1]).toBe('dot');
  });
});

describe('hitSizes', () => {
  it('keeps the tap radius constant on screen', () => {
    expect(hitSizes(1, 1).hitRadius).toBe(HIT_RADIUS_PX);
    expect(hitSizes(1, 4).hitRadius * 4).toBe(HIT_RADIUS_PX);
  });
  it('drops the circle when the shape is big enough on screen', () => {
    expect(hitSizes(2, 1).showHit).toBe(true);
    expect(hitSizes(2, 30).showHit).toBe(false);
  });
});
