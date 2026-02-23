import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import type { DemoAlignment } from '../../src/framework/alignment/types';
import {
  getAlignmentPath,
  loadAlignmentData,
  saveAlignmentData,
  getSubtitleCorrectionsPath,
  loadSubtitleCorrections,
  saveSubtitleCorrections,
} from './alignment-io';

let tmpDir: string;

beforeEach(() => {
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'alignment-io-test-'));
});

afterEach(() => {
  fs.rmSync(tmpDir, { recursive: true, force: true });
});

// ── Alignment ──────────────────────────────────────────────────────

describe('getAlignmentPath', () => {
  it('returns correct path with default audioDir', () => {
    const p = getAlignmentPath('my-demo');
    expect(p).toContain('public');
    expect(p).toContain('audio');
    expect(p).toContain('my-demo');
    expect(p).toMatch(/alignment\.json$/);
  });

  it('returns correct path with custom audioDir', () => {
    const p = getAlignmentPath('my-demo', tmpDir);
    expect(p).toBe(path.join(tmpDir, 'my-demo', 'alignment.json'));
  });
});

describe('loadAlignmentData', () => {
  it('returns null for missing file', () => {
    expect(loadAlignmentData('nonexistent', tmpDir)).toBeNull();
  });

  it('returns null for invalid JSON', () => {
    const demoDir = path.join(tmpDir, 'broken');
    fs.mkdirSync(demoDir, { recursive: true });
    fs.writeFileSync(path.join(demoDir, 'alignment.json'), 'not json{{{');

    expect(loadAlignmentData('broken', tmpDir)).toBeNull();
  });

  it('returns parsed DemoAlignment for valid file', () => {
    const alignment: DemoAlignment = {
      demoId: 'test',
      generatedAt: '2026-01-01T00:00:00Z',
      slides: {
        c1_s1: {
          chapter: 1,
          slide: 1,
          segments: [{
            segmentId: 'intro',
            audioHash: 'abc',
            narrationHash: 'def',
            words: [{ word: 'Hello', start: 0, end: 0.5, score: 0.9 }],
            markers: [],
          }],
        },
      },
    };

    const demoDir = path.join(tmpDir, 'test');
    fs.mkdirSync(demoDir, { recursive: true });
    fs.writeFileSync(path.join(demoDir, 'alignment.json'), JSON.stringify(alignment));

    const loaded = loadAlignmentData('test', tmpDir);
    expect(loaded).toEqual(alignment);
  });
});

describe('saveAlignmentData + loadAlignmentData', () => {
  it('round-trip preserves data', () => {
    const alignment: DemoAlignment = {
      demoId: 'roundtrip',
      generatedAt: '2026-01-01T00:00:00Z',
      slides: {
        c2_s3: {
          chapter: 2,
          slide: 3,
          segments: [{
            segmentId: 'summary',
            audioHash: '123',
            narrationHash: '456',
            words: [],
            markers: [{ id: 'marker1', time: 1.5, anchor: 'start', wordIndex: 0 }],
          }],
        },
      },
    };

    saveAlignmentData('roundtrip', alignment, tmpDir);
    const loaded = loadAlignmentData('roundtrip', tmpDir);
    expect(loaded).toEqual(alignment);
  });

  it('creates directory if missing', () => {
    const deepDir = path.join(tmpDir, 'deep', 'nested');
    const alignment: DemoAlignment = {
      demoId: 'new',
      generatedAt: '2026-01-01T00:00:00Z',
      slides: {},
    };

    saveAlignmentData('new', alignment, deepDir);
    expect(fs.existsSync(path.join(deepDir, 'new', 'alignment.json'))).toBe(true);
  });
});

// ── Subtitle Corrections ──────────────────────────────────────────

describe('getSubtitleCorrectionsPath', () => {
  it('returns correct path with default audioDir', () => {
    const p = getSubtitleCorrectionsPath('my-demo');
    expect(p).toContain('my-demo');
    expect(p).toMatch(/subtitle-corrections\.json$/);
  });

  it('returns correct path with custom audioDir', () => {
    const p = getSubtitleCorrectionsPath('my-demo', tmpDir);
    expect(p).toBe(path.join(tmpDir, 'my-demo', 'subtitle-corrections.json'));
  });
});

describe('loadSubtitleCorrections', () => {
  it('returns {} for missing file', () => {
    expect(loadSubtitleCorrections('nonexistent', tmpDir)).toEqual({});
  });

  it('returns {} for invalid JSON', () => {
    const demoDir = path.join(tmpDir, 'broken');
    fs.mkdirSync(demoDir, { recursive: true });
    fs.writeFileSync(path.join(demoDir, 'subtitle-corrections.json'), '{{broken}}');

    expect(loadSubtitleCorrections('broken', tmpDir)).toEqual({});
  });

  it('returns parsed corrections for valid file', () => {
    const corrections = { kwen: 'Qwen', 'l-l-m': 'LLM' };
    const demoDir = path.join(tmpDir, 'test');
    fs.mkdirSync(demoDir, { recursive: true });
    fs.writeFileSync(path.join(demoDir, 'subtitle-corrections.json'), JSON.stringify(corrections));

    expect(loadSubtitleCorrections('test', tmpDir)).toEqual(corrections);
  });
});

describe('saveSubtitleCorrections + loadSubtitleCorrections', () => {
  it('round-trip preserves data', () => {
    const corrections = { kwen: 'Qwen', evyatar: 'Evyatar' };
    saveSubtitleCorrections('roundtrip', corrections, tmpDir);

    const loaded = loadSubtitleCorrections('roundtrip', tmpDir);
    expect(loaded).toEqual(corrections);
  });

  it('creates directory if missing', () => {
    const deepDir = path.join(tmpDir, 'deep', 'nested');
    saveSubtitleCorrections('new', { a: 'A' }, deepDir);
    expect(fs.existsSync(path.join(deepDir, 'new', 'subtitle-corrections.json'))).toBe(true);
  });
});
