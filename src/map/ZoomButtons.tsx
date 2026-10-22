import type { ReactElement } from 'react';

export interface ZoomButtonsProps {
  onZoomIn: () => void;
  onZoomOut: () => void;
  onReset: () => void;
  labels: { zoomIn: string; zoomOut: string; reset: string };
}

// Plus, minus and reset buttons in the map corner.
export function ZoomButtons({
  onZoomIn,
  onZoomOut,
  onReset,
  labels,
}: ZoomButtonsProps): ReactElement {
  return (
    <div className="map__zoom">
      <button
        type="button"
        className="btn btn--plain btn--round"
        onClick={onZoomIn}
        aria-label={labels.zoomIn}
      >
        <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true">
          <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
        </svg>
      </button>
      <button
        type="button"
        className="btn btn--plain btn--round"
        onClick={onZoomOut}
        aria-label={labels.zoomOut}
      >
        <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true">
          <path d="M5 12h14" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
        </svg>
      </button>
      <button
        type="button"
        className="btn btn--plain btn--round"
        onClick={onReset}
        aria-label={labels.reset}
      >
        <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true">
          <circle cx="12" cy="12" r="8" fill="none" stroke="currentColor" strokeWidth="2.5" />
          <path
            d="M4 12h16M12 4c-3 3-3 13 0 16M12 4c3 3 3 13 0 16"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          />
        </svg>
      </button>
    </div>
  );
}
