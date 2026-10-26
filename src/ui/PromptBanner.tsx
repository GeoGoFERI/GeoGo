import type { ReactElement } from 'react';
import { sl } from '../i18n/sl';

export type PromptBannerProps = {
  label: string;
  name: string;
  flagUrl?: string;
  detail?: string;
  index: number;
  total: number;
  onHome: () => void;
};

export function PromptBanner({
  label,
  name,
  flagUrl,
  detail,
  index,
  total,
  onHome,
}: PromptBannerProps): ReactElement {
  return (
    <div className="banner">
      <button
        type="button"
        className="btn btn--plain btn--round banner__home"
        onClick={onHome}
        aria-label={sl.home}
      >
        <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true">
          <path
            d="M4 11l8-7 8 7v9h-5v-6H9v6H4z"
            fill="var(--geogo-yellow)"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinejoin="round"
          />
        </svg>
      </button>
      <div className="banner__prompt" aria-live="polite">
        <span className="banner__label">{label}</span>
        <span className="banner__name">
          {flagUrl && (
            <img className="flag" src={flagUrl} alt={sl.flagOf(name)} width={36} height={36} />
          )}
          <span data-testid="prompt-name">{name}</span>
        </span>
        {detail && <span className="banner__detail">{detail}</span>}
      </div>
      <ol className="banner__dots" aria-label={sl.questionOf(index + 1, total)}>
        {Array.from({ length: total }, (_, i) => (
          <li
            key={i}
            className={`dot${i < index ? ' dot--done' : ''}${i === index ? ' dot--current' : ''}`}
            aria-hidden="true"
          />
        ))}
      </ol>
    </div>
  );
}
