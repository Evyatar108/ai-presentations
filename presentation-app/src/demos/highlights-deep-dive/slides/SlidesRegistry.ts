import type { SlideComponentWithMetadata } from '@framework';

// Chapter 0: Introduction
import { Ch0_S1_Title } from './chapters/Chapter0';

// Chapter 1: Problem Context
import { Ch1_S1_ProductContext, Ch1_S2_COGSProblem } from './chapters/Chapter1';

// Chapter 2: V1 Pipeline Architecture
import { Ch2_S1_FourCalls } from './chapters/Chapter2';

// Chapter 3: Five Cost Drivers
import { Ch3_S1_CostDrivers, Ch3_S2_VerboseJSON } from './chapters/Chapter3';

// Chapter 4: The O(n^2) Problem
import { Ch4_S1_NestedLoop, Ch4_S2_CandidateRows, Ch4_S3_Visualized, Ch4_S4_OutputSafety } from './chapters/Chapter4';

// Chapter 5: Compact Transcript Table
import { Ch5_S1_FormatComparison, Ch5_S2_MaxEndId, Ch5_S3_TurnUtteranceConcept } from './chapters/Chapter5';

// Chapter 6: Prompt Overview + Pseudocode Algorithm
import { Ch6_S1_PromptOverview, Ch6_S2_Pseudocode, Ch6_S3_ProseVsPseudocode, Ch6_S4_OutputSchema } from './chapters/Chapter6';

// Chapter 7: Copy-then-Parse + Self-Checks
import { Ch7_S1_CopyThenParse, Ch7_S2_SelfChecks } from './chapters/Chapter7';

// Chapter 8: Evaluation & Iteration
import { Ch8_S1_ValidationChallenges, Ch8_S2_EvalTool } from './chapters/Chapter8';

// Chapter 9: Results
import { Ch9_S1_Metrics, Ch9_S2_QualityAndImpact } from './chapters/Chapter9';

// Chapter 10: Lessons + Closing
import { Ch10_S1_Lessons, Ch10_S2_Closing } from './chapters/Chapter10';

/**
 * Central registry of all slide components for the Highlights Deep-Dive demo.
 * 25 slides across 11 chapters.
 */
export const allSlides: SlideComponentWithMetadata[] = [
  Ch0_S1_Title,
  Ch1_S1_ProductContext,
  Ch1_S2_COGSProblem,
  Ch2_S1_FourCalls,
  Ch3_S1_CostDrivers,
  Ch3_S2_VerboseJSON,
  Ch4_S1_NestedLoop,
  Ch4_S2_CandidateRows,
  Ch4_S3_Visualized,
  Ch4_S4_OutputSafety,
  Ch5_S1_FormatComparison,
  Ch5_S2_MaxEndId,
  Ch5_S3_TurnUtteranceConcept,
  Ch6_S1_PromptOverview,
  Ch6_S2_Pseudocode,
  Ch6_S3_ProseVsPseudocode,
  Ch6_S4_OutputSchema,
  Ch7_S1_CopyThenParse,
  Ch7_S2_SelfChecks,
  Ch8_S1_ValidationChallenges,
  Ch8_S2_EvalTool,
  Ch9_S1_Metrics,
  Ch9_S2_QualityAndImpact,
  Ch10_S1_Lessons,
  Ch10_S2_Closing,
];
