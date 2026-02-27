import type { SlideComponentWithMetadata } from '@framework';

import {
  CS_S1_Title,
  CS_S2_CircularProgress,
  CS_S3_AnimatedHeading,
  CS_S4_AnimatedCheckmark,
  CS_S5_AnimatedArrow,
} from './chapters/Chapter0';

/**
 * Central registry of all slide components for the Component Showcase demo.
 */
export const allSlides: SlideComponentWithMetadata[] = [
  CS_S1_Title,
  CS_S2_CircularProgress,
  CS_S3_AnimatedHeading,
  CS_S4_AnimatedCheckmark,
  CS_S5_AnimatedArrow,
];
