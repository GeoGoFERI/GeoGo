import {
  useCallback,
  useEffect,
  useImperativeHandle,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
  type ReactElement,
  type Ref,
} from 'react';
import { geoPath } from 'd3-geo';
import { createProjection } from './projection';
import { useSize } from './useSize';
import { anchorOf } from './anchors';
import { nearestAnchor, nextInDirection, type Direction } from './focusNav';
import { hitSizes, hitTargets } from './hitAreas';
import { HitLayer } from './HitLayer';
import { useZoom } from './useZoom';
import { ZoomButtons } from './ZoomButtons';
import { mainPart } from './anchors';
import {
  REGION_BOXES,
  contextBox,
  fitTransform,
  projectBox,
  type PixelBox,
  type RegionId,
  type ViewTransform,
} from './regions';
import type { MapShape, ShapeState } from './types';
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
  // The home view: fitted on mount, on resize, when it changes and by the reset button.
  region?: RegionId;
  ref?: Ref<MapHandle>;
}

// Imperative view control for the game (help zoom) and tests.
export interface MapHandle {
  fitToRegion: (region: RegionId) => void;
  // Zooms to a shape with its surroundings: at least `contextDeg` degrees around its centre.
  fitToShape: (id: string, contextDeg?: number) => void;
  reset: () => void;
}

const ARROWS: Record<string, Direction> = {
  ArrowUp: 'up',
  ArrowDown: 'down',
  ArrowLeft: 'left',
  ArrowRight: 'right',
};

const NO_STATES: Readonly<Record<string, ShapeState>> = {};

// Rescales the tiny-place dots and tap circles so they stay the same size on screen.
function applyHitSizes(svg: SVGSVGElement | null, k: number): void {
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

// The interactive SVG map.
export function MapView({
  shapes,
  states = NO_STATES,
  onSelect,
  labels,
  shapeLabel,
  region = 'world',
  ref,
}: MapViewProps): ReactElement {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const layerRef = useRef<SVGGElement>(null);
  const { width, height } = useSize(containerRef);
  // Roving focus: exactly one shape is in the tab order at a time.
  const [activeId, setActiveId] = useState<string | undefined>(undefined);

  // Path strings, anchors and tap targets depend only on the shapes and the container size.
  const geometry = useMemo(() => {
    const anchors = new Map<string, [number, number]>();
    const projection = createProjection(Math.max(width, 1), Math.max(height, 1));
    const path = geoPath(projection);
    const bounds = path.bounds({ type: 'Sphere' }) as PixelBox;
    if (width === 0 || height === 0)
      return { sphere: '', drawn: [], anchors, targets: [], path, projection, bounds };
    const drawn = shapes
      .filter((s) => s.kind !== 'point')
      .map((s) => ({ shape: s, d: path(s.feature) ?? '' }));
    for (const s of shapes) if (s.interactive) anchors.set(s.id, anchorOf(path, s.feature));
    const sphere = path({ type: 'Sphere' }) ?? '';
    return { sphere, drawn, anchors, targets: hitTargets(shapes, path), path, projection, bounds };
  }, [shapes, width, height]);

  const onZoom = useCallback((t: ViewTransform): void => applyHitSizes(svgRef.current, t.k), []);
  const controls = useZoom(svgRef, layerRef, width, height, geometry.bounds, onZoom);

  // Newly rendered tap circles start at zoom-1 sizes; correct them for the current zoom.
  useLayoutEffect(() => {
    applyHitSizes(svgRef.current, controls.current().k);
  }, [geometry, controls]);

  const handle = useMemo<MapHandle>(() => {
    const fitBox = (box: PixelBox, maxScale?: number): void =>
      controls.transformTo(fitTransform(box, width, height, 0.04, maxScale));
    const fitToRegion = (r: RegionId): void =>
      fitBox(projectBox(geometry.projection, REGION_BOXES[r]));
    return {
      fitToRegion,
      fitToShape: (id, contextDeg = 14) => {
        const shape = shapes.find((s) => s.id === id);
        if (!shape) return;
        fitBox(projectBox(geometry.projection, contextBox(mainPart(shape.feature), contextDeg)));
      },
      reset: () => fitToRegion(region),
    };
  }, [controls, geometry, shapes, width, height, region]);

  useImperativeHandle(ref, () => handle, [handle]);

  // Fit the home region whenever it or the projection changes. The latest handle is read
  // through a ref so that a new shapes array alone does not move the view.
  const handleRef = useRef(handle);
  useLayoutEffect(() => {
    handleRef.current = handle;
  }, [handle]);
  useEffect(() => {
    if (width > 0 && height > 0) handleRef.current.fitToRegion(region);
  }, [region, width, height]);

  const select = (id: string): void => onSelect?.(id);

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
    if (activeId && geometry.anchors.has(activeId)) {
      focusShape(activeId);
      return;
    }
    const { k, x, y } = controls.current();
    focusShape(nearestAnchor(geometry.anchors, [(width / 2 - x) / k, (height / 2 - y) / k]));
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
      select(id);
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
                onClick={() => select(shape.id)}
                onFocus={() => setActiveId(shape.id)}
              />
            ) : (
              <path key={shape.id} d={d} className={className} aria-hidden="true" />
            );
          })}
          <HitLayer targets={geometry.targets} states={states} onSelect={select} />
        </g>
      </svg>
      <ZoomButtons
        labels={labels}
        onZoomIn={() => controls.zoomBy(1.6)}
        onZoomOut={() => controls.zoomBy(1 / 1.6)}
        onReset={handle.reset}
      />
    </div>
  );
}
