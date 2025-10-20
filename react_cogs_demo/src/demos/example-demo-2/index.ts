import { DemoConfig } from '../types';
import { metadata } from './metadata';

export const demo: DemoConfig = {
  id: 'example-demo-2',
  metadata,
  defaultMode: 'manual',
  getSlides: async () => {
    const { allSlides } = await import('./slides/SlidesRegistry');
    return allSlides;
  }
};