export type Box = 1 | 2 | 3 | 4 | 5;

export type ItemStats = {
  box: Box;
  seen: number;
  firstTry: number;
  lastRound: number;
};

export const MASTERED_BOX: Box = 3;

const INTERVAL: Record<Box, number> = { 1: 1, 2: 2, 3: 4, 4: 8, 5: 16 };

const UNSEEN_WEIGHT = 6;

export function itemWeight(stats: ItemStats | undefined, roundsPlayed: number): number {
  if (!stats) return UNSEEN_WEIGHT;
  const base = 2 ** (5 - stats.box);
  const overdue = roundsPlayed - stats.lastRound >= INTERVAL[stats.box];
  return overdue ? base * 2 : base;
}

export function updateStats(
  stats: ItemStats | undefined,
  stars: 1 | 2 | 3,
  round: number,
): ItemStats {
  const box: Box = stats?.box ?? 1;
  const nextBox: Box = stars === 3 ? (Math.min(box + 1, 5) as Box) : stars === 2 ? box : 1;
  return {
    box: nextBox,
    seen: (stats?.seen ?? 0) + 1,
    firstTry: (stats?.firstTry ?? 0) + (stars === 3 ? 1 : 0),
    lastRound: round,
  };
}

export function isMastered(stats: ItemStats | undefined): boolean {
  return stats !== undefined && stats.box >= MASTERED_BOX;
}
