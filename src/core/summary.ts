import type { Item } from './item';
import type { QuestionResult } from './question';

export type Headline = 'excellent' | 'good' | 'practice';

export type RoundSummary = {
  stars: number;
  maxStars: number;
  headline: Headline;
  practiceGroups: readonly string[];
  weakItemIds: readonly string[];
  perfect: number;
};

const EXCELLENT = 0.85;
const GOOD = 0.6;
const GROUP_THRESHOLD = 2;

export function buildSummary(
  results: readonly QuestionResult[],
  items: ReadonlyMap<string, Item>,
): RoundSummary {
  const stars = results.reduce((sum, r) => sum + r.stars, 0);
  const maxStars = results.length * 3;
  const share = maxStars === 0 ? 0 : stars / maxStars;
  const headline: Headline = share >= EXCELLENT ? 'excellent' : share >= GOOD ? 'good' : 'practice';

  const missedByGroup = new Map<string, number>();
  for (const r of results) {
    const group = items.get(r.itemId)?.group;
    if (!group || r.stars === 3) continue;
    missedByGroup.set(group, (missedByGroup.get(group) ?? 0) + (3 - r.stars));
  }
  const practiceGroups = [...missedByGroup.entries()]
    .filter(([, missed]) => missed >= GROUP_THRESHOLD)
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, 2)
    .map(([group]) => group);

  // An item can appear twice in a level 2 round (hemisphere questions); list it once.
  const weakItemIds = [...new Set(results.filter((r) => r.stars < 3).map((r) => r.itemId))];

  return {
    stars,
    maxStars,
    headline,
    practiceGroups,
    weakItemIds,
    perfect: results.filter((r) => r.stars === 3).length,
  };
}
