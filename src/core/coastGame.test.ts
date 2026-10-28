import { describe, expect, it } from 'vitest';
import { coastReducer, dealCoastCards, startCoastGame, type CoastCard } from './coastGame';
import { seededRng } from './random';
import { makeItems } from './testItems';

describe('dealCoastCards', () => {
  it('deals a balanced hand without repeats', () => {
    const items = makeItems(20).map((i, n) => ({ ...i, coastal: n % 3 !== 0 }));
    const cards = dealCoastCards(items, seededRng(2));
    expect(cards).toHaveLength(10);
    expect(cards.filter((c) => c.answer === 'landlocked')).toHaveLength(5);
    expect(new Set(cards.map((c) => c.itemId)).size).toBe(10);
  });
});

describe('coastReducer', () => {
  const cards: CoastCard[] = [
    { itemId: 'a', answer: 'coastal' },
    { itemId: 'b', answer: 'landlocked' },
  ];

  it('scores one pick per card and finishes after the last card', () => {
    let s = startCoastGame(cards);
    s = coastReducer(s, { type: 'pick', choice: 'coastal' });
    expect(s.correct).toBe(1);
    // A second pick on the same card changes nothing.
    expect(coastReducer(s, { type: 'pick', choice: 'landlocked' })).toBe(s);
    s = coastReducer(s, { type: 'next' });
    expect(s.index).toBe(1);
    expect(s.picked).toBeUndefined();
    s = coastReducer(s, { type: 'pick', choice: 'coastal' });
    expect(s.correct).toBe(1);
    s = coastReducer(s, { type: 'next' });
    expect(s.done).toBe(true);
  });

  it('does not move on before a pick', () => {
    const s = startCoastGame(cards);
    expect(coastReducer(s, { type: 'next' })).toBe(s);
  });
});
