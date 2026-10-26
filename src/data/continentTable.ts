// continent item ids for Level 1
export type ContinentId =
  | 'continent-evropa'
  | 'continent-azija'
  | 'continent-afrika'
  | 'continent-severna-amerika'
  | 'continent-juzna-amerika'
  | 'continent-avstralija'
  | 'continent-antarktika';

const list = (codes: string): string[] => codes.split(' ');

// our own country-to-continent table (alpha-2 codes), used to merge country shapes into
// continents
const TABLE: Record<ContinentId, string[]> = {
  'continent-evropa': list(
    'AL AD AT BE BA BG BY HR CY CZ DK EE FI FR DE GR VA HU IS IE IT LV LI LT LU MT MC MD ME NL NO PL PT RO SM RS SK SI ES SE CH UA MK GB XK FO GG JE IM',
  ),
  'continent-azija': list(
    'AF AZ AM BH BD BT BN KH CN TW GE HK MO IN ID IR IQ IL JP JO KZ KP KR KW KG LA LB MY MV MN MM NP OM PK PS PH QA SA SG LK SY TJ TH TL TM AE UZ VN YE RU TR',
  ),
  'continent-afrika': list(
    'DZ AO BJ BW BF BI CV CM CF TD KM CG CD CI DJ EG GQ ER SZ ET GA GM GH GN GW KE LS LR LY MG MW ML MR MU MA MZ NA NE NG RW ST SN SC SL SO ZA SS SD TZ TG TN UG EH ZM ZW',
  ),
  'continent-severna-amerika': list(
    'AG BS BB BZ CA CR CU DM DO SV GD GT HT HN JM MX NI PA KN LC VC TT US AI AW BM VG KY CW GL MS PR BL MF PM SX TC VI',
  ),
  'continent-juzna-amerika': list('AR BO BR CL CO EC GY PY PE SR UY VE FK'),
  'continent-avstralija': list('AU FJ KI MH FM NR NZ PW PG WS SB TO VU AS CK PF GU NC NU NF MP WF'),
  'continent-antarktika': list('AQ'),
};

export const CONTINENT_BY_A2: ReadonlyMap<string, ContinentId> = new Map(
  Object.entries(TABLE).flatMap(([continent, codes]) =>
    codes.map((code) => [code, continent as ContinentId] as const),
  ),
);

// parts of a country that lie on another continent, decided by the part's centroid
export const partContinent = (
  a2: string,
  [lon, lat]: [number, number],
): ContinentId | undefined => {
  switch (a2) {
    case 'RU':
      // Kaliningrad, Novaya Zemlya and Franz Josef Land are in Europe.
      return lon > 0 && lon < 60 ? 'continent-evropa' : 'continent-azija';
    case 'TR':
      // East Thrace, west of the Bosphorus.
      return lon < 29.3 && lat > 40.3 ? 'continent-evropa' : 'continent-azija';
    case 'FR':
      if (lon < -30) return 'continent-juzna-amerika';
      if (lon > 40) return 'continent-afrika';
      return 'continent-evropa';
    case 'ES':
      // Canary Islands, Ceuta and Melilla.
      return lat < 36 ? 'continent-afrika' : 'continent-evropa';
    case 'US':
      return lon < -150 && lat < 30 ? 'continent-avstralija' : 'continent-severna-amerika';
    case 'ID':
      // Western New Guinea.
      return lon > 134 ? 'continent-avstralija' : 'continent-azija';
    case 'CL':
      return lon < -100 ? 'continent-avstralija' : 'continent-juzna-amerika';
    default:
      return CONTINENT_BY_A2.get(a2);
  }
};

// countries split by part; their borders are not continent borders by default
export const SPLIT_COUNTRIES: ReadonlySet<string> = new Set([
  'RU',
  'TR',
  'FR',
  'ES',
  'US',
  'ID',
  'CL',
]);
