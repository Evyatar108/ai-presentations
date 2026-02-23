import React from 'react';
import type { CSSProperties } from 'react';
import { useTheme } from '../theme/ThemeContext';
import { useReducedMotion } from '../accessibility/ReducedMotion';
import { circularBadge, typography } from '../slides/SlideStyles';

export interface NumberedStepCardProps {
  number: number;
  title: string;
  description?: string;
  /** Primary gradient highlight when active */
  isActive?: boolean;
  /** Error variant uses red gradient for the number badge */
  variant?: 'default' | 'error';
  style?: CSSProperties;
}

/**
 * Numbered step card — circle badge + title + optional description.
 *
 * `isActive` toggles gradient background + primary border + glow.
 * Uses `useTheme()` and `useReducedMotion()` internally.
 *
 * @example
 * ```tsx
 * <NumberedStepCard number={1} title="Parse input" description="Extract tokens" isActive={segment === 1} />
 * ```
 */
export const NumberedStepCard: React.FC<NumberedStepCardProps> = ({
  number,
  title,
  description,
  isActive = false,
  variant = 'default',
  style,
}) => {
  const theme = useTheme();
  const { reduced } = useReducedMotion();

  const isError = variant === 'error';
  const errorActive = isError && isActive;

  const badgeGradient = isError
    ? `linear-gradient(135deg, ${theme.colors.error}, #dc2626)`
    : isActive
      ? `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.secondary})`
      : theme.colors.bgBorder;

  const activeBg = errorActive
    ? 'rgba(239, 68, 68, 0.1)'
    : `linear-gradient(135deg, rgba(0, 183, 195, 0.1), rgba(0, 120, 212, 0.1))`;
  const activeBorder = errorActive
    ? `2px solid rgba(239, 68, 68, 0.4)`
    : `2px solid ${theme.colors.primary}`;
  const activeGlow = errorActive
    ? '0 0 20px rgba(239, 68, 68, 0.15)'
    : '0 0 15px rgba(0, 183, 195, 0.15)';

  return (
    <div style={{
      display: 'flex',
      alignItems: 'flex-start',
      gap: '1rem',
      padding: '0.85rem 1.25rem',
      borderRadius: 12,
      background: isActive ? activeBg : theme.colors.bgSurface,
      border: isActive ? activeBorder : `1px solid ${theme.colors.bgBorder}`,
      boxShadow: isActive && !reduced ? activeGlow : 'none',
      transition: 'all 0.3s ease',
      ...style,
    }}>
      <div style={{
        ...circularBadge(30),
        background: badgeGradient,
        fontSize: 14,
        flexShrink: 0,
        marginTop: 2,
      }}>
        {number}
      </div>
      <div style={{ textAlign: 'left' }}>
        <div style={{
          ...typography.body,
          fontSize: 16,
          fontWeight: 600,
          color: isActive
            ? (isError ? theme.colors.error : theme.colors.primary)
            : isError
              ? theme.colors.error
              : theme.colors.textPrimary,
        }}>
          {title}
        </div>
        {description && (
          <div style={{ ...typography.caption, fontSize: 13, marginTop: 2 }}>
            {description}
          </div>
        )}
      </div>
    </div>
  );
};
