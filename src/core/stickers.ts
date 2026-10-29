import type { Item, LevelId } from './item';
import { isMastered, type ItemStats } from './leitner';
import type { Progress } from './progress';

export const masteredLevels = (
  items: readonly Item[],
  stats: Readonly<Record<string, ItemStats>>,
): LevelId[] => {
  const levels: LevelId[] = [1, 2, 3, 4, 5];
  return levels.filter((level) => {
    const inLevel = items.filter((i) => i.levels.includes(level));
    return inLevel.length > 0 && inLevel.every((i) => isMastered(stats[i.id]));
  });
};

export const awardStickers = (
  progress: Progress,
  items: readonly Item[],
): { progress: Progress; added: LevelId[] } => {
  const added = masteredLevels(items, progress.items).filter((l) => !progress.stickers.includes(l));
  if (added.length === 0) return { progress, added };
  return { progress: { ...progress, stickers: [...progress.stickers, ...added] }, added };
};
