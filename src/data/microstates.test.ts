import { describe, expect, it } from 'vitest';
import { geoPath } from 'd3-geo';
import { createProjection } from '../map/projection';
import { hitTargets } from '../map/hitAreas';
import { testSources } from './testSources';
import { buildGameData } from './gameData';

const data = buildGameData(testSources);

describe('microstates and tiny countries', () => {
  const tiny = ['country-va', 'country-sm', 'country-mc', 'country-li', 'country-ad', 'country-mt'];

  it('exist as real polygons in the 50m data (no point markers needed)', () => {
    for (const id of tiny) {
      const f = data.featureOf(id);
      expect(f, id).toBeDefined();
      expect(f?.geometry.type, id).toMatch(/Polygon/);
    }
  });

  it('all get a forgiving tap target, and so does Luxembourg', () => {
    const path = geoPath(createProjection(1000, 520));
    const ids = new Set(hitTargets(data.countryShapes, path).map((t) => t.id));
    for (const id of [...tiny, 'country-lu']) expect(ids.has(id), id).toBe(true);
    // Countries big enough to tap do not get one.
    expect(ids.has('country-si')).toBe(false);
  });
});
