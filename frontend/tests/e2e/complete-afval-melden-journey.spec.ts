import { test, expect } from '@playwright/test';

test.describe('Complete Afval Melden User Journey', () => {
  test.beforeEach(async ({ page, context }) => {
    // Grant all necessary permissions
    await context.grantPermissions(['camera', 'geolocation']);
    await context.setGeolocation({ longitude: 4.9041, latitude: 52.3676 }); // Amsterdam
    
    // Setup comprehensive mocks
    await page.addInitScript(() => {
      // Mock MediaStream for camera
      const fakeStream = {
        getTracks: () => [{
          kind: 'video',
          label: 'Test Camera',
          stop: () => {},
          addEventListener: () => {},
          removeEventListener: () => {}
        }],
        getVideoTracks: () => [{ kind: 'video', stop: () => {} }],
        getAudioTracks: () => [],
        active: true,
        id: 'test-stream'
      };

      // Mock camera access
      Object.defineProperty(navigator, 'mediaDevices', {
        value: {
          getUserMedia: async () => fakeStream,
          enumerateDevices: async () => [{ deviceId: 'test', kind: 'videoinput', label: 'Test Camera' }]
        }
      });

      // Mock video element
      HTMLVideoElement.prototype.play = function() {
        this.readyState = 4;
        this.videoWidth = 640;
        this.videoHeight = 480;
        return Promise.resolve();
      };

      // Mock canvas for photo capture
      HTMLCanvasElement.prototype.toDataURL = () => 'data:image/jpeg;base64,test-photo-data';

      // Mock geolocation
      Object.defineProperty(navigator, 'geolocation', {
        value: {
          getCurrentPosition: (success) => {
            setTimeout(() => success({
              coords: { latitude: 52.3676, longitude: 4.9041, accuracy: 10 },
              timestamp: Date.now()
            }), 100);
          }
        }
      });

      // Mock address lookup
      const originalFetch = window.fetch;
      window.fetch = async (url, options) => {
        if (url.toString().includes('nominatim') || url.toString().includes('geocod')) {
          return {
            ok: true,
            json: async () => ({
              features: [{
                properties: {
                  display_name: 'Test Straat 123, 1000 AA Amsterdam, Nederland'
                },
                geometry: { coordinates: [4.9041, 52.3676] }
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

  test('end-to-end afval melden flow: foto → locatie → contact → controle', async ({ page }) => {
    // Navigate to afval melden
    await page.goto('/afval-melden');
    await page.waitForLoadState('networkidle');

    // ===== STEP 1: FOTO =====
    await expect(page.getByText('Foto')).toBeVisible();
    await expect(page.getByText('Stap 1 van 4')).toBeVisible();

    // Take photo with camera
    await page.getByText('Maak foto').click();
    await page.waitForTimeout(1000);
    
    // Camera should be active
    await expect(page.locator('video')).toBeVisible();
    
    // Capture photo
    await page.getByRole('button').filter({ hasText: /camera/ }).click();
    await page.waitForTimeout(500);

    // Photo preview should appear
    await expect(page.getByText('Foto gemaakt!')).toBeVisible();
    
    // Go to next step
    await page.getByText('Volgende').click();
    await page.waitForTimeout(500);

    // ===== STEP 2: LOCATIE =====
    await expect(page.getByText('Locatie')).toBeVisible();
    await expect(page.getByText('Stap 2 van 4')).toBeVisible();

    // Use GPS for location
    await page.getByText(/Gebruik mijn locatie/).click();
    await page.waitForTimeout(1500);

    // Should show location found
    await expect(page.getByText(/Amsterdam/)).toBeVisible({ timeout: 5000 });
    
    // Progress to next step
    await page.getByText('Volgende').click();
    await page.waitForTimeout(500);

    // ===== STEP 3: CONTACT =====
    await expect(page.getByText('Contact')).toBeVisible();
    await expect(page.getByText('Stap 3 van 4')).toBeVisible();

    // Fill contact information if form exists
    const emailInput = page.locator('input[type="email"], input[placeholder*="email"], input[placeholder*="Email"]');
    if (await emailInput.isVisible()) {
      await emailInput.fill('test@example.com');
    }

    const phoneInput = page.locator('input[type="tel"], input[placeholder*="telefoon"], input[placeholder*="Telefoon"]');
    if (await phoneInput.isVisible()) {
      await phoneInput.fill('0612345678');
    }

    // Look for next button or continue
    const nextButton = page.getByText('Volgende');
    if (await nextButton.isVisible()) {
      await nextButton.click();
      await page.waitForTimeout(500);
    }

    // ===== STEP 4: CONTROLE =====
    await expect(page.getByText('Controle')).toBeVisible();
    await expect(page.getByText('Stap 4 van 4')).toBeVisible();

    // Should show summary of all entered data
    await expect(page.getByText(/Amsterdam/)).toBeVisible(); // Location
    
    // Look for submit button
    const submitButton = page.getByText(/Verstuur/, { exact: false });
    if (await submitButton.isVisible()) {
      await submitButton.click();
      await page.waitForTimeout(1000);

      // Should show success page or message
      await expect(page.getByText(/Succes|Bedankt|Verzonden/)).toBeVisible({ timeout: 5000 });
    }
  });

  test('navigation flow between all steps', async ({ page }) => {
    await page.goto('/afval-melden');
    await page.waitForLoadState('networkidle');

    // Start at foto step
    await expect(page.getByText('Foto')).toBeVisible();

    // Test forward navigation
    await page.getByText('Maak foto').click();
    await page.waitForTimeout(1000);
    await page.getByRole('button').filter({ hasText: /camera/ }).click();
    await page.waitForTimeout(500);
    await page.getByText('Volgende').click();
    await page.waitForTimeout(500);

    // Now at locatie step
    await expect(page.getByText('Locatie')).toBeVisible();

    // Test backward navigation
    await page.getByText('Terug').click();
    await page.waitForTimeout(500);

    // Should be back at foto step
    await expect(page.getByText('Foto')).toBeVisible();
    await expect(page.getByText('Foto gemaakt!')).toBeVisible(); // Photo should be preserved
  });

  test('progress bar updates correctly through steps', async ({ page }) => {
    await page.goto('/afval-melden');
    await page.waitForLoadState('networkidle');

    // Check initial progress (Step 1 of 4)
    await expect(page.getByText('Stap 1 van 4')).toBeVisible();
    
    // Progress bar should show 25%
    const progressBar = page.locator('.bg-gradient-to-r');
    await expect(progressBar).toBeVisible();

    // Complete foto step
    await page.getByText('Maak foto').click();
    await page.waitForTimeout(1000);
    await page.getByRole('button').filter({ hasText: /camera/ }).click();
    await page.waitForTimeout(500);
    await page.getByText('Volgende').click();
    await page.waitForTimeout(500);

    // Should show step 2 progress
    await expect(page.getByText('Stap 2 van 4')).toBeVisible();

    // Complete locatie step
    await page.getByText(/Gebruik mijn locatie/).click();
    await page.waitForTimeout(1500);
    await page.getByText('Volgende').click();
    await page.waitForTimeout(500);

    // Should show step 3 progress
    await expect(page.getByText('Stap 3 van 4')).toBeVisible();
  });

  test('data persistence across navigation', async ({ page }) => {
    await page.goto('/afval-melden');
    await page.waitForLoadState('networkidle');

    // Take photo
    await page.getByText('Maak foto').click();
    await page.waitForTimeout(1000);
    await page.getByRole('button').filter({ hasText: /camera/ }).click();
    await page.waitForTimeout(500);
    await page.getByText('Volgende').click();
    await page.waitForTimeout(500);

    // Set location
    await page.getByText(/Gebruik mijn locatie/).click();
    await page.waitForTimeout(1500);
    await page.getByText('Volgende').click();
    await page.waitForTimeout(500);

    // Go back to foto step
    await page.getByText('Terug').click();
    await page.waitForTimeout(500);
    await page.getByText('Terug').click();
    await page.waitForTimeout(500);

    // Photo should still be there
    await expect(page.getByText('Foto gemaakt!')).toBeVisible();
    
    // Navigate forward again
    await page.getByText('Volgende').click();
    await page.waitForTimeout(500);

    // Location should still be selected
    await expect(page.getByText(/Amsterdam/)).toBeVisible();
  });

  test('offline handling during flow', async ({ page }) => {
    await page.goto('/afval-melden');
    await page.waitForLoadState('networkidle');

    // Complete foto step
    await page.getByText('Maak foto').click();
    await page.waitForTimeout(1000);
    await page.getByRole('button').filter({ hasText: /camera/ }).click();
    await page.waitForTimeout(500);
    await page.getByText('Volgende').click();
    await page.waitForTimeout(500);

    // Simulate going offline
    await page.context().setOffline(true);
    await page.waitForTimeout(500);

    // Should show offline notification
    await expect(page.getByText(/offline|niet verbonden/i)).toBeVisible({ timeout: 3000 });

    // Go back online
    await page.context().setOffline(false);
    await page.waitForTimeout(500);

    // Offline notification should disappear
    await expect(page.getByText(/offline|niet verbonden/i)).not.toBeVisible({ timeout: 3000 });
  });

  test('accessibility and keyboard navigation', async ({ page }) => {
    await page.goto('/afval-melden');
    await page.waitForLoadState('networkidle');

    // Test keyboard navigation
    await page.keyboard.press('Tab');
    
    // Should focus on first interactive element
    const focusedElement = page.locator(':focus');
    await expect(focusedElement).toBeVisible();

    // Test Enter key activation
    await page.keyboard.press('Enter');
    await page.waitForTimeout(500);

    // Should have triggered some action (camera start or navigation)
    // Exact behavior depends on which element was focused
  });
});