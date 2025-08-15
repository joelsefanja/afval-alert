import { test, expect } from '@playwright/test';

test.describe('Debug Homepage', () => {
  test('debug homepage loading issues', async ({ page }) => {
    // Listen to console errors
    page.on('console', msg => {
      if (msg.type() === 'error') {
        console.log('Browser Console Error:', msg.text());
      }
    });

    // Listen to page errors
    page.on('pageerror', error => {
      console.log('Page Error:', error.message);
    });

    await page.goto('/');
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    
    // Take a screenshot for debugging
    await page.screenshot({ path: 'debug-homepage.png' });
    
    // Get full page HTML
    const fullHTML = await page.content();
    console.log('Full page HTML:', fullHTML);
    
    // Check if Angular loaded
    const hasAngularBootstrap = await page.evaluate(() => {
      return !!(window as any).ng;
    });
    console.log('Angular loaded:', hasAngularBootstrap);
    
    // Check if there are any components
    const components = await page.locator('*[ng-version]').count();
    console.log('Angular components found:', components);
    
    // Check router outlet
    const routerOutlet = await page.locator('router-outlet').count();
    console.log('Router outlets found:', routerOutlet);
  });
});