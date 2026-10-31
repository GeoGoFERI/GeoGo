import { geoArea, geoContains } from 'd3-geo';
import type { Feature, Geometry, MultiLineString, MultiPolygon, Polygon } from 'geojson';
import type { Item } from '../core/item';
import type { MapShape } from '../map/types';
import { HAND_DRAWN } from './custom/europeNature';
import { rewound } from './rewind';

// Level 4 geometry built by scripts/build-europe-nature.mjs from Natural Earth
export type NatureData = Readonly<Record<string, MultiPolygon | MultiLineString>>;

// families shown together: a question offers only its own family as clickable
export type NatureGroup = 'land' | 'mountain' | 'river' | 'water';

const CURRICULUM = 'Evropa > Naravnogeografske enote Evrope';

interface Row {
  id: string;
  nameSl: string;
  kind: Item['kind'];
  group: NatureGroup;
}

// the curriculum's minimum-standard list for Europe, names as written there
const ROWS: readonly Row[] = [
  {
    id: 'peninsula-skandinavski',
    nameSl: 'Skandinavski polotok',
    kind: 'peninsula',
    group: 'land',
  },
  { id: 'peninsula-pirenejski', nameSl: 'Pirenejski polotok', kind: 'peninsula', group: 'land' },
  { id: 'peninsula-apeninski', nameSl: 'Apeninski polotok', kind: 'peninsula', group: 'land' },
  { id: 'peninsula-balkanski', nameSl: 'Balkanski polotok', kind: 'peninsula', group: 'land' },
  { id: 'islands-britansko-otocje', nameSl: 'Britansko otočje', kind: 'island', group: 'land' },
  { id: 'island-islandija', nameSl: 'Islandija', kind: 'island', group: 'land' },
  { id: 'island-korzika', nameSl: 'Korzika', kind: 'island', group: 'land' },
  { id: 'island-sardinija', nameSl: 'Sardinija', kind: 'island', group: 'land' },
  { id: 'island-sicilija', nameSl: 'Sicilija', kind: 'island', group: 'land' },
  { id: 'island-kreta', nameSl: 'Kreta', kind: 'island', group: 'land' },
  { id: 'mountain-pireneji', nameSl: 'Pireneji', kind: 'mountain', group: 'mountain' },
  { id: 'mountain-alpe', nameSl: 'Alpe', kind: 'mountain', group: 'mountain' },
  { id: 'mountain-apenini', nameSl: 'Apenini', kind: 'mountain', group: 'mountain' },
  { id: 'mountain-karpati', nameSl: 'Karpati', kind: 'mountain', group: 'mountain' },
  {
    id: 'mountain-dinarsko-gorstvo',
    nameSl: 'Dinarsko gorstvo',
    kind: 'mountain',
    group: 'mountain',
  },
  {
    id: 'mountain-skandinavsko-gorstvo',
    nameSl: 'Skandinavsko gorstvo',
    kind: 'mountain',
    group: 'mountain',
  },
  { id: 'mountain-ural', nameSl: 'Ural', kind: 'mountain', group: 'mountain' },
  {
    id: 'mountain-evropska-sredogorja',
    nameSl: 'Evropska sredogorja',
    kind: 'mountain',
    group: 'mountain',
  },
  { id: 'lowland-panonska', nameSl: 'Panonska nižina', kind: 'lowland', group: 'land' },
  {
    id: 'lowland-vzhodnoevropsko',
    nameSl: 'Vzhodnoevropsko nižavje',
    kind: 'lowland',
    group: 'land',
  },
  { id: 'river-ren', nameSl: 'Ren', kind: 'river', group: 'river' },
  { id: 'river-donava', nameSl: 'Donava', kind: 'river', group: 'river' },
  { id: 'river-volga', nameSl: 'Volga', kind: 'river', group: 'river' },
  { id: 'sea-sredozemsko', nameSl: 'Sredozemsko morje', kind: 'sea', group: 'water' },
  { id: 'sea-jadransko', nameSl: 'Jadransko morje', kind: 'sea', group: 'water' },
  { id: 'sea-crno', nameSl: 'Črno morje', kind: 'sea', group: 'water' },
  // Atlantski and Arktični ocean are Level 1 items that also sit in Level 4.
];

// ocean items shared with Level 1; they join the water family here
const SHARED_OCEANS = ['ocean-atlantski', 'ocean-arkticni'];

