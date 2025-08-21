import { test, expect } from '@playwright/test';

test.describe('Homepage Start Stap Test', () => {
  test('moet start-stap component tonen op homepage', async ({ page }) => {
    await page.goto('/');
    
    // Wacht tot de pagina volledig is geladen
    await page.waitForLoadState('networkidle');
    
    // Wacht specifiek op Angular app to load
    await page.waitForSelector('app-root', { timeout: 10000 });
    
    // Log de HTML content voor debugging
    const bodyContent = await page.locator('body').innerHTML();
    console.log('Page content:', bodyContent);
    
    // Wacht op router-outlet content
    await page.waitForFunction(
      () => document.querySelector('router-outlet')?.nextElementSibling !== null,
      { timeout: 15000 }
    );
    
    // Controleer of de start tekst zichtbaar is
    await expect(page.locator('text=Zie je zwerfafval?')).toBeVisible({ timeout: 15000 });
    
    // Controleer of de start knop zichtbaar is
    await expect(page.locator('text=🚀 Start melding')).toBeVisible({ timeout: 15000 });
    
    // Controleer of de veiligheidsmelding zichtbaar is
    await expect(page.locator('text=Veilig en anoniem')).toBeVisible({ timeout: 15000 });
  });
  
  test('moet kunnen navigeren naar foto stap', async ({ page }) => {
    await page.goto('/');
    
    // Wacht tot de pagina volledig is geladen
    await page.waitForLoadState('networkidle');
    
    // Wacht op de start knop
    await page.waitForSelector('text=🚀 Start melding', { timeout: 15000 });
    
    // Klik op de start knop
    await page.click('text=🚀 Start melding');
    
    // Controleer of we naar de foto stap gaan
    await expect(page.locator('text=Maak een foto')).toBeVisible({ timeout: 15000 });
  });
});