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
    expect(buildAudioFileName(0, 0)).toBe('s0_segment_00.wav');
  });

  it('pads double-digit segment index', () => {
    expect(buildAudioFileName(2, 9)).toBe('s2_segment_09.wav');
  });

  it('handles slide number 0', () => {
    expect(buildAudioFileName(0, 1)).toBe('s0_segment_01.wav');
  });
});

describe('buildAudioOutputPath', () => {
  it('prefixes with chapter directory', () => {
    expect(buildAudioOutputPath(2, 0, 0)).toBe('c2/s0_segment_00.wav');
  });
});

describe('buildAudioFilePath', () => {
  it('builds full public path', () => {
    expect(buildAudioFilePath('my-demo', 1, 0, 0))
      .toBe('/audio/my-demo/c1/s0_segment_00.wav');
  });

  it('handles multi-word demo IDs', () => {
    expect(buildAudioFilePath('meeting-highlights', 4, 1, 3))
      .toBe('/audio/meeting-highlights/c4/s1_segment_03.wav');
  });
});

describe('resolveAudioFilePath', () => {
  const baseSegment: AudioSegment = { id: 0 };

  it('auto-derives when audioFilePath is undefined', () => {
    expect(resolveAudioFilePath(baseSegment, 'demo', 1, 0, 0))
      .toBe('/audio/demo/c1/s0_segment_00.wav');
  });

  it('uses explicit override when audioFilePath is set', () => {
    const segment: AudioSegment = { id: 0, audioFilePath: '/custom/path.wav' };
    expect(resolveAudioFilePath(segment, 'demo', 1, 0, 0))
      .toBe('/custom/path.wav');
  });

  it('auto-derives when audioFilePath is empty string', () => {
    const segment: AudioSegment = { id: 0, audioFilePath: '' };
    expect(resolveAudioFilePath(segment, 'demo', 1, 0, 0))
      .toBe('/audio/demo/c1/s0_segment_00.wav');
  });
});
