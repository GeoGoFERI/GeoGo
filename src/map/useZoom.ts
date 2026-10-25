import { useEffect, useMemo, useRef, type RefObject } from 'react';
import { select } from 'd3-selection';
import 'd3-transition';
import { zoom, zoomIdentity, type D3ZoomEvent, type ZoomBehavior } from 'd3-zoom';
import { prefersReducedMotion } from './motion';
import type { PixelBox, ViewTransform } from './regions';

export const MAX_ZOOM = 40;
const DURATION = 450;

export interface ZoomControls {
  zoomBy: (factor: number) => void;
  // Moves to a transform, animated unless reduced motion is on.
  transformTo: (t: ViewTransform) => void;
  // Pans so a layer point is in the middle, keeping the zoom.
  centerOn: (point: [number, number]) => void;
  current: () => ViewTransform;
}

// Attaches d3-zoom (wheel, pinch, drag) to the svg and applies the transform to the layer.
export function useZoom(
  svgRef: RefObject<SVGSVGElement | null>,
  layerRef: RefObject<SVGGElement | null>,
  width: number,
  height: number,
  // Layer-space box the view may not leave: the projected sphere.
  bounds: PixelBox,
  onZoom: (t: ViewTransform) => void,
): ZoomControls {
  const behaviourRef = useRef<ZoomBehavior<SVGSVGElement, unknown> | null>(null);
  const transformRef = useRef<ViewTransform>({ k: 1, x: 0, y: 0 });
  const onZoomRef = useRef(onZoom);
  useEffect(() => {
    onZoomRef.current = onZoom;
  }, [onZoom]);

  useEffect(() => {
    const svg = svgRef.current;
    const layer = layerRef.current;
    if (!svg || !layer || width === 0 || height === 0) return undefined;
    const behaviour = zoom<SVGSVGElement, unknown>()
      .scaleExtent([1, MAX_ZOOM])
      // The view can never leave the globe; when the globe is smaller than the frame
      // (the world view on a tall phone) d3 keeps it centred.
      .extent([
        [0, 0],
        [width, height],
      ])
      .translateExtent(bounds)
      // A little wobble while tapping should still count as a tap, not a drag.
      .clickDistance(6)
      .tapDistance(12)
      .on('zoom', (event: D3ZoomEvent<SVGSVGElement, unknown>) => {
        const { k, x, y } = event.transform;
        transformRef.current = { k, x, y };
        layer.setAttribute('transform', `translate(${x},${y}) scale(${k})`);
        onZoomRef.current({ k, x, y });
      });
    behaviourRef.current = behaviour;
    const selection = select(svg);
    selection.call(behaviour);
    // Double-click zoom would fight with clicking countries.
    selection.on('dblclick.zoom', null);
    // A resize re-projects the map, so the view starts over from the whole world.
    selection.call(behaviour.transform, zoomIdentity);
    return () => {
      selection.on('.zoom', null);
      behaviourRef.current = null;
    };
    // Bounds change only with the size, which is already a dependency.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [svgRef, layerRef, width, height]);

  return useMemo<ZoomControls>(() => {
    const duration = (): number => (prefersReducedMotion() ? 0 : DURATION);
    const apply = (t: ViewTransform): void => {
      const svg = svgRef.current;
      const behaviour = behaviourRef.current;
      if (!svg || !behaviour) return;
      const target = zoomIdentity.translate(t.x, t.y).scale(t.k);
      const d = duration();
      if (d === 0) select(svg).call(behaviour.transform, target);
      else select(svg).transition().duration(d).call(behaviour.transform, target);
    };
    return {
      zoomBy: (factor) => {
        const svg = svgRef.current;
        const behaviour = behaviourRef.current;
        if (!svg || !behaviour) return;
        const d = duration();
        if (d === 0) select(svg).call(behaviour.scaleBy, factor);
        else select(svg).transition().duration(250).call(behaviour.scaleBy, factor);
      },
      transformTo: apply,
      centerOn: ([px, py]) => {
        const { k } = transformRef.current;
        apply({ k, x: width / 2 - px * k, y: height / 2 - py * k });
      },
      current: () => transformRef.current,
    };
  }, [svgRef, width, height]);
}
