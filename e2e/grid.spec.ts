import { expect, test, type Page } from '@playwright/test';
import { settle } from './helpers';

async function tapPoint(page: Page, id: string): Promise<void> {
  const box = await page.locator(`circle[data-hit-id="${id}"]`).boundingBox();
  if (!box) throw new Error(`no point ${id}`);
  await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
}

test('grid mode: find the point by its distance from the equator and the prime meridian', async ({
  page,
}) => {
  await page.goto('/?round=pt:30:0');
  await page.getByRole('button', { name: /Orientacija/ }).click();
  await page.getByRole('button', { name: 'Točke na mreži' }).click();
  await page.getByRole('button', { name: 'Začni' }).click();
  await settle(page);

  await expect(page.getByText('Najdi točko:')).toBeVisible();
  await expect(page.getByTestId('riddle')).toContainText('30° severno od ekvatorja');
  await expect(page.getByTestId('riddle')).toContainText('na začetnem poldnevniku');
  // Degree labels are on the map.
  await expect(page.locator('.map-label', { hasText: '30° S' })).toHaveCount(1);
  if (process.env.SHOT_DIR) {
    await page.screenshot({ path: `${process.env.SHOT_DIR}/grid-${test.info().project.name}.png` });
  }

  await tapPoint(page, 'pt:0:0');
  await expect(page.getByRole('status')).toContainText(
    'To je točka na ekvatorju, na začetnem poldnevniku. Poskusi znova!',
  );
  await tapPoint(page, 'pt:30:0');
  await expect(page.getByRole('dialog')).toContainText('Tukaj je: Alžirija');
  await page.getByRole('button', { name: 'Naprej' }).click();
  await expect(page.getByRole('heading', { name: 'Konec kroga' })).toBeVisible();
  // Grid points are not items: no progress was recorded.
  const saved = await page.evaluate(() => localStorage.getItem('geogo.progress'));
  expect(JSON.parse(saved ?? '{}')).toMatchObject({ roundsPlayed: 0 });
});
