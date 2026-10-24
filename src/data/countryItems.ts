import type { Item } from '../core/item';
import { EUROPE_ROWS } from './countriesEurope';
import { placeId } from './places';
import type { GeoFacts } from './geoFacts';

const CURRICULUM = 'Evropa > Evropa na zemljevidu';

export const europeCountryItems = (facts: ReadonlyMap<string, GeoFacts>): Item[] => {
  return EUROPE_ROWS.map((row) => ({
    id: placeId(row),
    levels: [3],
    kind: 'country',
    nameSl: row.nameSl,
    ...(row.plural ? { plural: true } : {}),
    geo: row.geo,
    region: 'europe',
    flag: row.a2,
    coastal: facts.get(row.geo)?.coastal ?? false,
    ...(row.europe ? { group: row.europe } : {}),
    curriculum: CURRICULUM,
  }));
};
