import { test, expect } from '@playwright/test';

test.describe('Afval Melden Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/afval-melden');
  });

  test('should go through the entire flow', async ({ page }) => {
    // 1. Start stap
    await expect(page.locator('app-start-stap')).toBeVisible();
    await page.click('button:has-text("Start melding")');

    // 2. Foto stap
    await expect(page.locator('app-foto-stap')).toBeVisible();
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles({
      name: 'test-image.png',
      mimeType: 'image/png',
      buffer: Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==', 'base64'),
    });
    await page.click('button:has-text("Volgende")');

    // 3. Locatie stap
    await expect(page.locator('app-locatie-stap')).toBeVisible();
    const map = page.locator('app-kaart .leaflet-container');
    await map.waitFor();
    await map.click({ position: { x: 100, y: 100 } });
    await page.click('button:has-text("Volgende")');

    // 4. Contact stap
    await expect(page.locator('app-contact-stap')).toBeVisible();
    await page.fill('input[formControlName="naam"]', 'Test Gebruiker');
    await page.fill('input[formControlName="email"]', 'test@example.com');
    await page.click('button:has-text("Volgende")');

    // 5. Controle stap
    await expect(page.locator('app-controle-stap')).toBeVisible();
    await expect(page.locator('dd:has-text("Test Gebruiker")')).toBeVisible();
    await expect(page.locator('dd:has-text("test@example.com")')).toBeVisible();
    await page.click('button:has-text("Versturen")');

    // 6. Succes stap
    await expect(page.locator('app-succes-stap')).toBeVisible();
    await expect(page.locator('h2:has-text("Melding succesvol!")')).toBeVisible();
  });
});
