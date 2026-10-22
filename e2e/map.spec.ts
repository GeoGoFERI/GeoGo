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
  // Brazil (076) is large enough to click in its middle at every viewport.
  await page.locator('path[data-id="076"]').click();
  await expect(page.getByTestId('last-clicked')).toHaveText('076');

  await page.locator('path[data-id="076"]').focus();
  await page.keyboard.press('ArrowRight');
  const focusedId = await page.evaluate(() => document.activeElement?.getAttribute('data-id'));
  expect(focusedId).toBeTruthy();
  expect(focusedId).not.toBe('076');
  await page.keyboard.press('Enter');
  await expect(page.getByTestId('last-clicked')).toHaveText(focusedId ?? '');
});

test('zoom buttons change the map transform and reset restores it', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Začni' }).click();
  const layer = page.locator('g.map__layer');
  await page.getByRole('button', { name: 'Povečaj' }).click();
  await expect(layer).toHaveAttribute('transform', /scale\(1\.[5-6]/);
  await page.getByRole('button', { name: 'Pokaži ves zemljevid' }).click();
  await expect(layer).toHaveAttribute('transform', /scale\(1\)/);

  // Dragging pans the map.
  await page.getByRole('button', { name: 'Povečaj' }).click();
  await expect(layer).toHaveAttribute('transform', /scale\(1\.[5-6]/);
  const before = await layer.getAttribute('transform');
  const box = await page.locator('svg.map__svg').boundingBox();
  if (!box) throw new Error('no map');
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.down();
  await page.mouse.move(box.x + box.width / 2 + 60, box.y + box.height / 2 + 20, { steps: 5 });
  await page.mouse.up();
  expect(await layer.getAttribute('transform')).not.toBe(before);
});
