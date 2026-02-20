import type { SlideComponentWithMetadata } from '@framework';

// Chapter 0: Introduction
import { Ch0_S1_Title } from './chapters/Chapter0';

// Chapter 1: Problem Context
import { Ch1_S1_ProductContext, Ch1_S2_COGSProblem } from './chapters/Chapter1';

// Chapter 2: V1 Pipeline Architecture
import { Ch2_S1_FourCalls, Ch2_S2_CallDetail } from './chapters/Chapter2';

// Chapter 3: Five Cost Drivers
import { Ch3_S1_CostDrivers, Ch3_S2_VerboseJSON } from './chapters/Chapter3';

// Chapter 4: The O(n^2) Problem
import { Ch4_S1_NestedLoop, Ch4_S2_CandidateRows, Ch4_S3_Visualized } from './chapters/Chapter4';

// Chapter 5: Compact Transcript Table
import { Ch5_S1_FormatComparison, Ch5_S2_MaxEndId } from './chapters/Chapter5';

// Chapter 6: Prompt Overview + Pseudocode Algorithm
import { Ch6_S1_PromptOverview, Ch6_S2_Pseudocode, Ch6_S3_ProseVsPseudocode } from './chapters/Chapter6';

// Chapter 7: Copy-then-Parse + Self-Checks
import { Ch7_S1_CopyThenParse, Ch7_S2_SelfChecks } from './chapters/Chapter7';

// Chapter 8: Results
import { Ch8_S1_Metrics, Ch8_S2_QualityAndImpact } from './chapters/Chapter8';

// Chapter 9: Lessons + Closing
import { Ch9_S1_Lessons, Ch9_S2_Closing } from './chapters/Chapter9';

/**
 * Central registry of all slide components for the Highlights Deep-Dive demo.
 * 21 slides across 10 chapters.
 */
export const allSlides: SlideComponentWithMetadata[] = [
  Ch0_S1_Title,
  Ch1_S1_ProductContext,
  Ch1_S2_COGSProblem,
  Ch2_S1_FourCalls,
  Ch2_S2_CallDetail,
  Ch3_S1_CostDrivers,
  Ch3_S2_VerboseJSON,
  Ch4_S1_NestedLoop,
  Ch4_S2_CandidateRows,
  Ch4_S3_Visualized,
  Ch5_S1_FormatComparison,
  Ch5_S2_MaxEndId,
  Ch6_S1_PromptOverview,
  Ch6_S2_Pseudocode,
  Ch6_S3_ProseVsPseudocode,
  Ch7_S1_CopyThenParse,
  Ch7_S2_SelfChecks,
  Ch8_S1_Metrics,
  Ch8_S2_QualityAndImpact,
  Ch9_S1_Lessons,
  Ch9_S2_Closing,
];
