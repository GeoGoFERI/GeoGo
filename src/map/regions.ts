import { geoBounds, type GeoProjection } from 'd3-geo';
import type { Feature, Geometry } from 'geojson';

import type { Region } from '../core/item';

// Map regions the game zooms to; the ids are defined by the core item model.
export type RegionId = Region;

// Hard-coded lon/lat boxes [west, south, east, north].
export const REGION_BOXES: Record<RegionId, [number, number, number, number]> = {
  world: [-180, -60, 180, 84],
  europe: [-25, 34, 50, 71],
  asia: [25, -11, 150, 78],
  africa: [-20, -36, 52, 38],
  namerica: [-170, 7, -50, 84],
  samerica: [-82, -56, -34, 13],
  oceania: [110, -48, 180, 0],
};

// A zoom transform as d3-zoom understands it: screen = layer * k + (x, y).
export interface ViewTransform {
  k: number;
  x: number;
  y: number;
}

// Pixel bounding box [[x0, y0], [x1, y1]].
export type PixelBox = [[number, number], [number, number]];

// Projects the outline of a lon/lat box and returns its pixel bounding box.
export function projectBox(
  projection: GeoProjection,
  [west, south, east, north]: [number, number, number, number],
): PixelBox {
  const steps = 16;
  let x0 = Infinity;
  let y0 = Infinity;
  let x1 = -Infinity;
  let y1 = -Infinity;
  for (let i = 0; i <= steps; i += 1) {
    const lon = west + ((east - west) * i) / steps;
    const lat = south + ((north - south) * i) / steps;
    const edgePoints: [number, number][] = [
      [lon, south],
      [lon, north],
      [west, lat],
      [east, lat],
    ];
    for (const point of edgePoints) {
      const p = projection(point);
      if (!p) continue;
      x0 = Math.min(x0, p[0]);
      y0 = Math.min(y0, p[1]);
      x1 = Math.max(x1, p[0]);
      y1 = Math.max(y1, p[1]);
    }
  }
  return [
    [x0, y0],
    [x1, y1],
  ];
}

// The transform that fits a pixel box into a viewport of the given size, centred, leaving
// `padding` (fraction of the viewport) free around it.
export function fitTransform(
  box: PixelBox,
  width: number,
  height: number,
  padding = 0.04,
  maxScale = 40,
  crop = 1,
): ViewTransform {
  const [[x0, y0], [x1, y1]] = box;
  const boxW = Math.max(x1 - x0, 1);
  const boxH = Math.max(y1 - y0, 1);
  const usable = 1 - 2 * padding;
  const byWidth = (width * usable) / boxW;
  const byHeight = (height * usable) / boxH;
  const fit = Math.min(Math.max(byWidth, byHeight), Math.min(byWidth, byHeight) * crop);
  const k = Math.min(Math.max(fit, 1), maxScale);
  const cx = (x0 + x1) / 2;
  const cy = (y0 + y1) / 2;
  return { k, x: width / 2 - cx * k, y: height / 2 - cy * k };
}

// A lon/lat box around a feature, grown to at least `minSpan` degrees in each direction so that
// zooming to it also shows the neighbourhood.
export function contextBox(
  feature: Feature<Geometry>,
  minSpan: number,
): [number, number, number, number] {
  const [[west, south], [east, north]] = geoBounds(feature);
  // A box crossing the antimeridian is unwrapped so east > west.
  const eastUnwrapped = east >= west ? east : east + 360;
  const cx = (west + eastUnwrapped) / 2;
  const cy = (south + north) / 2;
  const halfLon = Math.max((eastUnwrapped - west) / 2, minSpan / 2);
  const halfLat = Math.max((north - south) / 2, minSpan / 4);
  return [cx - halfLon, Math.max(cy - halfLat, -89), cx + halfLon, Math.min(cy + halfLat, 89)];
}
