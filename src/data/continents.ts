import { geoCentroid } from 'd3-geo';
import { merge, mesh } from 'topojson-client';
import type {
  Feature,
  Geometry,
  MultiLineString,
  MultiPolygon,
  Polygon as GeoPolygon,
} from 'geojson';
import type { GeometryObject, Polygon } from 'topojson-specification';
import { countryGeometries, objectFeature, type WorldTopology } from '../map/world';
import { clipLinesAtMeridian, clipRingAtMeridian, type Position } from './clip';
import { partsOf } from './geometry';
import { PLACES } from './places';
import {
  partContinent,
  SPLIT_COUNTRIES,
  CONTINENT_BY_A2,
  type ContinentId,
} from './continentTable';

// the Ural as a straight meridian: the conventional Europe-Asia border, kept simple
const URAL_LON = 60;

export interface ContinentGeometry {
  continents: Map<ContinentId, Feature<Geometry>>;
  // coastlines plus borders between continents, drawn on top as one outline layer
  outline: Feature<MultiLineString>;
}

interface Part {
  a2: string;
  polygon: Polygon;
}

const explode = (a2: string, objects: readonly GeometryObject[]): Part[] => {
  const parts: Part[] = [];
  for (const g of objects) {
    if (g.type === 'Polygon') parts.push({ a2, polygon: { type: 'Polygon', arcs: g.arcs } });
    if (g.type === 'MultiPolygon')
      for (const arcs of g.arcs) parts.push({ a2, polygon: { type: 'Polygon', arcs } });
  }
  return parts;
};

// continents merged from countries with topojson `merge`, so inner borders disappear
export const buildContinents = (topology: WorldTopology): ContinentGeometry => {
  const geometries = countryGeometries(topology);
  const byContinent = new Map<ContinentId, Polygon[]>();
  const extra = new Map<ContinentId, Position[][][]>();
  const uralCrossings: number[] = [];
  let russiaMain: { polygon: Polygon; area: number } | undefined;

  for (const row of PLACES) {
    for (const part of explode(
      row.a2,
      partsOf(row.geo).flatMap((k) => geometries.get(k) ?? []),
    )) {
      const f = objectFeature(topology, part.polygon);
      const centroid = geoCentroid(f) as [number, number];
      if (row.a2 === 'RU') {
        // The largest Russian part is the main body; it is cut, not assigned whole.
        const ring = (f.geometry as GeoPolygon).coordinates[0] ?? [];
        if (!russiaMain || ring.length > russiaMain.area)
          russiaMain = { polygon: part.polygon, area: ring.length };
      }
      const continent = partContinent(row.a2, centroid);
      if (!continent) continue;
      byContinent.set(continent, [...(byContinent.get(continent) ?? []), part.polygon]);
    }
  }

  if (russiaMain) {
    // Take the main body back out of Asia and add its two halves instead.
    const main = russiaMain.polygon;
    byContinent.set(
      'continent-azija',
      (byContinent.get('continent-azija') ?? []).filter((p) => p !== main),
    );
    // Chukotka lies past the antimeridian at negative longitudes; unwrap them to 180-200 so the
    // planar cut at 60 degrees east sees one continuous ring. They are wrapped back below.
    const original = (objectFeature(topology, main).geometry as GeoPolygon)
      .coordinates as Position[][];
    const rings = original.map((ring) =>
      ring.map(([lon, lat]): Position => [lon < 0 ? lon + 360 : lon, lat]),
    );
    for (const [continent, keepWest] of [
      ['continent-evropa', true],
      ['continent-azija', false],
    ] as const) {
      const clipped = rings.map((ring) => clipRingAtMeridian(ring, URAL_LON, keepWest));
      if (keepWest) for (const c of clipped) uralCrossings.push(...c.crossings);
      // Wrap back to [-180, 180]: d3's antimeridian clipping expects that range.
      const polygon = clipped
        .map((c) => c.ring.map(([lon, lat]): Position => [lon > 180 ? lon - 360 : lon, lat]))
        .filter((r) => r.length > 0);
      if (polygon.length > 0) extra.set(continent, [...(extra.get(continent) ?? []), polygon]);
    }
  }

  const continents = new Map<ContinentId, Feature<Geometry>>();
  for (const [continent, polygons] of byContinent) {
    const merged = merge(topology, polygons) as MultiPolygon;
    const coordinates = [...merged.coordinates, ...(extra.get(continent) ?? [])];
    continents.set(continent, {
      type: 'Feature',
      properties: {},
      geometry: { type: 'MultiPolygon', coordinates },
    });
  }

  return { continents, outline: buildOutline(topology, uralCrossings) };
};

function buildOutline(
  topology: WorldTopology,
  uralCrossings: readonly number[],
): Feature<MultiLineString> {
  const countries = topology.objects.countries;
  const a2Of = new Map<GeometryObject, string>();
  const geometries = countryGeometries(topology);
  for (const row of PLACES)
    for (const key of partsOf(row.geo)) {
      const g = geometries.get(key);
      if (g) a2Of.set(g, row.a2);
    }
  const continentOf = (g: GeometryObject): ContinentId | undefined => {
    const a2 = a2Of.get(g);
    return a2 ? CONTINENT_BY_A2.get(a2) : undefined;
  };

  // Coastlines: arcs used by one country only.
  const coast = mesh(topology, countries, (a, b) => a === b).coordinates as Position[][];
  // Borders between countries of different continents (Egypt-Israel, Panama-Colombia ...),
  // skipping split countries, whose borders are handled below.
  const between = mesh(topology, countries, (a, b) => {
    const ca = continentOf(a);
    const cb = continentOf(b);
    const split = SPLIT_COUNTRIES.has(a2Of.get(a) ?? '') || SPLIT_COUNTRIES.has(a2Of.get(b) ?? '');
    return a !== b && !split && ca !== undefined && cb !== undefined && ca !== cb;
  }).coordinates as Position[][];
  // European Russia's borders with Kazakhstan, Georgia and Azerbaijan, west of the Ural.
  const caucasus = mesh(topology, countries, (a, b) => {
    const pair = [a2Of.get(a), a2Of.get(b)];
    return (
      pair.includes('RU') && (pair.includes('KZ') || pair.includes('GE') || pair.includes('AZ'))
    );
  }).coordinates as Position[][];
  const lines = [...coast, ...between, ...clipLinesAtMeridian(caucasus, URAL_LON, true)];
  if (uralCrossings.length >= 2) {
    lines.push([
      [URAL_LON, Math.min(...uralCrossings)],
      [URAL_LON, Math.max(...uralCrossings)],
    ]);
  }
  return {
    type: 'Feature',
    properties: {},
    geometry: { type: 'MultiLineString', coordinates: lines },
  };
}
