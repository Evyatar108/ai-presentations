/**
 * Video bookmark endpoint handlers:
 *   GET  /api/video-bookmarks/:demoId              → reads public/videos/{demoId}/bookmarks.json
 *   POST /api/video-bookmarks/:demoId              → writes public/videos/{demoId}/bookmarks.json
 *   GET  /api/video-bookmarks/:demoId/list         → scans public/videos/{demoId}/ for .mp4/.webm
 *   GET  /api/video-bookmarks/:demoId/source-usage → scans slide source for videoPath references
 *
 * Note: The Vite middleware path matching strips the registered prefix, so we
 * receive the remainder of the URL (starting with '/') in req.url.
 */
import * as fs from 'fs';
import * as path from 'path';
import type { Connect } from 'vite';
import { readJsonBody, sendJson, type HandlerContext } from './types';

/** Build all video-bookmark domain routes. */
export function createVideoBookmarkHandlers(ctx: HandlerContext): { path: string; handler: Connect.NextHandleFunction }[] {
  const { projectRoot } = ctx;

  /** Validate a demoId: kebab-case alnum, no traversal. */
  function validateDemoId(id: string): boolean {
    return /^[a-zA-Z0-9_-]+$/.test(id) && !id.includes('..');
  }

  /** Extract demoId and optional sub-path from req.url remainder after the registered prefix. */
  function parseDemoPath(url: string): { demoId: string; subPath: string } | null {
    // req.url is the path after the registered prefix, e.g. "/my-demo" or "/my-demo/list"
    const stripped = (url || '').split('?')[0].replace(/^\//, '');
    const parts = stripped.split('/');
    const demoId = parts[0];
    const subPath = parts.slice(1).join('/');
    if (!demoId || !validateDemoId(demoId)) return null;
    return { demoId, subPath };
  }

  // ─── GET /api/video-bookmarks/:demoId ─────────────────────────────
  // ─── GET /api/video-bookmarks/:demoId/list ────────────────────────
  const getHandler: Connect.NextHandleFunction = (req, res, next) => {
    if (req.method !== 'GET') { next(); return; }

    const parsed = parseDemoPath(req.url || '');
    if (!parsed) {
      sendJson(res, 400, { success: false, error: 'Invalid or missing demoId' });
      return;
    }
    const { demoId, subPath } = parsed;
    const videoDir = path.join(projectRoot, 'public', 'videos', demoId);

    if (subPath === 'list') {
      // Return list of .mp4 / .webm files in the demo's video directory
      try {
        if (!fs.existsSync(videoDir)) {
          sendJson(res, 200, { files: [] });
          return;
        }
        const entries = fs.readdirSync(videoDir, { withFileTypes: true });
        const files = entries
          .filter(e => e.isFile() && /\.(mp4|webm)$/i.test(e.name))
          .map(e => `/videos/${demoId}/${e.name}`);
        sendJson(res, 200, { files });
      } catch (error: any) {
        console.error('[video-bookmarks] list error:', error);
        sendJson(res, 500, { success: false, error: error.message });
      }
      return;
    }

    if (subPath === 'source-usage') {
      // Scan slide source files for videoPath references and associate with slide metadata
      try {
        const chaptersDir = path.join(projectRoot, 'src', 'demos', demoId, 'slides', 'chapters');
        const usage: Record<string, { chapter: number; slide: number; title: string }[]> = {};
        if (!fs.existsSync(chaptersDir)) {
          sendJson(res, 200, { usage });
          return;
        }
        const files = fs.readdirSync(chaptersDir).filter(f => /\.(tsx?|jsx?)$/.test(f));
        for (const file of files) {
          const src = fs.readFileSync(path.join(chaptersDir, file), 'utf-8');
          // Find defineSlide blocks by their starting positions
          const slideStarts: { pos: number; chapter: number; slide: number; title: string }[] = [];
          const defineRe = /defineSlide\s*\(\s*\{/g;
          let dm;
          while ((dm = defineRe.exec(src)) !== null) {
            // Search the metadata block (next ~300 chars) for chapter/slide/title
            const region = src.slice(dm.index, dm.index + 500);
            const chMatch = region.match(/chapter:\s*(\d+)/);
            const slMatch = region.match(/slide:\s*(\d+)/);
            const tiMatch = region.match(/title:\s*['"]([^'"]+)['"]/);
            if (chMatch && slMatch) {
              slideStarts.push({
                pos: dm.index,
                chapter: Number(chMatch[1]),
                slide: Number(slMatch[1]),
                title: tiMatch ? tiMatch[1] : '',
              });
            }
          }
          // Find all videoPath references
          const vpRe = /videoPath\s*[=:]\s*["']([^"']+)["']/g;
          let vm;
          while ((vm = vpRe.exec(src)) !== null) {
            const videoPath = vm[1];
            // Associate with the most recent defineSlide before this position
            let owner = slideStarts[0];
            for (const s of slideStarts) {
              if (s.pos <= vm.index) owner = s;
            }
            if (owner) {
              if (!usage[videoPath]) usage[videoPath] = [];
              // Avoid duplicates
              if (!usage[videoPath].some(u => u.chapter === owner.chapter && u.slide === owner.slide)) {
                usage[videoPath].push({ chapter: owner.chapter, slide: owner.slide, title: owner.title });
              }
            }
          }
        }
        sendJson(res, 200, { usage });
      } catch (error: any) {
        console.error('[video-bookmarks] source-usage error:', error);
        sendJson(res, 500, { success: false, error: error.message });
      }
      return;
    }

    if (subPath === '') {
      // Return bookmarks.json (empty object if not found)
      const bookmarksPath = path.join(videoDir, 'bookmarks.json');
      try {
        if (!fs.existsSync(bookmarksPath)) {
          sendJson(res, 200, { demoId, videos: {} });
          return;
        }
        const raw = fs.readFileSync(bookmarksPath, 'utf-8');
        const data = JSON.parse(raw);
        sendJson(res, 200, data);
      } catch (error: any) {
        console.error('[video-bookmarks] read error:', error);
        sendJson(res, 500, { success: false, error: error.message });
      }
      return;
    }

    next();
  };

  // ─── POST /api/video-bookmarks/:demoId ────────────────────────────
  const postHandler: Connect.NextHandleFunction = async (req, res, next) => {
    if (req.method !== 'POST') { next(); return; }

    const parsed = parseDemoPath(req.url || '');
    if (!parsed || parsed.subPath !== '') {
      next();
      return;
    }
    const { demoId } = parsed;
    const videoDir = path.join(projectRoot, 'public', 'videos', demoId);

    try {
      const data = await readJsonBody<Record<string, unknown>>(req);

      // Ensure directory exists
      if (!fs.existsSync(videoDir)) {
        fs.mkdirSync(videoDir, { recursive: true });
      }

      const bookmarksPath = path.join(videoDir, 'bookmarks.json');
      fs.writeFileSync(bookmarksPath, JSON.stringify(data, null, 2));
      console.log(`[video-bookmarks] Saved bookmarks.json for ${demoId}`);
      sendJson(res, 200, { success: true });
    } catch (error: any) {
      console.error('[video-bookmarks] write error:', error);
      sendJson(res, 500, { success: false, error: error.message });
    }
  };

  return [
    { path: '/api/video-bookmarks', handler: getHandler },
    { path: '/api/video-bookmarks', handler: postHandler },
  ];
}
