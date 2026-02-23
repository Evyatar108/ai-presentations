/**
 * Staleness-check endpoint handler:
 *   GET /api/staleness-check
 */
import * as fs from 'fs';
import * as path from 'path';
import type { Connect } from 'vite';
import { loadTtsCache } from '../scripts/utils/tts-cache';
import {
  sendJson,
  parseQuery,
  type HandlerContext,
} from './types';

/** Route descriptor returned to the main plugin for registration. */
export interface StalenessRoute {
  path: string;
  handler: Connect.NextHandleFunction;
}

/** Build all staleness-domain routes. */
export function createStalenessHandlers(ctx: HandlerContext): StalenessRoute[] {
  const { projectRoot } = ctx;

  // ─── GET /api/staleness-check ──────────────────────────────────────
  const stalenessCheck: Connect.NextHandleFunction = (req, res, next) => {
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
      interface ChangedSegmentDetail {
        key: string;
        chapter: number;
        slide: number;
        segmentId: string;
        segmentIndex: number;
        currentText: string;
        cachedText?: string;
        cachedInstruct?: string;
        audioRelPath: string;
        audioExists: boolean;
      }
      const changedSegments: ChangedSegmentDetail[] = [];

      const ttsCache = loadTtsCache(cacheFile);
      const demoCache = ttsCache[q.demoId] || {};
      const audioDir = path.join(projectRoot, 'public', 'audio', q.demoId);

      for (const slide of narration.slides) {
        for (const segment of slide.segments) {
          const segKey = `ch${slide.chapter}:s${slide.slide}:${segment.id}`;
          // Build expected audio file path to check cache
          const segIdx = slide.segments.indexOf(segment);
          const paddedIdx = String(segIdx + 1).padStart(2, '0');
          const relPath = `c${slide.chapter}/s${slide.slide}_segment_${paddedIdx}_${segment.id}.wav`;

          const cached = demoCache[relPath];
          const audioFile = path.join(audioDir, relPath);
          const audioExists = fs.existsSync(audioFile);

          if (!cached) {
            // No cache entry — segment is new or was never generated
            changedSegments.push({
              key: segKey,
              chapter: slide.chapter,
              slide: slide.slide,
              segmentId: segment.id,
              segmentIndex: segIdx,
              currentText: segment.narrationText,
              audioRelPath: relPath,
              audioExists,
            });
          } else {
            const strippedCurrent = stripMarkersLocal(segment.narrationText).trim();
            const strippedCached = stripMarkersLocal(cached.narrationText || '').trim();
            if (strippedCurrent !== strippedCached) {
              changedSegments.push({
                key: segKey,
                chapter: slide.chapter,
                slide: slide.slide,
                segmentId: segment.id,
                segmentIndex: segIdx,
                currentText: segment.narrationText,
                cachedText: cached.narrationText,
                cachedInstruct: cached.instruct,
                audioRelPath: relPath,
                audioExists,
              });
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
  };

  // ─── GET /api/cached-instruct ────────────────────────────────────
  const cachedInstruct: Connect.NextHandleFunction = (req, res, next) => {
    if (req.method !== 'GET') { next(); return; }

    try {
      const q = parseQuery(req.url || '');
      if (!q.demoId || !q.audioRelPath) {
        throw new Error('Missing query params: demoId, audioRelPath');
      }
      if (/[/\\.]\./.test(q.demoId) || q.demoId.includes('..')) {
        throw new Error('Invalid demoId');
      }

      const cacheFile = path.join(projectRoot, '.tts-narration-cache.json');
      const ttsCache = loadTtsCache(cacheFile);
      const demoCache = ttsCache[q.demoId] || {};
      const cached = demoCache[q.audioRelPath];

      sendJson(res, 200, { instruct: cached?.instruct ?? null });
    } catch (error: any) {
      console.error('[cached-instruct] Error:', error);
      sendJson(res, 500, { instruct: null, error: error.message });
    }
  };

  return [
    { path: '/api/staleness-check', handler: stalenessCheck },
    { path: '/api/cached-instruct', handler: cachedInstruct },
  ];
}
