import React, { useEffect } from 'react';
import { motion, AnimatePresence, useMotionValue, useSpring } from 'framer-motion';
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

  // Imperative pathLength animation — required because this component mounts
  // inside a Reveal (animated parent). Declarative animate={{ pathLength }}
  // breaks in that context (see CLAUDE.md SVG pathLength note).
  const pathLength = useMotionValue(0);
  const springPath = useSpring(pathLength, { stiffness: 200, damping: 30 });
  const lineOpacity = useMotionValue(0);

  useEffect(() => {
    if (reduced) {
      pathLength.jump(dismissed ? 1 : 0);
      lineOpacity.jump(dismissed ? 0.8 : 0);
    } else {
      pathLength.set(dismissed ? 1 : 0);
      lineOpacity.set(dismissed ? 0.8 : 0);
    }
  }, [dismissed, reduced, pathLength, lineOpacity]);

  return (
    <div style={{
      position: 'relative',
      width: 420,
      height,
      borderRadius: 10,
      overflow: 'hidden',
    }}>
      {/* The telemetry wall — scrolls when alive, pauses when dismissed.
          Uses CSS transition (not motion.div) to avoid opacity conflicts
          with the parent Reveal fadeIn animation. */}
      <div
        style={{
          opacity: dismissed ? 0.45 : 1,
          transition: reduced ? 'none' : 'opacity 0.6s',
          transform: 'scale(0.85)',
          transformOrigin: 'top left',
          width: '118%',
          height: '118%',
        }}
      >
        <TelemetryWall rowCount={rowCount} speed={18} />
      </div>

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
          style={{ pathLength: springPath, opacity: lineOpacity }}
        />
      </svg>
    </div>
  );
};
