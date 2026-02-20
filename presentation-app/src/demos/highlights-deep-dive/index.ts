/**
 * Highlights Deep-Dive Demo Configuration
 *
 * Technical deep-dive into prompt engineering: from 4 LLM calls to 1.
 */

import type { DemoConfig, TimingConfig } from '@framework';
import { metadata } from './metadata';

const timing: TimingConfig = {
  betweenSegments: 1500,
  betweenSlides: 3000,
  afterFinalSlide: 2000
};

const demoConfig: DemoConfig = {
  metadata,
  defaultMode: 'manual',
  timing,
  getSlides: async () => {
    const { allSlides } = await import('./slides/SlidesRegistry');
    return allSlides;
  }
};

export default demoConfig;
