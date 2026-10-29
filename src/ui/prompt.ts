import type { Question } from '../core/round';
import type { GameData } from '../data/gameData';
import { flagUrl } from '../data/flags';
import { sl } from '../i18n/sl';
import { riddlesFor } from './riddleContent';
import { parsePointId } from '../core/grid';

// What the sticky banner shows for a question.
export interface PromptContent {
  label: string;
  name: string;
  flagUrl?: string;
  detail?: string;
  // Riddle lines shown instead of the name in the "fact to country" mode.
  lines?: { label: string; value?: string }[];
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
  if (question.mode === 'coords') {
    const p = parsePointId(question.promptId);
    const lines = p ? [{ label: sl.fromEquator(p.lat) }, { label: sl.fromMeridian(p.lon) }] : [];
    return { label: sl.findPoint, name: '', lines };
  }
  if (question.mode === 'fact') {
    const riddle = riddlesFor(data).get(question.promptId);
    return { label: sl.riddleAsk, name: '', lines: riddle?.lines ?? [] };
  }
  const item = data.itemById.get(question.promptId);
  const flag = item?.kind === 'country' ? flagUrl(item.flag) : undefined;
  return { label: sl.find, name, ...(flag ? { flagUrl: flag } : {}) };
}
