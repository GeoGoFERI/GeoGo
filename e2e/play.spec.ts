import { expect, test, type Page } from '@playwright/test';

async function startRound(page: Page, ids: string[]): Promise<void> {
  await page.goto(`/?seed=1&round=${ids.join(',')}`);
  await page.getByRole('button', { name: 'Začni' }).click();
  await expect(page.locator('path.shape').first()).toBeVisible();
  await page.waitForTimeout(700);
}

async function centreOf(page: Page, id: string): Promise<{ x: number; y: number }> {
  const box = await page.locator(`path[data-id="${id}"]`).boundingBox();
  if (!box) throw new Error(`no shape ${id}`);
  return { x: box.x + box.width / 2, y: box.y + box.height / 2 };
}

test('a wrong click names the country, a right one opens the fact card', async ({ page }) => {
  await startRound(page, ['country-si', 'country-de']);
  await expect(page.getByTestId('prompt-name')).toHaveText('Slovenija');
  const hu = await centreOf(page, 'country-hu');
  await page.mouse.click(hu.x, hu.y);
  await expect(page.getByRole('status')).toContainText('To je Madžarska. Poskusi znova!');
  if (process.env.SHOT_DIR) {
    await page.screenshot({
      path: `${process.env.SHOT_DIR}/wrong-${test.info().project.name}.png`,
    });
  }
  const si = await centreOf(page, 'country-si');
  await page.mouse.click(si.x, si.y);
  await expect(page.getByRole('dialog')).toContainText('Slovenija');
  await expect(page.getByRole('dialog')).toContainText('Obmorska država');
  await expect(page.getByRole('dialog')).toContainText(
    'Sosednje države: Avstrija, Hrvaška, Italija, Madžarska',
  );
  if (process.env.SHOT_DIR) {
    await page.waitForTimeout(400);
    await page.screenshot({ path: `${process.env.SHOT_DIR}/fact-${test.info().project.name}.png` });
  }
  await page.getByRole('button', { name: 'Naprej' }).click();
  await expect(page.getByTestId('prompt-name')).toHaveText('Nemčija');
  // On a phone Luxembourg's tap circle overlaps Germany; a clear tap on Germany must still win.
  const de = await centreOf(page, 'country-de');
  await page.mouse.click(de.x, de.y);
  await expect(page.getByRole('dialog')).toContainText('Nemčija');
});

test('a tiny country can be tapped near it thanks to its circular hit area', async ({ page }) => {
  await startRound(page, ['country-lu']);
  const hit = page.locator('circle[data-hit-id="country-lu"]');
  const box = await hit.boundingBox();
  if (!box) throw new Error('no hit circle');
  expect(box.width).toBeGreaterThanOrEqual(43);
  await page.mouse.click(box.x + box.width / 2 + 10, box.y + box.height / 2);
  await expect(page.getByRole('dialog')).toContainText('Luksemburg');
});

test('help zooms in, names a neighbour, then flashes the target', async ({ page }) => {
  await startRound(page, ['country-si']);
  const layer = page.locator('g.map__layer');
  const scaleOf = async (): Promise<number> =>
    Number(/scale\(([\d.]+)\)/.exec((await layer.getAttribute('transform')) ?? '')?.[1] ?? 0);
  const before = await scaleOf();
  await page.getByRole('button', { name: 'Pomoč' }).click();
  await expect.poll(scaleOf).toBeGreaterThan(before * 1.5);
  await page.getByRole('button', { name: 'Pomoč' }).click();
  await expect(page.getByRole('status')).toContainText('Sosednja država: Avstrija');
  await page.getByRole('button', { name: 'Pomoč' }).click();
  await expect(page.locator('path[data-id="country-si"]')).toHaveClass(/shape--flash/);
});

test('zoom buttons, reset and dragging move the map', async ({ page }) => {
  await startRound(page, ['country-si']);
  const layer = page.locator('g.map__layer');
  const scaleOf = async (): Promise<number> =>
    Number(/scale\(([\d.]+)\)/.exec((await layer.getAttribute('transform')) ?? '')?.[1] ?? 0);
  const home = await scaleOf();
  expect(home).toBeGreaterThan(1.5);
  await page.getByRole('button', { name: 'Povečaj' }).click();
  await expect.poll(scaleOf).toBeCloseTo(home * 1.6, 1);
  await page.getByRole('button', { name: 'Pokaži ves zemljevid' }).click();
  await expect.poll(scaleOf).toBeCloseTo(home, 1);
  await page.waitForTimeout(600);
  const before = await layer.getAttribute('transform');
  const box = await page.locator('svg.map__svg').boundingBox();
  if (!box) throw new Error('no map');
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.down();
  await page.mouse.move(box.x + box.width / 2 + 60, box.y + box.height / 2 + 20, { steps: 5 });
  await page.mouse.up();
  expect(await layer.getAttribute('transform')).not.toBe(before);
});

test('the map can be played by keyboard', async ({ page }) => {
  await startRound(page, ['country-si']);
  await page.locator('path[data-id="country-at"]').focus();
  await page.keyboard.press('ArrowDown');
  const focused = await page.evaluate(() => document.activeElement?.getAttribute('data-id'));
  expect(focused).toBeTruthy();
  expect(focused).not.toBe('country-at');
  await page.keyboard.press('Enter');
  await expect(page.locator('.toast, .fact').first()).toBeVisible();
});

test('the summary describes the round and replays weak items', async ({ page }) => {
  await startRound(page, ['country-si', 'country-de']);
  // Slovenia: one wrong try (2 stars). Germany: first try (3 stars).
  const hu = await centreOf(page, 'country-hu');
  await page.mouse.click(hu.x, hu.y);
  const si = await centreOf(page, 'country-si');
  await page.mouse.click(si.x, si.y);
  await page.getByRole('button', { name: 'Naprej' }).click();
  await page.waitForTimeout(600);
  const de = await centreOf(page, 'country-de');
  await page.mouse.click(de.x, de.y);
  await page.getByRole('button', { name: 'Naprej' }).click();

  await expect(page.getByRole('heading', { name: 'Konec kroga' })).toBeVisible();
  await expect(page.getByText('5 od 6 zvezdic')).toBeVisible();
  await expect(page.getByTestId('summary-headline')).toHaveText('Evropo že dobro poznaš.');
  if (process.env.SHOT_DIR) {
    await page.screenshot({
      path: `${process.env.SHOT_DIR}/summary-${test.info().project.name}.png`,
    });
  }
  await page.getByRole('button', { name: 'Ponovi težje' }).click();
  await expect(page.getByTestId('prompt-name')).toHaveText('Slovenija');
  await expect(page.getByRole('list', { name: 'Vprašanje 1 od 1' })).toBeVisible();
});
