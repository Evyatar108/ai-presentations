import type { DemoConfig } from '@framework';
import { metadata } from './metadata';

const demoConfig: DemoConfig = {
  metadata,
  defaultMode: 'manual',
  timing: {
    betweenSegments: 600,
    betweenSlides: 1200,
  },
  getSlides: async () => {
    const { allSlides } = await import('./slides/SlidesRegistry');
    return allSlides;
  }
};

export default demoConfig;
