import React from 'react';
import {
  useReducedMotion,
  useSegmentedAnimation,
  useTheme,
  useMarker,
  defineSlide,
  SlideContainer,
  SlideTitle,
  Reveal,
  CodeBlock,
  BeforeAfterSplit,
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
  const theme = useTheme();

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

          return (
            <Reveal key={driver.num} from={segIdx} animation={fadeUp} style={{
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
            }}>
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
