import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests/visual',
  testMatch: '**/*.capture.spec.ts',
  globalSetup: './tests/e2e/global-setup.ts',
  fullyParallel: false,
  workers: 1,
  timeout: 30_000,
  expect: { timeout: 10_000 },
  use: {
    baseURL: 'http://127.0.0.1:4318',
    actionTimeout: 10_000,
    navigationTimeout: 30_000,
    screenshot: 'off',
    trace: 'off',
    video: 'off',
  },
  projects: [
    { name: 'desktop-1440', use: { viewport: { width: 1440, height: 900 } } },
    { name: 'tablet-768', use: { viewport: { width: 768, height: 1024 } } },
    { name: 'mobile-375', use: { viewport: { width: 375, height: 812 } } },
  ],
});
