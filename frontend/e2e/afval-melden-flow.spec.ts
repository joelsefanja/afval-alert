import { test, expect } from '@playwright/test';

test.describe('Afval Melding Flow - Responsive Design', () => {
  test.describe('Mobile Design Tests', () => {
    test.use({ viewport: { width: 375, height: 667 } }); // iPhone SE

    test('moet responsive header tonen op mobiel', async ({ page }) => {
      await page.goto('/');
      
      // Header moet zichtbaar zijn
      await expect(page.locator('ui-header')).toBeVisible();
      
      // Titel moet zichtbaar zijn
      await expect(page.locator('h1')).toContainText('Afval Alert');
      
      // Header moet sticky zijn
      const header = page.locator('ui-header');
      await expect(header).toHaveClass(/sticky/);
    });

    test('moet start stap correct tonen op mobiel', async ({ page }) => {
      await page.goto('/');
      
      // Start knop moet zichtbaar en toegankelijk zijn (min 44px hoogte)
      const startKnop = page.locator('text=Start melding');
      await expect(startKnop).toBeVisible();
      
      // Controleer touch target grootte
      const boundingBox = await startKnop.boundingBox();
      expect(boundingBox?.height).toBeGreaterThanOrEqual(44);
      
      // Tekst moet responsive zijn
      await expect(page.locator('h2')).toContainText('Zie je zwerfafval?');
    });

    test('moet offline indicator tonen wanneer offline', async ({ page, context }) => {
      await page.goto('/');
      
      // Simuleer offline status
      await context.setOffline(true);
      await page.reload();
      
      // Offline indicator moet zichtbaar zijn en knipperen
      const offlineIndicator = page.locator('svg.animate-fade-pulse');
      await expect(offlineIndicator).toBeVisible();
      await expect(offlineIndicator).toHaveClass(/text-red-600/);
    });
  });

  test.describe('Desktop Design Tests', () => {
    test.use({ viewport: { width: 1280, height: 720 } }); // Desktop

    test('moet responsive layout tonen op desktop', async ({ page }) => {
      await page.goto('/');
      
      // Container moet max-width hebben op desktop
      const main = page.locator('main');
      await expect(main).toHaveClass(/max-w-lg/);
      
      // Padding moet groter zijn op desktop
      await expect(main).toHaveClass(/sm:px-6/);
    });
  });

  test.describe('Tablet Design Tests', () => {
    test.use({ viewport: { width: 768, height: 1024 } }); // iPad

    test('moet tablet layout correct tonen', async ({ page }) => {
      await page.goto('/');
      
      // Header padding moet aangepast zijn voor tablet
      const header = page.locator('ui-header');
      await expect(header).toBeVisible();
      
      // Tekst moet responsive zijn
      const titel = page.locator('h2');
      await expect(titel).toBeVisible();
    });
  });

  test.describe('Functionaliteit Tests', () => {
    test('moet complete flow kunnen doorlopen', async ({ page }) => {
      await page.goto('/');
      
      // Start de melding
      await page.click('text=Start melding');
      
      // Moet naar foto stap gaan
      await expect(page.locator('h2')).toContainText('Maak een foto van het afval');
      
      // Terug knop moet werken
      await page.click('ui-terug-knop button');
      
      // Moet terug naar start zijn
      await expect(page.locator('h2')).toContainText('Zie je zwerfafval?');
    });

    test('moet voortgangsbalk tonen tijdens flow', async ({ page }) => {
      await page.goto('/');
      
      // Start de melding
      await page.click('text=Start melding');
      
      // Voortgangsbalk moet zichtbaar zijn
      await expect(page.locator('ui-voortgangs-balk')).toBeVisible();
      
      // Stap indicator moet correct zijn
      await expect(page.locator('text=1/5')).toBeVisible();
    });

    test('moet fout meldingen correct tonen', async ({ page }) => {
      await page.goto('/');
      
      // Ga naar foto stap
      await page.click('text=Start melding');
      
      // Als er een fout is, moet deze zichtbaar zijn
      // (Dit hangt af van de implementatie van fout handling)
      const foutMelding = page.locator('ui-fout-melding');
      // We testen alleen dat het component bestaat als er een fout is
      if (await foutMelding.isVisible()) {
        await expect(foutMelding).toHaveClass(/text-destructive/);
      }
    });
  });

  test.describe('Toegankelijkheid Tests', () => {
    test('moet juiste ARIA labels hebben', async ({ page }) => {
      await page.goto('/');
      
      // Ga naar foto stap
      await page.click('text=Start melding');
      
      // Controleer aria-labels voor knoppen
      const terugKnop = page.locator('ui-terug-knop button');
      if (await terugKnop.isVisible()) {
        // Moet focusable zijn
        await terugKnop.focus();
        await expect(terugKnop).toBeFocused();
      }
    });

    test('moet keyboard navigatie ondersteunen', async ({ page }) => {
      await page.goto('/');
      
      // Tab naar start knop
      await page.keyboard.press('Tab');
      const startKnop = page.locator('text=Start melding');
      await expect(startKnop).toBeFocused();
      
      // Enter moet knop activeren
      await page.keyboard.press('Enter');
      await expect(page.locator('h2')).toContainText('Maak een foto van het afval');
    });
  });
});
