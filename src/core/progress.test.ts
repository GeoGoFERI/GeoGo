import { describe, expect, it } from 'vitest';
import {
  STORAGE_KEY,
  awardSticker,
  emptyProgress,
  loadProgress,
  migrate,
  recordRound,
  saveProgress,
  type Migrations,
} from './progress';
import { memoryStore, safeStore, type KeyValueStore } from './storage';
import type { QuestionResult } from './question';

const result = (itemId: string, stars: 1 | 2 | 3): QuestionResult => ({
  questionId: `find:${itemId}`,
  itemId,
  stars,
  attempts: 4 - stars,
  hintsUsed: 0,
  wrongIds: [],
});

describe('recordRound', () => {
  it('counts the round and updates each item without mutating the input', () => {
    const before = emptyProgress();
    const after = recordRound(before, [result('a', 3), result('b', 1)]);
    expect(after.roundsPlayed).toBe(1);
    expect(after.items.a).toEqual({ box: 2, seen: 1, firstTry: 1, lastRound: 1 });
    expect(after.items.b?.box).toBe(1);
    expect(before.items).toEqual({});
  });
});

describe('persistence', () => {
  it('round-trips through a store', () => {
    const store = memoryStore();
    const p = awardSticker(recordRound(emptyProgress(), [result('a', 3)]), 3);
    saveProgress(store, p);
    expect(loadProgress(store)).toEqual(p);
  });

  it('starts fresh on corrupt JSON, wrong shapes and newer versions', () => {
    const store = memoryStore();
    store.setItem(STORAGE_KEY, '{not json');
    expect(loadProgress(store)).toEqual(emptyProgress());
    expect(migrate({ version: 1, roundsPlayed: -3, items: {} })).toEqual(emptyProgress());
    expect(migrate({ version: 99 })).toEqual(emptyProgress());
    expect(migrate('hello')).toEqual(emptyProgress());
  });

  it('fills defaults for fields added later in the same version', () => {
    const p = migrate({ version: 1, roundsPlayed: 2, items: {} });
    expect(p.stickers).toEqual([]);
    expect(p.settings.sound).toBe(false);
  });

  it('runs migrations step by step up to the current version', () => {
    // A pretend version 0 that stored boxes as a plain map; the migration converts it.
    const migrations: Migrations = {
      0: (old) => {
        const boxes = (old.boxes ?? {}) as Record<string, number>;
        const items = Object.fromEntries(
          Object.entries(boxes).map(([id, box]) => [
            id,
            { box, seen: 1, firstTry: 0, lastRound: 0 },
          ]),
        );
        return { roundsPlayed: 0, items };
      },
    };
    const p = migrate({ boxes: { a: 2 } }, migrations);
    expect(p.version).toBe(1);
    expect(p.items.a?.box).toBe(2);
    // Without the migration, version-0 data cannot be read and starts fresh.
    expect(migrate({ boxes: { a: 2 } })).toEqual(emptyProgress());
  });
});

describe('safeStore', () => {
  const throwing: KeyValueStore = {
    getItem: () => {
      throw new Error('SecurityError');
    },
    setItem: () => {
      throw new Error('QuotaExceededError');
    },
  };

  it('never throws and falls back to memory', () => {
    const store = safeStore(throwing);
    expect(() => store.setItem('k', 'v')).not.toThrow();
    expect(store.getItem('k')).toBe('v');
  });

  it('works without any backing store', () => {
    const store = safeStore(undefined);
    store.setItem('k', 'v');
    expect(store.getItem('k')).toBe('v');
  });
});
