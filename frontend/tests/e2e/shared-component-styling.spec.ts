import { test, expect } from '@playwright/test';

// Dit testbestand is bijgewerkt om Playwright's ingebouwde visuele regressietestfunctionaliteit te gebruiken.
// Screenshots worden nu automatisch vergeleken met een baseline.
// Om de baselines bij te werken, voer 'npx playwright test --update-snapshots' uit.

test('Shared component styling is correctly applied', async ({ page }) => {
  // Set consistent viewport to avoid screenshot inconsistencies
  await page.setViewportSize({ width: 1280, height: 720 });
  
  // Navigeer naar de test-tailwind pagina
  await page.goto('/test-tailwind');
  
  // Wacht op de pagina om te laden en CSS om te laden
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1000); // Extra tijd voor CSS rendering
  
  // Controleer of de standaard TestComponentComponent zichtbaar is (eerste component)
  const standardComponent = await page.locator('app-test-component >> nth=0');
  await expect(standardComponent).toBeVisible();
  
  // Controleer of de knop in de standaard component de juiste styling heeft
  const standardButton = await page.locator('app-test-component >> nth=0 >> button');
  await expect(standardButton).toBeVisible();
  
  // Wacht tot de Tailwind styling is toegepast en controleer alle eigenschappen
  await expect(standardButton).toHaveCSS('background-color', 'rgb(34, 197, 94)', { timeout: 10000 }); // bg-green-500
  await expect(standardButton).toHaveCSS('color', 'rgb(255, 255, 255)'); // text-white  
  await expect(standardButton).toHaveCSS('border-radius', '6px'); // rounded-md
  await expect(standardButton).toHaveCSS('padding', '8px 16px'); // p-2 px-4 (verwachte padding)
  
  // Controleer of de aangepaste component zichtbaar is (tweede component)
  const customComponent = await page.locator('app-test-component >> nth=1');
  await expect(customComponent).toBeVisible();
  
  // Controleer of de knop in de aangepaste component de juiste styling heeft
  const customButton = await page.locator('app-test-component >> nth=1 >> button');
  await expect(customButton).toBeVisible();
  
  // Controleer of de aangepaste knop ook dezelfde Tailwind styling heeft
  await expect(customButton).toHaveCSS('background-color', 'rgb(34, 197, 94)'); // bg-green-500
  await expect(customButton).toHaveCSS('color', 'rgb(255, 255, 255)'); // text-white
  await expect(customButton).toHaveCSS('border-radius', '6px'); // rounded-md
  await expect(customButton).toHaveCSS('padding', '8px 16px'); // p-2 px-4
  
  // Extra verificatie: Controleer dat knoppen daadwerkelijk groen zijn en niet grijs
  const computedBgColor = await standardButton.evaluate(el => getComputedStyle(el).backgroundColor);
  expect(computedBgColor).toBe('rgb(34, 197, 94)'); // Exact groene kleur verwacht
  
  // Controleer dat er geen placeholder/fallback stijlen worden gebruikt
  const computedTextColor = await standardButton.evaluate(el => getComputedStyle(el).color);
  expect(computedTextColor).toBe('rgb(255, 255, 255)'); // Wit, niet grijs
  
  // Voer screenshot test uit met consistente viewport
  await expect(page).toHaveScreenshot('shared-component-styling.png', { 
    fullPage: true,
    threshold: 0.2 // Accepteer kleine pixelverschillen
  });
  
  console.log('✅ Tailwind CSS styling is correctly applied and visible');
});