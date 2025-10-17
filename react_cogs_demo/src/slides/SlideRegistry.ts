import React from 'react';

export interface SlideSpec {
  id: number;
  title: string;
  Component: React.FC;
  durationMs?: number;
  script?: string;
}

/**
 * Utility to build simple element trees without JSX (file uses .ts extension).
 */
const E = React.createElement;

// Placeholder components (replace with animated versions later)
const Challenge: React.FC = () =>
  E('div', null,
    E('h2', null, 'Problem: Fragmented 4-call pipeline'),
    E('p', null, 'V1 required 4 sequential LLM calls (topics, extraction, ranking, narrative).'),
    E('p', null, 'High GPU estimate (~600) due to parallel capacity + latency padding.')
  );

const PipelineV1: React.FC = () =>
  E('div', null,
    E('h2', null, 'V1 Pipeline (4 Prompts)'),
    E('ol', null,
      E('li', null, 'Prompt 1: Topic abstraction'),
      E('li', null, 'Prompt 2: Extractive selection'),
      E('li', null, 'Prompt 3: Ranking & pruning'),
      E('li', null, 'Prompt 4: Narrative synthesis'),
    )
  );

const UnifiedPrompt: React.FC = () =>
  E('div', null,
    E('h2', null, 'V2 Unified Prompt'),
    E('p', null, 'All stages fused into one structured output schema.'),
    E('p', null, 'LLM calls reduced 4 ➜ 1; orchestration + token overhead removed.')
  );

const CallsReduction: React.FC = () =>
  E('div', null,
    E('h2', null, 'Compute Impact'),
    E('p', null, 'Calls: 4 ➜ 1'),
    E('p', null, 'Estimated GPUs: ~600 ➜ ~200'),
    E('p', null, 'Drivers: fewer concurrency slots, lower tokens, simpler retry logic.')
  );

const QualityPreference: React.FC = () =>
  E('div', null,
    E('h2', null, 'Quality Feedback'),
    E('p', null, 'Early reviewers strongly prefer unified prompt highlight videos.'),
    E('p', null, 'Improved cohesion, reduced redundancy, clearer narrative.')
  );

const Roadmap: React.FC = () =>
  E('div', null,
    E('h2', null, 'Roadmap'),
    E('ul', null,
      E('li', null, 'Replace placeholders with animated components'),
      E('li', null, 'Add GPU rack + token bar visuals'),
      E('li', null, 'Integrate script excerpts'),
      E('li', null, 'Accessibility & reduced motion'),
      E('li', null, 'Optional Remotion video export'),
    )
  );

export const slides: SlideSpec[] = [
  { id: 19, title: 'Challenge', Component: Challenge },
  { id: 20, title: 'V1 Pipeline', Component: PipelineV1 },
  { id: 21, title: 'Unified Prompt', Component: UnifiedPrompt },
  { id: 22, title: 'Compute Impact', Component: CallsReduction },
  { id: 23, title: 'Quality Preference', Component: QualityPreference },
  { id: 24, title: 'Roadmap', Component: Roadmap },
];

export const getSlideById = (id: number) => slides.find(s => s.id === id);

// NOTE: Key demo messages preserved: 4→1 calls, GPUs ~600→~200, improved quality.