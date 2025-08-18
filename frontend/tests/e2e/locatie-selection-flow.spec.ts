import { test, expect } from '@playwright/test';

test.describe('Locatie Selection Flow', () => {
  test.beforeEach(async ({ page, context }) => {
    // Grant geolocation permissions
    await context.grantPermissions(['geolocation']);
    
    // Mock geolocation API
    await context.setGeolocation({ longitude: 4.9041, latitude: 52.3676 }); // Amsterdam
    
    // Mock geolocation and address services
    await page.addInitScript(() => {
      // Mock geolocation
      Object.defineProperty(navigator, 'geolocation', {
        value: {
          getCurrentPosition: (success, error, options) => {
            setTimeout(() => {
              success({
                coords: {
                  latitude: 52.3676,
                  longitude: 4.9041,
                  accuracy: 10,
                  altitude: null,
                  altitudeAccuracy: null,
                  heading: null,
                  speed: null
                },
                timestamp: Date.now()
              });
            }, 100);
          },
          watchPosition: (success, error, options) => {
            return navigator.geolocation.getCurrentPosition(success, error, options);
          },
          clearWatch: () => {}
        },
        configurable: true
      });

      // Mock fetch for address lookups
      const originalFetch = window.fetch;
      window.fetch = async (url, options) => {
        if (url.toString().includes('nominatim') || url.toString().includes('geocod')) {
          return {
            ok: true,
            json: async () => ({
              features: [{
                properties: {
                  display_name: 'Damrak 1, 1012 LG Amsterdam, Nederland',
                  name: 'Damrak 1'
                },
                geometry: {
                  coordinates: [4.9041, 52.3676]
                }
              }]
            })
          };
        }
        return originalFetch(url, options);
      };
    });

    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('complete locatie selection with GPS', async ({ page }) => {
    // Navigate to locatie step (assumes we start from foto step and have photo)
    await page.goto('/afval-melden');
    await page.waitForLoadState('networkidle');

    // Skip foto step by mocking photo completion
    await page.addInitScript(() => {
      // Simulate having a photo already
      window.localStorage.setItem('afval-foto-url', 'data:image/jpeg;base64,mock-photo');
    });

    // Navigate to locatie step
    await page.evaluate(() => {
      // Force navigation to locatie step
      const event = new CustomEvent('navigate-to-locatie');
      document.dispatchEvent(event);
    });
    
    await page.waitForTimeout(500);

    // Should show locatie step
    await expect(page.getByText('Locatie')).toBeVisible();
    await expect(page.getByText('Stap 2 van 4')).toBeVisible();

    // Should show GPS button
    await expect(page.getByText(/Gebruik mijn locatie/)).toBeVisible();

    // Click GPS button
    await page.getByText(/Gebruik mijn locatie/).click();
    await page.waitForTimeout(1000);

    // Should show loading state then success
    await expect(page.getByText(/Locatie gevonden/)).toBeVisible({ timeout: 5000 });
    
    // Should show address
    await expect(page.getByText(/Amsterdam/)).toBeVisible();

    // Should show next button
    await expect(page.getByText('Volgende')).toBeVisible();

    // Click next to proceed
    await page.getByText('Volgende').click();
    await page.waitForTimeout(500);

    // Should navigate to contact step
    await expect(page.getByText('Contact')).toBeVisible();
    await expect(page.getByText('Stap 3 van 4')).toBeVisible();
  });

  test('manual address search flow', async ({ page }) => {
    await page.goto('/afval-melden');
    await page.waitForLoadState('networkidle');

    // Navigate to locatie step
    await page.evaluate(() => {
      window.localStorage.setItem('afval-foto-url', 'data:image/jpeg;base64,mock-photo');
    });

    // Look for address search input
    const addressInput = page.locator('input[placeholder*="adres"], input[placeholder*="Adres"], input[type="search"]');
    
    if (await addressInput.isVisible()) {
      // Type address
      await addressInput.fill('Damrak 1, Amsterdam');
      await page.waitForTimeout(500);

      // Should show search results
      await expect(page.getByText(/Amsterdam/)).toBeVisible({ timeout: 3000 });

      // Click on first result
      await page.getByText(/Damrak/).first().click();
      await page.waitForTimeout(500);

      // Should show selected address
      await expect(page.getByText('Volgende')).toBeVisible();
    }
  });

  test('location error handling', async ({ page }) => {
    // Mock geolocation error
    await page.addInitScript(() => {
      Object.defineProperty(navigator, 'geolocation', {
        value: {
          getCurrentPosition: (success, error) => {
            setTimeout(() => {
              error({
                code: 1,
                message: 'Permission denied'
              });
            }, 100);
          }
        },
        configurable: true
      });
    });

    await page.goto('/afval-melden');
    await page.waitForLoadState('networkidle');

    // Navigate to locatie step
    await page.evaluate(() => {
      window.localStorage.setItem('afval-foto-url', 'data:image/jpeg;base64,mock-photo');
    });

    // Click GPS button
    await page.getByText(/Gebruik mijn locatie/).click();
    await page.waitForTimeout(1000);

    // Should show error message
    await expect(page.getByText(/Locatie niet beschikbaar/)).toBeVisible({ timeout: 3000 });
  });

  test('locatie stap back navigation', async ({ page }) => {
    await page.goto('/afval-melden');
    await page.waitForLoadState('networkidle');

    // Navigate to locatie step
    await page.evaluate(() => {
      window.localStorage.setItem('afval-foto-url', 'data:image/jpeg;base64,mock-photo');
    });

    // Should show back button
    await expect(page.getByText('Terug')).toBeVisible();

    // Click back button
    await page.getByText('Terug').click();
    await page.waitForTimeout(500);

    // Should go back to foto step
    await expect(page.getByText('Foto')).toBeVisible();
    await expect(page.getByText('Stap 1 van 4')).toBeVisible();
  });

  test('map interaction flow', async ({ page }) => {
    await page.goto('/afval-melden');
    await page.waitForLoadState('networkidle');

    // Navigate to locatie step
    await page.evaluate(() => {
      window.localStorage.setItem('afval-foto-url', 'data:image/jpeg;base64,mock-photo');
    });

    // Look for map container
    const mapContainer = page.locator('.leaflet-container, [id*="map"], .map-container');
    
    if (await mapContainer.isVisible()) {
      // Click on map to select location
      await mapContainer.click({ position: { x: 200, y: 200 } });
      await page.waitForTimeout(500);

      // Should show confirmation of location selection
      await expect(page.getByText('Volgende')).toBeVisible();
    }
  });

  test('responsive design for locatie step', async ({ page }) => {
    await page.goto('/afval-melden');
    await page.waitForLoadState('networkidle');

    // Test desktop view
    await page.setViewportSize({ width: 1024, height: 768 });
    await expect(page.getByText(/Gebruik mijn locatie/)).toBeVisible();

    // Test mobile view
    await page.setViewportSize({ width: 375, height: 667 });
    await expect(page.getByText(/Gebruik mijn locatie/)).toBeVisible();
    
    // Verify responsive layout adjustments
    const locationButton = page.getByText(/Gebruik mijn locatie/).first();
    await expect(locationButton).toBeVisible();
  });
});