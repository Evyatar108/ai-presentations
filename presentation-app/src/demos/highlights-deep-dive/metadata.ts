/**
 * Highlights Deep-Dive Demo Metadata
 *
 * Technical deep-dive presentation about collapsing a 4-call GPT-4 pipeline
 * into a single unified prompt, reducing COGS by ~70%.
 * Target audience: engineering peers familiar with LLMs/prompt engineering.
 */

import type { DemoMetadata } from '@framework';

export const metadata: DemoMetadata = {
  id: 'highlights-deep-dive',
  title: 'Highlights Prompt Deep-Dive',
  description: 'Technical deep-dive into how we collapsed a 4-call GPT-4 pipeline into a single unified prompt — covering the O(n²) candidate explosion, compact transcript format, pseudocode algorithm, copy-then-parse pattern, and self-checks. Reduced COGS by ~70%.',
  thumbnail: '/images/highlights-deep-dive/thumbnail.png',
  tags: ['prompt-engineering', 'llm', 'optimization', 'cogs', 'deep-dive', 'technical'],

  useExternalNarration: true,
  narrationFallback: 'silent',

  durationInfo: {
    audioOnly: 0,
    segmentDelays: 0,
    slideDelays: 0,
    finalDelay: 2,
    startSilence: 1,
    total: 0,
    slideBreakdown: []
  }
};
