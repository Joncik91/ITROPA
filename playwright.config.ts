import { defineConfig } from '@playwright/test';

// V2 browser checks run against a throwaway dev server on a loopback port, so they never
// touch the tailnet instance. Set PW_CHROMIUM to a chromium binary if the default is missing.
export default defineConfig({
  testDir: 'e2e',
  testMatch: '*.spec.ts',
  outputDir: 'node_modules/.cache/pw-results',
  use: {
    baseURL: 'http://127.0.0.1:5199',
    viewport: { width: 390, height: 844 },
    launchOptions: process.env.PW_CHROMIUM ? { executablePath: process.env.PW_CHROMIUM } : {},
  },
  webServer: {
    command: 'npx vite --host 127.0.0.1 --port 5199 --strictPort',
    url: 'http://127.0.0.1:5199/v2/',
    reuseExistingServer: false,
    timeout: 60_000,
  },
});
