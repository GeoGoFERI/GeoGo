import { describe, expect, it } from 'vitest';
import { buildGameData } from '../data/gameData';
import { testSources } from '../data/testSources';
import { riddleText, riddlesFor } from './riddleContent';

const data = buildGameData(testSources);
const riddles = riddlesFor(data);

describe('riddles', () => {
  it('describe Slovenia by its coast, neighbours and part of Europe, without its name', () => {
    const riddle = riddles.get('country-si');
    if (!riddle) throw new Error('no riddle for Slovenia');
    const text = riddleText(riddle);
    expect(text).toBe(
      'Obmorska država. Sosednje države: Avstrija, Hrvaška, Italija, Madžarska. Del Evrope: Srednja Evropa.',
    );
    expect(text).not.toContain('Slovenija');
  });

  it('leave out countries whose riddle would fit another country too', () => {
    // Vatikan and San Marino are both landlocked with only Italy around them.
    expect(riddles.has('country-va')).toBe(false);
    expect(riddles.has('country-sm')).toBe(false);
    const texts = [...riddles.values()].map(riddleText);
    expect(new Set(texts).size).toBe(texts.length);
    // Most countries still have one.
    expect(riddles.size).toBeGreaterThan(40);
  });
});
