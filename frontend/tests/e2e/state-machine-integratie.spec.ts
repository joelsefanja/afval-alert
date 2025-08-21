import { test, expect } from '@playwright/test';

test.describe('State Machine Integratie Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Navigeer naar de afval melden pagina
    await page.goto('/afval-melden');
    // Wacht tot de pagina volledig geladen is
    await page.waitForSelector('ui-afval-melden-procedure', { state: 'visible' });
  });

  test('moet state behouden tijdens navigatie tussen stappen', async ({ page }) => {
    // Start stap
    await expect(page.locator('h2:has-text("Meld afval")')).toBeVisible();
    
    // Klik op de start knop
    await page.locator('button:has-text("Start melding")').click();
    
    // Foto stap
    await expect(page.locator('ui-foto-stap')).toBeVisible();
    
    // Simuleer foto upload
    const fileChooserPromise = page.waitForEvent('filechooser');
    await page.locator('button:has-text("Kies een foto")').click();
    const fileChooser = await fileChooserPromise;
    await fileChooser.setFiles({
      name: 'test-image.jpg',
      mimeType: 'image/jpeg',
      buffer: Buffer.from('test image content')
    });
    
    // Controleer of de foto preview zichtbaar is
    await expect(page.locator('.foto-preview')).toBeVisible();
    
    // Klik op volgende na foto upload
    await page.locator('button:has-text("Volgende")').click();
    
    // Locatie stap
    await expect(page.locator('ui-locatie-stap')).toBeVisible();
    
    // Vul adres in
    await page.locator('p-autoComplete input').fill('Grote Markt 1, Groningen');
    await page.waitForTimeout(500); // Wacht op suggesties
    await page.keyboard.press('Enter');
    
    // Ga terug naar foto stap
    await page.locator('ui-terug-knop').click();
    
    // Controleer of de foto nog steeds zichtbaar is (state behouden)
    await expect(page.locator('.foto-preview')).toBeVisible();
    
    // Ga weer naar locatie stap
    await page.locator('button:has-text("Volgende")').click();
    
    // Controleer of het adres nog steeds ingevuld is (state behouden)
    const adresInput = page.locator('p-autoComplete input');
    await expect(adresInput).toHaveValue('Grote Markt 1, Groningen');
  });

  test('moet voortgangsbalk correct bijwerken bij stap verandering', async ({ page }) => {
    // Start stap
    await expect(page.locator('ui-voortgangs-balk')).not.toBeVisible();
    
    // Klik op de start knop
    await page.locator('button:has-text("Start melding")').click();
    
    // Foto stap - voortgangsbalk moet zichtbaar zijn met stap 1/5
    await expect(page.locator('ui-voortgangs-balk')).toBeVisible();
    await expect(page.locator('text=1/5')).toBeVisible();
    
    // Simuleer foto upload
    const fileChooserPromise = page.waitForEvent('filechooser');
    await page.locator('button:has-text("Kies een foto")').click();
    const fileChooser = await fileChooserPromise;
    await fileChooser.setFiles({
      name: 'test-image.jpg',
      mimeType: 'image/jpeg',
      buffer: Buffer.from('test image content')
    });
    
    // Klik op volgende na foto upload
    await page.locator('button:has-text("Volgende")').click();
    
    // Locatie stap - voortgangsbalk moet bijgewerkt zijn naar stap 2/5
    await expect(page.locator('ui-voortgangs-balk')).toBeVisible();
    await expect(page.locator('text=2/5')).toBeVisible();
  });

  test('moet stappen-indicator correct bijwerken', async ({ page }) => {
    // Start stap - geen stappen-indicator
    await expect(page.locator('ui-stappen-indicator')).not.toBeVisible();
    
    // Klik op de start knop
    await page.locator('button:has-text("Start melding")').click();
    
    // Foto stap - stappen-indicator moet zichtbaar zijn
    await expect(page.locator('ui-stappen-indicator')).toBeVisible();
    
    // Eerste stap moet actief zijn
    const eersteStap = page.locator('ui-stappen-indicator li').nth(0);
    await expect(eersteStap).toHaveClass(/actief/);
    
    // Simuleer foto upload
    const fileChooserPromise = page.waitForEvent('filechooser');
    await page.locator('button:has-text("Kies een foto")').click();
    const fileChooser = await fileChooserPromise;
    await fileChooser.setFiles({
      name: 'test-image.jpg',
      mimeType: 'image/jpeg',
      buffer: Buffer.from('test image content')
    });
    
    // Klik op volgende na foto upload
    await page.locator('button:has-text("Volgende")').click();
    
    // Locatie stap - tweede stap moet actief zijn, eerste voltooid
    const eersteStapNaNavigatie = page.locator('ui-stappen-indicator li').nth(0);
    await expect(eersteStapNaNavigatie).toHaveClass(/voltooid/);
    
    const tweedeStap = page.locator('ui-stappen-indicator li').nth(1);
    await expect(tweedeStap).toHaveClass(/actief/);
  });

  test('moet offline status correct verwerken in state machine', async ({ page, context }) => {
    // Simuleer offline status
    await context.setOffline(true);
    
    // Herlaad de pagina
    await page.reload();
    
    // Controleer of de offline notificatie zichtbaar is
    await expect(page.locator('div.bg-orange-100')).toBeVisible();
    
    // Start de melding
    await page.locator('button:has-text("Start melding")').click();
    
    // Foto stap - offline indicator moet nog steeds zichtbaar zijn
    await expect(page.locator('div.bg-orange-100')).toBeVisible();
    
    // Ga terug online
    await context.setOffline(false);
    
    // Herlaad de pagina
    await page.reload();
    
    // Controleer of de offline notificatie niet meer zichtbaar is
    await expect(page.locator('div.bg-orange-100')).not.toBeVisible();
  });
});