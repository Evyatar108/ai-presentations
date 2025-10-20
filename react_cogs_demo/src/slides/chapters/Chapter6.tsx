import React from 'react';
import { motion } from 'framer-motion';
import { useReducedMotion } from '../../accessibility/ReducedMotion';
import { MetricTile } from '../../components/CoreComponents';
import { SlideComponentWithMetadata } from '../SlideMetadata';
import { SlideContainer, ContentCard, SlideTitle } from '../SlideLayouts';
import { typography, gradientBox, layouts } from '../SlideStyles';
import { fadeUp, scaleIn } from '../AnimationVariants';

/**
 * Chapter 6: Optimization Solution
 * 3 slides showing the unified prompt solution
 */

/**
 * Chapter 6, Slide 1 - Unified Convergence
 */
export const Ch6_S1_UnifiedConvergence: SlideComponentWithMetadata = () => {
  const { reduced } = useReducedMotion();

  return (
    <div style={{
      background: '#0f172a',
      minHeight: '100vh',
      width: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem',
      fontFamily: 'Inter, system-ui, sans-serif'
    }}>
      <div style={{ maxWidth: 900, width: '100%', textAlign: 'center' }}>
        <h1 style={{ color: '#f1f5f9', marginBottom: '3rem' }}>
          Unified Single Prompt
        </h1>

        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: reduced ? 0.3 : 0.8, type: 'spring' }}
          style={{ position: 'relative', display: 'inline-block' }}
        >
          {/* Central unified node */}
          <motion.div
            style={{
              width: 200,
              height: 200,
              background: 'linear-gradient(135deg, #00B7C3, #0078D4)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: reduced ? '0 8px 24px rgba(0, 183, 195, 0.4)' : '0 0 60px rgba(0, 183, 195, 0.6)',
              position: 'relative',
              zIndex: 2
            }}
            animate={reduced ? {} : {
              boxShadow: [
                '0 0 60px rgba(0, 183, 195, 0.6)',
                '0 0 80px rgba(0, 183, 195, 0.8)',
                '0 0 60px rgba(0, 183, 195, 0.6)'
              ]
            }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <div style={{ color: '#fff', fontSize: 24, fontWeight: 'bold', textAlign: 'center' }}>
              Unified<br/>Prompt
            </div>
          </motion.div>

          {/* Converging lines */}
          {!reduced && [0, 90, 180, 270].map((angle, idx) => (
            <motion.div
              key={angle}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: [1, 0], scale: [1, 0] }}
              transition={{
                duration: 1.2,
                delay: idx * 0.1,
                repeat: Infinity,
                repeatDelay: 2
              }}
              style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                width: 120,
                height: 2,
                background: 'linear-gradient(90deg, #00B7C3, transparent)',
                transformOrigin: 'left center',
                transform: `translate(-50%, -50%) rotate(${angle}deg)`
              }}
            />
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: reduced ? 0.3 : 1, duration: 0.5 }}
          style={{ marginTop: '3rem' }}
        >
          <div style={{ fontSize: 48, fontWeight: 'bold', color: '#00B7C3', marginBottom: '1rem' }}>
            <span style={{ textDecoration: 'line-through', opacity: 0.6 }}>4</span> → 1 Call
          </div>
        </motion.div>
      </div>
    </div>
  );
};

Ch6_S1_UnifiedConvergence.metadata = {
  chapter: 6,
  slide: 1,
  title: "Unified Convergence",
  audioSegments: [{
    id: "main",
    audioFilePath: "/audio/c6/s1_segment_01_main.wav",
    narrationText: "Our solution was to collapse the four sequential steps into one unified prompt. By designing a single comprehensive prompt that accomplishes the same four steps in one L-L-M call."
  }]
};

/**
 * Chapter 6, Slide 4 - Token Optimization
 */
export const Ch6_S4_TokenOptimization: SlideComponentWithMetadata = () => {
  const { reduced } = useReducedMotion();

  return (
    <SlideContainer maxWidth={800}>
      <SlideTitle reduced={reduced}>
        Input Token Optimization
      </SlideTitle>

      <motion.div
        variants={scaleIn(reduced)}
        initial="hidden"
        animate="visible"
      >
        <ContentCard>
          <p style={{ ...typography.body, marginTop: 0, marginBottom: '2rem' }}>
            Beyond reducing LLM calls, we transformed the input approach: switching from verbose JSON to compact schema, and critically, eliminating pre-computed candidate ranges—now the model selects extractive ranges directly from the transcript. This required extensive prompt tuning but dramatically reduced input tokens.
          </p>

          <div style={{ ...layouts.flexRow('1rem'), flexWrap: 'wrap' }}>
            <MetricTile label="Abstractive Input" before="Verbose JSON" after="Compact Schema" note="Format streamlined" />
            <MetricTile label="Extractive Input" before="Candidate Range Combinations" after="Direct Selection" note="Model-driven" emphasis />
            <MetricTile label="Total Tokens" before="Higher" after="Lower" note="Per meeting" />
          </div>
        </ContentCard>
      </motion.div>
    </SlideContainer>
  );
};

Ch6_S4_TokenOptimization.metadata = {
  chapter: 6,
  slide: 4,
  title: "Token Optimization",
  audioSegments: [{
    id: "main",
    audioFilePath: "/audio/c6/s4_segment_01_main.wav",
    narrationText: "Beyond reducing L-L-M calls, we optimized the input tokens themselves, which reduced input tokens by more than 60 percent."
  }]
};