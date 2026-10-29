import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';
import { settle, tapShape } from './helpers';

// fails on serious or critical axe violations and lists them readably
const scan = async (page: Page, where: string): Promise<void> => {
  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
    .analyze();
  const bad = results.violations.filter((v) => v.impact === 'serious' || v.impact === 'critical');
  const report = bad.map(
    (v) =>
      `${where}: ${v.id} (${v.impact}) ${v.nodes
        .map((n) => n.target.join(' '))
        .slice(0, 3)
        .join(', ')}`,
  );
  expect(report).toEqual([]);
};

test('no serious accessibility violations on the main screens', async ({ page }) => {
  await page.goto('/?round=country-si');
  await expect(page.getByRole('button', { name: 'Začni' })).toBeEnabled();
  await scan(page, 'start');

  await page.getByRole('button', { name: 'Začni' }).click();
  await settle(page);
  await scan(page, 'play');
  await tapShape(page, 'country-hu');
  await scan(page, 'wrong');
  await tapShape(page, 'country-si');
  await scan(page, 'fact');
  await page.getByRole('button', { name: 'Naprej' }).click();
  await scan(page, 'summary');
  await page.getByRole('button', { name: 'Domov' }).click();
  await page.getByRole('button', { name: 'Moj atlas' }).click();
  await settle(page);
  await scan(page, 'atlas');
});

test('every start-screen control is reachable by Tab with a visible focus ring', async ({
  page,
}) => {
  await page.goto('/');
  await expect(page.getByRole('button', { name: 'Začni' })).toBeEnabled();
  const reached = new Set<string>();
  for (let i = 0; i < 12; i += 1) {
    await page.keyboard.press('Tab');
    const info = await page.evaluate(() => {
      const el = document.activeElement as HTMLElement | null;
      // Tabbing past the last control leaves the page; that is not a control.
      if (!el || el === document.body) return null;
      const style = getComputedStyle(el);
      return { text: el.textContent?.trim() ?? '', outline: style.outlineStyle };
    });
    if (info) {
      reached.add(info.text);
      expect(info.outline).not.toBe('none');
    }
  }
  for (const label of ['Države Evrope', 'Začni', 'Moj atlas']) {
    expect([...reached].some((t) => t.includes(label))).toBe(true);
  }
});

test('reduced motion: no shake, flash or confetti animations', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/?round=country-si');
  await page.getByRole('button', { name: 'Začni' }).click();
  await settle(page);
  await tapShape(page, 'country-hu');
  for (let i = 0; i < 3; i += 1) await page.getByRole('button', { name: 'Pomoč' }).click();
  await tapShape(page, 'country-si');
  const running = await page.evaluate(
    () => document.getAnimations().filter((a) => a.playState === 'running').length,
  );
  expect(running).toBe(0);
});
