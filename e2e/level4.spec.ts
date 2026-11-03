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
    await page.screenshot({
      path: `${process.env.SHOT_DIR}/level4-fact-${test.info().project.name}.png`,
    });
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

test('Level 4: the mouse near a river highlights that river only', async ({ page }) => {
  test.skip(test.info().project.use.hasTouch === true, 'hover needs a mouse');
  await page.goto('/?round=river-donava');
  await page.getByRole('button', { name: /Narava Evrope/ }).click();
  await page.getByRole('button', { name: 'Začni' }).click();
  await settle(page);
  // A point 4 px beside the Danube: inside its invisible tap zone, off the drawn line.
  const at = await page.evaluate(() => {
    const el = document.querySelector<SVGPathElement>('path[data-id="river-donava"]');
    const ctm = el?.getScreenCTM();
    if (!el || !ctm) return null;
    const q = el.getPointAtLength(el.getTotalLength() * 0.5);
    return { x: ctm.a * q.x + ctm.c * q.y + ctm.e, y: ctm.b * q.x + ctm.d * q.y + ctm.f + 4 };
  });
  if (!at) throw new Error('no Danube');
  await page.mouse.move(at.x, at.y);
  const stroke = (id: string): Promise<string> =>
    page.locator(`path[data-id="${id}"]`).evaluate((el) => getComputedStyle(el).stroke);
  const hover = await stroke('river-donava');
  for (const id of ['river-ren', 'river-volga']) expect(await stroke(id)).not.toBe(hover);
  await page.mouse.move(5, 5);
  await expect.poll(() => stroke('river-donava')).toBe(await stroke('river-ren'));
});
