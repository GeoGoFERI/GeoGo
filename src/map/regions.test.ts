import { describe, expect, it } from 'vitest';
import { createProjection } from './projection';
import { REGION_BOXES, contextBox, fitTransform, projectBox } from './regions';

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

describe('contextBox', () => {
  it('grows a small shape to the minimum span around its centre', () => {
    const box = contextBox(
      { type: 'Feature', properties: {}, geometry: { type: 'Point', coordinates: [15, 46] } },
      10,
    );
    expect(box[0]).toBeCloseTo(10);
    expect(box[2]).toBeCloseTo(20);
    expect(box[1]).toBeCloseTo(43.5);
    expect(box[3]).toBeCloseTo(48.5);
  });
});
