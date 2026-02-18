/**
 * Theme type definitions for the presentation framework.
 * Defines color tokens and typography settings that can be customized per project.
 */

export interface ThemeColors {
  /** Primary accent color (default: #00B7C3 teal) */
  primary: string;
  /** Secondary accent color (default: #0078D4 blue) */
  secondary: string;

  /** Deep background color (default: #0f172a) */
  bgDeep: string;
  /** Surface/card background color (default: #1e293b) */
  bgSurface: string;
  /** Border color (default: #334155) */
  bgBorder: string;

  /** Primary text color (default: #f1f5f9) */
  textPrimary: string;
  /** Secondary text color (default: #94a3b8) */
  textSecondary: string;
  /** Muted text color (default: #64748b) */
  textMuted: string;

  /** Success color (default: #10b981) */
  success: string;
  /** Warning color (default: #fbbf24) */
  warning: string;
  /** Error color (default: #ef4444) */
  error: string;
}

export interface PresentationTheme {
  colors: ThemeColors;
  fontFamily: string;
}

/**
 * Deep partial type for theme overrides.
 * Allows overriding any subset of theme properties.
 */
export type PartialTheme = {
  colors?: Partial<ThemeColors>;
  fontFamily?: string;
};
