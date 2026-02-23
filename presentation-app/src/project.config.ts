/**
 * Project-level configuration overrides.
 *
 * Customize the framework theme and config for this specific project.
 * Import this file early in main.tsx so overrides take effect before components render.
 */

import { setProjectConfig } from './framework/config';
import type { PartialTheme } from './framework/theme/types';

// ---- Framework config overrides (uncomment to customize) ----
// setProjectConfig({
//   narrationApiBaseUrl: 'http://localhost:3001',  // only needed if using standalone Express server
//   fallbackAudioPath: '/audio/silence-1s.mp3',
// });

// ---- Theme overrides (uncomment to customize) ----
// Export theme overrides for use in ThemeProvider
export const themeOverrides: PartialTheme | undefined = undefined;
// Example:
// export const themeOverrides: PartialTheme = {
//   colors: {
//     primary: '#6366f1',
//     secondary: '#8b5cf6',
//   },
// };
