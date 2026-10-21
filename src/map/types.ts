import type { Feature, Geometry } from 'geojson';

// How a shape is drawn and hit-tested.
export type ShapeKind = 'area' | 'line' | 'point';

// One drawable thing on the map.
export interface MapShape {
  id: string;
  kind: ShapeKind;
  feature: Feature<Geometry>;
  // Non-interactive shapes are drawn as context only (no hover, focus or click).
  interactive: boolean;
}

// Visual state of a shape; drives a CSS modifier class.
export type ShapeState = 'correct' | 'wrong' | 'mastered' | 'flash' | 'hint' | 'dim';
