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
      quote: "Love this feature. Great way to catch up on a recap without watching the full thing.",
      emoji: "💖"
    },
    {
      author: "Ryan Roslonsky",
      quote: "Beyond the awesome text recap, there is literally a two-minute narrated video about the meeting.",
      emoji: "🎥"
    },
    {
      author: "Ryan Roslonsky",
      quote: "It's mind-blowing and an engaging way to recap a meeting for a richer understanding of the conversation.",
      emoji: "🤯"
    },
    {
      author: "Anonymous User",
      quote: "Saved me hours of reviewing the transcript. This is magical.",
      emoji: "✨"
    }
  ];

  return (
    <SlideContainer maxWidth={1100}>
      {/* Animated background particles */}
      <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
        {!reduced && [...Array(15)].map((_, i) => (
          <motion.div
            key={i}
            initial={{
              x: Math.random() * window.innerWidth,
              y: Math.random() * window.innerHeight,
              opacity: 0
            }}
            animate={{
              y: [null, Math.random() * window.innerHeight],
              opacity: [0, 0.2, 0],
            }}
            transition={{
              duration: 4 + Math.random() * 2,
              repeat: Infinity,
              delay: i * 0.3,
              ease: 'linear'
            }}
            style={{
              position: 'absolute',
              width: 3,
              height: 3,
              borderRadius: '50%',
              background: i % 3 === 0 ? '#00B7C3' : i % 3 === 1 ? '#0078D4' : '#8B5CF6',
            }}
          />
        ))}
      </div>

      {/* Title with gradient and glow */}
      <AnimatePresence>
        {isSegmentVisible(0) && (
          <motion.div
            initial={{ opacity: 0, y: -30, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{
              duration: reduced ? 0.3 : 0.7,
              type: 'spring',
              stiffness: 120
            }}
            style={{ textAlign: 'center', marginBottom: '3rem', position: 'relative' }}
          >
            {/* Glow effect */}
            {!reduced && (
              <motion.div
                animate={{
                  scale: [1, 1.3, 1],
                  opacity: [0.2, 0.4, 0.2]
                }}
                transition={{ duration: 3, repeat: Infinity }}
                style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  width: 500,
                  height: 80,
                  borderRadius: '50%',
                  background: 'radial-gradient(circle, rgba(0, 183, 195, 0.4), transparent)',
                  filter: 'blur(30px)',
                  zIndex: 0
                }}
              />
            )}
            
            <motion.h1
              animate={reduced ? {} : {
                backgroundPosition: ['0% 50%', '100% 50%', '0% 50%']
              }}
              transition={{ duration: 5, repeat: Infinity, ease: 'linear' }}
              style={{
                ...typography.h1,
                background: 'linear-gradient(90deg, #00B7C3, #0078D4, #8B5CF6, #00B7C3)',
                backgroundSize: '200% auto',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                fontSize: 42,
                marginBottom: '0.5rem',
                position: 'relative',
                zIndex: 1
              }}
            >
              User Testimonials
            </motion.h1>
            
            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              style={{
                color: '#94a3b8',
                fontSize: 16,
                fontStyle: 'italic',
                position: 'relative',
                zIndex: 1
              }}
            >
              Real feedback from real users
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Testimonial Cards Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: '2rem',
        position: 'relative',
        zIndex: 1
      }}>
        {testimonials.map((testimonial, index) => (
          <AnimatePresence key={index}>
            {isSegmentVisible(index + 1) && (
              <motion.div
                initial={{ opacity: 0, y: 30, scale: 0.9, rotateX: -10 }}
                animate={{ opacity: 1, y: 0, scale: 1, rotateX: 0 }}
                transition={{
                  duration: reduced ? 0.3 : 0.7,
                  type: 'spring',
                  stiffness: 100,
                  delay: 0.1 * index
                }}
                whileHover={reduced ? {} : {
                  scale: 1.03,
                  y: -5,
                  boxShadow: '0 20px 40px rgba(0, 183, 195, 0.25)'
                }}
                style={{
                  background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
                  borderRadius: 16,
                  padding: '1.5rem',
                  border: '2px solid #334155',
                  display: 'flex',
                  flexDirection: 'column',
                  position: 'relative',
                  overflow: 'hidden',
                  boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)'
                }}
              >
                {/* Animated gradient border glow */}
                {!reduced && (
                  <motion.div
                    animate={{
                      opacity: [0.2, 0.4, 0.2],
                    }}
                    transition={{ duration: 3, repeat: Infinity, delay: index * 0.5 }}
                    style={{
                      position: 'absolute',
                      inset: -2,
                      background: `linear-gradient(135deg, #00B7C3, #0078D4, #8B5CF6)`,
                      borderRadius: 20,
                      zIndex: 0,
                      filter: 'blur(10px)'
                    }}
                  />
                )}

                <div style={{ position: 'relative', zIndex: 1 }}>
                  {/* Emoji with animation */}
                  <motion.div
                    animate={reduced ? {} : {
                      rotate: [-5, 5, -5],
                      scale: [1, 1.1, 1]
                    }}
                    transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
                    style={{
                      fontSize: 36,
                      marginBottom: '1rem',
                      textAlign: 'center'
                    }}
                  >
                    {testimonial.emoji}
                  </motion.div>

                  {/* Quote text with shimmer */}
                  <div style={{ position: 'relative', marginBottom: '1rem' }}>
                    <p style={{
                      color: '#e2e8f0',
                      fontSize: 15,
                      lineHeight: 1.6,
                      fontStyle: 'italic',
                      flex: 1,
                      margin: 0,
                      position: 'relative',
                      zIndex: 1
                    }}>
                      "{testimonial.quote}"
                    </p>
                  </div>

                  {/* Author with gradient */}
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + index * 0.1 }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      paddingTop: '1rem',
                      borderTop: '1px solid #334155'
                    }}
                  >
                    <div style={{
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, #00B7C3, #0078D4)',
                      boxShadow: '0 0 10px rgba(0, 183, 195, 0.5)'
                    }} />
                    <div style={{
                      color: '#00B7C3',
                      fontSize: 14,
                      fontWeight: 600,
                      letterSpacing: '0.3px'
                    }}>
                      {testimonial.author}
                    </div>
                  </motion.div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        ))}
      </div>
    </SlideContainer>
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
      narrationText: "Enthusiastic user feedback."
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
 * Chapter 9, Slide 2 - Thank You & Closing
 */
