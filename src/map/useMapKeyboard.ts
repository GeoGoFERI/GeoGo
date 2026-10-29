import { useState, type FocusEvent, type KeyboardEvent, type RefObject } from 'react';
import { nearestAnchor, nextInDirection, type Direction } from './focusNav';
import type { ZoomControls } from './useZoom';

const ARROWS: Record<string, Direction> = {
  ArrowUp: 'up',
  ArrowDown: 'down',
  ArrowLeft: 'left',
  ArrowRight: 'right',
};

export interface MapKeyboard {
  // The one shape in the tab order (roving focus).
  activeId: string | undefined;
  setActiveId: (id: string) => void;
  // Whether the svg itself should be the tab stop (no shape has focus yet).
  svgTabIndex: number;
  onFocus: (event: FocusEvent<SVGSVGElement>) => void;
  onKeyDown: (event: KeyboardEvent<SVGSVGElement>) => void;
}

// Keyboard play on the map: the map is one tab stop, arrow keys move to the nearest shape in that
// direction (panning to it if it is off screen), Enter or Space selects, + and - zoom.
export function useMapKeyboard(
  svgRef: RefObject<SVGSVGElement | null>,
  anchors: ReadonlyMap<string, [number, number]>,
  controls: ZoomControls,
  size: { width: number; height: number },
  onSelect: (id: string) => void,
): MapKeyboard {
  const [activeId, setActiveId] = useState<string | undefined>(undefined);
  const { width, height } = size;

  const focusShape = (id: string | undefined): void => {
    if (!id) return;
    setActiveId(id);
    const el = svgRef.current?.querySelector<SVGElement>(`[data-id="${CSS.escape(id)}"]`);
    // preventScroll: the browser must not scroll the svg itself; panning is ours to do.
    el?.focus({ preventScroll: true });
    const anchor = anchors.get(id);
    if (!anchor) return;
    const { k, x, y } = controls.current();
    const sx = anchor[0] * k + x;
    const sy = anchor[1] * k + y;
    if (sx < 0 || sy < 0 || sx > width || sy > height) controls.centerOn(anchor);
  };

  const onFocus = (event: FocusEvent<SVGSVGElement>): void => {
    if (event.target !== event.currentTarget) return;
    // Entering the map focuses the last shape, or the one nearest the centre of the view.
    if (activeId && anchors.has(activeId)) {
      focusShape(activeId);
      return;
    }
    const { k, x, y } = controls.current();
    focusShape(nearestAnchor(anchors, [(width / 2 - x) / k, (height / 2 - y) / k]));
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
      focusShape(nextInDirection(anchors, id, direction));
    } else if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onSelect(id);
    }
  };

  const hasActive = activeId !== undefined && anchors.has(activeId);
  return { activeId, setActiveId, svgTabIndex: hasActive ? -1 : 0, onFocus, onKeyDown };
}
