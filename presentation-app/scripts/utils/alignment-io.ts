/**
 * Server-side alignment.json + subtitle-corrections.json I/O.
 *
 * Named `alignment-io.ts` (not `alignment-loader.ts`) to avoid confusion with
 * the client-side `src/framework/utils/alignmentLoader.ts` which uses `fetch()`.
 *
 * Both files live in `public/audio/{demoId}/`.
 */
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import type { DemoAlignment } from '../../src/framework/alignment/types';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const DEFAULT_AUDIO_DIR = path.join(__dirname, '../../public/audio');

// ── Alignment ──────────────────────────────────────────────────────

/** Get the full path to a demo's alignment.json. */
export function getAlignmentPath(demoId: string, audioDir?: string): string {
  const dir = audioDir ?? DEFAULT_AUDIO_DIR;
  return path.join(dir, demoId, 'alignment.json');
}

/**
 * Load a demo's alignment.json from disk.
 * Returns `null` if the file does not exist or contains invalid JSON.
 */
export function loadAlignmentData(demoId: string, audioDir?: string): DemoAlignment | null {
  const alignmentPath = getAlignmentPath(demoId, audioDir);
  if (!fs.existsSync(alignmentPath)) return null;
  try {
    return JSON.parse(fs.readFileSync(alignmentPath, 'utf-8'));
  } catch {
    return null;
  }
}

/** Save a demo's alignment.json to disk. Creates the directory if needed. */
export function saveAlignmentData(demoId: string, alignment: DemoAlignment, audioDir?: string): void {
  const alignmentPath = getAlignmentPath(demoId, audioDir);
  const dir = path.dirname(alignmentPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(alignmentPath, JSON.stringify(alignment, null, 2));
}

// ── Subtitle Corrections ──────────────────────────────────────────

/** Get the full path to a demo's subtitle-corrections.json. */
export function getSubtitleCorrectionsPath(demoId: string, audioDir?: string): string {
  const dir = audioDir ?? DEFAULT_AUDIO_DIR;
  return path.join(dir, demoId, 'subtitle-corrections.json');
}

/**
 * Load a demo's subtitle-corrections.json from disk.
 * Returns `{}` if the file does not exist or contains invalid JSON.
 */
export function loadSubtitleCorrections(demoId: string, audioDir?: string): Record<string, string> {
  const filePath = getSubtitleCorrectionsPath(demoId, audioDir);
  if (!fs.existsSync(filePath)) return {};
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  } catch {
    return {};
  }
}

/** Save a demo's subtitle-corrections.json to disk. Creates the directory if needed. */
export function saveSubtitleCorrections(
  demoId: string,
  corrections: Record<string, string>,
  audioDir?: string
): void {
  const filePath = getSubtitleCorrectionsPath(demoId, audioDir);
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(filePath, JSON.stringify(corrections, null, 2) + '\n');
}
