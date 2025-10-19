import { SlideComponentWithMetadata } from './SlideMetadata';
import {
  BlankIntro,
  Ch5_U1_ChallengeFraming,
  Ch5_U2_FourPrompts,
  Ch6_U1_UnifiedConvergence,
  Ch6_U2_UnifiedFlow,
  Ch6_U4_TokenOptimization,
  Ch7_U1_CallReduction,
  Ch7_U2_GPUReduction,
  Ch7_U5_PathToGA
} from './AnimatedSlides';
import { Ch7_U3_CostCurve, Ch7_U4_QualityComparison } from '../components/ImpactComponents';

/**
 * Central registry of all slide components with their metadata.
 * Components are automatically sorted by chapter and utterance.
 *
 * NOTE: Removed detailed prompt breakdown slides (Ch5_U3-U6) per feedback
 * to focus on product intro and high-level COGS reduction story.
 */
export const allSlides: SlideComponentWithMetadata[] = [
  BlankIntro,
  Ch5_U1_ChallengeFraming,
  Ch5_U2_FourPrompts,
  Ch6_U1_UnifiedConvergence,
  Ch6_U2_UnifiedFlow,
  Ch6_U4_TokenOptimization,
  Ch7_U1_CallReduction,
  Ch7_U2_GPUReduction,
  Ch7_U3_CostCurve,
  Ch7_U4_QualityComparison,
  Ch7_U5_PathToGA
].sort((a, b) => {
  // Sort by chapter first, then by utterance
  if (a.metadata.chapter !== b.metadata.chapter) {
    return a.metadata.chapter - b.metadata.chapter;
  }
  return a.metadata.utterance - b.metadata.utterance;
});