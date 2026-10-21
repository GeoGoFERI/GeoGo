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
