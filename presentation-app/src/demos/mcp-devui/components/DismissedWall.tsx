import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useReducedMotion, useTheme } from '@framework';
import { TelemetryWall } from './TelemetryWall';

interface DismissedWallProps {
  /** Height of the compact wall in pixels (default 140) */
  height?: number;
  /** Number of telemetry rows to show (default 12) */
  rowCount?: number;
  /** Whether the wall has been dismissed (default true for static/manual usage) */
  dismissed?: boolean;
}

/**
 * A compact TelemetryWall that transitions from alive (scrolling, full opacity)
 * to dismissed (paused, dimmed, with an animated diagonal strikethrough).
 *
 * Drive the `dismissed` prop with `useMarker()` for narration-synced animation.
 */
export const DismissedWall: React.FC<DismissedWallProps> = ({
  height = 140,
  rowCount = 12,
  dismissed = true,
}) => {
  const { reduced } = useReducedMotion();
  const theme = useTheme();

  return (
    <div style={{
      position: 'relative',
      width: 420,
      height,
      borderRadius: 10,
      overflow: 'hidden',
    }}>
      {/* The telemetry wall — scrolls when alive, pauses when dismissed */}
      <motion.div
        animate={{ opacity: dismissed ? 0.45 : 1 }}
        transition={reduced ? { duration: 0 } : { duration: 0.6 }}
        style={{ transform: 'scale(0.85)', transformOrigin: 'top left', width: '118%', height: '118%' }}
      >
        <TelemetryWall rowCount={rowCount} speed={18} paused={dismissed} />
      </motion.div>

      {/* Dark overlay — fades in on dismiss */}
      <AnimatePresence>
        {dismissed && (
          <motion.div
            initial={reduced ? { opacity: 0.55 } : { opacity: 0 }}
            animate={{ opacity: 0.55 }}
            exit={{ opacity: 0 }}
            transition={reduced ? { duration: 0 } : { duration: 0.5 }}
            style={{
              position: 'absolute',
              inset: 0,
              background: theme.colors.bgBase,
              pointerEvents: 'none',
            }}
          />
        )}
      </AnimatePresence>

      {/* Animated diagonal strikethrough — draws on dismiss */}
      <svg
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
        }}
      >
        <motion.line
          x1="8%"
          y1="85%"
          x2="92%"
          y2="15%"
          stroke={theme.colors.error}
          strokeWidth={3}
          strokeLinecap="round"
          animate={{
            pathLength: dismissed ? 1 : 0,
            opacity: dismissed ? 0.8 : 0,
          }}
          transition={
            reduced
              ? { duration: 0 }
              : {
                  pathLength: { duration: 0.5, ease: 'easeOut' },
                  opacity: { duration: 0.15 },
                }
          }
        />
      </svg>
    </div>
  );
};
