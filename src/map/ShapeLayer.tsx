import { useState, type PointerEvent, type ReactElement } from 'react';
import type { MapShape, ShapeState } from './types';

export interface ShapeLayerProps {
  // `key` is unique per path: a context line may be drawn as several paths (see MapView).
  drawn: readonly { shape: MapShape; key: string; d: string }[];
  states: Readonly<Record<string, ShapeState>>;
  activeId: string | undefined;
  shapeLabel: (id: string) => string;
  onSelect: (id: string) => void;
  onFocusShape: (id: string) => void;
}

// CSS classes for a shape: kind, drawing variant, interactivity and current state
const classFor = (shape: MapShape, state: ShapeState | undefined): string => {
  return [
    'shape',
    `shape--${shape.kind}`,
    shape.variant ? `shape--${shape.variant}` : '',
    shape.tone ? `shape--tone-${shape.tone}` : '',
    shape.interactive ? 'shape--interactive' : '',
    state ? `shape--${state}` : '',
  ]
    .filter(Boolean)
    .join(' ');
};

// the map's paths in drawing order
export const ShapeLayer = ({
  drawn,
  states,
  activeId,
  shapeLabel,
  onSelect,
  onFocusShape,
}: ShapeLayerProps): ReactElement => {
  // The line whose invisible tap zone the mouse is over, highlighted like a hovered line.
  const [hoverId, setHoverId] = useState<string>();
  const hoverIn =
    (id: string) =>
    (event: PointerEvent): void => {
      if (event.pointerType === 'mouse') setHoverId(id);
    };
  const hoverOut = (id: string) => (): void => {
    setHoverId((current) => (current === id ? undefined : current));
  };
  // Thin lines get a wide invisible stroke, so a near miss still counts. All of these strokes go
  // in one layer under the first such line: a drawn line then always wins over its neighbour's
  // invisible margin (the Tigris must not take taps that land on the Euphrates).
  const wide = drawn.filter(({ shape }) => shape.variant === 'wide' && shape.interactive);
  const firstWide = wide[0]?.shape.id;
  const wideHits = wide.map(({ shape, d }) => (
    <path
      key={`hit-${shape.id}`}
      d={d}
      className="shape-wide-hit"
      aria-hidden="true"
      onClick={() => onSelect(shape.id)}
      onPointerEnter={hoverIn(shape.id)}
      onPointerLeave={hoverOut(shape.id)}
    />
  ));
  return (
    <>
      {drawn.map(({ shape, key, d }) => {
        const className =
          classFor(shape, states[shape.id]) + (shape.id === hoverId ? ' shape--hover' : '');
        const path = shape.interactive ? (
          <path
            key={shape.id}
            d={d}
            data-id={shape.id}
            className={className}
            role="button"
            aria-label={shapeLabel(shape.id)}
            tabIndex={shape.id === activeId ? 0 : -1}
            onClick={() => onSelect(shape.id)}
            onFocus={() => onFocusShape(shape.id)}
          />
        ) : (
          <path key={key} d={d} className={className} aria-hidden="true" />
        );
        if (shape.id !== firstWide) return path;
        return [...wideHits, path];
      })}
    </>
  );
};
