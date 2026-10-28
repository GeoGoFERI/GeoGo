import { expect, test } from '@playwright/test';

test('mini-game: sort countries into coastal and landlocked', async ({ page }) => {
  await page.goto('/?seed=5');
  await page.getByRole('button', { name: 'Obmorska ali celinska?' }).click();
  await page.getByRole('button', { name: 'Začni' }).click();

  for (let i = 1; i <= 10; i += 1) {
    await expect(page.getByText(`Karta ${String(i)} od 10`)).toBeVisible();
    const name = (await page.getByTestId('coast-name').textContent()) ?? '';
    await page.getByRole('button', { name: 'Obmorska država' }).click();
    // Feedback always names the country and its true bin, with an icon.
    await expect(page.getByRole('status')).toContainText(`${name}: `);
    if (i === 1 && process.env.SHOT_DIR) {
      await page.screenshot({
        path: `${process.env.SHOT_DIR}/coast-${test.info().project.name}.png`,
      });
    }
    await page.getByRole('button', { name: 'Naprej' }).click();
  }
  // The hand is balanced, so always picking "obmorska" scores exactly half.
  await expect(page.getByText('5 od 10 pravilno')).toBeVisible();
  await expect(page.getByTestId('coast-headline')).toHaveText(
    'Obmorske in celinske države že dobro ločiš.',
  );
  await page.getByRole('button', { name: 'Še enkrat' }).click();
  await expect(page.getByText('Karta 1 od 10')).toBeVisible();
});
