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
 * Chapter 9, Slide 2 - Try It Yourself
 */
export const Ch9_S2_TryItYourself: SlideComponentWithMetadata = () => {
  const { reduced } = useReducedMotion();
  const { isSegmentVisible } = useSegmentedAnimation();

  const steps = [
    {
      number: '1️⃣',
      title: 'Open BizChat',
      description: 'Navigate to BizChat in your Microsoft 365 apps'
    },
    {
      number: '2️⃣',
      title: 'Reference a Meeting',
      description: 'Type / to open the mention menu and select your meeting'
    },
    {
      number: '3️⃣',
      title: 'Ask for a Recap',
      description: 'Request a meeting summary and watch your highlight video appear!'
    }
  ];

  return (
    <SlideContainer maxWidth={1000}>
      <AnimatePresence>
        {isSegmentVisible(0) && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: reduced ? 0.2 : 0.5 }}
            style={{ textAlign: 'center', marginBottom: '3rem' }}
          >
            <h1 style={{ ...typography.h1, marginBottom: '1rem' }}>
              Ready to Experience It?
            </h1>
            <p style={{ ...typography.body, fontSize: 18, color: '#94a3b8' }}>
              Join the <span style={{ color: '#00B7C3', fontWeight: 600 }}>80%</span> who find it extremely useful
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Satisfaction Metric */}
      <AnimatePresence>
        {isSegmentVisible(1) && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: reduced ? 0.3 : 0.6 }}
            style={{
              background: 'linear-gradient(135deg, #00B7C3, #0078D4)',
              borderRadius: 16,
              padding: '2rem',
              textAlign: 'center',
              marginBottom: '2rem',
              boxShadow: reduced ? 'none' : '0 0 40px rgba(0, 183, 195, 0.3)'
            }}
          >
            <div style={{
              fontSize: 64,
              fontWeight: 'bold',
              color: '#fff',
              marginBottom: '0.5rem',
              textShadow: '0 0 20px rgba(255, 255, 255, 0.5)'
            }}>
              80%
            </div>
            <div style={{ color: '#fff', fontSize: 18, marginBottom: '0.5rem' }}>
              find it extremely useful
            </div>
            <div style={{ fontSize: 24 }}>⭐⭐⭐⭐⭐</div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Coming Soon Banner */}
      <AnimatePresence>
        {isSegmentVisible(2) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: reduced ? 0.3 : 0.6 }}
            style={{
              background: '#1e293b',
              border: '2px solid #00B7C3',
              borderRadius: 12,
              padding: '1.5rem',
              marginBottom: '2rem',
              textAlign: 'center'
            }}
          >
            <div style={{ fontSize: 24, marginBottom: '0.5rem' }}>🚀</div>
            <div style={{ ...typography.h2, marginBottom: '0.5rem', color: '#00B7C3' }}>
              Coming Soon: Even Better Quality
            </div>
            <p style={{ ...typography.body, fontSize: 16, margin: 0, color: '#cbd5e1' }}>
              The unified prompt optimization will roll out with higher satisfaction scores
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Steps */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginBottom: '2rem' }}>
        {steps.map((step, index) => (
          <AnimatePresence key={step.title}>
            {isSegmentVisible(index + 3) && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: reduced ? 0.3 : 0.5 }}
                style={{
                  background: '#1e293b',
                  borderRadius: 12,
                  padding: '1.5rem',
                  border: '1px solid #334155',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1.5rem'
                }}
              >
                <div style={{ fontSize: 36, flexShrink: 0 }}>
                  {step.number}
                </div>
                <div>
                  <div style={{ ...typography.h2, fontSize: 20, marginBottom: '0.5rem' }}>
                    {step.title}
                  </div>
                  <p style={{ ...typography.body, fontSize: 14, margin: 0, color: '#94a3b8' }}>
                    {step.description}
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        ))}
      </div>

      {/* Call to Action */}
      <AnimatePresence>
        {isSegmentVisible(6) && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: reduced ? 0.3 : 0.6 }}
            style={{ textAlign: 'center' }}
          >
            <motion.div
              animate={reduced ? {} : {
                boxShadow: [
                  '0 0 20px rgba(0, 183, 195, 0.3)',
                  '0 0 40px rgba(0, 183, 195, 0.6)',
                  '0 0 20px rgba(0, 183, 195, 0.3)'
                ]
              }}
              transition={{ duration: 2, repeat: Infinity }}
              style={{
                display: 'inline-block',
                background: 'linear-gradient(135deg, #00B7C3, #0078D4)',
                borderRadius: 12,
                padding: '1.5rem 3rem',
                cursor: 'pointer'
              }}
            >
              <div style={{ ...typography.h2, fontSize: 24, color: '#fff', margin: 0 }}>
                Try It Today in BizChat! 🚀
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </SlideContainer>
  );
};

Ch9_S2_TryItYourself.metadata = {
  chapter: 9,
  slide: 2,
  title: "Try It Yourself",
  audioSegments: [
    {
      id: "intro",
      audioFilePath: "/audio/c9/s2_segment_01_intro.wav",
      narrationText: "More than 80 percent of users find Meeting Highlights extremely useful, and we want you to experience it too."
    },
    {
      id: "satisfaction",
      audioFilePath: "/audio/c9/s2_segment_02_satisfaction.wav",
      narrationText: "With such high user satisfaction, Meeting Highlights is already making a significant impact."
    },
    {
      id: "quality_teaser",
      audioFilePath: "/audio/c9/s2_segment_03_quality_teaser.wav",
      narrationText: "And there's even better news: the unified prompt optimization we discussed will soon roll out, delivering even higher quality highlights with improved detail and natural flow."
    },
    {
      id: "step1",
      audioFilePath: "/audio/c9/s2_segment_04_step1.wav",
      narrationText: "Getting started is simple. First, open BizChat."
    },
    {
      id: "step2",
      audioFilePath: "/audio/c9/s2_segment_05_step2.wav",
      narrationText: "Next, type forward slash to bring up the mention menu, and select the meeting you want recapped."
    },
    {
      id: "step3",
      audioFilePath: "/audio/c9/s2_segment_06_step3.wav",
      narrationText: "Then just ask for a recap. Your personalized highlight video will appear at the bottom of the response."
    },
    {
      id: "cta",
      audioFilePath: "/audio/c9/s2_segment_07_cta.wav",
      narrationText: "Try it today and see why users love meeting highlights!"
    }
  ]
};