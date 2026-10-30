import { expect, test, type Page } from '@playwright/test';
import { settle, tapShape } from './helpers';

test.use({ viewport: { width: 360, height: 640 }, hasTouch: true });

// horizontal overflow in pixels (0 when the page fits)
async function overflow(page: Page): Promise<number> {
  return page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  );
}

// visible buttons smaller than 44 px in either direction, as readable strings
const smallTargets = async (page: Page): Promise<string[]> => {
  return page.evaluate(() =>
    [...document.querySelectorAll<HTMLElement>('button')]
      .filter((b) => b.offsetParent !== null)
      .map((b) => ({
        text: b.textContent?.trim() || b.getAttribute('aria-label') || '?',
        r: b.getBoundingClientRect(),
      }))
      .filter(({ r }) => r.width < 44 || r.height < 44)
      .map(
        ({ text, r }) => `${text} ${String(Math.round(r.width))}x${String(Math.round(r.height))}`,
      ),
  );
};

// no sideways scrolling, and every visible button is at least 44 px in both directions
const checkScreen = async (page: Page, where: string): Promise<void> => {
  await expect
    .poll(() => overflow(page), { message: `${where}: horizontal overflow` })
    .toBeLessThanOrEqual(0);
  await expect
    .poll(() => smallTargets(page), { message: `${where}: small touch targets` })
    .toEqual([]);
};

test('phone: every screen fits the width and has big enough buttons', async ({ page }) => {
  await page.goto('/?round=country-si');
  await expect(page.getByRole('button', { name: 'Začni' })).toBeEnabled();
  await checkScreen(page, 'start');
  // The main action is on screen without scrolling.
  await expect(page.getByRole('button', { name: 'Začni' })).toBeInViewport();
  if (process.env.SHOT_DIR)
    await page.screenshot({ path: `${process.env.SHOT_DIR}/phone-start.png` });

  await page.getByRole('button', { name: 'Začni' }).click();
  await settle(page);
  await checkScreen(page, 'play');
  await tapShape(page, 'country-si');
  await checkScreen(page, 'fact');
  await expect(page.getByRole('button', { name: 'Naprej' })).toBeInViewport();
  await page.getByRole('button', { name: 'Naprej' }).click();
  await checkScreen(page, 'summary');
  await page.getByRole('button', { name: 'Domov' }).click();
  await page.getByRole('button', { name: 'Moj atlas' }).click();
  await checkScreen(page, 'atlas');
  await page.getByRole('button', { name: 'Nazaj' }).click();
  await page.getByRole('button', { name: 'Obmorska ali celinska?' }).click();
  await page.getByRole('button', { name: 'Začni' }).click();
  await checkScreen(page, 'coast');
  await page.getByRole('button', { name: 'Obmorska država' }).click();
  await expect(page.getByRole('button', { name: 'Naprej' })).toBeInViewport();
});
