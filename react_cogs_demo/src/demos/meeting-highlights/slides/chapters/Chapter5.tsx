import React from 'react';
import { motion } from 'framer-motion';
import { useReducedMotion } from '../../../../accessibility/ReducedMotion';
import { MetricTile } from '../../../../components/CoreComponents';
import { SlideComponentWithMetadata } from '../../../../slides/SlideMetadata';
import { SlideContainer } from '../../../../slides/SlideLayouts';
import { typography, gradientBox, layouts } from '../../../../slides/SlideStyles';
import { staggerContainer, tileVariants, arrowVariants, targetVariants, promptVariants } from '../../../../slides/AnimationVariants';
import { ArrowDown, ArrowRight } from '../../../../slides/SlideIcons';

/**
 * Chapter 5: COGS Challenge
 * 1 slide showing the cost optimization challenge
 */

/**
 * Chapter 5, Slide 1 - Challenge Framing
 * BEFORE metrics → TARGET unified approach
 */
export const Ch5_S1_ChallengeFraming: SlideComponentWithMetadata = () => {
  const { reduced } = useReducedMotion();

  return (
    <SlideContainer maxWidth={900}>
      <motion.div
        variants={staggerContainer(reduced)}
        initial="hidden"
        animate="visible"
      >
        <h1 style={{ ...typography.h1, marginBottom: '2rem' }}>
          Meeting Highlights Cost Optimization
        </h1>
        
        {/* Problem metrics with warning indicators */}
        <motion.div style={layouts.flexRow()}>
          <motion.div variants={tileVariants(reduced)}>
            <MetricTile label="LLM Calls" after="4" note="Sequential pipeline" />
          </motion.div>
          <motion.div variants={tileVariants(reduced)}>
            <MetricTile label="Projected GPUs" after="~600" note="High capacity" />
          </motion.div>
          <motion.div variants={tileVariants(reduced)}>
            <MetricTile label="Input Tokens" after="High" note="Verbose format" />
          </motion.div>
        </motion.div>

        {/* Side-by-side layout: Stacked LLM calls on left, Question on right */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '3rem',
          margin: '2.5rem 0',
          justifyContent: 'center'
        }}>
          {/* Visual metaphor: Stack of complexity - building up from small to large */}
          <motion.div
            variants={arrowVariants(reduced)}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '1rem'
            }}
          >
            {/* Stacked boxes representing complexity/cost accumulating */}
            {[
              { num: 1, label: 'Low Cost' },
              { num: 2, label: 'Medium Cost' },
              { num: 3, label: 'High Cost' },
              { num: 4, label: 'Very High Cost' }
            ].map((call, index) => {
              const layer = index + 1;
              return (
                <motion.div
                  key={call.num}
                  initial={{ opacity: 0, scale: 0.8, y: -20 }}
                  animate={{
                    opacity: 0.3 + (layer * 0.15),
                    scale: 1,
                    y: 0
                  }}
                  transition={{
                    delay: reduced ? 0.3 + (layer * 0.1) : 0.5 + (layer * 0.15),
                    duration: reduced ? 0.3 : 0.5
                  }}
                  style={{
                    width: `${180 + (layer * 25)}px`,
                    height: '45px',
                    background: `linear-gradient(135deg,
                      rgba(239, 68, 68, ${0.4 + layer * 0.15}),
                      rgba(220, 38, 38, ${0.3 + layer * 0.15}))`,
                    borderRadius: 8,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#fff',
                    fontSize: 14,
                    fontWeight: 600,
                    boxShadow: `0 4px 12px rgba(239, 68, 68, ${0.2 + layer * 0.1})`,
                    border: '2px solid rgba(255, 255, 255, 0.1)'
                  }}
                >
                  LLM Call {call.num} • {call.label}
                </motion.div>
              );
            })}
          </motion.div>

          {/* Question mark - what's the solution? */}
          <motion.div
            variants={targetVariants(reduced)}
            style={{
              background: 'linear-gradient(135deg, #1e3a52, #0f2537)',
              borderRadius: 16,
              padding: '2rem',
              textAlign: 'center',
              border: '3px dashed rgba(0, 183, 195, 0.4)',
              boxShadow: reduced ? 'none' : '0 0 30px rgba(0, 183, 195, 0.2)',
              minWidth: '280px'
            }}
          >
            <div style={{
              fontSize: 64,
              color: '#00B7C3',
              marginBottom: '0.5rem',
              fontWeight: 'bold'
            }}>
              ?
            </div>
            <h2 style={{ color: '#f1f5f9', margin: 0, fontSize: 20 }}>
              How can we optimize?
            </h2>
          </motion.div>
        </div>

      </motion.div>
    </SlideContainer>
  );
};

Ch5_S1_ChallengeFraming.metadata = {
  chapter: 5,
  slide: 1,
  title: "Challenge Framing",
  audioSegments: [{
    id: "main",
    audioFilePath: "/audio/meeting-highlights/c5/s1_segment_01_main.wav",
    narrationText: "Our current Meeting Highlights implementation makes 4 sequential calls to L-L-M, with a large amount of tokens. To enable global scaling, we needed to dramatically reduce these computational costs."
  }]
};
