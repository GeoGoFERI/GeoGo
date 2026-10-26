import { expect, test } from '@playwright/test';
import { settle, tapShape } from './helpers';

test('Level 1: find a continent and an ocean', async ({ page }) => {
  await page.goto('/?round=continent-azija,ocean-tihi');
  await page.getByRole('button', { name: /Celine in oceani/ }).click();
  await page.getByRole('button', { name: 'Začni' }).click();
  await settle(page);
  await expect(page.getByTestId('prompt-name')).toHaveText('Azija');
  if (process.env.SHOT_DIR) {
    await page.screenshot({
      path: `${process.env.SHOT_DIR}/level1-${test.info().project.name}.png`,
    });
  }
  await tapShape(page, 'continent-afrika');
  await expect(page.getByRole('status')).toContainText('To je Afrika. Poskusi znova!');
  await tapShape(page, 'continent-azija');
  await expect(page.getByRole('dialog')).toContainText('Azija');
  await page.getByRole('button', { name: 'Naprej' }).click();
  await settle(page);
  await expect(page.getByTestId('prompt-name')).toHaveText('Tihi ocean (Pacifik)');
  await tapShape(page, 'ocean-atlantski');
  await expect(page.getByRole('status')).toContainText('To je Atlantski ocean. Poskusi znova!');
  await tapShape(page, 'ocean-tihi');
  await expect(page.getByRole('dialog')).toContainText('Tihi ocean');
});
