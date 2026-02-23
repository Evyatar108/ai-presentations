import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { normalizeCachePath, loadTtsCache, saveTtsCache, type TtsCache } from './tts-cache';

let tmpDir: string;
let cacheFile: string;

beforeEach(() => {
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'tts-cache-test-'));
  cacheFile = path.join(tmpDir, 'cache.json');
});

afterEach(() => {
  fs.rmSync(tmpDir, { recursive: true, force: true });
});

describe('normalizeCachePath', () => {
  it('replaces backslashes with forward slashes', () => {
    expect(normalizeCachePath('c1\\s1_segment_0_intro.wav')).toBe('c1/s1_segment_0_intro.wav');
  });

  it('leaves forward slashes unchanged', () => {
    expect(normalizeCachePath('c1/s1_segment_0_intro.wav')).toBe('c1/s1_segment_0_intro.wav');
  });

  it('handles mixed separators', () => {
    expect(normalizeCachePath('c1\\s1/segment\\0.wav')).toBe('c1/s1/segment/0.wav');
  });

  it('handles empty string', () => {
    expect(normalizeCachePath('')).toBe('');
  });
});

describe('saveTtsCache + loadTtsCache round-trip', () => {
  const sampleCache: TtsCache = {
    'demo-1': {
      'c1/s1_segment_0_intro.wav': {
        narrationText: 'Hello world',
        instruct: 'speak clearly',
        generatedAt: '2026-01-01T00:00:00Z',
      },
    },
  };

  it('round-trip preserves data', () => {
    saveTtsCache(cacheFile, sampleCache);
    const loaded = loadTtsCache(cacheFile);
    expect(loaded).toEqual(sampleCache);
  });

  it('saveTtsCache normalizes backslash keys on write', () => {
    const backslashCache: TtsCache = {
      'demo-1': {
        'c1\\s1_segment_0_intro.wav': {
          narrationText: 'Hello',
          generatedAt: '2026-01-01T00:00:00Z',
        },
      },
    };

    saveTtsCache(cacheFile, backslashCache);
    const raw = JSON.parse(fs.readFileSync(cacheFile, 'utf-8'));
    const keys = Object.keys(raw['demo-1']);
    expect(keys).toEqual(['c1/s1_segment_0_intro.wav']);
  });

  it('loadTtsCache returns {} for missing file', () => {
    expect(loadTtsCache('/nonexistent/path/cache.json')).toEqual({});
  });

  it('loadTtsCache returns {} for invalid JSON', () => {
    fs.writeFileSync(cacheFile, 'not valid json{{{');
    expect(loadTtsCache(cacheFile)).toEqual({});
  });

  it('loadTtsCache triggers write-back migration when backslash keys detected', () => {
    // Write raw JSON with backslash keys directly (bypass saveTtsCache normalization)
    const rawWithBackslashes = {
      'demo-1': {
        'c1\\s1_segment_0_intro.wav': {
          narrationText: 'Hello',
          generatedAt: '2026-01-01T00:00:00Z',
        },
      },
    };
    fs.writeFileSync(cacheFile, JSON.stringify(rawWithBackslashes));

    const loaded = loadTtsCache(cacheFile);
    // In-memory result has normalized keys
    expect(Object.keys(loaded['demo-1'])).toEqual(['c1/s1_segment_0_intro.wav']);

    // On-disk file was migrated
    const rawAfter = JSON.parse(fs.readFileSync(cacheFile, 'utf-8'));
    expect(Object.keys(rawAfter['demo-1'])).toEqual(['c1/s1_segment_0_intro.wav']);
  });

  it('loadTtsCache does NOT write back when keys are already normalized', () => {
    saveTtsCache(cacheFile, sampleCache);
    const mtimeBefore = fs.statSync(cacheFile).mtimeMs;

    // Small delay to ensure mtime would change if file were rewritten
    const start = Date.now();
    while (Date.now() - start < 50) { /* busy wait */ }

    loadTtsCache(cacheFile);
    const mtimeAfter = fs.statSync(cacheFile).mtimeMs;
    expect(mtimeAfter).toBe(mtimeBefore);
  });
});
