/**
 * Presentation Framework - Barrel Export
 *
 * Re-exports key types, components, utilities, and the registry
 * for convenient importing from a single entry point.
 */

// Theme system
export { ThemeProvider, useTheme } from './theme/ThemeContext';
export { defaultTheme } from './theme/defaultTheme';
export type { PresentationTheme, PartialTheme, ThemeColors } from './theme/types';

// Config
export { getConfig, setProjectConfig, defaultConfig } from './config';
export type { FrameworkConfig } from './config';

// Components
export { DemoPlayer } from './components/DemoPlayer';
export { WelcomeScreen } from './components/WelcomeScreen';
export { NarratedController } from './components/NarratedController';
export { SlidePlayer } from './components/SlidePlayer';
export type { Slide } from './components/SlidePlayer';
export { VideoPlayer } from './components/VideoPlayer';
export { NarrationEditModal } from './components/NarrationEditModal';
export { MetricTile } from './components/MetricTile';
export type { MetricTileProps } from './components/MetricTile';

// Contexts
export { SegmentProvider, useSegmentContext, useSegmentedAnimation } from './contexts/SegmentContext';

// Slides
export type { SlideMetadata, SlideComponentWithMetadata, AudioSegment } from './slides/SlideMetadata';
export { hasAudioSegments, getTotalDuration } from './slides/SlideMetadata';
export { SlideContainer, ContentCard, GradientHighlightBox, SlideTitle, MetricDisplay, TestimonialCard, BenefitCard, ImprovementCard } from './slides/SlideLayouts';
export * from './slides/SlideStyles';
export * from './slides/AnimationVariants';
export { ArrowDown, ArrowRight, ArrowRightLarge, ArrowRightXL, ArrowDownSmall, Checkmark, ConvergingLines, EmojiIcons } from './slides/SlideIcons';

// Demos
export { DemoRegistry } from './demos/DemoRegistry';
export type { DemoMetadata, DemoConfig, DemoRegistryEntry } from './demos/types';
export { resolveTimingConfig, DEFAULT_TIMING } from './demos/timing/types';
export type { TimingConfig, ResolvedTimingConfig } from './demos/timing/types';

// Utils
export { loadNarration, getNarrationText } from './utils/narrationLoader';
export { checkApiHealth, saveNarrationToFile } from './utils/narrationApiClient';

// Accessibility
export { ReducedMotionProvider, WithReducedMotionProvider, ReducedMotionToggle, useReducedMotion } from './accessibility/ReducedMotion';
