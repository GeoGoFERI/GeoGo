import { geoArea } from 'd3-geo';
import type { Feature, Geometry, MultiLineString, MultiPolygon } from 'geojson';
import type { Item, Region } from '../core/item';
import type { MapShape } from '../map/types';
import type { WorldTopology } from '../map/world';
import { HAND_DRAWN_WORLD } from './custom/worldNature';
import { rewound } from './rewind';
import { CONTINENT_BY_A2 } from './continentTable';
import { mergeCountryParts } from './continents';

export type WorldNatureData = Readonly<Record<string, MultiPolygon | MultiLineString>>;

type Family = 'land' | 'relief' | 'river' | 'water';
type Continent = 'asia' | 'oceania' | 'namerica' | 'samerica' | 'africa';
type Row = { id: string; nameSl: string; kind: Item['kind']; family: Family; continent: Continent };

const CURRICULUM: Record<Continent, string> = {
  asia: 'Celine sveta > Azija',
  oceania: 'Celine sveta > Avstralija z Oceanijo',
  namerica: 'Celine sveta > Severna Amerika',
  samerica: 'Celine sveta > Južna Amerika',
  africa: 'Celine sveta > Afrika',
};

const r = (
  continent: Continent,
  family: Family,
  kind: Item['kind'],
  id: string,
  nameSl: string,
): Row => ({
  id,
  nameSl,
  kind,
  family,
  continent,
});

