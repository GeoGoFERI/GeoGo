import type { PlaceRow } from './countryTypes';
import { EUROPE_ROWS } from './countriesEurope';
import { WORLD_ROWS } from './countriesWorld';

export const PLACES: readonly PlaceRow[] = [...EUROPE_ROWS, ...WORLD_ROWS];

export const placeId = (row: PlaceRow): string => {
  return `country-${row.a2.toLowerCase()}`;
};

export const PLACE_BY_ID: ReadonlyMap<string, PlaceRow> = new Map(
  PLACES.map((r) => [placeId(r), r]),
);
export const PLACE_BY_GEO: ReadonlyMap<string, PlaceRow> = new Map(PLACES.map((r) => [r.geo, r]));
