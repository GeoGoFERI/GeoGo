import { expect, test, type Page } from '@playwright/test';

// Is the world view smooth enough when zooming under 4x CPU throttling?
// The 110m vs 50m comparison was done once; this keeps the 50m check repeatable.
// Run with: npx playwright test e2e/perf --project=desktop

async function measureZoom(page: Page, query: string): Promise<{ fps: number; p95: number }> {
  await page.goto(`/${query}`);
  await page.getByRole('button', { name: 'Začni' }).click();
  await expect(page.locator('path.shape').first()).toBeVisible();
  // Wait for the 50m chunk to swap in.
  await page.waitForTimeout(1500);
  await page.getByRole('button', { name: 'Pokaži ves zemljevid' }).click();
  await page.waitForTimeout(800);

  const cdp = await page.context().newCDPSession(page);
  await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 });

  await page.evaluate(() => {
    const w = window as unknown as { __loaf: number[] };
    w.__loaf = [];
    new PerformanceObserver((list) => {
      for (const e of list.getEntries()) w.__loaf.push(e.duration);
    }).observe({ type: 'long-animation-frame', buffered: false });
  });
  // Drive the zoom from inside the page: one wheel event per animation frame for 120 frames
  // (zoom in, then out), and record every frame interval. This keeps the page busy the whole time.
  const frames = await page.evaluate(
    () =>
      new Promise<number[]>((resolve) => {
        const svg = document.querySelector('svg.map__svg');
        if (!svg) throw new Error('no map');
        const rect = svg.getBoundingClientRect();
        const intervals: number[] = [];
        let last = performance.now();
        let n = 0;
        const tick = (now: number): void => {
          intervals.push(now - last);
          last = now;
          n += 1;
          svg.dispatchEvent(
            new WheelEvent('wheel', {
              deltaY: n <= 60 ? -40 : 40,
              clientX: rect.left + rect.width / 2,
              clientY: rect.top + rect.height / 2,
              bubbles: true,
              cancelable: true,
            }),
          );
          if (n < 120) requestAnimationFrame(tick);
          else resolve(intervals.slice(1));
        };
        requestAnimationFrame(tick);
      }),
  );
  await cdp.send('Emulation.setCPUThrottlingRate', { rate: 1 });
  const loaf = await page.evaluate(() => (window as unknown as { __loaf: number[] }).__loaf);
  console.log(`long animation frames: ${loaf.length}, max ${Math.max(0, ...loaf).toFixed(0)} ms`);
  const paths = await page.locator('path.shape').count();
  const transform = await page.locator('g.map__layer').getAttribute('transform');
  console.log(`${query || '110m'}: ${paths} paths, final transform ${transform}`);
  const sorted = [...frames].sort((a, b) => a - b);
  const total = frames.reduce((a, b) => a + b, 0);
  return {
    fps: (frames.length * 1000) / total,
    p95: sorted[Math.floor(sorted.length * 0.95)] ?? 0,
  };
}

test('50m world zooms smoothly at 4x CPU throttling', async ({ page }) => {
  const r = await measureZoom(page, '');
  console.log(`50m: ${r.fps.toFixed(1)} fps, p95 frame ${r.p95.toFixed(1)} ms`);
  expect(r.fps).toBeGreaterThan(30);
  expect(r.p95).toBeLessThan(50);
});
