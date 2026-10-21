import { describe, expect, it } from 'vitest';
import { createProjection } from './projection';
import { REGION_BOXES, fitTransform, projectBox } from './regions';

describe('region fitting', () => {
  const projection = createProjection(1000, 520);

  it('fits Europe into the viewport with zoom above 1', () => {
    const box = projectBox(projection, REGION_BOXES.europe);
    const t = fitTransform(box, 1000, 520);
    expect(t.k).toBeGreaterThan(2);
    // The box centre lands in the viewport centre.
    const cx = ((box[0][0] + box[1][0]) / 2) * t.k + t.x;
    const cy = ((box[0][1] + box[1][1]) / 2) * t.k + t.y;
    expect(cx).toBeCloseTo(500);
    expect(cy).toBeCloseTo(260);
  });

  it('never zooms out below the whole world', () => {
    const box = projectBox(projection, REGION_BOXES.world);
    expect(fitTransform(box, 1000, 520).k).toBe(1);
  });

  it('clamps the maximum zoom', () => {
    expect(
      fitTransform(
        [
          [10, 10],
          [10.01, 10.01],
        ],
        1000,
        520,
      ).k,
    ).toBe(40);
  });
});
