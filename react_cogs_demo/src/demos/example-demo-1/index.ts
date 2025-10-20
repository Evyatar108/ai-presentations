import { DemoConfig } from '../types';
import { metadata } from './metadata';

export const demo: DemoConfig = {
  id: 'example-demo-1',
  metadata,
  defaultMode: 'narrated',
  getSlides: async () => {
    const { allSlides } = await import('./slides/SlidesRegistry');
    return allSlides;
  }
};