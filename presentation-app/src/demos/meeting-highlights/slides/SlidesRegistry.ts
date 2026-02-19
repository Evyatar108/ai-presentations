import type { SlideComponentWithMetadata } from '@framework';

// Import slides from chapter files
import { BlankIntro } from './chapters/Chapter0';
import {
  Ch1_S1_WhatIsMeetingHighlights,
  Ch1_S2_HowToAccess,
  Ch1_S3_HowToAccessSharePoint
} from './chapters/Chapter1';
import { Ch2_TeamCollaboration } from './chapters/Chapter2';
import { Ch4_S1_HighlightTypes } from './chapters/Chapter4';
import {
  Ch5_S1_ChallengeFraming
} from './chapters/Chapter5';
import {
  Ch6_S1_UnifiedConvergence,
  Ch6_S4_TokenOptimization
} from './chapters/Chapter6';
import {
  Ch7_S2_GPUReduction,
  Ch7_S4_QualityComparison,
  Ch7_S5_PathToGA
} from './chapters/Chapter7';
import { Ch8_S1_UserSatisfaction } from './chapters/Chapter8';
import {
  Ch9_S1_Testimonials,
  Ch9_S2_ClosingThanks,
} from './chapters/Chapter9';

/**
 * Central registry of all slide components with their metadata.
 * Components are automatically sorted by chapter and slide number.
 *
 * All slides are now organized in chapter-specific files under ./chapters/
 * This structure improves maintainability and makes it easier to find and edit slides.
 */

 export const allSlides: SlideComponentWithMetadata[] = [
   BlankIntro,
   Ch1_S1_WhatIsMeetingHighlights,
   Ch4_S1_HighlightTypes,
   Ch1_S2_HowToAccess,
   Ch1_S3_HowToAccessSharePoint,
   Ch2_TeamCollaboration,
   Ch5_S1_ChallengeFraming,
   Ch6_S1_UnifiedConvergence,
   Ch6_S4_TokenOptimization,
   Ch7_S2_GPUReduction,
   Ch7_S4_QualityComparison,
   Ch7_S5_PathToGA,
   Ch8_S1_UserSatisfaction,
   Ch9_S1_Testimonials,
   Ch9_S2_ClosingThanks,
 ];
