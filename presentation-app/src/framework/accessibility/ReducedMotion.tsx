import React, { createContext, useContext, useEffect, useState } from 'react';
import { defaultTheme } from '../theme/defaultTheme';

interface ReducedMotionContextValue {
  reduced: boolean;
  toggle: () => void;
  autoPref: boolean;
}

const ReducedMotionContext = createContext<ReducedMotionContextValue | undefined>(undefined);

/**
 * Provider that:
 * 1. Reads system prefers-reduced-motion
 * 2. Allows manual override toggle
 */
export const ReducedMotionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [autoPref, setAutoPref] = useState(false);
  const [manualOverride, setManualOverride] = useState<boolean | null>(null);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const apply = () => setAutoPref(mq.matches);
    apply();
    mq.addEventListener('change', apply);
    return () => mq.removeEventListener('change', apply);
  }, []);

  const reduced = manualOverride !== null ? manualOverride : autoPref;

  const toggle = () => {
    setManualOverride(prev => {
      if (prev === null) {
        return !autoPref;
      }
      return !prev;
    });
  };

  return (
    <ReducedMotionContext.Provider value={{ reduced, toggle, autoPref }}>
      {children}
    </ReducedMotionContext.Provider>
  );
};

export const useReducedMotion = () => {
  const ctx = useContext(ReducedMotionContext);
  if (!ctx) throw new Error('useReducedMotion must be used within ReducedMotionProvider');
  return ctx;
};

/**
 * Button component for toggling reduced motion.
 */
export const ReducedMotionToggle: React.FC = () => {
  const { reduced, toggle, autoPref } = useReducedMotion();
  return (
    <button
      onClick={toggle}
      aria-pressed={reduced}
      style={{
        background: reduced ? defaultTheme.colors.bgBorder : defaultTheme.colors.bgSurface,
        color: defaultTheme.colors.textPrimary,
        border: `1px solid ${defaultTheme.colors.borderSubtle}`,
        borderRadius: 8,
        padding: '0.5rem 0.75rem',
        fontSize: 12,
        cursor: 'pointer',
        fontFamily: defaultTheme.fontFamily,
      }}
    >
      {reduced ? 'Reduced Motion: ON' : 'Reduced Motion: OFF'}
      {autoPref && ' (auto)'}
    </button>
  );
};

/**
 * Helper wrapper to simplify integration.
 */
export const WithReducedMotionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ReducedMotionProvider>{children}</ReducedMotionProvider>
);