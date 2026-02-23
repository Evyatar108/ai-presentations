/**
 * Design Tokens
 *
 * Structural constants that are independent of the color theme.
 * Spacing, radii, shadows, and font sizes define the visual rhythm of slides
 * without binding to any specific brand palette.
 */

export const spacing = {
  xs: '0.25rem',
  sm: '0.5rem',
  md: '0.75rem',
  lg: '1rem',
  xl: '1.25rem',
  '2xl': '1.5rem',
  '3xl': '2rem',
  '4xl': '3rem',
} as const;

export const spacingPx = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  '3xl': 32,
  '4xl': 48,
} as const;

export const radii = {
  sm: 6,
  md: 8,
  lg: 10,
  xl: 12,
  '2xl': 16,
  full: '50%',
} as const;

export const shadows = {
  none: 'none',
  sm: '0 0 15px',
  md: '0 0 20px',
  lg: '0 0 30px',
  xl: '0 0 40px',
} as const;

export const fontSizes = {
  xs: 10,
  sm: 11,
  md: 12,
  base: 13,
  lg: 14,
  xl: 15,
  '2xl': 16,
  '3xl': 18,
  '4xl': 20,
  '5xl': 24,
} as const;
