import type { DemoMetadata } from '@framework';

export const metadata: DemoMetadata = {
  id: 'example-demo-1',
  title: 'Example Demo 1',
  description: 'A placeholder demo showcasing the multi-demo architecture',
  thumbnail: '/images/example-demo-1/thumbnail.jpeg',
  tags: ['example', 'placeholder', 'demo'],

  durationInfo: {
    audioOnly: 0,
    segmentDelays: 1.5,
    slideDelays: 2,
    finalDelay: 2,
    startSilence: 3,
    total: 8.5,
    slideBreakdown: [
      { slideIndex: 1, slideTitle: 'Title Slide', chapterIndex: 0, totalDuration: 1, audioDuration: 0, delaysDuration: 1, segments: [{ segmentIndex: 0, audioDuration: 0, delayAfter: 1 }] },
      { slideIndex: 2, slideTitle: 'Key Features', chapterIndex: 0, totalDuration: 2.5, audioDuration: 0, delaysDuration: 2.5, segments: [{ segmentIndex: 0, audioDuration: 0, delayAfter: 0.5 }, { segmentIndex: 1, audioDuration: 0, delayAfter: 0.5 }, { segmentIndex: 2, audioDuration: 0, delayAfter: 0.5 }, { segmentIndex: 3, audioDuration: 0, delayAfter: 1 }] },
      { slideIndex: 3, slideTitle: 'Conclusion', chapterIndex: 0, totalDuration: 2, audioDuration: 0, delaysDuration: 2, segments: [{ segmentIndex: 0, audioDuration: 0, delayAfter: 2 }] },
    ]
  }
};
