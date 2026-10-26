import type { MouseEvent, ReactElement } from 'react';
import {
  DOT_RADIUS_PX,
  HIT_RADIUS_PX,
  INNER_RADIUS_PX,
  hitSizes,
  type HitTarget,
} from './hitAreas';
import type { ShapeState } from './types';

export interface HitLayerProps {
  targets: readonly HitTarget[];
  states: Readonly<Record<string, ShapeState>>;
  onSelect: (id: string) => void;
}

// Dots and invisible tap circles for tiny places.
export function HitLayer({ targets, states, onSelect }: HitLayerProps): ReactElement {
  // Tap circles can overlap each other and neighbouring countries. Resolution order:
  // 1. the nearest tiny place whose centre is within INNER_RADIUS_PX wins outright;
  // 2. otherwise a real country outline under the tap wins (circles must not steal clear taps);
  // 3. otherwise the nearest tiny place wins (a forgiving near miss over sea or a border).
  const onCircleClick = (event: MouseEvent<SVGCircleElement>): void => {
    const { clientX, clientY } = event;
    const under = document.elementsFromPoint(clientX, clientY);
    let nearest: { id: string; dist: number } | undefined;
    for (const el of under) {
      const id = el instanceof SVGCircleElement ? el.dataset.hitId : undefined;
      if (!id) continue;
      const r = el.getBoundingClientRect();
      const dist = Math.hypot(clientX - (r.left + r.width / 2), clientY - (r.top + r.height / 2));
      if (!nearest || dist < nearest.dist) nearest = { id, dist };
    }
    if (!nearest) return;
    if (nearest.dist > INNER_RADIUS_PX) {
      const path = under.find((el) => el instanceof SVGPathElement && el.dataset.id);
      const pathId = path instanceof SVGPathElement ? path.dataset.id : undefined;
      if (pathId) {
        onSelect(pathId);
        return;
      }
    }
    onSelect(nearest.id);
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
              onClick={onCircleClick}
            />
          </g>
        );
      })}
    </g>
  );
}

// Rescales the tiny-place dots and tap circles so they stay the same size on screen.
export function applyHitSizes(svg: SVGSVGElement | null, k: number): void {
  if (!svg) return;
  for (const group of svg.querySelectorAll<SVGGElement>('[data-hit-size]')) {
    const sizes = hitSizes(Number(group.dataset.hitSize), k);
    const [dot, hit] = group.children;
    dot?.setAttribute('r', String(sizes.dotRadius));
    dot?.setAttribute('display', sizes.showDot ? 'inline' : 'none');
    hit?.setAttribute('r', String(sizes.hitRadius));
    hit?.setAttribute('display', sizes.showHit ? 'inline' : 'none');
  }
}
