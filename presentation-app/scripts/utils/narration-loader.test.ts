import { describe, it, expect, vi, beforeEach } from 'vitest';
import { loadNarrationJson, getNarrationText, getNarrationInstruct, type NarrationData } from './narration-loader';

vi.mock('fs', () => ({
  existsSync: vi.fn(),
  readFileSync: vi.fn(),
}));

import * as fs from 'fs';

const VALID_NARRATION: NarrationData = {
  demoId: 'test-demo',
  version: '1.0',
  lastModified: '2026-01-01',
  instruct: 'demo-level instruct',
  slides: [
    {
      chapter: 1,
      slide: 0,
      title: 'Slide One',
      instruct: 'slide-level instruct',
      segments: [
        { id: 0, narrationText: 'Hello world', instruct: 'segment-level instruct' },
        { id: 1, narrationText: 'Body text' },
      ],
    },
    {
      chapter: 1,
      slide: 1,
      title: 'Slide Two',
      segments: [
        { id: 0, narrationText: 'Summary text' },
      ],
    },
  ],
};

beforeEach(() => {
  vi.resetAllMocks();
});

describe('loadNarrationJson', () => {
  it('returns parsed data when file exists and is valid', () => {
    vi.mocked(fs.existsSync).mockReturnValue(true);
    vi.mocked(fs.readFileSync).mockReturnValue(JSON.stringify(VALID_NARRATION));

    const result = loadNarrationJson('test-demo', '/fake/narration');
    expect(result).toEqual(VALID_NARRATION);
  });

  it('returns null when file does not exist', () => {
    vi.mocked(fs.existsSync).mockReturnValue(false);

    const result = loadNarrationJson('test-demo', '/fake/narration');
    expect(result).toBeNull();
    expect(fs.readFileSync).not.toHaveBeenCalled();
  });

  it('returns null when JSON is invalid', () => {
    vi.mocked(fs.existsSync).mockReturnValue(true);
    vi.mocked(fs.readFileSync).mockReturnValue('not valid json{{{');

    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const result = loadNarrationJson('test-demo', '/fake/narration');
    expect(result).toBeNull();
    expect(warnSpy).toHaveBeenCalled();
    warnSpy.mockRestore();
  });

  it('returns null when structure is invalid (missing demoId)', () => {
    vi.mocked(fs.existsSync).mockReturnValue(true);
    vi.mocked(fs.readFileSync).mockReturnValue(JSON.stringify({ slides: [] }));

    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const result = loadNarrationJson('test-demo', '/fake/narration');
    expect(result).toBeNull();
    expect(warnSpy).toHaveBeenCalled();
    warnSpy.mockRestore();
  });

  it('returns null when structure is invalid (missing slides)', () => {
    vi.mocked(fs.existsSync).mockReturnValue(true);
    vi.mocked(fs.readFileSync).mockReturnValue(JSON.stringify({ demoId: 'x' }));

    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const result = loadNarrationJson('test-demo', '/fake/narration');
    expect(result).toBeNull();
    warnSpy.mockRestore();
  });

  it('uses provided narrationDir', () => {
    vi.mocked(fs.existsSync).mockReturnValue(true);
    vi.mocked(fs.readFileSync).mockReturnValue(JSON.stringify(VALID_NARRATION));

    loadNarrationJson('test-demo', '/custom/dir');
    const calledPath = vi.mocked(fs.existsSync).mock.calls[0][0] as string;
    const normalized = calledPath.replace(/\\/g, '/');
    expect(normalized).toContain('/custom/dir');
    expect(normalized).toContain('test-demo');
  });
});

describe('getNarrationText', () => {
  it('returns narrationText for matching segment', () => {
    expect(getNarrationText(VALID_NARRATION, 1, 0, 0)).toBe('Hello world');
  });

  it('returns null when narrationData is null', () => {
    expect(getNarrationText(null, 1, 0, 0)).toBeNull();
  });

  it('returns null when slide not found', () => {
    expect(getNarrationText(VALID_NARRATION, 9, 9, 0)).toBeNull();
  });

  it('returns null when segment not found', () => {
    expect(getNarrationText(VALID_NARRATION, 1, 0, 99)).toBeNull();
  });
});

describe('getNarrationInstruct', () => {
  it('returns segment instruct when all three levels defined', () => {
    expect(getNarrationInstruct(VALID_NARRATION, 1, 0, 0)).toBe('segment-level instruct');
  });

  it('returns slide instruct when segment has none', () => {
    expect(getNarrationInstruct(VALID_NARRATION, 1, 0, 1)).toBe('slide-level instruct');
  });

  it('returns demo instruct when slide and segment have none', () => {
    expect(getNarrationInstruct(VALID_NARRATION, 1, 1, 0)).toBe('demo-level instruct');
  });

  it('returns undefined when no instruct at any level', () => {
    const noInstruct: NarrationData = {
      demoId: 'x', version: '1', lastModified: '', slides: [
        { chapter: 1, slide: 0, title: 't', segments: [{ id: 0, narrationText: 'text' }] },
      ],
    };
    expect(getNarrationInstruct(noInstruct, 1, 0, 0)).toBeUndefined();
  });

  it('returns demo instruct when slide not found', () => {
    expect(getNarrationInstruct(VALID_NARRATION, 9, 9, 0)).toBe('demo-level instruct');
  });

  it('returns undefined when narrationData is null', () => {
    expect(getNarrationInstruct(null, 1, 0, 0)).toBeUndefined();
  });
});