export const Ch9_S2_ClosingThanks: SlideComponentWithMetadata = () => {
  const { reduced } = useReducedMotion();
  const { isSegmentVisible } = useSegmentedAnimation();

  return (
    <SlideContainer maxWidth={900}>
      {/* Animated background particles */}
      <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
        {!reduced && [...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            initial={{
              x: Math.random() * window.innerWidth,
              y: Math.random() * window.innerHeight,
              opacity: 0
            }}
            animate={{
              y: [null, Math.random() * window.innerHeight],
              opacity: [0, 0.3, 0],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: i * 0.2,
              ease: 'linear'
            }}
            style={{
              position: 'absolute',
              width: 4,
              height: 4,
              borderRadius: '50%',
              background: i % 2 === 0 ? '#00B7C3' : '#0078D4',
            }}
          />
        ))}
      </div>

      {/* Title: Thank You with animated gradient */}
      <AnimatePresence>
        {isSegmentVisible(0) && (
          <motion.div
            initial={{ opacity: 0, y: -30, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{
              duration: reduced ? 0.3 : 0.8,
              type: 'spring',
              stiffness: 100
            }}
            style={{ textAlign: 'center', marginBottom: '0rem', position: 'relative' }}
          >
            {/* Glow effect behind text */}
            {!reduced && (
              <motion.div
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.3, 0.6, 0.3]
                }}
                transition={{ duration: 2, repeat: Infinity }}
                style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  width: 400,
                  height: 100,
                  borderRadius: '50%',
                  background: 'radial-gradient(circle, rgba(0, 183, 195, 0.4), transparent)',
                  filter: 'blur(40px)',
                  zIndex: 0
                }}
              />
            )}
            
            <motion.h1
              animate={reduced ? {} : {
                backgroundPosition: ['0% 50%', '100% 50%', '0% 50%']
              }}
              transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
              style={{
                ...typography.h1,
                background: 'linear-gradient(90deg, #00B7C3, #0078D4, #00B7C3, #0078D4)',
                backgroundSize: '200% auto',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                fontSize: 72,
                marginBottom: 0,
                position: 'relative',
                zIndex: 1,
                textShadow: '0 0 40px rgba(0, 183, 195, 0.3)'
              }}
            >
              Thank You
            </motion.h1>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Value Statement with icon animation */}
      <AnimatePresence>
        {isSegmentVisible(1) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: reduced ? 0.3 : 0.6 }}
            style={{ textAlign: 'center', marginBottom: '2rem' }}
          >
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{
                duration: reduced ? 0.3 : 0.6,
                type: 'spring',
                delay: 0.2
              }}
              style={{ display: 'inline-flex', gap: '1.5rem', alignItems: 'center' }}
            >
              <motion.div
                animate={reduced ? {} : { rotate: [0, 5, -5, 0] }}
                transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
                style={{ fontSize: 28 }}
              >
                ⏱️
              </motion.div>
              <p style={{
                ...typography.body,
                fontSize: 20,
                color: '#e2e8f0',
                fontWeight: 600,
                margin: 0,
                letterSpacing: '0.5px'
              }}>
                Reclaim time. Stay aligned.
              </p>
              <motion.div
                animate={reduced ? {} : { scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity, repeatDelay: 1, delay: 0.5 }}
                style={{ fontSize: 28 }}
              >
                🎯
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Enhanced Feedback Card with hover effect */}
      <AnimatePresence>
        {isSegmentVisible(2) && (
          <motion.div
            initial={{ opacity: 0, y: 30, rotateX: -15 }}
            animate={{ opacity: 1, y: 0, rotateX: 0 }}
            transition={{
              duration: reduced ? 0.3 : 0.7,
              type: 'spring'
            }}
            whileHover={reduced ? {} : {
              scale: 1.02,
              boxShadow: '0 20px 40px rgba(0, 183, 195, 0.3)'
            }}
            style={{
              background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
              border: '2px solid #334155',
              borderRadius: 16,
              padding: '2.5rem',
              marginBottom: '1.5rem',
              textAlign: 'center',
              position: 'relative',
              overflow: 'hidden',
              boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)'
            }}
          >
            {/* Animated border glow */}
            {!reduced && (
              <motion.div
                animate={{
                  opacity: [0.3, 0.6, 0.3],
                }}
                transition={{ duration: 2, repeat: Infinity }}
                style={{
                  position: 'absolute',
                  inset: -2,
                  background: 'linear-gradient(45deg, #00B7C3, #0078D4, #00B7C3)',
                  borderRadius: 16,
                  zIndex: 0,
                  filter: 'blur(8px)'
                }}
              />
            )}
            
            <div style={{ position: 'relative', zIndex: 1 }}>
              <motion.div
                animate={reduced ? {} : {
                  rotate: [0, 10, -10, 0],
                  scale: [1, 1.1, 1]
                }}
                transition={{ duration: 2, repeat: Infinity, repeatDelay: 2 }}
                style={{ fontSize: 48, marginBottom: '1rem' }}
              >
                📧
              </motion.div>
              <div style={{
                ...typography.h2,
                fontSize: 22,
                marginBottom: '1.5rem',
                color: '#f1f5f9',
                fontWeight: 700
              }}>
                Share Your Feedback
              </div>
              <motion.div
                whileHover={reduced ? {} : { scale: 1.05 }}
                style={{
                  ...typography.body,
                  fontSize: 18,
                  color: '#00B7C3',
                  fontFamily: 'monospace',
                  letterSpacing: '0.5px',
                  background: 'rgba(0, 183, 195, 0.1)',
                  padding: '0.75rem 1.5rem',
                  borderRadius: 8,
                  display: 'inline-block',
                  border: '1px solid rgba(0, 183, 195, 0.3)',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
              >
                meetinghldevs@microsoft.com
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Enhanced Call to Action - Video-friendly Badge */}
      <AnimatePresence>
        {isSegmentVisible(3) && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{
              duration: reduced ? 0.3 : 0.6,
              type: 'spring',
              stiffness: 150
            }}
            style={{ textAlign: 'center', position: 'relative' }}
          >

            <motion.div
              animate={reduced ? {} : {
                scale: [1, 1.03, 1],
              }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              style={{
                position: 'relative',
                background: 'linear-gradient(135deg, #00B7C3, #0078D4)',
                borderRadius: 20,
                padding: '2rem 3.5rem',
                display: 'inline-block',
                boxShadow: '0 10px 40px rgba(0, 183, 195, 0.5)',
                overflow: 'hidden'
              }}
            >
              {/* Animated shine effect */}
              {!reduced && (
                <motion.div
                  animate={{
                    x: ['-200%', '200%']
                  }}
                  transition={{
                    duration: 2.5,
                    repeat: Infinity,
                    repeatDelay: 1,
                    ease: 'easeInOut'
                  }}
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '50%',
                    height: '100%',
                    background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)',
                    transform: 'skewX(-20deg)',
                    zIndex: 1
                  }}
                />
              )}
              
              <div style={{ position: 'relative', zIndex: 2 }}>
                <motion.div
                  animate={reduced ? {} : {
                    rotate: [0, 10, -10, 0],
                    scale: [1, 1.1, 1]
                  }}
                  transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
                  style={{ fontSize: 40, marginBottom: '0.75rem' }}
                >
                  🚀
                </motion.div>
                <div style={{
                  fontSize: 26,
                  fontWeight: 700,
                  color: '#fff',
                  fontFamily: 'Inter, system-ui, sans-serif',
                  marginBottom: '0.25rem',
                  letterSpacing: '0.5px'
                }}>
                  Try Meeting Highlights
                </div>
                <motion.div
                  animate={reduced ? {} : {
                    opacity: [0.7, 1, 0.7]
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                  style={{
                    fontSize: 16,
                    color: 'rgba(255, 255, 255, 0.9)',
                    fontFamily: 'Inter, system-ui, sans-serif',
                    fontWeight: 500
                  }}
                >
                  Available now in BizChat & SharePoint
                </motion.div>
              </div>
            </motion.div>

            {/* Floating icons around the badge */}
            {!reduced && (
              <>
                <motion.div
                  animate={{
                    y: [-10, 10, -10],
                    rotate: [0, 10, 0]
                  }}
                  transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                  style={{
                    position: 'absolute',
                    top: 20,
                    left: '20%',
                    fontSize: 28
                  }}
                >
                  ✨
                </motion.div>
                <motion.div
                  animate={{
                    y: [-10, 10, -10],
                    rotate: [0, -10, 0]
                  }}
                  transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
                  style={{
                    position: 'absolute',
                    top: 20,
                    right: '20%',
                    fontSize: 28
                  }}
                >
                  💡
                </motion.div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </SlideContainer>
  );
};

Ch9_S2_ClosingThanks.metadata = {
  chapter: 9,
  slide: 2,
  title: "Thank You",
  audioSegments: [
    {
      id: "intro",
      audioFilePath: "/audio/c9/s2_segment_01_intro.wav",
      narrationText: "Thank you for exploring Meeting Highlights."
    },
    {
      id: "value",
      audioFilePath: "/audio/c9/s2_segment_02_value.wav",
      narrationText: "Our goal is simple: help you reclaim time and stay aligned."
    },
    {
      id: "feedback",
      audioFilePath: "/audio/c9/s2_segment_03_feedback.wav",
      narrationText: "Send feedback to meeting H-L Devs at microsoft.com."
    },
      {
        id: "cta",
        audioFilePath: "/audio/c9/s2_segment_04_cta.wav",
        narrationText: "Try it now in BizChat and SharePoint."
      }
    ]
};