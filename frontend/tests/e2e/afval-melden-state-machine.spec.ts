import { test, expect } from '@playwright/test';

/**
 * Deze test suite test de state machine functionaliteit voor de afval melden procedure
 * met focus op de UI-interactie en state behoud tussen stappen.
 */
test.describe('Afval Melden State Machine', () => {
  test.beforeEach(async ({ page }) => {
    // Start op de homepage voor elke test
    await page.goto('/');
  });

  test('moet correct navigeren tussen stappen en state behouden', async ({ page }) => {
    // Controleer of we op de start stap zijn
    await expect(page.locator('h2')).toContainText('Zie je zwerfafval?');
    
    // Klik op start melding knop om naar de volgende stap te gaan
    await page.click('text=Start melding');
    
    // Controleer of we naar de foto stap zijn gegaan
    await expect(page.locator('h2')).toContainText('Maak een foto van het afval');
    
    // Controleer of de voortgangsindicator zichtbaar is met stap 1/5
    const voortgangsBalk = page.locator('ui-voortgangs-balk');
    await expect(voortgangsBalk).toBeVisible();
    await expect(page.locator('text=1/5')).toBeVisible();
    
    // Ga terug naar de vorige stap met de terug knop
    await page.click('ui-terug-knop button');
    
    // Controleer of we terug zijn op de start stap
    await expect(page.locator('h2')).toContainText('Zie je zwerfafval?');
    
    // Controleer of de voortgangsindicator niet meer zichtbaar is
    await expect(voortgangsBalk).not.toBeVisible();
    
    // Start opnieuw en ga door naar de foto stap
    await page.click('text=Start melding');
    await expect(page.locator('h2')).toContainText('Maak een foto van het afval');
    
    // Simuleer een foto upload en ga naar de volgende stap
    // In een echte test zouden we hier een bestand uploaden, maar voor deze test
    // gaan we direct naar de volgende stap
    await page.click('text=Volgende');
    
    // Controleer of we op de locatie stap zijn
    await expect(page.locator('h2')).toContainText('Waar ligt het afval?');
    
    // Controleer of de voortgangsindicator nu 2/5 toont
    await expect(page.locator('text=2/5')).toBeVisible();
  });

  test('moet foutmeldingen tonen bij ongeldige invoer', async ({ page }) => {
    // Ga naar de foto stap
    await page.click('text=Start melding');
    
    // Probeer naar de volgende stap te gaan zonder foto
    // Dit zou een foutmelding moeten tonen
    const volgendeKnop = page.locator('text=Volgende');
    
    // Als de knop disabled is, kunnen we niet klikken en is de test geslaagd
    // Als de knop niet disabled is, klikken we en controleren we op een foutmelding
    if (await volgendeKnop.isEnabled()) {
      await volgendeKnop.click();
      
      // Controleer of er een foutmelding verschijnt
      const foutmelding = page.locator('p-message.p-message-error');
      await expect(foutmelding).toBeVisible();
      
      // We zouden nog steeds op de foto stap moeten zijn
      await expect(page.locator('h2')).toContainText('Maak een foto van het afval');
    } else {
      // Als de knop disabled is, is dat ook goed (preventieve validatie)
      expect(await volgendeKnop.isDisabled()).toBeTruthy();
    }
  });

  test('moet voortgangsindicator correct bijwerken bij navigatie', async ({ page }) => {
    // Ga naar de foto stap
    await page.click('text=Start melding');
    
    // Controleer of de voortgangsindicator zichtbaar is met stap 1/5
    await expect(page.locator('text=1/5')).toBeVisible();
    
    // Ga naar de volgende stap (locatie)
    await page.click('text=Volgende');
    
    // Controleer of de voortgangsindicator nu 2/5 toont
    await expect(page.locator('text=2/5')).toBeVisible();
    
    // Ga terug naar de foto stap
    await page.click('ui-terug-knop button');
    
    // Controleer of de voortgangsindicator weer 1/5 toont
    await expect(page.locator('text=1/5')).toBeVisible();
  });

  test('moet offline status correct tonen', async ({ page }) => {
    // Simuleer offline status via browser context
    await page.context().setOffline(true);
    
    // Herlaad de pagina om offline status te activeren
    await page.reload();
    
    // Controleer of de offline notificatie zichtbaar is
    const offlineNotificatie = page.locator('ui-offline-notificatie');
    await expect(offlineNotificatie).toBeVisible();
    
    // Zet browser weer online
    await page.context().setOffline(false);
    
    // Herlaad de pagina
    await page.reload();
    
    // Controleer of de offline notificatie niet meer zichtbaar is
    await expect(offlineNotificatie).not.toBeVisible();
  });
});