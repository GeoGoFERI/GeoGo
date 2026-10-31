import { expect, test } from '@playwright/test';
import { tapShape } from './helpers';

test('the atlas colours mastered countries and counts them per level', async ({ page }) => {
  // Seed progress as if Slovenia had been answered first try twice (box 3 = mastered).
  await page.addInitScript(() => {
    localStorage.setItem(
      'geogo.progress',
      JSON.stringify({
        version: 1,
        roundsPlayed: 2,
        items: { 'country-si': { box: 3, seen: 2, firstTry: 2, lastRound: 2 } },
        stickers: [],
        settings: { sound: false },
      }),
    );
  });
  await page.goto('/');
  await expect(page.getByRole('button', { name: /Države Evrope/ })).toContainText('1 od 47 znaš');
  await page.getByRole('button', { name: 'Moj atlas' }).click();
  await expect(page.getByRole('heading', { name: 'Moj atlas' })).toBeVisible();
  await expect(page.getByTestId('atlas-count-3')).toHaveText('Države Evrope: 1 od 47');
  await expect(page.locator('path[data-id="country-si"]')).toHaveClass(/shape--mastered/);
  await page.waitForTimeout(700);
  await tapShape(page, 'country-si');
  await expect(page.getByRole('status')).toHaveText('Slovenija');
  if (process.env.SHOT_DIR) {
    await page.screenshot({
      path: `${process.env.SHOT_DIR}/atlas-${test.info().project.name}.png`,
    });
  }
  await page.getByRole('button', { name: 'Nazaj' }).click();
  await expect(page.getByRole('heading', { name: 'Izberi stopnjo' })).toBeVisible();
});

test('the atlas also shows mastered rivers and seas', async ({ page }) => {
  await page.addInitScript(() => {
    const stats = { box: 3, seen: 2, firstTry: 2, lastRound: 2 };
    localStorage.setItem(
      'geogo.progress',
      JSON.stringify({
        version: 1,
        roundsPlayed: 2,
        items: { 'river-donava': stats, 'sea-jadransko': stats },
        stickers: [],
        settings: { sound: false },
      }),
    );
  });
  await page.goto('/');
  await page.getByRole('button', { name: 'Moj atlas' }).click();
  await expect(page.locator('path[data-id="river-donava"]')).toHaveClass(/shape--mastered/);
  await expect(page.locator('path[data-id="sea-jadransko"]')).toHaveClass(/shape--mastered/);
  // Not-yet-mastered features are not drawn at all.
  await expect(page.locator('path[data-id="river-ren"]')).toHaveCount(0);
});
