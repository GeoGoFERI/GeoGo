import { expect, test } from '@playwright/test';

test('world map renders one path per country', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Začni' }).click();
  const countries = page.locator('path.shape[data-id]');
  await expect(countries.first()).toBeVisible();
  expect(await countries.count()).toBeGreaterThan(150);
  await expect(page.locator('path.shape[data-id="705"]')).toHaveCount(1);
  if (process.env.SHOT_DIR) {
    await page.screenshot({ path: `${process.env.SHOT_DIR}/map-${test.info().project.name}.png` });
  }
});

test('clicking a country reports its id and arrows move keyboard focus', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Začni' }).click();
  await page.waitForTimeout(600);
  // Germany (276) is in the Europe home view and large enough to click in its middle.
  // A raw tap: on a phone Luxembourg's tap circle overlaps Germany, and Germany must still win.
  const germany = await page.locator('path[data-id="276"]').boundingBox();
  if (!germany) throw new Error('no Germany');
  await page.mouse.click(germany.x + germany.width / 2, germany.y + germany.height / 2);
  await expect(page.getByTestId('last-clicked')).toHaveText('276');

  await page.locator('path[data-id="276"]').focus();
  await page.keyboard.press('ArrowRight');
  const focusedId = await page.evaluate(() => document.activeElement?.getAttribute('data-id'));
  expect(focusedId).toBeTruthy();
  expect(focusedId).not.toBe('276');
  await page.keyboard.press('Enter');
  await expect(page.getByTestId('last-clicked')).toHaveText(focusedId ?? '');
});

test('zoom buttons change the map transform and reset restores it', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Začni' }).click();
  const layer = page.locator('g.map__layer');
  const scaleOf = async (): Promise<number> =>
    Number(/scale\(([\d.]+)\)/.exec((await layer.getAttribute('transform')) ?? '')?.[1] ?? 0);
  // The home view is fitted to Europe, so it starts zoomed in.
  await expect.poll(scaleOf).toBeGreaterThan(1.5);
  // Let the opening fit animation finish.
  await page.waitForTimeout(600);
  const home = await scaleOf();
  await page.getByRole('button', { name: 'Povečaj' }).click();
  await expect.poll(scaleOf).toBeCloseTo(home * 1.6, 1);
  await page.getByRole('button', { name: 'Pokaži ves zemljevid' }).click();
  await expect.poll(scaleOf).toBeCloseTo(home, 1);

  // Dragging pans the map.
  await page.waitForTimeout(600);
  const before = await layer.getAttribute('transform');
  const box = await page.locator('svg.map__svg').boundingBox();
  if (!box) throw new Error('no map');
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.down();
  await page.mouse.move(box.x + box.width / 2 + 60, box.y + box.height / 2 + 20, { steps: 5 });
  await page.mouse.up();
  expect(await layer.getAttribute('transform')).not.toBe(before);
});

test('a tiny country can be tapped near it thanks to its circular hit area', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Začni' }).click();
  const hit = page.locator('circle[data-hit-id="442"]');
  await expect(hit).toHaveCount(1);
  const box = await hit.boundingBox();
  if (!box) throw new Error('no hit circle');
  // The circle is at least 44 px across on screen.
  expect(box.width).toBeGreaterThanOrEqual(43);
  // Tap 10 px off-centre: still Luxembourg, even where that lands on a neighbour.
  await page.mouse.click(box.x + box.width / 2 + 10, box.y + box.height / 2);
  await expect(page.getByTestId('last-clicked')).toHaveText('442');

  // After zooming in the circle keeps the same size on screen.
  await page.getByRole('button', { name: 'Povečaj' }).click();
  await page.waitForTimeout(600);
  const zoomed = await hit.boundingBox();
  expect(Math.abs((zoomed?.width ?? 0) - box.width)).toBeLessThan(2);
});
