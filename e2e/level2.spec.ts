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

test('Level 2: both poles can be tapped from the home view', async ({ page }) => {
  await page.goto('/?round=pole-juzni,pole-severni');
  await page.getByRole('button', { name: /Orientacija/ }).click();
  await page.getByRole('button', { name: 'Začni' }).click();
  for (const id of ['pole-juzni', 'pole-severni']) {
    await page.waitForTimeout(600);
    const map = await page.locator('svg.map__svg').boundingBox();
    const dot = await page.locator(`circle.hit-dot--point[data-id="${id}"]`).boundingBox();
    if (!map || !dot) throw new Error(`no ${id}`);
    expect(dot.y).toBeGreaterThanOrEqual(map.y);
    expect(dot.y + dot.height).toBeLessThanOrEqual(map.y + map.height);
    await page.mouse.click(dot.x + dot.width / 2, dot.y + dot.height / 2);
    await expect(page.getByRole('dialog')).toBeVisible();
    await page.getByRole('button', { name: 'Naprej' }).click();
  }
});

test('Level 2 grid: the edge points are inside the map', async ({ page }) => {
  await page.goto('/?round=pt:0:-150,pt:0:150,pt:0:180');
  await page.getByRole('button', { name: /Orientacija/ }).click();
  await page.getByRole('button', { name: 'Točke na mreži', exact: true }).click();
  await page.getByRole('button', { name: 'Začni' }).click();
  await page.waitForTimeout(600);
  const map = await page.locator('svg.map__svg').boundingBox();
  for (const id of ['pt:0:-150', 'pt:0:150', 'pt:0:180']) {
    const p = await page.locator(`[data-id="${id}"]`).first().boundingBox();
    if (!map || !p) throw new Error(`no ${id}`);
    const cx = p.x + p.width / 2;
    expect(cx).toBeGreaterThan(map.x);
    expect(cx).toBeLessThan(map.x + map.width);
  }
});
