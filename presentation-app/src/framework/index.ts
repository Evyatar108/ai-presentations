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
export type { DemoPlayerProps } from './components/DemoPlayer';
export { WelcomeScreen } from './components/WelcomeScreen';
export { NarratedController } from './components/NarratedController';
export type { NarratedControllerProps } from './components/NarratedController';
export { SlidePlayer } from './components/SlidePlayer';
export type { Slide, SlidePlayerProps } from './components/SlidePlayer';
export { VideoPlayer } from './components/VideoPlayer';
export { NarrationEditModal } from './components/NarrationEditModal';
export { MetricTile } from './components/MetricTile';
export type { MetricTileProps } from './components/MetricTile';
export { SlideErrorBoundary } from './components/SlideErrorBoundary';
export { DemoPlayerBoundary } from './components/DemoPlayerBoundary';
export { HoverButton } from './components/HoverButton';
export type { HoverButtonProps } from './components/HoverButton';

// Contexts
export { SegmentProvider, useSegmentContext, useSegmentedAnimation } from './contexts/SegmentContext';
export type { SegmentedAnimationAPI, SegmentState, SegmentControls, SegmentContextValue } from './contexts/SegmentContext';

// Slides
export type { SlideMetadata, SlideComponentWithMetadata, AudioSegment } from './slides/SlideMetadata';
export { hasAudioSegments, getTotalDuration } from './slides/SlideMetadata';
export { defineSlide } from './slides/defineSlide';
export type { DefineSlideOptions } from './slides/defineSlide';
export { validateSlideMetadata, validateDemoSlides } from './slides/validateSlideMetadata';
export type { SlideValidationError } from './slides/validateSlideMetadata';
export { SlideContainer, ContentCard, GradientHighlightBox, SlideTitle, MetricDisplay, TestimonialCard, BenefitCard, ImprovementCard } from './slides/SlideLayouts';
export type {
  SlideContainerProps,
  ContentCardProps,
  HighlightBoxProps,
  SlideTitleProps,
  MetricDisplayProps,
  TestimonialCardProps,
  BenefitCardProps,
  ImprovementCardProps
} from './slides/SlideLayouts';
export {
  slideContainer,
  contentBox,
  gradientBox,
  successGradientBox,
  highlightBorder,
  highlightOverlayBox,
  warningBox,
  circularBadge,
  typography,
  layouts,
  createSlideContainer,
  createContentBox,
  createGradientBox,
  createTypography,
  createOverlayContainer,
  createFixedButton,
  createModalBackdrop
} from './slides/SlideStyles';
export {
  fadeIn,
  fadeUp,
  fadeDown,
  fadeLeft,
  fadeRight,
  scaleIn,
  scaleInSpring,
  staggerContainer,
  tileVariants,
  arrowVariants,
  targetVariants,
  promptVariants,
  pulseGlow,
  emphasisPulse,
  rotateFromTo,
  expandWidth,
  expandHeight
} from './slides/AnimationVariants';
export { ArrowDown, ArrowRight, ArrowRightLarge, ArrowRightXL, ArrowDownSmall, Checkmark, ConvergingLines, EmojiIcons } from './slides/SlideIcons';

// Demos
export { DemoRegistry } from './demos/DemoRegistry';
export type { DemoMetadata, DemoConfig, DemoRegistryEntry, DurationInfo, NarrationFallback, DemoDefaultMode } from './demos/types';
export { resolveTimingConfig, DEFAULT_TIMING, DEFAULT_START_TRANSITION } from './demos/timing/types';
export type { TimingConfig, ResolvedTimingConfig, StartTransition } from './demos/timing/types';
export { calculateSlideDuration, calculatePresentationDuration } from './demos/timing/calculator';
export type { SlideDurationBreakdown, PresentationDurationReport, SegmentDurationInfo } from './demos/timing/calculator';

// Utils
export { loadNarration, getNarrationText } from './utils/narrationLoader';
export { checkApiHealth, saveNarrationToFile } from './utils/narrationApiClient';
export { debug } from './utils/debug';
export { buildAudioFileName, buildAudioOutputPath, buildAudioFilePath, resolveAudioFilePath } from './utils/audioPath';

// Hooks
export { useTtsRegeneration } from './hooks/useTtsRegeneration';
export { useNotifications } from './hooks/useNotifications';
export { useRuntimeTimer } from './hooks/useRuntimeTimer';
export { useApiHealth } from './hooks/useApiHealth';
export { useNarrationEditor } from './hooks/useNarrationEditor';
export { useFocusTrap } from './hooks/useFocusTrap';

// Accessibility
export { ReducedMotionProvider, WithReducedMotionProvider, ReducedMotionToggle, useReducedMotion } from './accessibility/ReducedMotion';

// Testing utilities
export { TestSlideWrapper, createTestSegment, createTestMetadata, createTestSlide } from './testing/index';
