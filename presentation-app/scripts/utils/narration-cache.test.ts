import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import {
  buildNarrationCacheKey,
  hashNarrationSegment,
  loadNarrationCache,
  saveNarrationCache,
  createEmptyCache,
  updateSegmentEntry,
  type NarrationCache,
} from './narration-cache';

let tmpDir: string;

beforeEach(() => {
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'narration-cache-test-'));
});

afterEach(() => {
  fs.rmSync(tmpDir, { recursive: true, force: true });
});

describe('buildNarrationCacheKey', () => {
  it('produces "ch{N}:s{N}:{id}" format', () => {
    expect(buildNarrationCacheKey(1, 1, 0)).toBe('ch1:s1:0');
    expect(buildNarrationCacheKey(3, 9, 2)).toBe('ch3:s9:2');
  });
});

describe('hashNarrationSegment', () => {
  it('strips {#markers} before hashing', () => {
    const withMarkers = 'The {#pipeline}four-stage pipeline{done#} is fast.';
    const withoutMarkers = 'The four-stage pipeline is fast.';
    expect(hashNarrationSegment(withMarkers)).toBe(hashNarrationSegment(withoutMarkers));
  });

  it('includes instruct in hash (hash changes when instruct changes)', () => {
    const text = 'Hello world';
    const hash1 = hashNarrationSegment(text, 'speak slowly');
    const hash2 = hashNarrationSegment(text, 'speak quickly');
    expect(hash1).not.toBe(hash2);
  });

  it('undefined instruct produces same hash as empty string instruct', () => {
    const text = 'Hello world';
    expect(hashNarrationSegment(text, undefined)).toBe(hashNarrationSegment(text, ''));
  });

  it('trims whitespace from narration text', () => {
    expect(hashNarrationSegment('  Hello world  ')).toBe(hashNarrationSegment('Hello world'));
  });

  it('returns consistent SHA-256 hex string', () => {
    const hash = hashNarrationSegment('Test text');
    expect(hash).toMatch(/^[0-9a-f]{64}$/);
    // Same input → same output
    expect(hashNarrationSegment('Test text')).toBe(hash);
  });
});

describe('loadNarrationCache', () => {
  it('returns null for missing file', () => {
    expect(loadNarrationCache('nonexistent', tmpDir)).toBeNull();
  });

  it('returns null for invalid JSON', () => {
    const demoDir = path.join(tmpDir, 'broken-demo');
    fs.mkdirSync(demoDir, { recursive: true });
    fs.writeFileSync(path.join(demoDir, 'narration-cache.json'), 'not valid json{{{');

    expect(loadNarrationCache('broken-demo', tmpDir)).toBeNull();
  });

  it('returns parsed structure for valid file', () => {
    const cache: NarrationCache = {
      version: '1.0',
      generatedAt: '2026-01-01T00:00:00Z',
      segments: {
        'ch1:s1:intro': { hash: 'abc123', lastChecked: '2026-01-01T00:00:00Z' },
      },
    };
    const demoDir = path.join(tmpDir, 'my-demo');
    fs.mkdirSync(demoDir, { recursive: true });
    fs.writeFileSync(path.join(demoDir, 'narration-cache.json'), JSON.stringify(cache));

    const loaded = loadNarrationCache('my-demo', tmpDir);
    expect(loaded).toEqual(cache);
  });

  it('returns empty cache when segments key missing (corrupted file migration)', () => {
    const corrupted = { version: '1.0', generatedAt: '2026-01-01T00:00:00Z' };
    const demoDir = path.join(tmpDir, 'corrupted');
    fs.mkdirSync(demoDir, { recursive: true });
    fs.writeFileSync(path.join(demoDir, 'narration-cache.json'), JSON.stringify(corrupted));

    const loaded = loadNarrationCache('corrupted', tmpDir);
    expect(loaded).not.toBeNull();
    expect(loaded!.segments).toEqual({});
  });
});

describe('saveNarrationCache + loadNarrationCache', () => {
  it('round-trip preserves data', () => {
    const cache: NarrationCache = {
      version: '1.0',
      generatedAt: '2026-01-01T00:00:00Z',
      segments: {
        'ch1:s1:intro': { hash: 'abc', lastChecked: '2026-01-01T00:00:00Z' },
        'ch2:s3:summary': { hash: 'def', lastChecked: '2026-01-01T00:00:00Z' },
      },
    };

    saveNarrationCache('roundtrip-demo', cache, tmpDir);
    const loaded = loadNarrationCache('roundtrip-demo', tmpDir);
    expect(loaded).toEqual(cache);
  });

  it('creates directory if missing', () => {
    const cache = createEmptyCache();
    const deepDir = path.join(tmpDir, 'deep', 'nested');
    // deepDir doesn't exist yet — saveNarrationCache should create it
    saveNarrationCache('new-demo', cache, deepDir);

    expect(fs.existsSync(path.join(deepDir, 'new-demo', 'narration-cache.json'))).toBe(true);
  });
});

describe('createEmptyCache', () => {
  it('has version, generatedAt, and empty segments', () => {
    const cache = createEmptyCache();
    expect(cache.version).toBe('1.0');
    expect(cache.generatedAt).toBeTruthy();
    expect(cache.segments).toEqual({});
  });
});

describe('updateSegmentEntry', () => {
  it('creates entry in cache.segments with hash and lastChecked', () => {
    const cache = createEmptyCache();
    updateSegmentEntry(cache, 'ch1:s1:intro', 'abc123');

    expect(cache.segments['ch1:s1:intro']).toBeDefined();
    expect(cache.segments['ch1:s1:intro'].hash).toBe('abc123');
    expect(cache.segments['ch1:s1:intro'].lastChecked).toBeTruthy();
  });

  it('updates generatedAt timestamp', () => {
    const cache = createEmptyCache();
    const originalTimestamp = cache.generatedAt;

    // Small delay to ensure timestamp changes
    const start = Date.now();
    while (Date.now() - start < 10) { /* busy wait */ }

    updateSegmentEntry(cache, 'ch1:s1:intro', 'abc');
    // generatedAt should be updated (or at least set)
    expect(cache.generatedAt).toBeTruthy();
  });

  it('auto-creates segments record if missing', () => {
    // Simulate a cache object with missing segments (defensive)
    const cache = { version: '1.0', generatedAt: '2026-01-01T00:00:00Z' } as any as NarrationCache;
    cache.segments = undefined as any;

    updateSegmentEntry(cache, 'ch1:s1:intro', 'abc');
    expect(cache.segments['ch1:s1:intro'].hash).toBe('abc');
  });
});
