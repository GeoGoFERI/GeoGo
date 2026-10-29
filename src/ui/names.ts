import { parsePointId } from '../core/grid';
import type { GameData, PlaceName } from '../data/gameData';
import { sl } from '../i18n/sl';

// The name of anything clickable, including grid points ("točka 30° severno od ekvatorja, ...").
export function displayName(id: string, data: GameData): PlaceName | undefined {
  const point = parsePointId(id);
  if (point) {
    return {
      nameSl: sl.pointName(sl.fromEquator(point.lat), sl.fromMeridian(point.lon)),
      plural: false,
    };
  }
  return data.nameOf(id);
}
