import { SlideComponentWithMetadata } from './SlideMetadata';
import {
  BlankIntro,
  Ch5_S1_ChallengeFraming,
  Ch5_S2_FourPrompts,
  Ch6_S1_UnifiedConvergence,
  Ch6_S2_UnifiedFlow,
  Ch6_S4_TokenOptimization,
  Ch7_S1_CallReduction,
  Ch7_S2_GPUReduction,
  Ch7_S5_PathToGA
} from './AnimatedSlides';
import { Ch7_S3_CostCurve, Ch7_S4_QualityComparison } from '../components/ImpactComponents';

/**
 * Central registry of all slide components with their metadata.
 * Components are automatically sorted by chapter and utterance.
 *
 * NOTE: Removed detailed prompt breakdown slides (Ch5_U3-U6) per feedback
 * to focus on product intro and high-level COGS reduction story.
 */
export const allSlides: SlideComponentWithMetadata[] = [
  BlankIntro,
  Ch5_S1_ChallengeFraming,
  Ch5_S2_FourPrompts,
  Ch6_S1_UnifiedConvergence,
  Ch6_S2_UnifiedFlow,
  Ch6_S4_TokenOptimization,
  Ch7_S1_CallReduction,
  Ch7_S2_GPUReduction,
  Ch7_S3_CostCurve,
  Ch7_S4_QualityComparison,
  Ch7_S5_PathToGA
].sort((a, b) => {
  // Sort by chapter first, then by utterance
  if (a.metadata.chapter !== b.metadata.chapter) {
    return a.metadata.chapter - b.metadata.chapter;
  }
  return a.metadata.utterance - b.metadata.utterance;
});