import type { DemoConfig } from '@framework';
import { metadata } from './metadata';

const demoConfig: DemoConfig = {
  metadata,
  defaultMode: 'narrated',
  getSlides: async () => {
    const { allSlides } = await import('./slides/SlidesRegistry');
    return allSlides;
  }
};

export default demoConfig;
