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

  it('tell apart countries with the same coast, neighbours and part of Europe', () => {
    // Vatikan and San Marino are both landlocked with only Italy around them; Ciper and Malta
    // are both islands in Južna Evropa. An extra clue tells each pair apart.
    for (const id of ['country-va', 'country-sm', 'country-cy', 'country-mt']) {
      const riddle = riddles.get(id);
      if (!riddle) throw new Error(`no riddle for ${id}`);
      expect(riddleText(riddle)).toContain('Namig:');
    }
  });

  it('give every riddle a single answer', () => {
    const texts = [...riddles.values()].map(riddleText);
    expect(new Set(texts).size).toBe(texts.length);
    // Most countries still have one.
    expect(riddles.size).toBeGreaterThan(40);
  });
});
