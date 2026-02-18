import React, { createContext, useContext, useMemo } from 'react';
import type { PresentationTheme, PartialTheme } from './types';
import { defaultTheme } from './defaultTheme';

const ThemeContext = createContext<PresentationTheme>(defaultTheme);

interface ThemeProviderProps {
  theme?: PartialTheme;
  children: React.ReactNode;
}

/**
 * Provides theme values to the component tree.
 * Accepts an optional partial theme that is deep-merged with the default theme.
 */
export const ThemeProvider: React.FC<ThemeProviderProps> = ({ theme, children }) => {
  const merged = useMemo((): PresentationTheme => {
    if (!theme) return defaultTheme;
    return {
      colors: { ...defaultTheme.colors, ...theme.colors },
      fontFamily: theme.fontFamily ?? defaultTheme.fontFamily,
    };
  }, [theme]);

  return (
    <ThemeContext.Provider value={merged}>
      {children}
    </ThemeContext.Provider>
  );
};

/**
 * Hook to access the current presentation theme.
 */
export function useTheme(): PresentationTheme {
  return useContext(ThemeContext);
}
