import { describe, expect, it } from 'vitest';
import { buildGameData } from './gameData';
import { testSources } from './testSources';
import { factSchema, itemsInLevel } from '../core/item';
import { FACTS } from './facts';

const data = buildGameData(testSources);

describe('hand-written facts', () => {
  it('cover every Level 1 and Level 4 item', () => {
    for (const level of [1, 4] as const) {
      for (const item of itemsInLevel(data.items, level)) expect(item.fact, item.id).toBeDefined();
    }
  });

  it('are valid, sourced, unreviewed, short and free of numbers', () => {
    for (const [id, fact] of Object.entries(FACTS)) {
      expect(factSchema.safeParse(fact).success, id).toBe(true);
      expect(fact.source.length, id).toBeGreaterThan(10);
      expect(fact.reviewed, id).toBe(false);
      // One or two sentences.
      const sentences = fact.textSl.split(/[.!?](\s|$)/).filter((s) => s.trim().length > 0);
      expect(sentences.length, id).toBeLessThanOrEqual(2);
      expect(fact.textSl, id).not.toMatch(/\d/);
    }
  });

  it('belong to items that exist', () => {
    for (const id of Object.keys(FACTS)) expect(data.itemById.has(id), id).toBe(true);
  });
});
