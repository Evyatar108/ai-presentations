import React from 'react';
import type { CSSProperties } from 'react';
import { useTheme } from '../theme/ThemeContext';
import { typography, badgeStyle } from '../slides/SlideStyles';

export interface FieldCardProps {
  name: string;
  description?: string;
  badge?: { text: string; color?: string; bg?: string };
  accentColor?: string;
  /** Controls opacity (0.15 when dimmed, 1 otherwise) */
  dimmed?: boolean;
  compact?: boolean;
  style?: CSSProperties;
}

/**
 * FieldCard — a left-accent-bordered card with a monospace name, optional badge, and description.
 *
 * Generalized version of the demo-specific `MarkerFieldCard`. Marker integration stays external.
 *
 * @example
 * ```tsx
 * <FieldCard
 *   name="abstractive_topics"
 *   description="1-7 topics with narration"
 *   badge={{ text: 'V1: Call 1', color: '#fbbf24', bg: 'rgba(251,191,36,0.15)' }}
 *   accentColor="#fbbf24"
 * />
 * ```
 */
export const FieldCard: React.FC<FieldCardProps> = ({
  name,
  description,
  badge,
  accentColor,
  dimmed = false,
  compact = false,
  style,
}) => {
  const theme = useTheme();
  const accent = accentColor ?? theme.colors.primary;

  return (
    <div style={{
      background: `${accent}12`,
      border: `1px solid ${theme.colors.bgBorder}`,
      borderLeft: `3px solid ${accent}`,
      borderRadius: 10,
      padding: compact ? '0.45rem 0.65rem' : '0.55rem 0.75rem',
      textAlign: 'left',
      opacity: dimmed ? 0.15 : 1,
      transition: 'opacity 0.4s ease',
      ...style,
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '0.2rem',
      }}>
        <span style={{
          fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
          fontSize: compact ? 10.5 : 11,
          fontWeight: 600,
          color: accent,
        }}>
          {name}
        </span>
        {badge && (
          <span style={badgeStyle({ color: badge.color, bg: badge.bg })}>
            {badge.text}
          </span>
        )}
      </div>
      {description && (
        <div style={{
          ...typography.body,
          fontSize: compact ? 10.5 : 11,
          color: theme.colors.textSecondary,
          lineHeight: 1.3,
        }}>
          {description}
        </div>
      )}
    </div>
  );
};
