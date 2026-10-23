import { z } from 'zod';
import { levelIdSchema, type LevelId } from './item';
import { updateStats, type ItemStats } from './leitner';
import type { QuestionResult } from './question';
import type { KeyValueStore } from './storage';

export const STORAGE_KEY = 'geogo.progress';
export const CURRENT_VERSION = 1;

const itemStatsSchema = z.object({
  box: z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4), z.literal(5)]),
  seen: z.number().int().min(0),
  firstTry: z.number().int().min(0),
  lastRound: z.number().int().min(0),
});

export const progressSchema = z.object({
  version: z.literal(CURRENT_VERSION),
  roundsPlayed: z.number().int().min(0),
  items: z.record(z.string(), itemStatsSchema),
  stickers: z.array(levelIdSchema).default([]),
  settings: z.object({ sound: z.boolean().default(false) }).default({ sound: false }),
});
export type Progress = z.infer<typeof progressSchema>;

export type Migrations = Readonly<
  Record<number, (data: Record<string, unknown>) => Record<string, unknown>>
>;

export const MIGRATIONS: Migrations = {};

export function emptyProgress(): Progress {
  return {
    version: CURRENT_VERSION,
    roundsPlayed: 0,
    items: {},
    stickers: [],
    settings: { sound: false },
  };
}

export function migrate(raw: unknown, migrations: Migrations = MIGRATIONS): Progress {
  if (typeof raw !== 'object' || raw === null) return emptyProgress();
  let data = raw as Record<string, unknown>;
  let version = typeof data.version === 'number' ? data.version : 0;
  if (version > CURRENT_VERSION) return emptyProgress();
  while (version < CURRENT_VERSION) {
    const step = migrations[version];
    if (!step) return emptyProgress();
    data = step(data);
    version += 1;
    data = { ...data, version };
  }
  const parsed = progressSchema.safeParse(data);
  return parsed.success ? parsed.data : emptyProgress();
}

export function loadProgress(store: KeyValueStore, migrations: Migrations = MIGRATIONS): Progress {
  const text = store.getItem(STORAGE_KEY);
  if (text === null) return emptyProgress();
  try {
    return migrate(JSON.parse(text) as unknown, migrations);
  } catch {
    return emptyProgress();
  }
}

export function saveProgress(store: KeyValueStore, progress: Progress): void {
  store.setItem(STORAGE_KEY, JSON.stringify(progress));
}

export function recordRound(progress: Progress, results: readonly QuestionResult[]): Progress {
  const round = progress.roundsPlayed + 1;
  const items: Record<string, ItemStats> = { ...progress.items };
  for (const r of results) items[r.itemId] = updateStats(items[r.itemId], r.stars, round);
  return { ...progress, roundsPlayed: round, items };
}

export function awardSticker(progress: Progress, level: LevelId): Progress {
  if (progress.stickers.includes(level)) return progress;
  return { ...progress, stickers: [...progress.stickers, level] };
}

export function setSound(progress: Progress, sound: boolean): Progress {
  return { ...progress, settings: { ...progress.settings, sound } };
}
