import React, { useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { DemoMetadata } from '../../demos/types';
import { useTheme } from '../../theme/ThemeContext';
import { formatMMSS } from '../../utils/formatTime';
import { useFocusTrap } from '../../hooks/useFocusTrap';

export interface StartOverlayProps {
  demoMetadata: DemoMetadata;
  slideCount: number;
  error: string | null;
  hideInterface: boolean;
  onHideInterfaceChange: (value: boolean) => void;
  showRuntimeTimerOption: boolean;
  onShowRuntimeTimerOptionChange: (value: boolean) => void;
  finalElapsedSeconds: number | null;
  visible: boolean;
  onStartNarrated: () => void;
  onStartManual: () => void;
}

export const StartOverlay: React.FC<StartOverlayProps> = ({
  demoMetadata,
  slideCount,
  error,
  hideInterface,
  onHideInterfaceChange,
  showRuntimeTimerOption,
  onShowRuntimeTimerOptionChange,
  finalElapsedSeconds,
  visible,
  onStartNarrated,
  onStartManual,
}) => {
  const theme = useTheme();
  const overlayRef = useRef<HTMLDivElement>(null);
  useFocusTrap(overlayRef, visible);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          ref={overlayRef}
          role="dialog"
          aria-label="Presentation start options"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.9)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            fontFamily: theme.fontFamily,
          }}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2 }}
            style={{
              textAlign: 'center',
              maxWidth: 500,
              padding: '2rem',
            }}
          >
            <h1 style={{ color: theme.colors.textPrimary, marginBottom: '1rem', fontSize: 32 }}>
              {demoMetadata.title}
            </h1>
            <p style={{ color: theme.colors.textSecondary, marginBottom: '2rem', fontSize: 16 }}>
              This presentation will auto-advance through {slideCount} slides with narration.
              {demoMetadata.description && (
                <>
                  <br />
                  {demoMetadata.description}
                </>
              )}
            </p>

            {error && (
              <p style={{ color: theme.colors.error, marginBottom: '1rem', fontSize: 14 }}>
                {error}
              </p>
            )}

            {/* Final elapsed summary if available (from previous run) */}
            {showRuntimeTimerOption && finalElapsedSeconds != null && (
              <div style={{
                marginBottom: '1rem',
                fontSize: 13,
                color: theme.colors.textSecondary,
                background: 'rgba(255,255,255,0.05)',
                padding: '0.5rem 0.75rem',
                borderRadius: 8,
                fontFamily: theme.fontFamily,
              }}>
                <strong style={{ color: theme.colors.textPrimary }}>Last Run Timing:</strong>{' '}
                Elapsed {formatMMSS(finalElapsedSeconds)}
                {demoMetadata.durationInfo?.total && (
                  <>
                    {' / '}Planned {formatMMSS(demoMetadata.durationInfo.total)}{' '}
                    ({(finalElapsedSeconds - demoMetadata.durationInfo.total).toFixed(1)}s Δ)
                  </>
                )}
              </div>
            )}

            {/* Options */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' }}>
              {/* Row 1 */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '1.25rem',
                flexWrap: 'wrap',
              }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: 14, color: theme.colors.textSecondary }}>
                  <input
                    type="checkbox"
                    checked={hideInterface}
                    onChange={(e) => onHideInterfaceChange(e.target.checked)}
                    style={{ width: 18, height: 18, cursor: 'pointer' }}
                  />
                  <span>Hide interface (recording)</span>
                </label>

                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: 14, color: theme.colors.textSecondary }}>
                  <input
                    type="checkbox"
                    checked={showRuntimeTimerOption}
                    onChange={(e) => onShowRuntimeTimerOptionChange(e.target.checked)}
                    style={{ width: 18, height: 18, cursor: 'pointer' }}
                  />
                  <span>Show runtime timer (narrated)</span>
                </label>
              </div>
              {showRuntimeTimerOption && demoMetadata.durationInfo?.total && (
                <div style={{
                  fontSize: 12,
                  color: theme.colors.textMuted,
                  textAlign: 'center',
                  maxWidth: 480,
                  margin: '0 auto',
                  lineHeight: 1.4,
                }}>
                  Timer will display actual elapsed vs expected total {formatMMSS(demoMetadata.durationInfo.total)} to validate calculated timing.
                </div>
              )}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', alignItems: 'center' }}>
              <button
                onClick={onStartNarrated}
                style={{
                  background: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.secondary})`,
                  color: '#fff',
                  border: 'none',
                  borderRadius: 12,
                  padding: '1rem 2rem',
                  fontSize: 18,
                  fontWeight: 600,
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(0, 183, 195, 0.3)',
                }}
              >
                <span aria-hidden="true">▶</span> Narrated
              </button>

              <button
                onClick={onStartManual}
                style={{
                  background: 'transparent',
                  color: theme.colors.primary,
                  border: `2px solid ${theme.colors.primary}`,
                  borderRadius: 12,
                  padding: '1rem 1.5rem',
                  fontSize: 16,
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                <span aria-hidden="true">⌨</span> Manual
              </button>
            </div>

            <p style={{ color: theme.colors.textMuted, marginTop: '1.5rem', fontSize: 12 }}>
              Narrated: Auto-advance | Manual: Arrow keys with audio toggle
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
