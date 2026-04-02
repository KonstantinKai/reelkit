import { defineConfig, devices } from '@playwright/test';
import { nxE2EPreset } from '@nx/playwright/preset';
import { workspaceRoot } from '@nx/devkit';

const baseURL = process.env['BASE_URL'] || 'http://localhost:4300';
const port = new URL(baseURL).port;
const isCI = !!process.env['CI'];

export default defineConfig({
  ...nxE2EPreset(__filename, { testDir: './src' }),
  use: {
    baseURL,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'on-first-retry',
  },
  projects: isCI
    ? [
        { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
        {
          name: 'mobile-chrome',
          use: { ...devices['Pixel 5'], hasTouch: true },
        },
      ]
    : [
        {
          name: 'chromium',
          use: { ...devices['Desktop Chrome'] },
        },
        {
          name: 'webkit',
          use: { ...devices['Desktop Safari'] },
        },
        {
          name: 'mobile-chrome',
          use: { ...devices['Pixel 5'], hasTouch: true },
        },
        {
          name: 'mobile-safari',
          use: { ...devices['iPhone 12'], hasTouch: true },
        },
        {
          name: 'tablet',
          use: { ...devices['iPad Mini'], hasTouch: true },
        },
      ],
  webServer: {
    command: `npx nx serve example-react --port ${port}`,
    url: baseURL,
    reuseExistingServer: !process.env['CI'],
    cwd: workspaceRoot,
    timeout: 120000,
  },
});
