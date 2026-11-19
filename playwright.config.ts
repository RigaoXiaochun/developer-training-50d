import { defineConfig } from '@playwright/test';
export default defineConfig({
  testDir: './tests/browser',
  timeout: 30000,
  workers: 1,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: 'http://127.0.0.1:4780',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    ...(process.env.TRAINING_BROWSER_CHANNEL === 'msedge'
      ? { channel: 'msedge' }
      : {}),
  },
  webServer: {
    command: 'node tools/test-server.mjs',
    url: 'http://127.0.0.1:4780',
    reuseExistingServer: false,
    timeout: 30000,
  },
});
