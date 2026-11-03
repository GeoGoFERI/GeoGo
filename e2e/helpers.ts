import type { Page } from '@playwright/test';

export async function pointInShape(page: Page, id: string): Promise<{ x: number; y: number }> {
  const point = await page.evaluate((shapeId) => {
    const path = document.querySelector<SVGPathElement>(`path[data-id="${shapeId}"]`);
    const svg = path?.ownerSVGElement;
    const ctm = path?.getScreenCTM();
    if (!path || !svg || !ctm) return null;
    // Search the part of the shape's screen box that is inside the map frame. Overseas parts
    // (French Guiana) make the full box huge, so the grid is laid over the visible part only.
    const r = path.getBoundingClientRect();
    const frame = svg.getBoundingClientRect();
    const left = Math.max(r.left, frame.left + 2);
    const right = Math.min(r.right, frame.right - 2);
    const top = Math.max(r.top, frame.top + 2);
    const bottom = Math.min(r.bottom, frame.bottom - 2);
    const inverse = ctm.inverse();
    const cx = (left + right) / 2;
    const cy = (top + bottom) / 2;
    // Grid points inside the shape, nearest the middle first. The cheap fill test runs on all of
    // them; the slow hit test (elementFromPoint) only until a good point is found.
    const inFill: { x: number; y: number; d: number }[] = [];
    const steps = 40;
    for (let i = 0; i <= steps; i += 1) {
      for (let j = 0; j <= steps; j += 1) {
        // Whole pixels: a browser may round a fractional click onto the neighbour.
        const sx = Math.round(left + ((right - left) * i) / steps);
        const sy = Math.round(top + ((bottom - top) * j) / steps);
        const lx = inverse.a * sx + inverse.c * sy + inverse.e;
        const ly = inverse.b * sx + inverse.d * sy + inverse.f;
        if (path.isPointInFill(new DOMPoint(lx, ly)))
          inFill.push({ x: sx, y: sy, d: (sx - cx) ** 2 + (sy - cy) ** 2 });
      }
    }
    inFill.sort((a, b) => a.d - b.d);
    const on = (x: number, y: number): boolean => document.elementFromPoint(x, y) === path;
    // Prefer a point with the shape 2 px around it: on a border Firefox clicked the neighbour
    // (Austria from Slovenia's edge).
    const inside = (p: { x: number; y: number }): boolean =>
      on(p.x, p.y) && on(p.x + 2, p.y) && on(p.x - 2, p.y) && on(p.x, p.y + 2) && on(p.x, p.y - 2);
    const best = inFill.find(inside) ?? inFill.find((p) => on(p.x, p.y));
    return best ? { x: best.x, y: best.y } : null;
  }, id);
  if (!point) throw new Error(`No clickable point for ${id}`);
  return point;
}

export async function tapShape(page: Page, id: string): Promise<void> {
  const { x, y } = await pointInShape(page, id);
  await page.mouse.click(x, y);
}

export async function settle(page: Page): Promise<void> {
  await page.waitForTimeout(600);
}

export async function tapLine(page: Page, id: string, at = 0.5): Promise<void> {
  const point = await page.evaluate(
    ([lineId, fraction]) => {
      const path = document.querySelector<SVGPathElement>(`path[data-id="${String(lineId)}"]`);
      const ctm = path?.getScreenCTM();
      if (!path || !ctm) return null;
      const p = path.getPointAtLength(path.getTotalLength() * Number(fraction));
      return { x: ctm.a * p.x + ctm.c * p.y + ctm.e, y: ctm.b * p.x + ctm.d * p.y + ctm.f };
    },
    [id, at] as const,
  );
  if (!point) throw new Error(`No line ${id}`);
  await page.mouse.click(point.x, point.y);
}
