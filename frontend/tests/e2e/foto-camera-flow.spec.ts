import { test, expect } from '@playwright/test';

test.describe('Foto Camera Flow - Complete User Journey', () => {
  test.beforeEach(async ({ page, context }) => {
    // Grant camera permissions globally
    await context.grantPermissions(['camera']);
    
    // Mock getUserMedia to return a fake video stream
    await page.addInitScript(() => {
      // Create a fake MediaStream
      const fakeStream = {
        getTracks: () => [{
          kind: 'video',
          label: 'Fake Camera',
          stop: () => {},
          addEventListener: () => {},
          removeEventListener: () => {}
        }],
        getVideoTracks: () => [{
          kind: 'video',
          label: 'Fake Camera',
          stop: () => {}
        }],
        getAudioTracks: () => [],
        active: true,
        id: 'fake-stream',
        addTrack: () => {},
        removeTrack: () => {},
        clone: () => fakeStream,
        addEventListener: () => {},
        removeEventListener: () => {},
        dispatchEvent: () => true
      };

      // Mock navigator.mediaDevices.getUserMedia
      Object.defineProperty(navigator, 'mediaDevices', {
        value: {
          getUserMedia: async (constraints) => {
            console.log('Mock getUserMedia called with:', constraints);
            // Simulate successful camera access
            return fakeStream;
          },
          enumerateDevices: async () => [{
            deviceId: 'fake-camera',
            groupId: 'fake-group',
            kind: 'videoinput',
            label: 'Fake Camera'
          }]
        },
        configurable: true
      });

      // Mock HTMLVideoElement play method
      HTMLVideoElement.prototype.play = function() {
        this.readyState = 4; // HAVE_ENOUGH_DATA
        this.videoWidth = 640;
        this.videoHeight = 480;
        return Promise.resolve();
      };

      // Mock Canvas.toDataURL for photo capture
      HTMLCanvasElement.prototype.toDataURL = function() {
        return 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k=';
      };
    });

    // Navigate to the app
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('complete foto capture flow with camera', async ({ page }) => {
    // Start from the afval melden page
    await page.goto('/afval-melden');
    await page.waitForLoadState('networkidle');

    // Should show the foto stap
    await expect(page.getByText('Foto')).toBeVisible();
    await expect(page.getByText('Stap 1 van 4')).toBeVisible();

    // Should show camera and gallery options
    await expect(page.getByText('Maak foto')).toBeVisible();
    await expect(page.getByText('Kies uit galerij')).toBeVisible();

    // Click camera button to start camera
    await page.getByText('Maak foto').click();

    // Wait for camera interface to appear
    await page.waitForTimeout(1000);
    
    // Camera view should be visible
    await expect(page.locator('video')).toBeVisible();
    await expect(page.getByRole('button').filter({ hasText: /times/ })).toBeVisible(); // Close button
    
    // Camera capture button should be visible
    const captureButton = page.getByRole('button').filter({ hasText: /camera/ });
    await expect(captureButton).toBeVisible();

    // Take a photo
    await captureButton.click();
    await page.waitForTimeout(500);

    // Photo preview should appear
    await expect(page.getByText('Foto gemaakt!')).toBeVisible();
    await expect(page.locator('img[alt="Gemaakte foto"]')).toBeVisible();

    // Navigation buttons should be available
    await expect(page.getByText('Opnieuw')).toBeVisible();
    await expect(page.getByText('Volgende')).toBeVisible();

    // Click next to go to location step
    await page.getByText('Volgende').click();
    await page.waitForTimeout(500);

    // Should navigate to locatie stap
    await expect(page.getByText('Locatie')).toBeVisible();
    await expect(page.getByText('Stap 2 van 4')).toBeVisible();
  });

  test('foto retake flow', async ({ page }) => {
    await page.goto('/afval-melden');
    await page.waitForLoadState('networkidle');

    // Start camera and take photo
    await page.getByText('Maak foto').click();
    await page.waitForTimeout(1000);
    
    const captureButton = page.getByRole('button').filter({ hasText: /camera/ });
    await captureButton.click();
    await page.waitForTimeout(500);

    // Photo should be taken
    await expect(page.getByText('Foto gemaakt!')).toBeVisible();

    // Click retake button
    await page.getByText('Opnieuw').click();
    await page.waitForTimeout(500);

    // Should show camera interface again
    await expect(page.locator('video')).toBeVisible();
    await expect(captureButton).toBeVisible();
  });

  test('camera stop and cleanup flow', async ({ page }) => {
    await page.goto('/afval-melden');
    await page.waitForLoadState('networkidle');

    // Start camera
    await page.getByText('Maak foto').click();
    await page.waitForTimeout(1000);
    
    // Camera should be active
    await expect(page.locator('video')).toBeVisible();

    // Click stop/close button
    await page.getByRole('button').filter({ hasText: /times/ }).click();
    await page.waitForTimeout(500);

    // Camera should be closed, back to initial state
    await expect(page.locator('video')).not.toBeVisible();
    await expect(page.getByText('Maak foto')).toBeVisible();
    await expect(page.getByText('Kies uit galerij')).toBeVisible();
  });

  test('gallery selection flow', async ({ page }) => {
    await page.goto('/afval-melden');
    await page.waitForLoadState('networkidle');

    // Mock file input for gallery selection
    await page.addInitScript(() => {
      // Mock File API
      window.File = class extends Blob {
        constructor(fileBits, fileName, options) {
          super(fileBits, options);
          this.name = fileName;
          this.lastModified = Date.now();
        }
      };

      // Mock FileReader
      window.FileReader = class {
        constructor() {
          this.result = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k=';
        }
        readAsDataURL() {
          setTimeout(() => this.onload?.(), 10);
        }
      };
    });

    // Click gallery button
    await page.getByText('Kies uit galerij').click();
    await page.waitForTimeout(1000);

    // For now, just verify the button was clicked
    // In a real implementation, we'd need to handle file input mocking
    await expect(page.getByText('Kies uit galerij')).toBeVisible();
  });

  test('navigation back flow', async ({ page }) => {
    await page.goto('/afval-melden');
    await page.waitForLoadState('networkidle');

    // Should show back button
    await expect(page.getByText('Terug')).toBeVisible();

    // Click back button
    await page.getByText('Terug').click();
    await page.waitForTimeout(500);

    // Should navigate back (exact behavior depends on routing)
    // This test verifies the button exists and is clickable
  });

  test('error handling for camera access denied', async ({ page }) => {
    // Override the camera mock to simulate permission denied
    await page.addInitScript(() => {
      Object.defineProperty(navigator, 'mediaDevices', {
        value: {
          getUserMedia: async () => {
            throw new DOMException('Permission denied', 'NotAllowedError');
          }
        },
        configurable: true
      });
    });

    await page.goto('/afval-melden');
    await page.waitForLoadState('networkidle');

    // Click camera button
    await page.getByText('Maak foto').click();
    await page.waitForTimeout(1000);

    // Should show error message
    await expect(page.getByText(/Camera niet beschikbaar/)).toBeVisible();
  });

  test('responsive design verification', async ({ page }) => {
    await page.goto('/afval-melden');
    await page.waitForLoadState('networkidle');

    // Test desktop view
    await page.setViewportSize({ width: 1024, height: 768 });
    await expect(page.getByText('Maak foto')).toBeVisible();

    // Test mobile view
    await page.setViewportSize({ width: 375, height: 667 });
    await expect(page.getByText('Maak foto')).toBeVisible();
    
    // Verify responsive layout
    const buttonContainer = page.locator('.w-full.bg-green-500');
    await expect(buttonContainer).toBeVisible();
  });
});