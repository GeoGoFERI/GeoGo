import { expect, test } from '@playwright/test';
import { settle, tapLine, tapShape } from './helpers';

test('Level 5: a river in Africa and Eurasia', async ({ page }) => {
  await page.goto('/?round=river-nil,peninsula-arabski');
  await page.getByRole('button', { name: /Celine sveta/ }).click();
  await page.getByRole('button', { name: 'Začni' }).click();
  await settle(page);

  await expect(page.getByTestId('prompt-name')).toHaveText('Nil');
  if (process.env.SHOT_DIR) {
    await page.screenshot({
      path: `${process.env.SHOT_DIR}/level5-${test.info().project.name}.png`,
    });
  }
  await tapLine(page, 'river-niger', 0.5);
  await expect(page.getByRole('status')).toContainText('To je Niger. Poskusi znova!');
  await tapLine(page, 'river-nil', 0.6);
  await expect(page.getByRole('dialog')).toContainText('Nil');
  await page.getByRole('button', { name: 'Naprej' }).click();
  await settle(page);

  await expect(page.getByTestId('prompt-name')).toHaveText('Arabski polotok');
  await tapShape(page, 'peninsula-arabski');
  await expect(page.getByRole('dialog')).toContainText('Arabski polotok');
});
