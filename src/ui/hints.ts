import type { Item } from '../core/item';
import type { GameData } from '../data/gameData';
import { sl } from '../i18n/sl';

export type NeighbourHint = { text: string; highlightId?: string };

export function neighbourHint(item: Item, data: GameData): NeighbourHint {
  const neighbourId = data.countryFact(item.id)?.neighbours[0];
  const neighbourName = neighbourId ? data.nameOf(neighbourId)?.nameSl : undefined;
  if (neighbourId && neighbourName)
    return { text: sl.hintNeighbour(neighbourName), highlightId: neighbourId };
  const group = item.group ? sl.groups[item.group] : undefined;
  return { text: group ? sl.hintGroup(group) : sl.hintZoom };
}
