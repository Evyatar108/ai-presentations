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
  description: 'All your familiar DevUI workflows — now accessible to an AI agent that can chain them together in a single conversation. 22 tools, 3 skills, 1 agent.',
  thumbnail: '/images/mcp-devui/thumbnail.png',
  tags: ['mcp', 'devui', 'debugging', 'copilot', 'tooling', 'technical'],

  durationInfo: {
    audioOnly: 412.96,
    segmentDelays: 34.5,
    slideDelays: 27,
    finalDelay: 5,
    startSilence: 3,
    total: 482.46,
    slideBreakdown: [
      { slideIndex: 1, slideTitle: 'MCP DevUI', chapterIndex: 0, totalDuration: 16.42, audioDuration: 11.92, delaysDuration: 4.5, segments: [{ segmentIndex: 0, audioDuration: 4.96, delayAfter: 1.5 }, { segmentIndex: 1, audioDuration: 6.96, delayAfter: 3 }] },
      { slideIndex: 2, slideTitle: 'The Debugging Problem', chapterIndex: 0, totalDuration: 43.12, audioDuration: 37.12, delaysDuration: 6, segments: [{ segmentIndex: 0, audioDuration: 12.08, delayAfter: 1.5 }, { segmentIndex: 1, audioDuration: 12.4, delayAfter: 1.5 }, { segmentIndex: 2, audioDuration: 12.64, delayAfter: 3 }] },
      { slideIndex: 1, slideTitle: '22 Tools, 4 Skills, 1 Agent', chapterIndex: 1, totalDuration: 71.84, audioDuration: 65.84, delaysDuration: 6, segments: [{ segmentIndex: 0, audioDuration: 9.36, delayAfter: 1.5 }, { segmentIndex: 1, audioDuration: 42.08, delayAfter: 1.5 }, { segmentIndex: 2, audioDuration: 14.4, delayAfter: 3 }] },
      { slideIndex: 1, slideTitle: 'Debug a Conversation', chapterIndex: 2, totalDuration: 57.98, audioDuration: 50.48, delaysDuration: 7.5, segments: [{ segmentIndex: 0, audioDuration: 15.68, delayAfter: 1.5 }, { segmentIndex: 1, audioDuration: 13.04, delayAfter: 1.5 }, { segmentIndex: 2, audioDuration: 12.32, delayAfter: 1.5 }, { segmentIndex: 3, audioDuration: 9.44, delayAfter: 3 }] },
      { slideIndex: 2, slideTitle: 'See the Execution Flow', chapterIndex: 2, totalDuration: 41.28, audioDuration: 35.28, delaysDuration: 6, segments: [{ segmentIndex: 0, audioDuration: 11.2, delayAfter: 1.5 }, { segmentIndex: 1, audioDuration: 12.88, delayAfter: 1.5 }, { segmentIndex: 2, audioDuration: 11.2, delayAfter: 3 }] },
      { slideIndex: 3, slideTitle: 'Send and Debug Live', chapterIndex: 2, totalDuration: 60.92, audioDuration: 51.92, delaysDuration: 9, segments: [{ segmentIndex: 0, audioDuration: 9.76, delayAfter: 1.5 }, { segmentIndex: 1, audioDuration: 12.08, delayAfter: 1.5 }, { segmentIndex: 2, audioDuration: 7.28, delayAfter: 1.5 }, { segmentIndex: 3, audioDuration: 8.16, delayAfter: 1.5 }, { segmentIndex: 4, audioDuration: 14.64, delayAfter: 3 }] },
      { slideIndex: 4, slideTitle: 'Config, Flights & More', chapterIndex: 2, totalDuration: 46.8, audioDuration: 40.8, delaysDuration: 6, segments: [{ segmentIndex: 0, audioDuration: 13.6, delayAfter: 1.5 }, { segmentIndex: 1, audioDuration: 14.24, delayAfter: 1.5 }, { segmentIndex: 2, audioDuration: 12.96, delayAfter: 3 }] },
      { slideIndex: 1, slideTitle: '22 Tools at Your Fingertips', chapterIndex: 3, totalDuration: 47.52, audioDuration: 41.52, delaysDuration: 6, segments: [{ segmentIndex: 0, audioDuration: 14.16, delayAfter: 1.5 }, { segmentIndex: 1, audioDuration: 17.28, delayAfter: 1.5 }, { segmentIndex: 2, audioDuration: 10.08, delayAfter: 3 }] },
      { slideIndex: 1, slideTitle: 'Two Minutes to Start Debugging', chapterIndex: 4, totalDuration: 41.84, audioDuration: 35.84, delaysDuration: 6, segments: [{ segmentIndex: 0, audioDuration: 14.56, delayAfter: 1.5 }, { segmentIndex: 1, audioDuration: 10.08, delayAfter: 1.5 }, { segmentIndex: 2, audioDuration: 11.2, delayAfter: 3 }] },
      { slideIndex: 1, slideTitle: 'Impact & What\'s Next', chapterIndex: 5, totalDuration: 51.74, audioDuration: 42.24, delaysDuration: 9.5, segments: [{ segmentIndex: 0, audioDuration: 14.88, delayAfter: 1.5 }, { segmentIndex: 1, audioDuration: 10.96, delayAfter: 1.5 }, { segmentIndex: 2, audioDuration: 14, delayAfter: 1.5 }, { segmentIndex: 3, audioDuration: 2.4, delayAfter: 5 }] },
    ]
  }
};
