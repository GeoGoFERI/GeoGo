import type { Item } from '../core/item';
import type { CountryFact } from './gameData';

export type Riddle = { lines: { label: string; value?: string }[] };

export type RiddleLabels = {
  coastal: string;
  landlocked: string;
  neighbours: string;
  noNeighbours: string;
  part: string;
  clue: string;
};

// Extra clues for countries whose coast, neighbours and part of Europe match another country's.
export const EXTRA_CLUES: Readonly<Record<string, string>> = {
  'country-cy': 'otok na vzhodu Sredozemskega morja, blizu Azije',
  'country-mt': 'majhni otoki južno od Sicilije',
  'country-va': 'najmanjša država na svetu, leži sredi Rima',
  'country-sm': 'majhna država v gorah na vzhodu Apeninskega polotoka',
};

export const buildRiddles = (
  items: readonly Item[],
  factOf: (id: string) => CountryFact | undefined,
  nameOf: (id: string) => string | undefined,
  groupName: (group: string) => string,
  labels: RiddleLabels,
  extraClues: Readonly<Record<string, string>> = EXTRA_CLUES,
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
  const countSignatures = (): Map<string, number> => {
    const count = new Map<string, number>();
    for (const { signature } of candidates.values())
      count.set(signature, (count.get(signature) ?? 0) + 1);
    return count;
  };
  // Countries that share a riddle get their extra clue, if they have one.
  const shared = countSignatures();
  for (const [id, c] of candidates) {
    const extra = extraClues[id];
    if (shared.get(c.signature) === 1 || !extra) continue;
    const lines = [...c.riddle.lines, { label: labels.clue, value: extra }];
    candidates.set(id, { riddle: { lines }, signature: JSON.stringify(lines) });
  }
  // Whatever still fits more than one country is left out.
  const count = countSignatures();
  return new Map(
    [...candidates]
      .filter(([, c]) => count.get(c.signature) === 1)
      .map(([id, c]) => [id, c.riddle]),
  );
};
