import { describe, it, expect } from 'vitest';
import {
  buildAudioFileName,
  buildAudioOutputPath,
  buildAudioFilePath,
  resolveAudioFilePath,
} from './audioPath';
import type { AudioSegment } from '../slides/SlideMetadata';

describe('buildAudioFileName', () => {
  it('pads single-digit segment index', () => {
    expect(buildAudioFileName(1, 0, 'intro')).toBe('s1_segment_01_intro.wav');
  });

  it('pads double-digit segment index', () => {
    expect(buildAudioFileName(3, 9, 'closing')).toBe('s3_segment_10_closing.wav');
  });

  it('handles slide number 0', () => {
    expect(buildAudioFileName(0, 0, 'test')).toBe('s0_segment_01_test.wav');
  });
});

describe('buildAudioOutputPath', () => {
  it('prefixes with chapter directory', () => {
    expect(buildAudioOutputPath(2, 1, 0, 'intro')).toBe('c2/s1_segment_01_intro.wav');
  });
});

describe('buildAudioFilePath', () => {
  it('builds full public path', () => {
    expect(buildAudioFilePath('my-demo', 1, 1, 0, 'intro'))
      .toBe('/audio/my-demo/c1/s1_segment_01_intro.wav');
  });

  it('handles multi-word demo IDs', () => {
    expect(buildAudioFilePath('meeting-highlights', 4, 2, 3, 'summary'))
      .toBe('/audio/meeting-highlights/c4/s2_segment_04_summary.wav');
  });
});

describe('resolveAudioFilePath', () => {
  const baseSegment: AudioSegment = { id: 'intro' };

  it('auto-derives when audioFilePath is undefined', () => {
    expect(resolveAudioFilePath(baseSegment, 'demo', 1, 1, 0))
      .toBe('/audio/demo/c1/s1_segment_01_intro.wav');
  });

  it('uses explicit override when audioFilePath is set', () => {
    const segment: AudioSegment = { id: 'intro', audioFilePath: '/custom/path.wav' };
    expect(resolveAudioFilePath(segment, 'demo', 1, 1, 0))
      .toBe('/custom/path.wav');
  });

  it('auto-derives when audioFilePath is empty string', () => {
    const segment: AudioSegment = { id: 'intro', audioFilePath: '' };
    expect(resolveAudioFilePath(segment, 'demo', 1, 1, 0))
      .toBe('/audio/demo/c1/s1_segment_01_intro.wav');
  });
});
