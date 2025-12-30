import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright E2E test configuration for one-item-slider
 * Tests rendering, navigation, and animations across browsers and devices
 */
export default defineConfig({
  testDir: './apps',
  testMatch: '**/e2e/**/*.spec.ts',

  // Run tests in parallel
  fullyParallel: true,

  // Fail the build on CI if you accidentally left test.only in the source code
  forbidOnly: !!process.env.CI,

  // Retry on CI only
  retries: process.env.CI ? 2 : 0,

  // Opt out of parallel tests on CI
  workers: process.env.CI ? 1 : undefined,

  // Reporter to use
  reporter: [['html', { open: 'never' }], ['list']],

  // Shared settings for all the projects
  use: {
    // Base URL for actions like `await page.goto('/')`
    baseURL: 'http://localhost:4200',

    // Collect trace when retrying the failed test
    trace: 'on-first-retry',

    // Screenshot on failure
    screenshot: 'only-on-failure',

    // Video on failure
    video: 'on-first-retry',
  },

  // Configure projects for major browsers and devices
  projects: [
    // Desktop browsers
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },

    // Mobile devices with touch
    {
      name: 'mobile-chrome',
      use: {
        ...devices['Pixel 5'],
        hasTouch: true,
      },
    },
    {
      name: 'mobile-safari',
      use: {
        ...devices['iPhone 12'],
        hasTouch: true,
      },
    },

    // Tablet
    {
      name: 'tablet',
      use: {
        ...devices['iPad Mini'],
        hasTouch: true,
      },
    },
  ],

  // Run local dev servers before starting the tests
  webServer: [
    {
      command: 'npx nx serve example-react',
      url: 'http://localhost:4200',
      reuseExistingServer: !process.env.CI,
      timeout: 120000,
    },
    {
      command: 'npx nx serve example-vue',
      url: 'http://localhost:4201',
      reuseExistingServer: !process.env.CI,
      timeout: 120000,
    },
  ],
});
