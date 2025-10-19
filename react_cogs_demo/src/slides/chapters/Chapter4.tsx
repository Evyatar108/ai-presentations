import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useReducedMotion } from '../../accessibility/ReducedMotion';
import { useSegmentedAnimation } from '../../contexts/SegmentContext';
import { SlideComponentWithMetadata } from '../SlideMetadata';
import { SlideContainer, ContentCard, GradientHighlightBox, SlideTitle } from '../SlideLayouts';
import { typography, highlightBorder, layouts } from '../SlideStyles';

/**
 * Chapter 4: Highlight Types
 * Single slide explaining abstractive and extractive highlights
 */

/**
 * Chapter 4, Slide 1 - Highlight Types
 */
export const Ch4_S1_HighlightTypes: SlideComponentWithMetadata = () => {
  const { reduced } = useReducedMotion();
  const { isSegmentVisible } = useSegmentedAnimation();

  const fadeLeftVariant = {
    hidden: { opacity: 0, x: reduced ? 0 : -20 },
    visible: { opacity: 1, x: 0, transition: { duration: reduced ? 0.2 : 0.5 } }
  };

  const fadeRightVariant = {
    hidden: { opacity: 0, x: reduced ? 0 : 20 },
    visible: { opacity: 1, x: 0, transition: { duration: reduced ? 0.2 : 0.5 } }
  };

  const fadeUpVariant = {
    hidden: { opacity: 0, y: reduced ? 0 : 20 },
    visible: { opacity: 1, y: 0, transition: { duration: reduced ? 0.2 : 0.5 } }
  };

  return (
    <SlideContainer maxWidth={1100}>
      <AnimatePresence>
        {isSegmentVisible(0) && (
          <SlideTitle reduced={reduced}>
            Two Types of Highlights
          </SlideTitle>
        )}
      </AnimatePresence>

      <div style={layouts.grid2Col('2rem')}>
        <AnimatePresence>
          {isSegmentVisible(1) && (
            <motion.div
              variants={fadeLeftVariant}
              initial="hidden"
              animate="visible"
              style={{
                ...highlightBorder,
                padding: '2rem',
                textAlign: 'center',
                background: 'linear-gradient(135deg, rgba(0, 183, 195, 0.2), rgba(0, 120, 212, 0.2))'
              }}
            >
              <div style={{ fontSize: 48, marginBottom: '1rem' }}>📝</div>
              <h2 style={{ ...typography.h2, marginBottom: '1rem' }}>
                Abstractive Highlights
              </h2>
              <p style={{ ...typography.caption, fontSize: 16 }}>
                AI-generated summaries of discussion topics
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {isSegmentVisible(2) && (
            <motion.div
              variants={fadeRightVariant}
              initial="hidden"
              animate="visible"
            >
              <ContentCard style={{ textAlign: 'center', padding: '2rem' }}>
                <div style={{ fontSize: 48, marginBottom: '1rem' }}>🎬</div>
                <h2 style={{ ...typography.h2, marginBottom: '1rem' }}>
                  Key Moments
                </h2>
                <p style={{ ...typography.caption, fontSize: 16 }}>
                  Significant verbatim segments from the meeting
                </p>
              </ContentCard>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {isSegmentVisible(3) && (
          <motion.div variants={fadeUpVariant} initial="hidden" animate="visible">
            <ContentCard style={{ marginBottom: '1.5rem' }}>
              <p style={{ ...typography.body, margin: 0 }}>
                ⏱️ Each highlight covers <strong style={{ color: '#00B7C3' }}>20-30 second segments</strong> with timestamps and narration
              </p>
            </ContentCard>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isSegmentVisible(4) && (
          <motion.div variants={fadeUpVariant} initial="hidden" animate="visible">
            <ContentCard style={{ marginBottom: '1.5rem' }}>
              <p style={{ ...typography.body, margin: 0 }}>
                🎙️ Narration text converted to audio using <strong style={{ color: '#00B7C3' }}>Azure Cognitive Services</strong>
              </p>
            </ContentCard>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isSegmentVisible(5) && (
          <motion.div variants={fadeUpVariant} initial="hidden" animate="visible">
            <ContentCard style={{ marginBottom: '1.5rem' }}>
              <p style={{ ...typography.body, margin: 0 }}>
                🗄️ All metadata, audio, and captions <strong style={{ color: '#00B7C3' }}>securely stored in ODSP</strong>
              </p>
            </ContentCard>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isSegmentVisible(6) && (
          <GradientHighlightBox reduced={reduced} style={{ textAlign: 'center' }}>
            <p style={{ ...typography.body, margin: 0 }}>
              📱 Available across <strong style={{ color: '#fff' }}>Microsoft 365 platforms</strong>
            </p>
          </GradientHighlightBox>
        )}
      </AnimatePresence>
    </SlideContainer>
  );
};

Ch4_S1_HighlightTypes.metadata = {
  chapter: 4,
  slide: 1,
  title: "Highlight Types",
  srtFilePath: "highlights_demo/chapters/c4/s1_highlight_types.srt",
  audioSegments: [
    {
      id: "intro",
      audioFilePath: "/audio/c4/s1_segment_01_intro.wav",
      srtSegmentNumber: 1,
      visualDescription: "Title \"Two Types of Highlights\"",
      narrationText: "Meeting Highlights combines two distinct types of highlights to create a comprehensive recap."
    },
    {
      id: "abstractive",
      audioFilePath: "/audio/c4/s1_segment_02_abstractive.wav",
      srtSegmentNumber: 2,
      visualDescription: "Left card appears - Abstractive Highlights with summary icon",
      narrationText: "First, abstractive highlights. These are AI-generated summaries that capture the key topics discussed in the meeting."
    },
    {
      id: "key_moments",
      audioFilePath: "/audio/c4/s1_segment_03_key_moments.wav",
      srtSegmentNumber: 3,
      visualDescription: "Right card appears - Key Moments with video clip icon",
      narrationText: "Second, key moments. These are significant verbatim segments extracted directly from the meeting recording."
    },
    {
      id: "timestamps",
      audioFilePath: "/audio/c4/s1_segment_04_timestamps.wav",
      srtSegmentNumber: 4,
      visualDescription: "Detail callout showing 20-30 second segments",
      narrationText: "Each highlight is a 20 to 30 second segment with precise timestamps and accompanying narration."
    },
    {
      id: "audio",
      audioFilePath: "/audio/c4/s1_segment_05_audio.wav",
      srtSegmentNumber: 5,
      visualDescription: "Azure Cognitive Services logo with audio waveform",
      narrationText: "The narration text is converted to natural-sounding audio using Azure Cognitive Services text-to-speech."
    },
    {
      id: "storage",
      audioFilePath: "/audio/c4/s1_segment_06_storage.wav",
      srtSegmentNumber: 6,
      visualDescription: "ODSP storage icon with security badge",
      narrationText: "All the metadata, audio files, and caption data are securely stored in ODSP."
    },
    {
      id: "platforms",
      audioFilePath: "/audio/c4/s1_segment_07_platforms.wav",
      srtSegmentNumber: 7,
      visualDescription: "M365 platform icons (Teams, BizChat, Copilot)",
      narrationText: "Making highlights available across Microsoft 365 platforms wherever users work."
    }
  ]
};