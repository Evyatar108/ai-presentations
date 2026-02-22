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
 */
export function loadTtsCache(cacheFile: string): TtsCache {
  if (!fs.existsSync(cacheFile)) return {};

  try {
    const raw = JSON.parse(fs.readFileSync(cacheFile, 'utf-8'));
    const normalized: TtsCache = {};
    for (const [demoId, entries] of Object.entries(raw)) {
      normalized[demoId] = {};
      for (const [key, value] of Object.entries(entries as Record<string, any>)) {
        normalized[demoId][normalizeCachePath(key)] = value;
      }
    }
    return normalized;
  } catch {
    return {};
  }
}

/** Save the TTS narration cache to disk. */
export function saveTtsCache(cacheFile: string, cache: TtsCache): void {
  fs.writeFileSync(cacheFile, JSON.stringify(cache, null, 2));
}
