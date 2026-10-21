import { geoNaturalEarth1, type GeoProjection } from 'd3-geo';

// Margin in pixels between the sphere outline and the container edge.
const MARGIN = 6;

// A Natural Earth projection that fits the whole sphere into a box of the given size.
export function createProjection(width: number, height: number): GeoProjection {
  return geoNaturalEarth1().fitExtent(
    [
      [MARGIN, MARGIN],
      [Math.max(width - MARGIN, MARGIN + 1), Math.max(height - MARGIN, MARGIN + 1)],
    ],
    { type: 'Sphere' },
  );
}
