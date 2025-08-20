import { test, expect } from '@playwright/test';

test('camera flow - open camera and take photo', async ({ page }) => {
  // Navigate to the app
  await page.goto('/');
  
  // Click on "Meld afval" button on homepage
  await page.getByRole('button', { name: 'Meld afval' }).click();
  
  // Wait for the foto upload step (step 2)
  await expect(page).toHaveURL(/.*foto-upload/);
  
  // Click on "Open Camera" button
  await page.getByRole('button', { name: 'Open Camera' }).click();
  
  // Wait for camera to initialize (we can't actually test camera access in headless mode)
  // but we can check if the video element appears
  await expect(page.locator('video')).toBeVisible({ timeout: 10000 });
  
  // Click on "Maak Foto" button
  await page.getByRole('button', { name: 'Maak Foto' }).click();
  
  // Check if photo is displayed
  await expect(page.locator('img')).toBeVisible();
  
  // Check if "Volgende" button is enabled
  const volgendeButton = page.getByRole('button', { name: 'Volgende' });
  await expect(volgendeButton).toBeEnabled();
  
  // Click on "Volgende" button
  await volgendeButton.click();
  
  // Should navigate to the next step (AI classification)
  await expect(page).not.toHaveURL(/.*foto-upload/);
});