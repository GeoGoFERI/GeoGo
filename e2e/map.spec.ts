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
