/**
 * Highlights Deep-Dive Demo Configuration
 *
 * Technical deep-dive into prompt engineering: from 4 LLM calls to 1.
 */

import type { DemoConfig, TimingConfig } from '@framework';
import { metadata } from './metadata';

const timing: TimingConfig = {
  betweenSegments: 1500,
  betweenSlides: 3500,
  afterFinalSlide: 5000
};

const demoConfig: DemoConfig = {
  metadata,
  defaultMode: 'manual',
  timing,
  chapters: {
    0: { title: 'Introduction' },
    1: { title: 'Problem Context' },
    2: { title: 'V1 Pipeline Architecture' },
    3: { title: 'Five Cost Drivers' },
    4: { title: 'The O(n\u00B2) Problem' },
    5: { title: 'Compact Transcript Table' },
    6: { title: 'Prompt Overview + Pseudocode' },
    7: { title: 'Copy-then-Parse + Self-Checks' },
    8: { title: 'Evaluation & Iteration' },
    9: { title: 'Results' },
    10: { title: 'Lessons + Closing' },
  },
  getSlides: async () => {
    const { allSlides } = await import('./slides/SlidesRegistry');
    return allSlides;
  }
};

export default demoConfig;
