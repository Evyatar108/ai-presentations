import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { audioWriterPlugin } from './vite-plugin-audio-writer';

export default defineConfig({
  plugins: [
    react(),
    audioWriterPlugin()  // Enables /api/save-audio endpoint for TTS regeneration
  ],
  resolve: {
    alias: {
      '@framework': path.resolve(__dirname, 'src/framework')
    }
  },
  server: {
    port: 5173,
    host: true,
    open: false
  },
  optimizeDeps: {
    include: ['shiki']
  },
  build: {
    target: 'es2020',
    outDir: 'dist',
    sourcemap: true
  }
});