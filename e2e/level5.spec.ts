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

test('Level 5: the Tigris does not take taps on the Euphrates', async ({ page }) => {
  await page.goto('/?round=river-evfrat');
  await page.getByRole('button', { name: /Celine sveta/ }).click();
  await page.getByRole('button', { name: 'Začni' }).click();
  await page.waitForTimeout(600);
  const at = await page.evaluate(() => {
    const el = document.querySelector<SVGPathElement>('path[data-id="river-evfrat"]');
    const ctm = el?.getScreenCTM();
    if (!el || !ctm) return null;
    const q = el.getPointAtLength(el.getTotalLength() * 0.3);
    return { x: ctm.a * q.x + ctm.c * q.y + ctm.e, y: ctm.b * q.x + ctm.d * q.y + ctm.f };
  });
  if (!at) throw new Error('no Euphrates');
  await page.mouse.click(at.x, at.y);
  await expect(page.getByRole('dialog')).toBeVisible();
});
