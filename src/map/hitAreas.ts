import { geoBounds, type GeoPath } from 'd3-geo';
import type { Feature, Geometry } from 'geojson';
import { anchorOf } from './anchors';
import type { MapShape } from './types';

// Radius of the invisible tap target, in screen pixels.
export const HIT_RADIUS_PX = 22;
// Within this many screen pixels of its centre a tiny place always wins over a neighbour.
export const INNER_RADIUS_PX = 12;
// Radius of the visible dot that marks a tiny place, in screen pixels.
export const DOT_RADIUS_PX = 6;
// Shapes smaller than this many degrees across count as tiny (microstates, small islands).
const TINY_DEGREES = 1.5;

export interface HitTarget {
  id: string;
  center: [number, number];
  // Largest side of the shape's pixel bounding box at zoom 1 (0 for points).
  sizePx: number;
}

// Degrees across a feature's lon/lat bounding box.
function spanDegrees(feature: Feature<Geometry>): number {
  const [[west, south], [east, north]] = geoBounds(feature);
  // A box crossing the antimeridian has west > east; such shapes are never tiny anyway.
  const lonSpan = east >= west ? east - west : 360 - (west - east);
  return Math.max(lonSpan, north - south);
}

// Tiny interactive shapes and points get a circular tap target at their anchor.
export function hitTargets(shapes: readonly MapShape[], path: GeoPath): HitTarget[] {
  const targets: HitTarget[] = [];
  for (const shape of shapes) {
    if (!shape.interactive) continue;
    if (shape.kind === 'point') {
      targets.push({ id: shape.id, center: anchorOf(path, shape.feature), sizePx: 0 });
    } else if (shape.kind === 'area' && spanDegrees(shape.feature) < TINY_DEGREES) {
      const [[x0, y0], [x1, y1]] = path.bounds(shape.feature);
      targets.push({
        id: shape.id,
        center: anchorOf(path, shape.feature),
        sizePx: Math.max(x1 - x0, y1 - y0),
      });
    }
  }
  // Smallest last, so it is drawn on top and wins when targets overlap.
  return targets.sort((a, b) => b.sizePx - a.sizePx);
}

// Screen-constant sizes at zoom k.
export function hitSizes(
  sizePx: number,
  k: number,
): { hitRadius: number; dotRadius: number; showHit: boolean; showDot: boolean } {
  const screenSize = sizePx * k;
  return {
    hitRadius: HIT_RADIUS_PX / k,
    dotRadius: DOT_RADIUS_PX / k,
    showHit: screenSize < HIT_RADIUS_PX * 2,
    showDot: screenSize < DOT_RADIUS_PX * 3,
  };
}
