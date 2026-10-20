import { describe, expect, it } from 'vitest';
import { initialScreen, screenReducer } from './screens';

describe('screenReducer', () => {
  it('walks start -> play -> fact -> play -> summary -> start', () => {
    let s = screenReducer(initialScreen, { type: 'play' });
    expect(s.name).toBe('play');
    s = screenReducer(s, { type: 'answered' });
    expect(s.name).toBe('fact');
    s = screenReducer(s, { type: 'continue' });
    expect(s.name).toBe('play');
    s = screenReducer(s, { type: 'roundDone' });
    expect(s.name).toBe('summary');
    s = screenReducer(s, { type: 'home' });
    expect(s).toEqual(initialScreen);
  });

  it('ignores transitions that do not apply', () => {
    expect(screenReducer(initialScreen, { type: 'continue' })).toBe(initialScreen);
  });
});
