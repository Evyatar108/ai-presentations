import React from 'react';
import {
  useReducedMotion,
  useSegmentedAnimation,
  useTheme,
  defineSlide,
  SlideContainer,
  SlideTitle,
  Reveal,
  typography,
  layouts,
  fadeUp,
  fadeLeft,
  fadeRight,
} from '@framework';

/**
 * Chapter 4: Highlight Types
 * Single slide explaining abstractive and extractive highlights
 */

/**
 * Chapter 4, Slide 1 - Highlight Types
 */
const Ch4_S1_HighlightTypesComponent: React.FC = () => {
  const { reduced } = useReducedMotion();
  const { currentSegmentIndex } = useSegmentedAnimation();
  const theme = useTheme();

  return (
    <SlideContainer maxWidth={1100}>
      <Reveal from={0}>
        <SlideTitle reduced={reduced}>
          Two Types of Highlights
        </SlideTitle>
      </Reveal>

      <div style={{ ...layouts.grid2Col('2rem'), marginBottom: '2rem' }}>
        <Reveal from={1} animation={fadeLeft} style={{
          borderRadius: 16,
          padding: '2rem',
          textAlign: 'center',
          background: currentSegmentIndex === 1
            ? 'linear-gradient(135deg, rgba(0, 183, 195, 0.2), rgba(0, 120, 212, 0.2))'
            : theme.colors.bgSurface,
          border: currentSegmentIndex === 1 ? `2px solid ${theme.colors.primary}` : `1px solid ${theme.colors.bgBorder}`,
          transition: 'all 0.3s ease'
        }}>
          <div style={{ fontSize: 48, marginBottom: '1rem' }}>📝</div>
          <h2 style={{ ...typography.h2, marginBottom: '1rem' }}>
            Abstractive Highlights
          </h2>
          <p style={{ ...typography.caption, fontSize: 16 }}>
            AI-generated summaries of discussion topics
          </p>
          <p style={{ ...typography.caption, fontSize: 14, marginTop: '0.5rem', color: theme.colors.primary }}>
            Narration by Azure Cognitive Services • Video from meeting
          </p>
        </Reveal>

        <Reveal from={2} animation={fadeRight} style={{
          borderRadius: 16,
          padding: '2rem',
          textAlign: 'center',
          background: currentSegmentIndex === 2
            ? 'linear-gradient(135deg, rgba(0, 183, 195, 0.2), rgba(0, 120, 212, 0.2))'
            : theme.colors.bgSurface,
          border: currentSegmentIndex === 2 ? `2px solid ${theme.colors.primary}` : `1px solid ${theme.colors.bgBorder}`,
          transition: 'all 0.3s ease'
        }}>
          <div style={{ fontSize: 48, marginBottom: '1rem' }}>🎬</div>
          <h2 style={{ ...typography.h2, marginBottom: '1rem' }}>
            Key Moments
          </h2>
          <p style={{ ...typography.caption, fontSize: 16 }}>
            Significant verbatim segments from the meeting
          </p>
          <p style={{ ...typography.caption, fontSize: 14, marginTop: '0.5rem', color: theme.colors.primary }}>
            Uses original audio and video from the recording
          </p>
        </Reveal>
      </div>

      <Reveal from={3} animation={fadeUp} style={{
        borderRadius: 16,
        padding: '1.5rem',
        marginBottom: '1.5rem',
        background: currentSegmentIndex === 3
          ? 'linear-gradient(135deg, rgba(0, 183, 195, 0.2), rgba(0, 120, 212, 0.2))'
          : theme.colors.bgSurface,
        border: currentSegmentIndex === 3 ? `2px solid ${theme.colors.primary}` : `1px solid ${theme.colors.bgBorder}`,
        transition: 'all 0.3s ease'
      }}>
        <p style={{ ...typography.body, margin: 0 }}>
          ⏱️ Each highlight covers <strong style={{ color: theme.colors.primary }}>20-40 second segments</strong> with timestamps and narration
        </p>
      </Reveal>

      <Reveal from={4} animation={fadeUp} style={{
        borderRadius: 16,
        padding: '1.5rem',
        marginBottom: '1.5rem',
        background: currentSegmentIndex === 4
          ? 'linear-gradient(135deg, rgba(0, 183, 195, 0.2), rgba(0, 120, 212, 0.2))'
          : theme.colors.bgSurface,
        border: currentSegmentIndex === 4 ? `2px solid ${theme.colors.primary}` : `1px solid ${theme.colors.bgBorder}`,
        transition: 'all 0.3s ease'
      }}>
        <p style={{ ...typography.body, margin: 0 }}>
          📖 AI weaves highlights into a <strong style={{ color: theme.colors.primary }}>cohesive narrative</strong>, connecting abstractive summaries and key moments into an engaging story
        </p>
      </Reveal>
    </SlideContainer>
  );
};

export const Ch4_S1_HighlightTypes = defineSlide({
  metadata: {
    chapter: 4,
    slide: 1,
    title: "Highlight Types",
    srtFilePath: "highlights_demo/chapters/c4/s1_highlight_types.srt",
    audioSegments: [
      {
        id: 0,
        srtSegmentNumber: 1,
        visualDescription: "Title \"Two Types of Highlights\""
      },
      {
        id: 1,
        srtSegmentNumber: 2,
        visualDescription: "Left card appears - Abstractive Highlights with summary icon"
      },
      {
        id: 2,
        srtSegmentNumber: 3,
        visualDescription: "Right card appears - Key Moments with video clip icon"
      },
      {
        id: 3,
        srtSegmentNumber: 4,
        visualDescription: "Detail callout showing 20-30 second segments"
      },
      {
        id: 4,
        srtSegmentNumber: 5,
        visualDescription: "Narrative storytelling icon connecting highlights"
      }
    ]
  },
  component: Ch4_S1_HighlightTypesComponent
});
