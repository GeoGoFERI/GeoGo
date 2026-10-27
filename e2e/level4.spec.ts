import { expect, test } from '@playwright/test';
import { settle, tapLine, tapShape } from './helpers';

test('Level 4: a mountain range, a river and a sea', async ({ page }) => {
  await page.goto('/?round=mountain-alpe,river-donava,sea-jadransko,peninsula-apeninski');
  await page.getByRole('button', { name: /Narava Evrope/ }).click();
  await page.getByRole('button', { name: 'Začni' }).click();
  await settle(page);

  await expect(page.getByTestId('prompt-name')).toHaveText('Alpe');
  if (process.env.SHOT_DIR) {
    await page.screenshot({
      path: `${process.env.SHOT_DIR}/level4-${test.info().project.name}.png`,
    });
  }
  await tapShape(page, 'mountain-karpati');
  await expect(page.getByRole('status')).toContainText('To je Karpati. Poskusi znova!');
  await tapShape(page, 'mountain-alpe');
  await expect(page.getByRole('dialog')).toContainText('Alpe');
  await expect(page.getByRole('dialog')).toContainText('mlado nagubano gorstvo');
  if (process.env.SHOT_DIR) {
    await settle(page);
    await page.screenshot({ path: `${process.env.SHOT_DIR}/level4-fact-${test.info().project.name}.png` });
  }
  await page.getByRole('button', { name: 'Naprej' }).click();
  await settle(page);

  await expect(page.getByTestId('prompt-name')).toHaveText('Donava');
  await tapLine(page, 'river-donava', 0.5);
  await expect(page.getByRole('dialog')).toContainText('Donava');
  await page.getByRole('button', { name: 'Naprej' }).click();
  await settle(page);

  await expect(page.getByTestId('prompt-name')).toHaveText('Jadransko morje');
  await tapShape(page, 'sea-jadransko');
  await expect(page.getByRole('dialog')).toContainText('Jadransko morje');
  await page.getByRole('button', { name: 'Naprej' }).click();
  await settle(page);

  await expect(page.getByTestId('prompt-name')).toHaveText('Apeninski polotok');
  if (process.env.SHOT_DIR) {
    await page.screenshot({
      path: `${process.env.SHOT_DIR}/level4-land-${test.info().project.name}.png`,
    });
  }
  await tapShape(page, 'peninsula-apeninski');
  await expect(page.getByRole('dialog')).toContainText('Apeninski polotok');
});
