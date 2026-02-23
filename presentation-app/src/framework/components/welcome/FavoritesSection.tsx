import React from 'react';
import { motion } from 'framer-motion';
import type { DemoMetadata } from '../../demos/types';
import { useTheme } from '../../theme/ThemeContext';

interface FavoritesSectionProps {
  demos: DemoMetadata[];
  onSelect: (id: string) => void;
  onToggleFavorite: (id: string) => void;
}

export const FavoritesSection: React.FC<FavoritesSectionProps> = ({
  demos,
  onSelect,
  onToggleFavorite,
}) => {
  const theme = useTheme();

  if (demos.length === 0) return null;

  return (
    <div style={{
      maxWidth: 1200,
      margin: '0 auto 2rem',
    }}>
      <h2 style={{
        fontSize: 16,
        fontWeight: 600,
        color: theme.colors.textPrimary,
        marginBottom: '0.75rem',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
      }}>
        <span style={{ color: '#ef4444' }}>{'\u2665'}</span>
        Favorites
      </h2>
      <div style={{
        display: 'flex',
        gap: '1rem',
        overflowX: 'auto',
        paddingBottom: '0.5rem',
      }}>
        {demos.map((demo, index) => (
          <motion.div
            key={demo.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.05 }}
            onClick={() => onSelect(demo.id)}
            style={{
              minWidth: 200,
              maxWidth: 220,
              background: 'rgba(30, 41, 59, 0.6)',
              borderRadius: 12,
              cursor: 'pointer',
              border: '1px solid rgba(148, 163, 184, 0.2)',
              overflow: 'hidden',
              transition: 'all 0.2s ease',
              flexShrink: 0,
              position: 'relative',
            }}
          >
            {demo.thumbnail && (
              <div style={{
                width: '100%',
                aspectRatio: '16 / 9',
                background: `rgba(15, 23, 42, 0.8) url(${demo.thumbnail}) center/contain no-repeat`,
                borderBottom: '1px solid rgba(148, 163, 184, 0.15)',
              }} />
            )}
            <div style={{ padding: '0.75rem' }}>
              <div style={{
                fontSize: 13,
                fontWeight: 600,
                color: theme.colors.textPrimary,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}>
                {demo.title}
              </div>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleFavorite(demo.id);
              }}
              aria-label={`Remove ${demo.title} from favorites`}
              style={{
                position: 'absolute',
                top: 6,
                right: 6,
                background: 'rgba(0, 0, 0, 0.5)',
                border: 'none',
                borderRadius: '50%',
                width: 24,
                height: 24,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                fontSize: 12,
                color: '#ef4444',
              }}
            >
              {'\u2665'}
            </button>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
