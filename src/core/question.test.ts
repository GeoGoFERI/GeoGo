import { describe, expect, it } from 'vitest';
import { questionReducer, questionResult, startQuestion, type QuestionAction } from './question';
import type { Question } from './round';

const q: Question = {
  id: 'find:country-705',
  mode: 'find',
  itemId: 'country-705',
  promptId: 'country-705',
  acceptIds: ['country-705'],
};

const run = (actions: QuestionAction[], question = q) =>
  actions.reduce(questionReducer, startQuestion(question));

describe('questionReducer', () => {
  it('gives 3 stars for a first-try answer', () => {
    const s = run([{ type: 'click', id: 'country-705' }]);
    expect(s.done).toBe(true);
    expect(s.stars).toBe(3);
    expect(s.feedback).toEqual({ type: 'correct' });
  });

  it('reveals what was clicked on a wrong answer and lets the pupil retry', () => {
    const s = run([{ type: 'click', id: 'country-348' }]);
    expect(s.done).toBe(false);
    expect(s.feedback).toEqual({ type: 'wrong', clickedId: 'country-348' });
    const s2 = questionReducer(s, { type: 'click', id: 'country-705' });
    expect(s2.stars).toBe(2);
  });

  it('gives 1 star after two wrong tries', () => {
    const s = run([
      { type: 'click', id: 'a' },
      { type: 'click', id: 'b' },
      { type: 'click', id: 'country-705' },
    ]);
    expect(s.stars).toBe(1);
  });

  it('does not count a repeated tap on the same wrong item twice', () => {
    const s = run([
      { type: 'click', id: 'a' },
      { type: 'click', id: 'a' },
      { type: 'click', id: 'country-705' },
    ]);
    expect(s.attempts).toBe(2);
    expect(s.stars).toBe(2);
    expect(s.seq).toBe(3);
  });

  it('steps through help tiers 1-3, never past 3, and any help gives 1 star', () => {
    const s = run([{ type: 'help' }, { type: 'help' }, { type: 'help' }, { type: 'help' }]);
    expect(s.hintTier).toBe(3);
    expect(s.feedback).toEqual({ type: 'hint', tier: 3 });
    const done = questionReducer(s, { type: 'click', id: 'country-705' });
    expect(done.stars).toBe(1);
    expect(questionResult(done)).toMatchObject({ stars: 1, hintsUsed: 3, attempts: 1 });
  });

  it('ignores actions after completion and clicks outside the offered choices', () => {
    const done = run([{ type: 'click', id: 'country-705' }]);
    expect(questionReducer(done, { type: 'click', id: 'x' })).toBe(done);
    const pair: Question = { ...q, choiceIds: ['country-705', 'other'] };
    const s = run([{ type: 'click', id: 'outside' }], pair);
    expect(s.attempts).toBe(0);
  });

  it('has no result until done', () => {
    expect(questionResult(startQuestion(q))).toBeUndefined();
  });
});
