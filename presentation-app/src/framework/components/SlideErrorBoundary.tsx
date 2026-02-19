import React from 'react';
import { defaultTheme } from '../theme/defaultTheme';

interface SlideErrorBoundaryProps {
  slideKey: string;
  slideTitle?: string;
  onSkipForward?: () => void;
  onSkipBackward?: () => void;
  children: React.ReactNode;
}

interface SlideErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

/**
 * Error boundary wrapping individual slide renders.
 * Catches render errors from the current slide component and shows a fallback UI
 * with options to skip forward/backward. Automatically resets when slideKey changes.
 */
export class SlideErrorBoundary extends React.Component<SlideErrorBoundaryProps, SlideErrorBoundaryState> {
  constructor(props: SlideErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): SlideErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('[SlideErrorBoundary] Slide render error:', error, info.componentStack);
  }

  componentDidUpdate(prevProps: SlideErrorBoundaryProps) {
    if (prevProps.slideKey !== this.props.slideKey && this.state.hasError) {
      this.setState({ hasError: false, error: null });
    }
  }

  render() {
    if (this.state.hasError) {
      const theme = defaultTheme;
      return (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          background: theme.colors.bgDeep,
          fontFamily: theme.fontFamily,
          color: theme.colors.textPrimary,
          padding: '2rem',
        }}>
          <div style={{ textAlign: 'center', maxWidth: 500 }}>
            <div style={{ fontSize: 48, marginBottom: '1rem' }}>
              <span aria-hidden="true">⚠️</span>
            </div>
            <h2 style={{
              fontSize: 24,
              fontWeight: 600,
              color: theme.colors.error,
              marginBottom: '0.5rem',
            }}>
              Slide Render Error
            </h2>
            {this.props.slideTitle && (
              <p style={{
                fontSize: 14,
                color: theme.colors.textSecondary,
                marginBottom: '0.5rem',
              }}>
                Slide: {this.props.slideTitle}
              </p>
            )}
            <p style={{
              fontSize: 14,
              color: theme.colors.textMuted,
              marginBottom: '1.5rem',
              wordBreak: 'break-word',
            }}>
              {this.state.error?.message || 'An unexpected error occurred'}
            </p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
              {this.props.onSkipBackward && (
                <button
                  onClick={this.props.onSkipBackward}
                  aria-label="Go to previous slide"
                  style={{
                    background: 'transparent',
                    border: `1px solid ${theme.colors.bgBorder}`,
                    color: theme.colors.textSecondary,
                    borderRadius: 8,
                    padding: '0.75rem 1.25rem',
                    fontSize: 14,
                    cursor: 'pointer',
                  }}
                >
                  ← Go Back
                </button>
              )}
              {this.props.onSkipForward && (
                <button
                  onClick={this.props.onSkipForward}
                  aria-label="Skip to next slide"
                  style={{
                    background: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.secondary})`,
                    color: '#fff',
                    border: 'none',
                    borderRadius: 8,
                    padding: '0.75rem 1.25rem',
                    fontSize: 14,
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Skip to Next →
                </button>
              )}
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
