import type { Item } from '../core/item';
import type { Question } from '../core/round';
import { parsePointId } from '../core/grid';
import type { GameData } from '../data/gameData';
import { flagUrl } from '../data/flags';
import { sl } from '../i18n/sl';

export type FactContent = {
  title: string;
  flagUrl?: string;
  lines: { label: string; value?: string }[];
  text?: string;
};

export const pointFactContent = (question: Question, data: GameData): FactContent => {
  const p = parsePointId(question.promptId);
  if (!p) return { title: sl.point, lines: [] };
  const hereId = data.placeAt([p.lon, p.lat]);
  const here = hereId ? data.nameOf(hereId)?.nameSl : undefined;
  return {
    title: sl.point,
    lines: [
      { label: sl.fromEquator(p.lat) },
      { label: sl.fromMeridian(p.lon) },
      { label: sl.hereIs, value: here ?? sl.hereIsSea },
    ],
  };
};

export const factContent = (item: Item, data: GameData, question?: Question): FactContent => {
  const content: FactContent = { title: item.nameSl, lines: [] };
  if (question?.mode === 'hemisphere') {
    const country = data.nameOf(question.promptId)?.nameSl;
    if (country) content.lines.push({ label: sl.country, value: country });
  }
  if (item.kind === 'country') {
    const flag = flagUrl(item.flag);
    if (flag) content.flagUrl = flag;
    const fact = data.countryFact(item.id);
    content.lines.push({ label: item.coastal ? sl.coastal : sl.landlocked });
    if (fact) {
      const names = fact.neighbours.flatMap((id) => {
        const n = data.nameOf(id);
        return n ? [n.nameSl] : [];
      });
      content.lines.push(
        names.length > 0
          ? { label: sl.neighbours, value: names.join(', ') }
          : { label: sl.noNeighbours },
      );
    }
  }
  if (item.fact) content.text = item.fact.textSl;
  return content;
};
