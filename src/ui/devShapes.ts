import { countryFeatures, world110 } from '../map/world';
import type { MapShape } from '../map/types';

// Temporary shape list for the map engine phase: every country, keyed by its geo key.
export const worldCountryShapes: MapShape[] = countryFeatures(world110).map((f) => ({
  id: f.id,
  kind: 'area',
  feature: f,
  interactive: true,
}));
