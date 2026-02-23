import React from 'react';
import type { CSSProperties, ReactNode } from 'react';
import { useTheme } from '../theme/ThemeContext';
import { createCallout } from '../slides/SlideStyles';
import type { CalloutVariant } from '../slides/SlideStyles';

const DEFAULT_ICONS: Record<CalloutVariant, string> = {
  info: '\u2139\uFE0F',
  tip: '\uD83D\uDCA1',
  warning: '\u26A0\uFE0F',
  error: '\u2715',
  success: '\u2713',
};

export interface CalloutProps {
  variant?: CalloutVariant;
  /** Emoji or text icon. Pass "" to suppress the icon. */
  icon?: string;
  children: ReactNode;
  style?: CSSProperties;
}

/**
 * Callout — a left-bordered, tinted-background box for tips, warnings, and insights.
 *
 * Theme-aware via `useTheme()`. Not animated — compose with `<Reveal>` externally.
 *
 * @example
 * ```tsx
 * <Callout variant="info">Key insight here</Callout>
 * <Callout variant="warning" icon="">No icon callout</Callout>
 * ```
 */
export const Callout: React.FC<CalloutProps> = ({
  variant = 'info',
  icon,
  children,
  style,
}) => {
  const theme = useTheme();
  const resolvedIcon = icon ?? DEFAULT_ICONS[variant];

  return (
    <div style={{ ...createCallout(theme, variant), ...style }}>
      {resolvedIcon !== '' && (
        <span style={{ marginRight: '0.5rem' }}>{resolvedIcon}</span>
      )}
      {children}
    </div>
  );
};
