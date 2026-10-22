import type { Item } from './item';

export function makeItems(count: number, prefix = 'country'): Item[] {
  return Array.from({ length: count }, (_, i) => ({
    id: `${prefix}-${String(i)}`,
    levels: [3],
    kind: 'country',
    nameSl: `Država ${String(i)}`,
    geo: String(i),
    region: 'europe',
    curriculum: 'Evropa > Države Evrope',
  }));
}
