import { Plugin } from 'vite';
import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';
import { execSync } from 'child_process';

interface SaveAudioRequest {
  audioBase64: string;
  outputPath: string;      // e.g., "c2/s1_segment_01_intro.wav"
  narrationText: string;
  chapter: number;
  slide: number;
  segmentId: string;
}

interface SaveAudioResponse {
  success: boolean;
  filePath?: string;
  timestamp?: number;
  error?: string;
}

/** Helper: read full JSON body from an IncomingMessage */
function readJsonBody<T>(req: import('http').IncomingMessage): Promise<T> {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', (chunk: Buffer) => { body += chunk.toString(); });
    req.on('end', () => {
      try { resolve(JSON.parse(body)); }
      catch (e) { reject(e); }
    });
    req.on('error', reject);
  });
}

/** Helper: send JSON response */
function sendJson(res: import('http').ServerResponse, statusCode: number, data: Record<string, unknown>) {
  res.statusCode = statusCode;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(data));
}

/** Helper: parse query string from a URL */
function parseQuery(url: string): Record<string, string> {
  const idx = url.indexOf('?');
  if (idx === -1) return {};
  const params: Record<string, string> = {};
  for (const part of url.slice(idx + 1).split('&')) {
    const [k, v] = part.split('=');
    if (k) params[decodeURIComponent(k)] = decodeURIComponent(v ?? '');
  }
  return params;
}

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

      // ─── GET /api/health ───────────────────────────────────────────
      server.middlewares.use('/api/health', (req, res, next) => {
        if (req.method !== 'GET') { next(); return; }
        sendJson(res, 200, { status: 'ok', service: 'vite-narration-api' });
      });

      // ─── POST /api/save-audio ──────────────────────────────────────
      server.middlewares.use('/api/save-audio', async (req, res) => {
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
      });

      // ─── POST /api/narration/save ──────────────────────────────────
      server.middlewares.use('/api/narration/save', async (req, res, next) => {
        if (req.method !== 'POST') { next(); return; }

        try {
          const data = await readJsonBody<{ demoId: string; narrationData: any }>(req);
          if (!data.demoId || !data.narrationData) {
            throw new Error('Missing required fields: demoId, narrationData');
          }

          const narrationDir = path.join(projectRoot, 'public', 'narration', data.demoId);
          if (!fs.existsSync(narrationDir)) {
            fs.mkdirSync(narrationDir, { recursive: true });
          }

          const filePath = path.join(narrationDir, 'narration.json');
          const tmpPath = filePath + '.tmp';
          fs.writeFileSync(tmpPath, JSON.stringify(data.narrationData, null, 2));
          fs.renameSync(tmpPath, filePath);

          console.log(`[narration] Saved narration.json for ${data.demoId}`);
          sendJson(res, 200, {
            success: true,
            filePath: `narration/${data.demoId}/narration.json`,
            timestamp: new Date().toISOString()
          });
        } catch (error: any) {
          console.error('[narration] Save error:', error);
          sendJson(res, 500, { success: false, error: error.message });
        }
      });

      // ─── POST /api/narration/update-cache ──────────────────────────
      server.middlewares.use('/api/narration/update-cache', async (req, res, next) => {
        if (req.method !== 'POST') { next(); return; }

        try {
          const data = await readJsonBody<{
            demoId: string;
            segment: { key: string; hash: string; timestamp: string };
          }>(req);
          if (!data.demoId || !data.segment) {
            throw new Error('Missing required fields: demoId, segment');
          }

          const narrationDir = path.join(projectRoot, 'public', 'narration', data.demoId);
          if (!fs.existsSync(narrationDir)) {
            fs.mkdirSync(narrationDir, { recursive: true });
          }

          const cacheFile = path.join(narrationDir, 'narration-cache.json');
          let cache: Record<string, any> = {};
          if (fs.existsSync(cacheFile)) {
            try { cache = JSON.parse(fs.readFileSync(cacheFile, 'utf-8')); }
            catch { cache = {}; }
          }

          cache[data.segment.key] = {
            hash: data.segment.hash,
            timestamp: data.segment.timestamp
          };
          fs.writeFileSync(cacheFile, JSON.stringify(cache, null, 2));

          console.log(`[narration] Updated cache for ${data.segment.key}`);
          sendJson(res, 200, { success: true });
        } catch (error: any) {
          console.error('[narration] Cache update error:', error);
          sendJson(res, 500, { success: false, error: error.message });
        }
      });

      // ─── POST /api/narration/realign-segment ───────────────────────
      server.middlewares.use('/api/narration/realign-segment', async (req, res, next) => {
        if (req.method !== 'POST') { next(); return; }

        try {
          const data = await readJsonBody<{
            demoId: string; chapter: number; slide: number; segmentId: string;
          }>(req);
          if (!data.demoId || data.chapter == null || data.slide == null || !data.segmentId) {
            throw new Error('Missing required fields: demoId, chapter, slide, segmentId');
          }

          const segKey = `ch${data.chapter}:s${data.slide}:${data.segmentId}`;
          console.log(`[narration] Realigning segment: ${segKey} for demo ${data.demoId}`);

          const cmd = `npx tsx scripts/generate-alignment.ts --demo ${data.demoId} --segments ${segKey} --force`;
          execSync(cmd, {
            cwd: projectRoot,
            timeout: 120_000,
            stdio: 'pipe',
            encoding: 'utf-8',
          });

          console.log(`[narration] Realignment completed for ${segKey}`);
          sendJson(res, 200, { success: true });
        } catch (error: any) {
          console.error('[narration] Realignment error:', error);
          const message = error.stderr || error.message || 'Realignment failed';
          sendJson(res, 500, { success: false, error: message });
        }
      });

      // ─── POST /api/narration/save-preview ──────────────────────────
      server.middlewares.use('/api/narration/save-preview', async (req, res, next) => {
        if (req.method !== 'POST') { next(); return; }

        try {
          const data = await readJsonBody<{
            demoId: string; chapter: number; slide: number;
            segmentId: string; audioBase64: string; narrationText: string;
          }>(req);
          if (!data.demoId || !data.segmentId || !data.audioBase64) {
            throw new Error('Missing required fields');
          }

          const previewDir = path.join(
            projectRoot, 'public', 'audio', data.demoId,
            '.previews', `ch${data.chapter}_s${data.slide}_${data.segmentId}`
          );
          if (!fs.existsSync(previewDir)) {
            fs.mkdirSync(previewDir, { recursive: true });
          }

          // Read or create previews.json (narrationText stored per-take)
          const metaFile = path.join(previewDir, 'previews.json');
          let meta: { takes: { takeNumber: number; narrationText: string; generatedAt: string }[] } = {
            takes: []
          };
          if (fs.existsSync(metaFile)) {
            try { meta = JSON.parse(fs.readFileSync(metaFile, 'utf-8')); }
            catch { /* use default */ }
          }

          const takeNumber = meta.takes.length > 0
            ? Math.max(...meta.takes.map(t => t.takeNumber)) + 1
            : 1;

          // Write audio file
          const takeFile = path.join(previewDir, `take_${takeNumber}.wav`);
          fs.writeFileSync(takeFile, Buffer.from(data.audioBase64, 'base64'));

          meta.takes.push({
            takeNumber,
            narrationText: data.narrationText || '',
            generatedAt: new Date().toISOString(),
          });
          fs.writeFileSync(metaFile, JSON.stringify(meta, null, 2));

          const servePath = `/audio/${data.demoId}/.previews/ch${data.chapter}_s${data.slide}_${data.segmentId}/take_${takeNumber}.wav`;
          console.log(`[narration] Saved preview take ${takeNumber}: ${servePath}`);

          sendJson(res, 200, { success: true, takeNumber, servePath });
        } catch (error: any) {
          console.error('[narration] Save preview error:', error);
          sendJson(res, 500, { success: false, error: error.message });
        }
      });

      // ─── GET /api/narration/list-previews ──────────────────────────
      server.middlewares.use('/api/narration/list-previews', (req, res, next) => {
        if (req.method !== 'GET') { next(); return; }

        try {
          const q = parseQuery(req.url || '');
          if (!q.demoId || !q.segmentId) {
            throw new Error('Missing query params: demoId, chapter, slide, segmentId');
          }

          const previewDir = path.join(
            projectRoot, 'public', 'audio', q.demoId,
            '.previews', `ch${q.chapter}_s${q.slide}_${q.segmentId}`
          );

          const metaFile = path.join(previewDir, 'previews.json');
          if (!fs.existsSync(metaFile)) {
            sendJson(res, 200, { narrationText: null, previews: [] });
            return;
          }

          const meta = JSON.parse(fs.readFileSync(metaFile, 'utf-8'));
          const previews = (meta.takes || []).map((t: any) => ({
            takeNumber: t.takeNumber,
            narrationText: t.narrationText ?? meta.narrationText ?? '',
            servePath: `/audio/${q.demoId}/.previews/ch${q.chapter}_s${q.slide}_${q.segmentId}/take_${t.takeNumber}.wav`,
            generatedAt: t.generatedAt
          }));

          sendJson(res, 200, { previews });
        } catch (error: any) {
          console.error('[narration] List previews error:', error);
          sendJson(res, 500, { success: false, error: error.message });
        }
      });

      // ─── POST /api/narration/accept-preview ────────────────────────
      server.middlewares.use('/api/narration/accept-preview', async (req, res, next) => {
        if (req.method !== 'POST') { next(); return; }

        try {
          const data = await readJsonBody<{
            demoId: string; chapter: number; slide: number;
            segmentId: string; segmentIndex: number; takeNumber: number;
          }>(req);
          if (!data.demoId || !data.segmentId || !data.takeNumber) {
            throw new Error('Missing required fields');
          }

          const previewDir = path.join(
            projectRoot, 'public', 'audio', data.demoId,
            '.previews', `ch${data.chapter}_s${data.slide}_${data.segmentId}`
          );
          const takeFile = path.join(previewDir, `take_${data.takeNumber}.wav`);

          if (!fs.existsSync(takeFile)) {
            throw new Error(`Take file not found: take_${data.takeNumber}.wav`);
          }

          // Build the real audio destination path
          const paddedIndex = String((data.segmentIndex ?? 0) + 1).padStart(2, '0');
          const destRelative = `${data.demoId}/c${data.chapter}/s${data.slide}_segment_${paddedIndex}_${data.segmentId}.wav`;
          const destFull = path.join(projectRoot, 'public', 'audio', destRelative);

          const destDir = path.dirname(destFull);
          if (!fs.existsSync(destDir)) {
            fs.mkdirSync(destDir, { recursive: true });
          }

          // Copy take to real audio path
          fs.copyFileSync(takeFile, destFull);
          console.log(`[narration] Accepted take ${data.takeNumber} → ${destRelative}`);

          // Delete entire preview dir
          fs.rmSync(previewDir, { recursive: true, force: true });
          console.log(`[narration] Cleaned up preview dir`);

          sendJson(res, 200, {
            success: true,
            filePath: destRelative,
            timestamp: Date.now()
          });
        } catch (error: any) {
          console.error('[narration] Accept preview error:', error);
          sendJson(res, 500, { success: false, error: error.message });
        }
      });

      // ─── POST /api/narration/delete-preview ────────────────────────
      server.middlewares.use('/api/narration/delete-preview', async (req, res, next) => {
        if (req.method !== 'POST') { next(); return; }

        try {
          const data = await readJsonBody<{
            demoId: string; chapter: number; slide: number;
            segmentId: string; takeNumber: number;
          }>(req);
          if (!data.demoId || !data.segmentId || !data.takeNumber) {
            throw new Error('Missing required fields');
          }

          const previewDir = path.join(
            projectRoot, 'public', 'audio', data.demoId,
            '.previews', `ch${data.chapter}_s${data.slide}_${data.segmentId}`
          );

          // Delete the .wav file
          const takeFile = path.join(previewDir, `take_${data.takeNumber}.wav`);
          if (fs.existsSync(takeFile)) fs.unlinkSync(takeFile);

          // Update previews.json
          const metaFile = path.join(previewDir, 'previews.json');
          if (fs.existsSync(metaFile)) {
            try {
              const meta = JSON.parse(fs.readFileSync(metaFile, 'utf-8'));
              meta.takes = (meta.takes || []).filter((t: any) => t.takeNumber !== data.takeNumber);
              if (meta.takes.length === 0) {
                // No takes left — remove the whole preview dir
                fs.rmSync(previewDir, { recursive: true, force: true });
              } else {
                fs.writeFileSync(metaFile, JSON.stringify(meta, null, 2));
              }
            } catch { /* ignore parse errors */ }
          }

          console.log(`[narration] Deleted preview take ${data.takeNumber}`);
          sendJson(res, 200, { success: true });
        } catch (error: any) {
          console.error('[narration] Delete preview error:', error);
          sendJson(res, 500, { success: false, error: error.message });
        }
      });

      // ─── GET /api/subtitle-corrections ───────────────────────────────
      server.middlewares.use('/api/subtitle-corrections', (req, res, next) => {
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
      });

      // ─── POST /api/subtitle-corrections/save ───────────────────────
      server.middlewares.use('/api/subtitle-corrections/save', async (req, res, next) => {
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
      });

      // ─── GET /api/staleness-check ───────────────────────────────────
      server.middlewares.use('/api/staleness-check', (req, res, next) => {
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

          const narrationFile = path.join(projectRoot, 'public', 'narration', q.demoId, 'narration.json');
          const alignmentFile = path.join(projectRoot, 'public', 'audio', q.demoId, 'alignment.json');
          const cacheFile = path.join(projectRoot, '.tts-narration-cache.json');

          // If no narration.json, nothing is stale
          if (!fs.existsSync(narrationFile)) {
            sendJson(res, 200, { stale: false, missingMarkers: [], changedSegments: [], alignmentMissing: false });
            return;
          }

          const narration = JSON.parse(fs.readFileSync(narrationFile, 'utf-8'));

          // --- Check markers ---
          const markerRe = /\{#?([a-zA-Z0-9_-]+)#?\}/g;
          const stripMarkersLocal = (text: string) => text.replace(markerRe, '').replace(/\s{2,}/g, ' ').trim();

          interface ExpectedMarker { slideKey: string; segmentId: string; markerId: string }
          const expectedMarkers: ExpectedMarker[] = [];

          for (const slide of narration.slides) {
            const slideKey = `c${slide.chapter}_s${slide.slide}`;
            for (const segment of slide.segments) {
              let m: RegExpExecArray | null;
              const re = new RegExp(markerRe.source, 'g');
              while ((m = re.exec(segment.narrationText)) !== null) {
                expectedMarkers.push({ slideKey, segmentId: segment.id, markerId: m[1] });
              }
            }
          }

          let alignmentMissing = false;
          const missingMarkers: Array<{ segment: string; markerId: string }> = [];

          if (expectedMarkers.length > 0) {
            if (!fs.existsSync(alignmentFile)) {
              alignmentMissing = true;
              for (const em of expectedMarkers) {
                missingMarkers.push({ segment: `${em.slideKey}:${em.segmentId}`, markerId: em.markerId });
              }
            } else {
              const alignment = JSON.parse(fs.readFileSync(alignmentFile, 'utf-8'));
              const resolvedMarkers = new Map<string, Set<string>>();
              for (const [slideKey, slideData] of Object.entries(alignment.slides as Record<string, any>)) {
                for (const seg of slideData.segments) {
                  const key = `${slideKey}:${seg.segmentId}`;
                  resolvedMarkers.set(key, new Set((seg.markers || []).map((mm: any) => mm.id)));
                }
              }
              for (const em of expectedMarkers) {
                const key = `${em.slideKey}:${em.segmentId}`;
                const resolved = resolvedMarkers.get(key);
                if (!resolved || !resolved.has(em.markerId)) {
                  missingMarkers.push({ segment: key, markerId: em.markerId });
                }
              }
            }
          }

          // --- Check TTS narration cache for changed segments ---
          const changedSegments: string[] = [];

          let ttsCache: Record<string, any> = {};
          if (fs.existsSync(cacheFile)) {
            try { ttsCache = JSON.parse(fs.readFileSync(cacheFile, 'utf-8')); }
            catch { ttsCache = {}; }
          }
          const demoCache = ttsCache[q.demoId] || {};

          for (const slide of narration.slides) {
            for (const segment of slide.segments) {
              const segKey = `ch${slide.chapter}:s${slide.slide}:${segment.id}`;
              // Build expected audio file path to check cache
              const segIdx = slide.segments.indexOf(segment);
              const paddedIdx = String(segIdx + 1).padStart(2, '0');
              const relPath = `c${slide.chapter}/s${slide.slide}_segment_${paddedIdx}_${segment.id}.wav`;

              // Cache may use backslashes (Windows) — check both separators
              const cached = demoCache[relPath] || demoCache[relPath.replace(/\//g, '\\')];
              if (!cached) {
                // No cache entry — segment is new or was never generated
                changedSegments.push(segKey);
              } else {
                const strippedCurrent = stripMarkersLocal(segment.narrationText).trim();
                const strippedCached = stripMarkersLocal(cached.narrationText || '').trim();
                if (strippedCurrent !== strippedCached) {
                  changedSegments.push(segKey);
                }
              }
            }
          }

          const stale = missingMarkers.length > 0 || changedSegments.length > 0 || alignmentMissing;
          sendJson(res, 200, { stale, missingMarkers, changedSegments, alignmentMissing });
        } catch (error: any) {
          console.error('[staleness-check] Error:', error);
          sendJson(res, 500, { success: false, error: error.message });
        }
      });

      // ─── POST /api/narration/regenerate-demo ────────────────────────
      server.middlewares.use('/api/narration/regenerate-demo', async (req, res, next) => {
        if (req.method !== 'POST') { next(); return; }

        try {
          const data = await readJsonBody<{ demoId: string }>(req);
          if (!data.demoId) {
            throw new Error('Missing required field: demoId');
          }

          // Security: reject path traversal
          if (/[/\\.]\./.test(data.demoId) || data.demoId.includes('..')) {
            throw new Error('Invalid demoId');
          }

          console.log(`[regenerate-demo] Starting TTS generation + alignment for ${data.demoId}...`);

          // Step 1: Run TTS generation (skips unchanged segments via cache)
          try {
            execSync(`npm run tts:generate -- --demo ${data.demoId}`, {
              cwd: projectRoot,
              timeout: 300_000,
              stdio: 'pipe',
              encoding: 'utf-8',
            });
            console.log(`[regenerate-demo] TTS generation completed for ${data.demoId}`);
          } catch (ttsError: any) {
            console.error('[regenerate-demo] TTS generation error:', ttsError.stderr || ttsError.message);
            // Continue to alignment even if TTS had issues (some segments may have been cached)
          }

          // Step 2: Run alignment
          execSync(`npx tsx scripts/generate-alignment.ts --demo ${data.demoId} --force`, {
            cwd: projectRoot,
            timeout: 120_000,
            stdio: 'pipe',
            encoding: 'utf-8',
          });

          console.log(`[regenerate-demo] Alignment completed for ${data.demoId}`);
          sendJson(res, 200, { success: true });
        } catch (error: any) {
          console.error('[regenerate-demo] Error:', error);
          const message = error.stderr || error.message || 'Regeneration failed';
          sendJson(res, 500, { success: false, error: message });
        }
      });

      // ─── POST /api/narration/clear-previews ────────────────────────
      server.middlewares.use('/api/narration/clear-previews', async (req, res, next) => {
        if (req.method !== 'POST') { next(); return; }

        try {
          const data = await readJsonBody<{
            demoId: string; chapter: number; slide: number; segmentId: string;
          }>(req);
          if (!data.demoId || !data.segmentId) {
            throw new Error('Missing required fields');
          }

          const previewDir = path.join(
            projectRoot, 'public', 'audio', data.demoId,
            '.previews', `ch${data.chapter}_s${data.slide}_${data.segmentId}`
          );

          if (fs.existsSync(previewDir)) {
            fs.rmSync(previewDir, { recursive: true, force: true });
            console.log(`[narration] Cleared previews for ch${data.chapter}_s${data.slide}_${data.segmentId}`);
          }

          sendJson(res, 200, { success: true });
        } catch (error: any) {
          console.error('[narration] Clear previews error:', error);
          sendJson(res, 500, { success: false, error: error.message });
        }
      });
    }
  };
}
