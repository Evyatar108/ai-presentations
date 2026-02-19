import type { SlideComponentWithMetadata } from '@framework';

// Import slides from chapter files
import {
  Ex2_S1_Title,
  Ex2_S2_Benefits,
  Ex2_S3_Impact
} from './chapters/Chapter0';

/**
 * Central registry of all slide components for Example Demo 2.
 * Showcases layout components, named segments, and timing overrides.
 */
export const allSlides: SlideComponentWithMetadata[] = [
  Ex2_S1_Title,
  Ex2_S2_Benefits,
  Ex2_S3_Impact
];
