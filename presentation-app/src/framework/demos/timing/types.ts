/**
 * Timing System for Narrated Presentations
 * 
 * Provides a flexible three-level timing configuration system:
 * - Demo-level defaults
 * - Slide-level overrides
 * - Segment-level overrides
 * 
 * Resolution order: Segment → Slide → Demo → Global Defaults
 */

/**
 * Timing configuration for delays in narrated presentations.
 * All values in milliseconds.
 * 
 * All fields are optional to support progressive enhancement and backward compatibility.
 * Undefined values will be resolved to defaults during configuration merging.
 */
export interface TimingConfig {
  /** 
   * Delay between audio segments within a slide.
   * Default: 500ms
   */
  betweenSegments?: number;
  
  /** 
   * Delay between slides (after last segment of a slide).
   * Default: 1000ms
   */
  betweenSlides?: number;
  
  /**
   * Delay after the final slide before showing end overlay.
   * Default: 2000ms
   */
  afterFinalSlide?: number;

  /**
   * Silence duration before the first slide appears (blank screen).
   * Default: 1000ms. Set to 0 to disable.
   */
  beforeFirstSlide?: number;
  
  /** 
   * Additional custom delays for specific scenarios.
   * Can be used for special timing requirements beyond standard delays.
   */
  custom?: {
    [key: string]: number;
  };
}

/**
 * Global default timing values used across all demos.
 * These serve as the ultimate fallback when no overrides are specified.
 * 
 * Default values:
 * - betweenSegments: 500ms (comfortable pause between audio segments)
 * - betweenSlides: 1000ms (clear transition between slides)
 * - afterFinalSlide: 2000ms (time to absorb final slide before end overlay)
 */
export const DEFAULT_TIMING: Required<TimingConfig> = {
  betweenSegments: 500,
  betweenSlides: 1000,
  afterFinalSlide: 2000,
  beforeFirstSlide: 1000,
  custom: {}
};

/**
 * Resolved timing configuration with all defaults applied.
 * Guaranteed to have all timing fields populated with concrete values.
 * 
 * This type ensures that components can safely access timing values
 * without checking for undefined.
 */
export interface ResolvedTimingConfig extends Required<TimingConfig> {}

/**
 * Merge multiple timing configurations with proper override precedence.
 * 
 * Later configs override earlier ones (left-to-right precedence).
 * This matches the conceptual hierarchy: Demo → Slide → Segment
 * 
 * Example usage:
 * ```typescript
 * // Resolve with demo, slide, and segment configs
 * const timing = resolveTimingConfig(
 *   demoConfig.timing,      // Demo-level defaults
 *   slideMetadata.timing,   // Slide-level overrides
 *   segment.timing          // Segment-level overrides (highest priority)
 * );
 * ```
 * 
 * @param configs - Variable number of timing configs to merge (undefined values are skipped)
 * @returns Fully resolved timing configuration with all fields populated
 */
/**
 * Transition animation for the start silence overlay.
 * Controls how the blank screen animates away when the first slide appears.
 */
export interface StartTransition {
  /** Exit animation target. Default: { opacity: 0 } (fade out) */
  exit?: {
    opacity?: number;
    scale?: number;
    x?: number | string;
    y?: number | string;
  };
  /** Transition timing. Default: { duration: 0.8, ease: 'easeInOut' } */
  transition?: {
    duration?: number;
    ease?: string | number[];
    type?: 'tween' | 'spring';
    stiffness?: number;
    damping?: number;
  };
}

export const DEFAULT_START_TRANSITION: Required<Pick<StartTransition, 'exit' | 'transition'>> = {
  exit: { opacity: 0 },
  transition: { duration: 0.8, ease: 'easeInOut' },
};

export function resolveTimingConfig(
  ...configs: (TimingConfig | undefined)[]
): ResolvedTimingConfig {
  // Start with global defaults
  const merged: ResolvedTimingConfig = { ...DEFAULT_TIMING };
  
  // Apply each config in order (left-to-right)
  for (const config of configs) {
    if (!config) continue;
    
    // Override segment delay if specified
    if (config.betweenSegments !== undefined) {
      merged.betweenSegments = config.betweenSegments;
    }
    
    // Override slide delay if specified
    if (config.betweenSlides !== undefined) {
      merged.betweenSlides = config.betweenSlides;
    }
    
    // Override final slide delay if specified
    if (config.afterFinalSlide !== undefined) {
      merged.afterFinalSlide = config.afterFinalSlide;
    }

    // Override start silence if specified
    if (config.beforeFirstSlide !== undefined) {
      merged.beforeFirstSlide = config.beforeFirstSlide;
    }
    
    // Merge custom delays (later custom values override earlier ones)
    if (config.custom) {
      merged.custom = { ...merged.custom, ...config.custom };
    }
  }
  
  return merged;
}