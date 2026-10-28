import type { GameData } from '../data/gameData';
import { buildRiddles, type Riddle } from '../data/riddles';
import { sl } from '../i18n/sl';

const cache = new WeakMap<GameData, Map<string, Riddle>>();

export const riddlesFor = (data: GameData): Map<string, Riddle> => {
  let riddles = cache.get(data);
  if (!riddles) {
    riddles = buildRiddles(
      data.items,
      data.countryFact,
      (id) => data.nameOf(id)?.nameSl,
      (group) => sl.groups[group] ?? group,
      {
        coastal: sl.coastal,
        landlocked: sl.landlocked,
        neighbours: sl.neighbours,
        noNeighbours: sl.noNeighbours,
        part: sl.partOfEurope,
      },
    );
    cache.set(data, riddles);
  }
  return riddles;
};

export const riddleText = (riddle: Riddle): string => {
  return riddle.lines.map((l) => (l.value ? `${l.label}: ${l.value}.` : `${l.label}.`)).join(' ');
};
