import { describe, it, expect } from 'vitest';
import React from 'react';
import { defineSlide } from './defineSlide';
import type { SlideMetadata } from './SlideMetadata';

const validMetadata: SlideMetadata = {
  chapter: 0,
  slide: 0,
  title: 'Test Slide',
  audioSegments: [{ id: 0, audioFilePath: '/audio/test/c0/s0_segment_00.wav' }],
};

describe('defineSlide', () => {
  it('attaches metadata to the returned component', () => {
    const slide = defineSlide({
      metadata: validMetadata,
      component: () => null,
    });

    expect(slide.metadata).toEqual(validMetadata);
  });

  it('returned component is callable', () => {
    const slide = defineSlide({
      metadata: validMetadata,
      component: () => null,
    });

    expect(typeof slide).toBe('function');
    expect(slide({} as Record<string, never>)).toBeNull();
  });

  it('preserves the display name from the component', () => {
    const MyComponent: React.FC = () => null;
    MyComponent.displayName = 'MySlide';

    const slide = defineSlide({
      metadata: validMetadata,
      component: MyComponent,
    });

    expect(slide.displayName).toBe('MySlide');
  });

  it('falls back to function name when displayName is not set', () => {
    function NamedComponent() {
      return null;
    }

    const slide = defineSlide({
      metadata: validMetadata,
      component: NamedComponent,
    });

    expect(slide.displayName).toBe('NamedComponent');
  });

  it('preserves metadata with empty audioSegments', () => {
    const meta: SlideMetadata = {
      chapter: 0,
      slide: 0,
      title: 'Empty',
      audioSegments: [],
    };

    const slide = defineSlide({ metadata: meta, component: () => null });
    expect(slide.metadata.audioSegments).toEqual([]);
  });

  it('preserves optional timing in metadata', () => {
    const meta: SlideMetadata = {
      ...validMetadata,
      timing: { betweenSegments: 750 },
    };

    const slide = defineSlide({ metadata: meta, component: () => null });
    expect(slide.metadata.timing).toEqual({ betweenSegments: 750 });
  });
});
