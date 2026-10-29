import { describe, expect, it } from 'vitest';
import { emptyProgress } from '../core/progress';
import { buildFixedRound } from '../core/round';
import { makeItems } from '../core/testItems';
import { gameReducer, type GameAction, type GameState } from './game';

const items = makeItems(3);
const lookup = new Map(items.map((i) => [i.id, i]));
const questions = buildFixedRound(items, ['country-0', 'country-1']);
const initial: GameState = { view: { screen: 'start' }, progress: emptyProgress() };
const run = (actions: GameAction[]): GameState => actions.reduce(gameReducer, initial);

describe('gameReducer', () => {
  it('plays a round: wrong, right, fact, next, right, summary', () => {
    const s = run([
      { type: 'startRound', level: 3, questions },
      { type: 'click', id: 'country-2' },
      { type: 'click', id: 'country-0' },
    ]);
    expect(s.view.screen).toBe('fact');
    const s2 = [
      { type: 'next', items: lookup },
      { type: 'click', id: 'country-1' },
      { type: 'next', items: lookup },
    ].reduce((st, a) => gameReducer(st, a as GameAction), s);
    expect(s2.view.screen).toBe('summary');
    if (s2.view.screen !== 'summary') throw new Error('expected summary');
    expect(s2.view.summary.stars).toBe(5);
    expect(s2.progress.roundsPlayed).toBe(1);
    expect(s2.progress.items['country-0']?.box).toBe(1);
    expect(s2.progress.items['country-1']?.box).toBe(2);
    expect(s2.view.newStickers).toEqual([]);
  });

  it('awards a sticker when the last item of a level becomes mastered', () => {
    const one = makeItems(1);
    const items1 = new Map(one.map((i) => [i.id, i]));
    const q = buildFixedRound(one, ['country-0']);
    let s: GameState = {
      view: { screen: 'start' },
      progress: {
        ...emptyProgress(),
        items: { 'country-0': { box: 2, seen: 1, firstTry: 1, lastRound: 0 } },
      },
    };
    for (const a of [
      { type: 'startRound', level: 3, questions: q },
      { type: 'click', id: 'country-0' },
      { type: 'next', items: items1 },
    ] as GameAction[]) {
      s = gameReducer(s, a);
    }
    if (s.view.screen !== 'summary') throw new Error('expected summary');
    expect(s.view.newStickers).toEqual([3]);
    expect(s.progress.stickers).toEqual([3]);
  });

  it('leaves progress alone for untracked rounds', () => {
    const s = run([
      {
        type: 'startRound',
        level: 2,
        questions: buildFixedRound(items, ['country-0']),
        track: false,
      },
      { type: 'click', id: 'country-0' },
      { type: 'next', items: lookup },
    ]);
    expect(s.view.screen).toBe('summary');
    expect(s.progress.roundsPlayed).toBe(0);
  });

  it('ignores map clicks while the fact card is open', () => {
    const s = run([
      { type: 'startRound', level: 3, questions },
      { type: 'click', id: 'country-0' },
    ]);
    expect(gameReducer(s, { type: 'click', id: 'country-1' })).toBe(s);
  });

  it('moves between start and atlas', () => {
    expect(run([{ type: 'openAtlas' }]).view.screen).toBe('atlas');
    expect(run([{ type: 'openAtlas' }, { type: 'home' }]).view.screen).toBe('start');
  });

  it('does not start an empty round', () => {
    expect(run([{ type: 'startRound', level: 3, questions: [] }]).view.screen).toBe('start');
  });
});
