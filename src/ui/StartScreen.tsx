import type { ReactElement } from 'react';
import type { LevelId } from '../core/item';
import { sl } from '../i18n/sl';
import { LevelIcon, StarIcon } from './icons';
import type { PlayMode } from './newRound';
import logoUrl from './assets/logo.webp';
import './styles/start.css';

export type LevelCardInfo = {
  level: LevelId;
  available: boolean;
  mastered: number;
  total: number;
};

export type StartScreenProps = {
  levels: readonly LevelCardInfo[];
  selected: LevelId;
  onSelect: (level: LevelId) => void;
  onStart: () => void;
  onAtlas: () => void;
  mode: PlayMode;
  onMode: (mode: PlayMode) => void;
  status?: string;
};

export const StartScreen = ({
  levels,
  selected,
  onSelect,
  onStart,
  onAtlas,
  mode,
  onMode,
  status,
}: StartScreenProps): ReactElement => {
  const selectedInfo = levels.find((l) => l.level === selected);
  const canStart = status === undefined && selectedInfo?.available === true;
  return (
    <section className="start">
      <img className="start__logo" src={logoUrl} alt={sl.appName} width={480} height={445} />
      <h1 className="start__title">{sl.chooseLevel}</h1>
      <ul className="start__levels">
        {levels.map((info) => (
          <li key={info.level}>
            <button
              type="button"
              className="level-card"
              aria-pressed={info.level === selected}
              disabled={!info.available}
              onClick={() => onSelect(info.level)}
            >
              <LevelIcon level={info.level} size={48} />
              <span className="level-card__name">{sl.levels[info.level]}</span>
              <span className="level-card__meta">
                {info.available ? (
                  <>
                    <StarIcon size={18} filled={info.mastered > 0} />
                    {sl.levelProgress(info.mastered, info.total)}
                  </>
                ) : (
                  sl.soon
                )}
              </span>
            </button>
          </li>
        ))}
      </ul>
      {selected === 3 && selectedInfo?.available && (
        <div className="start__modes" role="group" aria-label={sl.modeLabel}>
          {(['find', 'fact', 'coast'] as const).map((m) => (
            <button
              key={m}
              type="button"
              className="btn btn--plain mode-btn"
              aria-pressed={mode === m}
              onClick={() => onMode(m)}
            >
              {sl.modes[m]}
            </button>
          ))}
        </div>
      )}
      {status && (
        <p className="start__status" role="status">
          {status}
        </p>
      )}
      <div className="start__actions">
        <button
          type="button"
          className="btn btn--accent btn--big"
          onClick={onStart}
          disabled={!canStart}
        >
          {sl.start}
        </button>
        <button
          type="button"
          className="btn btn--plain"
          onClick={onAtlas}
          disabled={status !== undefined}
        >
          {sl.atlas}
        </button>
      </div>
    </section>
  );
};
