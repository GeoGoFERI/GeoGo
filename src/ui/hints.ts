import type { Question } from '../core/round';
import type { GameData } from '../data/gameData';
import { sl } from '../i18n/sl';

export type Tier2Hint = { text: string; highlightId?: string };

const PAIR_HINTS: Record<string, string> = {
  'line-ekvator': sl.hintLines,
  'hemisphere-severna': sl.hintNorthSouth,
  'hemisphere-vzhodna': sl.hintEastWest,
  'pole-severni': sl.hintPoles,
};

export function tier2Hint(question: Question, data: GameData): Tier2Hint {
  const pairHint = question.choiceIds?.[0] ? PAIR_HINTS[question.choiceIds[0]] : undefined;
  if (pairHint) return { text: pairHint };

  const item = data.itemById.get(question.promptId);
  if (!item) return { text: sl.hintZoom };
  // In the riddle mode the neighbours are already in the riddle, so tier 2 names the region.
  if (item.kind === 'country' && question.mode === 'fact') {
    const group = item.group ? sl.groups[item.group] : undefined;
    return { text: group ? sl.hintGroup(group) : sl.hintZoom };
  }
  if (item.kind === 'country') {
    const neighbourId = data.countryFact(item.id)?.neighbours[0];
    const neighbourName = neighbourId ? data.nameOf(neighbourId)?.nameSl : undefined;
    if (neighbourId && neighbourName)
      return { text: sl.hintNeighbour(neighbourName), highlightId: neighbourId };
    const group = item.group ? sl.groups[item.group] : undefined;
    return { text: group ? sl.hintGroup(group) : sl.hintZoom };
  }
  return { text: sl.itemHints[item.id] ?? sl.hintZoom };
}
