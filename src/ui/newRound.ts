import { itemsInLevel, type Item, type LevelId } from '../core/item';
import type { Progress } from '../core/progress';
import { buildFindRound, buildFixedRound, buildReplayRound, type Question } from '../core/round';
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
  if (hooks.round) return buildFixedRound(pool, hooks.round);
  return buildFindRound(pool, progress.items, progress.roundsPlayed, rng);
};

export const replayRound = (ids: readonly string[], data: GameData, rng: Rng): Question[] => {
  const items = ids.flatMap((id) => {
    const item = data.itemById.get(id);
    return item ? [item] : [];
  });
  return buildReplayRound(items, rng);
};

export const levelItems = (data: GameData | undefined, level: LevelId): Item[] => {
  return data ? itemsInLevel(data.items, level) : [];
};
