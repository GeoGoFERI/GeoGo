import type { Headline } from '../core/summary';

// Every string a pupil sees. Slovenian, informal "ti", correct diacritics.

// "To je X" or "To so X" for plural names
const isAre = (plural: boolean): string => (plural ? 'To so' : 'To je');

export const sl = {
  appName: 'GeoGo',
  start: 'Začni',
  next: 'Naprej',
  help: 'Pomoč',
  again: 'Še enkrat',
  replayWeak: 'Ponovi težje',
  atlas: 'Moj atlas',
  back: 'Nazaj',
  home: 'Domov',
  logoHome: 'GeoGo: na začetek',
  loading: 'Nalagam zemljevid …',
  loadFailed: 'Zemljevida ni bilo mogoče naložiti. Poskusi znova.',
  chooseLevel: 'Izberi stopnjo',
  soon: 'Kmalu',

  levels: {
    1: 'Celine in oceani',
    2: 'Orientacija',
    3: 'Države Evrope',
    4: 'Narava Evrope',
    5: 'Celine sveta',
  },
  // progress on a level card, e.g
  levelProgress: (mastered: number, total: number): string =>
    `${String(mastered)} od ${String(total)} znaš`,

  mapLabels: {
    map: 'Zemljevid',
    zoomIn: 'Povečaj',
    zoomOut: 'Pomanjšaj',
    reset: 'Pokaži ves zemljevid',
  },
  mapShape: 'Območje na zemljevidu',

  find: 'Najdi:',
  questionOf: (n: number, total: number): string => `Vprašanje ${String(n)} od ${String(total)}`,
  wrong: (name: string, plural: boolean): string => `${isAre(plural)} ${name}. Poskusi znova!`,
  correct: ['Odlično!', 'Bravo!', 'Tako je!'] as const,
  hintZoom: 'Poglej ta del zemljevida.',
  hintNeighbour: (name: string): string => `Sosednja država: ${name}`,
  hintGroup: (group: string): string => `Leži v tem delu Evrope: ${group}`,
  hintFlash: 'Tukaj je! Klikni utripajoče območje.',
  flagOf: (name: string): string => `Zastava: ${name}`,
  hemisphereAsk: (plural: boolean): string => `V kateri polobli ${plural ? 'ležijo' : 'leži'}`,
  hemisphereDetail: {
    ns: 'Severna ali južna?',
    ew: 'Vzhodna ali zahodna?',
  },
  country: 'Država',
  hintLines: 'Namig: ekvator poteka vodoravno, poldnevnik pa navpično.',
  hintNorthSouth: 'Namig: ekvator loči severno in južno poloblo.',
  hintEastWest: 'Namig: začetni poldnevnik loči vzhodno in zahodno poloblo.',
  hintPoles: 'Namig: severni pol je na vrhu zemljevida, južni pol pa na dnu.',
  // tier 2 hints for items that are not countries: where they lie
  itemHints: {
    'continent-evropa': 'Namig: Evropa leži severno od Afrike.',
    'continent-azija': 'Namig: Azija leži vzhodno od Evrope.',
    'continent-afrika': 'Namig: Afrika leži južno od Evrope.',
    'continent-severna-amerika':
      'Namig: Severna Amerika leži zahodno od Evrope, onkraj Atlantskega oceana.',
    'continent-juzna-amerika': 'Namig: Južna Amerika leži južno od Severne Amerike.',
    'continent-avstralija': 'Namig: Avstralija leži jugovzhodno od Azije.',
    'continent-antarktika': 'Namig: Antarktika je čisto na jugu, okoli južnega pola.',
    'ocean-atlantski':
      'Namig: Atlantski ocean leži med Evropo in Afriko na eni strani ter Amerikama na drugi.',
    'ocean-tihi':
      'Namig: Tihi ocean leži med Azijo in Avstralijo na eni strani ter Amerikama na drugi.',
    'ocean-indijski': 'Namig: Indijski ocean leži južno od Azije, med Afriko in Avstralijo.',
    'ocean-arkticni': 'Namig: Arktični ocean je čisto na severu, okoli severnega pola.',
    'ocean-juzni': 'Namig: Južni ocean obdaja Antarktiko.',
  } as Record<string, string>,

  coastal: 'Obmorska država',
  landlocked: 'Celinska država',
  neighbours: 'Sosednje države',
  noNeighbours: 'Sosednje države: nobena (otoška država)',

  summaryTitle: 'Konec kroga',
  starsOf: (stars: number, max: number): string => `${String(stars)} od ${String(max)} zvezdic`,
  practice: (groups: string): string => `Še malo vaje: ${groups}`,
  headlines: {
    1: {
      excellent: 'Celine in oceane že odlično poznaš!',
      good: 'Celine in oceane že dobro poznaš.',
      practice: 'Lepo ti gre. Z vajo bo še bolje!',
    },
    2: {
      excellent: 'Na zemljevidu se odlično znajdeš!',
      good: 'Na zemljevidu se že dobro znajdeš.',
      practice: 'Lepo ti gre. Z vajo bo še bolje!',
    },
    3: {
      excellent: 'Države Evrope že odlično poznaš!',
      good: 'Evropo že dobro poznaš.',
      practice: 'Lepo ti gre. Z vajo bo še bolje!',
    },
    4: {
      excellent: 'Naravo Evrope že odlično poznaš!',
      good: 'Naravo Evrope že dobro poznaš.',
      practice: 'Lepo ti gre. Z vajo bo še bolje!',
    },
    5: {
      excellent: 'Celine sveta že odlično poznaš!',
      good: 'Celine sveta že dobro poznaš.',
      practice: 'Lepo ti gre. Z vajo bo še bolje!',
    },
  } satisfies Record<1 | 2 | 3 | 4 | 5, Record<Headline, string>>,
  groups: {
    zahodna: 'Zahodna Evropa',
    srednja: 'Srednja Evropa',
    severna: 'Severna Evropa',
    juzna: 'Južna Evropa',
    balkan: 'Balkan',
    vzhodna: 'Vzhodna Evropa',
  } as Record<string, string>,

  atlasTitle: 'Moj atlas',
  atlasIntro: 'Kar že znaš, je na zemljevidu zeleno.',
  atlasCount: (level: string, mastered: number, total: number): string =>
    `${level}: ${String(mastered)} od ${String(total)}`,
} as const;
