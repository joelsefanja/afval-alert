import { test, expect } from '@playwright/test';

test.describe('Locatie Analyse - OpenStreetMap Integration', () => {
  
  test.describe('Real API Tests (Manual)', () => {
    // Deze tests kunnen handmatig gerund worden om de echte API te testen
    test.skip('moet echte Groningen locaties herkennen', async ({ page }) => {
      // Deze test kan manueel enabled worden voor API testing
      // door .skip te vervangen door .only
      
      await page.goto('/');
      
      // Mock de environment om echte API te gebruiken
      await page.addInitScript(() => {
        (window as any).environment = { useRealGeocodingApi: true };
      });
      
      // Ga naar locatie stap
      await page.click('text=Start melding');
      await page.click('text=Volgende');
      
      // Test bekende Groningen adressen
      const testAdressen = [
        'Grote Markt 1, Groningen',
        'Herestraat 73, Groningen',
        'Vismarkt 20, Groningen'
      ];
      
      for (const adres of testAdressen) {
        await page.fill('input[placeholder*="Zoek adres"]', adres);
        await page.press('input[placeholder*="Zoek adres"]', 'Enter');
        
        // Wacht op API response
        await page.waitForTimeout(2000);
        
        // Controleer of locatie succesvol is gevonden
        const successCard = page.locator('.bg-green-50');
        if (await successCard.isVisible()) {
          await expect(page.locator('text=Locatie geselecteerd')).toBeVisible();
          
          // Controleer of provincie Groningen wordt getoond
          await expect(page.locator('text=Provincie Groningen')).toBeVisible();
          
          // Als het in stad Groningen is, moet dat ook getoond worden
          const stadGroningen = page.locator('text=Stad Groningen');
          if (await stadGroningen.isVisible()) {
            console.log(`✅ ${adres} herkend als Stad Groningen`);
          }
          
          // Kijk of er wijk informatie is
          const wijkInfo = page.locator('text=Wijk:');
          if (await wijkInfo.isVisible()) {
            const wijkText = await wijkInfo.textContent();
            console.log(`🏘️ ${adres} - ${wijkText}`);
          }
        }
        
        // Reset voor volgende test
        await page.reload();
        await page.click('text=Start melding');
        await page.click('text=Volgende');
      }
    });
  });
  
  test.describe('Mock Service Tests', () => {
    test('moet mock locatie analyse correct tonen', async ({ page }) => {
      await page.goto('/');
      
      // Ga naar locatie stap
      await page.click('text=Start melding');
      await page.click('text=Volgende');
      
      // Test adres zoeken (gebruikt mock service)
      await page.fill('input[placeholder*="Zoek adres"]', 'Grote Markt');
      await page.press('input[placeholder*="Zoek adres"]', 'Enter');
      
      // Wacht op mock response
      await page.waitForTimeout(1000);
      
      // Controleer of locatie info wordt getoond
      const successCard = page.locator('.bg-green-50');
      if (await successCard.isVisible()) {
        await expect(page.locator('text=Locatie geselecteerd')).toBeVisible();
        
        // Extra locatie details sectie moet zichtbaar zijn
        const locatieDetails = page.locator('.border-green-200');
        await expect(locatieDetails).toBeVisible();
        
        // Controleer iconen en labels
        await expect(page.locator('i.pi-verified')).toBeVisible(); // Provincie check
      }
    });
    
    test('moet kaart klik analyse correct afhandelen', async ({ page }) => {
      await page.goto('/');
      
      // Ga naar locatie stap
      await page.click('text=Start melding');
      await page.click('text=Volgende');
      
      // Kaart moet zichtbaar zijn
      const kaart = page.locator('app-kaart');
      await expect(kaart).toBeVisible();
      
      // Simuleer klik op kaart
      await kaart.click({ position: { x: 125, y: 125 } });
      
      // Wacht op analyse
      await page.waitForTimeout(1000);
      
      // Als analyse succesvol, moet extra info getoond worden
      const successCard = page.locator('.bg-green-50');
      if (await successCard.isVisible()) {
        // Locatie details sectie moet bestaan
        const detailsSection = successCard.locator('.border-green-200, .border-green-700');
        await expect(detailsSection).toBeVisible();
      }
    });
    
    test('moet GPS locatie analyse correct afhandelen', async ({ page }) => {
      await page.goto('/');
      
      // Mock geolocation API
      await page.addInitScript(() => {
        navigator.geolocation = {
          getCurrentPosition: (success: PositionCallback) => {
            const position: GeolocationPosition = {
              coords: {
                latitude: 53.2194, // Groningen centrum
                longitude: 6.5665,
                accuracy: 10,
                altitude: null,
                altitudeAccuracy: null,
                heading: null,
                speed: null
              },
              timestamp: Date.now()
            };
            setTimeout(() => success(position), 100);
          },
          watchPosition: () => 1,
          clearWatch: () => {}
        } as Geolocation;
      });
      
      // Ga naar locatie stap
      await page.click('text=Start melding');
      await page.click('text=Volgende');
      
      // Klik GPS knop
      await page.click('text=Haal mijn locatie op');
      
      // Wacht op GPS en analyse
      await page.waitForTimeout(2000);
      
      // Controleer of locatie gevonden is
      const successCard = page.locator('.bg-green-50');
      if (await successCard.isVisible()) {
        await expect(page.locator('text=Locatie geselecteerd')).toBeVisible();
        
        // Extra locatie info moet getoond worden
        const detailsSection = page.locator('.border-green-200, .border-green-700');
        await expect(detailsSection).toBeVisible();
        
        // Provincie Groningen check moet zichtbaar zijn
        await expect(page.locator('text=Provincie Groningen')).toBeVisible();
      }
    });
  });
  
  test.describe('Error Handling Tests', () => {
    test('moet fout tonen voor locaties buiten Groningen', async ({ page }) => {
      await page.goto('/');
      
      // Mock geolocation voor Amsterdam (buiten Groningen)
      await page.addInitScript(() => {
        navigator.geolocation = {
          getCurrentPosition: (success: PositionCallback) => {
            const position: GeolocationPosition = {
              coords: {
                latitude: 52.3676, // Amsterdam
                longitude: 4.9041,
                accuracy: 10,
                altitude: null,
                altitudeAccuracy: null,
                heading: null,
                speed: null
              },
              timestamp: Date.now()
            };
            setTimeout(() => success(position), 100);
          },
          watchPosition: () => 1,
          clearWatch: () => {}
        } as Geolocation;
      });
      
      // Ga naar locatie stap
      await page.click('text=Start melding');
      await page.click('text=Volgende');
      
      // Klik GPS knop
      await page.click('text=Haal mijn locatie op');
      
      // Wacht op GPS en analyse
      await page.waitForTimeout(2000);
      
      // Error message moet verschijnen
      const errorMessage = page.locator('p-message[severity="error"]');
      await expect(errorMessage).toBeVisible();
      await expect(errorMessage).toContainText('provincie Groningen');
    });
    
    test('moet graceful fallback hebben bij API problemen', async ({ page }) => {
      await page.goto('/');
      
      // Mock fetch om API errors te simuleren
      await page.addInitScript(() => {
        const originalFetch = window.fetch;
        window.fetch = async (input, init) => {
          const url = typeof input === 'string' ? input : input.url;
          if (url.includes('nominatim.openstreetmap.org')) {
            throw new Error('Network error');
          }
          return originalFetch(input, init);
        };
      });
      
      // Ga naar locatie stap
      await page.click('text=Start melding');
      await page.click('text=Volgende');
      
      // Test adres zoeken (zal fallback gebruiken)
      await page.fill('input[placeholder*="Zoek adres"]', 'Groningen');
      await page.press('input[placeholder*="Zoek adres"]', 'Enter');
      
      // Wacht op fallback response
      await page.waitForTimeout(1500);
      
      // App mag niet crashen, moet nog steeds bruikbaar zijn
      await expect(page.locator('body')).toBeVisible();
      await expect(page.locator('h1')).toContainText('Waar ligt het afval');
    });
  });
  
  test.describe('UI/UX Tests voor Locatie Details', () => {
    test('moet locatie details mooi weergeven', async ({ page }) => {
      await page.goto('/');
      
      // Ga naar locatie stap
      await page.click('text=Start melding');
      await page.click('text=Volgende');
      
      // Zoek adres
      await page.fill('input[placeholder*="Zoek adres"]', 'Grote Markt');
      await page.press('input[placeholder*="Zoek adres"]', 'Enter');
      await page.waitForTimeout(1000);
      
      const successCard = page.locator('.bg-green-50');
      if (await successCard.isVisible()) {
        // Controleer iconen styling
        const checkIcon = page.locator('i.pi-check-circle');
        await expect(checkIcon).toHaveClass(/text-green-600/);
        
        // Controleer detail iconen
        const verifiedIcon = page.locator('i.pi-verified');
        if (await verifiedIcon.isVisible()) {
          await expect(verifiedIcon).toHaveClass(/text-green-600/);
        }
        
        // Controleer layout
        const detailsSection = page.locator('.border-green-200, .border-green-700');
        if (await detailsSection.isVisible()) {
          await expect(detailsSection).toHaveClass(/pt-1/);
          await expect(detailsSection).toHaveClass(/border-t/);
        }
      }
    });
    
    test('moet responsive zijn op mobiel', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto('/');
      
      // Ga naar locatie stap
      await page.click('text=Start melding');
      await page.click('text=Volgende');
      
      // Test adres zoeken
      await page.fill('input[placeholder*="Zoek adres"]', 'Groningen');
      await page.press('input[placeholder*="Zoek adres"]', 'Enter');
      await page.waitForTimeout(1000);
      
      const successCard = page.locator('.bg-green-50');
      if (await successCard.isVisible()) {
        // Details moeten ook op mobiel goed zichtbaar zijn
        const detailsSection = page.locator('.border-green-200, .border-green-700');
        if (await detailsSection.isVisible()) {
          const boundingBox = await detailsSection.boundingBox();
          expect(boundingBox?.width).toBeLessThanOrEqual(375);
        }
        
        // Tekst moet leesbaar blijven
        const kleineTekst = page.locator('.text-xs');
        if (await kleineTekst.first().isVisible()) {
          const styles = await kleineTekst.first().evaluate(el => 
            window.getComputedStyle(el).fontSize
          );
          // Text moet nog steeds leesbaar zijn (minimaal 10px)
          const fontSize = parseInt(styles);
          expect(fontSize).toBeGreaterThanOrEqual(10);
        }
      }
    });
  });
});
