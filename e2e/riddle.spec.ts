import { expect, test } from '@playwright/test';
import { settle, tapShape } from './helpers';

test('riddle mode: read the riddle (aloud if a Slovenian voice exists) and find the country', async ({
  page,
}) => {
  // A fake Slovenian voice, so the read-aloud button appears and its text can be checked.
  await page.addInitScript(() => {
    const spoken: string[] = [];
    const w = window as unknown as Record<string, unknown>;
    w.__spoken = spoken;
    w.SpeechSynthesisUtterance = class {
      text: string;
      voice: unknown = null;
      lang = '';
      constructor(text: string) {
        this.text = text;
      }
    };
    Object.defineProperty(window, 'speechSynthesis', {
      value: {
        getVoices: () => [{ lang: 'sl-SI', name: 'Test' }],
        speak: (u: { text: string }) => spoken.push(u.text),
        cancel: () => undefined,
        addEventListener: () => undefined,
        removeEventListener: () => undefined,
      },
    });
  });
  await page.goto('/?round=country-si');
  await page.getByRole('button', { name: 'Uganka' }).click();
  await expect(page.getByRole('button', { name: 'Uganka' })).toHaveAttribute(
    'aria-pressed',
    'true',
  );
  await page.getByRole('button', { name: 'Začni' }).click();
  await settle(page);

  await expect(page.getByText('Katera država je to?')).toBeVisible();
  await expect(page.getByTestId('riddle')).toContainText(
    'Sosednje države: Avstrija, Hrvaška, Italija, Madžarska',
  );
  await expect(page.getByTestId('riddle')).not.toContainText('Slovenija');
  await page.getByRole('button', { name: 'Preberi na glas' }).click();
  const spoken = await page.evaluate(() => (window as unknown as { __spoken: string[] }).__spoken);
  expect(spoken[0]).toContain('Obmorska država.');

  await tapShape(page, 'country-si');
  await expect(page.getByRole('dialog')).toContainText('Slovenija');
});

test('riddle mode hides the read-aloud button without a Slovenian voice', async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(window, 'speechSynthesis', {
      value: {
        getVoices: () => [{ lang: 'en-US', name: 'English' }],
        speak: () => undefined,
        cancel: () => undefined,
        addEventListener: () => undefined,
        removeEventListener: () => undefined,
      },
    });
  });
  await page.goto('/?round=country-si');
  await page.getByRole('button', { name: 'Uganka' }).click();
  await page.getByRole('button', { name: 'Začni' }).click();
  await expect(page.getByTestId('riddle')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Preberi na glas' })).toHaveCount(0);
});
