import { defineConfig } from '@playwright/test';

const height = parseInt(process.env.VIEWPORT_HEIGHT || '1080', 10);
const width = parseInt(process.env.VIEWPORT_WIDTH || '1920', 10);

export default defineConfig({
  testDir: './tests',
  timeout: 300_000,
  expect: { timeout: 10_000 },
  use: {
    baseURL: 'http://localhost:5173',
    headless: true,
    viewport: { width, height },
    browserName: 'chromium',
  },
  projects: [
    {
      name: 'static',
      testMatch: ['overflow.spec.ts', 'screenshot.spec.ts'],
      use: { reducedMotion: 'reduce' },
    },
    {
      name: 'record',
      testMatch: ['record.spec.ts'],
      // Full animations for video recording
    },
  ],
});
