// @vitest-environment jsdom
import { describe, it, expect, beforeAll } from 'vitest';
import React from 'react';
import { render, screen } from '@testing-library/react';
import {
  TestSlideWrapper,
  createTestSegment,
  createTestMetadata,
  createTestSlide,
} from './index';

beforeAll(() => {
  // jsdom doesn't provide matchMedia; stub it for ReducedMotionProvider
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: (query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    }),
  });
});

describe('createTestSegment', () => {
  it('returns a segment with defaults', () => {
    const seg = createTestSegment();
    expect(seg.id).toBe('test-segment');
    expect(seg.audioFilePath).toBeTruthy();
  });

  it('allows overriding fields', () => {
    const seg = createTestSegment({ id: 'custom', duration: 5 });
    expect(seg.id).toBe('custom');
    expect(seg.duration).toBe(5);
  });
});

describe('createTestMetadata', () => {
  it('returns metadata with defaults', () => {
    const meta = createTestMetadata();
    expect(meta.chapter).toBe(0);
    expect(meta.slide).toBe(0);
    expect(meta.title).toBe('Test Slide');
    expect(meta.audioSegments).toHaveLength(1);
  });

  it('allows overriding fields', () => {
    const meta = createTestMetadata({ chapter: 3, title: 'Custom' });
    expect(meta.chapter).toBe(3);
    expect(meta.title).toBe('Custom');
  });
});

describe('createTestSlide', () => {
  it('returns a callable component with metadata', () => {
    const slide = createTestSlide();
    expect(typeof slide).toBe('function');
    expect(slide.metadata).toBeDefined();
    expect(slide.metadata.title).toBe('Test Slide');
  });

  it('accepts metadata overrides', () => {
    const slide = createTestSlide({ title: 'Overridden' });
    expect(slide.metadata.title).toBe('Overridden');
  });

  it('accepts a custom component', () => {
    const Custom: React.FC = () => React.createElement('span', null, 'Custom');
    const slide = createTestSlide({}, Custom);
    expect(typeof slide).toBe('function');
  });
});

describe('TestSlideWrapper', () => {
  it('renders children within required providers', () => {
    render(
      <TestSlideWrapper>
        <div data-testid="child">Hello</div>
      </TestSlideWrapper>
    );
    expect(screen.getByTestId('child')).toHaveTextContent('Hello');
  });
});
