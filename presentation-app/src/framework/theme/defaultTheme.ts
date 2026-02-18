/**
 * Default theme values matching the current hardcoded colors in the codebase.
 */

import type { PresentationTheme } from './types';

export const defaultTheme: PresentationTheme = {
  colors: {
    primary: '#00B7C3',
    secondary: '#0078D4',

    bgDeep: '#0f172a',
    bgSurface: '#1e293b',
    bgBorder: '#334155',

    textPrimary: '#f1f5f9',
    textSecondary: '#94a3b8',
    textMuted: '#64748b',

    success: '#10b981',
    warning: '#fbbf24',
    error: '#ef4444',
  },
  fontFamily: 'Inter, system-ui, sans-serif',
};
