import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useReducedMotion } from '../../accessibility/ReducedMotion';
import { useSegmentedAnimation } from '../../contexts/SegmentContext';
import { VideoPlayer } from '../../components/VideoPlayer';
import { SlideComponentWithMetadata } from '../SlideMetadata';
import { SlideContainer, ContentCard, GradientHighlightBox, SlideTitle, BenefitCard } from '../SlideLayouts';
import { typography, gradientBox } from '../SlideStyles';
import { fadeUp, fadeLeft, fadeRight, scaleIn } from '../AnimationVariants';

/**
 * Chapter 1: What is Meeting Highlights
 * 3 slides explaining the product, access method, and user value
 */

/**
 * Chapter 1, Slide 1 - What is Meeting Highlights
 */
export const Ch1_S1_WhatIsMeetingHighlights: SlideComponentWithMetadata = () => {
  const { reduced } = useReducedMotion();
  const { isSegmentVisible, isOnSegment } = useSegmentedAnimation();

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
          marginBottom: isOnSegment(0) ? '2rem' : '0.5rem'
        }}>
          <motion.img
            key={`image-${isOnSegment(0) ? 'large' : 'small'}`}
            src="/images/meeting_highlights_thumbnail.jpeg"
            alt="Meeting Highlights example"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: reduced ? 0.3 : 0.6 }}
            style={{
              width: isOnSegment(0) ? '100%' : '35%',
              maxWidth: '600px',
              borderRadius: '12px',
              boxShadow: isOnSegment(0) ? '0 8px 24px rgba(0, 0, 0, 0.4)' : 'none',
              border: '1px solid #334155',
              display: 'block',
              opacity: isOnSegment(0) ? 1 : 0.5
            }}
          />
        </div>

        <AnimatePresence>
          {isSegmentVisible(1) && (
            <motion.div
              variants={scaleIn(reduced)}
              initial="hidden"
              animate="visible"
              transition={{ delay: reduced ? 0 : 0.2 }}
            >
              <ContentCard style={{ marginBottom: '2rem' }}>
                <p style={{ ...typography.body, fontSize: 18, margin: 0 }}>
                  Automatically generates a <strong style={{ color: '#00B7C3' }}>2-3 minute video recap</strong> of your meeting
                </p>
              </ContentCard>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {isSegmentVisible(2) && (
            <motion.div
              variants={fadeLeft(reduced)}
              initial="hidden"
              animate="visible"
              style={{ display: 'flex', justifyContent: 'center', gap: '2rem', marginBottom: '2rem' }}
            >
              <div style={{ ...gradientBox, padding: '1.5rem', flex: 1, maxWidth: 200 }}>
                <div style={{ color: '#fff', fontSize: 16, fontWeight: 600 }}>
                  AI-Generated<br/>Summaries
                </div>
              </div>
              <div style={{
                background: 'linear-gradient(135deg, #0078D4, #00B7C3)',
                borderRadius: 12,
                padding: '1.5rem',
                flex: 1,
                maxWidth: 200
              }}>
                <div style={{ color: '#fff', fontSize: 16, fontWeight: 600 }}>
                  Authentic<br/>Video Clips
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {isSegmentVisible(3) && (
            <motion.p
              variants={fadeUp(reduced)}
              initial="hidden"
              animate="visible"
              style={{ ...typography.caption, fontSize: 16, marginBottom: '2rem' }}
            >
              Preserves original tone, reactions, and discussion flow
            </motion.p>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {isSegmentVisible(4) && (
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
                  style={{ color: '#00B7C3', fontSize: 20, fontWeight: 600, margin: 0 }}
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

Ch1_S1_WhatIsMeetingHighlights.metadata = {
  chapter: 1,
  slide: 1,
  title: "What is Meeting Highlights",
  srtFilePath: "highlights_demo/chapters/c1/s1_what_is_meeting_highlights.srt",
  audioSegments: [
    {
      id: "intro",
      audioFilePath: "/audio/c1/s1_segment_01_intro.wav",
      srtSegmentNumber: 1,
      visualDescription: "Title slide \"Meeting Highlights\"",
      narrationText: "Meeting Highlights is a new feature that delivers AI-generated short video recaps of your meetings."
    },
    {
      id: "ai_generation",
      audioFilePath: "/audio/c1/s1_segment_02_ai_generation.wav",
      srtSegmentNumber: 2,
      visualDescription: "Animation showing meeting recording transforming into short highlight video",
      narrationText: "It uses AI to automatically generate a short highlights video, typically 2 to 3 minutes long."
    },
    {
      id: "combination",
      audioFilePath: "/audio/c1/s1_segment_03_combination.wav",
      srtSegmentNumber: 3,
      visualDescription: "Split screen showing hour-long meeting vs 3-minute highlights",
      narrationText: "The feature combines AI-generated voiceover summaries with authentic video snippets from the actual meeting."
    },
    {
      id: "preservation",
      audioFilePath: "/audio/c1/s1_segment_04_preservation.wav",
      srtSegmentNumber: 4,
      visualDescription: "Example clips showing speakers, reactions, screen shares",
      narrationText: "This preserves the original tone, reactions, and flow of the discussion."
    },
    {
      id: "problem",
      audioFilePath: "/audio/c1/s1_segment_05_problem.wav",
      srtSegmentNumber: 5,
      visualDescription: "Pain point icons: clock (time), search (finding content), mood (missing context)",
      narrationText: "It solves a critical problem: catching up on missed meetings without watching hour-long recordings or reading lengthy transcripts."
    }
  ]
};

/**
 * Chapter 1, Slide 2 - How to Access via BizChat
 */
export const Ch1_S2_HowToAccess: SlideComponentWithMetadata = () => {
  const { reduced } = useReducedMotion();
  const { isSegmentVisible } = useSegmentedAnimation();

  return (
    <SlideContainer maxWidth={1200}>
      <AnimatePresence>
        {isSegmentVisible(0) && (
          <SlideTitle reduced={reduced}>
            How to Access Meeting Highlights
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
            <ContentCard style={{ padding: '2rem' }}>
              <p style={{ ...typography.body, fontSize: 18, marginBottom: '1.5rem', marginTop: 0 }}>
                Open <strong style={{ color: '#00B7C3' }}>BizChat</strong> and ask it to recap a specific meeting
              </p>
              <div style={{
                background: '#0f172a',
                borderRadius: 12,
                padding: '1.5rem'
              }}>
                <VideoPlayer
                  videoPath="/videos/meeting_highlights_usage_in_bizchat.mp4"
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
                        💡 Use <strong style={{ color: '#00B7C3' }}>/</strong> (slash) for CIA (Contextual Instant Query)
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
                  <GradientHighlightBox reduced={reduced} style={{ padding: '1.5rem' }}>
                    <p style={{ color: '#e2e8f0', fontSize: 15, margin: 0 }}>
                      🎬 Video player with highlights appears at the bottom
                    </p>
                  </GradientHighlightBox>
                )}
              </AnimatePresence>

              <AnimatePresence>
                {isSegmentVisible(5) && (
                  <motion.div
                    variants={fadeRight(reduced)}
                    initial="hidden"
                    animate="visible"
                    style={{
                      background: '#78350f',
                      borderRadius: 12,
                      padding: '1.25rem',
                      border: '1px solid #fbbf24'
                    }}
                  >
                    <p style={{ color: '#fef3c7', fontSize: 14, margin: 0 }}>
                      ⚠️ Note: Series meetings don't show the highlights player yet
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>

              <AnimatePresence>
                {isSegmentVisible(6) && (
                  <motion.p
                    variants={fadeRight(reduced)}
                    initial="hidden"
                    animate="visible"
                    style={{ ...typography.caption, fontSize: 13, marginTop: '0.5rem', marginBottom: 0 }}
                  >
                    Additional entry points via Teams and M365 Copilot coming soon
                  </motion.p>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </SlideContainer>
  );
};

Ch1_S2_HowToAccess.metadata = {
  chapter: 1,
  slide: 2,
  title: "How to Access",
  srtFilePath: "highlights_demo/chapters/c1/s2_how_to_access.srt",
  audioSegments: [
    {
      id: "intro",
      audioFilePath: "/audio/c1/s2_segment_01_intro.wav",
      srtSegmentNumber: 1,
      visualDescription: "BizChat interface screenshot",
      narrationText: "Let me show you how to access Meeting Highlights through BizChat."
    },
    {
      id: "bizchat",
      audioFilePath: "/audio/c1/s2_segment_02_bizchat.wav",
      srtSegmentNumber: 2,
      visualDescription: "Embedded MP4 demo video showing BizChat interaction",
      narrationText: "Open BizChat and ask it to recap a specific meeting."
    },
    {
      id: "ciq",
      audioFilePath: "/audio/c1/s2_segment_03_ciq.wav",
      srtSegmentNumber: 3,
      visualDescription: "Demo continues - showing \"/\" menu for CIQ",
      narrationText: "You can reference specific meetings using C-I-Q by typing a forward slash."
    },
    {
      id: "select",
      audioFilePath: "/audio/c1/s2_segment_04_select.wav",
      srtSegmentNumber: 4,
      visualDescription: "Demo shows meeting selection from menu",
      narrationText: "This opens a menu to select and search for meetings to add to your message."
    },
    {
      id: "player",
      audioFilePath: "/audio/c1/s2_segment_05_player.wav",
      srtSegmentNumber: 5,
      visualDescription: "Demo shows BizChat response with video player at bottom",
      narrationText: "BizChat will return a reply to your query and a video player with the meeting highlights appears at the bottom."
    },
    {
      id: "note",
      audioFilePath: "/audio/c1/s2_segment_06_note.wav",
      srtSegmentNumber: 6,
      visualDescription: "Note callout appears",
      narrationText: "Note: If the meeting is a series meeting, BizChat currently won't show the highlights player yet."
    },
    {
      id: "future",
      audioFilePath: "/audio/c1/s2_segment_07_future.wav",
      srtSegmentNumber: 7,
      visualDescription: "Icons showing Teams, BizChat, M365 Copilot entry points",
      narrationText: "We're working on additional ways to surface highlights via BizChat and Teams."
    }
  ]
};

/**
 * Chapter 1, Slide 3 - User Value Proposition
 */
export const Ch1_S3_UserValue: SlideComponentWithMetadata = () => {
  const { reduced } = useReducedMotion();
  const { isSegmentVisible, isOnSegment } = useSegmentedAnimation();

  const benefits = [
    {
      icon: '⏱️',
      title: 'Time Savings',
      description: '60 minutes → 2-3 minutes',
      detail: 'Catch up without watching full recordings'
    },
    {
      icon: '🎯',
      title: 'Better Engagement',
      description: 'Audiovisual content',
      detail: 'Caters to all learning styles'
    },
    {
      icon: '💬',
      title: 'Meeting Dynamics',
      description: 'Tone and vibe preserved',
      detail: 'Not just facts, but context'
    }
  ];

  return (
    <SlideContainer maxWidth={1100}>
      <AnimatePresence>
        {isSegmentVisible(0) && (
          <SlideTitle reduced={reduced}>
            Three Key Benefits
          </SlideTitle>
        )}
      </AnimatePresence>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '2rem',
        marginBottom: '3rem'
      }}>
        {benefits.map((benefit, index) => (
          <BenefitCard
            key={benefit.title}
            icon={benefit.icon}
            title={benefit.title}
            description={benefit.description}
            detail={benefit.detail}
            isHighlighted={isOnSegment(index + 1)}
            isVisible={isSegmentVisible(index + 1)}
            reduced={reduced}
            index={index}
          />
        ))}
      </div>

      <AnimatePresence>
        {isSegmentVisible(4) && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{
              opacity: 1,
              y: 0,
              scale: isOnSegment(4) ? 1.02 : 1
            }}
            transition={{ duration: reduced ? 0.3 : 0.6, type: 'spring' }}
            style={{
              background: isOnSegment(4)
                ? 'linear-gradient(135deg, rgba(0, 183, 195, 0.2), rgba(0, 120, 212, 0.2))'
                : '#1e293b',
              borderRadius: 16,
              padding: '2rem',
              textAlign: 'center',
              border: isOnSegment(4) ? '2px solid #00B7C3' : '1px solid #334155',
              boxShadow: isOnSegment(4) && !reduced ? '0 0 30px rgba(0, 183, 195, 0.3)' : 'none'
            }}
          >
            <p style={{
              color: '#e2e8f0',
              fontSize: 18,
              fontStyle: 'italic',
              marginBottom: '1rem',
              lineHeight: 1.6
            }}>
              "Saved me hours of reviewing the transcript. This is magical."
            </p>
            <p style={{ color: '#94a3b8', fontSize: 14, margin: 0 }}>
              — Internal User Feedback
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </SlideContainer>
  );
};

Ch1_S3_UserValue.metadata = {
  chapter: 1,
  slide: 3,
  title: "User Value",
  srtFilePath: "highlights_demo/chapters/c1/s3_user_value.srt",
  audioSegments: [
    {
      id: "intro",
      audioFilePath: "/audio/c1/s3_segment_01_intro.wav",
      srtSegmentNumber: 1,
      visualDescription: "3 value proposition cards appear",
      narrationText: "Meeting Highlights delivers three key benefits to users."
    },
    {
      id: "time",
      audioFilePath: "/audio/c1/s3_segment_02_time.wav",
      srtSegmentNumber: 2,
      visualDescription: "Card 1 highlights - clock icon with \"60 min → 3 min\"",
      narrationText: "First, massive time savings. Instead of watching a 60-minute recording, catch up in 2 to 3 minutes."
    },
    {
      id: "engagement",
      audioFilePath: "/audio/c1/s3_segment_03_engagement.wav",
      srtSegmentNumber: 3,
      visualDescription: "Card 2 highlights - engagement icons (eyes, ears, text)",
      narrationText: "Second, better engagement and retention through audiovisual content that caters to all learning styles."
    },
    {
      id: "dynamics",
      audioFilePath: "/audio/c1/s3_segment_04_dynamics.wav",
      srtSegmentNumber: 4,
      visualDescription: "Card 3 highlights - mood/vibe icons showing emotions",
      narrationText: "Third, preserved meeting dynamics. You get the tone and vibe of discussions, not just facts."
    },
    {
      id: "testimonial",
      audioFilePath: "/audio/c1/s3_segment_05_testimonial.wav",
      srtSegmentNumber: 5,
      visualDescription: "User testimonial quote appears",
      narrationText: "Internal users have called it magical, with one manager saying it saved hours of reviewing transcripts."
    }
  ]
};