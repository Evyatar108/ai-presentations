import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useReducedMotion } from '../../accessibility/ReducedMotion';
import { useSegmentedAnimation } from '../../contexts/SegmentContext';
import { SlideComponentWithMetadata } from '../SlideMetadata';
import { SlideContainer, GradientHighlightBox, SlideTitle, ImprovementCard } from '../SlideLayouts';
import { typography, layouts } from '../SlideStyles';

/**
 * Chapter 9: Future Improvements
 * 2 slides showing testimonials and future roadmap
 */

/**
 * Chapter 9, Slide 1 - Testimonials
 */
export const Ch9_S1_Testimonials: SlideComponentWithMetadata = () => {
  const { reduced } = useReducedMotion();
  const { isSegmentVisible } = useSegmentedAnimation();

  const testimonials = [
    {
      author: "Kevin C.",
      quote: "Love this feature. Great way to catch up on a recap without watching the full thing."
    },
    {
      author: "Ryan Roslonsky",
      quote: "Beyond the awesome text recap, there is literally a two-minute narrated video about the meeting."
    },
    {
      author: "Ryan Roslonsky",
      quote: "It's mind-blowing and an engaging way to recap a meeting for a richer understanding of the conversation."
    },
    {
      author: "Anonymous User",
      quote: "Saved me hours of reviewing the transcript. This is magical."
    }
  ];

  return (
    <div style={{
      background: '#0f172a',
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem',
      fontFamily: 'Inter, system-ui, sans-serif'
    }}>
      <div style={{ maxWidth: 1000, width: '100%' }}>
        <AnimatePresence>
          {isSegmentVisible(0) && (
            <motion.h1
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: reduced ? 0.2 : 0.5 }}
              style={{ color: '#f1f5f9', marginBottom: '3rem', textAlign: 'center' }}
            >
              User Testimonials
            </motion.h1>
          )}
        </AnimatePresence>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '2rem' }}>
          {testimonials.map((testimonial, index) => (
            <AnimatePresence key={index}>
              {isSegmentVisible(index + 1) && (
                <motion.div
                  initial={{ opacity: 0, y: 20, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ duration: reduced ? 0.3 : 0.6, type: 'spring' }}
                  style={{
                    background: '#1e293b',
                    borderRadius: 16,
                    padding: '2rem',
                    border: '1px solid #334155',
                    display: 'flex',
                    flexDirection: 'column'
                  }}
                >
                  <div style={{ fontSize: 32, marginBottom: '1rem' }}>💬</div>
                  <p style={{
                    color: '#e2e8f0',
                    fontSize: 16,
                    lineHeight: 1.6,
                    fontStyle: 'italic',
                    flex: 1,
                    marginBottom: '1rem'
                  }}>
                    "{testimonial.quote}"
                  </p>
                  <div style={{ color: '#00B7C3', fontSize: 14, fontWeight: 600 }}>
                    — {testimonial.author}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          ))}
        </div>
      </div>
    </div>
  );
};

Ch9_S1_Testimonials.metadata = {
  chapter: 9,
  slide: 1,
  title: "Testimonials",
  audioSegments: [
    {
      id: "intro",
      audioFilePath: "/audio/c9/s1_segment_01_intro.wav",
      narrationText: "Users have shared enthusiastic feedback about Meeting Highlights."
    },
    {
      id: "kevin",
      audioFilePath: "/audio/c9/s1_segment_02_kevin.wav",
      narrationText: "Kevin C. commented: \"Love this feature. Great way to catch up on a recap without watching the full thing.\""
    },
    {
      id: "ryan1",
      audioFilePath: "/audio/c9/s1_segment_03_ryan1.wav",
      narrationText: "Ryan Roslonsky added: \"Beyond the awesome text recap, there is literally a two-minute narrated video about the meeting.\""
    },
    {
      id: "ryan2",
      audioFilePath: "/audio/c9/s1_segment_04_ryan2.wav",
      narrationText: "\"It's mind-blowing and an engaging way to recap a meeting for a richer understanding of the conversation.\""
    },
    {
      id: "anonymous",
      audioFilePath: "/audio/c9/s1_segment_05_anonymous.wav",
      narrationText: "Another user shared: \"Saved me hours of reviewing the transcript. This is magical.\""
    }
  ]
};

