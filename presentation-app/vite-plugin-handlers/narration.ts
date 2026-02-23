/**
 * Narration-related endpoint handlers:
 *   POST /api/narration/save
 *   POST /api/narration/update-cache
 *   POST /api/narration/realign-segment
 *   POST /api/narration/save-preview
 *   GET  /api/narration/list-previews
 *   POST /api/narration/accept-preview
 *   POST /api/narration/delete-preview
 *   POST /api/narration/clear-previews
 *   POST /api/narration/regenerate-demo
 */
import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';
import type { Connect } from 'vite';
import { TtsCacheStore } from '../scripts/utils/tts-cache';
import {
  loadNarrationCache,
  saveNarrationCache,
  createEmptyCache,
  updateSegmentEntry,
} from '../scripts/utils/narration-cache';
import {
  readJsonBody,
  sendJson,
  parseQuery,
  type HandlerContext,
} from './types';
import {
  getPreviewDir,
  getTakeFilePath,
  buildServeUrl,
  loadPreviewMeta,
  savePreviewMeta,
  nextTakeNumber,
  removePreviewDir,
} from './preview-store';

/** Route descriptor returned to the main plugin for registration. */
export interface NarrationRoute {
  path: string;
  handler: Connect.NextHandleFunction;
}

/** Build all narration-domain routes. */
export function createNarrationHandlers(ctx: HandlerContext): NarrationRoute[] {
  const { projectRoot } = ctx;

  // ─── POST /api/narration/save ────────────────────────────────────────
  const save: Connect.NextHandleFunction = async (req, res, next) => {
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
  };

  // ─── POST /api/narration/update-cache ────────────────────────────────
  const updateCache: Connect.NextHandleFunction = async (req, res, next) => {
    if (req.method !== 'POST') { next(); return; }

    try {
      const data = await readJsonBody<{
        demoId: string;
        segment: { key: string; hash: string; timestamp: string };
      }>(req);
      if (!data.demoId || !data.segment) {
        throw new Error('Missing required fields: demoId, segment');
      }

      const narrationDir = path.join(projectRoot, 'public', 'narration');
      let cache = loadNarrationCache(data.demoId, narrationDir);
      if (!cache) {
        cache = createEmptyCache();
      }

      updateSegmentEntry(cache, data.segment.key, data.segment.hash);
      saveNarrationCache(data.demoId, cache, narrationDir);

      console.log(`[narration] Updated cache for ${data.segment.key}`);
      sendJson(res, 200, { success: true });
    } catch (error: any) {
      console.error('[narration] Cache update error:', error);
      sendJson(res, 500, { success: false, error: error.message });
    }
  };

  // ─── POST /api/narration/realign-segment ─────────────────────────────
  const realignSegment: Connect.NextHandleFunction = async (req, res, next) => {
    if (req.method !== 'POST') { next(); return; }

    try {
      const data = await readJsonBody<{
        demoId: string; chapter: number; slide: number; segmentId: string;
        segments?: Array<{ chapter: number; slide: number; segmentId: string }>;
        fullDemo?: boolean;
      }>(req);
      if (!data.demoId) {
        throw new Error('Missing required field: demoId');
      }

      let cmd: string;

      if (data.fullDemo) {
        // Full demo alignment (no --segments filter)
        console.log(`[narration] Realigning full demo: ${data.demoId}`);
        cmd = `npx tsx scripts/generate-alignment.ts --demo ${data.demoId} --force`;
      } else {
        // Support both single segment and batch: { segments: [...] } takes priority
        const segList = data.segments && data.segments.length > 0
          ? data.segments
          : (data.chapter != null && data.slide != null && data.segmentId)
            ? [{ chapter: data.chapter, slide: data.slide, segmentId: data.segmentId }]
            : null;

        if (!segList || segList.length === 0) {
          throw new Error('Missing required fields: provide chapter/slide/segmentId, segments array, or fullDemo');
        }

        const segKeys = segList.map(s => `ch${s.chapter}:s${s.slide}:${s.segmentId}`);
        const segKeysStr = segKeys.join(',');
        console.log(`[narration] Realigning ${segKeys.length} segment(s): ${segKeysStr} for demo ${data.demoId}`);
        cmd = `npx tsx scripts/generate-alignment.ts --demo ${data.demoId} --segments ${segKeysStr} --force`;
      }
      execSync(cmd, {
        cwd: projectRoot,
        timeout: 120_000,
        stdio: 'pipe',
        encoding: 'utf-8',
      });

      console.log(`[narration] Realignment completed for demo ${data.demoId}`);
      sendJson(res, 200, { success: true });
    } catch (error: any) {
      console.error('[narration] Realignment error:', error);
      const message = error.stderr || error.message || 'Realignment failed';
      sendJson(res, 500, { success: false, error: message });
    }
  };

  // ─── POST /api/narration/save-preview ────────────────────────────────
  const savePreview: Connect.NextHandleFunction = async (req, res, next) => {
    if (req.method !== 'POST') { next(); return; }

    try {
      const data = await readJsonBody<{
        demoId: string; chapter: number; slide: number;
        segmentId: string; audioBase64: string; narrationText: string;
        instruct?: string;
      }>(req);
      if (!data.demoId || !data.segmentId || !data.audioBase64) {
        throw new Error('Missing required fields');
      }

      const audioDir = path.join(projectRoot, 'public', 'audio');
      const previewDir = getPreviewDir(audioDir, data.demoId, data.chapter, data.slide, data.segmentId);
      const meta = loadPreviewMeta(previewDir);
      const takeNumber = nextTakeNumber(meta);

      // Write audio file
      fs.mkdirSync(previewDir, { recursive: true });
      fs.writeFileSync(getTakeFilePath(previewDir, takeNumber), Buffer.from(data.audioBase64, 'base64'));

      meta.takes.push({
        takeNumber,
        narrationText: data.narrationText || '',
        ...(data.instruct ? { instruct: data.instruct } : {}),
        generatedAt: new Date().toISOString(),
      });
      savePreviewMeta(previewDir, meta);

      const servePath = buildServeUrl(data.demoId, data.chapter, data.slide, data.segmentId, takeNumber);
      console.log(`[narration] Saved preview take ${takeNumber}: ${servePath}`);

      sendJson(res, 200, { success: true, takeNumber, servePath });
    } catch (error: any) {
      console.error('[narration] Save preview error:', error);
      sendJson(res, 500, { success: false, error: error.message });
    }
  };

  // ─── GET /api/narration/list-previews ────────────────────────────────
  const listPreviews: Connect.NextHandleFunction = (req, res, next) => {
    if (req.method !== 'GET') { next(); return; }

    try {
      const q = parseQuery(req.url || '');
      if (!q.demoId || !q.segmentId) {
        throw new Error('Missing query params: demoId, chapter, slide, segmentId');
      }

      const audioDir = path.join(projectRoot, 'public', 'audio');
      const previewDir = getPreviewDir(audioDir, q.demoId, Number(q.chapter), Number(q.slide), q.segmentId);
      const meta = loadPreviewMeta(previewDir);

      if (meta.takes.length === 0) {
        sendJson(res, 200, { narrationText: null, previews: [] });
        return;
      }

      const previews = meta.takes.map(t => ({
        takeNumber: t.takeNumber,
        narrationText: t.narrationText ?? '',
        servePath: buildServeUrl(q.demoId, Number(q.chapter), Number(q.slide), q.segmentId, t.takeNumber),
        generatedAt: t.generatedAt
      }));

      sendJson(res, 200, { previews });
    } catch (error: any) {
      console.error('[narration] List previews error:', error);
      sendJson(res, 500, { success: false, error: error.message });
    }
  };

  // ─── POST /api/narration/accept-preview ──────────────────────────────
  const acceptPreview: Connect.NextHandleFunction = async (req, res, next) => {
    if (req.method !== 'POST') { next(); return; }

    try {
      const data = await readJsonBody<{
        demoId: string; chapter: number; slide: number;
        segmentId: string; segmentIndex: number; takeNumber: number;
      }>(req);
      if (!data.demoId || !data.segmentId || !data.takeNumber) {
        throw new Error('Missing required fields');
      }

      const audioDir = path.join(projectRoot, 'public', 'audio');
      const previewDir = getPreviewDir(audioDir, data.demoId, data.chapter, data.slide, data.segmentId);
      const takeFile = getTakeFilePath(previewDir, data.takeNumber);

      if (!fs.existsSync(takeFile)) {
        throw new Error(`Take file not found: take_${data.takeNumber}.wav`);
      }

      // Build the real audio destination path
      const segRelPath = TtsCacheStore.buildKey(data.chapter, data.slide, data.segmentIndex ?? 0, data.segmentId);
      const destRelative = `${data.demoId}/${segRelPath}`;
      const destFull = path.join(audioDir, destRelative);

      const destDir = path.dirname(destFull);
      if (!fs.existsSync(destDir)) {
        fs.mkdirSync(destDir, { recursive: true });
      }

      // Read take metadata from previews.json before deleting
      const meta = loadPreviewMeta(previewDir);
      const take = meta.takes.find(t => t.takeNumber === data.takeNumber);
      const takeNarrationText = take?.narrationText || '';
      const takeInstruct = take?.instruct;

      // Copy take to real audio path
      fs.copyFileSync(takeFile, destFull);
      console.log(`[narration] Accepted take ${data.takeNumber} → ${destRelative}`);

      // Update TTS narration cache
      const store = TtsCacheStore.fromProjectRoot(projectRoot);
      const cacheRelPath = TtsCacheStore.buildKey(data.chapter, data.slide, data.segmentIndex ?? 0, data.segmentId);
      store.setEntry(data.demoId, cacheRelPath, takeNarrationText, takeInstruct);
      store.save();
      console.log(`[narration] Updated TTS cache: ${data.demoId}/${cacheRelPath}`);

      // Delete entire preview dir
      removePreviewDir(previewDir);
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
  };

  // ─── POST /api/narration/delete-preview ──────────────────────────────
  const deletePreview: Connect.NextHandleFunction = async (req, res, next) => {
    if (req.method !== 'POST') { next(); return; }

    try {
      const data = await readJsonBody<{
        demoId: string; chapter: number; slide: number;
        segmentId: string; takeNumber: number;
      }>(req);
      if (!data.demoId || !data.segmentId || !data.takeNumber) {
        throw new Error('Missing required fields');
      }

      const audioDir = path.join(projectRoot, 'public', 'audio');
      const previewDir = getPreviewDir(audioDir, data.demoId, data.chapter, data.slide, data.segmentId);

      // Delete the .wav file
      const takeFile = getTakeFilePath(previewDir, data.takeNumber);
      if (fs.existsSync(takeFile)) fs.unlinkSync(takeFile);

      // Update previews.json
      const meta = loadPreviewMeta(previewDir);
      meta.takes = meta.takes.filter(t => t.takeNumber !== data.takeNumber);
      if (meta.takes.length === 0) {
        removePreviewDir(previewDir);
      } else {
        savePreviewMeta(previewDir, meta);
      }

      console.log(`[narration] Deleted preview take ${data.takeNumber}`);
      sendJson(res, 200, { success: true });
    } catch (error: any) {
      console.error('[narration] Delete preview error:', error);
      sendJson(res, 500, { success: false, error: error.message });
    }
  };

  // ─── POST /api/narration/regenerate-demo ─────────────────────────────
  const regenerateDemo: Connect.NextHandleFunction = async (req, res, next) => {
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
  };

  // ─── POST /api/narration/clear-previews ──────────────────────────────
  const clearPreviews: Connect.NextHandleFunction = async (req, res, next) => {
    if (req.method !== 'POST') { next(); return; }

    try {
      const data = await readJsonBody<{
        demoId: string; chapter: number; slide: number; segmentId: string;
      }>(req);
      if (!data.demoId || !data.segmentId) {
        throw new Error('Missing required fields');
      }

      const audioDir = path.join(projectRoot, 'public', 'audio');
      const previewDir = getPreviewDir(audioDir, data.demoId, data.chapter, data.slide, data.segmentId);
      removePreviewDir(previewDir);
      console.log(`[narration] Cleared previews for ch${data.chapter}_s${data.slide}_${data.segmentId}`);

      sendJson(res, 200, { success: true });
    } catch (error: any) {
      console.error('[narration] Clear previews error:', error);
      sendJson(res, 500, { success: false, error: error.message });
    }
  };

  // Return routes in the order they should be registered.
  // More-specific paths must come before less-specific ones
  // (e.g., /api/narration/save-preview before /api/narration/save).
  return [
    { path: '/api/narration/update-cache', handler: updateCache },
    { path: '/api/narration/realign-segment', handler: realignSegment },
    { path: '/api/narration/save-preview', handler: savePreview },
    { path: '/api/narration/list-previews', handler: listPreviews },
    { path: '/api/narration/accept-preview', handler: acceptPreview },
    { path: '/api/narration/delete-preview', handler: deletePreview },
    { path: '/api/narration/regenerate-demo', handler: regenerateDemo },
    { path: '/api/narration/clear-previews', handler: clearPreviews },
    { path: '/api/narration/save', handler: save },
  ];
}
