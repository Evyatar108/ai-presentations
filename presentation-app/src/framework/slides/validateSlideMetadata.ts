import type { SlideMetadata, SlideComponentWithMetadata } from './SlideMetadata';
import { debug } from '../utils/debug';

/**
 * Validation errors found during metadata inspection.
 */
export interface SlideValidationError {
  slideIndex: number;
  field: string;
  message: string;
}

/**
 * Validates a single slide's metadata for common mistakes.
 * Returns an array of errors (empty if valid).
 */
export function validateSlideMetadata(
  metadata: SlideMetadata,
  slideIndex: number
): SlideValidationError[] {
  const errors: SlideValidationError[] = [];

  if (!Number.isInteger(metadata.chapter) || metadata.chapter < 0) {
    errors.push({
      slideIndex,
      field: 'chapter',
      message: `chapter must be a non-negative integer, got ${metadata.chapter}`,
    });
  }

  if (!Number.isInteger(metadata.slide) || metadata.slide < 0) {
    errors.push({
      slideIndex,
      field: 'slide',
      message: `slide must be a non-negative integer, got ${metadata.slide}`,
    });
  }

  if (!metadata.title || metadata.title.trim().length === 0) {
    errors.push({
      slideIndex,
      field: 'title',
      message: 'title must be a non-empty string',
    });
  }

  if (!Array.isArray(metadata.audioSegments)) {
    errors.push({
      slideIndex,
      field: 'audioSegments',
      message: 'audioSegments must be an array',
    });
  } else {
    const seenIds = new Set<string>();
    for (let i = 0; i < metadata.audioSegments.length; i++) {
      const seg = metadata.audioSegments[i];

      if (!seg.id || seg.id.trim().length === 0) {
        errors.push({
          slideIndex,
          field: `audioSegments[${i}].id`,
          message: 'segment id must be a non-empty string',
        });
      } else if (seenIds.has(seg.id)) {
        errors.push({
          slideIndex,
          field: `audioSegments[${i}].id`,
          message: `duplicate segment id "${seg.id}" within slide`,
        });
      } else {
        seenIds.add(seg.id);
      }

      if (seg.audioFilePath !== undefined && seg.audioFilePath.trim().length === 0) {
        errors.push({
          slideIndex,
          field: `audioSegments[${i}].audioFilePath`,
          message: 'segment audioFilePath must not be an empty string (omit it to auto-derive)',
        });
      }

      if (seg.duration !== undefined && (typeof seg.duration !== 'number' || seg.duration < 0)) {
        errors.push({
          slideIndex,
          field: `audioSegments[${i}].duration`,
          message: `segment duration must be a non-negative number, got ${seg.duration}`,
        });
      }
    }
  }

  // Validate timing values if present
  if (metadata.timing) {
    for (const key of ['betweenSegments', 'betweenSlides', 'afterFinalSlide'] as const) {
      const val = metadata.timing[key];
      if (val !== undefined && (typeof val !== 'number' || val < 0)) {
        errors.push({
          slideIndex,
          field: `timing.${key}`,
          message: `timing.${key} must be a non-negative number, got ${val}`,
        });
      }
    }
  }

  return errors;
}

/**
 * Validates an entire demo's slide array for individual and cross-slide issues.
 * Logs errors to the dev console via `debug.error()`.
 * Returns all found validation errors.
 */
export function validateDemoSlides(
  slides: SlideComponentWithMetadata[]
): SlideValidationError[] {
  const allErrors: SlideValidationError[] = [];

  // Per-slide validation
  for (let i = 0; i < slides.length; i++) {
    const slide = slides[i];
    if (!slide.metadata) {
      allErrors.push({
        slideIndex: i,
        field: 'metadata',
        message: 'slide is missing metadata',
      });
      continue;
    }
    allErrors.push(...validateSlideMetadata(slide.metadata, i));
  }

  // Cross-slide uniqueness: chapter+slide pairs
  const seen = new Map<string, number>();
  for (let i = 0; i < slides.length; i++) {
    const meta = slides[i]?.metadata;
    if (!meta) continue;
    const key = `ch${meta.chapter}:s${meta.slide}`;
    const prev = seen.get(key);
    if (prev !== undefined) {
      allErrors.push({
        slideIndex: i,
        field: 'chapter+slide',
        message: `duplicate chapter+slide "${key}" (also at slide index ${prev})`,
      });
    } else {
      seen.set(key, i);
    }
  }

  // Report errors
  if (allErrors.length > 0) {
    debug.error(
      `Slide metadata validation found ${allErrors.length} error(s):`,
      allErrors
    );
  }

  return allErrors;
}
