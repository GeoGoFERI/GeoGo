import {
  useCallback,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
  type ReactElement,
} from 'react';
import { geoPath } from 'd3-geo';
import { createProjection } from './projection';
import { useSize } from './useSize';
import { anchorOf } from './anchors';
import { nearestAnchor, nextInDirection, type Direction } from './focusNav';
import type { MapShape, ShapeState } from './types';
import { useZoom } from './useZoom';
import { ZoomButtons } from './ZoomButtons';
import './map.css';

export interface MapViewProps {
  shapes: readonly MapShape[];
  states?: Readonly<Record<string, ShapeState>>;
  // Called with the shape id when an interactive shape is clicked, tapped or chosen by keyboard.
  onSelect?: (id: string) => void;
  // Accessible names: the map itself and the zoom buttons.
  labels: { map: string; zoomIn: string; zoomOut: string; reset: string };
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
  labels,
  shapeLabel,
}: MapViewProps): ReactElement {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const layerRef = useRef<SVGGElement>(null);
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

  const onZoom = useCallback((): void => undefined, []);
  const controls = useZoom(svgRef, layerRef, width, height, onZoom);

  const focusShape = (id: string | undefined): void => {
    if (!id) return;
    setActiveId(id);
    const el = svgRef.current?.querySelector<SVGPathElement>(`[data-id="${CSS.escape(id)}"]`);
    // preventScroll: the browser must not scroll the svg itself; panning is ours to do.
    el?.focus({ preventScroll: true });
    // Pan when keyboard focus lands on a shape outside the visible area.
    const anchor = geometry.anchors.get(id);
    if (!anchor) return;
    const { k, x, y } = controls.current();
    const sx = anchor[0] * k + x;
    const sy = anchor[1] * k + y;
    if (sx < 0 || sy < 0 || sx > width || sy > height) controls.centerOn(anchor);
  };

  // Entering the map by keyboard focuses the shape nearest the centre of the view.
  const onSvgFocus = (): void => {
    if (activeId && geometry.anchors.has(activeId)) focusShape(activeId);
    else focusShape(nearestAnchor(geometry.anchors, [width / 2, height / 2]));
  };

  const onKeyDown = (event: KeyboardEvent<SVGSVGElement>): void => {
    if (event.key === '+' || event.key === '=') {
      controls.zoomBy(1.6);
      return;
    }
    if (event.key === '-') {
      controls.zoomBy(1 / 1.6);
      return;
    }
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
        aria-label={labels.map}
        tabIndex={hasActive ? -1 : 0}
        onFocus={(e) => {
          if (e.target === e.currentTarget) onSvgFocus();
        }}
        onKeyDown={onKeyDown}
      >
        <g ref={layerRef} className="map__layer">
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
      <ZoomButtons
        labels={labels}
        onZoomIn={() => controls.zoomBy(1.6)}
        onZoomOut={() => controls.zoomBy(1 / 1.6)}
        onReset={() => controls.transformTo({ k: 1, x: 0, y: 0 })}
      />
    </div>
  );
}
