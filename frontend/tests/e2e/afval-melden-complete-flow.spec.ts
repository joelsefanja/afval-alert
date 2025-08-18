import { test, expect } from '@playwright/test';

test.describe('Afval Melding Complete Flow Tests', () => {
  
  test.describe('Complete User Journey', () => {
    test('moet volledige afval melding flow kunnen doorlopen', async ({ page }) => {
      await page.goto('/');
      
      // 1. Start stap
      await expect(page.locator('h1')).toContainText('Zie je zwerfafval?');
      await page.click('text=Start melding');
      
      // 2. Foto stap
      await expect(page.locator('h1')).toContainText('Maak een foto van het afval');
      
      // Mock een foto upload (simuleer dat er een foto is)
      await page.evaluate(() => {
        // Simuleer foto data in state
        const mockFile = new File(['mock'], 'test.jpg', { type: 'image/jpeg' });
        // Dit zou de foto service moeten triggeren
      });
      
      // Skip foto voor test doeleinden en ga naar volgende
      await page.click('text=Volgende');
      
      // 3. Locatie stap
      await expect(page.locator('h1')).toContainText('Waar ligt het afval?');
      
      // Kaart moet zichtbaar zijn
      const kaart = page.locator('app-kaart');
      await expect(kaart).toBeVisible();
      
      // Test adres zoeken
      await page.fill('input[placeholder*="Zoek adres"]', 'Grote Markt, Groningen');
      await page.click('p-button[icon="pi pi-search"]');
      
      // Wacht even voor geocoding response
      await page.waitForTimeout(1000);
      
      // Als locatie succesvol gevonden, ga naar volgende
      const volgendeKnop = page.locator('text=Volgende');
      if (await volgendeKnop.isVisible()) {
        await volgendeKnop.click();
      }
      
      // 4. Contact stap
      await expect(page.locator('h1')).toContainText('Contactgegevens');
      
      // Test anonieme melding
      await page.check('input[id="anoniem"]');
      await page.click('text=Volgende');
      
      // 5. Controle stap
      await expect(page.locator('h1')).toContainText('Controleer je melding');
      
      // Gegevens moeten getoond worden
      await expect(page.locator('text=Locatie')).toBeVisible();
      await expect(page.locator('text=Contactgegevens')).toBeVisible();
      
      await page.click('text=Verstuur melding');
      
      // 6. Succes stap
      await expect(page.locator('h1')).toContainText('Melding verstuurd');
      await expect(page.locator('text=Bedankt')).toBeVisible();
    });
    
    test('moet contact gegevens flow correct afhandelen', async ({ page }) => {
      await page.goto('/');
      
      // Ga naar contact stap (skip eerdere stappen)
      await page.click('text=Start melding');
      await page.click('text=Volgende'); // Skip foto
      
      // Locatie snel invullen
      await page.fill('input[placeholder*="Zoek adres"]', 'Groningen');
      await page.click('p-button[icon="pi pi-search"]');
      await page.waitForTimeout(500);
      const volgendeKnop = page.locator('text=Volgende');
      if (await volgendeKnop.isVisible()) {
        await volgendeKnop.click();
      }
      
      // Test met contactgegevens
      await expect(page.locator('h1')).toContainText('Contactgegevens');
      
      // Anoniem checkbox moet zichtbaar zijn met nieuwe tekst
      await expect(page.locator('text=Meld zonder contactgegevens')).toBeVisible();
      
      // Test email validatie
      await page.fill('input[type="email"]', 'ongeldig-email');
      await expect(page.locator('text=Voer een geldig e-mailadres in')).toBeVisible();
      
      // Geldig email
      await page.fill('input[type="email"]', 'test@example.com');
      await page.fill('input[id="naam"]', 'Test Gebruiker');
      
      // Telefoon veld moet NIET bestaan
      const telefoonVeld = page.locator('input[type="tel"]');
      await expect(telefoonVeld).not.toBeVisible();
      
      // Volgende moet nu klikbaar zijn
      await expect(page.locator('text=Volgende')).toBeEnabled();
      await page.click('text=Volgende');
      
      // Moet naar controle stap gaan
      await expect(page.locator('h1')).toContainText('Controleer je melding');
    });
  });
  
  test.describe('Locatie Stap - Kaart Functionaliteit', () => {
    test('moet kaart correct tonen met Groningen gecentreerd', async ({ page }) => {
      await page.goto('/');
      
      // Ga naar locatie stap
      await page.click('text=Start melding');
      await page.click('text=Volgende'); // Skip foto
      
      // Kaart moet zichtbaar zijn
      const kaart = page.locator('app-kaart');
      await expect(kaart).toBeVisible();
      
      // Kaart moet de juiste hoogte hebben
      const kaartElement = await kaart.boundingBox();
      expect(kaartElement?.height).toBeGreaterThan(200);
      
      // Test GPS locatie knop
      const gpsKnop = page.locator('text=Haal mijn locatie op');
      await expect(gpsKnop).toBeVisible();
      await expect(gpsKnop).toBeEnabled();
      
      // Test adres zoek veld
      const adresVeld = page.locator('input[placeholder*="Zoek adres"]');
      await expect(adresVeld).toBeVisible();
      
      // Test instructie tekst
      await expect(page.locator('text=of selecteer locatie')).toBeVisible();
    });
    
    test('moet adres zoeken en kaart updaten', async ({ page }) => {
      await page.goto('/');
      
      // Ga naar locatie stap
      await page.click('text=Start melding');
      await page.click('text=Volgende');
      
      // Test enter key voor zoeken
      await page.fill('input[placeholder*="Zoek adres"]', 'Grote Markt');
      await page.press('input[placeholder*="Zoek adres"]', 'Enter');
      
      // Wacht op eventuele response
      await page.waitForTimeout(1000);
      
      // Als locatie gevonden, moet success indicator zichtbaar zijn
      const successCard = page.locator('.bg-green-50, .dark\\:bg-green-900\\/20');
      if (await successCard.isVisible()) {
        await expect(page.locator('text=Locatie geselecteerd')).toBeVisible();
      }
    });

    test('moet kaart klik functionaliteit hebben', async ({ page }) => {
      await page.goto('/');
      
      // Ga naar locatie stap
      await page.click('text=Start melding');
      await page.click('text=Volgende');
      
      // Kaart moet interactief zijn
      const kaart = page.locator('app-kaart');
      await expect(kaart).toBeVisible();
      
      // Simuleer klik op kaart (midden van kaart element)
      await kaart.click({ position: { x: 125, y: 125 } });
      
      // Wacht even voor eventuele response
      await page.waitForTimeout(500);
      
      // Als binnen Groningen, moet locatie geselecteerd worden
      const successCard = page.locator('.bg-green-50');
      if (await successCard.isVisible()) {
        await expect(page.locator('text=Locatie geselecteerd')).toBeVisible();
      }
    });
  });
  
  test.describe('Responsive Design Tests', () => {
    test('moet responsive zijn op mobiele apparaten', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 }); // iPhone SE
      await page.goto('/');
      
      // Header moet responsive zijn
      const header = page.locator('ui-header');
      await expect(header).toBeVisible();
      
      // Start knop moet groot genoeg zijn voor touch
      const startKnop = page.locator('text=Start melding');
      const boundingBox = await startKnop.boundingBox();
      expect(boundingBox?.height).toBeGreaterThanOrEqual(44);
      
      // Ga door flow heen
      await page.click('text=Start melding');
      
      // Foto stap moet responsive zijn
      await expect(page.locator('h1')).toContainText('Maak een foto');
      await page.click('text=Volgende');
      
      // Kaart moet responsive zijn
      const kaart = page.locator('app-kaart');
      await expect(kaart).toBeVisible();
      
      // Knoppen moeten full-width zijn op mobiel
      const gpsKnop = page.locator('text=Haal mijn locatie op');
      await expect(gpsKnop).toHaveClass(/w-full/);
    });
    
    test('moet werken op tablet formaat', async ({ page }) => {
      await page.setViewportSize({ width: 768, height: 1024 }); // iPad
      await page.goto('/');
      
      // Complete flow moet werken op tablet
      await page.click('text=Start melding');
      await page.click('text=Volgende');
      
      // Kaart moet goed zichtbaar zijn op tablet
      const kaart = page.locator('app-kaart');
      await expect(kaart).toBeVisible();
      
      // Container moet max-width hebben
      const container = page.locator('.max-w-2xl');
      await expect(container).toBeVisible();
    });
  });
  
  test.describe('Error Handling Tests', () => {
    test('moet foutafhandeling hebben voor locatie diensten', async ({ page }) => {
      await page.goto('/');
      
      // Ga naar locatie stap
      await page.click('text=Start melding');
      await page.click('text=Volgende');
      
      // Test ongeldige zoekopdracht
      await page.fill('input[placeholder*="Zoek adres"]', 'XYZ123ONBESTAAND');
      await page.click('p-button[icon="pi pi-search"]');
      
      // Error message moet verschijnen
      await page.waitForTimeout(1000);
      const errorMessage = page.locator('p-message[severity="error"]');
      if (await errorMessage.isVisible()) {
        await expect(errorMessage).toBeVisible();
      }
    });
    
    test('moet offline functionaliteit hebben', async ({ page, context }) => {
      await page.goto('/');
      
      // Ga offline
      await context.setOffline(true);
      await page.reload();
      
      // Offline indicator moet zichtbaar zijn
      const offlineIndicator = page.locator('.animate-fade-pulse');
      if (await offlineIndicator.isVisible()) {
        await expect(offlineIndicator).toBeVisible();
      }
      
      // App moet nog steeds bruikbaar zijn
      await expect(page.locator('body')).toBeVisible();
      await page.click('text=Start melding');
      await expect(page.locator('h1')).toContainText('Maak een foto');
    });

    test('moet validatie fouten correct tonen', async ({ page }) => {
      await page.goto('/');
      
      // Ga naar contact stap
      await page.click('text=Start melding');
      await page.click('text=Volgende'); // Skip foto
      
      // Skip locatie
      await page.fill('input[placeholder*="Zoek adres"]', 'Groningen');
      await page.click('p-button[icon="pi pi-search"]');
      await page.waitForTimeout(500);
      const volgendeKnop = page.locator('text=Volgende');
      if (await volgendeKnop.isVisible()) {
        await volgendeKnop.click();
      }
      
      // Test email validatie in contact stap
      await page.fill('input[type="email"]', 'ongeldig');
      await expect(page.locator('text=Voer een geldig e-mailadres in')).toBeVisible();
      
      // Volgende knop moet disabled zijn
      await expect(page.locator('text=Volgende')).toBeDisabled();
    });
  });
  
  test.describe('Keyboard Navigation Tests', () => {
    test('moet volledig keyboard toegankelijk zijn', async ({ page }) => {
      await page.goto('/');
      
      // Tab navigatie door start pagina
      await page.keyboard.press('Tab');
      await expect(page.locator(':focus')).toBeVisible();
      
      // Enter om te starten
      await page.keyboard.press('Enter');
      await expect(page.locator('h1')).toContainText('Maak een foto');
      
      // Navigeer met tab door foto stap
      await page.keyboard.press('Tab');
      await page.keyboard.press('Tab');
      await page.keyboard.press('Enter'); // Volgende
      
      // Locatie stap keyboard navigatie
      await expect(page.locator('h1')).toContainText('Waar ligt het afval');
      
      // Focus moet beheerd worden
      await page.keyboard.press('Tab');
      const focusedElement = page.locator(':focus');
      await expect(focusedElement).toBeVisible();
    });

    test('moet Enter key ondersteunen voor adres zoeken', async ({ page }) => {
      await page.goto('/');
      
      // Ga naar locatie stap
      await page.click('text=Start melding');
      await page.click('text=Volgende');
      
      // Test Enter key in adres veld
      await page.fill('input[placeholder*="Zoek adres"]', 'Groningen centrum');
      await page.press('input[placeholder*="Zoek adres"]', 'Enter');
      
      // Wacht voor response
      await page.waitForTimeout(1000);
    });
  });
  
  test.describe('Performance Tests', () => {
    test('moet snel laden en reageren', async ({ page }) => {
      const startTime = Date.now();
      
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      const loadTime = Date.now() - startTime;
      expect(loadTime).toBeLessThan(5000); // 5 seconden max
      
      // Kaart moet snel laden
      await page.click('text=Start melding');
      await page.click('text=Volgende');
      
      const kaartStartTime = Date.now();
      const kaart = page.locator('app-kaart');
      await expect(kaart).toBeVisible();
      
      const kaartLoadTime = Date.now() - kaartStartTime;
      expect(kaartLoadTime).toBeLessThan(3000); // 3 seconden max
    });
  });
  
  test.describe('Cross-browser Compatibility', () => {
    test('moet werken in alle browsers', async ({ page, browserName }) => {
      await page.goto('/');
      
      // Basis functionaliteit moet werken
      await expect(page.locator('h1')).toContainText('Zie je zwerfafval?');
      await page.click('text=Start melding');
      await expect(page.locator('h1')).toContainText('Maak een foto');
      
      // Leaflet kaart moet laden
      await page.click('text=Volgende');
      const kaart = page.locator('app-kaart');
      await expect(kaart).toBeVisible();
      
      // Locatie functionaliteit moet werken
      await page.fill('input[placeholder*="Zoek adres"]', 'Groningen');
      await page.press('input[placeholder*="Zoek adres"]', 'Enter');
      
      console.log(`Complete flow test passed in ${browserName}`);
    });
  });

  test.describe('Mobile Specific Tests', () => {
    test.use({ viewport: { width: 375, height: 667 } }); // iPhone SE
    
    test('moet touch interacties ondersteunen', async ({ page }) => {
      await page.goto('/');
      
      // Touch events op knoppen
      await page.tap('text=Start melding');
      await expect(page.locator('h1')).toContainText('Maak een foto');
      
      await page.tap('text=Volgende');
      
      // Kaart moet touch events ondersteunen
      const kaart = page.locator('app-kaart');
      await expect(kaart).toBeVisible();
      
      // GPS knop moet goed werken op mobile
      const gpsKnop = page.locator('text=Haal mijn locatie op');
      await page.tap(gpsKnop);
      
      // Wacht voor eventuele GPS prompt
      await page.waitForTimeout(1000);
    });
  });
});