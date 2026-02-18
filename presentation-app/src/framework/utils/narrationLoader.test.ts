import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  getNarrationText,
  getNarrationSegment,
  getSlideSegments,
  getNarrationStats,
  loadNarration,
  NarrationData,
} from './narrationLoader';

const sampleData: NarrationData = {
  demoId: 'test-demo',
  version: '1.0',
  lastModified: '2024-01-01T00:00:00Z',
  slides: [
    {
      chapter: 1,
      slide: 1,
      title: 'Intro',
      segments: [
        { id: 'intro', narrationText: 'Welcome to the demo.' },
        { id: 'detail', narrationText: 'Here are the details.', visualDescription: 'Chart appears' },
      ],
    },
    {
      chapter: 1,
      slide: 2,
      title: 'Second Slide',
      segments: [
        { id: 'main', narrationText: 'Main content.', notes: 'Speak slowly' },
      ],
    },
    {
      chapter: 2,
      slide: 1,
      title: 'Chapter 2 Start',
      segments: [
        { id: 'opener', narrationText: 'Chapter two begins.' },
        { id: 'middle', narrationText: 'Middle section.' },
        { id: 'closer', narrationText: 'Wrapping up chapter two.' },
      ],
    },
  ],
};

describe('getNarrationText', () => {
  it('returns narration text for a valid segment', () => {
    expect(getNarrationText(sampleData, 1, 1, 'intro')).toBe('Welcome to the demo.');
  });

  it('returns null when narrationData is null', () => {
    expect(getNarrationText(null, 1, 1, 'intro')).toBeNull();
  });

  it('returns null for non-existent chapter/slide', () => {
    expect(getNarrationText(sampleData, 99, 1, 'intro')).toBeNull();
  });

  it('returns null for non-existent segment ID', () => {
    expect(getNarrationText(sampleData, 1, 1, 'nonexistent')).toBeNull();
  });

  it('returns text from different chapters', () => {
    expect(getNarrationText(sampleData, 2, 1, 'opener')).toBe('Chapter two begins.');
  });
});

describe('getNarrationSegment', () => {
  it('returns full segment object', () => {
    const segment = getNarrationSegment(sampleData, 1, 1, 'detail');
    expect(segment).toEqual({
      id: 'detail',
      narrationText: 'Here are the details.',
      visualDescription: 'Chart appears',
    });
  });

  it('returns null when narrationData is null', () => {
    expect(getNarrationSegment(null, 1, 1, 'intro')).toBeNull();
  });

  it('returns null for non-existent slide', () => {
    expect(getNarrationSegment(sampleData, 1, 99, 'intro')).toBeNull();
  });

  it('returns null for non-existent segment', () => {
    expect(getNarrationSegment(sampleData, 1, 1, 'missing')).toBeNull();
  });

  it('returns segment with optional notes field', () => {
    const segment = getNarrationSegment(sampleData, 1, 2, 'main');
    expect(segment?.notes).toBe('Speak slowly');
  });
});

describe('getSlideSegments', () => {
  it('returns all segments for a slide', () => {
    const segments = getSlideSegments(sampleData, 1, 1);
    expect(segments).toHaveLength(2);
    expect(segments[0].id).toBe('intro');
    expect(segments[1].id).toBe('detail');
  });

  it('returns empty array when narrationData is null', () => {
    expect(getSlideSegments(null, 1, 1)).toEqual([]);
  });

  it('returns empty array for non-existent slide', () => {
    expect(getSlideSegments(sampleData, 99, 99)).toEqual([]);
  });

  it('returns three segments for chapter 2 slide 1', () => {
    const segments = getSlideSegments(sampleData, 2, 1);
    expect(segments).toHaveLength(3);
  });
});

describe('getNarrationStats', () => {
  it('returns correct aggregate stats', () => {
    const stats = getNarrationStats(sampleData);
    expect(stats).toEqual({
      totalSlides: 3,
      totalSegments: 6,
      slidesByChapter: { 1: 2, 2: 1 },
      segmentsByChapter: { 1: 3, 2: 3 },
    });
  });

  it('returns null when narrationData is null', () => {
    expect(getNarrationStats(null)).toBeNull();
  });

  it('handles data with empty slides array', () => {
    const emptyData: NarrationData = {
      demoId: 'empty',
      version: '1.0',
      lastModified: '2024-01-01',
      slides: [],
    };
    expect(getNarrationStats(emptyData)).toEqual({
      totalSlides: 0,
      totalSegments: 0,
      slidesByChapter: {},
      segmentsByChapter: {},
    });
  });
});

describe('loadNarration', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('returns parsed data on successful fetch', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(sampleData),
    }));

    const result = await loadNarration('test-demo');
    expect(result).toEqual(sampleData);
    expect(fetch).toHaveBeenCalledWith('/narration/test-demo/narration.json');
  });

  it('returns null on 404', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: false,
      status: 404,
    }));

    const result = await loadNarration('nonexistent');
    expect(result).toBeNull();
  });

  it('returns null on non-404 HTTP error', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
      statusText: 'Internal Server Error',
    }));

    const result = await loadNarration('broken');
    expect(result).toBeNull();
  });

  it('returns null on network error', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('Network failure')));

    const result = await loadNarration('offline');
    expect(result).toBeNull();
  });

  it('returns null on invalid JSON structure (missing demoId)', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ version: '1.0', slides: [] }),
    }));

    const result = await loadNarration('invalid');
    expect(result).toBeNull();
  });

  it('returns null on invalid JSON structure (slides not array)', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ demoId: 'test', version: '1.0', slides: 'not-array' }),
    }));

    const result = await loadNarration('invalid');
    expect(result).toBeNull();
  });

  it('warns on demoId mismatch but still returns data', async () => {
    const mismatchData = { ...sampleData, demoId: 'wrong-id' };
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mismatchData),
    }));
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    const result = await loadNarration('test-demo');
    expect(result).toEqual(mismatchData);
    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining('Demo ID mismatch')
    );
  });
});
