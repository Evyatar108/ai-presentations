import React from 'react';
import { defaultTheme } from '../theme/defaultTheme';

interface DemoPlayerBoundaryProps {
  onBack: () => void;
  children: React.ReactNode;
}

interface DemoPlayerBoundaryState {
  hasError: boolean;
  error: Error | null;
}

/**
 * Top-level error boundary wrapping DemoPlayer's render output.
 * Catches unhandled errors and provides a "Back to Demos" escape hatch.
 */
export class DemoPlayerBoundary extends React.Component<DemoPlayerBoundaryProps, DemoPlayerBoundaryState> {
  constructor(props: DemoPlayerBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): DemoPlayerBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('[DemoPlayerBoundary] Unhandled error:', error, info.componentStack);
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
          background: `linear-gradient(135deg, ${theme.colors.bgDeep} 0%, ${theme.colors.bgSurface} 100%)`,
          fontFamily: theme.fontFamily,
          color: theme.colors.textPrimary,
        }}>
          <div style={{ textAlign: 'center', maxWidth: 500, padding: '2rem' }}>
            <div style={{ fontSize: 48, marginBottom: '1rem' }}>
              <span aria-hidden="true">💥</span>
            </div>
            <h2 style={{
              fontSize: 24,
              fontWeight: 600,
              color: theme.colors.error,
              marginBottom: '1rem',
            }}>
              Something went wrong
            </h2>
            <p style={{
              fontSize: 14,
              color: theme.colors.textMuted,
              marginBottom: '2rem',
              wordBreak: 'break-word',
            }}>
              {this.state.error?.message || 'An unexpected error occurred while playing this demo.'}
            </p>
            <button
              onClick={this.props.onBack}
              style={{
                background: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.secondary})`,
                color: '#fff',
                border: 'none',
                borderRadius: 12,
                padding: '0.75rem 1.5rem',
                fontSize: 16,
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              ← Back to Demos
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
