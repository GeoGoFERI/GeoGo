import type { Question } from '../core/round';
import type { GameData } from '../data/gameData';
import { flagUrl } from '../data/flags';
import { sl } from '../i18n/sl';

// What the sticky banner shows for a question.
export interface PromptContent {
  label: string;
  name: string;
  flagUrl?: string;
  detail?: string;
}

// "Najdi: Slovenija" with the flag, or "V kateri polobli leži Brazilija?
export function promptFor(question: Question, data: GameData): PromptContent {
  const named = data.nameOf(question.promptId);
  const name = named?.nameSl ?? '';
  if (question.mode === 'hemisphere') {
    const ns = question.choiceIds?.includes('hemisphere-severna') ?? false;
    return {
      label: sl.hemisphereAsk(named?.plural ?? false),
      name: `${name}?`,
      detail: ns ? sl.hemisphereDetail.ns : sl.hemisphereDetail.ew,
    };
  }
  const item = data.itemById.get(question.promptId);
  const flag = item?.kind === 'country' ? flagUrl(item.flag) : undefined;
  return { label: sl.find, name, ...(flag ? { flagUrl: flag } : {}) };
}
