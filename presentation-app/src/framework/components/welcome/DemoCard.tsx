import React from 'react';
import { motion } from 'framer-motion';
import type { DemoMetadata } from '../../demos/types';
import { useTheme } from '../../theme/ThemeContext';
import { useReducedMotion } from '../../accessibility/ReducedMotion';
import { HoverButton } from '../HoverButton';

interface DemoCardProps {
  demo: DemoMetadata;
  index: number;
  isHovered: boolean;
  actualRuntime?: { elapsed: number; plannedTotal: number };
  onHover: (id: string | null) => void;
  onSelect: (id: string) => void;
  onShowBreakdown: (id: string) => void;
  isFavorite?: boolean;
  onToggleFavorite?: (id: string) => void;
}

const formatDuration = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

export const DemoCard: React.FC<DemoCardProps> = ({
  demo,
  index,
  isHovered,
  actualRuntime,
  onHover,
  onSelect,
  onShowBreakdown,
  isFavorite = false,
  onToggleFavorite,
}) => {
  const theme = useTheme();
  const { reduced } = useReducedMotion();
  const slideBreakdown = demo.durationInfo?.slideBreakdown;

  return (
    <motion.div
      data-demo-id={demo.id}
      initial={reduced ? false : { opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: reduced ? 0 : Math.min(index % 3, 2) * 0.08 }}
      onHoverStart={() => onHover(demo.id)}
      onHoverEnd={() => onHover(null)}
      onClick={() => onSelect(demo.id)}
      style={{
        background: isHovered
          ? `linear-gradient(135deg, rgba(0, 183, 195, 0.15), rgba(0, 120, 212, 0.15))`
          : 'rgba(30, 41, 59, 0.6)',
        borderRadius: 16,
        overflow: 'hidden',
        cursor: 'pointer',
        border: '1px solid rgba(148, 163, 184, 0.2)',
        transform: isHovered ? 'scale(1.02)' : 'scale(1)',
        boxShadow: isHovered
          ? '0 20px 40px rgba(0, 183, 195, 0.3)'
          : '0 4px 12px rgba(0, 0, 0, 0.3)',
        transition: 'all 0.3s ease',
        position: 'relative'
      }}
    >
      {/* Favorite button */}
      {onToggleFavorite && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavorite(demo.id);
          }}
          aria-label={isFavorite ? `Remove ${demo.title} from favorites` : `Add ${demo.title} to favorites`}
          aria-pressed={isFavorite}
          style={{
            position: 'absolute',
            top: 12,
            right: 12,
            zIndex: 10,
            background: 'rgba(0, 0, 0, 0.5)',
            border: 'none',
            borderRadius: '50%',
            width: 32,
            height: 32,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            fontSize: 16,
            color: isFavorite ? '#ef4444' : 'rgba(255, 255, 255, 0.6)',
            transition: 'all 0.2s ease'
          }}
        >
          {isFavorite ? '\u2665' : '\u2661'}
        </button>
      )}

      {/* Thumbnail */}
      {demo.thumbnail && (
        <div style={{
          width: '100%',
          aspectRatio: '16 / 9',
          background: `rgba(15, 23, 42, 0.8) url(${demo.thumbnail}) center/contain no-repeat`,
          borderBottom: '1px solid rgba(148, 163, 184, 0.2)'
        }} />
      )}

      {/* Content */}
      <div style={{ padding: '1.5rem' }}>
        <h2 style={{
          fontSize: 24,
          fontWeight: 600,
          color: theme.colors.textPrimary,
          marginBottom: '0.75rem'
        }}>
          {demo.title}
        </h2>

        {demo.description && (
          <p style={{
            fontSize: 14,
            color: theme.colors.textSecondary,
            lineHeight: 1.6,
            marginBottom: '1rem'
          }}>
            {demo.description}
          </p>
        )}

        {/* Duration Display */}
        {demo.durationInfo && demo.durationInfo.audioOnly > 0 && (
          <div style={{
            marginTop: '1rem',
            padding: '0.85rem 1rem',
            background: 'rgba(0, 183, 195, 0.05)',
            borderRadius: 8,
            border: '1px solid rgba(0, 183, 195, 0.2)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem'
          }}>
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              flexGrow: 1,
              minWidth: 0
            }}>
              {actualRuntime ? (
                <>
                  <div style={{
                    fontSize: 14,
                    fontWeight: 600,
                    color: theme.colors.textPrimary,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    whiteSpace: 'nowrap'
                  }}>
                    <span>{'\uD83D\uDFE2'}</span>
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      Actual {formatDuration(actualRuntime.elapsed)} runtime
                    </span>
                  </div>
                  <div style={{
                    fontSize: 11,
                    color: theme.colors.textSecondary,
                    marginTop: 2,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    whiteSpace: 'nowrap'
                  }}>
                    <span style={{ color: theme.colors.textMuted }}>Estimated {formatDuration(demo.durationInfo!.total)}</span>
                    <span style={{ color: theme.colors.textMuted }}>
                      ({(actualRuntime.elapsed - demo.durationInfo!.total).toFixed(1)}s {'\u0394'})
                    </span>
                  </div>
                </>
              ) : (
                <div style={{
                  fontSize: 14,
                  fontWeight: 600,
                  color: theme.colors.accent,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  whiteSpace: 'nowrap'
                }}>
                  <span>{'\uD83D\uDD52'}</span>
                  <span style={{ color: theme.colors.textPrimary }}>
                    Estimated {formatDuration(demo.durationInfo!.total)} total
                  </span>
                </div>
              )}
            </div>
            {slideBreakdown && slideBreakdown.length > 0 && (
              <HoverButton
                onClick={(e) => {
                  e.stopPropagation();
                  onShowBreakdown(demo.id);
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  color: theme.colors.textSecondary,
                  fontSize: 11,
                  fontWeight: 500,
                  cursor: 'pointer',
                  padding: '0.3rem 0.55rem',
                  borderRadius: 4,
                  textDecoration: 'underline',
                  textUnderlineOffset: '2px',
                  marginLeft: 'auto'
                }}
                hoverStyle={{
                  color: theme.colors.textPrimary,
                  background: 'rgba(0,183,195,0.08)',
                }}
                aria-label={`View timing details for ${demo.title}`}
              >
                Details
              </HoverButton>
            )}
          </div>
        )}

        {/* Tags */}
        {demo.tags && demo.tags.length > 0 && (
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '0.5rem',
            marginTop: '1rem'
          }}>
            {demo.tags.map(tag => (
              <span
                key={tag}
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  color: theme.colors.primary,
                  background: 'rgba(0, 183, 195, 0.1)',
                  padding: '0.25rem 0.75rem',
                  borderRadius: 12,
                  border: '1px solid rgba(0, 183, 195, 0.3)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Play Button */}
        <div style={{
          marginTop: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          color: isHovered ? theme.colors.primary : theme.colors.textMuted,
          fontSize: 14,
          fontWeight: 600,
          transition: 'color 0.3s ease'
        }}>
          <span>{'\u25B6'}</span>
          <span>Play Presentation</span>
        </div>
      </div>
    </motion.div>
  );
};
