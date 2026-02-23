import { describe, it, expect } from 'vitest';
import { validateSlideMetadata, validateDemoSlides } from './validateSlideMetadata';
import type { SlideMetadata, SlideComponentWithMetadata } from './SlideMetadata';

function makeSlide(meta: SlideMetadata): SlideComponentWithMetadata {
  const fn = (() => null) as unknown as SlideComponentWithMetadata;
  fn.metadata = meta;
  return fn;
}

const validMeta: SlideMetadata = {
  chapter: 0,
  slide: 0,
  title: 'Test',
  audioSegments: [{ id: 0, audioFilePath: '/audio/test.wav' }],
};

describe('validateSlideMetadata', () => {
  it('returns no errors for valid metadata', () => {
    expect(validateSlideMetadata(validMeta, 0)).toEqual([]);
  });

  it('reports negative chapter', () => {
    const errors = validateSlideMetadata({ ...validMeta, chapter: -1 }, 0);
    expect(errors).toHaveLength(1);
    expect(errors[0].field).toBe('chapter');
  });

  it('reports non-integer chapter', () => {
    const errors = validateSlideMetadata({ ...validMeta, chapter: 1.5 }, 0);
    expect(errors).toHaveLength(1);
    expect(errors[0].field).toBe('chapter');
  });

  it('reports negative slide number', () => {
    const errors = validateSlideMetadata({ ...validMeta, slide: -1 }, 0);
    expect(errors).toHaveLength(1);
    expect(errors[0].field).toBe('slide');
  });

  it('reports empty title', () => {
    const errors = validateSlideMetadata({ ...validMeta, title: '' }, 0);
    expect(errors).toHaveLength(1);
    expect(errors[0].field).toBe('title');
  });

  it('reports whitespace-only title', () => {
    const errors = validateSlideMetadata({ ...validMeta, title: '   ' }, 0);
    expect(errors).toHaveLength(1);
    expect(errors[0].field).toBe('title');
  });

  it('reports negative segment id', () => {
    const errors = validateSlideMetadata(
      { ...validMeta, audioSegments: [{ id: -1 as any, audioFilePath: '/a.wav' }] },
      0
    );
    expect(errors.some(e => e.field.includes('.id'))).toBe(true);
  });

  it('reports non-integer segment id', () => {
    const errors = validateSlideMetadata(
      { ...validMeta, audioSegments: [{ id: 1.5 as any, audioFilePath: '/a.wav' }] },
      0
    );
    expect(errors.some(e => e.field.includes('.id'))).toBe(true);
  });

  it('reports duplicate segment ids within a slide', () => {
    const errors = validateSlideMetadata(
      {
        ...validMeta,
        audioSegments: [
          { id: 0, audioFilePath: '/a.wav' },
          { id: 0, audioFilePath: '/b.wav' },
        ],
      },
      0
    );
    expect(errors.some(e => e.message.includes('duplicate segment id'))).toBe(true);
  });

  it('reports empty-string audioFilePath', () => {
    const errors = validateSlideMetadata(
      { ...validMeta, audioSegments: [{ id: 0, audioFilePath: '' }] },
      0
    );
    expect(errors.some(e => e.field.includes('.audioFilePath'))).toBe(true);
  });

  it('accepts undefined audioFilePath (auto-derived at runtime)', () => {
    const errors = validateSlideMetadata(
      { ...validMeta, audioSegments: [{ id: 0 }] },
      0
    );
    expect(errors.some(e => e.field.includes('.audioFilePath'))).toBe(false);
  });

  it('reports negative segment duration', () => {
    const errors = validateSlideMetadata(
      {
        ...validMeta,
        audioSegments: [{ id: 0, audioFilePath: '/a.wav', duration: -1 }],
      },
      0
    );
    expect(errors.some(e => e.field.includes('.duration'))).toBe(true);
  });

  it('reports negative timing values', () => {
    const errors = validateSlideMetadata(
      { ...validMeta, timing: { betweenSegments: -100 } },
      0
    );
    expect(errors.some(e => e.field === 'timing.betweenSegments')).toBe(true);
  });

  it('accepts chapter and slide of 0', () => {
    const errors = validateSlideMetadata({ ...validMeta, chapter: 0, slide: 0 }, 0);
    expect(errors).toEqual([]);
  });

  it('accepts empty audioSegments array', () => {
    const errors = validateSlideMetadata({ ...validMeta, audioSegments: [] }, 0);
    expect(errors).toEqual([]);
  });
});

describe('validateDemoSlides', () => {
  it('returns no errors for valid slides', () => {
    const slides = [
      makeSlide({ ...validMeta, chapter: 0, slide: 0 }),
      makeSlide({ ...validMeta, chapter: 0, slide: 1 }),
    ];
    expect(validateDemoSlides(slides)).toEqual([]);
  });

  it('detects duplicate chapter+slide across slides', () => {
    const slides = [
      makeSlide(validMeta),
      makeSlide(validMeta), // duplicate ch0:s0
    ];
    const errors = validateDemoSlides(slides);
    expect(errors.some(e => e.field === 'chapter+slide')).toBe(true);
  });

  it('reports slides with missing metadata', () => {
    const broken = (() => null) as unknown as SlideComponentWithMetadata;
    // @ts-expect-error -- intentionally testing missing metadata
    broken.metadata = undefined;
    const errors = validateDemoSlides([broken]);
    expect(errors.some(e => e.field === 'metadata')).toBe(true);
  });

  it('aggregates errors from multiple slides', () => {
    const slides = [
      makeSlide({ ...validMeta, chapter: -1 }),
      makeSlide({ ...validMeta, title: '' }),
    ];
    const errors = validateDemoSlides(slides);
    expect(errors.length).toBeGreaterThanOrEqual(2);
  });
});
