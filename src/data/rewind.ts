import { geoArea } from 'd3-geo';
import type { MultiPolygon } from 'geojson';

export function rewound(geometry: MultiPolygon): MultiPolygon {
  return {
    type: 'MultiPolygon',
    coordinates: geometry.coordinates.map((polygon) =>
      geoArea({ type: 'Polygon', coordinates: polygon }) > 2 * Math.PI
        ? polygon.map((ring) => [...ring].reverse())
        : polygon,
    ),
  };
}
