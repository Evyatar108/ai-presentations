/// <reference types="vitest" />
import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  resolve: {
    alias: {
      '@framework': path.resolve(__dirname, 'src/framework')
    }
  },
  test: {
    globals: true,
    environment: 'node',
    environmentMatchGlobs: [
      ['src/**/*.tsx', 'jsdom']
    ],
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/**/*.test.{ts,tsx}', 'scripts/**/*.test.ts', 'vite-plugin-handlers/**/*.test.ts']
  }
});
