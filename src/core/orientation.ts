import type { Item } from './item';
import { findQuestion, pickItems, ROUND_SIZE, type Question, type StatsLookup } from './round';
import { itemWeight } from './leitner';
import { shuffle, weightedSample, type Rng } from './random';

export type HemisphereFact = {
  countryId: string;
  ns?: string;
  ew?: string;
};

export type OrientationConfig = {
  items: readonly Item[];
  choiceSets: readonly (readonly string[])[];
  hemispheres: readonly HemisphereFact[];
};

const MAX_FIND = 5;

export function buildOrientationRound(
  config: OrientationConfig,
  stats: StatsLookup,
  roundsPlayed: number,
  rng: Rng,
  size = ROUND_SIZE,
): Question[] {
  const choicesFor = (id: string): readonly string[] | undefined =>
    config.choiceSets.find((set) => set.includes(id));

  const finds = pickItems(config.items, stats, roundsPlayed, Math.min(MAX_FIND, size), rng).map(
    (item) => findQuestion(item, choicesFor(item.id)),
  );

  // Every (country, axis) pair is a candidate; weight it by the hemisphere item's progress.
  type Candidate = { countryId: string; answer: string };
  const candidates: Candidate[] = config.hemispheres.flatMap((h) => [
    ...(h.ns ? [{ countryId: h.countryId, answer: h.ns }] : []),
    ...(h.ew ? [{ countryId: h.countryId, answer: h.ew }] : []),
  ]);
  // Order every candidate by weighted draw, then take them until the round is full.
  const ordered = weightedSample(
    candidates,
    (c) => itemWeight(stats[c.answer], roundsPlayed),
    candidates.length,
    rng,
  );
  // No country twice in a round, even on the other axis.
  const seen = new Set<string>();
  const hemisphereQuestions: Question[] = [];
  for (const c of ordered) {
    if (finds.length + hemisphereQuestions.length >= size) break;
    if (seen.has(c.countryId)) continue;
    seen.add(c.countryId);
    const choiceIds = choicesFor(c.answer);
    hemisphereQuestions.push({
      id: `hemisphere:${c.countryId}:${c.answer}`,
      mode: 'hemisphere',
      itemId: c.answer,
      promptId: c.countryId,
      acceptIds: [c.answer],
      ...(choiceIds ? { choiceIds } : {}),
    });
  }
  return shuffle([...finds, ...hemisphereQuestions], rng);
}
