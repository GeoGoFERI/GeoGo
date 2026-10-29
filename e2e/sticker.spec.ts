import { expect, test } from '@playwright/test';
import { settle, tapShape } from './helpers';

const LEVEL1 = [
  'continent-evropa',
  'continent-afrika',
  'continent-severna-amerika',
  'continent-juzna-amerika',
  'continent-avstralija',
  'continent-antarktika',
  'ocean-atlantski',
  'ocean-tihi',
  'ocean-indijski',
  'ocean-arkticni',
  'ocean-juzni',
];

test('mastering the last item of a level earns its sticker', async ({ page }) => {
  // Everything in Level 1 is mastered except Asia, which is one clean answer away (box 2).
  await page.addInitScript((mastered: string[]) => {
    const items: Record<string, unknown> = {};
    for (const id of mastered) items[id] = { box: 3, seen: 2, firstTry: 2, lastRound: 1 };
    items['continent-azija'] = { box: 2, seen: 1, firstTry: 1, lastRound: 1 };
    if (!sessionStorage.getItem('seeded')) {
      localStorage.setItem(
        'geogo.progress',
        JSON.stringify({
          version: 1,
          roundsPlayed: 1,
          items,
          stickers: [],
          settings: { sound: false },
        }),
      );
      sessionStorage.setItem('seeded', '1');
    }
  }, LEVEL1);
  await page.goto('/?round=continent-azija');
  await page.getByRole('button', { name: /Celine in oceani/ }).click();
  await page.getByRole('button', { name: 'Začni' }).click();
  await settle(page);
  await tapShape(page, 'continent-azija');
  await page.getByRole('button', { name: 'Naprej' }).click();

  await expect(page.getByText('Nova nalepka: Celine in oceani!')).toBeVisible();
  if (process.env.SHOT_DIR) {
    await page.screenshot({
      path: `${process.env.SHOT_DIR}/sticker-${test.info().project.name}.png`,
    });
  }
  await page.getByRole('button', { name: 'Domov' }).click();
  await page.getByRole('button', { name: 'Moj atlas' }).click();
  await expect(page.getByTestId('sticker-1')).toHaveClass(/sticker--earned/);
  await expect(page.getByTestId('sticker-3')).not.toHaveClass(/sticker--earned/);
  await expect(page.getByTestId('sticker-3')).toContainText('Države Evrope: še zbiraš');
});
