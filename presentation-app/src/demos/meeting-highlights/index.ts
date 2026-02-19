/**
 * Meeting Highlights COGS Reduction Demo Configuration
 *
 * This file exports the complete demo configuration for the Meeting Highlights
 * presentation, including metadata and lazy-loaded slide definitions.
 */

import type { DemoConfig, TimingConfig } from '@framework';
import { metadata } from './metadata';

/**
 * Timing configuration for Meeting Highlights demo.
 * Documents the default timing values used throughout the presentation.
 */
const timing: TimingConfig = {
  betweenSegments: 500,   // 0.5s pause between segments within slides
  betweenSlides: 1000,    // 1s transition between slides
  afterFinalSlide: 2000   // 2s hold on final slide before completion
};

/**
 * Meeting Highlights COGS Reduction demo configuration.
 * Slides are lazy-loaded to optimize initial bundle size.
 */
const demoConfig: DemoConfig = {
  metadata,
  defaultMode: 'narrated',
  timing,
  getSlides: async () => {
    const { allSlides } = await import('./slides/SlidesRegistry');
    return allSlides;
  }
};

export default demoConfig;
