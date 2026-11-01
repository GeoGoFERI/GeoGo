import { expect, test } from '@playwright/test';

test('app loads and works offline after the first visit', async ({ page, context }) => {
  await page.goto('/');
  await expect(page.getByRole('img', { name: 'GeoGo' })).toBeVisible();
  const hasWorker = await page.evaluate(async () => {
    const reg = await navigator.serviceWorker.ready;
    return reg.active !== null;
  });
  expect(hasWorker).toBe(true);
  const manifest = await page.request.get('/manifest.webmanifest');
  expect(manifest.ok()).toBe(true);

  // Second load with the network off must come from the precache.
  await context.setOffline(true);
  await page.reload();
  await expect(page.getByRole('img', { name: 'GeoGo' })).toBeVisible();
  await context.setOffline(false);
});

test('the app makes no third-party requests while playing', async ({ page }) => {
  const foreign: string[] = [];
  page.on('request', (request) => {
    const url = new URL(request.url());
    if (url.hostname !== 'localhost' && url.protocol !== 'data:' && url.protocol !== 'blob:') {
      foreign.push(request.url());
    }
  });
  await page.goto('/?round=country-si');
  await page.getByRole('button', { name: 'Začni' }).click();
  await expect(page.locator('path.shape').first()).toBeVisible();
  await page.getByRole('button', { name: 'Pomoč' }).click();
  await page.goto('/');
  await page.getByRole('button', { name: 'Moj atlas' }).click();
  await expect(page.locator('path.shape').first()).toBeVisible();
  expect(foreign).toEqual([]);
});
