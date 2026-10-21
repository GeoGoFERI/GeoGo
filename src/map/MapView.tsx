import { useMemo, useRef, type ReactElement } from 'react';
import { geoPath } from 'd3-geo';
import { createProjection } from './projection';
import { useSize } from './useSize';
import type { MapShape, ShapeState } from './types';
import './map.css';

export interface MapViewProps {
  shapes: readonly MapShape[];
  states?: Readonly<Record<string, ShapeState>>;
  // Accessible name of the whole map.
  label: string;
}

// The interactive SVG map.
export function MapView({ shapes, states = {}, label }: MapViewProps): ReactElement {
  const containerRef = useRef<HTMLDivElement>(null);
  const { width, height } = useSize(containerRef);

  // Path strings depend only on the shapes and the container size, so they are memoised.
  const paths = useMemo(() => {
    if (width === 0 || height === 0) return { sphere: '', shapes: [] };
    const path = geoPath(createProjection(width, height));
    return {
      sphere: path({ type: 'Sphere' }) ?? '',
      shapes: shapes.map((s) => ({ shape: s, d: path(s.feature) ?? '' })),
    };
  }, [shapes, width, height]);

  return (
    <div ref={containerRef} className="map">
      <svg className="map__svg" width={width} height={height} role="img" aria-label={label}>
        <g className="map__layer">
          <path className="map__sphere" d={paths.sphere} />
          {paths.shapes.map(({ shape, d }) => (
            <path
              key={shape.id}
              d={d}
              data-id={shape.id}
              className={`shape shape--${shape.kind}${states[shape.id] ? ` shape--${states[shape.id]}` : ''}`}
            />
          ))}
        </g>
      </svg>
    </div>
  );
}
