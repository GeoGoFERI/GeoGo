import { expect, test } from '@playwright/test';
import { settle, tapLine, tapShape } from './helpers';

test('Level 2: the equator, a hemisphere question and a pole', async ({ page }) => {
  await page.goto('/?round=line-ekvator,hemisphere:country-au:hemisphere-juzna,pole-severni');
  await page.getByRole('button', { name: /Orientacija/ }).click();
  await page.getByRole('button', { name: 'Začni' }).click();
  await settle(page);

  await expect(page.getByTestId('prompt-name')).toHaveText('ekvator');
  await tapLine(page, 'line-zacetni-poldnevnik', 0.3);
  await expect(page.getByRole('status')).toContainText('To je začetni (greenwiški) poldnevnik.');
  await tapLine(page, 'line-ekvator', 0.4);
  await expect(page.getByRole('dialog')).toContainText('ekvator');
  await page.getByRole('button', { name: 'Naprej' }).click();
  await settle(page);

  await expect(page.getByText('V kateri polobli leži')).toBeVisible();
  await expect(page.getByTestId('prompt-name')).toHaveText('Avstralija?');
  await expect(page.getByText('Severna ali južna?')).toBeVisible();
  if (process.env.SHOT_DIR) {
    await page.screenshot({
      path: `${process.env.SHOT_DIR}/level2-${test.info().project.name}.png`,
    });
  }
  await tapShape(page, 'hemisphere-severna');
  await expect(page.getByRole('status')).toContainText('To je severna polobla. Poskusi znova!');
  await tapShape(page, 'hemisphere-juzna');
  await expect(page.getByRole('dialog')).toContainText('južna polobla');
  await expect(page.getByRole('dialog')).toContainText('Država: Avstralija');
  await page.getByRole('button', { name: 'Naprej' }).click();
  await settle(page);

  await expect(page.getByTestId('prompt-name')).toHaveText('severni pol');
  const pole = await page.locator('circle[data-hit-id="pole-severni"]').boundingBox();
  if (!pole) throw new Error('no pole');
  await page.mouse.click(pole.x + pole.width / 2, pole.y + pole.height / 2);
  await expect(page.getByRole('dialog')).toContainText('severni pol');
});
