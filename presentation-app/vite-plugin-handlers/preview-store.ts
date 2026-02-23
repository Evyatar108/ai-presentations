/**
 * Preview take directory + `previews.json` I/O for TTS preview workflow.
 *
 * Centralises the duplicated path construction and meta-file I/O that was
 * previously inlined across 5 narration handlers.  Follows the same plain-
 * function pattern used by `narration-cache.ts` and `alignment-io.ts`.
 *
 * The `audioDir` parameter keeps the module decoupled from any specific
 * project root — callers pass `path.join(projectRoot, 'public', 'audio')`.
 */
import * as fs from 'fs';
import * as path from 'path';

// ── Types ──────────────────────────────────────────────────────────

export interface PreviewTake {
  takeNumber: number;
  narrationText: string;
  instruct?: string;
  generatedAt: string;
}

export interface PreviewMeta {
  takes: PreviewTake[];
}

// ── Path helpers ───────────────────────────────────────────────────

/** Build the preview directory path for a segment. */
export function getPreviewDir(
  audioDir: string,
  demoId: string,
  chapter: number,
  slide: number,
  segmentId: string,
): string {
  return path.join(audioDir, demoId, '.previews', `ch${chapter}_s${slide}_${segmentId}`);
}

/** Build the take `.wav` file path within a preview directory. */
export function getTakeFilePath(previewDir: string, takeNumber: number): string {
  return path.join(previewDir, `take_${takeNumber}.wav`);
}

/** Build the browser-serveable URL path for a take. */
export function buildServeUrl(
  demoId: string,
  chapter: number,
  slide: number,
  segmentId: string,
  takeNumber: number,
): string {
  return `/audio/${demoId}/.previews/ch${chapter}_s${slide}_${segmentId}/take_${takeNumber}.wav`;
}

// ── Meta I/O ───────────────────────────────────────────────────────

const META_FILENAME = 'previews.json';

/** Load `previews.json` from a preview directory.  Returns empty `{ takes: [] }` if missing or invalid. */
export function loadPreviewMeta(previewDir: string): PreviewMeta {
  const metaPath = path.join(previewDir, META_FILENAME);
  try {
    const raw = fs.readFileSync(metaPath, 'utf-8');
    const parsed = JSON.parse(raw);
    return { takes: Array.isArray(parsed.takes) ? parsed.takes : [] };
  } catch {
    return { takes: [] };
  }
}

/** Save `previews.json` to a preview directory.  Creates the directory if needed. */
export function savePreviewMeta(previewDir: string, meta: PreviewMeta): void {
  if (!fs.existsSync(previewDir)) {
    fs.mkdirSync(previewDir, { recursive: true });
  }
  fs.writeFileSync(path.join(previewDir, META_FILENAME), JSON.stringify(meta, null, 2));
}

// ── Helpers ────────────────────────────────────────────────────────

/** Compute the next take number (max existing + 1, or 1 if no takes). */
export function nextTakeNumber(meta: PreviewMeta): number {
  if (meta.takes.length === 0) return 1;
  return Math.max(...meta.takes.map(t => t.takeNumber)) + 1;
}

/** Delete the entire preview directory.  No-op if it doesn't exist. */
export function removePreviewDir(previewDir: string): void {
  if (fs.existsSync(previewDir)) {
    fs.rmSync(previewDir, { recursive: true, force: true });
  }
}
