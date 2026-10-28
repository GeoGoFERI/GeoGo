import type { ReactElement } from 'react';
import { sl } from '../i18n/sl';

export type PromptBannerProps = {
  label: string;
  name: string;
  flagUrl?: string;
  detail?: string;
  lines?: { label: string; value?: string }[];
  onReadAloud?: () => void;
  index: number;
  total: number;
  onHome: () => void;
};

export function PromptBanner({
  label,
  name,
  flagUrl,
  detail,
  lines,
  onReadAloud,
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
        {name && (
          <span className="banner__name">
            {flagUrl && (
              <img className="flag" src={flagUrl} alt={sl.flagOf(name)} width={36} height={36} />
            )}
            <span data-testid="prompt-name">{name}</span>
          </span>
        )}
        {lines && (
          <ul className="banner__riddle" data-testid="riddle">
            {lines.map((line) => (
              <li key={line.label}>
                {line.value ? (
                  <>
                    <strong>{line.label}:</strong> {line.value}
                  </>
                ) : (
                  <strong>{line.label}</strong>
                )}
              </li>
            ))}
          </ul>
        )}
        {detail && <span className="banner__detail">{detail}</span>}
        {onReadAloud && (
          <button type="button" className="btn btn--plain banner__speak" onClick={onReadAloud}>
            <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
              <path
                d="M4 9h4l5-4v14l-5-4H4z"
                fill="var(--geogo-yellow)"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinejoin="round"
              />
              <path
                d="M16 9c1.5 1.5 1.5 4.5 0 6M18.5 6.5c3 3 3 8 0 11"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
            {sl.readAloud}
          </button>
        )}
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
