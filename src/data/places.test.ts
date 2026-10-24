import { describe, expect, it } from 'vitest';
import { PLACES } from './places';
import { EUROPE_ROWS } from './countriesEurope';

describe('place table', () => {
  it('has tidy Slovenian names and valid codes', () => {
    for (const row of PLACES) {
      expect(row.nameSl, row.geo).toBe(row.nameSl.trim());
      expect(row.nameSl, row.geo).not.toMatch(/\s{2}/);
      expect(row.a2, row.geo).toMatch(/^[A-Z]{2}$/);
    }
  });

  it('uses each alpha-2 code once', () => {
    expect(new Set(PLACES.map((r) => r.a2)).size).toBe(PLACES.length);
  });

  it('counts only sovereign countries (and Kosovo) as Europe', () => {
    for (const row of EUROPE_ROWS) expect(row.status).toBe('country');
    expect(PLACES.filter((r) => r.europe)).toHaveLength(EUROPE_ROWS.length);
  });

  it('keeps the Caucasus and Kazakhstan out of Europe', () => {
    const europe = new Set(EUROPE_ROWS.map((r) => r.a2));
    for (const code of ['GE', 'AM', 'AZ', 'KZ']) expect(europe.has(code)).toBe(false);
    for (const code of ['RU', 'TR', 'CY', 'XK', 'VA', 'SM', 'MC', 'LI', 'AD', 'MT']) {
      expect(europe.has(code)).toBe(true);
    }
  });
});
