import type { ReactElement } from 'react';
import type { MapShape, ShapeState } from './types';

export interface ShapeLayerProps {
  drawn: readonly { shape: MapShape; d: string }[];
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
  return (
    <>
      {drawn.map(({ shape, d }) => {
        const className = classFor(shape, states[shape.id]);
        return shape.interactive ? (
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
          <path key={shape.id} d={d} className={className} aria-hidden="true" />
        );
      })}
    </>
  );
};
