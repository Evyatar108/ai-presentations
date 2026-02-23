import { describe, it, expect } from 'vitest';
import { stripMarkers, parseMarkers, hasMarkers } from './marker-parser';

describe('stripMarkers', () => {
  it('strips forward markers', () => {
    expect(stripMarkers('Hello {#world}world')).toBe('Hello world');
  });

  it('strips backward markers', () => {
    expect(stripMarkers('Hello world{done#} end')).toBe('Hello world end');
  });

  it('strips mixed markers', () => {
    expect(stripMarkers('The {#pipeline}four-stage pipeline{done#} is fast.')).toBe(
      'The four-stage pipeline is fast.'
    );
  });

  it('collapses double spaces left by removal', () => {
    expect(stripMarkers('word {#m} next')).toBe('word next');
  });

  it('returns unchanged text when no markers present', () => {
    expect(stripMarkers('Just plain text here.')).toBe('Just plain text here.');
  });

  it('handles empty string', () => {
    expect(stripMarkers('')).toBe('');
  });
});

describe('parseMarkers', () => {
  it('forward marker resolves to next word with anchor start', () => {
    const result = parseMarkers('Hello {#world}world');
    expect(result.cleanText).toBe('Hello world');
    expect(result.markers).toEqual([
      { id: 'world', wordIndex: 1, anchor: 'start' },
    ]);
  });

  it('backward marker resolves to previous word with anchor end', () => {
    const result = parseMarkers('Hello world{done#} end');
    expect(result.cleanText).toBe('Hello world end');
    expect(result.markers).toEqual([
      { id: 'done', wordIndex: 1, anchor: 'end' },
    ]);
  });

  it('matches docstring example exactly', () => {
    const result = parseMarkers('The {#pipeline}four-stage pipeline{done#} is fast.');
    expect(result.cleanText).toBe('The four-stage pipeline is fast.');
    expect(result.markers).toEqual([
      { id: 'pipeline', wordIndex: 1, anchor: 'start' },
      { id: 'done', wordIndex: 2, anchor: 'end' },
    ]);
  });

  it('marker at start of text', () => {
    const result = parseMarkers('{#first}Hello world');
    expect(result.cleanText).toBe('Hello world');
    expect(result.markers).toEqual([
      { id: 'first', wordIndex: 0, anchor: 'start' },
    ]);
  });

  it('marker at end of text', () => {
    const result = parseMarkers('Hello world{last#}');
    expect(result.cleanText).toBe('Hello world');
    expect(result.markers).toEqual([
      { id: 'last', wordIndex: 1, anchor: 'end' },
    ]);
  });

  it('multiple markers in sequence', () => {
    const result = parseMarkers('{#a}one{b#} {#c}two{d#}');
    expect(result.cleanText).toBe('one two');
    expect(result.markers).toHaveLength(4);
    expect(result.markers[0]).toEqual({ id: 'a', wordIndex: 0, anchor: 'start' });
    expect(result.markers[1]).toEqual({ id: 'b', wordIndex: 0, anchor: 'end' });
    expect(result.markers[2]).toEqual({ id: 'c', wordIndex: 1, anchor: 'start' });
    expect(result.markers[3]).toEqual({ id: 'd', wordIndex: 1, anchor: 'end' });
  });

  it('text with no markers returns unchanged text and empty markers', () => {
    const result = parseMarkers('Just plain text.');
    expect(result.cleanText).toBe('Just plain text.');
    expect(result.markers).toEqual([]);
  });
});

describe('hasMarkers', () => {
  it('returns true for forward markers', () => {
    expect(hasMarkers('Hello {#world}world')).toBe(true);
  });

  it('returns true for backward markers', () => {
    expect(hasMarkers('Hello{done#} world')).toBe(true);
  });

  it('returns false for plain text', () => {
    expect(hasMarkers('Just plain text')).toBe(false);
  });

  it('returns false for empty string', () => {
    expect(hasMarkers('')).toBe(false);
  });

  it('is not affected by repeated calls (no /g statefulness)', () => {
    expect(hasMarkers('{#a}word')).toBe(true);
    expect(hasMarkers('{#a}word')).toBe(true);
    expect(hasMarkers('{#a}word')).toBe(true);
  });
});