const ROWS: readonly Row[] = [
  r('asia', 'land', 'continent', 'continent-evrazija', 'Evrazija'),
  r('asia', 'relief', 'mountain', 'mountain-kavkaz', 'Kavkaz'),
  r('asia', 'relief', 'mountain', 'mountain-himalaja', 'Himalaja'),
  r('asia', 'relief', 'plateau', 'plateau-tibetanska', 'Tibetanska visoka planota'),
  r('asia', 'land', 'region', 'region-sibirija', 'Sibirija'),
  r('asia', 'land', 'region', 'region-mezopotamija', 'Mezopotamija'),
  r('asia', 'land', 'lowland', 'lowland-veliko-kitajsko', 'Veliko kitajsko nižavje'),
  r('asia', 'land', 'desert', 'desert-velika-arabska', 'Velika arabska puščava'),
  r('asia', 'land', 'peninsula', 'peninsula-arabski', 'Arabski polotok'),
  r('asia', 'land', 'peninsula', 'peninsula-dekanski', 'Dekanski polotok'),
  r('asia', 'land', 'peninsula', 'peninsula-indokitajski', 'Indokitajski polotok'),
  r('asia', 'land', 'peninsula', 'peninsula-korejski', 'Korejski polotok'),
  r('asia', 'land', 'island', 'islands-indonezijsko', 'Indonezijsko otočje'),
  r('asia', 'land', 'island', 'islands-filipinsko', 'Filipinsko otočje'),
  r('asia', 'land', 'island', 'islands-japonsko', 'Japonsko otočje'),
  r('asia', 'river', 'river', 'river-evfrat', 'Evfrat'),
  r('asia', 'river', 'river', 'river-tigris', 'Tigris'),
  r('asia', 'river', 'river', 'river-ganges', 'Ganges'),
  r('asia', 'river', 'river', 'river-chang-jiang', 'Chang Jiang (Modra reka)'),
  r('asia', 'river', 'river', 'river-huang-he', 'Huang He (Rumena reka)'),
  r('asia', 'water', 'lake', 'lake-kaspijsko', 'Kaspijsko jezero'),
  r('asia', 'water', 'gulf', 'gulf-perzijski', 'Perzijski zaliv'),
  r('oceania', 'relief', 'mountain', 'mountain-veliko-razvodno', 'Veliko razvodno gorovje'),
  r('oceania', 'water', 'reef', 'reef-veliki-koralni', 'Veliki koralni greben'),
  r('oceania', 'land', 'island', 'islands-nova-zelandija', 'Nova Zelandija'),
  r('oceania', 'land', 'island', 'islands-mikronezija', 'Mikronezija'),
  r('oceania', 'land', 'island', 'islands-melanezija', 'Melanezija'),
  r('oceania', 'land', 'island', 'islands-polinezija', 'Polinezija'),
  r('namerica', 'relief', 'mountain', 'mountain-skalno', 'Skalno gorovje'),
  r('namerica', 'relief', 'mountain', 'mountain-apalaci', 'Apalači'),
  r('namerica', 'land', 'lowland', 'lowland-osrednje', 'Osrednje nižavje'),
  r('namerica', 'land', 'lowland', 'lowland-priatlantsko', 'Priatlantsko nižavje'),
  r('namerica', 'land', 'region', 'region-aljaska', 'Aljaska'),
  r('namerica', 'land', 'peninsula', 'peninsula-kalifornijski', 'Kalifornijski polotok'),
  r('namerica', 'land', 'peninsula', 'peninsula-jukatan', 'Jukatan'),
  r('namerica', 'land', 'peninsula', 'peninsula-florida', 'Florida'),
  r('namerica', 'land', 'peninsula', 'peninsula-labrador', 'Labrador'),
  r('namerica', 'land', 'island', 'island-grenlandija', 'Grenlandija'),
  r('namerica', 'land', 'island', 'islands-karibsko', 'Karibsko otočje'),
  r('namerica', 'water', 'gulf', 'gulf-mehiski', 'Mehiški zaliv'),
  r('namerica', 'river', 'river', 'river-misisipi', 'Misisipi'),
  r('namerica', 'river', 'river', 'river-sv-lovrenca', 'Reka sv. Lovrenca'),
  r('namerica', 'water', 'lake', 'lake-velika-jezera', 'Velika jezera'),
  r('samerica', 'relief', 'mountain', 'mountain-andi', 'Andi'),
  r('samerica', 'relief', 'plateau', 'plateau-brazilsko', 'Brazilsko višavje'),
  r('samerica', 'land', 'lowland', 'lowland-amazonsko', 'Amazonsko nižavje'),
  r('samerica', 'land', 'desert', 'desert-atakama', 'Atakama'),
  r('samerica', 'river', 'river', 'river-amazonka', 'Amazonka'),
  r('samerica', 'land', 'island', 'island-ognjena-zemlja', 'Ognjena zemlja'),
  r('africa', 'land', 'lowland', 'lowland-cadska', 'Čadska kotlina'),
  r('africa', 'land', 'lowland', 'lowland-kongovska', 'Kongovska kotlina'),
  r('africa', 'land', 'desert', 'desert-kalahari', 'Kalahari'),
  r('africa', 'land', 'desert', 'desert-sahara', 'Sahara'),
  r('africa', 'land', 'desert', 'desert-namib', 'Namib'),
  r('africa', 'relief', 'mountain', 'mountain-atlas', 'Atlas'),
  r('africa', 'relief', 'plateau', 'plateau-etiopsko', 'Etiopsko višavje'),
  r('africa', 'relief', 'plateau', 'plateau-vzhodnoafrisko', 'Vzhodnoafriško višavje'),
  r('africa', 'relief', 'mountain', 'mountain-kilimandzaro', 'Kilimandžaro'),
  r('africa', 'land', 'peninsula', 'peninsula-somalski', 'Somalski polotok'),
  r('africa', 'water', 'gulf', 'gulf-gvinejski', 'Gvinejski zaliv'),
  r('africa', 'land', 'island', 'island-madagaskar', 'Madagaskar'),
  r('africa', 'river', 'river', 'river-nil', 'Nil'),
  r('africa', 'river', 'river', 'river-niger', 'Niger'),
  r('africa', 'river', 'river', 'river-kongo', 'Kongo'),
  r('africa', 'river', 'river', 'river-zambezi', 'Zambezi'),
  r('africa', 'water', 'lake', 'lake-viktorijino', 'Viktorijino jezero'),
];

const SHARED: readonly Row[] = [
  r('africa', 'water', 'sea', 'sea-sredozemsko', 'Sredozemsko morje'),
];

const KILIMANJARO: [number, number] = [37.35, -3.07];

export type Level5 = {
  items: Item[];
  features: Map<string, Feature<Geometry>>;
  choicesFor: (id: string) => readonly string[] | undefined;
  shapesFor: (
    id: string | undefined,
    context: readonly MapShape[],
    seas: ReadonlyMap<string, Feature<Geometry>>,
  ) => MapShape[];
};

