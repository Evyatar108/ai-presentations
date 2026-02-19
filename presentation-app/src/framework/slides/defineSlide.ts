import type { SlideMetadata, SlideComponentWithMetadata } from './SlideMetadata';

/**
 * Options for defining a slide with metadata at creation time.
 */
export interface DefineSlideOptions {
  metadata: SlideMetadata;
  component: React.FC;
}

/**
 * Factory function that creates a SlideComponentWithMetadata by attaching
 * metadata to a component at definition time. This ensures metadata is
 * always present and correctly typed, replacing the error-prone two-step
 * pattern of defining a component then separately assigning `.metadata`.
 *
 * @example
 * export const MySlide = defineSlide({
 *   metadata: {
 *     chapter: 1,
 *     slide: 1,
 *     title: 'My Slide',
 *     audioSegments: [{ id: 'intro', audioFilePath: '/audio/demo/c1/s1.wav' }]
 *   },
 *   component: () => <div>Hello</div>
 * });
 */
export function defineSlide(options: DefineSlideOptions): SlideComponentWithMetadata {
  const slide: SlideComponentWithMetadata = Object.assign(
    (props: Record<string, never>) => options.component(props),
    { metadata: options.metadata }
  );

  // Preserve the component's display name for React DevTools
  slide.displayName = options.component.displayName || options.component.name || 'Slide';

  return slide;
}
