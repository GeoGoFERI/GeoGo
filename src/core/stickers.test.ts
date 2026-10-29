import { describe, expect, it } from 'vitest';
import { awardStickers, masteredLevels } from './stickers';
import { emptyProgress } from './progress';
import { makeItems } from './testItems';

const items = makeItems(3);
const box = (b: 1 | 2 | 3 | 4 | 5) => ({ box: b, seen: 2, firstTry: 2, lastRound: 1 });

describe('stickers', () => {
  it('counts a level as mastered only when every item is', () => {
    expect(masteredLevels(items, { 'country-0': box(3), 'country-1': box(4) })).toEqual([]);
    expect(
      masteredLevels(items, { 'country-0': box(3), 'country-1': box(4), 'country-2': box(5) }),
    ).toEqual([3]);
  });

  it('awards a sticker once and keeps it', () => {
    const p = {
      ...emptyProgress(),
      items: { 'country-0': box(3), 'country-1': box(3), 'country-2': box(3) },
    };
    const first = awardStickers(p, items);
    expect(first.added).toEqual([3]);
    expect(first.progress.stickers).toEqual([3]);
    const again = awardStickers(first.progress, items);
    expect(again.added).toEqual([]);
    expect(again.progress).toBe(first.progress);
  });
});
