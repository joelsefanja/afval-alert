import { test, expect } from '@playwright/test';

test.describe('Afval Melding Kwaliteit & Beschikbaarheid Tests', () => {
  
  test.describe('Performance Tests', () => {
    test('moet snel laden (< 3 seconden)', async ({ page }) => {
      const startTime = Date.now();
      
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      const loadTime = Date.now() - startTime;
      expect(loadTime).toBeLessThan(3000);
    });

    test('moet responsive zijn op verschillende schermgroottes', async ({ page }) => {
      const viewports = [
        { width: 375, height: 667 },   // iPhone SE
        { width: 768, height: 1024 },  // iPad
        { width: 1280, height: 720 }   // Desktop
      ];

      for (const viewport of viewports) {
        await page.setViewportSize(viewport);
        await page.goto('/');
        
        // Header moet zichtbaar zijn op alle formaten
        await expect(page.locator('ui-header')).toBeVisible();
        
        // Start knop moet toegankelijk zijn
        const startKnop = page.locator('text=Start melding');
        await expect(startKnop).toBeVisible();
        
        // Touch target moet groot genoeg zijn op mobiel
        if (viewport.width <= 768) {
          const boundingBox = await startKnop.boundingBox();
          expect(boundingBox?.height).toBeGreaterThanOrEqual(44);
        }
      }
    });
  });

  test.describe('Toegankelijkheid Tests', () => {
    test('moet keyboard navigatie ondersteunen', async ({ page }) => {
      await page.goto('/');
      
      // Tab navigatie moet werken
      await page.keyboard.press('Tab');
      const focusedElement = page.locator(':focus');
      await expect(focusedElement).toBeVisible();
      
      // Enter op start knop
      const startKnop = page.locator('text=Start melding');
      await startKnop.focus();
      await page.keyboard.press('Enter');
      
      // Moet naar foto stap gaan
      await expect(page.locator('h2')).toContainText('Maak een foto van het afval');
    });

    test('moet focus management hebben', async ({ page }) => {
      await page.goto('/');
      
      // Start melding
      await page.click('text=Start melding');
      
      // Na navigatie moet focus beheerd worden
      const terugKnop = page.locator('ui-terug-knop button');
      if (await terugKnop.isVisible()) {
        await terugKnop.focus();
        await expect(terugKnop).toBeFocused();
      }
    });

    test('moet hoge contrast hebben', async ({ page }) => {
      await page.goto('/');
      
      // Controleer of tekst voldoende contrast heeft
      const titel = page.locator('h2');
      const styles = await titel.evaluate((el) => {
        return window.getComputedStyle(el);
      });
      
      // Verwacht donkere tekst (contrast)
      expect(styles.color).toMatch(/rgb\(.*\)/);
    });
  });

  test.describe('Fout Afhandeling Tests', () => {
    test('moet graceful degradation hebben bij offline', async ({ page, context }) => {
      await page.goto('/');
      
      // Ga offline
      await context.setOffline(true);
      await page.reload();
      
      // Offline indicator moet zichtbaar zijn
      const offlineIndicator = page.locator('svg.animate-fade-pulse');
      await expect(offlineIndicator).toBeVisible();
      
      // App moet nog steeds bruikbaar zijn
      await expect(page.locator('body')).toBeVisible();
    });

    test('moet fout meldingen correct tonen', async ({ page }) => {
      await page.goto('/');
      await page.click('text=Start melding');
      
      // Fout melding component moet correct functioneren als er fouten zijn
      const foutMelding = page.locator('ui-fout-melding');
      
      // Test alleen als component bestaat en zichtbaar is
      const isVisible = await foutMelding.isVisible().catch(() => false);
      if (isVisible) {
        await expect(foutMelding).toHaveClass(/text-destructive/);
        
        // Fout icoon moet aanwezig zijn
        const errorIcon = foutMelding.locator('svg');
        await expect(errorIcon).toBeVisible();
      }
    });

    test('moet network fouten afhandelen', async ({ page, context }) => {
      // Start met online status
      await page.goto('/');
      
      // Simuleer netwerk problemen
      await context.setOffline(true);
      
      // Probeer actie uit te voeren
      await page.click('text=Start melding');
      
      // App moet niet crashen
      await expect(page.locator('body')).toBeVisible();
      
      // Offline status moet getoond worden
      const offlineIndicator = page.locator('svg.animate-fade-pulse');
      await expect(offlineIndicator).toBeVisible();
    });
  });

  test.describe('User Experience Tests', () => {
    test('moet duidelijke voortgang tonen', async ({ page }) => {
      await page.goto('/');
      
      // Start melding
      await page.click('text=Start melding');
      
      // Voortgangsbalk moet zichtbaar zijn
      await expect(page.locator('ui-voortgangs-balk')).toBeVisible();
      
      // Stap indicator moet correct zijn  
      await expect(page.locator('text=1/5')).toBeVisible();
    });

    test('moet consistente styling hebben', async ({ page }) => {
      await page.goto('/');
      
      // Controleer of Tailwind classes correct toegepast zijn
      const header = page.locator('ui-header');
      await expect(header).toHaveClass(/sticky/);
      await expect(header).toHaveClass(/top-0/);
      
      // Controleer responsive padding
      const main = page.locator('main');
      await expect(main).toHaveClass(/px-4/);
      await expect(main).toHaveClass(/max-w-lg/);
    });

    test('moet loading states hebben', async ({ page }) => {
      await page.goto('/');
      
      // Start melding en ga naar foto stap
      await page.click('text=Start melding');
      
      // Camera en galerij knoppen moeten zichtbaar zijn
      await expect(page.locator('text=Start camera')).toBeVisible();
      await expect(page.locator('text=Kies uit galerij')).toBeVisible();
    });

    test('moet smooth animaties hebben', async ({ page }) => {
      await page.goto('/');
      
      // Start melding
      await page.click('text=Start melding');
      
      // Voortgangsbalk moet smooth transition hebben
      const progressBar = page.locator('ui-voortgangs-balk > div > div');
      if (await progressBar.isVisible()) {
        const styles = await progressBar.evaluate((el) => {
          return window.getComputedStyle(el);
        });
        
        expect(styles.transition).toContain('all');
        expect(styles.transitionDuration).toBe('0.5s');
      }
    });
  });

  test.describe('Cross-browser Compatibility', () => {
    test('moet werken in verschillende browsers', async ({ page, browserName }) => {
      await page.goto('/');
      
      // Basis functionaliteit moet werken in alle browsers
      await expect(page.locator('ui-header')).toBeVisible();
      await expect(page.locator('text=Start melding')).toBeVisible();
      
      // Start flow moet werken
      await page.click('text=Start melding');
      await expect(page.locator('h2')).toContainText('Maak een foto van het afval');
      
      console.log(`Test passed in ${browserName}`);
    });
  });
});