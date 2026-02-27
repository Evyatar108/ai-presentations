/**
 * Shared Style Objects for Slide Components
 *
 * This module provides two APIs:
 *
 * **Static exports** (`slideContainer`, `contentBox`, `typography`, etc.)
 *   Hardcoded default-theme values. Use these in demo slide components where
 *   the default theme is always correct and `useTheme()` is not needed.
 *
 * **Theme-aware factory functions** (`createSlideContainer(theme)`, `createContentBox(theme)`, etc.)
 *   Accept a `PresentationTheme` and return styles derived from theme tokens.
 *   Use these in framework components that call `useTheme()`, so that custom themes
 *   are respected at runtime.
 */

import { CSSProperties } from 'react';
import type { PresentationTheme } from '../theme/types';
import { defaultTheme } from '../theme/defaultTheme';

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

  flexCol: (gap: string = '0.75rem'): CSSProperties => ({
    display: 'flex',
    flexDirection: 'column',
    gap,
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

/**
 * Card variant type for createCard()
 */
export type CardVariant = 'default' | 'primary' | 'error' | 'warning' | 'success';

/**
 * Card style - configurable container with background, border, and rounded corners.
 * Replaces 50+ inline card style definitions across demo slides.
 *
 * Variants:
 *   - `default` — theme surface background, subtle border
 *   - `primary` — teal/blue tinted background, primary border
 *   - `error`   — red-tinted background, red border
 *   - `warning` — amber-tinted background, amber border
 *   - `success` — green-tinted background, success border
 *
 * @example
 * ```tsx
 * <div style={{ ...cardStyle(), padding: '2rem' }}>Default card</div>
 * <div style={cardStyle('error')}>Error card</div>
 * ```
 */
export const cardStyle = (variant: CardVariant = 'default', overrides?: CSSProperties): CSSProperties => {
  let base: CSSProperties;
  switch (variant) {
    case 'primary':
      base = {
        background: 'rgba(0, 183, 195, 0.06)',
        border: '1px solid rgba(0, 183, 195, 0.3)',
        borderRadius: 12,
        padding: '1rem 1.25rem',
      };
      break;
    case 'error':
      base = {
        background: 'rgba(239, 68, 68, 0.1)',
        border: '2px solid rgba(239, 68, 68, 0.4)',
        borderRadius: 12,
        padding: '1.25rem',
      };
      break;
    case 'warning':
      base = {
        background: 'rgba(251, 191, 36, 0.1)',
        border: '1px solid rgba(251, 191, 36, 0.3)',
        borderRadius: 12,
        padding: '1rem 1.25rem',
      };
      break;
    case 'success':
      base = {
        background: 'rgba(16, 185, 129, 0.06)',
        border: '1px solid rgba(16, 185, 129, 0.4)',
        borderRadius: 12,
        padding: '1rem 1.25rem',
      };
      break;
    default:
      base = {
        background: '#1e293b',
        border: '1px solid #334155',
        borderRadius: 12,
        padding: '1rem 1.25rem',
      };
  }
  return overrides ? { ...base, ...overrides } : base;
};

/**
 * Theme-aware card factory. Use in framework components that call useTheme().
 */
export function createCard(theme: PresentationTheme, variant: CardVariant = 'default', overrides?: CSSProperties): CSSProperties {
  const base = cardStyle(variant);
  let themed: CSSProperties;
  if (variant === 'default') {
    themed = {
      ...base,
      background: theme.colors.bgSurface,
      border: `1px solid ${theme.colors.bgBorder}`,
    };
  } else {
    themed = base;
  }
  return overrides ? { ...themed, ...overrides } : themed;
}

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
    body: { ...typography.body, color: theme.colors.textPrimary },
    caption: { ...typography.caption, color: theme.colors.textSecondary },
    emphasized: { ...typography.emphasized, color: theme.colors.primary },
  };
}

export function createOverlayContainer(theme: PresentationTheme): CSSProperties {
  return {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: theme.colors.bgOverlay,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10000,
    fontFamily: theme.fontFamily,
  };
}

export function createFixedButton(theme: PresentationTheme): CSSProperties {
  return {
    background: 'transparent',
    border: `1px solid ${theme.colors.borderSubtle}`,
    color: theme.colors.textPrimary,
    borderRadius: 8,
    padding: '0.75rem 1.25rem',
    fontSize: 14,
    cursor: 'pointer',
    fontFamily: theme.fontFamily,
    transition: 'all 0.2s ease',
  };
}

