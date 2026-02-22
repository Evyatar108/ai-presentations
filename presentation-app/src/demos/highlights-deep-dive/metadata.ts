/**
 * Highlights Deep-Dive Demo Metadata
 *
 * Technical deep-dive presentation about collapsing a 4-call GPT-4 pipeline
 * into a single unified prompt, reducing COGS by ~70%.
 * Target audience: engineering peers familiar with LLMs/prompt engineering.
 */

import type { DemoMetadata } from '@framework';

export const metadata: DemoMetadata = {
  id: 'highlights-deep-dive',
  title: 'Highlights Prompt Deep-Dive',
  description: 'Technical deep-dive into how we collapsed a 4-call GPT-4 pipeline into a single unified prompt — covering the O(n²) candidate explosion, compact transcript format, pseudocode algorithm, copy-then-parse pattern, and self-checks. Reduced COGS by ~70%.',
  thumbnail: '/images/highlights-deep-dive/thumbnail.png',
  tags: ['prompt-engineering', 'llm', 'optimization', 'cogs', 'deep-dive', 'technical'],

  useExternalNarration: true,
  narrationFallback: 'silent',

  durationInfo: {
    audioOnly: 1196.56,
    segmentDelays: 84,
    slideDelays: 84,
    finalDelay: 5,
    startSilence: 3,
    total: 1372.56,
    slideBreakdown: [
      { slideIndex: 1, slideTitle: 'Title', chapterIndex: 0, totalDuration: 21.72, audioDuration: 16.72, delaysDuration: 5, segments: [{ segmentIndex: 0, audioDuration: 5.28, delayAfter: 1.5 }, { segmentIndex: 1, audioDuration: 11.44, delayAfter: 3.5 }] },
      { slideIndex: 1, slideTitle: 'Product Context', chapterIndex: 1, totalDuration: 51.7, audioDuration: 45.2, delaysDuration: 6.5, segments: [{ segmentIndex: 0, audioDuration: 3.44, delayAfter: 1.5 }, { segmentIndex: 1, audioDuration: 26.4, delayAfter: 1.5 }, { segmentIndex: 2, audioDuration: 15.36, delayAfter: 3.5 }] },
      { slideIndex: 2, slideTitle: 'COGS Problem', chapterIndex: 1, totalDuration: 40.5, audioDuration: 34, delaysDuration: 6.5, segments: [{ segmentIndex: 0, audioDuration: 19.6, delayAfter: 1.5 }, { segmentIndex: 1, audioDuration: 8, delayAfter: 1.5 }, { segmentIndex: 2, audioDuration: 6.4, delayAfter: 3.5 }] },
      { slideIndex: 1, slideTitle: 'Four-Call Pipeline', chapterIndex: 2, totalDuration: 51.74, audioDuration: 42.24, delaysDuration: 9.5, segments: [{ segmentIndex: 0, audioDuration: 4, delayAfter: 1.5 }, { segmentIndex: 1, audioDuration: 8, delayAfter: 1.5 }, { segmentIndex: 2, audioDuration: 12.24, delayAfter: 1.5 }, { segmentIndex: 3, audioDuration: 8.48, delayAfter: 1.5 }, { segmentIndex: 4, audioDuration: 9.52, delayAfter: 3.5 }] },
      { slideIndex: 1, slideTitle: 'Four Cost Drivers', chapterIndex: 3, totalDuration: 54.78, audioDuration: 45.28, delaysDuration: 9.5, segments: [{ segmentIndex: 0, audioDuration: 4.8, delayAfter: 1.5 }, { segmentIndex: 1, audioDuration: 6.88, delayAfter: 1.5 }, { segmentIndex: 2, audioDuration: 13.68, delayAfter: 1.5 }, { segmentIndex: 3, audioDuration: 5.68, delayAfter: 1.5 }, { segmentIndex: 4, audioDuration: 14.24, delayAfter: 3.5 }] },
      { slideIndex: 2, slideTitle: 'Verbose JSON', chapterIndex: 3, totalDuration: 22.84, audioDuration: 17.84, delaysDuration: 5, segments: [{ segmentIndex: 0, audioDuration: 15.36, delayAfter: 1.5 }, { segmentIndex: 1, audioDuration: 2.48, delayAfter: 3.5 }] },
      { slideIndex: 1, slideTitle: 'Nested Loop', chapterIndex: 4, totalDuration: 35.46, audioDuration: 28.96, delaysDuration: 6.5, segments: [{ segmentIndex: 0, audioDuration: 12.8, delayAfter: 1.5 }, { segmentIndex: 1, audioDuration: 9.04, delayAfter: 1.5 }, { segmentIndex: 2, audioDuration: 7.12, delayAfter: 3.5 }] },
      { slideIndex: 2, slideTitle: 'Candidate Rows', chapterIndex: 4, totalDuration: 47.94, audioDuration: 41.44, delaysDuration: 6.5, segments: [{ segmentIndex: 0, audioDuration: 11.04, delayAfter: 1.5 }, { segmentIndex: 1, audioDuration: 17.12, delayAfter: 1.5 }, { segmentIndex: 2, audioDuration: 13.28, delayAfter: 3.5 }] },
      { slideIndex: 3, slideTitle: 'O(n^2) Visualized', chapterIndex: 4, totalDuration: 43.14, audioDuration: 36.64, delaysDuration: 6.5, segments: [{ segmentIndex: 0, audioDuration: 5.12, delayAfter: 1.5 }, { segmentIndex: 1, audioDuration: 15.44, delayAfter: 1.5 }, { segmentIndex: 2, audioDuration: 16.08, delayAfter: 3.5 }] },
      { slideIndex: 4, slideTitle: 'Output Safety', chapterIndex: 4, totalDuration: 127.6, audioDuration: 119.6, delaysDuration: 8, segments: [{ segmentIndex: 0, audioDuration: 34.96, delayAfter: 1.5 }, { segmentIndex: 1, audioDuration: 25.76, delayAfter: 1.5 }, { segmentIndex: 2, audioDuration: 31.76, delayAfter: 1.5 }, { segmentIndex: 3, audioDuration: 27.12, delayAfter: 3.5 }] },
      { slideIndex: 1, slideTitle: 'Format Comparison', chapterIndex: 5, totalDuration: 39.78, audioDuration: 33.28, delaysDuration: 6.5, segments: [{ segmentIndex: 0, audioDuration: 6.96, delayAfter: 1.5 }, { segmentIndex: 1, audioDuration: 14.24, delayAfter: 1.5 }, { segmentIndex: 2, audioDuration: 12.08, delayAfter: 3.5 }] },
      { slideIndex: 2, slideTitle: 'max_end_utterance_id', chapterIndex: 5, totalDuration: 63.86, audioDuration: 57.36, delaysDuration: 6.5, segments: [{ segmentIndex: 0, audioDuration: 37.84, delayAfter: 1.5 }, { segmentIndex: 1, audioDuration: 9.84, delayAfter: 1.5 }, { segmentIndex: 2, audioDuration: 9.68, delayAfter: 3.5 }] },
      { slideIndex: 3, slideTitle: 'Turn/Utterance Concept', chapterIndex: 5, totalDuration: 72.82, audioDuration: 66.32, delaysDuration: 6.5, segments: [{ segmentIndex: 0, audioDuration: 6.32, delayAfter: 1.5 }, { segmentIndex: 1, audioDuration: 33.6, delayAfter: 1.5 }, { segmentIndex: 2, audioDuration: 26.4, delayAfter: 3.5 }] },
      { slideIndex: 1, slideTitle: 'Prompt Overview', chapterIndex: 6, totalDuration: 68.58, audioDuration: 62.08, delaysDuration: 6.5, segments: [{ segmentIndex: 0, audioDuration: 12.88, delayAfter: 1.5 }, { segmentIndex: 1, audioDuration: 31.2, delayAfter: 1.5 }, { segmentIndex: 2, audioDuration: 18, delayAfter: 3.5 }] },
      { slideIndex: 2, slideTitle: 'Pseudocode Algorithm', chapterIndex: 6, totalDuration: 48.18, audioDuration: 41.68, delaysDuration: 6.5, segments: [{ segmentIndex: 0, audioDuration: 16.64, delayAfter: 1.5 }, { segmentIndex: 1, audioDuration: 16.24, delayAfter: 1.5 }, { segmentIndex: 2, audioDuration: 8.8, delayAfter: 3.5 }] },
      { slideIndex: 3, slideTitle: 'Prose vs Pseudocode', chapterIndex: 6, totalDuration: 31.64, audioDuration: 26.64, delaysDuration: 5, segments: [{ segmentIndex: 0, audioDuration: 12, delayAfter: 1.5 }, { segmentIndex: 1, audioDuration: 14.64, delayAfter: 3.5 }] },
      { slideIndex: 4, slideTitle: 'Output Schema', chapterIndex: 6, totalDuration: 129.12, audioDuration: 121.12, delaysDuration: 8, segments: [{ segmentIndex: 0, audioDuration: 33.04, delayAfter: 1.5 }, { segmentIndex: 1, audioDuration: 29.44, delayAfter: 1.5 }, { segmentIndex: 2, audioDuration: 32.08, delayAfter: 1.5 }, { segmentIndex: 3, audioDuration: 26.56, delayAfter: 3.5 }] },
      { slideIndex: 1, slideTitle: 'Copy-then-Parse', chapterIndex: 7, totalDuration: 65.86, audioDuration: 59.36, delaysDuration: 6.5, segments: [{ segmentIndex: 0, audioDuration: 14.96, delayAfter: 1.5 }, { segmentIndex: 1, audioDuration: 19.28, delayAfter: 1.5 }, { segmentIndex: 2, audioDuration: 25.12, delayAfter: 3.5 }] },
      { slideIndex: 2, slideTitle: 'Self-Checks', chapterIndex: 7, totalDuration: 47.8, audioDuration: 42.8, delaysDuration: 5, segments: [{ segmentIndex: 0, audioDuration: 26.4, delayAfter: 1.5 }, { segmentIndex: 1, audioDuration: 16.4, delayAfter: 3.5 }] },
      { slideIndex: 1, slideTitle: 'Validation Challenges', chapterIndex: 8, totalDuration: 73.86, audioDuration: 67.36, delaysDuration: 6.5, segments: [{ segmentIndex: 0, audioDuration: 11.68, delayAfter: 1.5 }, { segmentIndex: 1, audioDuration: 26.32, delayAfter: 1.5 }, { segmentIndex: 2, audioDuration: 29.36, delayAfter: 3.5 }] },
      { slideIndex: 2, slideTitle: 'Eval Tool', chapterIndex: 8, totalDuration: 68.02, audioDuration: 61.52, delaysDuration: 6.5, segments: [{ segmentIndex: 0, audioDuration: 9.68, delayAfter: 1.5 }, { segmentIndex: 1, audioDuration: 20.8, delayAfter: 1.5 }, { segmentIndex: 2, audioDuration: 31.04, delayAfter: 3.5 }] },
      { slideIndex: 1, slideTitle: 'Results Metrics', chapterIndex: 9, totalDuration: 26.08, audioDuration: 18.08, delaysDuration: 8, segments: [{ segmentIndex: 0, audioDuration: 1.12, delayAfter: 1.5 }, { segmentIndex: 1, audioDuration: 3.52, delayAfter: 1.5 }, { segmentIndex: 2, audioDuration: 4.16, delayAfter: 1.5 }, { segmentIndex: 3, audioDuration: 9.28, delayAfter: 3.5 }] },
      { slideIndex: 2, slideTitle: 'Quality and Impact', chapterIndex: 9, totalDuration: 37.22, audioDuration: 30.72, delaysDuration: 6.5, segments: [{ segmentIndex: 0, audioDuration: 9.44, delayAfter: 1.5 }, { segmentIndex: 1, audioDuration: 8.24, delayAfter: 1.5 }, { segmentIndex: 2, audioDuration: 13.04, delayAfter: 3.5 }] },
      { slideIndex: 1, slideTitle: 'Six Lessons', chapterIndex: 10, totalDuration: 83.7, audioDuration: 71.2, delaysDuration: 12.5, segments: [{ segmentIndex: 0, audioDuration: 4.48, delayAfter: 1.5 }, { segmentIndex: 1, audioDuration: 6.16, delayAfter: 1.5 }, { segmentIndex: 2, audioDuration: 7.84, delayAfter: 1.5 }, { segmentIndex: 3, audioDuration: 15.92, delayAfter: 1.5 }, { segmentIndex: 4, audioDuration: 7.52, delayAfter: 1.5 }, { segmentIndex: 5, audioDuration: 11.12, delayAfter: 1.5 }, { segmentIndex: 6, audioDuration: 18.16, delayAfter: 3.5 }] },
      { slideIndex: 2, slideTitle: 'Closing', chapterIndex: 10, totalDuration: 15.62, audioDuration: 9.12, delaysDuration: 6.5, segments: [{ segmentIndex: 0, audioDuration: 1.28, delayAfter: 1.5 }, { segmentIndex: 1, audioDuration: 7.84, delayAfter: 5 }] },
    ]
  }
};
