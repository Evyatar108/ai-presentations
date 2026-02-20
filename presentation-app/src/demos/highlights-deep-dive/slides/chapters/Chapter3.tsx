import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  useReducedMotion,
  useSegmentedAnimation,
  useTheme,
  defineSlide,
  SlideContainer,
  SlideTitle,
  typography,
  fadeUp,
} from '@framework';
import CodeBlock from '../components/CodeBlock';
import BeforeAfterSplit from '../components/BeforeAfterSplit';

/**
 * Chapter 3: Five Cost Drivers (2 slides)
 */

const COST_DRIVERS = [
  { num: 1, title: '4 sequential calls = 4x latency', desc: 'Each call waits for the previous one to finish' },
  { num: 2, title: 'Verbose JSON input', desc: 'Keys repeated per utterance (500+ times)' },
  { num: 3, title: 'Duplicated RAI rules', desc: '~60 lines x 3 prompts = 180 wasted lines' },
  { num: 4, title: 'Fragile markdown table parsing', desc: 'Output of each call parsed as input to the next' },
  { num: 5, title: 'Combinatorial candidate explosion O(n\u00B2)', desc: 'Nested loop generates thousands of candidate ranges' }
];

// ---------- Slide 1: Cost Drivers ----------

const Ch3_S1_CostDriversComponent: React.FC = () => {
  const { reduced } = useReducedMotion();
  const { isSegmentVisible, currentSegmentIndex } = useSegmentedAnimation();
  const theme = useTheme();

  return (
    <SlideContainer maxWidth={800}>
      <AnimatePresence>
        {isSegmentVisible(0) && (
          <SlideTitle reduced={reduced}>
            Five Structural Cost Drivers
          </SlideTitle>
        )}
      </AnimatePresence>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {COST_DRIVERS.map((driver, i) => {
          const segIdx = i + 1;
          const isLast = i === COST_DRIVERS.length - 1;

          return (
            <AnimatePresence key={driver.num}>
              {isSegmentVisible(segIdx) && (
                <motion.div
                  variants={fadeUp(reduced)}
                  initial="hidden"
                  animate="visible"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                    padding: '1rem 1.25rem',
                    borderRadius: 12,
                    background: isLast && currentSegmentIndex >= segIdx
                      ? 'rgba(239, 68, 68, 0.1)'
                      : theme.colors.bgSurface,
                    border: isLast && currentSegmentIndex >= segIdx
                      ? '2px solid rgba(239, 68, 68, 0.4)'
                      : `1px solid ${theme.colors.bgBorder}`,
                    boxShadow: isLast && currentSegmentIndex >= segIdx && !reduced
                      ? '0 0 20px rgba(239, 68, 68, 0.15)'
                      : 'none',
                    transition: 'all 0.3s ease'
                  }}
                >
                  <div style={{
                    width: 32,
                    height: 32,
                    borderRadius: '50%',
                    background: isLast
                      ? `linear-gradient(135deg, ${theme.colors.error}, #dc2626)`
                      : `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.secondary})`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 14,
                    fontWeight: 700,
                    color: '#fff',
                    flexShrink: 0
                  }}>
                    {driver.num}
                  </div>
                  <div style={{ textAlign: 'left' }}>
                    <div style={{
                      ...typography.body,
                      fontSize: 16,
                      fontWeight: 600,
                      color: isLast ? theme.colors.error : theme.colors.textPrimary
                    }}>
                      {driver.title}
                    </div>
                    <div style={{ ...typography.caption, fontSize: 13 }}>
                      {driver.desc}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          );
        })}
      </div>
    </SlideContainer>
  );
};

export const Ch3_S1_CostDrivers = defineSlide({
  metadata: {
    chapter: 3,
    slide: 1,
    title: 'Five Cost Drivers',
    audioSegments: [
      { id: 'title', audioFilePath: '/audio/highlights-deep-dive/c3/s1_segment_01_title.wav' },
      { id: 'driver1', audioFilePath: '/audio/highlights-deep-dive/c3/s1_segment_02_driver1.wav' },
      { id: 'driver2', audioFilePath: '/audio/highlights-deep-dive/c3/s1_segment_03_driver2.wav' },
      { id: 'driver3', audioFilePath: '/audio/highlights-deep-dive/c3/s1_segment_04_driver3.wav' },
      { id: 'driver4', audioFilePath: '/audio/highlights-deep-dive/c3/s1_segment_05_driver4.wav' },
      { id: 'driver5', audioFilePath: '/audio/highlights-deep-dive/c3/s1_segment_06_driver5.wav' }
    ]
  },
  component: Ch3_S1_CostDriversComponent
});

// ---------- Slide 2: Verbose JSON ----------

const VERBOSE_JSON = `{"Index": 0, "Speaker": "Alice",
 "Start": 0.0, "End": 3.2,
 "Utterance": "Welcome everyone"}
{"Index": 1, "Speaker": "Alice",
 "Start": 3.2, "End": 7.5,
 "Utterance": "Let's review the metrics"}
{"Index": 2, "Speaker": "Bob",
 "Start": 7.5, "End": 12.1,
 "Utterance": "Across all key engagement..."}

// Keys "Index","Speaker","Start","End","Utterance"
//   repeated 500+ times in a typical meeting`;

const TOKEN_COUNTER = `Keys per utterance:  5
Utterances:         500
Wasted key tokens: ~2,500+
(before any content)`;

const Ch3_S2_VerboseJSONComponent: React.FC = () => {
  const { reduced } = useReducedMotion();
  const { isSegmentVisible } = useSegmentedAnimation();
  const theme = useTheme();

  return (
    <SlideContainer maxWidth={1050} textAlign="left">
      <AnimatePresence>
        {isSegmentVisible(0) && (
          <BeforeAfterSplit
            beforeTitle="V1: Verbose JSON Input"
            afterTitle="Token Waste"
            beforeContent={
              <CodeBlock code={VERBOSE_JSON} language="json" fontSize={12} />
            }
            afterContent={
              <div style={{
                fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                fontSize: 14,
                color: theme.colors.warning,
                lineHeight: 2,
                padding: '1rem'
              }}>
                {TOKEN_COUNTER.split('\n').map((line, i) => (
                  <div key={i}>{line}</div>
                ))}
              </div>
            }
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isSegmentVisible(1) && (
          <motion.div
            variants={fadeUp(reduced)}
            initial="hidden"
            animate="visible"
            style={{ textAlign: 'center', marginTop: '1.5rem' }}
          >
            <p style={{ ...typography.caption, fontSize: 16 }}>
              Thousands of tokens spent on <span style={{ color: theme.colors.warning, fontWeight: 600 }}>structural noise</span>
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </SlideContainer>
  );
};

export const Ch3_S2_VerboseJSON = defineSlide({
  metadata: {
    chapter: 3,
    slide: 2,
    title: 'Verbose JSON',
    audioSegments: [
      { id: 'comparison', audioFilePath: '/audio/highlights-deep-dive/c3/s2_segment_01_comparison.wav' },
      { id: 'caption', audioFilePath: '/audio/highlights-deep-dive/c3/s2_segment_02_caption.wav' }
    ]
  },
  component: Ch3_S2_VerboseJSONComponent
});
