import { defineConfig } from '@playwright/test';

/**
 * Configuratie voor Playwright tests met bestaande Angular server
 */
export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:4200',
    trace: 'on-first-retry',
    headless: false
  },
  // Geen webserver starten, gebruik bestaande Angular server
  webServer: {
    command: 'npm run start',
    url: 'http://localhost:4200',
    reuseExistingServer: true,
    timeout: 120 * 1000,
  }
});