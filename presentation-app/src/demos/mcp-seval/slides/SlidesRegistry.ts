import type { SlideComponentWithMetadata } from '@framework';

// Chapter 0: The Challenge
import { Ch0_S1_Title, Ch0_S2_EvalProblem } from './chapters/Chapter0';

// Chapter 1: The Toolkit
import { Ch1_S1_ToolOverview } from './chapters/Chapter1';

// Chapter 2: Key Workflows
import {
  Ch2_S1_CreateJob,
  Ch2_S2_AnalyzeResults,
  Ch2_S3_DiagnoseUtterances,
  Ch2_S4_DownloadAndManage,
} from './chapters/Chapter2';

// Chapter 3: Going Further
import { Ch3_S1_CrossMcp, Ch3_S2_QualityLoop } from './chapters/Chapter3';

// Chapter 4: Get Started
import { Ch4_S1_GetStarted, Ch4_S2_Closing } from './chapters/Chapter4';

/**
 * Central registry of all slide components for the MCP SEVAL demo.
 * 11 slides across 5 chapters.
 */
export const allSlides: SlideComponentWithMetadata[] = [
  Ch0_S1_Title,
  Ch0_S2_EvalProblem,
  Ch1_S1_ToolOverview,
  Ch2_S1_CreateJob,
  Ch2_S2_AnalyzeResults,
  Ch2_S3_DiagnoseUtterances,
  Ch2_S4_DownloadAndManage,
  Ch3_S1_CrossMcp,
  Ch3_S2_QualityLoop,
  Ch4_S1_GetStarted,
  Ch4_S2_Closing,
];
