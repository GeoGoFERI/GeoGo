import { geoBounds, geoCentroid } from 'd3-geo';
import { feature, neighbors } from 'topojson-client';
import type { Feature, Geometry } from 'geojson';
import type { GeometryObject, Polygon } from 'topojson-specification';
import { countryGeometries, type WorldTopology } from '../map/world';
import { partObjects } from './geometry';
import { PLACES, PLACE_BY_GEO } from './places';
import type { PlaceRow } from './countryTypes';

export type GeoFacts = {
  coastal: boolean;
  neighbours: string[];
};

const EURASIA_BOX = [-35, 25, 180, 82] as const;

const CASPIAN_ONLY: ReadonlySet<string> = new Set(['398', '795', '031']);

type Part = { owner: string; polygon: Polygon };

const explode = (owner: string, objects: readonly GeometryObject[]): Part[] => {
  const parts: Part[] = [];
  for (const g of objects) {
    if (g.type === 'Polygon') parts.push({ owner, polygon: { type: 'Polygon', arcs: g.arcs } });
    if (g.type === 'MultiPolygon') {
      for (const rings of g.arcs) parts.push({ owner, polygon: { type: 'Polygon', arcs: rings } });
    }
  }
  return parts;
};

const inBox = ([lon, lat]: [number, number]): boolean => {
  const [west, south, east, north] = EURASIA_BOX;
  return lon >= west && lon <= east && lat >= south && lat <= north;
};

export const computeGeoFacts = (topology: WorldTopology): Map<string, GeoFacts> => {
  const geometries = countryGeometries(topology);
  const parts: Part[] = PLACES.flatMap((row) => explode(row.geo, partObjects(geometries, row.geo)));

  // Whether a part counts for its owner's facts (see EURASIA_BOX).
  const counts = parts.map((p) => {
    if (!PLACE_BY_GEO.get(p.owner)?.europe) return true;
    return inBox(geoCentroid(feature(topology, p.polygon)) as [number, number]);
  });

  // An arc used by exactly one polygon in the whole map borders the sea.
  const arcUse = new Map<number, number>();
  for (const g of geometries.values()) {
    const rings: number[][] =
      g.type === 'Polygon' ? g.arcs : g.type === 'MultiPolygon' ? g.arcs.flat() : [];
    for (const ring of rings) {
      for (const arc of ring) {
        const index = arc < 0 ? ~arc : arc;
        arcUse.set(index, (arcUse.get(index) ?? 0) + 1);
      }
    }
  }

  const adjacency = neighbors(parts.map((p) => p.polygon));
  const facts = new Map<string, GeoFacts>();
  for (const row of PLACES) facts.set(row.geo, { coastal: false, neighbours: [] });

  parts.forEach((part, i) => {
    if (!counts[i]) return;
    const own = facts.get(part.owner);
    if (!own) return;
    const coastal = part.polygon.arcs.some((ring) =>
      ring.some((arc) => (arcUse.get(arc < 0 ? ~arc : arc) ?? 0) === 1),
    );
    if (coastal && !CASPIAN_ONLY.has(part.owner)) own.coastal = true;
    for (const j of adjacency[i] ?? []) {
      const other = parts[j];
      if (!other || other.owner === part.owner) continue;
      if (PLACE_BY_GEO.get(other.owner)?.status !== 'country') continue;
      if (!own.neighbours.includes(other.owner)) own.neighbours.push(other.owner);
    }
  });
  return facts;
};

export const hemispheresOf = (f: Feature<Geometry>): { north?: boolean; east?: boolean } => {
  const [[west, south], [east, north]] = geoBounds(f);
  const out: { north?: boolean; east?: boolean } = {};
  if (south > 0) out.north = true;
  else if (north < 0) out.north = false;
  // west > east means the box crosses the antimeridian: in both hemispheres.
  if (west <= east) {
    if (west > 0) out.east = true;
    else if (east < 0) out.east = false;
  }
  return out;
};

export const sortByName = (rows: readonly PlaceRow[]): PlaceRow[] => {
  return [...rows].sort((a, b) => a.nameSl.localeCompare(b.nameSl, 'sl'));
};
