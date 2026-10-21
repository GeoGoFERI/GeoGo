import { useMemo, useRef, useState, type KeyboardEvent, type ReactElement } from 'react';
import { geoPath } from 'd3-geo';
import { createProjection } from './projection';
import { useSize } from './useSize';
import { anchorOf } from './anchors';
import { nearestAnchor, nextInDirection, type Direction } from './focusNav';
import type { MapShape, ShapeState } from './types';
import './map.css';

export interface MapViewProps {
  shapes: readonly MapShape[];
  states?: Readonly<Record<string, ShapeState>>;
  // Called with the shape id when an interactive shape is clicked, tapped or chosen by keyboard.
  onSelect?: (id: string) => void;
  // Accessible name of the whole map.
  label: string;
  // Accessible name of one shape.
  shapeLabel: (id: string) => string;
}

const ARROWS: Record<string, Direction> = {
  ArrowUp: 'up',
  ArrowDown: 'down',
  ArrowLeft: 'left',
  ArrowRight: 'right',
};

// The interactive SVG map.
export function MapView({
  shapes,
  states = {},
  onSelect,
  label,
  shapeLabel,
}: MapViewProps): ReactElement {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const { width, height } = useSize(containerRef);
  // Roving focus: exactly one shape is in the tab order at a time.
  const [activeId, setActiveId] = useState<string | undefined>(undefined);

  // Path strings and anchors depend only on the shapes and the container size.
  const geometry = useMemo(() => {
    const anchors = new Map<string, [number, number]>();
    if (width === 0 || height === 0) return { sphere: '', drawn: [], anchors };
    const path = geoPath(createProjection(width, height));
    const drawn = shapes.map((s) => ({ shape: s, d: path(s.feature) ?? '' }));
    for (const s of shapes) if (s.interactive) anchors.set(s.id, anchorOf(path, s.feature));
    return { sphere: path({ type: 'Sphere' }) ?? '', drawn, anchors };
  }, [shapes, width, height]);

  const focusShape = (id: string | undefined): void => {
    if (!id) return;
    setActiveId(id);
    const el = svgRef.current?.querySelector<SVGPathElement>(`[data-id="${CSS.escape(id)}"]`);
    el?.focus();
  };

  // Entering the map by keyboard focuses the shape nearest the centre of the view.
  const onSvgFocus = (): void => {
    if (activeId && geometry.anchors.has(activeId)) focusShape(activeId);
    else focusShape(nearestAnchor(geometry.anchors, [width / 2, height / 2]));
  };

  const onKeyDown = (event: KeyboardEvent<SVGSVGElement>): void => {
    const id = (event.target as Element).getAttribute('data-id');
    if (!id) return;
    const direction = ARROWS[event.key];
    if (direction) {
      event.preventDefault();
      focusShape(nextInDirection(geometry.anchors, id, direction));
    } else if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onSelect?.(id);
    }
  };

  const hasActive = activeId !== undefined && geometry.anchors.has(activeId);

  return (
    <div ref={containerRef} className="map">
      <svg
        ref={svgRef}
        className="map__svg"
        width={width}
        height={height}
        role="group"
        aria-label={label}
        tabIndex={hasActive ? -1 : 0}
        onFocus={(e) => {
          if (e.target === e.currentTarget) onSvgFocus();
        }}
        onKeyDown={onKeyDown}
      >
        <g className="map__layer">
          <path className="map__sphere" d={geometry.sphere} />
          {geometry.drawn.map(({ shape, d }) => {
            const state = states[shape.id];
            const className = `shape shape--${shape.kind}${shape.interactive ? ' shape--interactive' : ''}${state ? ` shape--${state}` : ''}`;
            return shape.interactive ? (
              <path
                key={shape.id}
                d={d}
                data-id={shape.id}
                className={className}
                role="button"
                aria-label={shapeLabel(shape.id)}
                tabIndex={shape.id === activeId ? 0 : -1}
                onClick={() => onSelect?.(shape.id)}
                onFocus={() => setActiveId(shape.id)}
              />
            ) : (
              <path key={shape.id} d={d} className={className} aria-hidden="true" />
            );
          })}
        </g>
      </svg>
    </div>
  );
}
