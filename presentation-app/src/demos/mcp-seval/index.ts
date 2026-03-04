import type { DemoConfig, TimingConfig } from '@framework';
import { metadata } from './metadata';

const timing: TimingConfig = {
  betweenSegments: 1500,
  betweenSlides: 3000,
  afterFinalSlide: 5000,
};

const demoConfig: DemoConfig = {
  metadata,
  defaultMode: 'narrated',
  timing,
  chapters: {
    0: { title: 'The Challenge' },
    1: { title: 'The Toolkit' },
    2: { title: 'Key Workflows' },
    3: { title: 'Going Further' },
    4: { title: 'Get Started' },
  },
  getSlides: async () => {
    const { allSlides } = await import('./slides/SlidesRegistry');
    return allSlides;
  },
};

export default demoConfig;
