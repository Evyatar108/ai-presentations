import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  useReducedMotion,
  useSegmentedAnimation,
  useTheme,
  defineSlide,
  VideoPlayer,
  SlideContainer,
  ContentCard,
  GradientHighlightBox,
  SlideTitle,
  typography,
  gradientBox,
  fadeUp,
  fadeLeft,
  fadeRight,
  scaleIn,
} from '@framework';

/**
 * Chapter 1: What is Meeting Highlights
 * 3 slides explaining the product, access method, and user value
 */

/**
 * Chapter 1, Slide 1 - What is Meeting Highlights
 */
const Ch1_S1_WhatIsMeetingHighlightsComponent: React.FC = () => {
    const { reduced } = useReducedMotion();
    const { isSegmentVisible, isOnSegment } = useSegmentedAnimation();
    const theme = useTheme();

    return (
      <SlideContainer maxWidth={900}>
        <div style={{ textAlign: 'center' }}>
          {/* Title and subtitle - always visible */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: reduced ? 0.2 : 0.6 }}
          >
            <h1 style={{ ...typography.h1, fontSize: 48, marginBottom: '0.5rem' }}>
              Meeting Highlights
            </h1>
            <p style={{ ...typography.caption, fontSize: 20, marginBottom: '0.5rem' }}>
              AI-generated short video recaps for meetings
            </p>
          </motion.div>

          {/* Thumbnail image - large in segment 0, small afterwards */}
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            marginTop: '0.5rem',
            marginBottom: isOnSegment(0) ? '2rem' : '0.5rem',
            transition: reduced ? 'none' : 'margin 0.6s ease'
          }}>
            <motion.img
              src="/images/meeting-highlights/meeting_highlights_thumbnail.jpeg"
              alt="Meeting Highlights example"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{
                opacity: isOnSegment(0) ? 1 : 0.5,
                scale: 1,
                width: isOnSegment(0) ? '100%' : '35%'
              }}
              transition={{ duration: reduced ? 0.3 : 0.6, ease: 'easeInOut' }}
              style={{
                maxWidth: '600px',
                borderRadius: '12px',
                boxShadow: isOnSegment(0) ? '0 8px 24px rgba(0, 0, 0, 0.4)' : 'none',
                border: `1px solid ${theme.colors.bgBorder}`,
                display: 'block'
              }}
            />
          </div>

          <AnimatePresence>
            {isSegmentVisible(1) && (
              <>
                <motion.div
                  variants={fadeLeft(reduced)}
                  initial="hidden"
                  animate="visible"
                  style={{ display: 'flex', justifyContent: 'center', gap: '2rem', marginBottom: '1rem' }}
                >
                  <div style={{ ...gradientBox, padding: '1.5rem', flex: 1, maxWidth: 240 }}>
                    <div style={{ color: '#fff', fontSize: 16, fontWeight: 600 }}>
                      AI-Generated<br/>Summaries
                    </div>
                  </div>
                  <div style={{
                    background: `linear-gradient(135deg, ${theme.colors.secondary}, ${theme.colors.primary})`,
                    borderRadius: 12,
                    padding: '1.5rem',
                    flex: 1,
                    maxWidth: 240
                  }}>
                    <div style={{ color: '#fff', fontSize: 16, fontWeight: 600 }}>
                      Authentic<br/>Video Clips
                    </div>
                  </div>
                </motion.div>

                <motion.p
                  variants={fadeUp(reduced)}
                  initial="hidden"
                  animate="visible"
                  transition={{ delay: reduced ? 0 : 0.4 }}
                  style={{ ...typography.caption, fontSize: 16, marginBottom: '2rem' }}
                >
                  Preserves original tone, reactions, and discussion flow
                </motion.p>
              </>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {isSegmentVisible(2) && (
              <motion.div
                initial={{ opacity: 0, y: 30, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{
                  duration: reduced ? 0.3 : 0.8,
                  type: 'spring',
                  bounce: 0.4
                }}
              >
                <GradientHighlightBox reduced={reduced}>
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{
                      duration: reduced ? 0.2 : 0.5,
                      delay: reduced ? 0 : 0.3
                    }}
                    style={{ color: theme.colors.primary, fontSize: 20, fontWeight: 600, margin: 0 }}
                  >
                    Catch up on missed meetings without watching hour-long recordings
                  </motion.p>
                </GradientHighlightBox>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </SlideContainer>
    );
};

export const Ch1_S1_WhatIsMeetingHighlights = defineSlide({
  metadata: {
    chapter: 1,
    slide: 1,
    title: "What is Meeting Highlights",
    srtFilePath: "highlights_demo/chapters/c1/s1_what_is_meeting_highlights.srt",
    audioSegments: [
      {
        id: "intro",
        srtSegmentNumber: 1,
        visualDescription: "Title slide \"Meeting Highlights\""
      },
      {
        id: "combination",
        srtSegmentNumber: 2,
        visualDescription: "Split screen showing AI summaries + authentic video clips"
      },
      {
        id: "problem",
        srtSegmentNumber: 3,
        visualDescription: "Value prop highlight box appears"
      }
    ]
  },
  component: Ch1_S1_WhatIsMeetingHighlightsComponent
});

/**
 * Chapter 1, Slide 2 - How to Access via BizChat
 */
const Ch1_S2_HowToAccessComponent: React.FC = () => {
    const { reduced } = useReducedMotion();
    const { isSegmentVisible } = useSegmentedAnimation();
    const theme = useTheme();

    return (
      <SlideContainer maxWidth={1200}>
        <AnimatePresence>
          {isSegmentVisible(0) && (
            <SlideTitle reduced={reduced}>
              How to Access Meeting Highlights via BizChat
            </SlideTitle>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {isSegmentVisible(1) && (
            <motion.div
              variants={scaleIn(reduced)}
              initial="hidden"
              animate="visible"
              style={{
                display: 'grid',
                gridTemplateColumns: '1.2fr 1fr',
                gap: '2rem',
                alignItems: 'start'
              }}
            >
              {/* Left column: Video */}
              <ContentCard style={{ padding: '0.5rem' }}>
                <p style={{ ...typography.body, fontSize: 18, marginBottom: '1.5rem', marginTop: 0 }}>
                  Open <strong style={{ color: theme.colors.primary }}>BizChat</strong> and ask it to recap a specific meeting
                </p>
                <div style={{
                  background: theme.colors.bgDeep,
                  borderRadius: 12,
                  padding: '0.5rem'
                }}>
                  <VideoPlayer
                    videoPath="/videos/meeting-highlights/meeting_highlights_usage_in_bizchat.mp4"
                    isPlaying={isSegmentVisible(1)}
                    freezeOnEnd={true}
                  />
                </div>
              </ContentCard>

              {/* Right column: Instructions */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <AnimatePresence>
                  {isSegmentVisible(2) && (
                    <motion.div
                      variants={fadeRight(reduced)}
                      initial="hidden"
                      animate="visible"
                    >
                      <ContentCard style={{ padding: '1.5rem' }}>
                        <p style={{ ...typography.body, fontSize: 15, margin: 0 }}>
                          💡 <em>Tip:</em> Use <strong style={{ color: theme.colors.primary }}>/</strong> (slash) for CIQ (Contextual Instant Query) - an easy way to reference meetings
                        </p>
                      </ContentCard>
                    </motion.div>
                  )}
                </AnimatePresence>

                <AnimatePresence>
                  {isSegmentVisible(3) && (
                    <motion.div
                      variants={fadeRight(reduced)}
                      initial="hidden"
                      animate="visible"
                    >
                      <ContentCard style={{ padding: '1.5rem' }}>
                        <p style={{ ...typography.body, fontSize: 15, margin: 0 }}>
                          📋 Select and search for meetings from the menu
                        </p>
                      </ContentCard>
                    </motion.div>
                  )}
                </AnimatePresence>

                <AnimatePresence>
                  {isSegmentVisible(4) && (
                    <motion.div
                      variants={fadeRight(reduced)}
                      initial="hidden"
                      animate="visible"
                    >
                      <GradientHighlightBox reduced={reduced} style={{ padding: '1.5rem' }}>
                        <p style={{ color: theme.colors.textPrimary, fontSize: 15, margin: 0 }}>
                          🎬 Video player with highlights appears at the bottom
                        </p>
                      </GradientHighlightBox>
                    </motion.div>
                  )}
                </AnimatePresence>

                <AnimatePresence>
                  {isSegmentVisible(5) && (
                    <motion.div
                      variants={fadeRight(reduced)}
                      initial="hidden"
                      animate="visible"
                      style={{
                        background: '#1e40af',
                        borderRadius: 12,
                        padding: '1.25rem',
                        border: '1px solid #60a5fa'
                      }}
                    >
                      <p style={{ color: '#dbeafe', fontSize: 14, margin: 0 }}>
                        💡 For meeting series: Click the arrow on the right side of the series to open the list of instances, then select a recorded instance
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </SlideContainer>
    );
};

export const Ch1_S2_HowToAccess = defineSlide({
  metadata: {
    chapter: 1,
    slide: 2,
    title: "How to Access via BizChat",
    srtFilePath: "highlights_demo/chapters/c1/s2_how_to_access.srt",
    audioSegments: [
      {
        id: "intro",
        srtSegmentNumber: 1,
        visualDescription: "BizChat interface screenshot"
      },
      {
        id: "bizchat",
        srtSegmentNumber: 2,
        visualDescription: "Embedded MP4 demo video showing BizChat interaction"
      },
      {
        id: "ciq",
        srtSegmentNumber: 3,
        visualDescription: "Demo continues - showing \"/\" menu for CIQ"
      },
      {
        id: "select",
        srtSegmentNumber: 4,
        visualDescription: "Demo shows meeting selection from menu"
      },
      {
        id: "player",
        srtSegmentNumber: 5,
        visualDescription: "Demo shows BizChat response with video player at bottom"
      },
      {
        id: "note",
        srtSegmentNumber: 6,
        visualDescription: "Note callout appears with info icon"
      }
    ]
  },
  component: Ch1_S2_HowToAccessComponent
});

/**
 * Chapter 1, Slide 3 - How to Access via SharePoint
 */
const Ch1_S3_HowToAccessSharePointComponent: React.FC = () => {
    const { reduced } = useReducedMotion();
    const { isSegmentVisible } = useSegmentedAnimation();
    const theme = useTheme();

    return (
      <SlideContainer maxWidth={1200}>
        <AnimatePresence>
          {isSegmentVisible(0) && (
            <SlideTitle reduced={reduced}>
              How to Access Meeting Highlights via SharePoint
            </SlideTitle>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {isSegmentVisible(1) && (
            <motion.div
              variants={scaleIn(reduced)}
              initial="hidden"
              animate="visible"
              style={{
                display: 'grid',
                gridTemplateColumns: '1.2fr 1fr',
                gap: '2rem',
                alignItems: 'start'
              }}
            >
              {/* Left column: Video */}
              <ContentCard style={{ padding: '0.5rem' }}>
                <p style={{ ...typography.body, fontSize: 18, marginBottom: '1.5rem', marginTop: 0 }}>
                  Access highlights directly from <strong style={{ color: theme.colors.primary }}>SharePoint</strong> meeting recap page
                </p>
                <div style={{
                  background: theme.colors.bgDeep,
                  borderRadius: 12,
                  padding: '0.5rem'
                }}>
                  <VideoPlayer
                    videoPath="/videos/meeting-highlights/meeting_highlights_usage_in_sharepoint.mp4"
                    isPlaying={isSegmentVisible(1)}
                    freezeOnEnd={true}
                  />
                </div>
              </ContentCard>

              {/* Right column: Instructions */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <AnimatePresence>
                  {isSegmentVisible(2) && (
                    <motion.div
                      variants={fadeRight(reduced)}
                      initial="hidden"
                      animate="visible"
                    >
                      <ContentCard style={{ padding: '1.5rem' }}>
                        <p style={{ ...typography.body, fontSize: 15, margin: 0 }}>
                          📝 Go to meeting recording recap page via recording link or Recap tab
                        </p>
                      </ContentCard>
                    </motion.div>
                  )}
                </AnimatePresence>

                <AnimatePresence>
                  {isSegmentVisible(3) && (
                    <motion.div
                      variants={fadeRight(reduced)}
                      initial="hidden"
                      animate="visible"
                    >
                      <ContentCard style={{ padding: '1.5rem' }}>
                        <p style={{ ...typography.body, fontSize: 15, margin: 0 }}>
                          🌐 Click <strong style={{ color: theme.colors.primary }}>"Watch in browser"</strong> button
                        </p>
                      </ContentCard>
                    </motion.div>
                  )}
                </AnimatePresence>

                <AnimatePresence>
                  {isSegmentVisible(4) && (
                    <motion.div
                      variants={fadeRight(reduced)}
                      initial="hidden"
                      animate="visible"
                    >
                      <GradientHighlightBox reduced={reduced} style={{ padding: '1.5rem' }}>
                        <p style={{ color: theme.colors.textPrimary, fontSize: 15, margin: 0 }}>
                          🎬 Click <strong>"Play highlights"</strong> button to view
                        </p>
                      </GradientHighlightBox>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </SlideContainer>
    );
};

export const Ch1_S3_HowToAccessSharePoint = defineSlide({
  metadata: {
    chapter: 1,
    slide: 3,
    title: "How to Access via SharePoint",
    srtFilePath: "highlights_demo/chapters/c1/s3_how_to_access_sharepoint.srt",
    audioSegments: [
      {
        id: "intro",
        srtSegmentNumber: 1,
        visualDescription: "SharePoint interface screenshot"
      },
      {
        id: "video",
        srtSegmentNumber: 2,
        visualDescription: "Video player appears showing SharePoint demo"
      },
      {
        id: "sharepoint",
        srtSegmentNumber: 3,
        visualDescription: "First instruction card appears"
      },
      {
        id: "browser",
        srtSegmentNumber: 4,
        visualDescription: "Demo shows 'Watch in browser' button"
      },
      {
        id: "play",
        srtSegmentNumber: 5,
        visualDescription: "Demo shows 'Play highlights' button"
      }
    ]
  },
  component: Ch1_S3_HowToAccessSharePointComponent
});
