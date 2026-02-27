import React from 'react';
import type { CSSProperties, ReactNode } from 'react';
import { useTheme } from '../theme/ThemeContext';
import { MarkerDim } from './reveal/MarkerDim';
import { createCard } from '../slides/SlideStyles';
import type { CardVariant } from '../slides/SlideStyles';

export interface MarkerCardProps {
  /** Marker ID — content is dimmed until this marker is reached. */
  marker: string;
  /** Optional icon/emoji displayed to the left of the title. */
  icon?: ReactNode;
  /** Bold title text displayed at the top of the card. */
  title?: string;
  /** Card body content. */
  children: ReactNode;
  /** Card color variant. Default: `'default'`. */
  variant?: CardVariant;
  /** Style overrides applied to the inner card div. */
  style?: CSSProperties;
  /** Opacity when the marker hasn't been reached yet. Default: `0.15`. */
  dimOpacity?: number;
}

/**
 * MarkerCard — a themed card wrapped in `<MarkerDim>` for marker-driven progressive reveals.
 *
 * Combines the common pattern of `<MarkerDim at={marker}><div style={cardStyle(variant)}>...</div></MarkerDim>`
 * into a single component, eliminating ~400 lines of boilerplate across demo slides.
 *
 * @example
 * ```tsx
 * <MarkerCard marker="pipeline" icon="🔍" title="Extraction" variant="primary">
 *   Extracts entities from transcript
 * </MarkerCard>
 * ```
 */
export const MarkerCard: React.FC<MarkerCardProps> = ({
  marker,
  icon,
  title,
  children,
  variant = 'default',
  style,
  dimOpacity,
}) => {
  const theme = useTheme();

  return (
    <MarkerDim at={marker} dimOpacity={dimOpacity}>
      <div style={{ ...createCard(theme, variant), ...style }}>
        {(icon || title) && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            marginBottom: children ? '0.5rem' : 0,
          }}>
            {icon && <span>{icon}</span>}
            {title && (
              <span style={{
                fontWeight: 600,
                fontSize: 15,
                color: theme.colors.textPrimary,
              }}>
                {title}
              </span>
            )}
          </div>
        )}
        {children}
      </div>
    </MarkerDim>
  );
};
