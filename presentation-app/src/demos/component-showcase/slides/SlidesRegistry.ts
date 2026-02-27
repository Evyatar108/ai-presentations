import type { SlideComponentWithMetadata } from '@framework';

import {
  CS_S1_Title,
  CS_S2_CircularProgress,
  CS_S3_AnimatedHeading,
  CS_S4_AnimatedCheckmark,
  CS_S5_AnimatedArrow,
  CS_S6_GraduatedGauge,
  CS_S7_AnimatedBarChart,
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
  CS_S6_GraduatedGauge,
  CS_S7_AnimatedBarChart,
];
