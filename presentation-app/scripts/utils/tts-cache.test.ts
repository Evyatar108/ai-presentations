import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { normalizeCachePath, loadTtsCache, saveTtsCache, TtsCacheStore, type TtsCache } from './tts-cache';

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

// ---------------------------------------------------------------------------
// TtsCacheStore
// ---------------------------------------------------------------------------

describe('TtsCacheStore', () => {
  describe('constructor', () => {
    it('loads existing cache from disk', () => {
      const data: TtsCache = {
        'demo-1': {
          'c1/s1_segment_01_intro.wav': {
            narrationText: 'Hello',
            generatedAt: '2026-01-01T00:00:00Z',
          },
        },
      };
      fs.writeFileSync(cacheFile, JSON.stringify(data));

      const store = new TtsCacheStore(cacheFile);
      expect(store.getEntry('demo-1', 'c1/s1_segment_01_intro.wav')).toEqual(data['demo-1']['c1/s1_segment_01_intro.wav']);
    });

    it('starts empty when file does not exist', () => {
      const store = new TtsCacheStore(cacheFile);
      expect(store.getKeys('demo-1')).toEqual([]);
    });
  });

  describe('buildKey', () => {
    it('produces correct segment path (0-based index)', () => {
      expect(TtsCacheStore.buildKey(1, 2, 0, 'intro')).toBe('c1/s2_segment_01_intro.wav');
    });

    it('pads index to 2 digits', () => {
      expect(TtsCacheStore.buildKey(3, 1, 8, 'summary')).toBe('c3/s1_segment_09_summary.wav');
    });

    it('handles double-digit indices', () => {
      expect(TtsCacheStore.buildKey(2, 4, 11, 'detail')).toBe('c2/s4_segment_12_detail.wav');
    });
  });

  describe('setEntry', () => {
    it('creates demo bucket and auto-sets generatedAt', () => {
      const store = new TtsCacheStore(cacheFile);
      store.setEntry('demo-1', 'c1/s1_segment_01_intro.wav', 'Hello world');

      const entry = store.getEntry('demo-1', 'c1/s1_segment_01_intro.wav');
      expect(entry).toBeDefined();
      expect(entry!.narrationText).toBe('Hello world');
      expect(entry!.generatedAt).toBeTruthy();
      expect(entry!.instruct).toBeUndefined();
    });

    it('includes instruct when provided', () => {
      const store = new TtsCacheStore(cacheFile);
      store.setEntry('demo-1', 'c1/s1_segment_01_intro.wav', 'Hello', 'speak slowly');

      const entry = store.getEntry('demo-1', 'c1/s1_segment_01_intro.wav');
      expect(entry!.instruct).toBe('speak slowly');
    });

    it('overwrites existing entry', () => {
      const store = new TtsCacheStore(cacheFile);
      store.setEntry('demo-1', 'c1/s1_segment_01_intro.wav', 'First');
      store.setEntry('demo-1', 'c1/s1_segment_01_intro.wav', 'Second');

      expect(store.getEntry('demo-1', 'c1/s1_segment_01_intro.wav')!.narrationText).toBe('Second');
    });
  });

  describe('getEntry / getKeys / getDemoCache', () => {
    it('returns undefined for missing demo', () => {
      const store = new TtsCacheStore(cacheFile);
      expect(store.getEntry('nope', 'x')).toBeUndefined();
      expect(store.getDemoCache('nope')).toBeUndefined();
    });

    it('getKeys returns all keys for a demo', () => {
      const store = new TtsCacheStore(cacheFile);
      store.setEntry('d', 'a.wav', 'A');
      store.setEntry('d', 'b.wav', 'B');
      expect(store.getKeys('d').sort()).toEqual(['a.wav', 'b.wav']);
    });

    it('getDemoCache returns readonly snapshot', () => {
      const store = new TtsCacheStore(cacheFile);
      store.setEntry('d', 'a.wav', 'A');
      const demo = store.getDemoCache('d');
      expect(demo).toBeDefined();
      expect(demo!['a.wav'].narrationText).toBe('A');
    });
  });

  describe('removeEntry', () => {
    it('removes an existing entry', () => {
      const store = new TtsCacheStore(cacheFile);
      store.setEntry('d', 'a.wav', 'A');
      store.removeEntry('d', 'a.wav');
      expect(store.getEntry('d', 'a.wav')).toBeUndefined();
    });

    it('no-ops for missing demo', () => {
      const store = new TtsCacheStore(cacheFile);
      expect(() => store.removeEntry('nope', 'x')).not.toThrow();
    });
  });

  describe('renameKey', () => {
    it('moves entry from old key to new key', () => {
      const store = new TtsCacheStore(cacheFile);
      store.setEntry('d', 'old.wav', 'text');
      store.renameKey('d', 'old.wav', 'new.wav');

      expect(store.getEntry('d', 'old.wav')).toBeUndefined();
      expect(store.getEntry('d', 'new.wav')!.narrationText).toBe('text');
    });

    it('no-ops when old key does not exist', () => {
      const store = new TtsCacheStore(cacheFile);
      store.setEntry('d', 'keep.wav', 'text');
      store.renameKey('d', 'missing.wav', 'new.wav');

      expect(store.getEntry('d', 'keep.wav')).toBeDefined();
      expect(store.getEntry('d', 'new.wav')).toBeUndefined();
    });
  });

  describe('save', () => {
    it('persists changes to disk', () => {
      const store = new TtsCacheStore(cacheFile);
      store.setEntry('demo-1', 'c1/s1_segment_01_intro.wav', 'Hello');
      store.save();

      // Reload from disk via a new store
      const store2 = new TtsCacheStore(cacheFile);
      expect(store2.getEntry('demo-1', 'c1/s1_segment_01_intro.wav')!.narrationText).toBe('Hello');
    });
  });
});
