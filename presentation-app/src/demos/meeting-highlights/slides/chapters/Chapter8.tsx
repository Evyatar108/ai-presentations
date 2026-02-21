import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  useReducedMotion,
  useTheme,
  useSegmentedAnimation,
  defineSlide,
  SlideContainer,
  typography,
  gradientBox,
  successGradientBox,
} from '@framework';

/**
 * Chapter 8: User Reception
 * Single slide showing user satisfaction metrics
 */

const Ch8_S1_UserSatisfactionComponent: React.FC = () => {
  const { reduced } = useReducedMotion();
  const theme = useTheme();
  const { isSegmentVisible } = useSegmentedAnimation();

  return (
    <SlideContainer maxWidth={1000}>
      {/* Animated background with floating emojis */}
      <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
        {!reduced && ['⭐', '👍', '🎉', '💯', '✨'].map((emoji, i) => (
          <motion.div
            key={i}
            initial={{
              x: Math.random() * window.innerWidth,
              y: window.innerHeight + 50,
              opacity: 0,
              rotate: 0
            }}
            animate={{
              y: -100,
              opacity: [0, 0.6, 0],
              rotate: 360
            }}
            transition={{
              duration: 4 + Math.random() * 2,
              repeat: Infinity,
              delay: i * 1.5,
              ease: 'linear'
            }}
            style={{
              position: 'absolute',
              fontSize: 24,
            }}
          >
            {emoji}
          </motion.div>
        ))}
      </div>

      <AnimatePresence>
        {isSegmentVisible(0) && (
          <motion.div
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: reduced ? 0.3 : 0.6 }}
            style={{ textAlign: 'center', marginBottom: '2.5rem', position: 'relative', zIndex: 1 }}
          >
            <h1 style={{
              ...typography.h1,
              fontSize: 48,
              marginBottom: '0.5rem',
              background: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.success})`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}>
              User Reception
            </h1>
            <p style={{ ...typography.body, fontSize: 16, color: theme.colors.textSecondary, margin: 0 }}>
              MS Elite Survey Results
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '2.5rem', position: 'relative', zIndex: 1, alignItems: 'start' }}>
        {isSegmentVisible(1) && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, rotateY: -20 }}
            animate={{ opacity: 1, scale: 1, rotateY: 0 }}
            transition={{
              duration: reduced ? 0.3 : 0.7,
              type: 'spring',
              stiffness: 100
            }}
            style={{
              ...gradientBox,
              padding: '3.5rem 2.5rem',
              boxShadow: !reduced ? '0 0 50px rgba(0, 183, 195, 0.4)' : 'none',
              position: 'relative',
              overflow: 'hidden',
              minHeight: 320,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center'
            }}
          >
            {/* Animated background shimmer */}
            {!reduced && (
              <motion.div
                animate={{
                  x: ['-100%', '200%']
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  repeatDelay: 2,
                  ease: 'easeInOut'
                }}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)',
                  transform: 'skewX(-20deg)'
                }}
              />
            )}

            <div style={{ position: 'relative' }}>
              <div style={{
                fontSize: 80,
                fontWeight: 'bold',
                color: '#f8fafc',
                marginBottom: '1rem',
                textShadow: '0 0 30px rgba(0, 183, 195, 1), 0 0 60px rgba(0, 183, 195, 0.7)',
                filter: 'drop-shadow(0 0 12px rgba(0, 183, 195, 0.6))'
              }}>
                80%
              </div>
            </div>

            <div style={{ ...typography.h2, fontSize: 20, marginBottom: '1rem', position: 'relative' }}>
              Extremely/Very Useful
            </div>

            <div style={{ ...typography.caption, fontSize: 24, position: 'relative' }}>
              ⭐⭐⭐⭐⭐
            </div>
          </motion.div>
        )}

        {isSegmentVisible(2) && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, rotateY: 20 }}
            animate={{ opacity: 1, scale: 1, rotateY: 0 }}
            transition={{
              duration: reduced ? 0.3 : 0.7,
              type: 'spring',
              stiffness: 100,
              delay: 0.2
            }}
            style={{
              ...successGradientBox,
              padding: '3.5rem 2.5rem',
              boxShadow: !reduced ? '0 0 50px rgba(16, 185, 129, 0.4)' : 'none',
              position: 'relative',
              overflow: 'hidden',
              minHeight: 320,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center'
            }}
          >
            {/* Animated background shimmer */}
            {!reduced && (
              <motion.div
                animate={{
                  x: ['-100%', '200%']
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  repeatDelay: 2,
                  delay: 1,
                  ease: 'easeInOut'
                }}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)',
                  transform: 'skewX(-20deg)'
                }}
              />
            )}

            <div style={{ position: 'relative' }}>
              <div style={{
                fontSize: 80,
                fontWeight: 'bold',
                color: '#f8fafc',
                marginBottom: '1rem',
                textShadow: '0 0 30px rgba(16, 185, 129, 1), 0 0 60px rgba(16, 185, 129, 0.7)',
                filter: 'drop-shadow(0 0 12px rgba(16, 185, 129, 0.6))'
              }}>
                96%
              </div>
            </div>

            <div style={{ ...typography.h2, fontSize: 20, marginBottom: '1rem', position: 'relative' }}>
              Likely to Use Again
            </div>

            <div style={{ ...typography.caption, fontSize: 32, position: 'relative' }}>
              👍👍👍
            </div>
          </motion.div>
        )}
      </div>

      <AnimatePresence>
        {isSegmentVisible(3) && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{
              duration: reduced ? 0.3 : 0.6,
              type: 'spring'
            }}
            style={{ marginTop: '3rem', position: 'relative', zIndex: 1 }}
          >
            <motion.div
              whileHover={reduced ? {} : { scale: 1.02 }}
              style={{
                background: `linear-gradient(135deg, ${theme.colors.bgSurface}, ${theme.colors.bgDeep})`,
                borderRadius: 16,
                padding: '2rem 2.5rem',
                border: `2px solid ${theme.colors.bgBorder}`,
                boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)',
                textAlign: 'center',
                position: 'relative',
                overflow: 'hidden'
              }}
            >
              {/* Glowing border effect */}
              {!reduced && (
                <motion.div
                  animate={{
                    opacity: [0.3, 0.6, 0.3],
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                  style={{
                    position: 'absolute',
                    inset: -2,
                    background: `linear-gradient(45deg, ${theme.colors.primary}, ${theme.colors.success})`,
                    borderRadius: 16,
                    zIndex: 0,
                    filter: 'blur(10px)'
                  }}
                />
              )}

              <div style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem' }}>
                <motion.span
                  animate={reduced ? {} : {
                    rotate: [0, 10, -10, 0],
                    scale: [1, 1.2, 1]
                  }}
                  transition={{ duration: 2, repeat: Infinity, repeatDelay: 2 }}
                  style={{ fontSize: 32 }}
                >
                  🎯
                </motion.span>
                <p style={{ ...typography.body, fontSize: 22, fontWeight: 600, margin: 0, color: theme.colors.textPrimary }}>
                  Strong product-market fit and daily habit formation
                </p>
                <motion.span
                  animate={reduced ? {} : {
                    rotate: [0, -10, 10, 0],
                    scale: [1, 1.2, 1]
                  }}
                  transition={{ duration: 2, repeat: Infinity, repeatDelay: 2, delay: 0.5 }}
                  style={{ fontSize: 32 }}
                >
                  📈
                </motion.span>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </SlideContainer>
  );
};

export const Ch8_S1_UserSatisfaction = defineSlide({
  metadata: {
    chapter: 8,
    slide: 1,
    title: "User Satisfaction",
    audioSegments: [
      {
        id: "intro",
      },
      {
        id: "useful",
      },
      {
        id: "likely",
      },
      {
        id: "fit",
      }
    ]
  },
  component: Ch8_S1_UserSatisfactionComponent
});