import { describe, expect, it } from 'vitest';
import { itemSchema, itemsInLevel, type Item } from './item';
import { LEVELS, levelById } from './levels';

const base: Item = {
  id: 'country-705',
  levels: [3],
  kind: 'country',
  nameSl: 'Slovenija',
  geo: '705',
  region: 'europe',
  flag: 'SI',
  curriculum: 'Evropa > Države Evrope',
};

describe('itemSchema', () => {
  it('accepts a valid item', () => {
    expect(itemSchema.parse(base)).toEqual(base);
  });
  it('rejects bad ids, empty levels and unknown kinds', () => {
    expect(itemSchema.safeParse({ ...base, id: 'Country 705' }).success).toBe(false);
    expect(itemSchema.safeParse({ ...base, levels: [] }).success).toBe(false);
    expect(itemSchema.safeParse({ ...base, kind: 'city' }).success).toBe(false);
  });
  it('requires a source on facts', () => {
    const fact = { textSl: 'Kratko besedilo o državi.', source: '', reviewed: false };
    expect(itemSchema.safeParse({ ...base, fact }).success).toBe(false);
  });
});

describe('levels', () => {
  it('defines five levels with unique ids', () => {
    expect(new Set(LEVELS.map((l) => l.id)).size).toBe(5);
    expect(levelById(3).region).toBe('europe');
  });
  it('filters items by level, keeping items that sit in several levels', () => {
    const atlantic: Item = { ...base, id: 'ocean-atlantski', kind: 'ocean', levels: [1, 4] };
    expect(itemsInLevel([base, atlantic], 4).map((i) => i.id)).toEqual(['ocean-atlantski']);
    expect(itemsInLevel([base, atlantic], 1).map((i) => i.id)).toEqual(['ocean-atlantski']);
  });
});
