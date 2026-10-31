import { useMemo, useState, type ReactElement } from 'react';
import { isMastered } from '../core/leitner';
import { LEVELS } from '../core/levels';
import type { Progress } from '../core/progress';
import type { GameData } from '../data/gameData';
import { MapView } from '../map/MapView';
import type { MapShape, ShapeState } from '../map/types';
import { sl } from '../i18n/sl';
import { CheckIcon } from './icons';
import { Sticker } from './Sticker';
import { levelItems } from './newRound';
import './styles/atlas.css';

export interface AtlasScreenProps {
  data: GameData;
  progress: Progress;
  onBack: () => void;
}

// mastered items that are not countries, as map layers: seas and oceans under the countries,
// rivers, ranges, peninsulas, islands, lowlands and the equator and prime meridian on top
const masteredLayers = (
  data: GameData,
  progress: Progress,
): { under: MapShape[]; over: MapShape[] } => {
  const under: MapShape[] = [];
  const over: MapShape[] = [];
  for (const item of data.items) {
    if (!isMastered(progress.items[item.id])) continue;
    if (['country', 'continent', 'hemisphere', 'pole'].includes(item.kind)) continue;
    const feature = data.featureOf(item.id);
    if (!feature) continue;
    if (item.kind === 'ocean' || item.kind === 'sea') {
      under.push({ id: item.id, kind: 'area', feature, interactive: true, variant: 'water' });
    } else if (item.kind === 'river' || item.kind === 'line') {
      over.push({
        id: item.id,
        kind: 'line',
        feature,
        interactive: true,
        variant: 'wide',
        tone: item.kind === 'river' ? 'river' : 'orange',
      });
    } else {
      over.push({
        id: item.id,
        kind: 'area',
        feature,
        interactive: true,
        tone: item.kind === 'mountain' ? 'mountain' : 'land',
      });
    }
  }
  return { under, over };
};

// "Moj atlas": everything already mastered is green, so the world fills in over time
export const AtlasScreen = ({ data, progress, onBack }: AtlasScreenProps): ReactElement => {
  const [picked, setPicked] = useState<string | undefined>(undefined);

  const shapes = useMemo(() => {
    const { under, over } = masteredLayers(data, progress);
    return [...under, ...data.countryShapes, ...over];
  }, [data, progress]);
  const states = useMemo(() => {
    const s: Record<string, ShapeState> = {};
    for (const [id, stats] of Object.entries(progress.items))
      if (isMastered(stats)) s[id] = 'mastered';
    if (picked) s[picked] = 'hint';
    return s;
  }, [progress, picked]);

  const counts = LEVELS.filter((l) => !l.stretch).flatMap((l) => {
    const items = levelItems(data, l.id);
    if (items.length === 0) return [];
    const mastered = items.filter((i) => isMastered(progress.items[i.id])).length;
    return [{ level: l.id, mastered, total: items.length }];
  });

  // In the atlas, names may be shown: there is nothing to give away.
  const shapeLabel = (id: string): string => data.nameOf(id)?.nameSl ?? sl.mapShape;
  const pickedName = picked ? data.nameOf(picked) : undefined;
  // The picked shape is highlighted, which hides its green; the check mark keeps that signal.
  const pickedMastered = picked !== undefined && isMastered(progress.items[picked]);

  return (
    <section className="atlas">
      <div className="atlas__head">
        <h1>{sl.atlasTitle}</h1>
        <p>{sl.atlasIntro}</p>
      </div>
      <div className="atlas__map">
        <MapView
          shapes={shapes}
          states={states}
          onSelect={setPicked}
          labels={sl.mapLabels}
          shapeLabel={shapeLabel}
          region="europe"
        />
        {pickedName && (
          <div className="atlas__picked" role="status">
            {pickedMastered && <CheckIcon size={24} />}
            {pickedName.nameSl}
          </div>
        )}
        <button type="button" className="btn btn--plain atlas__back" onClick={onBack}>
          {sl.back}
        </button>
      </div>
      <div className="atlas__stickers">
        <h2>{sl.stickersTitle}</h2>
        <ul className="atlas__counts">
          {counts.map((c) => (
            <li key={c.level} data-testid={`atlas-count-${String(c.level)}`}>
              {sl.atlasCount(sl.levels[c.level], c.mastered, c.total)}
            </li>
          ))}
        </ul>
        <ul className="stickers" aria-label={sl.stickersTitle}>
          {counts.map((c) => (
            <li key={c.level}>
              <Sticker level={c.level} earned={progress.stickers.includes(c.level)} />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
};
