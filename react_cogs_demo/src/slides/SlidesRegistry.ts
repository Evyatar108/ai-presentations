import { SlideComponentWithMetadata } from './SlideMetadata';
import {
  BlankIntro,
  Ch1_S1_WhatIsMeetingHighlights,
  Ch1_S2_HowToAccess,
  Ch1_S3_UserValue,
  Ch2_TeamCollaboration,
  Ch3_S1_ArchitectureOverview,
  Ch4_S1_HighlightTypes,
  Ch5_S1_ChallengeFraming,
  Ch5_S2_FourPrompts,
  Ch6_S1_UnifiedConvergence,
  Ch6_S2_UnifiedFlow,
  Ch6_S4_TokenOptimization,
  Ch7_S1_CallReduction,
  Ch7_S2_GPUReduction,
  Ch7_S3_CostCurve,
  Ch7_S4_QualityComparison,
  Ch7_S5_PathToGA,
  Ch8_S1_UserSatisfaction,
  Ch9_S1_Testimonials,
  Ch9_S2_FutureImprovements
} from './AnimatedSlides';
/**
 * Central registry of all slide components with their metadata.
 * Components are automatically sorted by chapter and slide number.
 *
 * NOTE: Removed detailed prompt breakdown slides (Ch5_S3-S6) per feedback
 * to focus on product intro and high-level COGS reduction story.
 */
export const allSlides: SlideComponentWithMetadata[] = [
  BlankIntro,
  Ch1_S1_WhatIsMeetingHighlights,
  Ch1_S2_HowToAccess,
  Ch1_S3_UserValue,
  Ch2_TeamCollaboration,
  Ch3_S1_ArchitectureOverview,
  Ch4_S1_HighlightTypes,
  Ch5_S1_ChallengeFraming,
  Ch5_S2_FourPrompts,
  Ch6_S1_UnifiedConvergence,
  Ch6_S2_UnifiedFlow,
  Ch6_S4_TokenOptimization,
  Ch7_S1_CallReduction,
  Ch7_S2_GPUReduction,
  Ch7_S3_CostCurve,
  Ch7_S4_QualityComparison,
  Ch7_S5_PathToGA,
  Ch8_S1_UserSatisfaction,
  Ch9_S1_Testimonials,
  Ch9_S2_FutureImprovements
].sort((a, b) => {
  // Sort by chapter first, then by slide
  if (a.metadata.chapter !== b.metadata.chapter) {
    return a.metadata.chapter - b.metadata.chapter;
  }
  return a.metadata.slide - b.metadata.slide;
});