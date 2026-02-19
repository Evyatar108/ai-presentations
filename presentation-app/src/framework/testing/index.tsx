/**
 * Test utilities for demo authors.
 *
 * Provides wrappers, factories, and helpers that simplify testing
 * slide components and demo configurations.
 */
import React from 'react';
import { ThemeProvider } from '../theme/ThemeContext';
import { ReducedMotionProvider } from '../accessibility/ReducedMotion';
import { SegmentProvider } from '../contexts/SegmentContext';
import type { AudioSegment, SlideMetadata, SlideComponentWithMetadata } from '../slides/SlideMetadata';

/**
 * Wraps children in the providers typically required by slide components:
 * ReducedMotionProvider, ThemeProvider, and SegmentProvider.
 */
export const TestSlideWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ReducedMotionProvider>
    <ThemeProvider>
      <SegmentProvider>
        {children}
      </SegmentProvider>
    </ThemeProvider>
  </ReducedMotionProvider>
);

/**
 * Creates a test AudioSegment with sensible defaults.
 * All properties can be overridden.
 */
export function createTestSegment(overrides?: Partial<AudioSegment>): AudioSegment {
  return {
    id: 'test-segment',
    audioFilePath: '/audio/test/c0/s0_segment_01_test.wav',
    ...overrides,
  };
}

/**
 * Creates a test SlideMetadata with sensible defaults.
 * All properties can be overridden.
 */
export function createTestMetadata(overrides?: Partial<SlideMetadata>): SlideMetadata {
  return {
    chapter: 0,
    slide: 0,
    title: 'Test Slide',
    audioSegments: [createTestSegment()],
    ...overrides,
  };
}

/**
 * Creates a test SlideComponentWithMetadata.
 * @param metadataOverrides - partial overrides for slide metadata
 * @param component - optional custom component (defaults to a simple div)
 */
export function createTestSlide(
  metadataOverrides?: Partial<SlideMetadata>,
  component?: React.FC
): SlideComponentWithMetadata {
  const comp = component ?? (() => React.createElement('div', null, 'Test Slide'));
  const slide: SlideComponentWithMetadata = Object.assign(
    (props: Record<string, never>) => comp(props),
    { metadata: createTestMetadata(metadataOverrides) }
  );
  return slide;
}
