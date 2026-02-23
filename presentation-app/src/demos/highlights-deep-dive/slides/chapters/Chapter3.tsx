import React from 'react';
import {
  useReducedMotion,
  useSegmentedAnimation,
  useMarker,
  useTheme,
  defineSlide,
  SlideContainer,
  SlideTitle,
  Reveal,
  CodeBlock,
  BeforeAfterSplit,
  NumberedStepCard,
  typography,
  fadeUp,
} from '@framework';

/**
 * Chapter 3: Five Cost Drivers (2 slides)
 */

const COST_DRIVERS = [
  { num: 1, title: '4 sequential calls = 4x compute cost', desc: 'Each call consumes its own GPU allocation' },
  { num: 2, title: 'Verbose JSON input', desc: 'Keys repeated per utterance (500+ times)' },
  { num: 3, title: 'Fragile markdown table parsing', desc: 'Output of each call parsed as input to the next' },
  { num: 4, title: 'Combinatorial candidate explosion O(n\u00B2)', desc: 'Nested loop generates thousands of candidate ranges' }
];

// ---------- Slide 1: Cost Drivers ----------

const Ch3_S1_CostDriversComponent: React.FC = () => {
  const { reduced } = useReducedMotion();
  const { currentSegmentIndex } = useSegmentedAnimation();

  return (
    <SlideContainer maxWidth={800}>
      <Reveal from={0}>
        <SlideTitle reduced={reduced}>
          Four Structural Cost Drivers
        </SlideTitle>
      </Reveal>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {COST_DRIVERS.map((driver, i) => {
          const segIdx = i + 1;
          const isLast = i === COST_DRIVERS.length - 1;
          const isActive = isLast && currentSegmentIndex >= segIdx;

          return (
            <Reveal key={driver.num} from={segIdx} animation={fadeUp}>
              <NumberedStepCard
                number={driver.num}
                title={driver.title}
                description={driver.desc}
                isActive={isActive}
                variant={isLast ? 'error' : 'default'}
              />
            </Reveal>
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
    title: 'Four Cost Drivers',
    audioSegments: [
      { id: 'title' },
      { id: 'driver1' },
      { id: 'driver2' },
      { id: 'driver3' },
      { id: 'driver4' }
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
  const theme = useTheme();
  const { reached: jsonFocused } = useMarker('json-side');
  const { reached: counterFocused } = useMarker('counter-side');
  const anyFocused = jsonFocused || counterFocused;

  return (
    <SlideContainer maxWidth={1050} textAlign="left">
      <Reveal from={0}>
        <BeforeAfterSplit
          beforeTitle="V1 Call 1 (Abstractives): Input Format"
          afterTitle="Token Waste"
          beforeContent={
            <div style={{
              opacity: !anyFocused || jsonFocused ? 1 : 0.3,
              transition: 'opacity 0.4s ease',
            }}>
              <CodeBlock code={VERBOSE_JSON} language="json" fontSize={12} />
            </div>
          }
          afterContent={
            <div style={{
              fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
              fontSize: 14,
              color: theme.colors.warning,
              lineHeight: 2,
              padding: '1rem',
              opacity: !anyFocused || counterFocused ? 1 : 0.3,
              transition: 'opacity 0.4s ease',
            }}>
              {TOKEN_COUNTER.split('\n').map((line, i) => (
                <div key={i}>{line}</div>
              ))}
            </div>
          }
        />
      </Reveal>

      <Reveal from={1} animation={fadeUp} style={{ textAlign: 'center', marginTop: '1.5rem' }}>
        <p style={{ ...typography.caption, fontSize: 16 }}>
          Thousands of tokens spent on <span style={{ color: theme.colors.warning, fontWeight: 600 }}>structural noise</span>
        </p>
      </Reveal>
    </SlideContainer>
  );
};

export const Ch3_S2_VerboseJSON = defineSlide({
  metadata: {
    chapter: 3,
    slide: 2,
    title: 'Verbose JSON',
    audioSegments: [
      { id: 'comparison' },
      { id: 'caption' }
    ]
  },
  component: Ch3_S2_VerboseJSONComponent
});
