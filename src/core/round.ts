import type { Item } from './item';
import { itemWeight, type ItemStats } from './leitner';
import { shuffle, weightedSample, type Rng } from './random';

export const ROUND_SIZE = 10;

export type QuestionMode = 'find' | 'hemisphere' | 'fact';

export type Question = {
  id: string;
  mode: QuestionMode;
  itemId: string;
  promptId: string;
  acceptIds: readonly string[];
  choiceIds?: readonly string[];
};

export type StatsLookup = Readonly<Record<string, ItemStats>>;

export function pickItems(
  pool: readonly Item[],
  stats: StatsLookup,
  roundsPlayed: number,
  count: number,
  rng: Rng,
): Item[] {
  const picked = weightedSample(
    pool,
    (item) => itemWeight(stats[item.id], roundsPlayed),
    count,
    rng,
  );
  return shuffle(picked, rng);
}

export function findQuestion(item: Item, choiceIds?: readonly string[]): Question {
  return {
    id: `find:${item.id}`,
    mode: 'find',
    itemId: item.id,
    promptId: item.id,
    acceptIds: [item.id],
    ...(choiceIds ? { choiceIds } : {}),
  };
}

export function buildFindRound(
  pool: readonly Item[],
  stats: StatsLookup,
  roundsPlayed: number,
  rng: Rng,
  size = ROUND_SIZE,
): Question[] {
  return pickItems(pool, stats, roundsPlayed, size, rng).map((item) => findQuestion(item));
}

export function buildReplayRound(items: readonly Item[], rng: Rng): Question[] {
  return shuffle(items, rng).map((item) => findQuestion(item));
}

export function buildFixedRound(pool: readonly Item[], ids: readonly string[]): Question[] {
  const byId = new Map(pool.map((item) => [item.id, item]));
  return ids.flatMap((id) => {
    const item = byId.get(id);
    return item ? [findQuestion(item)] : [];
  });
}

export function asFactQuestions(questions: readonly Question[]): Question[] {
  return questions.map((q) => ({ ...q, id: `fact:${q.itemId}`, mode: 'fact' }));
}
