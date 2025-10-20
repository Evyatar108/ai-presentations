/**
 * Meeting Highlights COGS Reduction Demo Configuration
 * 
 * This file exports the complete demo configuration for the Meeting Highlights
 * presentation, including metadata and lazy-loaded slide definitions.
 */

import type { DemoConfig } from '../types';
import { meetingHighlightsMetadata } from './metadata';

/**
 * Meeting Highlights COGS Reduction demo configuration.
 * Slides are lazy-loaded to optimize initial bundle size.
 */
export const meetingHighlightsDemo: DemoConfig = {
  id: 'meeting-highlights',
  metadata: meetingHighlightsMetadata,
  defaultMode: 'narrated',
  getSlides: async () => {
    const { allSlides } = await import('./slides/SlidesRegistry');
    return allSlides;
  }
};