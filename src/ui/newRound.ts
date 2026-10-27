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
  if (hooks.round) return fixedRound(level, hooks.round, data);
  if (level === 2)
    return buildOrientationRound(data.orientation, progress.items, progress.roundsPlayed, rng);
  return withChoices(level, buildFindRound(pool, progress.items, progress.roundsPlayed, rng), data);
};

function withChoices(level: LevelId, questions: Question[], data: GameData): Question[] {
  return questions.map((q) => {
    const choiceIds = data.choicesFor(level, q.itemId);
    return choiceIds ? { ...q, choiceIds } : q;
  });
}

function fixedRound(level: LevelId, entries: readonly string[], data: GameData): Question[] {
  return entries.flatMap((entry): Question[] => {
    const [kind, countryId, answer] = entry.split(':');
    if (kind === 'hemisphere' && countryId && answer) {
      const choiceIds = data.choicesFor(2, answer) ?? [answer];
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
    return item ? [findQuestion(item, data.choicesFor(level, item.id))] : [];
  });
}

export const replayRound = (
  level: LevelId,
  ids: readonly string[],
  data: GameData,
  rng: Rng,
): Question[] => {
  const items = ids.flatMap((id) => {
    const item = data.itemById.get(id);
    return item ? [item] : [];
  });
  // Orientation pairs and Level 4 families stay the same when replayed.
  return withChoices(level, buildReplayRound(items, rng), data);
};

export const levelItems = (data: GameData | undefined, level: LevelId): Item[] => {
  return data ? itemsInLevel(data.items, level) : [];
};
