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
    let best: { x: number; y: number; d: number } | null = null;
    const steps = 40;
    for (let i = 0; i <= steps; i += 1) {
      for (let j = 0; j <= steps; j += 1) {
        const sx = left + ((right - left) * i) / steps;
        const sy = top + ((bottom - top) * j) / steps;
        const lx = inverse.a * sx + inverse.c * sy + inverse.e;
        const ly = inverse.b * sx + inverse.d * sy + inverse.f;
        if (!path.isPointInFill(new DOMPoint(lx, ly))) continue;
        if (document.elementFromPoint(sx, sy) !== path) continue;
        const d = (sx - cx) ** 2 + (sy - cy) ** 2;
        if (!best || d < best.d) best = { x: sx, y: sy, d };
      }
    }
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
