import type { Item } from '../core/item';
import type { CountryFact } from './gameData';

export type Riddle = { lines: { label: string; value?: string }[] };

export type RiddleLabels = {
  coastal: string;
  landlocked: string;
  neighbours: string;
  noNeighbours: string;
  part: string;
};

export const buildRiddles = (
  items: readonly Item[],
  factOf: (id: string) => CountryFact | undefined,
  nameOf: (id: string) => string | undefined,
  groupName: (group: string) => string,
  labels: RiddleLabels,
): Map<string, Riddle> => {
  const candidates = new Map<string, { riddle: Riddle; signature: string }>();
  for (const item of items) {
    if (item.kind !== 'country') continue;
    const fact = factOf(item.id);
    if (!fact) continue;
    const names = fact.neighbours.flatMap((id) => nameOf(id) ?? []);
    const lines: Riddle['lines'] = [
      { label: fact.coastal ? labels.coastal : labels.landlocked },
      names.length > 0
        ? { label: labels.neighbours, value: names.join(', ') }
        : { label: labels.noNeighbours },
    ];
    if (item.group) lines.push({ label: labels.part, value: groupName(item.group) });
    candidates.set(item.id, { riddle: { lines }, signature: JSON.stringify(lines) });
  }
  const count = new Map<string, number>();
  for (const { signature } of candidates.values())
    count.set(signature, (count.get(signature) ?? 0) + 1);
  return new Map(
    [...candidates]
      .filter(([, c]) => count.get(c.signature) === 1)
      .map(([id, c]) => [id, c.riddle]),
  );
};
