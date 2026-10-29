import { describe, expect, it } from 'vitest';
import css from './styles/tokens.css?raw';

// Every text/background pair the UI uses, checked against WCAG 2.1 (4.5:1 for body text).
// Colours are read from tokens.css, so a token change is checked automatically.
const token = (name: string): string => {
  const match = new RegExp(`--${name}:\\s*(#[0-9a-fA-F]{6})`).exec(css);
  if (!match?.[1]) throw new Error(`token ${name} missing`);
  return match[1];
};

const luminance = (hex: string): number => {
  const channel = (i: number): number => {
    const c = parseInt(hex.slice(1 + i * 2, 3 + i * 2), 16) / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * channel(0) + 0.7152 * channel(1) + 0.0722 * channel(2);
};

const contrast = (a: string, b: string): number => {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x) as [number, number];
  return (hi + 0.05) / (lo + 0.05);
};

// [text, background, where it is used]
const PAIRS: [string, string, string][] = [
  ['geogo-navy', 'geogo-paper', 'body text, cards, plain buttons'],
  ['geogo-navy', 'geogo-sky', 'primary buttons, prompt banner'],
  ['geogo-navy', 'geogo-green', 'correct toast, praise, coast answer'],
  ['geogo-navy', 'geogo-yellow', 'hint toast, selected cards, hover'],
  ['geogo-navy', 'geogo-orange', 'wrong toast, accent buttons'],
  ['geogo-navy', 'geogo-orange-deep', 'accent button hover'],
  ['geogo-navy', 'map-ocean', 'map labels over the sea'],
  ['geogo-navy', 'map-land', 'map labels over land'],
  ['geogo-paper', 'geogo-navy', 'white text on navy'],
];

describe('colour contrast', () => {
  for (const [fg, bg, where] of PAIRS) {
    it(`${fg} on ${bg} (${where}) is at least 4.5:1`, () => {
      expect(contrast(token(fg), token(bg))).toBeGreaterThanOrEqual(4.5);
    });
  }

  it('documents the pairs that fail and are therefore never used for text', () => {
    // White on sky fails. Navy on ocean is just under 4.5, so the ocean
    // colour is used for map fills and pressed borders only, never behind text.
    expect(contrast(token('geogo-paper'), token('geogo-sky'))).toBeLessThan(4.5);
    expect(contrast(token('geogo-navy'), token('geogo-ocean'))).toBeLessThan(4.5);
  });
});
