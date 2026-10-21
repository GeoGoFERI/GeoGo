import { expect, test } from '@playwright/test';

test('app loads and works offline after the first visit', async ({ page, context }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'GeoGo' })).toBeVisible();
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
  await expect(page.getByRole('heading', { name: 'GeoGo' })).toBeVisible();
  await context.setOffline(false);
});
