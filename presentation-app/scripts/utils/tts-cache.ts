/**
 * Shared TTS narration cache utilities.
 *
 * The cache maps demoId → relativePath → entry. Paths are always stored
 * with forward slashes for cross-platform consistency. All reads go
 * through loadTtsCache() which normalizes legacy backslash keys.
 */
import * as fs from 'fs';

export interface TtsCacheEntry {
  narrationText: string;
  instruct?: string;
  generatedAt: string;
}

export type TtsDemoCache = Record<string, TtsCacheEntry>;
export type TtsCache = Record<string, TtsDemoCache>;

/** Normalize a relative path to always use forward slashes. */
export function normalizeCachePath(p: string): string {
  return p.replace(/\\/g, '/');
}

/**
 * Load the TTS narration cache from disk.
 * Normalizes all keys to forward slashes on read so callers
 * never need to worry about path separators.
 * If any backslash keys are detected, writes back the normalized cache
 * to clean up the on-disk file (one-time migration).
 */
export function loadTtsCache(cacheFile: string): TtsCache {
  if (!fs.existsSync(cacheFile)) return {};

  try {
    const raw = JSON.parse(fs.readFileSync(cacheFile, 'utf-8'));
    const normalized: TtsCache = {};
    let needsWriteBack = false;

    for (const [demoId, entries] of Object.entries(raw)) {
      normalized[demoId] = {};
      for (const [key, value] of Object.entries(entries as Record<string, any>)) {
        const normalizedKey = normalizeCachePath(key);
        if (normalizedKey !== key) needsWriteBack = true;
        normalized[demoId][normalizedKey] = value;
      }
    }

    // One-time migration: write back normalized keys to clean up the on-disk file
    if (needsWriteBack) {
      try {
        fs.writeFileSync(cacheFile, JSON.stringify(normalized, null, 2));
      } catch {
        // Non-critical — normalization still works in memory
      }
    }

    return normalized;
  } catch {
    return {};
  }
}

/**
 * Save the TTS narration cache to disk.
 * Normalizes all keys to forward slashes before writing so callers
 * never need to worry about path separators.
 */
export function saveTtsCache(cacheFile: string, cache: TtsCache): void {
  const normalized: TtsCache = {};
  for (const [demoId, entries] of Object.entries(cache)) {
    normalized[demoId] = {};
    for (const [key, value] of Object.entries(entries)) {
      normalized[demoId][normalizeCachePath(key)] = value;
    }
  }
  fs.writeFileSync(cacheFile, JSON.stringify(normalized, null, 2));
}

// ---------------------------------------------------------------------------
// TtsCacheStore — high-level class wrapping the raw cache functions
// ---------------------------------------------------------------------------

import * as path from 'path';
import { stripMarkers } from './marker-parser';

/** Default cache filename relative to project root. */
export const DEFAULT_CACHE_FILENAME = '.tts-narration-cache.json';

/**
 * High-level wrapper around the TTS narration cache.
 *
 * Centralises demo-bucket creation, entry construction (auto `generatedAt`),
 * and the segment-path pattern so that all consumers share the same logic.
 */
export class TtsCacheStore {
  private cache: TtsCache;
  private readonly filePath: string;

  constructor(filePath: string) {
    this.filePath = filePath;
    this.cache = loadTtsCache(filePath);
  }

  /** Convenience constructor: `path.join(root, DEFAULT_CACHE_FILENAME)`. */
  static fromProjectRoot(root: string): TtsCacheStore {
    return new TtsCacheStore(path.join(root, DEFAULT_CACHE_FILENAME));
  }

  /**
   * Build the chapter-relative cache key for a segment.
   *
   * Mirrors `buildAudioOutputPath` from `src/framework/utils/audioPath.ts`.
   *
   * @param segmentIndex 0-based segment index (padded to 2 digits as `index + 1`)
   * @example TtsCacheStore.buildKey(1, 2, 0, 'intro') → "c1/s2_segment_01_intro.wav"
   */
  static buildKey(
    chapter: number,
    slide: number,
    segmentIndex: number,
    segmentId: string
  ): string {
    const paddedIndex = String(segmentIndex + 1).padStart(2, '0');
    return `c${chapter}/s${slide}_segment_${paddedIndex}_${segmentId}.wav`;
  }

  // ── Read operations ──────────────────────────────────────────────────

  getEntry(demoId: string, relPath: string): TtsCacheEntry | undefined {
    return this.cache[demoId]?.[relPath];
  }

  getKeys(demoId: string): string[] {
    return Object.keys(this.cache[demoId] || {});
  }

  getDemoCache(demoId: string): Readonly<TtsDemoCache> | undefined {
    return this.cache[demoId];
  }

  // ── Write operations ─────────────────────────────────────────────────

  /**
   * Set (or overwrite) a cache entry.
   *
   * Automatically creates the demo bucket if missing and stamps
   * `generatedAt` with the current ISO timestamp.
   */
  setEntry(
    demoId: string,
    relPath: string,
    narrationText: string,
    instruct?: string
  ): void {
    if (!this.cache[demoId]) {
      this.cache[demoId] = {};
    }
    this.cache[demoId][relPath] = {
      narrationText: stripMarkers(narrationText),
      ...(instruct ? { instruct } : {}),
      generatedAt: new Date().toISOString(),
    };
  }

  removeEntry(demoId: string, relPath: string): void {
    if (this.cache[demoId]) {
      delete this.cache[demoId][relPath];
    }
  }

  renameKey(demoId: string, oldPath: string, newPath: string): void {
    const entry = this.cache[demoId]?.[oldPath];
    if (!entry) return;
    this.cache[demoId][newPath] = entry;
    delete this.cache[demoId][oldPath];
  }

  // ── Persistence ──────────────────────────────────────────────────────

  save(): void {
    saveTtsCache(this.filePath, this.cache);
  }
}
