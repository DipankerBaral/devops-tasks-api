import { defineConfig } from '@playwright/test';

// The URL the tests run against. Defaults to your local API, but CI can
// point the same tests at Docker or AWS by setting BASE_URL.
const baseURL = process.env.BASE_URL || 'http://localhost:3000';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,

  // In CI, also write a JUnit XML report that pipelines can display.
  reporter: process.env.CI
    ? [['list'], ['html', { open: 'never' }], ['junit', { outputFile: 'test-results/junit.xml' }]]
    : [['list'], ['html', { open: 'never' }]],

  use: {
    baseURL,
  },

  // If no BASE_URL is given, Playwright starts the API itself and waits
  // for /health to respond before running the tests.
  webServer: process.env.BASE_URL
    ? undefined
    : {
        command: 'npm start',
        url: `${baseURL}/health`,
        reuseExistingServer: !process.env.CI,
        timeout: 30_000,
      },
});
