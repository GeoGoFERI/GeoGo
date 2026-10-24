import { expect, test } from '@playwright/test';

test('start screen shows the logo, level cards and actions', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('img', { name: 'GeoGo' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Izberi stopnjo' })).toBeVisible();
  const europe = page.getByRole('button', { name: /Države Evrope/ });
  await expect(europe).toHaveAttribute('aria-pressed', 'true');
  // The map data loads in the background; Začni becomes available when it is ready.
  await expect(page.getByRole('button', { name: 'Začni' })).toBeEnabled();
  await expect(europe).toContainText('0 od 47 znaš');
  await expect(page.getByRole('button', { name: 'Moj atlas' })).toBeEnabled();
  if (process.env.SHOT_DIR) {
    await page.screenshot({
      path: `${process.env.SHOT_DIR}/start-${test.info().project.name}.png`,
      fullPage: true,
    });
  }
});