export function buildLevel5(topology: WorldTopology, nature: WorldNatureData): Level5 {
  const features = new Map<string, Feature<Geometry>>();
  const feature = (geometry: Geometry): Feature<Geometry> => ({
    type: 'Feature',
    properties: {},
    geometry,
  });
  for (const row of ROWS) {
    const fromNature = nature[row.id];
    const handDrawn = HAND_DRAWN_WORLD[row.id];
    if (fromNature) features.set(row.id, feature(fromNature));
    else if (handDrawn) features.set(row.id, feature(rewound(handDrawn)));
  }
  features.set('mountain-kilimandzaro', feature({ type: 'Point', coordinates: KILIMANJARO }));
  // Units made of whole countries.
  const eurasia = mergeCountryParts(topology, (a2) => {
    const c = CONTINENT_BY_A2.get(a2);
    return c === 'continent-evropa' || c === 'continent-azija';
  });
  if (eurasia) features.set('continent-evrazija', eurasia);
  const indochina = mergeCountryParts(
    topology,
    (a2, [lon, lat]) =>
      ['MM', 'TH', 'LA', 'KH', 'VN'].includes(a2) || (a2 === 'MY' && lon < 105 && lat > 1),
  );
  if (indochina) features.set('peninsula-indokitajski', indochina);
  const indonesia = mergeCountryParts(topology, (a2) => a2 === 'ID' || a2 === 'TL');
  if (indonesia) features.set('islands-indonezijsko', indonesia);

  const region = (row: Row): Region => (row.id === 'continent-evrazija' ? 'world' : row.continent);
  const items: Item[] = ROWS.filter((row) => features.has(row.id)).map((row) => ({
    id: row.id,
    levels: [5],
    kind: row.kind,
    nameSl: row.nameSl,
    geo: row.id,
    region: region(row),
    group: row.continent,
    curriculum: CURRICULUM[row.continent],
  }));

  const all = [...ROWS, ...SHARED];
  const rowOf = (id: string): Row | undefined => all.find((x) => x.id === id);
  const choicesFor = (id: string): readonly string[] | undefined => {
    const row = rowOf(id);
    return row
      ? all.filter((x) => x.continent === row.continent && x.family === row.family).map((x) => x.id)
      : undefined;
  };

  const cache = new Map<string, MapShape[]>();
  const shapesFor = (
    id: string | undefined,
    context: readonly MapShape[],
    seas: ReadonlyMap<string, Feature<Geometry>>,
  ): MapShape[] => {
    const row = id ? rowOf(id) : undefined;
    if (!row) return [...context];
    const key = `${row.continent}:${row.family}`;
    const cached = cache.get(key);
    if (cached) return cached;
    const under: MapShape[] = [];
    const over: MapShape[] = [];
    for (const member of choicesFor(row.id) ?? []) {
      const m = rowOf(member);
      const f = features.get(member) ?? seas.get(member);
      if (!m || !f) continue;
      if (m.kind === 'river')
        over.push({
          id: member,
          kind: 'line',
          feature: f,
          interactive: true,
          variant: 'wide',
          tone: 'river',
        });
      else if (member === 'mountain-kilimandzaro')
        over.push({ id: member, kind: 'point', feature: f, interactive: true });
      else if (m.kind === 'gulf' || m.kind === 'sea')
        under.push({ id: member, kind: 'area', feature: f, interactive: true, variant: 'water' });
      else if (m.kind === 'lake')
        over.push({ id: member, kind: 'area', feature: f, interactive: true, variant: 'water' });
      else if (m.family === 'relief')
        over.push({
          id: member,
          kind: 'area',
          feature: f,
          interactive: true,
          variant: 'wide',
          tone: 'mountain',
        });
      else
        over.push({
          id: member,
          kind: 'area',
          feature: f,
          interactive: true,
          tone: m.kind === 'lowland' || m.kind === 'desert' ? 'lowland' : 'land',
        });
    }
    // Largest areas first so smaller ones inside them (Čadska kotlina in the Sahara, Sibirija in
    // Evrazija) stay on top and tappable; lines and points have no area and come last.
    const size = (shape: MapShape): number => (shape.kind === 'area' ? geoArea(shape.feature) : 0);
    over.sort((a, b) => size(b) - size(a));
    const shapes = [...under, ...context, ...over];
    cache.set(key, shapes);
    return shapes;
  };

  return { items, features, choicesFor, shapesFor };
}
