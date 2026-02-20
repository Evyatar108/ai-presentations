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
    audioOnly: 915.2,
    segmentDelays: 75,
    slideDelays: 46,
    finalDelay: 2,
    startSilence: 1,
    total: 1039.2,
    slideBreakdown: [
      { slideIndex: 1, slideTitle: 'Title', chapterIndex: 0, totalDuration: 21.44, audioDuration: 19.44, delaysDuration: 2, segments: [{ segmentIndex: 0, audioDuration: 19.44, delayAfter: 2 }] },
      { slideIndex: 1, slideTitle: 'Product Context', chapterIndex: 1, totalDuration: 50.2, audioDuration: 45.2, delaysDuration: 5, segments: [{ segmentIndex: 0, audioDuration: 3.44, delayAfter: 1.5 }, { segmentIndex: 1, audioDuration: 26.4, delayAfter: 1.5 }, { segmentIndex: 2, audioDuration: 15.36, delayAfter: 2 }] },
      { slideIndex: 2, slideTitle: 'COGS Problem', chapterIndex: 1, totalDuration: 38.2, audioDuration: 33.2, delaysDuration: 5, segments: [{ segmentIndex: 0, audioDuration: 18.8, delayAfter: 1.5 }, { segmentIndex: 1, audioDuration: 8, delayAfter: 1.5 }, { segmentIndex: 2, audioDuration: 6.4, delayAfter: 2 }] },
      { slideIndex: 1, slideTitle: 'Four-Call Pipeline', chapterIndex: 2, totalDuration: 48.88, audioDuration: 40.88, delaysDuration: 8, segments: [{ segmentIndex: 0, audioDuration: 4, delayAfter: 1.5 }, { segmentIndex: 1, audioDuration: 8, delayAfter: 1.5 }, { segmentIndex: 2, audioDuration: 12.24, delayAfter: 1.5 }, { segmentIndex: 3, audioDuration: 7.12, delayAfter: 1.5 }, { segmentIndex: 4, audioDuration: 9.52, delayAfter: 2 }] },
      { slideIndex: 2, slideTitle: 'Call Detail', chapterIndex: 2, totalDuration: 36.54, audioDuration: 33.04, delaysDuration: 3.5, segments: [{ segmentIndex: 0, audioDuration: 17.44, delayAfter: 1.5 }, { segmentIndex: 1, audioDuration: 15.6, delayAfter: 2 }] },
      { slideIndex: 1, slideTitle: 'Four Cost Drivers', chapterIndex: 3, totalDuration: 54, audioDuration: 46, delaysDuration: 8, segments: [{ segmentIndex: 0, audioDuration: 4.8, delayAfter: 1.5 }, { segmentIndex: 1, audioDuration: 7.6, delayAfter: 1.5 }, { segmentIndex: 2, audioDuration: 13.68, delayAfter: 1.5 }, { segmentIndex: 3, audioDuration: 5.68, delayAfter: 1.5 }, { segmentIndex: 4, audioDuration: 14.24, delayAfter: 2 }] },
      { slideIndex: 2, slideTitle: 'Verbose JSON', chapterIndex: 3, totalDuration: 16.7, audioDuration: 13.2, delaysDuration: 3.5, segments: [{ segmentIndex: 0, audioDuration: 10.72, delayAfter: 1.5 }, { segmentIndex: 1, audioDuration: 2.48, delayAfter: 2 }] },
      { slideIndex: 1, slideTitle: 'Nested Loop', chapterIndex: 4, totalDuration: 25.64, audioDuration: 20.64, delaysDuration: 5, segments: [{ segmentIndex: 0, audioDuration: 4.48, delayAfter: 1.5 }, { segmentIndex: 1, audioDuration: 9.04, delayAfter: 1.5 }, { segmentIndex: 2, audioDuration: 7.12, delayAfter: 2 }] },
      { slideIndex: 2, slideTitle: 'Candidate Rows', chapterIndex: 4, totalDuration: 41.48, audioDuration: 36.48, delaysDuration: 5, segments: [{ segmentIndex: 0, audioDuration: 6.08, delayAfter: 1.5 }, { segmentIndex: 1, audioDuration: 17.12, delayAfter: 1.5 }, { segmentIndex: 2, audioDuration: 13.28, delayAfter: 2 }] },
      { slideIndex: 3, slideTitle: 'O(n^2) Visualized', chapterIndex: 4, totalDuration: 34.6, audioDuration: 29.6, delaysDuration: 5, segments: [{ segmentIndex: 0, audioDuration: 5.12, delayAfter: 1.5 }, { segmentIndex: 1, audioDuration: 9.12, delayAfter: 1.5 }, { segmentIndex: 2, audioDuration: 15.36, delayAfter: 2 }] },
      { slideIndex: 1, slideTitle: 'Format Comparison', chapterIndex: 5, totalDuration: 37.88, audioDuration: 32.88, delaysDuration: 5, segments: [{ segmentIndex: 0, audioDuration: 6.96, delayAfter: 1.5 }, { segmentIndex: 1, audioDuration: 13.36, delayAfter: 1.5 }, { segmentIndex: 2, audioDuration: 12.56, delayAfter: 2 }] },
      { slideIndex: 2, slideTitle: 'max_end_utterance_id', chapterIndex: 5, totalDuration: 46.12, audioDuration: 41.12, delaysDuration: 5, segments: [{ segmentIndex: 0, audioDuration: 21.6, delayAfter: 1.5 }, { segmentIndex: 1, audioDuration: 9.84, delayAfter: 1.5 }, { segmentIndex: 2, audioDuration: 9.68, delayAfter: 2 }] },
      { slideIndex: 3, slideTitle: 'Turn/Utterance Concept', chapterIndex: 5, totalDuration: 71.32, audioDuration: 66.32, delaysDuration: 5, segments: [{ segmentIndex: 0, audioDuration: 6.32, delayAfter: 1.5 }, { segmentIndex: 1, audioDuration: 33.6, delayAfter: 1.5 }, { segmentIndex: 2, audioDuration: 26.4, delayAfter: 2 }] },
      { slideIndex: 1, slideTitle: 'Prompt Overview', chapterIndex: 6, totalDuration: 67.08, audioDuration: 62.08, delaysDuration: 5, segments: [{ segmentIndex: 0, audioDuration: 12.88, delayAfter: 1.5 }, { segmentIndex: 1, audioDuration: 31.2, delayAfter: 1.5 }, { segmentIndex: 2, audioDuration: 18, delayAfter: 2 }] },
      { slideIndex: 2, slideTitle: 'Pseudocode Algorithm', chapterIndex: 6, totalDuration: 43.16, audioDuration: 38.16, delaysDuration: 5, segments: [{ segmentIndex: 0, audioDuration: 13.12, delayAfter: 1.5 }, { segmentIndex: 1, audioDuration: 16.24, delayAfter: 1.5 }, { segmentIndex: 2, audioDuration: 8.8, delayAfter: 2 }] },
      { slideIndex: 3, slideTitle: 'Prose vs Pseudocode', chapterIndex: 6, totalDuration: 28.22, audioDuration: 24.72, delaysDuration: 3.5, segments: [{ segmentIndex: 0, audioDuration: 12, delayAfter: 1.5 }, { segmentIndex: 1, audioDuration: 12.72, delayAfter: 2 }] },
      { slideIndex: 1, slideTitle: 'Copy-then-Parse', chapterIndex: 7, totalDuration: 65, audioDuration: 60, delaysDuration: 5, segments: [{ segmentIndex: 0, audioDuration: 15.6, delayAfter: 1.5 }, { segmentIndex: 1, audioDuration: 19.28, delayAfter: 1.5 }, { segmentIndex: 2, audioDuration: 25.12, delayAfter: 2 }] },
      { slideIndex: 2, slideTitle: 'Self-Checks', chapterIndex: 7, totalDuration: 27.58, audioDuration: 24.08, delaysDuration: 3.5, segments: [{ segmentIndex: 0, audioDuration: 13.52, delayAfter: 1.5 }, { segmentIndex: 1, audioDuration: 10.56, delayAfter: 2 }] },
      { slideIndex: 1, slideTitle: 'Validation Challenges', chapterIndex: 8, totalDuration: 74.52, audioDuration: 69.52, delaysDuration: 5, segments: [{ segmentIndex: 0, audioDuration: 11.68, delayAfter: 1.5 }, { segmentIndex: 1, audioDuration: 28.08, delayAfter: 1.5 }, { segmentIndex: 2, audioDuration: 29.76, delayAfter: 2 }] },
      { slideIndex: 2, slideTitle: 'Eval Tool', chapterIndex: 8, totalDuration: 59.64, audioDuration: 54.64, delaysDuration: 5, segments: [{ segmentIndex: 0, audioDuration: 9.68, delayAfter: 1.5 }, { segmentIndex: 1, audioDuration: 20.8, delayAfter: 1.5 }, { segmentIndex: 2, audioDuration: 24.16, delayAfter: 2 }] },
      { slideIndex: 1, slideTitle: 'Results Metrics', chapterIndex: 9, totalDuration: 24.58, audioDuration: 18.08, delaysDuration: 6.5, segments: [{ segmentIndex: 0, audioDuration: 1.12, delayAfter: 1.5 }, { segmentIndex: 1, audioDuration: 3.52, delayAfter: 1.5 }, { segmentIndex: 2, audioDuration: 4.16, delayAfter: 1.5 }, { segmentIndex: 3, audioDuration: 9.28, delayAfter: 2 }] },
      { slideIndex: 2, slideTitle: 'Quality and Impact', chapterIndex: 9, totalDuration: 35.72, audioDuration: 30.72, delaysDuration: 5, segments: [{ segmentIndex: 0, audioDuration: 9.44, delayAfter: 1.5 }, { segmentIndex: 1, audioDuration: 8.24, delayAfter: 1.5 }, { segmentIndex: 2, audioDuration: 13.04, delayAfter: 2 }] },
      { slideIndex: 1, slideTitle: 'Six Lessons', chapterIndex: 10, totalDuration: 77.08, audioDuration: 66.08, delaysDuration: 11, segments: [{ segmentIndex: 0, audioDuration: 4.48, delayAfter: 1.5 }, { segmentIndex: 1, audioDuration: 6.16, delayAfter: 1.5 }, { segmentIndex: 2, audioDuration: 7.84, delayAfter: 1.5 }, { segmentIndex: 3, audioDuration: 10.8, delayAfter: 1.5 }, { segmentIndex: 4, audioDuration: 7.52, delayAfter: 1.5 }, { segmentIndex: 5, audioDuration: 11.12, delayAfter: 1.5 }, { segmentIndex: 6, audioDuration: 18.16, delayAfter: 2 }] },
      { slideIndex: 2, slideTitle: 'Closing', chapterIndex: 10, totalDuration: 12.62, audioDuration: 9.12, delaysDuration: 3.5, segments: [{ segmentIndex: 0, audioDuration: 1.28, delayAfter: 1.5 }, { segmentIndex: 1, audioDuration: 7.84, delayAfter: 2 }] },
    ]
  }
};