// the part of a multipolygon that contains a point, or the largest part
const partOf = (
  f: Feature<Geometry> | undefined,
  at?: [number, number],
): Feature<Geometry> | undefined => {
  if (f?.geometry.type !== 'MultiPolygon') return f;
  const polygons: Polygon[] = f.geometry.coordinates.map((coordinates) => ({
    type: 'Polygon',
    coordinates,
  }));
  const found = at
    ? polygons.find((p) => geoContains(p, at))
    : [...polygons].sort((a, b) => geoArea(b) - geoArea(a))[0];
  return found ? { type: 'Feature', properties: {}, geometry: found } : undefined;
};

export interface Level4Sources {
  nature: NatureData;
  // seas from the marine data, keyed by item id
  marine: Readonly<Record<string, MultiPolygon>>;
  // country features by place id, for the parts derived from countries
  countries: ReadonlyMap<string, Feature<Geometry>>;
}

export interface Level4 {
  items: Item[];
  features: Map<string, Feature<Geometry>>;
  groupOf: (id: string) => NatureGroup | undefined;
  // item ids in a family, for a question's clickable choices
  membersOf: (group: NatureGroup) => string[];
  shapesFor: (
    group: NatureGroup | undefined,
    context: readonly MapShape[],
    oceans: readonly MapShape[],
  ) => MapShape[];
}

export const buildLevel4 = ({ nature, marine, countries }: Level4Sources): Level4 => {
  const features = new Map<string, Feature<Geometry>>();
  const feature = (geometry: Geometry): Feature<Geometry> => ({
    type: 'Feature',
    properties: {},
    geometry,
  });
  for (const row of ROWS) {
    const fromNature = nature[row.id];
    const fromMarine = marine[row.id];
    const handDrawn = HAND_DRAWN[row.id];
    if (fromNature) features.set(row.id, feature(fromNature));
    else if (fromMarine) features.set(row.id, feature(fromMarine));
    else if (handDrawn) features.set(row.id, feature(rewound(handDrawn)));
  }
  // Derived from country shapes: Italy's mainland is the Apennine peninsula; Crete is the
  // part of Greece that contains Heraklion.
  const italy = partOf(countries.get('country-it'));
  if (italy) features.set('peninsula-apeninski', italy);
  const crete = partOf(countries.get('country-gr'), [25.13, 35.33]);
  if (crete) features.set('island-kreta', crete);

  const items: Item[] = ROWS.filter((r) => features.has(r.id)).map((r) => ({
    id: r.id,
    levels: [4],
    kind: r.kind,
    nameSl: r.nameSl,
    geo: r.id,
    region: 'europe',
    group: r.group,
    curriculum: CURRICULUM,
  }));

  const groupOf = (id: string): NatureGroup | undefined =>
    SHARED_OCEANS.includes(id) ? 'water' : ROWS.find((r) => r.id === id)?.group;
  const membersOf = (group: NatureGroup): string[] => [
    ...items.filter((i) => i.group === group).map((i) => i.id),
    ...(group === 'water' ? SHARED_OCEANS : []),
  ];

  const cache = new Map<string, MapShape[]>();
  const shapesFor = (
    group: NatureGroup | undefined,
    context: readonly MapShape[],
    oceans: readonly MapShape[],
  ): MapShape[] => {
    const key = group ?? 'none';
    const cached = cache.get(key);
    if (cached) return cached;
    const members = group ? items.filter((i) => i.group === group) : [];
    // Bigger areas first, so smaller ones inside them stay on top and tappable.
    const sorted = [...members].sort(
      (a, b) =>
        geoArea(features.get(b.id) ?? feature({ type: 'Point', coordinates: [0, 0] })) -
        geoArea(features.get(a.id) ?? feature({ type: 'Point', coordinates: [0, 0] })),
    );
    const own: MapShape[] = sorted.flatMap((item): MapShape[] => {
      const f = features.get(item.id);
      if (!f) return [];
      if (item.kind === 'river')
        return [
          {
            id: item.id,
            kind: 'line',
            feature: f,
            interactive: true,
            variant: 'wide',
            tone: 'river',
          },
        ];
      if (item.kind === 'sea')
        return [{ id: item.id, kind: 'area', feature: f, interactive: true, variant: 'water' }];
      if (item.kind === 'mountain')
        return [
          {
            id: item.id,
            kind: 'area',
            feature: f,
            interactive: true,
            variant: 'wide',
            tone: 'mountain',
          },
        ];
      return [
        {
          id: item.id,
          kind: 'area',
          feature: f,
          interactive: true,
          tone: item.kind === 'lowland' ? 'lowland' : 'land',
        },
      ];
    });
    // Water lies under the land; everything else on top of it.
    const shapes =
      group === 'water'
        ? [...oceans.filter((o) => SHARED_OCEANS.includes(o.id)), ...own, ...context]
        : [...context, ...own];
    cache.set(key, shapes);
    return shapes;
  };

  return { items, features, groupOf, membersOf, shapesFor };
};
