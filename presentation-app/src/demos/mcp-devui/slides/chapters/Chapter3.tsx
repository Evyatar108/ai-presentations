import React from 'react';
import {
  defineSlide,
  useTheme,
  useSegmentedAnimation,
  SlideContainer,
  Reveal,
  fadeUp,
} from '@framework';
import { ToolCategoryMap } from '../../components/ToolCategoryMap';

/**
 * Chapter 3: "The Full Toolkit"
 * Ch3_S1 — 21 Tools at Your Fingertips
 */

const CATEGORY_SEQUENCE: Array<string | undefined> = [
  undefined,   // segment 0: full map
  'telemetry', // segment 1: highlight telemetry
  undefined,   // segment 2: back to full view
];

const ToolMapOverviewComponent: React.FC = () => {
  const { currentSegmentIndex } = useSegmentedAnimation();
  const theme = useTheme();
  const activeCategory = CATEGORY_SEQUENCE[currentSegmentIndex];

  return (
    <SlideContainer>
      <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        <Reveal from={0} animation={fadeUp}>
          <h2
            style={{
              textAlign: 'center',
              fontSize: 28,
              fontWeight: 700,
              margin: '0 0 12px 0',
              color: theme.colors.textPrimary,
            }}
          >
            21 Tools at Your Fingertips
          </h2>
        </Reveal>
        <div style={{ flex: 1, minHeight: 0 }}>
          <ToolCategoryMap
            activeCategory={activeCategory}
            showTools={true}
          />
        </div>
      </div>
    </SlideContainer>
  );
};

export const Ch3_S1_ToolMapOverview = defineSlide({
  metadata: {
    chapter: 3,
    slide: 1,
    title: '21 Tools at Your Fingertips',
    audioSegments: [
      {
        id: 0,
        narrationText:
          "You just saw four workflows. Here are all twenty-one tools — every Dev-UI surface your agent can access. Symptom reports, telemetry detail, execution flow, search — all via natural language.",
      },
      {
        id: 1,
        narrationText:
          "Telemetry and Diagnostics is the largest group with ten tools — it's where the real debugging power lives. Chat Execution has one tool for sending live requests, and Config Management has five tools for configs, settings, and test accounts.",
      },
      {
        id: 2,
        narrationText:
          'Load a conversation once, and every drill-down tool operates on the loaded data. No re-fetching. All via natural language — just ask the agent what you need.',
      },
    ],
  },
  component: ToolMapOverviewComponent,
});
