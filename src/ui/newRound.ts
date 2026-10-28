import { itemsInLevel, type Item, type LevelId } from '../core/item';
import type { Progress } from '../core/progress';
import {
  asFactQuestions,
  buildFindRound,
  buildReplayRound,
  findQuestion,
  type Question,
} from '../core/round';
import { riddlesFor } from './riddleContent';
import { buildOrientationRound } from '../core/orientation';
import { seededRng, type Rng } from '../core/random';
import type { GameData } from '../data/gameData';
import type { TestHooks } from './testHooks';

export const makeRng = (hooks: TestHooks): Rng => {
  return seededRng(hooks.seed ?? Date.now());
};

export type PlayMode = 'find' | 'fact';

export function newRound(
  level: LevelId,
  data: GameData,
  progress: Progress,
  hooks: TestHooks,
  rng: Rng,
  mode: PlayMode = 'find',
): Question[] {
  const pool = itemsInLevel(data.items, level);
  if (level === 3 && mode === 'fact') {
    // Only countries with an unambiguous riddle can be asked this way.
    const riddles = riddlesFor(data);
    const fixed = hooks.round ? fixedRound(level, hooks.round, data) : undefined;
    const questions =
      fixed ??
      buildFindRound(
        pool.filter((i) => riddles.has(i.id)),
        progress.items,
        progress.roundsPlayed,
        rng,
      );
    return asFactQuestions(questions);
  }
  if (hooks.round) return fixedRound(level, hooks.round, data);
  if (level === 2)
    return buildOrientationRound(data.orientation, progress.items, progress.roundsPlayed, rng);
  return withChoices(level, buildFindRound(pool, progress.items, progress.roundsPlayed, rng), data);
}

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
  mode: PlayMode = 'find',
): Question[] => {
  const items = ids.flatMap((id) => {
    const item = data.itemById.get(id);
    return item ? [item] : [];
  });
  // Orientation pairs, Level 4 families and the riddle mode stay the same when replayed.
  const questions = withChoices(level, buildReplayRound(items, rng), data);
  return mode === 'fact' ? asFactQuestions(questions) : questions;
};

export const levelItems = (data: GameData | undefined, level: LevelId): Item[] => {
  return data ? itemsInLevel(data.items, level) : [];
};
