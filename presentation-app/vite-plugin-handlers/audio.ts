/**
 * Audio-related endpoint handlers:
 *   POST /api/save-audio
 *   GET  /api/subtitle-corrections
 *   POST /api/subtitle-corrections/save
 */
import * as fs from 'fs';
import * as path from 'path';
import type { Connect } from 'vite';
import {
  readJsonBody,
  sendJson,
  parseQuery,
  type HandlerContext,
  type SaveAudioRequest,
} from './types';

/** Route descriptor returned to the main plugin for registration. */
export interface AudioRoute {
  path: string;
  handler: Connect.NextHandleFunction;
}

/** Build all audio-domain routes. */
export function createAudioHandlers(ctx: HandlerContext): AudioRoute[] {
  const { projectRoot } = ctx;

  // ─── POST /api/save-audio ──────────────────────────────────────────
  const saveAudio: Connect.NextHandleFunction = async (req, res) => {
    if (req.method !== 'POST') {
      sendJson(res, 405, { success: false, error: 'Method Not Allowed' });
      return;
    }

    try {
      const data = await readJsonBody<SaveAudioRequest>(req);

      if (!data.audioBase64 || !data.outputPath || !data.narrationText) {
        throw new Error('Missing required fields: audioBase64, outputPath, or narrationText');
      }

      const publicAudioDir = path.join(projectRoot, 'public', 'audio');
      const fullOutputPath = path.join(publicAudioDir, data.outputPath);

      // Security: Ensure output path is within public/audio/
      const normalizedOutput = path.normalize(fullOutputPath);
      const normalizedBase = path.normalize(publicAudioDir);
      if (!normalizedOutput.startsWith(normalizedBase)) {
        throw new Error('Invalid output path: must be within public/audio/');
      }

      // Security: Only allow .wav files
      if (!data.outputPath.endsWith('.wav')) {
        throw new Error('Invalid file extension: only .wav files allowed');
      }

      const outputDir = path.dirname(fullOutputPath);
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
      }

      const audioBuffer = Buffer.from(data.audioBase64, 'base64');
      fs.writeFileSync(fullOutputPath, audioBuffer);

      console.log(`[audio-writer] Saved audio file: ${data.outputPath} (${audioBuffer.length} bytes)`);

      // Update cache file
      const cacheFile = path.join(projectRoot, '.tts-narration-cache.json');
      let cache: Record<string, any> = {};
      if (fs.existsSync(cacheFile)) {
        try {
          cache = JSON.parse(fs.readFileSync(cacheFile, 'utf-8'));
        } catch {
          cache = {};
        }
      }

      const cacheKey = data.outputPath.replace(/\\/g, '/');
      cache[cacheKey] = {
        narrationText: data.narrationText,
        generatedAt: new Date().toISOString()
      };
      fs.writeFileSync(cacheFile, JSON.stringify(cache, null, 2));

      console.log(`[audio-writer] Updated cache entry: ${cacheKey}`);

      sendJson(res, 200, {
        success: true,
        filePath: data.outputPath,
        timestamp: Date.now()
      });
    } catch (error: any) {
      console.error('[audio-writer] Error:', error);
      sendJson(res, 500, { success: false, error: error.message || 'Unknown error' });
    }
  };

  // ─── GET /api/subtitle-corrections ─────────────────────────────────
  const getSubtitleCorrections: Connect.NextHandleFunction = (req, res, next) => {
    if (req.method !== 'GET') { next(); return; }

    try {
      const q = parseQuery(req.url || '');
      if (!q.demoId) {
        throw new Error('Missing query param: demoId');
      }

      // Security: reject path traversal
      if (/[/\\.]\./.test(q.demoId) || q.demoId.includes('..')) {
        throw new Error('Invalid demoId');
      }

      const filePath = path.join(projectRoot, 'public', 'audio', q.demoId, 'subtitle-corrections.json');
      if (!fs.existsSync(filePath)) {
        sendJson(res, 200, { corrections: {} });
        return;
      }

      const corrections = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
      sendJson(res, 200, { corrections });
    } catch (error: any) {
      console.error('[subtitle-corrections] Read error:', error);
      sendJson(res, 500, { success: false, error: error.message });
    }
  };

  // ─── POST /api/subtitle-corrections/save ───────────────────────────
  const saveSubtitleCorrections: Connect.NextHandleFunction = async (req, res, next) => {
    if (req.method !== 'POST') { next(); return; }

    try {
      const data = await readJsonBody<{ demoId: string; corrections: Record<string, string> }>(req);
      if (!data.demoId || !data.corrections) {
        throw new Error('Missing required fields: demoId, corrections');
      }

      // Security: reject path traversal
      if (/[/\\.]\./.test(data.demoId) || data.demoId.includes('..')) {
        throw new Error('Invalid demoId');
      }

      const audioDir = path.join(projectRoot, 'public', 'audio', data.demoId);
      if (!fs.existsSync(audioDir)) {
        fs.mkdirSync(audioDir, { recursive: true });
      }

      const filePath = path.join(audioDir, 'subtitle-corrections.json');
      fs.writeFileSync(filePath, JSON.stringify(data.corrections, null, 2) + '\n');

      console.log(`[subtitle-corrections] Saved ${Object.keys(data.corrections).length} corrections for ${data.demoId}`);
      sendJson(res, 200, { success: true });
    } catch (error: any) {
      console.error('[subtitle-corrections] Save error:', error);
      sendJson(res, 500, { success: false, error: error.message });
    }
  };

  return [
    { path: '/api/save-audio', handler: saveAudio },
    { path: '/api/subtitle-corrections/save', handler: saveSubtitleCorrections },
    { path: '/api/subtitle-corrections', handler: getSubtitleCorrections },
  ];
}
