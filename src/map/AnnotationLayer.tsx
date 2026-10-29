import type { ReactElement } from 'react';
import type { GeoProjection } from 'd3-geo';

// A short text placed at a lon/lat position, e.g.
export interface Annotation {
  id: string;
  at: [number, number];
  text: string;
}

// Map labels stay this size on screen at every zoom (at least 14 px, so they stay readable).
const LABEL_PX = 14;

// Text labels; their font size is rescaled imperatively on zoom like the tap circles.
export function AnnotationLayer({
  annotations,
  projection,
}: {
  annotations: readonly Annotation[];
  projection: GeoProjection;
}): ReactElement {
  return (
    <g className="map__annotations" aria-hidden="true">
      {annotations.map((a) => {
        const p = projection(a.at);
        if (!p) return null;
        return (
          <text key={a.id} className="map-label" x={p[0]} y={p[1]} fontSize={LABEL_PX}>
            {a.text}
          </text>
        );
      })}
    </g>
  );
}

// Keeps labels at LABEL_PX on screen: the layer is scaled by k, so the text shrinks by 1/k.
export function applyAnnotationSizes(svg: SVGSVGElement | null, k: number): void {
  if (!svg) return;
  for (const text of svg.querySelectorAll<SVGTextElement>('.map-label')) {
    text.setAttribute('font-size', String(LABEL_PX / k));
  }
}
