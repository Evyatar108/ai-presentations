/**
 * Shared Style Objects for Slide Components
 * Extracted from AnimatedSlides.tsx to reduce duplication
 *
 * Static exports: backward-compatible, used by existing demo slides.
 * Theme-aware factory functions (create*): used by framework components via useTheme().
 */

import { CSSProperties } from 'react';
import type { PresentationTheme } from '../theme/types';

/**
 * Common slide container style - dark background with centered content
 * Used in: ~20 slides
 */
export const slideContainer: CSSProperties = {
  background: '#0f172a',
  minHeight: '100vh',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '2rem',
  fontFamily: 'Inter, system-ui, sans-serif'
};

/**
 * Content box with dark background and rounded corners
 * Used in: ~15 slides
 */
export const contentBox: CSSProperties = {
  background: '#1e293b',
  borderRadius: 16,
  padding: '2rem',
  border: '1px solid #334155'
};

/**
 * Gradient background box (teal to blue)
 * Used in: ~8 slides
 */
export const gradientBox: CSSProperties = {
  background: 'linear-gradient(135deg, #00B7C3, #0078D4)',
  borderRadius: 12,
  padding: '1.5rem',
  textAlign: 'center'
};

/**
 * Green gradient for success/completion states
 * Used in: Ch7_S5, others
 */
export const successGradientBox: CSSProperties = {
  background: 'linear-gradient(135deg, #10b981, #059669)',
  borderRadius: 12,
  padding: '1.5rem'
};

/**
 * Highlight border with glow effect
 * Used in: ~10 slides
 */
export const highlightBorder = (reduced: boolean): CSSProperties => ({
  border: '2px solid #00B7C3',
  boxShadow: reduced ? 'none' : '0 0 30px rgba(0, 183, 195, 0.3)'
});

/**
 * Gradient overlay background with border
 * Used in: Ch1_S3, Ch4_S1, Ch7_S3, others
 */
export const highlightOverlayBox = (reduced: boolean): CSSProperties => ({
  background: 'linear-gradient(135deg, rgba(0, 183, 195, 0.2), rgba(0, 120, 212, 0.2))',
  borderRadius: 16,
  padding: '2rem',
  border: '2px solid #00B7C3',
  boxShadow: reduced ? 'none' : '0 0 40px rgba(0, 183, 195, 0.3)'
});

/**
 * Warning/note box styling (amber)
 * Used in: Ch1_S2
 */
export const warningBox: CSSProperties = {
  background: '#78350f',
  borderRadius: 12,
  padding: '1.25rem',
  border: '1px solid #fbbf24'
};

/**
 * Circular badge/icon container
 * Used in: Ch5_S3-S6, Ch7_S5
 */
export const circularBadge = (size: number = 60): CSSProperties => ({
  width: size,
  height: size,
  borderRadius: '50%',
  background: 'linear-gradient(135deg, #00B7C3, #0078D4)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: size * 0.47, // ~28px for 60px badge
  fontWeight: 'bold',
  color: '#fff'
});

/**
 * Typography styles
 */
export const typography = {
  h1: {
    color: '#f1f5f9',
    marginBottom: '3rem',
    textAlign: 'center' as const
  },
  h2: {
    color: '#f1f5f9',
    fontSize: 20,
    marginBottom: '1.5rem'
  },
  body: {
    color: '#e2e8f0',
    fontSize: 18,
    lineHeight: 1.6
  },
  caption: {
    color: '#94a3b8',
    fontSize: 14
  },
  emphasized: {
    color: '#00B7C3',
    fontWeight: 600
  }
};

/**
 * Layout helpers
 */
export const layouts = {
  centeredColumn: (maxWidth: number = 900): CSSProperties => ({
    maxWidth,
    width: '100%',
    textAlign: 'center'
  }),
  
  flexRow: (gap: string = '1rem'): CSSProperties => ({
    display: 'flex',
    gap,
    justifyContent: 'center',
    alignItems: 'center'
  }),
  
  grid2Col: (gap: string = '2rem'): CSSProperties => ({
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap
  }),
  
  grid3Col: (gap: string = '2rem'): CSSProperties => ({
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap
  })
};

// ============================================================================
// Theme-aware factory functions (for framework components using useTheme())
// ============================================================================

export function createSlideContainer(theme: PresentationTheme): CSSProperties {
  return { ...slideContainer, background: theme.colors.bgDeep, fontFamily: theme.fontFamily };
}

export function createContentBox(theme: PresentationTheme): CSSProperties {
  return { ...contentBox, background: theme.colors.bgSurface, border: `1px solid ${theme.colors.bgBorder}` };
}

export function createGradientBox(theme: PresentationTheme): CSSProperties {
  return { ...gradientBox, background: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.secondary})` };
}

export function createTypography(theme: PresentationTheme) {
  return {
    h1: { ...typography.h1, color: theme.colors.textPrimary },
    h2: { ...typography.h2, color: theme.colors.textPrimary },
    body: { ...typography.body, color: '#e2e8f0' },
    caption: { ...typography.caption, color: theme.colors.textSecondary },
    emphasized: { ...typography.emphasized, color: theme.colors.primary },
  };
}