import { useEffect, useRef, type ReactElement } from 'react';
import type { LevelId } from '../core/item';
import type { RoundSummary } from '../core/summary';
import { sl } from '../i18n/sl';
import { StarIcon } from './icons';
import './styles/summary.css';

export type SummaryScreenProps = {
  level: LevelId;
  summary: RoundSummary;
  onAgain: () => void;
  onReplayWeak: () => void;
  onHome: () => void;
};

const ROW = 5;

export function SummaryScreen({
  level,
  summary,
  onAgain,
  onReplayWeak,
  onHome,
}: SummaryScreenProps): ReactElement {
  const titleRef = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    titleRef.current?.focus();
  }, []);

  const filled = summary.maxStars === 0 ? 0 : Math.round((summary.stars / summary.maxStars) * ROW);
  const groups = summary.practiceGroups.map((g) => sl.groups[g] ?? g).join(', ');

  return (
    <section className="summary">
      <h1 ref={titleRef} tabIndex={-1}>
        {sl.summaryTitle}
      </h1>
      <div
        className="summary__stars"
        role="img"
        aria-label={sl.starsOf(summary.stars, summary.maxStars)}
      >
        {Array.from({ length: ROW }, (_, i) => (
          <StarIcon key={i} size={52} filled={i < filled} />
        ))}
      </div>
      <p className="summary__count">{sl.starsOf(summary.stars, summary.maxStars)}</p>
      <p className="summary__headline" data-testid="summary-headline">
        {sl.headlines[level][summary.headline]}
      </p>
      {groups && <p className="summary__practice">{sl.practice(groups)}</p>}
      <div className="summary__actions">
        <button type="button" className="btn btn--accent btn--big" onClick={onAgain}>
          {sl.again}
        </button>
        {summary.weakItemIds.length > 0 && (
          <button type="button" className="btn" onClick={onReplayWeak}>
            {sl.replayWeak}
          </button>
        )}
        <button type="button" className="btn btn--plain" onClick={onHome}>
          {sl.home}
        </button>
      </div>
    </section>
  );
}
