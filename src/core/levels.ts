import type { LevelId, Region } from './item';

export type LevelMode = 'find' | 'orientation';

export type Level = {
  id: LevelId;
  region: Region;
  mode: LevelMode;
  stretch: boolean;
};

export const LEVELS: readonly Level[] = [
  { id: 1, region: 'world', mode: 'find', stretch: false },
  { id: 2, region: 'world', mode: 'orientation', stretch: false },
  { id: 3, region: 'europe', mode: 'find', stretch: false },
  { id: 4, region: 'europe', mode: 'find', stretch: false },
  // Level 5 starts each question in the target's continent (see PlayScreen).
  { id: 5, region: 'world', mode: 'find', stretch: false },
];

export function levelById(id: LevelId): Level {
  const level = LEVELS.find((l) => l.id === id);
  if (!level) throw new Error(`Unknown level ${String(id)}`);
  return level;
}
