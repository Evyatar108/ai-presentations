/**
 * MCP DevUI Demo Metadata
 *
 * Presents the MCP DevUI debugging toolset for Sydney/Copilot conversations:
 * 23 tools in 5 categories, wrapped by a devui-debugger agent with 5 guided skills.
 */

import type { DemoMetadata } from '@framework';

export const metadata: DemoMetadata = {
  id: 'mcp-devui',
  title: 'MCP DevUI',
  description: 'All your familiar DevUI workflows — now accessible to an AI agent that can chain them together in a single conversation. 21 tools, 4 skills, 1 agent.',
  thumbnail: '/images/mcp-devui/thumbnail.png',
  tags: ['mcp', 'devui', 'debugging', 'copilot', 'tooling', 'technical'],

  durationInfo: {
    audioOnly: 433.04,
    segmentDelays: 37.5,
    slideDelays: 30,
    finalDelay: 5,
    startSilence: 3,
    total: 508.54,
    slideBreakdown: [
      { slideIndex: 1, slideTitle: 'MCP DevUI', chapterIndex: 0, totalDuration: 16.82, audioDuration: 12.32, delaysDuration: 4.5, segments: [{ segmentIndex: 0, audioDuration: 4.96, delayAfter: 1.5 }, { segmentIndex: 1, audioDuration: 7.36, delayAfter: 3 }] },
      { slideIndex: 2, slideTitle: 'The Debugging Problem', chapterIndex: 0, totalDuration: 43.12, audioDuration: 37.12, delaysDuration: 6, segments: [{ segmentIndex: 0, audioDuration: 12.08, delayAfter: 1.5 }, { segmentIndex: 1, audioDuration: 12.4, delayAfter: 1.5 }, { segmentIndex: 2, audioDuration: 12.64, delayAfter: 3 }] },
      { slideIndex: 1, slideTitle: '23 Tools, 5 Skills, 1 Agent', chapterIndex: 1, totalDuration: 61.6, audioDuration: 55.6, delaysDuration: 6, segments: [{ segmentIndex: 0, audioDuration: 10.64, delayAfter: 1.5 }, { segmentIndex: 1, audioDuration: 27.68, delayAfter: 1.5 }, { segmentIndex: 2, audioDuration: 17.28, delayAfter: 3 }] },
      { slideIndex: 1, slideTitle: 'Debug a Conversation', chapterIndex: 2, totalDuration: 57.98, audioDuration: 50.48, delaysDuration: 7.5, segments: [{ segmentIndex: 0, audioDuration: 15.68, delayAfter: 1.5 }, { segmentIndex: 1, audioDuration: 13.04, delayAfter: 1.5 }, { segmentIndex: 2, audioDuration: 12.32, delayAfter: 1.5 }, { segmentIndex: 3, audioDuration: 9.44, delayAfter: 3 }] },
      { slideIndex: 2, slideTitle: 'See the Execution Flow', chapterIndex: 2, totalDuration: 41.28, audioDuration: 35.28, delaysDuration: 6, segments: [{ segmentIndex: 0, audioDuration: 11.2, delayAfter: 1.5 }, { segmentIndex: 1, audioDuration: 12.88, delayAfter: 1.5 }, { segmentIndex: 2, audioDuration: 11.2, delayAfter: 3 }] },
      { slideIndex: 3, slideTitle: 'Compare Control vs Experiment', chapterIndex: 2, totalDuration: 40.16, audioDuration: 34.16, delaysDuration: 6, segments: [{ segmentIndex: 0, audioDuration: 12.48, delayAfter: 1.5 }, { segmentIndex: 1, audioDuration: 13.84, delayAfter: 1.5 }, { segmentIndex: 2, audioDuration: 7.84, delayAfter: 3 }] },
      { slideIndex: 4, slideTitle: 'Send and Debug Live', chapterIndex: 2, totalDuration: 61.88, audioDuration: 52.88, delaysDuration: 9, segments: [{ segmentIndex: 0, audioDuration: 9.84, delayAfter: 1.5 }, { segmentIndex: 1, audioDuration: 12.64, delayAfter: 1.5 }, { segmentIndex: 2, audioDuration: 7.6, delayAfter: 1.5 }, { segmentIndex: 3, audioDuration: 8.16, delayAfter: 1.5 }, { segmentIndex: 4, audioDuration: 14.64, delayAfter: 3 }] },
      { slideIndex: 5, slideTitle: 'Config, Flights & More', chapterIndex: 2, totalDuration: 47.76, audioDuration: 41.76, delaysDuration: 6, segments: [{ segmentIndex: 0, audioDuration: 14.4, delayAfter: 1.5 }, { segmentIndex: 1, audioDuration: 14.56, delayAfter: 1.5 }, { segmentIndex: 2, audioDuration: 12.8, delayAfter: 3 }] },
      { slideIndex: 1, slideTitle: '23 Tools at Your Fingertips', chapterIndex: 3, totalDuration: 39.44, audioDuration: 33.44, delaysDuration: 6, segments: [{ segmentIndex: 0, audioDuration: 13.2, delayAfter: 1.5 }, { segmentIndex: 1, audioDuration: 10.16, delayAfter: 1.5 }, { segmentIndex: 2, audioDuration: 10.08, delayAfter: 3 }] },
      { slideIndex: 1, slideTitle: 'Two Minutes to Start Debugging', chapterIndex: 4, totalDuration: 41.84, audioDuration: 35.84, delaysDuration: 6, segments: [{ segmentIndex: 0, audioDuration: 14.56, delayAfter: 1.5 }, { segmentIndex: 1, audioDuration: 10.08, delayAfter: 1.5 }, { segmentIndex: 2, audioDuration: 11.2, delayAfter: 3 }] },
      { slideIndex: 1, slideTitle: 'Impact & What\'s Next', chapterIndex: 5, totalDuration: 53.66, audioDuration: 44.16, delaysDuration: 9.5, segments: [{ segmentIndex: 0, audioDuration: 14.88, delayAfter: 1.5 }, { segmentIndex: 1, audioDuration: 10.96, delayAfter: 1.5 }, { segmentIndex: 2, audioDuration: 15.44, delayAfter: 1.5 }, { segmentIndex: 3, audioDuration: 2.88, delayAfter: 5 }] },
    ]
  }
};
