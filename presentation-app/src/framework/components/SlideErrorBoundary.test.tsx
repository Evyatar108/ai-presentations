// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { SlideErrorBoundary } from './SlideErrorBoundary';

// Suppress console.error for expected errors in tests
beforeEach(() => {
  vi.spyOn(console, 'error').mockImplementation(() => {});
});

const ThrowingComponent: React.FC<{ shouldThrow?: boolean }> = ({ shouldThrow = true }) => {
  if (shouldThrow) throw new Error('Test slide error');
  return <div>Slide content</div>;
};

describe('SlideErrorBoundary', () => {
  it('renders children when no error', () => {
    render(
      <SlideErrorBoundary slideKey="0">
        <div>Normal content</div>
      </SlideErrorBoundary>
    );
    expect(screen.getByText('Normal content')).toBeTruthy();
  });

  it('renders fallback UI when child throws', () => {
    render(
      <SlideErrorBoundary slideKey="0" slideTitle="Intro Slide">
        <ThrowingComponent />
      </SlideErrorBoundary>
    );
    expect(screen.getByText('Slide Render Error')).toBeTruthy();
    expect(screen.getByText('Slide: Intro Slide')).toBeTruthy();
    expect(screen.getByText('Test slide error')).toBeTruthy();
  });

  it('renders skip forward and go back buttons when callbacks provided', () => {
    const onForward = vi.fn();
    const onBackward = vi.fn();
    render(
      <SlideErrorBoundary slideKey="0" onSkipForward={onForward} onSkipBackward={onBackward}>
        <ThrowingComponent />
      </SlideErrorBoundary>
    );
    const skipBtn = screen.getByLabelText('Skip to next slide');
    const backBtn = screen.getByLabelText('Go to previous slide');
    fireEvent.click(skipBtn);
    fireEvent.click(backBtn);
    expect(onForward).toHaveBeenCalledOnce();
    expect(onBackward).toHaveBeenCalledOnce();
  });

  it('resets error state when slideKey changes', () => {
    const { rerender } = render(
      <SlideErrorBoundary slideKey="0">
        <ThrowingComponent shouldThrow={true} />
      </SlideErrorBoundary>
    );
    expect(screen.getByText('Slide Render Error')).toBeTruthy();

    // Re-render with a new slideKey and a non-throwing child
    rerender(
      <SlideErrorBoundary slideKey="1">
        <ThrowingComponent shouldThrow={false} />
      </SlideErrorBoundary>
    );
    expect(screen.getByText('Slide content')).toBeTruthy();
  });
});
