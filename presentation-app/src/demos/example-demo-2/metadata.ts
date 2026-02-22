import type { DemoMetadata } from '@framework';

export const metadata: DemoMetadata = {
  id: 'example-demo-2',
  title: 'Example Demo 2',
  description: 'Showcases layout components, named segments, and timing overrides',
  thumbnail: '/images/example-demo-2/thumbnail.jpeg',
  tags: ['example', 'layout', 'named-segments', 'timing'],
  hidden: true,

  durationInfo: {
    audioOnly: 0,
    segmentDelays: 1.8,
    slideDelays: 2.4,
    finalDelay: 2,
    startSilence: 3,
    total: 9.2,
    slideBreakdown: [
      { slideIndex: 1, slideTitle: 'Title Slide', chapterIndex: 0, totalDuration: 1.2, audioDuration: 0, delaysDuration: 1.2, segments: [{ segmentIndex: 0, audioDuration: 0, delayAfter: 1.2 }] },
      { slideIndex: 2, slideTitle: 'System Benefits', chapterIndex: 0, totalDuration: 2.4, audioDuration: 0, delaysDuration: 2.4, segments: [{ segmentIndex: 0, audioDuration: 0, delayAfter: 0.6 }, { segmentIndex: 1, audioDuration: 0, delayAfter: 0.6 }, { segmentIndex: 2, audioDuration: 0, delayAfter: 1.2 }] },
      { slideIndex: 3, slideTitle: 'Framework Impact', chapterIndex: 0, totalDuration: 2.6, audioDuration: 0, delaysDuration: 2.6, segments: [{ segmentIndex: 0, audioDuration: 0, delayAfter: 0.6 }, { segmentIndex: 1, audioDuration: 0, delayAfter: 2 }] },
    ]
  }
};
