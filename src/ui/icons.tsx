import type { ReactElement } from 'react';
import type { LevelId } from '../core/item';

// Small inline icons in the logo style: flat fills and navy outlines. All decorative.

const stroke = { stroke: 'var(--geogo-navy)', strokeWidth: 2.5, strokeLinejoin: 'round' as const };

export const StarIcon = ({
  filled = true,
  size = 24,
}: {
  filled?: boolean;
  size?: number;
}): ReactElement => {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden="true">
      <path
        d="M12 2.8l2.7 5.6 6.1.8-4.5 4.2 1.1 6.1L12 16.6l-5.4 2.9 1.1-6.1-4.5-4.2 6.1-.8z"
        fill={filled ? 'var(--geogo-yellow)' : 'var(--geogo-paper)'}
        {...stroke}
        strokeWidth={2}
      />
    </svg>
  );
};

export const CheckIcon = ({ size = 28 }: { size?: number }): ReactElement => {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden="true">
      <circle cx="12" cy="12" r="10" fill="var(--geogo-green)" {...stroke} strokeWidth={2} />
      <path
        d="M7 12.5l3.2 3.2L17 9"
        fill="none"
        {...stroke}
        strokeWidth={2.8}
        strokeLinecap="round"
      />
    </svg>
  );
};

export const CrossIcon = ({ size = 28 }: { size?: number }): ReactElement => {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden="true">
      <circle cx="12" cy="12" r="10" fill="var(--geogo-orange)" {...stroke} strokeWidth={2} />
      <path
        d="M8.5 8.5l7 7M15.5 8.5l-7 7"
        fill="none"
        {...stroke}
        strokeWidth={2.8}
        strokeLinecap="round"
      />
    </svg>
  );
};

export const BulbIcon = ({ size = 28 }: { size?: number }): ReactElement => {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden="true">
      <path
        d="M12 3a6 6 0 0 0-3.5 10.9V16h7v-2.1A6 6 0 0 0 12 3z"
        fill="var(--geogo-yellow)"
        {...stroke}
        strokeWidth={2}
      />
      <path d="M9.5 19h5M10.5 21.5h3" {...stroke} strokeWidth={2} strokeLinecap="round" />
    </svg>
  );
};

export const LevelIcon = ({
  level,
  size = 56,
}: {
  level: LevelId;
  size?: number;
}): ReactElement => {
  const s = { ...stroke, strokeWidth: 2.2 };
  const body: Record<LevelId, ReactElement> = {
    1: (
      <>
        <circle cx="24" cy="24" r="19" fill="var(--geogo-sky)" {...s} />
        <path
          d="M12 16c4-3 8 0 7 4s-6 3-5 8-3 3-4-1 0-8 2-11zM27 10c4 0 9 3 9 8s-5 4-7 8-1 9-4 9-2-7-3-10 1-5 3-7 0-8 2-8z"
          fill="var(--geogo-green)"
          {...s}
        />
      </>
    ),
    2: (
      <>
        <circle cx="24" cy="24" r="19" fill="var(--geogo-paper)" {...s} />
        <path d="M5 24h38M24 5v38" {...s} stroke="var(--geogo-orange-deep)" strokeWidth={3} />
        <circle cx="24" cy="24" r="4" fill="var(--geogo-yellow)" {...s} />
      </>
    ),
    3: (
      <>
        <path d="M12 6v37" {...s} strokeWidth={3} strokeLinecap="round" />
        <path d="M13 8h24l-5 7 5 7H13z" fill="var(--geogo-orange)" {...s} />
      </>
    ),
    4: (
      <>
        <path d="M3 41l13-22 8 12 6-9 15 19z" fill="var(--geogo-green)" {...s} />
        <path d="M16 19l-3.5 6 3.5-2 3 2z" fill="var(--geogo-paper)" {...s} strokeWidth={1.5} />
        <circle cx="36" cy="11" r="5" fill="var(--geogo-yellow)" {...s} />
      </>
    ),
    5: (
      <>
        <circle cx="24" cy="24" r="19" fill="var(--geogo-sky)" {...s} />
        <path
          d="M9 22c3-6 9-6 10-1s-3 9-6 9-6-3-4-8zM26 12c6-1 12 4 11 10s-7 11-11 9 1-6-2-10 -3-8 2-9z"
          fill="var(--geogo-yellow)"
          {...s}
        />
      </>
    ),
  };
  return (
    <svg viewBox="0 0 48 48" width={size} height={size} aria-hidden="true">
      {body[level]}
    </svg>
  );
};
