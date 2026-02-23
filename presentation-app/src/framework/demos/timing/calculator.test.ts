import { describe, it, expect } from 'vitest';
import { calculateSlideDuration, calculatePresentationDuration } from './calculator';
import type { SlideMetadata } from '../../slides/SlideMetadata';

function makeSlide(overrides: Partial<SlideMetadata> = {}): SlideMetadata {
  return {
    chapter: 0,
    slide: 0,
    title: 'Test Slide',
    audioSegments: [],
    ...overrides
  };
}

describe('calculateSlideDuration', () => {
  it('returns zero for slide with no segments', () => {
    const slide = makeSlide({ audioSegments: [] });
    const result = calculateSlideDuration(slide, false);
    expect(result.totalDuration).toBe(0);
    expect(result.audioDuration).toBe(0);
    expect(result.delaysDuration).toBe(0);
    expect(result.segments).toHaveLength(0);
  });

  it('calculates duration for a single segment on a non-final slide', () => {
    const slide = makeSlide({
      audioSegments: [{ id: 0, audioFilePath: '/test.wav', duration: 5 }]
    });
    const result = calculateSlideDuration(slide, false);
    // Single segment on non-final slide: audio + betweenSlides delay (1000ms = 1s)
    expect(result.audioDuration).toBe(5);
    expect(result.delaysDuration).toBe(1); // 1000ms default
    expect(result.totalDuration).toBe(6);
  });

  it('calculates duration for a single segment on the final slide', () => {
    const slide = makeSlide({
      audioSegments: [{ id: 0, audioFilePath: '/test.wav', duration: 5 }]
    });
    const result = calculateSlideDuration(slide, true);
    // Single segment on final slide: audio + afterFinalSlide delay (2000ms = 2s)
    expect(result.audioDuration).toBe(5);
    expect(result.delaysDuration).toBe(2); // 2000ms default
    expect(result.totalDuration).toBe(7);
  });

  it('calculates duration for multiple segments', () => {
    const slide = makeSlide({
      audioSegments: [
        { id: 0, audioFilePath: '/s1.wav', duration: 3 },
        { id: 1, audioFilePath: '/s2.wav', duration: 4 },
        { id: 2, audioFilePath: '/s3.wav', duration: 2 }
      ]
    });
    const result = calculateSlideDuration(slide, false);
    // Audio: 3 + 4 + 2 = 9
    // Delays: 0.5 (between seg1-2) + 0.5 (between seg2-3) + 1.0 (betweenSlides) = 2.0
    expect(result.audioDuration).toBe(9);
    expect(result.delaysDuration).toBe(2);
    expect(result.totalDuration).toBe(11);
    expect(result.segments).toHaveLength(3);
  });

  it('respects custom demo timing', () => {
    const slide = makeSlide({
      audioSegments: [{ id: 0, audioFilePath: '/test.wav', duration: 5 }]
    });
    const result = calculateSlideDuration(slide, false, { betweenSlides: 2000 });
    expect(result.delaysDuration).toBe(2); // 2000ms
    expect(result.totalDuration).toBe(7);
  });

  it('treats missing duration as 0', () => {
    const slide = makeSlide({
      audioSegments: [{ id: 0, audioFilePath: '/test.wav' }]
    });
    const result = calculateSlideDuration(slide, false);
    expect(result.audioDuration).toBe(0);
    expect(result.delaysDuration).toBe(1); // betweenSlides default
    expect(result.totalDuration).toBe(1);
  });
});

describe('calculatePresentationDuration', () => {
  it('returns zero for empty slides array', () => {
    const result = calculatePresentationDuration([]);
    expect(result.totalDuration).toBe(0);
    expect(result.audioOnlyDuration).toBe(0);
    expect(result.startSilenceDuration).toBe(0);
    expect(result.slideBreakdowns).toHaveLength(0);
  });

  it('calculates duration for a single slide presentation', () => {
    const slides = [
      makeSlide({
        audioSegments: [{ id: 0, audioFilePath: '/test.wav', duration: 10 }]
      })
    ];
    const result = calculatePresentationDuration(slides, { beforeFirstSlide: 0 });
    expect(result.audioOnlyDuration).toBe(10);
    expect(result.finalDelayDuration).toBe(2); // afterFinalSlide default
    expect(result.segmentDelaysDuration).toBe(0);
    expect(result.slideDelaysDuration).toBe(0);
    expect(result.startSilenceDuration).toBe(0);
    expect(result.totalDuration).toBe(12);
  });

  it('calculates duration for multi-slide presentation', () => {
    const slides = [
      makeSlide({
        slide: 0,
        audioSegments: [
          { id: 0, audioFilePath: '/a.wav', duration: 3 },
          { id: 1, audioFilePath: '/b.wav', duration: 4 }
        ]
      }),
      makeSlide({
        slide: 1,
        audioSegments: [{ id: 0, audioFilePath: '/c.wav', duration: 5 }]
      })
    ];
    const result = calculatePresentationDuration(slides, { beforeFirstSlide: 0 });
    // Slide 1: audio 3+4=7, delays: 0.5 (between segs) + 1.0 (between slides) = 1.5
    // Slide 2: audio 5, delays: 2.0 (final slide)
    expect(result.audioOnlyDuration).toBe(12);
    expect(result.segmentDelaysDuration).toBe(0.5);
    expect(result.slideDelaysDuration).toBe(1);
    expect(result.finalDelayDuration).toBe(2);
    expect(result.totalDuration).toBe(15.5);
    expect(result.slideBreakdowns).toHaveLength(2);
  });

  it('respects custom timing config', () => {
    const slides = [
      makeSlide({
        audioSegments: [{ id: 0, audioFilePath: '/test.wav', duration: 5 }]
      })
    ];
    const timing = { betweenSegments: 200, betweenSlides: 500, afterFinalSlide: 3000, beforeFirstSlide: 0 };
    const result = calculatePresentationDuration(slides, timing);
    expect(result.audioOnlyDuration).toBe(5);
    expect(result.finalDelayDuration).toBe(3); // 3000ms
    expect(result.totalDuration).toBe(8);
  });

  it('includes default start silence in total duration', () => {
    const slides = [
      makeSlide({
        audioSegments: [{ id: 0, audioFilePath: '/test.wav', duration: 10 }]
      })
    ];
    const result = calculatePresentationDuration(slides);
    // Default beforeFirstSlide is 3000ms = 3s
    expect(result.startSilenceDuration).toBe(3);
    expect(result.totalDuration).toBe(15); // 10 audio + 2 final + 3 start silence
  });

  it('excludes start silence when beforeFirstSlide is 0', () => {
    const slides = [
      makeSlide({
        audioSegments: [{ id: 0, audioFilePath: '/test.wav', duration: 10 }]
      })
    ];
    const result = calculatePresentationDuration(slides, { beforeFirstSlide: 0 });
    expect(result.startSilenceDuration).toBe(0);
    expect(result.totalDuration).toBe(12); // 10 audio + 2 final, no start silence
  });
});
