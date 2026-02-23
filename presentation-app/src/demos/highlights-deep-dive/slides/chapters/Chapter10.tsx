import React from 'react';
import {
  useReducedMotion,
  useSegmentedAnimation,
  useTheme,
  defineSlide,
  SlideContainer,
  SlideTitle,
  Reveal,
  RevealContext,
  RevealGroup,
  NumberedStepCard,
  GradientHighlightBox,
  fadeUp,
} from '@framework';

/**
 * Chapter 10: Lessons + Closing (2 slides)
 */

const LESSONS = [
  { num: 1, title: 'Challenge the multi-call assumption', desc: 'A single well-structured prompt can replace an entire pipeline' },
  { num: 2, title: 'Input format is a cost lever', desc: 'Compact representation (turn tags, pipe-delimited) slashes tokens' },
  { num: 3, title: 'Play to your model\'s strengths', desc: 'GPT-4o is code-trained — pseudocode gave it unambiguous, executable instructions' },
  { num: 4, title: 'Force the model to ground itself', desc: 'Copy-then-parse prevents hallucination of IDs and references' },
  { num: 5, title: 'Self-checks enable automation', desc: 'Boolean validators let you detect and retry failures automatically' },
  { num: 6, title: 'Build a local evaluation loop', desc: 'Quantitative error stats + qualitative video review accelerate prompt iteration' }
];

// ---------- Slide 1: Lessons ----------

const Ch10_S1_LessonsComponent: React.FC = () => {
  const { reduced } = useReducedMotion();
  const { currentSegmentIndex } = useSegmentedAnimation();

  return (
    <SlideContainer maxWidth={800}>
      <RevealContext animation={fadeUp}>
        <Reveal from={0}>
          <SlideTitle reduced={reduced}>
            Six Lessons for Your Next LLM Pipeline
          </SlideTitle>
        </Reveal>

        <RevealGroup from={1} stagger staggerDelay={0} childAnimation={fadeUp}>
          {LESSONS.map((lesson, i) => {
            const segIdx = i + 1;
            const isActive = currentSegmentIndex === segIdx;

            return (
              <Reveal key={lesson.num} from={segIdx}>
                <NumberedStepCard
                  number={lesson.num}
                  title={lesson.title}
                  description={lesson.desc}
                  isActive={isActive}
                />
              </Reveal>
            );
          })}
        </RevealGroup>
      </RevealContext>
    </SlideContainer>
  );
};

export const Ch10_S1_Lessons = defineSlide({
  metadata: {
    chapter: 10,
    slide: 1,
    title: 'Six Lessons',
    audioSegments: [
      { id: 'title' },
      { id: 'lesson1' },
      { id: 'lesson2' },
      { id: 'lesson3' },
      { id: 'lesson4' },
      { id: 'lesson5' },
      { id: 'lesson6' }
    ]
  },
  component: Ch10_S1_LessonsComponent
});

// ---------- Slide 2: Closing ----------

const Ch10_S2_ClosingComponent: React.FC = () => {
  const { reduced } = useReducedMotion();
  const theme = useTheme();

  return (
    <SlideContainer>
      <Reveal from={0} animation={(r) => ({
        hidden: { opacity: 0, scale: r ? 1 : 0.9 },
        visible: { opacity: 1, scale: 1, transition: { duration: r ? 0.3 : 0.8, type: 'spring' } }
      })} style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <h1 style={{
          fontSize: 56,
          fontWeight: 700,
          background: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.secondary})`,
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          marginBottom: '1rem'
        }}>
          Thank You
        </h1>
      </Reveal>

      <Reveal from={1} animation={fadeUp} style={{ textAlign: 'center' }}>
        <GradientHighlightBox reduced={reduced}>
          <span style={{ fontSize: 16, fontWeight: 600 }}>
            Try the techniques — prompt engineering scales
          </span>
        </GradientHighlightBox>
      </Reveal>
    </SlideContainer>
  );
};

export const Ch10_S2_Closing = defineSlide({
  metadata: {
    chapter: 10,
    slide: 2,
    title: 'Closing',
    audioSegments: [
      { id: 'thankyou' },
      { id: 'cta' }
    ]
  },
  component: Ch10_S2_ClosingComponent
});
