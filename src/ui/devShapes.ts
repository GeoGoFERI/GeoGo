import { countryFeatures, loadWorld50 } from '../map/world';
import type { MapShape } from '../map/types';

// Temporary shape list for the map engine phase: every 50m country, keyed by its geo key.
export async function loadWorldShapes(): Promise<MapShape[]> {
  return countryFeatures(await loadWorld50()).map((f) => ({
    id: f.id,
    kind: 'area',
    feature: f,
    interactive: true,
  }));
}
