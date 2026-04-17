import { defineConfig, devices } from '@playwright/test';
import { nxE2EPreset } from '@nx/playwright/preset';
import { workspaceRoot } from '@nx/devkit';

const baseURL = process.env['BASE_URL'] || 'http://localhost:4400';
const port = new URL(baseURL).port;

export default defineConfig({
  ...nxE2EPreset(__filename, { testDir: './src' }),
  reporter: [['html'], ['json', { outputFile: 'test-results.json' }]],
  use: {
    baseURL,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'on-first-retry',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'mobile-chrome', use: { ...devices['Pixel 5'], hasTouch: true } },
  ],
  webServer: {
    command: `npx nx serve example-angular --port ${port}`,
    url: baseURL,
    reuseExistingServer: !process.env['CI'],
    cwd: workspaceRoot,
    timeout: 120000,
  },
});
