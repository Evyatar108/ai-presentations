import { DemoConfig } from '../../framework/demos/types';
import { metadata } from './metadata';

const demoConfig: DemoConfig = {
  id: 'example-demo-2',
  metadata,
  defaultMode: 'manual',
  getSlides: async () => {
    const { allSlides } = await import('./slides/SlidesRegistry');
    return allSlides;
  }
};

export default demoConfig;