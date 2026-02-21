import React from 'react';
import { motion } from 'framer-motion';
import type { SlideMetadata } from '../../slides/SlideMetadata';
import type { DemoMetadata } from '../../demos/types';
import { useTheme } from '../../theme/ThemeContext';
import { formatMMSS, deltaColor } from '../../utils/formatTime';

export interface ProgressBarProps {
  currentIndex: number;
  totalSlides: number;
  currentSlideMetadata: SlideMetadata;
  demoMetadata: DemoMetadata;
  isPlaying: boolean;
  isManualMode: boolean;
  // Timer
  showRuntimeTimer: boolean;
  elapsedMs: number;
  // Manual controls
  audioEnabled: boolean;
  onAudioToggle: () => void;
  autoAdvanceOnAudioEnd: boolean;
  onAutoAdvanceToggle: (value: boolean) => void;
  // Edit / restart
  showEditButton: boolean;
  onEdit: () => void;
  onRestart: () => void;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  currentIndex,
  totalSlides,
  currentSlideMetadata,
  demoMetadata,
  isPlaying,
  isManualMode,
  showRuntimeTimer,
  elapsedMs,
  audioEnabled,
  onAudioToggle,
  autoAdvanceOnAudioEnd,
  onAutoAdvanceToggle,
  showEditButton,
  onEdit,
  onRestart,
}) => {
  const theme = useTheme();
  const plannedTotal = demoMetadata.durationInfo?.total;

  return (
    <motion.div
      data-testid="progress-bar"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      style={{
        position: 'fixed',
        top: 80,
        left: '50%',
        transform: 'translateX(-50%)',
        background: theme.colors.bgOverlay,
        color: theme.colors.textPrimary,
        padding: '0.5rem 1rem',
        borderRadius: 8,
        fontSize: 12,
        zIndex: 1000,
        display: 'flex',
        gap: '1rem',
        alignItems: 'center',
      }}
    >
      <span>
        Slide {currentIndex + 1} of {totalSlides} (Ch{currentSlideMetadata.chapter}:S{currentSlideMetadata.slide})
      </span>

      {/* Runtime timer (only in narrated mode & enabled) */}
      {isPlaying && showRuntimeTimer && (
        <span style={{ fontFamily: 'monospace', fontSize: 12, background: 'rgba(255,255,255,0.05)', padding: '0.25rem 0.5rem', borderRadius: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
          <span>{formatMMSS(elapsedMs / 1000)} elapsed</span>
          {plannedTotal && (
            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <span style={{ opacity: 0.5 }}>/</span>
              <span>{formatMMSS(plannedTotal)} planned</span>
              <span style={{ opacity: 0.5 }}>|</span>
              {(() => {
                const delta = (elapsedMs / 1000) - plannedTotal;
                return (
                  <span style={{ color: deltaColor(delta, theme) }}>
                    {delta >= 0 ? '+' : ''}{delta.toFixed(1)}s Δ
                  </span>
                );
              })()}
            </span>
          )}
        </span>
      )}

      {/* Audio toggle button (only in manual mode) */}
      {isManualMode && (
        <button
          onClick={onAudioToggle}
          aria-label={audioEnabled ? 'Mute audio' : 'Enable audio'}
          style={{
            background: 'transparent',
            border: `1px solid ${theme.colors.borderSubtle}`,
            color: audioEnabled ? theme.colors.primary : theme.colors.textMuted,
            borderRadius: 6,
            padding: '0.25rem 0.75rem',
            fontSize: 11,
            cursor: 'pointer',
            fontWeight: 600,
            transition: 'all 0.2s ease',
          }}
        >
          <span aria-hidden="true">{audioEnabled ? '🔊' : '🔇'}</span> {audioEnabled ? 'Audio' : 'Muted'}
        </button>
      )}

      {/* Auto-advance toggle (only in manual mode with audio enabled) */}
      {isManualMode && audioEnabled && (
        <label
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            cursor: 'pointer',
            fontSize: 11,
            color: theme.colors.textSecondary,
          }}
        >
          <input
            type="checkbox"
            checked={autoAdvanceOnAudioEnd}
            onChange={(e) => onAutoAdvanceToggle(e.target.checked)}
            style={{
              width: 14,
              height: 14,
              cursor: 'pointer',
            }}
          />
          Auto-advance
        </label>
      )}

      {/* Edit button (only in manual mode with segments) */}
      {showEditButton && (
        <button
          onClick={onEdit}
          aria-label="Edit narration"
          style={{
            background: 'transparent',
            border: `1px solid ${theme.colors.borderSubtle}`,
            color: theme.colors.textPrimary,
            borderRadius: 6,
            padding: '0.25rem 0.75rem',
            fontSize: 11,
            cursor: 'pointer',
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = theme.colors.primary;
            e.currentTarget.style.color = theme.colors.primary;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = theme.colors.borderSubtle;
            e.currentTarget.style.color = theme.colors.textPrimary;
          }}
        >
          <span aria-hidden="true">✏️</span> Edit
        </button>
      )}

      <button
        onClick={onRestart}
        aria-label="Restart presentation"
        style={{
          background: 'transparent',
          border: `1px solid ${theme.colors.borderSubtle}`,
          color: theme.colors.textPrimary,
          borderRadius: 6,
          padding: '0.25rem 0.75rem',
          fontSize: 11,
          cursor: 'pointer',
        }}
      >
        <span aria-hidden="true">↻</span> Restart
      </button>
    </motion.div>
  );
};
