import { itemsInLevel, type Item, type LevelId } from '../core/item';
import type { Progress } from '../core/progress';
import { buildFindRound, buildReplayRound, findQuestion, type Question } from '../core/round';
import { buildOrientationRound } from '../core/orientation';
import { seededRng, type Rng } from '../core/random';
import type { GameData } from '../data/gameData';
import type { TestHooks } from './testHooks';

export const makeRng = (hooks: TestHooks): Rng => {
  return seededRng(hooks.seed ?? Date.now());
};

export const newRound = (
  level: LevelId,
  data: GameData,
  progress: Progress,
  hooks: TestHooks,
  rng: Rng,
): Question[] => {
  const pool = itemsInLevel(data.items, level);
  if (hooks.round) return fixedRound(hooks.round, data);
  if (level === 2)
    return buildOrientationRound(data.orientation, progress.items, progress.roundsPlayed, rng);
  return buildFindRound(pool, progress.items, progress.roundsPlayed, rng);
};

const choicesFor = (id: string, data: GameData): readonly string[] | undefined => {
  return data.orientation.choiceSets.find((set) => set.includes(id));
};

function fixedRound(entries: readonly string[], data: GameData): Question[] {
  return entries.flatMap((entry): Question[] => {
    const [kind, countryId, answer] = entry.split(':');
    if (kind === 'hemisphere' && countryId && answer) {
      const choiceIds = choicesFor(answer, data) ?? [answer];
      return [
        {
          id: entry,
          mode: 'hemisphere',
          itemId: answer,
          promptId: countryId,
          acceptIds: [answer],
          choiceIds,
        },
      ];
    }
    const item = data.itemById.get(entry);
    return item ? [findQuestion(item, choicesFor(item.id, data))] : [];
  });
}

export const replayRound = (ids: readonly string[], data: GameData, rng: Rng): Question[] => {
  const items = ids.flatMap((id) => {
    const item = data.itemById.get(id);
    return item ? [item] : [];
  });
  // Orientation items keep their choice pair when replayed.
  return buildReplayRound(items, rng).map((q) => {
    const choiceIds = choicesFor(q.itemId, data);
    return choiceIds ? { ...q, choiceIds } : q;
  });
};

export const levelItems = (data: GameData | undefined, level: LevelId): Item[] => {
  return data ? itemsInLevel(data.items, level) : [];
};
