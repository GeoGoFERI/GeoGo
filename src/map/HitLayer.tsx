import type { ReactElement } from 'react';
import { DOT_RADIUS_PX, HIT_RADIUS_PX, type HitTarget } from './hitAreas';
import type { ShapeState } from './types';

export interface HitLayerProps {
  targets: readonly HitTarget[];
  states: Readonly<Record<string, ShapeState>>;
  onSelect: (id: string) => void;
}

// Dots and invisible tap circles for tiny places.
export function HitLayer({ targets, states, onSelect }: HitLayerProps): ReactElement {
  return (
    <g className="map__hits">
      {targets.map((t) => {
        const state = states[t.id];
        return (
          <g key={t.id} data-hit-size={t.sizePx}>
            <circle
              className={`hit-dot${state ? ` shape--${state}` : ''}`}
              cx={t.center[0]}
              cy={t.center[1]}
              r={DOT_RADIUS_PX}
              aria-hidden="true"
            />
            <circle
              className="hit-area"
              data-hit-id={t.id}
              cx={t.center[0]}
              cy={t.center[1]}
              r={HIT_RADIUS_PX}
              aria-hidden="true"
              onClick={() => onSelect(t.id)}
            />
          </g>
        );
      })}
    </g>
  );
}
