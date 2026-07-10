import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright configuration for Kingdom Alliance workspace.
 * Configured specifically to use native macOS Safari runner.
 */
export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  use: {
    baseURL: 'http://localhost:3000',
    browserName: 'webkit', // Target WebKit/Safari
    headless: false,
    launchOptions: {
      // Point to native macOS Safari path
      executablePath: '/Applications/Safari.app/Contents/MacOS/Safari',
      // Ensure all chromium-specific launch arguments (like '--no-sandbox') are removed
      args: [] 
    }
  },
  projects: [
    {
      name: 'safari',
      use: { ...devices['Desktop Safari'] },
    },
  ],
});
