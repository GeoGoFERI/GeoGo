import world from 'world-atlas/countries-50m.json';
import marine from './generated/marine.json';
import nature from './generated/europe-nature.json';
import type { WorldTopology } from '../map/world';
import type { MapSources } from './gameData';
import type { MarineData } from './level1';
import type { NatureData } from './level4';

// the real map sources, for data tests
export const testSources: MapSources = {
  topology: world as unknown as WorldTopology,
  marine: marine as unknown as MarineData,
  nature: nature as unknown as NatureData,
};
