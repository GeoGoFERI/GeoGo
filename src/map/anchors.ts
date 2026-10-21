import { geoArea, type GeoPath } from 'd3-geo';
import type { Feature, Geometry, Polygon } from 'geojson';

// The main polygon of a feature: the largest part of a MultiPolygon.
export function mainPart(feature: Feature<Geometry>): Feature<Geometry> {
  const g = feature.geometry;
  if (g.type !== 'MultiPolygon') return feature;
  let best: Polygon | undefined;
  let bestArea = -1;
  for (const coordinates of g.coordinates) {
    const polygon: Polygon = { type: 'Polygon', coordinates };
    const area = geoArea(polygon);
    if (area > bestArea) {
      bestArea = area;
      best = polygon;
    }
  }
  return best ? { ...feature, geometry: best } : feature;
}

// Pixel anchor (centroid of the main part) for a feature under the given path generator.
export function anchorOf(path: GeoPath, feature: Feature<Geometry>): [number, number] {
  const [x, y] = path.centroid(mainPart(feature));
  return [x, y];
}
