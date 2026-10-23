import type { MouseEvent, ReactElement } from 'react';
import { DOT_RADIUS_PX, HIT_RADIUS_PX, INNER_RADIUS_PX, type HitTarget } from './hitAreas';
import type { ShapeState } from './types';

export interface HitLayerProps {
  targets: readonly HitTarget[];
  states: Readonly<Record<string, ShapeState>>;
  onSelect: (id: string) => void;
}

// Dots and invisible tap circles for tiny places.
export function HitLayer({ targets, states, onSelect }: HitLayerProps): ReactElement {
  // A tap circle can overlap a neighbouring country. If the tap is inside that country's real
  // outline and not right on the tiny place, the neighbour wins: the circle forgives near
  // misses over sea or borders but must not steal clear taps on a bigger country.
  const onCircleClick = (event: MouseEvent<SVGCircleElement>, id: string): void => {
    const rect = event.currentTarget.getBoundingClientRect();
    const dx = event.clientX - (rect.left + rect.width / 2);
    const dy = event.clientY - (rect.top + rect.height / 2);
    if (Math.hypot(dx, dy) > INNER_RADIUS_PX) {
      const under = document
        .elementsFromPoint(event.clientX, event.clientY)
        .find((el) => el instanceof SVGPathElement && el.dataset.id && el.dataset.id !== id);
      const underId = under instanceof SVGPathElement ? under.dataset.id : undefined;
      if (underId) {
        onSelect(underId);
        return;
      }
    }
    onSelect(id);
  };

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
              onClick={(e) => onCircleClick(e, t.id)}
            />
          </g>
        );
      })}
    </g>
  );
}
