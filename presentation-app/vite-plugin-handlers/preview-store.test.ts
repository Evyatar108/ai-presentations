import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import {
  getPreviewDir,
  getTakeFilePath,
  buildServeUrl,
  loadPreviewMeta,
  savePreviewMeta,
  nextTakeNumber,
  removePreviewDir,
  type PreviewMeta,
} from './preview-store';

let tmpDir: string;

beforeEach(() => {
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'preview-store-test-'));
});

afterEach(() => {
  fs.rmSync(tmpDir, { recursive: true, force: true });
});

// ── Path helpers ───────────────────────────────────────────────────

describe('getPreviewDir', () => {
  it('builds correct path from components', () => {
    const p = getPreviewDir(tmpDir, 'my-demo', 2, 3, 'intro');
    expect(p).toBe(path.join(tmpDir, 'my-demo', '.previews', 'ch2_s3_intro'));
  });
});

describe('getTakeFilePath', () => {
  it('appends take_N.wav to preview dir', () => {
    const dir = '/some/preview/dir';
    expect(getTakeFilePath(dir, 5)).toBe(path.join(dir, 'take_5.wav'));
  });
});

describe('buildServeUrl', () => {
  it('builds correct browser-serveable URL', () => {
    const url = buildServeUrl('my-demo', 1, 2, 'summary', 3);
    expect(url).toBe('/audio/my-demo/.previews/ch1_s2_summary/take_3.wav');
  });
});

// ── Meta I/O ───────────────────────────────────────────────────────

describe('loadPreviewMeta', () => {
  it('returns { takes: [] } for missing directory', () => {
    const result = loadPreviewMeta(path.join(tmpDir, 'nonexistent'));
    expect(result).toEqual({ takes: [] });
  });

  it('returns { takes: [] } for invalid JSON', () => {
    const dir = path.join(tmpDir, 'broken');
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, 'previews.json'), 'not json{{{');

    expect(loadPreviewMeta(dir)).toEqual({ takes: [] });
  });

  it('returns parsed meta for valid file', () => {
    const dir = path.join(tmpDir, 'valid');
    fs.mkdirSync(dir, { recursive: true });
    const meta: PreviewMeta = {
      takes: [
        { takeNumber: 1, narrationText: 'Hello world', generatedAt: '2026-01-01T00:00:00Z' },
        { takeNumber: 2, narrationText: 'Hello world', instruct: 'speak fast', generatedAt: '2026-01-01T00:01:00Z' },
      ],
    };
    fs.writeFileSync(path.join(dir, 'previews.json'), JSON.stringify(meta));

    expect(loadPreviewMeta(dir)).toEqual(meta);
  });
});

describe('savePreviewMeta + loadPreviewMeta', () => {
  it('round-trip preserves data', () => {
    const dir = path.join(tmpDir, 'roundtrip');
    const meta: PreviewMeta = {
      takes: [
        { takeNumber: 1, narrationText: 'Test text', generatedAt: '2026-01-01T00:00:00Z' },
      ],
    };

    savePreviewMeta(dir, meta);
    expect(loadPreviewMeta(dir)).toEqual(meta);
  });

  it('creates directory if missing', () => {
    const dir = path.join(tmpDir, 'deep', 'nested', 'dir');
    savePreviewMeta(dir, { takes: [] });
    expect(fs.existsSync(path.join(dir, 'previews.json'))).toBe(true);
  });
});

// ── Helpers ────────────────────────────────────────────────────────

describe('nextTakeNumber', () => {
  it('returns 1 for empty takes', () => {
    expect(nextTakeNumber({ takes: [] })).toBe(1);
  });

  it('returns max + 1 for existing takes', () => {
    const meta: PreviewMeta = {
      takes: [
        { takeNumber: 1, narrationText: '', generatedAt: '' },
        { takeNumber: 2, narrationText: '', generatedAt: '' },
      ],
    };
    expect(nextTakeNumber(meta)).toBe(3);
  });

  it('handles non-sequential take numbers', () => {
    const meta: PreviewMeta = {
      takes: [
        { takeNumber: 3, narrationText: '', generatedAt: '' },
        { takeNumber: 7, narrationText: '', generatedAt: '' },
        { takeNumber: 5, narrationText: '', generatedAt: '' },
      ],
    };
    expect(nextTakeNumber(meta)).toBe(8);
  });
});

describe('removePreviewDir', () => {
  it('removes directory and contents', () => {
    const dir = path.join(tmpDir, 'to-remove');
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, 'take_1.wav'), 'audio data');
    fs.writeFileSync(path.join(dir, 'previews.json'), '{}');

    removePreviewDir(dir);
    expect(fs.existsSync(dir)).toBe(false);
  });

  it('no-ops for missing directory', () => {
    // Should not throw
    removePreviewDir(path.join(tmpDir, 'does-not-exist'));
  });
});
