import { describe, expect, it } from 'vitest';
import { starsFor } from './stars';

describe('starsFor', () => {
  it('gives 3 stars for a first-try answer', () => {
    expect(starsFor(1, 0)).toBe(3);
  });
  it('gives 2 stars on the second try and 1 later or with hints', () => {
    expect(starsFor(2, 0)).toBe(2);
    expect(starsFor(5, 0)).toBe(1);
    expect(starsFor(1, 1)).toBe(1);
  });
});
