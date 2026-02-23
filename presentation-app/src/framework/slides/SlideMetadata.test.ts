import { describe, it, expect } from 'vitest';
import { hasAudioSegments, getTotalDuration, SlideMetadata } from './SlideMetadata';

function makeMetadata(segments: SlideMetadata['audioSegments']): SlideMetadata {
  return { chapter: 0, slide: 0, title: 'Test', audioSegments: segments };
}

describe('hasAudioSegments', () => {
  it('returns true when segments exist', () => {
    const metadata = makeMetadata([
      { id: 0, audioFilePath: '/audio/test.wav' },
    ]);
    expect(hasAudioSegments(metadata)).toBe(true);
  });

  it('returns false when segments array is empty', () => {
    expect(hasAudioSegments(makeMetadata([]))).toBe(false);
  });

  it('returns true with multiple segments', () => {
    const metadata = makeMetadata([
      { id: 0, audioFilePath: '/audio/a.wav' },
      { id: 1, audioFilePath: '/audio/b.wav' },
    ]);
    expect(hasAudioSegments(metadata)).toBe(true);
  });
});

describe('getTotalDuration', () => {
  it('returns sum of all durations', () => {
    const metadata = makeMetadata([
      { id: 0, audioFilePath: '/a.wav', duration: 3.5 },
      { id: 1, audioFilePath: '/b.wav', duration: 2.0 },
      { id: 2, audioFilePath: '/c.wav', duration: 4.5 },
    ]);
    expect(getTotalDuration(metadata)).toBe(10.0);
  });

  it('returns undefined when no segments exist', () => {
    expect(getTotalDuration(makeMetadata([]))).toBeUndefined();
  });

  it('returns undefined when any segment lacks duration', () => {
    const metadata = makeMetadata([
      { id: 0, audioFilePath: '/a.wav', duration: 3.0 },
      { id: 1, audioFilePath: '/b.wav' }, // no duration
    ]);
    expect(getTotalDuration(metadata)).toBeUndefined();
  });

  it('returns duration for single segment', () => {
    const metadata = makeMetadata([
      { id: 0, audioFilePath: '/only.wav', duration: 5.0 },
    ]);
    expect(getTotalDuration(metadata)).toBe(5.0);
  });

  it('returns 0 when all durations are 0', () => {
    const metadata = makeMetadata([
      { id: 0, audioFilePath: '/a.wav', duration: 0 },
      { id: 1, audioFilePath: '/b.wav', duration: 0 },
    ]);
    expect(getTotalDuration(metadata)).toBe(0);
  });
});
