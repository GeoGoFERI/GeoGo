import countries from 'world-atlas/countries-50m.json';
import marine from './generated/marine.json';
import nature from './generated/europe-nature.json';
import world from './generated/world-nature.json';
import type { WorldTopology } from '../map/world';
import type { MapSources } from './gameData';
import type { MarineData } from './level1';
import type { NatureData } from './level4';
import type { WorldNatureData } from './level5';

// the real map sources, for data tests
export const testSources: MapSources = {
  topology: countries as unknown as WorldTopology,
  marine: marine as unknown as MarineData,
  nature: nature as unknown as NatureData,
  world: world as unknown as WorldNatureData,
};
