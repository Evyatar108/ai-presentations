/**
 * MCP DevUI Demo Configuration
 *
 * 22 debugging tools for Copilot conversations.
 * 10 slides, 6 chapters — workflow-focused.
 */

import type { DemoConfig, TimingConfig } from '@framework';
import { metadata } from './metadata';

const timing: TimingConfig = {
  betweenSegments: 1500,
  betweenSlides: 3000,
  afterFinalSlide: 5000
};

const demoConfig: DemoConfig = {
  metadata,
  defaultMode: 'narrated',
  timing,
  chapters: {
    0: { title: 'The Problem' },
    1: { title: 'The Toolkit' },
    2: { title: 'What You Can Do' },
    3: { title: 'The Full Toolkit' },
    4: { title: 'Going Further' },
    5: { title: 'Get Started' },
  },
  getSlides: async () => {
    const { allSlides } = await import('./slides/SlidesRegistry');
    return allSlides;
  }
};

export default demoConfig;
