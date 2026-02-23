/**
 * Per-demo narration cache (`narration-cache.json`) load/save/hash utilities.
 *
 * Each demo with external narration has a `public/narration/{demoId}/narration-cache.json`
 * that tracks SHA-256 hashes of narration text + instruct. This module centralises
 * the duplicated I/O and hashing logic that was previously spread across 6 consumers.
 *
 * Key design decisions:
 *   - `hashNarrationSegment()` always calls `stripMarkers(text).trim() + '\0' + (instruct ?? '')`
 *     — this is the canonical form. Consumers that previously omitted stripMarkers or instruct
 *     are now fixed.
 *   - `updateSegmentEntry()` always writes to `cache.segments[key]` — fixes a structural bug
 *     where one consumer wrote directly to `cache[key]`.
 *   - `loadNarrationCache()` handles corrupted files (missing `segments` key) gracefully.
 *   - Plain functions (not a class) since the cache is per-demo and not kept in memory.
 */
import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { stripMarkers } from './marker-parser';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// ── Types ──────────────────────────────────────────────────────────

export interface NarrationCacheEntry {
  hash: string;
  lastChecked: string;
}

export interface NarrationCache {
  version: string;
  generatedAt: string;
  segments: Record<string, NarrationCacheEntry>;
}

// ── Key building ───────────────────────────────────────────────────

/** Build a narration cache key: `"ch{N}:s{N}:{segmentId}"`. */
export function buildNarrationCacheKey(chapter: number, slide: number, segmentId: string): string {
  return `ch${chapter}:s${slide}:${segmentId}`;
}

// ── Hashing ────────────────────────────────────────────────────────

/**
 * Compute the canonical SHA-256 hash for a narration segment.
 *
 * Canonical form: `stripMarkers(text).trim() + '\0' + (instruct ?? '')`
 *
 * The null byte separator ensures that text and instruct can't collide
 * (e.g., text "abc" + instruct "def" != text "abc\0def" + no instruct).
 */
export function hashNarrationSegment(narrationText: string, instruct?: string): string {
  const canonical = stripMarkers(narrationText).trim() + '\0' + (instruct ?? '');
  return crypto.createHash('sha256').update(canonical).digest('hex');
}

// ── Path helpers ───────────────────────────────────────────────────

const DEFAULT_NARRATION_DIR = path.join(__dirname, '../../public/narration');

/** Get the full path to a demo's narration-cache.json. */
export function getNarrationCachePath(demoId: string, narrationDir?: string): string {
  const dir = narrationDir ?? DEFAULT_NARRATION_DIR;
  return path.join(dir, demoId, 'narration-cache.json');
}

// ── Load / Save ────────────────────────────────────────────────────

/** Create an empty narration cache structure. */
export function createEmptyCache(): NarrationCache {
  return {
    version: '1.0',
    generatedAt: new Date().toISOString(),
    segments: {},
  };
}

/**
 * Load a demo's narration-cache.json from disk.
 *
 * Returns `null` if the file does not exist or contains invalid JSON.
 * Returns an empty cache (with empty `segments`) if the file exists but
 * is missing the `segments` key (corrupted/legacy format migration).
 */
export function loadNarrationCache(demoId: string, narrationDir?: string): NarrationCache | null {
  const cachePath = getNarrationCachePath(demoId, narrationDir);

  if (!fs.existsSync(cachePath)) {
    return null;
  }

  try {
    const content = fs.readFileSync(cachePath, 'utf-8');
    const parsed = JSON.parse(content);

    // Handle corrupted files missing the `segments` key
    if (!parsed.segments || typeof parsed.segments !== 'object') {
      return createEmptyCache();
    }

    return parsed as NarrationCache;
  } catch {
    return null;
  }
}

/** Save a demo's narration-cache.json to disk. Creates the directory if needed. */
export function saveNarrationCache(demoId: string, cache: NarrationCache, narrationDir?: string): void {
  const cachePath = getNarrationCachePath(demoId, narrationDir);
  const dir = path.dirname(cachePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(cachePath, JSON.stringify(cache, null, 2), 'utf-8');
}

// ── Mutation helpers ───────────────────────────────────────────────

/**
 * Update (or create) a segment entry in the cache.
 *
 * Always writes to `cache.segments[key]` and updates `generatedAt`.
 * Auto-creates the `segments` record if it's missing (defensive).
 */
export function updateSegmentEntry(cache: NarrationCache, key: string, hash: string): void {
  if (!cache.segments) {
    cache.segments = {};
  }
  cache.segments[key] = {
    hash,
    lastChecked: new Date().toISOString(),
  };
  cache.generatedAt = new Date().toISOString();
}
