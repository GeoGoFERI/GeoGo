import { expect, test } from '@playwright/test';

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
  const box = await page.locator('path[data-id="country-si"]').boundingBox();
  if (!box) throw new Error('no Slovenia');
  await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
  await expect(page.getByRole('status')).toHaveText('Slovenija');
  if (process.env.SHOT_DIR) {
    await page.screenshot({
      path: `${process.env.SHOT_DIR}/atlas-${test.info().project.name}.png`,
    });
  }
  await page.getByRole('button', { name: 'Nazaj' }).click();
  await expect(page.getByRole('heading', { name: 'Izberi stopnjo' })).toBeVisible();
});