/**
 * Chapter 9, Slide 2 - Future Improvements
 */
export const Ch9_S2_FutureImprovements: SlideComponentWithMetadata = () => {
  const { reduced } = useReducedMotion();
  const { isSegmentVisible } = useSegmentedAnimation();

  const improvements = [
    {
      icon: '🔍',
      title: 'Detail & Specificity',
      description: 'More detailed highlights capturing nuanced discussions'
    },
    {
      icon: '📊',
      title: 'Teams Integration',
      description: 'Deeper integration with Teams Recap for seamless access'
    },
    {
      icon: '✅',
      title: 'Action Items',
      description: 'Include action items and decisions for actionable outcomes'
    },
    {
      icon: '🌍',
      title: 'Languages',
      description: 'Additional language support for global users'
    }
  ];

  return (
    <SlideContainer maxWidth={1100}>
      <AnimatePresence>
        {isSegmentVisible(0) && (
          <SlideTitle reduced={reduced} subtitle="User feedback drives our roadmap">
            Future Improvements
          </SlideTitle>
        )}
      </AnimatePresence>

      <div style={{ ...layouts.grid2Col(), marginBottom: '3rem' }}>
        {improvements.map((improvement, index) => (
          <ImprovementCard
            key={improvement.title}
            icon={improvement.icon}
            title={improvement.title}
            description={improvement.description}
            isVisible={isSegmentVisible(index + 1)}
            reduced={reduced}
            index={index}
          />
        ))}
      </div>

      <AnimatePresence>
        {isSegmentVisible(5) && (
          <GradientHighlightBox reduced={reduced} style={{ textAlign: 'center' }}>
            <p style={{ ...typography.body, fontSize: 20, fontWeight: 600, margin: 0 }}>
              On our roadmap for general availability in 2024
            </p>
          </GradientHighlightBox>
        )}
      </AnimatePresence>
    </SlideContainer>
  );
};

Ch9_S2_FutureImprovements.metadata = {
  chapter: 9,
  slide: 2,
  title: "Future Improvements",
  srtFilePath: "highlights_demo/chapters/c9/s2_future_improvements.srt",
  audioSegments: [
    {
      id: "intro",
      audioFilePath: "/audio/c9/s2_segment_01_intro.wav",
      srtSegmentNumber: 1,
      visualDescription: "Title \"Future Improvements\" with roadmap icon",
      narrationText: "Based on user feedback, we have an exciting roadmap ahead."
    },
    {
      id: "detail",
      audioFilePath: "/audio/c9/s2_segment_02_detail.wav",
      srtSegmentNumber: 2,
      visualDescription: "Card 1 appears - Detail & Specificity with magnifying glass icon",
      narrationText: "Users want more detailed and specific highlights that capture nuanced discussions."
    },
    {
      id: "teams",
      audioFilePath: "/audio/c9/s2_segment_03_teams.wav",
      srtSegmentNumber: 3,
      visualDescription: "Card 2 appears - Teams Integration with integration icon",
      narrationText: "Deeper integration with Teams Recap for seamless access to highlights."
    },
    {
      id: "action",
      audioFilePath: "/audio/c9/s2_segment_04_action.wav",
      srtSegmentNumber: 4,
      visualDescription: "Card 3 appears - Action Items with checkmark icon",
      narrationText: "Including action items and decisions to make highlights more actionable."
    },
    {
      id: "languages",
      audioFilePath: "/audio/c9/s2_segment_05_languages.wav",
      srtSegmentNumber: 5,
      visualDescription: "Card 4 appears - Languages with globe icon",
      narrationText: "And additional language support to serve our global user base."
    },
    {
      id: "roadmap",
      audioFilePath: "/audio/c9/s2_segment_06_roadmap.wav",
      srtSegmentNumber: 6,
      visualDescription: "Summary banner appears with timeline",
      narrationText: "These improvements are on our roadmap as we work toward general availability in 2024."
    }
  ]
};