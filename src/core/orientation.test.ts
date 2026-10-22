import { describe, expect, it } from 'vitest';
import { buildOrientationRound, type OrientationConfig } from './orientation';
import { seededRng } from './random';
import type { Item } from './item';

const item = (id: string, kind: Item['kind']): Item => ({
  id,
  levels: [2],
  kind,
  nameSl: id,
  geo: id,
  region: 'world',
  curriculum: 'Planet Zemlja > Orientacija',
});

const config: OrientationConfig = {
  items: [
    item('line-ekvator', 'line'),
    item('line-poldnevnik', 'line'),
    item('hemisphere-n', 'hemisphere'),
    item('hemisphere-s', 'hemisphere'),
    item('hemisphere-e', 'hemisphere'),
    item('hemisphere-w', 'hemisphere'),
    item('pole-n', 'pole'),
    item('pole-s', 'pole'),
  ],
  choiceSets: [
    ['line-ekvator', 'line-poldnevnik'],
    ['hemisphere-n', 'hemisphere-s'],
    ['hemisphere-e', 'hemisphere-w'],
    ['pole-n', 'pole-s'],
  ],
  hemispheres: Array.from({ length: 30 }, (_, i) => ({
    countryId: `country-${String(i)}`,
    ns: i % 2 ? 'hemisphere-n' : 'hemisphere-s',
    ...(i % 3 ? { ew: 'hemisphere-e' } : {}),
  })),
};

describe('buildOrientationRound', () => {
  it('mixes find and hemisphere questions, up to 10, with choice pairs', () => {
    const round = buildOrientationRound(config, {}, 0, seededRng(3));
    expect(round).toHaveLength(10);
    expect(round.filter((q) => q.mode === 'find')).toHaveLength(5);
    for (const q of round) {
      expect(q.choiceIds).toBeDefined();
      expect(q.choiceIds).toContain(q.acceptIds[0]);
    }
    const hemi = round.filter((q) => q.mode === 'hemisphere');
    expect(hemi.length).toBeGreaterThan(0);
    // A country is never asked twice.
    expect(new Set(hemi.map((q) => q.promptId)).size).toBe(hemi.length);
    expect(new Set(round.map((q) => q.id)).size).toBe(round.length);
  });
});
