import { test, expect } from '@playwright/test';

/**
 * Deze test suite test specifiek de state machine service functionaliteit
 * voor de afval melden procedure.
 */
test.describe('State Machine Service Tests', () => {
  test('moet correct navigeren tussen stappen met state machine', async ({ page }) => {
    // Start op de homepage
    await page.goto('/');
    
    // Controleer of we op de start stap zijn
    await expect(page.locator('h2')).toContainText('Zie je zwerfafval?');
    
    // Klik op start melding knop om naar de volgende stap te gaan
    await page.click('text=Start melding');
    
    // Controleer of we naar de foto stap zijn gegaan
    await expect(page.locator('h2')).toContainText('Maak een foto van het afval');
    
    // Ga terug naar de vorige stap met de terug knop
    await page.click('ui-terug-knop button');
    
    // Controleer of we terug zijn op de start stap
    await expect(page.locator('h2')).toContainText('Zie je zwerfafval?');
    
    // Start opnieuw en ga door naar de foto stap
    await page.click('text=Start melding');
    await expect(page.locator('h2')).toContainText('Maak een foto van het afval');
    
    // Simuleer een foto upload en ga naar de volgende stap
    // Dit is een mock omdat we in de test geen echte foto kunnen uploaden
    await page.evaluate(() => {
      // Simuleer dat er een foto is geüpload in de state
      (window as any).mockFile = new File(['mock'], 'test.jpg', { type: 'image/jpeg' });
      // Dit zou normaal de foto service triggeren
      // We kunnen dit in een echte test niet direct doen, dus we skippen naar de volgende stap
    });
    
    // Ga naar de volgende stap (locatie)
    await page.click('text=Volgende');
    
    // Controleer of we op de locatie stap zijn
    await expect(page.locator('h2')).toContainText('Waar ligt het afval?');
    
    // Ga terug naar de foto stap
    await page.click('ui-terug-knop button');
    await expect(page.locator('h2')).toContainText('Maak een foto van het afval');
    
    // Ga weer vooruit naar locatie stap
    await page.click('text=Volgende');
    await expect(page.locator('h2')).toContainText('Waar ligt het afval?');
  });

  test('moet voortgangsindicator correct bijwerken bij stap verandering', async ({ page }) => {
    await page.goto('/');
    
    // Op de start pagina zou er geen voortgangsindicator moeten zijn
    const voortgangsBalk = page.locator('ui-voortgangs-balk');
    await expect(voortgangsBalk).not.toBeVisible();
    
    // Start de melding
    await page.click('text=Start melding');
    
    // Nu moet de voortgangsindicator zichtbaar zijn met stap 1/5
    await expect(voortgangsBalk).toBeVisible();
    await expect(page.locator('text=1/5')).toBeVisible();
    
    // Ga naar de volgende stap
    await page.click('text=Volgende');
    
    // Voortgangsindicator moet nu 2/5 tonen
    await expect(page.locator('text=2/5')).toBeVisible();
    
    // Ga terug
    await page.click('ui-terug-knop button');
    
    // Voortgangsindicator moet weer 1/5 tonen
    await expect(page.locator('text=1/5')).toBeVisible();
  });

  test('moet state behouden bij navigatie tussen stappen', async ({ page }) => {
    await page.goto('/');
    
    // Start de melding
    await page.click('text=Start melding');
    
    // Ga naar locatie stap (sla foto stap over voor deze test)
    await page.click('text=Volgende');
    await expect(page.locator('h2')).toContainText('Waar ligt het afval?');
    
    // Vul een adres in
    await page.fill('input[placeholder*="Zoek adres"]', 'Grote Markt, Groningen');
    await page.click('p-button[icon="pi pi-search"]');
    await page.waitForTimeout(1000); // Wacht op geocoding
    
    // Ga naar de volgende stap (contact)
    const volgendeKnop = page.locator('text=Volgende');
    if (await volgendeKnop.isVisible()) {
      await volgendeKnop.click();
    }
    
    // Controleer of we op de contact stap zijn
    await expect(page.locator('h2')).toContainText('Contactgegevens');
    
    // Ga terug naar locatie stap
    await page.click('ui-terug-knop button');
    
    // Controleer of het ingevulde adres nog steeds zichtbaar is
    // Dit test of de state behouden blijft bij navigatie
    const adresVeld = page.locator('input[placeholder*="Zoek adres"]');
    const adresWaarde = await adresVeld.inputValue();
    expect(adresWaarde).toContain('Grote Markt');
  });
});