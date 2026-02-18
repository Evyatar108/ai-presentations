import { describe, it, expect } from 'vitest';
import { hasAudioSegments, getTotalDuration, SlideMetadata } from './SlideMetadata';

function makeMetadata(segments: SlideMetadata['audioSegments']): SlideMetadata {
  return { chapter: 1, slide: 1, title: 'Test', audioSegments: segments };
}

describe('hasAudioSegments', () => {
  it('returns true when segments exist', () => {
    const metadata = makeMetadata([
      { id: 'intro', audioFilePath: '/audio/test.wav' },
    ]);
    expect(hasAudioSegments(metadata)).toBe(true);
  });

  it('returns false when segments array is empty', () => {
    expect(hasAudioSegments(makeMetadata([]))).toBe(false);
  });

  it('returns true with multiple segments', () => {
    const metadata = makeMetadata([
      { id: 'a', audioFilePath: '/audio/a.wav' },
      { id: 'b', audioFilePath: '/audio/b.wav' },
    ]);
    expect(hasAudioSegments(metadata)).toBe(true);
  });
});

describe('getTotalDuration', () => {
  it('returns sum of all durations', () => {
    const metadata = makeMetadata([
      { id: 'a', audioFilePath: '/a.wav', duration: 3.5 },
      { id: 'b', audioFilePath: '/b.wav', duration: 2.0 },
      { id: 'c', audioFilePath: '/c.wav', duration: 4.5 },
    ]);
    expect(getTotalDuration(metadata)).toBe(10.0);
  });

  it('returns undefined when no segments exist', () => {
    expect(getTotalDuration(makeMetadata([]))).toBeUndefined();
  });

  it('returns undefined when any segment lacks duration', () => {
    const metadata = makeMetadata([
      { id: 'a', audioFilePath: '/a.wav', duration: 3.0 },
      { id: 'b', audioFilePath: '/b.wav' }, // no duration
    ]);
    expect(getTotalDuration(metadata)).toBeUndefined();
  });

  it('returns duration for single segment', () => {
    const metadata = makeMetadata([
      { id: 'only', audioFilePath: '/only.wav', duration: 5.0 },
    ]);
    expect(getTotalDuration(metadata)).toBe(5.0);
  });

  it('returns 0 when all durations are 0', () => {
    const metadata = makeMetadata([
      { id: 'a', audioFilePath: '/a.wav', duration: 0 },
      { id: 'b', audioFilePath: '/b.wav', duration: 0 },
    ]);
    expect(getTotalDuration(metadata)).toBe(0);
  });
});
