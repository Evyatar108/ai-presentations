import type { SlideComponentWithMetadata } from '@framework';

// Chapter 0: The Problem
import { Ch0_S1_Title, Ch0_S2_DebuggingProblem } from './chapters/Chapter0';

// Chapter 1: The Toolkit
import { Ch1_S1_SolutionOverview } from './chapters/Chapter1';

// Chapter 2: What You Can Do
import {
  Ch2_S1_DebugConversation,
  Ch2_S2_SendAndDebug,
  Ch2_S3_SetupConfig,
} from './chapters/Chapter2';

// Chapter 3: Going Further
import { Ch3_S1_AgentMeetsSource, Ch3_S2_SevalAtScale } from './chapters/Chapter3';

// Chapter 4: Get Started
import { Ch4_S1_GetStarted, Ch4_S2_Closing } from './chapters/Chapter4';

/**
 * Central registry of all slide components for the MCP DevUI demo.
 * 10 slides across 5 chapters.
 */
export const allSlides: SlideComponentWithMetadata[] = [
  Ch0_S1_Title,
  Ch0_S2_DebuggingProblem,
  Ch1_S1_SolutionOverview,
  Ch2_S1_DebugConversation,
  Ch2_S2_SendAndDebug,
  Ch2_S3_SetupConfig,
  Ch3_S1_AgentMeetsSource,
  Ch3_S2_SevalAtScale,
  Ch4_S1_GetStarted,
  Ch4_S2_Closing,
];
