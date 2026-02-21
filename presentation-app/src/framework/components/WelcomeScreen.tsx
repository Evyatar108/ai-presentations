import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DemoRegistry } from '../demos/DemoRegistry';
import type { DemoMetadata } from '../demos/types';
import { useTheme } from '../theme/ThemeContext';
import { useFocusTrap } from '../hooks/useFocusTrap';
import { HoverButton } from './HoverButton';

interface WelcomeScreenProps {
  onSelectDemo: (demoId: string) => void;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onSelectDemo }) => {
  const theme = useTheme();
  const [demos, setDemos] = useState<DemoMetadata[]>([]);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [showBreakdown, setShowBreakdown] = useState<string | null>(null);
  // Last actual runtime per demo (persisted from narrated controller)
  const [actualRuntime, setActualRuntime] = useState<Record<string, { elapsed: number; plannedTotal: number }>>({});
  const breakdownModalRef = useRef<HTMLDivElement>(null);
  useFocusTrap(breakdownModalRef, showBreakdown !== null);
  
  // Close on ESC
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setShowBreakdown(null);
      }
    }
    if (showBreakdown) {
      window.addEventListener('keydown', onKey);
    }
    return () => window.removeEventListener('keydown', onKey);
  }, [showBreakdown]);

  useEffect(() => {
    // Load all demo metadata
    const allDemos = DemoRegistry.getAllMetadata().filter(d => !d.hidden);
    setDemos(allDemos);
  }, []);
  
  // Load persisted actual runtimes and validate against current planned totals
  useEffect(() => {
    if (demos.length === 0) return;
    const next: Record<string, { elapsed: number; plannedTotal: number }> = {};
    for (const demo of demos) {
      try {
        const key = `demoRuntime:${demo.id}`;
        const raw = localStorage.getItem(key);
        if (!raw) continue;
        const parsed = JSON.parse(raw);
        if (typeof parsed.elapsed !== 'number' || typeof parsed.plannedTotal !== 'number') {
          localStorage.removeItem(key);
          continue;
        }
        // Purge if planned total changed (estimation updated)
        const currentPlanned = demo.durationInfo?.total;
        if (currentPlanned != null && Math.abs(currentPlanned - parsed.plannedTotal) > 0.001) {
          localStorage.removeItem(key);
          continue;
        }
        next[demo.id] = { elapsed: parsed.elapsed, plannedTotal: parsed.plannedTotal };
      } catch (e) {
        // Corrupt entry -> remove
        localStorage.removeItem(`demoRuntime:${demo.id}`);
      }
    }
    setActualRuntime(next);
  }, [demos]);

  // Helper function to format duration
  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (demos.length === 0) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        background: `linear-gradient(135deg, ${theme.colors.bgDeep} 0%, ${theme.colors.bgSurface} 100%)`,
        fontFamily: theme.fontFamily,
        color: theme.colors.textPrimary
      }}>
        <p>Loading demos...</p>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: `linear-gradient(135deg, ${theme.colors.bgDeep} 0%, ${theme.colors.bgSurface} 100%)`,
      padding: '3rem 2rem',
      fontFamily: theme.fontFamily
    }}>
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          textAlign: 'center',
          marginBottom: '3rem'
        }}
      >
        <h1 style={{
          fontSize: 48,
          fontWeight: 700,
          color: theme.colors.textPrimary,
          marginBottom: '1rem',
          background: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.secondary})`,
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text'
        }}>
          Demo Presentations
        </h1>
        <p style={{
          fontSize: 18,
          color: theme.colors.textSecondary,
          maxWidth: 600,
          margin: '0 auto'
        }}>
          Select a presentation to view
        </p>
      </motion.header>

      {/* Demo Grid */}
      <main style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '2rem',
        maxWidth: 1200,
        margin: '0 auto'
      }}>
        {demos.map((demo, index) => {
          const slideBreakdown = demo.durationInfo?.slideBreakdown;
          
          return (
          <motion.div
            key={demo.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            onHoverStart={() => setHoveredId(demo.id)}
            onHoverEnd={() => setHoveredId(null)}
            onClick={() => onSelectDemo(demo.id)}
            style={{
              background: hoveredId === demo.id 
                ? 'linear-gradient(135deg, rgba(0, 183, 195, 0.15), rgba(0, 120, 212, 0.15))'
                : 'rgba(30, 41, 59, 0.6)',
              borderRadius: 16,
              overflow: 'hidden',
              cursor: 'pointer',
              border: '1px solid rgba(148, 163, 184, 0.2)',
              transform: hoveredId === demo.id ? 'scale(1.02)' : 'scale(1)',
              boxShadow: hoveredId === demo.id 
                ? '0 20px 40px rgba(0, 183, 195, 0.3)'
                : '0 4px 12px rgba(0, 0, 0, 0.3)',
              transition: 'all 0.3s ease'
            }}
          >
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

              {/* Duration Display with actual runtime if available */}
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
                    {actualRuntime[demo.id] ? (
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
                          <span>🟢</span>
                          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            Actual {formatDuration(actualRuntime[demo.id].elapsed)} runtime
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
                          <span style={{ color: theme.colors.textMuted }}>Estimated {formatDuration(demo.durationInfo.total)}</span>
                          <span style={{ color: theme.colors.textMuted }}>
                            ({(actualRuntime[demo.id].elapsed - demo.durationInfo.total).toFixed(1)}s Δ)
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
                        <span>🕒</span>
                        <span style={{ color: theme.colors.textPrimary }}>
                          Estimated {formatDuration(demo.durationInfo.total)} total
                        </span>
                      </div>
                    )}
                  </div>
                  {slideBreakdown && slideBreakdown.length > 0 && (
                    <HoverButton
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowBreakdown(demo.id);
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
                color: hoveredId === demo.id ? theme.colors.primary : theme.colors.textMuted,
                fontSize: 14,
                fontWeight: 600,
                transition: 'color 0.3s ease'
              }}>
                <span>▶</span>
                <span>Play Presentation</span>
              </div>
            </div>
          </motion.div>
        );
        })}
      </main>

      {/* Duration Breakdown Modal */}
      <AnimatePresence>
        {showBreakdown && (() => {
          const demo = demos.find(d => d.id === showBreakdown);
          const slideBreakdown = demo?.durationInfo?.slideBreakdown;
          if (!demo || !slideBreakdown) return null;
          return (
            <motion.div
              ref={breakdownModalRef}
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
              onClick={() => setShowBreakdown(null)}
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
                      {demo.title} – Timing Breakdown
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
                        {slideBreakdown.length} slides • {slideBreakdown.reduce((s, sl) => s + sl.segments.length, 0)} segments
                      </span>
                      {actualRuntime[demo.id] ? (
                        <span>
                          Actual {formatDuration(actualRuntime[demo.id].elapsed)} vs Estimated {formatDuration(demo.durationInfo!.total)} ({(actualRuntime[demo.id].elapsed - demo.durationInfo!.total).toFixed(1)}s Δ)
                        </span>
                      ) : (
                        <span>
                          Estimated total {formatDuration(demo.durationInfo!.total)}
                        </span>
                      )}
                    </span>
                  </div>
                  <HoverButton
                    onClick={() => setShowBreakdown(null)}
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
                    ×
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
                          Ch{slide.chapterIndex}:S{slide.slideIndex} – {slide.slideTitle}
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
                        <span>🎵 {formatDuration(slide.audioDuration)} audio</span>
                        <span>⏱️ {formatDuration(slide.delaysDuration)} delays</span>
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
                              <span style={{ color: theme.colors.textMuted }}>{segment.segmentIndex + 1}.</span>
                              <span style={{
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap'
                              }}>
                                Segment {segment.segmentIndex + 1}
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
          );
        })()}
      </AnimatePresence>

      {/* Footer */}
      <motion.footer
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        style={{
          textAlign: 'center',
          marginTop: '4rem',
          color: theme.colors.textMuted,
          fontSize: 14
        }}
      >
        <p>Use keyboard navigation once in presentation mode</p>
      </motion.footer>
    </div>
  );
};