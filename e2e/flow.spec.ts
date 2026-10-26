import { expect, test, type Page } from '@playwright/test';
import { settle, tapShape } from './helpers';

// The main flow at all three viewports: start, a full round of 10, summary.
// With SCREENSHOTS=1 (npm run screenshots) it saves docs/screenshots/, which are committed.

const ROUND = [
  'country-si',
  'country-de',
  'country-fr',
  'country-es',
  'country-it',
  'country-pl',
  'country-se',
  'country-ro',
  'country-hr',
  'country-at',
];

async function shot(page: Page, name: string): Promise<void> {
  if (!process.env.SCREENSHOTS) return;
  await page.screenshot({ path: `docs/screenshots/${test.info().project.name}-${name}.png` });
}

test('play a full Level 3 round from start to summary', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto(`/?seed=3&round=${ROUND.join(',')}`);
  await expect(page.getByRole('button', { name: 'Začni' })).toBeEnabled();
  await shot(page, '1-start');
  await page.getByRole('button', { name: 'Začni' }).click();

  for (const [i, id] of ROUND.entries()) {
    await settle(page);
    await expect(
      page.getByRole('list', { name: `Vprašanje ${String(i + 1)} od 10` }),
    ).toBeVisible();
    if (i === 1) {
      // A wrong try first: the toast names what was clicked.
      await tapShape(page, 'country-at');
      await expect(page.getByRole('status')).toContainText('To je Avstrija. Poskusi znova!');
      await shot(page, '2-wrong');
    }
    if (i === 4) {
      await page.getByRole('button', { name: 'Pomoč' }).click();
      await settle(page);
      await page.getByRole('button', { name: 'Pomoč' }).click();
      await expect(page.getByRole('status')).toContainText('Sosednja država');
      await shot(page, '3-help');
    }
    await tapShape(page, id);
    await expect(page.getByRole('dialog')).toBeVisible();
    if (i === 0) {
      await settle(page);
      await shot(page, '4-fact');
    }
    await page.getByRole('button', { name: 'Naprej' }).click();
  }

  await expect(page.getByRole('heading', { name: 'Konec kroga' })).toBeVisible();
  // 8 x 3 + 2 (one wrong try) + 1 (help) = 27 of 30.
  await expect(page.getByText('27 od 30 zvezdic')).toBeVisible();
  await expect(page.getByTestId('summary-headline')).toHaveText('Države Evrope že odlično poznaš!');
  await shot(page, '5-summary');

  // Progress is saved: back on the start screen, the round shows up in the level card.
  await page.getByRole('button', { name: 'Domov' }).click();
  await expect(page.getByRole('button', { name: /Države Evrope/ })).toContainText('0 od 47 znaš');
  const saved = await page.evaluate(() => localStorage.getItem('geogo.progress'));
  expect(JSON.parse(saved ?? '{}')).toMatchObject({ version: 1, roundsPlayed: 1 });
});
