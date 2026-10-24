import { merge } from 'topojson-client';
import type { Feature, Geometry } from 'geojson';
import type { GeometryObject, Polygon, MultiPolygon } from 'topojson-specification';
import { countryGeometries, objectFeature, type WorldTopology } from '../map/world';
import { CONTEXT_GEOS, GEO_MERGES } from './countriesWorld';
import { PLACES } from './places';

export const partsOf = (geo: string): string[] => {
  return [geo, ...(GEO_MERGES[geo] ?? [])];
};

export const partObjects = (
  geometries: ReadonlyMap<string, GeometryObject>,
  geo: string,
): GeometryObject[] => {
  return partsOf(geo).flatMap((key) => {
    const g = geometries.get(key);
    return g ? [g] : [];
  });
};

const isPolygonal = (g: GeometryObject): g is Polygon | MultiPolygon =>
  g.type === 'Polygon' || g.type === 'MultiPolygon';

export const placeFeatures = (topology: WorldTopology): Map<string, Feature<Geometry>> => {
  const geometries = countryGeometries(topology);
  const out = new Map<string, Feature<Geometry>>();
  for (const row of PLACES) {
    const parts = partObjects(geometries, row.geo);
    const first = parts[0];
    if (!first) continue;
    if (parts.length === 1) {
      out.set(row.geo, objectFeature(topology, first));
    } else {
      const polygons = parts.filter(isPolygonal);
      out.set(row.geo, { type: 'Feature', properties: {}, geometry: merge(topology, polygons) });
    }
  }
  for (const key of CONTEXT_GEOS) {
    const g = geometries.get(key);
    if (g) out.set(key, objectFeature(topology, g));
  }
  return out;
};
