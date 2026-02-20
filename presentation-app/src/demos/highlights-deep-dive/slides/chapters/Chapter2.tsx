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
import PipelineDiagram from '../components/PipelineDiagram';
import CodeBlock from '../components/CodeBlock';

/**
 * Chapter 2: V1 Pipeline Architecture (2 slides)
 */

// ---------- Slide 1: Four Calls ----------

const Ch2_S1_FourCallsComponent: React.FC = () => {
  const { reduced } = useReducedMotion();
  const { isSegmentVisible, currentSegmentIndex } = useSegmentedAnimation();

  // Segments 0=title, 1-4=each pipeline step
  const visibleSteps = Math.max(0, currentSegmentIndex);

  return (
    <SlideContainer maxWidth={900}>
      <AnimatePresence>
        {isSegmentVisible(0) && (
          <SlideTitle reduced={reduced}>
            The Four-Call Pipeline
          </SlideTitle>
        )}
      </AnimatePresence>

      {isSegmentVisible(1) && (
        <PipelineDiagram visibleSteps={visibleSteps} />
      )}
    </SlideContainer>
  );
};

export const Ch2_S1_FourCalls = defineSlide({
  metadata: {
    chapter: 2,
    slide: 1,
    title: 'Four-Call Pipeline',
    audioSegments: [
      { id: 'title', audioFilePath: '/audio/highlights-deep-dive/c2/s1_segment_01_title.wav' },
      { id: 'call1', audioFilePath: '/audio/highlights-deep-dive/c2/s1_segment_02_call1.wav' },
      { id: 'call2', audioFilePath: '/audio/highlights-deep-dive/c2/s1_segment_03_call2.wav' },
      { id: 'call3', audioFilePath: '/audio/highlights-deep-dive/c2/s1_segment_04_call3.wav' },
      { id: 'call4', audioFilePath: '/audio/highlights-deep-dive/c2/s1_segment_05_call4.wav' }
    ]
  },
  component: Ch2_S1_FourCallsComponent
});

// ---------- Slide 2: Call Detail ----------

const ABSTRACTIVES_CODE = `class HighlightsPromptMaper(PromptMaper):
    def add_prompts_values(self):
        self.query_to_prompt["highlights_abstractives"] = Query(
            first_model_query="",
            run_only_on_last=True,
            limit_max_token=4096,
            first_prompt_template="""
<|im_start|>system
# General instructions
- Envision yourself as a video editor...
- Create two types of sections:
    abstractive and extractive...

# RAI Rules:            (~20 lines)
- You will never provide profiling...
- You will never speculate...

# Detailed instructions  (~40 lines)
...
""")`;

const Ch2_S2_CallDetailComponent: React.FC = () => {
  const { reduced } = useReducedMotion();
  const { isSegmentVisible } = useSegmentedAnimation();
  const theme = useTheme();

  return (
    <SlideContainer maxWidth={1000} textAlign="left">
      <AnimatePresence>
        {isSegmentVisible(0) && (
          <CodeBlock
            code={ABSTRACTIVES_CODE}
            language="python"
            title="HighlightsPromptMaper.py  --  highlights_abstractives query"
            highlightLines={[3, 10, 11, 14, 15]}
            fontSize={12}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isSegmentVisible(1) && (
          <motion.div
            variants={fadeUp(reduced)}
            initial="hidden"
            animate="visible"
            style={{
              display: 'flex',
              gap: '1rem',
              marginTop: '1.5rem',
              justifyContent: 'center'
            }}
          >
            {[
              { label: 'RAI rules', detail: '~20 lines repeated per prompt', color: theme.colors.warning },
              { label: 'Prose instructions', detail: 'Paragraph-style directions', color: theme.colors.textSecondary },
              { label: 'Markdown table output', detail: 'Passed between calls', color: theme.colors.primary }
            ].map((item) => (
              <div key={item.label} style={{
                background: theme.colors.bgSurface,
                border: `1px solid ${theme.colors.bgBorder}`,
                borderRadius: 10,
                padding: '0.75rem 1rem',
                borderLeft: `3px solid ${item.color}`,
                flex: 1
              }}>
                <div style={{ ...typography.body, fontSize: 14, fontWeight: 600 }}>{item.label}</div>
                <div style={{ ...typography.caption, fontSize: 12 }}>{item.detail}</div>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </SlideContainer>
  );
};

export const Ch2_S2_CallDetail = defineSlide({
  metadata: {
    chapter: 2,
    slide: 2,
    title: 'Call Detail',
    audioSegments: [
      { id: 'code', audioFilePath: '/audio/highlights-deep-dive/c2/s2_segment_01_code.wav' },
      { id: 'annotations', audioFilePath: '/audio/highlights-deep-dive/c2/s2_segment_02_annotations.wav' }
    ]
  },
  component: Ch2_S2_CallDetailComponent
});
