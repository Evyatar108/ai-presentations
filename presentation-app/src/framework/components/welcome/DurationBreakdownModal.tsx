import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { DemoMetadata } from '../../demos/types';
import { useTheme } from '../../theme/ThemeContext';
import { useFocusTrap } from '../../hooks/useFocusTrap';
import { HoverButton } from '../HoverButton';

interface DurationBreakdownModalProps {
  demo: DemoMetadata | undefined;
  actualRuntime?: { elapsed: number; plannedTotal: number };
  onClose: () => void;
}

const formatDuration = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

export const DurationBreakdownModal: React.FC<DurationBreakdownModalProps> = ({
  demo,
  actualRuntime,
  onClose,
}) => {
  const theme = useTheme();
  const modalRef = useRef<HTMLDivElement>(null);
  useFocusTrap(modalRef, demo !== undefined);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    if (demo) {
      window.addEventListener('keydown', onKey);
    }
    return () => window.removeEventListener('keydown', onKey);
  }, [demo, onClose]);

  const slideBreakdown = demo?.durationInfo?.slideBreakdown;

  return (
    <AnimatePresence>
      {demo && slideBreakdown && (
        <motion.div
          ref={modalRef}
          key="backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.55)',
            backdropFilter: 'blur(4px)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '2rem'
          }}
          onClick={onClose}
          aria-modal="true"
          role="dialog"
          aria-label={`${demo.title} timing details`}
        >
          <motion.div
            key="modal"
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 10 }}
            transition={{ duration: 0.2 }}
            style={{
              width: '100%',
              maxWidth: 600,
              maxHeight: '80vh',
              background: `linear-gradient(165deg, ${theme.colors.bgDeep} 0%, ${theme.colors.bgSurface} 100%)`,
              border: '1px solid rgba(148,163,184,0.25)',
              borderRadius: 16,
              boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
              position: 'relative'
            }}
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div style={{
              padding: '1rem 1.25rem',
              borderBottom: '1px solid rgba(148,163,184,0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '1rem'
            }}>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{
                  fontSize: 16,
                  fontWeight: 600,
                  color: theme.colors.textPrimary
                }}>
                  {demo.title} {'\u2013'} Timing Breakdown
                </span>
                <span style={{
                  fontSize: 12,
                  color: theme.colors.textSecondary,
                  marginTop: 2,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '2px'
                }}>
                  <span>
                    {slideBreakdown.length} slides {'\u2022'} {slideBreakdown.reduce((s, sl) => s + sl.segments.length, 0)} segments
                  </span>
                  {actualRuntime ? (
                    <span>
                      Actual {formatDuration(actualRuntime.elapsed)} vs Estimated {formatDuration(demo.durationInfo!.total)} ({(actualRuntime.elapsed - demo.durationInfo!.total).toFixed(1)}s {'\u0394'})
                    </span>
                  ) : (
                    <span>
                      Estimated total {formatDuration(demo.durationInfo!.total)}
                    </span>
                  )}
                </span>
              </div>
              <HoverButton
                onClick={onClose}
                aria-label="Close timing breakdown"
                style={{
                  background: 'transparent',
                  border: '1px solid rgba(148,163,184,0.3)',
                  color: theme.colors.textSecondary,
                  width: 34,
                  height: 34,
                  borderRadius: 8,
                  cursor: 'pointer',
                  fontSize: 18,
                  fontWeight: 600,
                  lineHeight: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.2s ease'
                }}
                hoverStyle={{
                  background: 'rgba(148,163,184,0.15)',
                }}
              >
                {'\u00D7'}
              </HoverButton>
            </div>

            {/* Body */}
            <div style={{
              padding: '1rem 1.25rem 1.5rem',
              overflowY: 'auto'
            }}>
              {slideBreakdown.map((slide, idx) => (
                <div
                  key={`modal-ch${slide.chapterIndex}-s${slide.slideIndex}`}
                  style={{
                    marginBottom: idx < slideBreakdown.length - 1 ? '1rem' : 0,
                    padding: '0.75rem 0.85rem',
                    background: 'rgba(15,23,42,0.55)',
                    borderRadius: 10,
                    border: '1px solid rgba(148,163,184,0.15)'
                  }}
                >
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '0.75rem',
                    marginBottom: '0.5rem'
                  }}>
                    <span style={{
                      fontSize: 13,
                      fontWeight: 600,
                      color: theme.colors.textPrimary,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}>
                      Ch{slide.chapterIndex}:S{slide.slideIndex} {'\u2013'} {slide.slideTitle}
                    </span>
                    <span style={{
                      fontSize: 12,
                      color: theme.colors.accent,
                      fontWeight: 600
                    }}>
                      {formatDuration(slide.totalDuration)}
                    </span>
                  </div>
                  <div style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '0.75rem',
                    fontSize: 11,
                    color: theme.colors.textSecondary,
                    marginBottom: slide.segments.length > 1 ? '0.5rem' : 0
                  }}>
                    <span>{'\uD83C\uDFB5'} {formatDuration(slide.audioDuration)} audio</span>
                    <span>{'\u23F1\uFE0F'} {formatDuration(slide.delaysDuration)} delays</span>
                    <span style={{ color: theme.colors.textMuted }}>
                      {slide.segments.length} segment{slide.segments.length !== 1 ? 's' : ''}
                    </span>
                  </div>
                  {slide.segments.length > 1 && (
                    <div style={{
                      paddingTop: '0.4rem',
                      borderTop: '1px solid rgba(148,163,184,0.12)'
                    }}>
                      <div style={{
                        fontSize: 10,
                        color: theme.colors.textMuted,
                        letterSpacing: '0.5px',
                        textTransform: 'uppercase',
                        marginBottom: '0.25rem'
                      }}>
                        Segments
                      </div>
                      {slide.segments.map((segment, sIdx) => (
                        <div
                          key={`mseg-${slide.slideIndex}-${segment.segmentIndex}`}
                          style={{
                            fontSize: 10,
                            color: theme.colors.textSecondary,
                            display: 'grid',
                            gridTemplateColumns: '2rem 1fr auto auto',
                            gap: '0.5rem',
                            padding: '0.25rem 0',
                            alignItems: 'center',
                            borderBottom: sIdx < slide.segments.length - 1
                              ? '1px solid rgba(148,163,184,0.07)'
                              : 'none'
                          }}
                        >
                          <span style={{ color: theme.colors.textMuted }}>{segment.segmentIndex}.</span>
                          <span style={{
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                          }}>
                            Segment {segment.segmentIndex}
                          </span>
                          <span style={{ color: theme.colors.textPrimary }}>
                            {formatDuration(segment.audioDuration)}
                          </span>
                          <span style={{ color: theme.colors.textMuted, fontSize: 9 }}>
                            +{segment.delayAfter.toFixed(1)}s
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}

              {/* Summary Footer */}
              <div style={{
                marginTop: '1.25rem',
                paddingTop: '1rem',
                borderTop: '1px solid rgba(148,163,184,0.2)',
                fontSize: 11,
                color: theme.colors.textSecondary,
                display: 'grid',
                gridTemplateColumns: 'auto 1fr',
                gap: '0.3rem 0.85rem'
              }}>
                <span>Total Slides:</span>
                <span style={{ color: theme.colors.textPrimary }}>{slideBreakdown.length}</span>
                <span>Total Segments:</span>
                <span style={{ color: theme.colors.textPrimary }}>
                  {slideBreakdown.reduce((sum, s) => sum + s.segments.length, 0)}
                </span>
                <span>Avg per Slide:</span>
                <span style={{ color: theme.colors.textPrimary }}>
                  {formatDuration(Math.round(demo.durationInfo!.total / slideBreakdown.length))}
                </span>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