export function createModalBackdrop(theme: PresentationTheme): CSSProperties {
  return {
    position: 'fixed',
    inset: 0,
    background: theme.colors.bgOverlay,
    backdropFilter: 'blur(4px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  };
}

// ============================================================================
// Callout variants
// ============================================================================

/**
 * Callout variant type for calloutStyle() / createCallout()
 */
export type CalloutVariant = 'info' | 'tip' | 'warning' | 'error' | 'success';

const CALLOUT_COLORS: Record<CalloutVariant, { border: string; bg: string }> = {
  info:    { border: defaultTheme.colors.primary, bg: `rgba(0, 183, 195, 0.08)` },
  tip:     { border: defaultTheme.colors.primary, bg: `rgba(0, 183, 195, 0.08)` },
  warning: { border: defaultTheme.colors.warning, bg: `rgba(251, 191, 36, 0.08)` },
  error:   { border: defaultTheme.colors.error,   bg: `rgba(239, 68, 68, 0.08)` },
  success: { border: defaultTheme.colors.success, bg: `rgba(16, 185, 129, 0.08)` },
};

/**
 * Callout style — left-bordered box with tinted background.
 * Replaces 5+ ad-hoc `borderLeft: 3px solid` + tinted-bg callout patterns.
 *
 * @example
 * ```tsx
 * <div style={calloutStyle('info')}>Key insight here</div>
 * ```
 */
export const calloutStyle = (variant: CalloutVariant = 'info'): CSSProperties => {
  const { border, bg } = CALLOUT_COLORS[variant];
  return {
    background: bg,
    borderLeft: `3px solid ${border}`,
    borderRadius: 10,
    padding: '0.85rem 1.25rem',
  };
};

/**
 * Theme-aware callout factory. Use in framework components that call useTheme().
 */
export function createCallout(theme: PresentationTheme, variant: CalloutVariant = 'info'): CSSProperties {
  const colorMap: Record<CalloutVariant, { border: string; bg: string }> = {
    info:    { border: theme.colors.primary, bg: `linear-gradient(135deg, ${theme.colors.primary}15, ${theme.colors.secondary}15)` },
    tip:     { border: theme.colors.primary, bg: `linear-gradient(135deg, ${theme.colors.primary}15, ${theme.colors.secondary}15)` },
    warning: { border: theme.colors.warning, bg: `rgba(251, 191, 36, 0.08)` },
    error:   { border: theme.colors.error,   bg: `rgba(239, 68, 68, 0.08)` },
    success: { border: theme.colors.success, bg: `rgba(16, 185, 129, 0.08)` },
  };
  const { border, bg } = colorMap[variant];
  return {
    background: bg,
    borderLeft: `3px solid ${border}`,
    borderRadius: 10,
    padding: '0.85rem 1.25rem',
  };
}

// ============================================================================
// Badge style
// ============================================================================

export interface BadgeOptions {
  color?: string;
  bg?: string;
}

/**
 * Badge/tag style — compact label used for status, category, or version indicators.
 *
 * @example
 * ```tsx
 * <span style={badgeStyle({ color: '#fbbf24', bg: 'rgba(251,191,36,0.15)' })}>V1: Call 1</span>
 * ```
 */
export const badgeStyle = (options: BadgeOptions = {}): CSSProperties => {
  const { color = defaultTheme.colors.primary, bg = `${defaultTheme.colors.primary}20` } = options;
  return {
    fontSize: 9,
    fontWeight: 700,
    color,
    background: bg,
    borderRadius: 5,
    padding: '0.15rem 0.4rem',
    whiteSpace: 'nowrap',
  };
};

// ============================================================================
// Monospace text utility
// ============================================================================

/**
 * Monospace text style — centralizes the JetBrains Mono / Fira Code font stack.
 * Replaces 17+ inline `fontFamily: "'JetBrains Mono', 'Fira Code', monospace"` declarations.
 *
 * @example
 * ```tsx
 * <span style={{ ...monoText(), color: '#00B7C3' }}>api_endpoint</span>
 * <code style={monoText(11, 400)}>const x = 1;</code>
 * ```
 */
export const monoText = (fontSize: number = 13, fontWeight: number = 600): CSSProperties => ({
  fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
  fontSize,
  fontWeight,
});

// ============================================================================
// Gradient badge utility
// ============================================================================

/**
 * Gradient circular badge — used for checkmark/icon indicators.
 * Replaces 3+ inline gradient badge style definitions.
 *
 * @example
 * ```tsx
 * <div style={gradientBadge()}>✓</div>
 * <div style={gradientBadge(32, '#3b82f6', '#1d4ed8')}>★</div>
 * ```
 */
export const gradientBadge = (size: number = 22, from: string = '#10b981', to: string = '#059669'): CSSProperties => ({
  width: size,
  height: size,
  borderRadius: '50%',
  background: `linear-gradient(135deg, ${from}, ${to})`,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: size * 0.6,
  color: '#fff',
  flexShrink: 0,
});