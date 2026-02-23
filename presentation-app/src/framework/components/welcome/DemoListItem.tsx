import React from 'react';
import { motion } from 'framer-motion';
import type { DemoMetadata } from '../../demos/types';
import { useTheme } from '../../theme/ThemeContext';

interface DemoListItemProps {
  demo: DemoMetadata;
  index: number;
  isHovered: boolean;
  actualRuntime?: { elapsed: number; plannedTotal: number };
  onHover: (id: string | null) => void;
  onSelect: (id: string) => void;
  isFavorite?: boolean;
  onToggleFavorite?: (id: string) => void;
}

const formatDuration = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

export const DemoListItem: React.FC<DemoListItemProps> = ({
  demo,
  index,
  isHovered,
  actualRuntime,
  onHover,
  onSelect,
  isFavorite = false,
  onToggleFavorite,
}) => {
  const theme = useTheme();

  return (
    <motion.div
      data-demo-id={demo.id}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      onHoverStart={() => onHover(demo.id)}
      onHoverEnd={() => onHover(null)}
      onClick={() => onSelect(demo.id)}
      style={{
        background: isHovered
          ? 'linear-gradient(135deg, rgba(0, 183, 195, 0.1), rgba(0, 120, 212, 0.1))'
          : 'rgba(30, 41, 59, 0.4)',
        borderRadius: 12,
        cursor: 'pointer',
        border: '1px solid rgba(148, 163, 184, 0.15)',
        padding: '0.85rem 1rem',
        display: 'flex',
        alignItems: 'center',
        gap: '1rem',
        transition: 'all 0.2s ease',
        boxShadow: isHovered
          ? '0 4px 16px rgba(0, 183, 195, 0.15)'
          : '0 2px 6px rgba(0, 0, 0, 0.2)',
      }}
    >
      {/* Thumbnail */}
      {demo.thumbnail && (
        <div style={{
          width: 64,
          height: 36,
          flexShrink: 0,
          borderRadius: 6,
          background: `rgba(15, 23, 42, 0.8) url(${demo.thumbnail}) center/contain no-repeat`,
          border: '1px solid rgba(148, 163, 184, 0.15)',
        }} />
      )}

      {/* Title + description */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontSize: 15,
          fontWeight: 600,
          color: theme.colors.textPrimary,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}>
          {demo.title}
        </div>
        {demo.description && (
          <div style={{
            fontSize: 12,
            color: theme.colors.textSecondary,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            marginTop: 2,
          }}>
            {demo.description}
          </div>
        )}
      </div>

      {/* Tags */}
      {demo.tags && demo.tags.length > 0 && (
        <div style={{
          display: 'flex',
          gap: '0.3rem',
          flexShrink: 0,
        }}>
          {demo.tags.slice(0, 3).map(tag => (
            <span
              key={tag}
              style={{
                fontSize: 9,
                fontWeight: 600,
                color: theme.colors.primary,
                background: 'rgba(0, 183, 195, 0.1)',
                padding: '0.15rem 0.5rem',
                borderRadius: 8,
                border: '1px solid rgba(0, 183, 195, 0.25)',
                textTransform: 'uppercase',
                letterSpacing: '0.3px',
              }}
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Duration */}
      {demo.durationInfo && demo.durationInfo.audioOnly > 0 && (
        <div style={{
          fontSize: 12,
          fontWeight: 600,
          color: actualRuntime ? theme.colors.textPrimary : theme.colors.accent,
          flexShrink: 0,
          whiteSpace: 'nowrap',
        }}>
          {actualRuntime
            ? formatDuration(actualRuntime.elapsed)
            : formatDuration(demo.durationInfo.total)
          }
        </div>
      )}

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
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            fontSize: 14,
            color: isFavorite ? '#ef4444' : 'rgba(255, 255, 255, 0.4)',
            padding: '0.2rem',
            flexShrink: 0,
            transition: 'color 0.2s ease',
          }}
        >
          {isFavorite ? '\u2665' : '\u2661'}
        </button>
      )}

      {/* Play indicator */}
      <span style={{
        color: isHovered ? theme.colors.primary : theme.colors.textMuted,
        fontSize: 12,
        flexShrink: 0,
        transition: 'color 0.2s ease',
      }}>
        {'\u25B6'}
      </span>
    </motion.div>
  );
};
