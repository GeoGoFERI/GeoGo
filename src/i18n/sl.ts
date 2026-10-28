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
  riddleAsk: 'Katera država je to?',
  partOfEurope: 'Del Evrope',
  readAloud: 'Preberi na glas',
  modeLabel: 'Način igre',
  modes: {
    find: 'Najdi državo',
    fact: 'Uganka',
  },
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
    'peninsula-skandinavski': 'Namig: Skandinavski polotok je na severu Evrope.',
    'peninsula-pirenejski': 'Namig: Pirenejski polotok je na jugozahodu Evrope.',
    'peninsula-apeninski': 'Namig: Apeninski polotok ima obliko škornja.',
    'peninsula-balkanski': 'Namig: Balkanski polotok je na jugovzhodu Evrope.',
    'islands-britansko-otocje': 'Namig: Britansko otočje je na severozahodu Evrope.',
    'island-islandija': 'Namig: Islandija je daleč na severozahodu, sredi Atlantskega oceana.',
    'island-korzika': 'Namig: Korzika je severno od Sardinije.',
    'island-sardinija': 'Namig: Sardinija je južno od Korzike.',
    'island-sicilija': 'Namig: Sicilija je ob konici Apeninskega polotoka.',
    'island-kreta': 'Namig: Kreta je južno od Grčije.',
    'mountain-pireneji': 'Namig: Pireneji so med Francijo in Španijo.',
    'mountain-alpe': 'Namig: Alpe so severno od Apeninskega polotoka.',
    'mountain-apenini': 'Namig: Apenini potekajo po Apeninskem polotoku.',
    'mountain-karpati': 'Namig: Karpati so v loku severno in vzhodno od Panonske nižine.',
    'mountain-dinarsko-gorstvo': 'Namig: Dinarsko gorstvo poteka ob Jadranskem morju.',
    'mountain-skandinavsko-gorstvo': 'Namig: Skandinavsko gorstvo je na Skandinavskem polotoku.',
    'mountain-ural': 'Namig: Ural je na vzhodu Evrope.',
    'mountain-evropska-sredogorja':
      'Namig: Evropska sredogorja so v srednji Evropi, severno od Alp.',
    'lowland-panonska': 'Namig: Panonska nižina je med Alpami, Karpati in Dinarskim gorstvom.',
    'lowland-vzhodnoevropsko': 'Namig: Vzhodnoevropsko nižavje je na vzhodu Evrope.',
    'river-ren': 'Namig: Ren teče proti severu v Severno morje.',
    'river-donava': 'Namig: Donava teče proti vzhodu v Črno morje.',
    'river-volga': 'Namig: Volga je na vzhodu Evrope in teče v Kaspijsko jezero.',
    'sea-sredozemsko': 'Namig: Sredozemsko morje je med Evropo in Afriko.',
    'sea-jadransko': 'Namig: Jadransko morje je med Apeninskim in Balkanskim polotokom.',
    'sea-crno': 'Namig: Črno morje je na jugovzhodu Evrope.',
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
    celine: 'Celine',
    water: 'Morja in oceani',
    land: 'Polotoki, otoki in nižine',
    mountain: 'Gorstva',
    river: 'Reke',
  } as Record<string, string>,

  atlasTitle: 'Moj atlas',
  atlasIntro: 'Kar že znaš, je na zemljevidu zeleno.',
  atlasCount: (level: string, mastered: number, total: number): string =>
    `${level}: ${String(mastered)} od ${String(total)}`,
} as const;
