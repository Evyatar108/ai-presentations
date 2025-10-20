import { SlideComponentWithMetadata } from '../../../slides/SlideMetadata';

// Import slides from chapter files
import {
  Ex1_S1_Title,
  Ex1_S2_Content1,
  Ex1_S3_Conclusion
} from './chapters/Chapter0';

/**
 * Central registry of all slide components for Example Demo 1.
 * This placeholder demo demonstrates the multi-demo architecture.
 */
export const allSlides: SlideComponentWithMetadata[] = [
  Ex1_S1_Title,
  Ex1_S2_Content1,
  Ex1_S3_Conclusion
];