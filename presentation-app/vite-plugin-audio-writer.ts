import { Plugin } from 'vite';
import * as fs from 'fs';
import * as path from 'path';
import { sendJson } from './vite-plugin-handlers/types';
import { createAudioHandlers } from './vite-plugin-handlers/audio';
import { createNarrationHandlers } from './vite-plugin-handlers/narration';
import { createStalenessHandlers } from './vite-plugin-handlers/staleness';
import { createVideoBookmarkHandlers } from './vite-plugin-handlers/videoBookmarks';

/**
 * Vite plugin that adds local file-writing endpoints for TTS audio files
 * and narration persistence. This allows the browser to save regenerated
 * audio and narration edits to disk via the dev server.
 */
export function audioWriterPlugin(): Plugin {
  return {
    name: 'audio-writer',

    // Copy server_config.json to public/ on dev server start
    configResolved() {
      const projectRoot = process.cwd();
      const sourceConfig = path.join(projectRoot, '..', 'tts', 'server_config.json');
      const destConfig = path.join(projectRoot, 'public', 'server_config.json');

      try {
        if (fs.existsSync(sourceConfig)) {
          fs.copyFileSync(sourceConfig, destConfig);
          console.log('[audio-writer] Copied tts/server_config.json to public/');
        } else {
          console.warn('[audio-writer] Warning: tts/server_config.json not found');
        }
      } catch (error: any) {
        console.error('[audio-writer] Failed to copy server_config.json:', error.message);
      }
    },

    configureServer(server) {
      const projectRoot = process.cwd();
      const ctx = { projectRoot };

      // ─── Health check (kept inline — trivial) ──────────────────────
      server.middlewares.use('/api/health', (req, res, next) => {
        if (req.method !== 'GET') { next(); return; }
        sendJson(res, 200, { status: 'ok', service: 'vite-narration-api' });
      });

      // ─── Register all handler groups ───────────────────────────────
      const allRoutes = [
        ...createAudioHandlers(ctx),
        ...createNarrationHandlers(ctx),
        ...createStalenessHandlers(ctx),
        ...createVideoBookmarkHandlers(ctx),
      ];

      for (const route of allRoutes) {
        server.middlewares.use(route.path, route.handler);
      }
    }
  };
}
