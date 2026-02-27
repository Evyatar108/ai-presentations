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

// Constants
export { MARKER_TIME_EPSILON, AUTOPLAY_PROBE_DELAY_MS, NO_AUDIO_ADVANCE_DELAY_MS, PLAYBACK_ERROR_ADVANCE_DELAY_MS } from './constants';

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
export { CodeBlock } from './components/CodeBlock';
export type { CodeBlockProps } from './components/CodeBlock';
export { Callout } from './components/Callout';
export type { CalloutProps } from './components/Callout';
export { NumberedStepCard } from './components/NumberedStepCard';
export type { NumberedStepCardProps } from './components/NumberedStepCard';
export { ComparisonTable } from './components/ComparisonTable';
export type { ComparisonTableProps, ComparisonColumn } from './components/ComparisonTable';
export { FieldCard } from './components/FieldCard';
export type { FieldCardProps } from './components/FieldCard';
export { AnimatedCounter } from './components/AnimatedCounter';
export type { AnimatedCounterProps } from './components/AnimatedCounter';
export { CircularProgress } from './components/CircularProgress';
export type { CircularProgressProps } from './components/CircularProgress';
export { AnimatedHeading } from './components/AnimatedHeading';
export type { AnimatedHeadingProps } from './components/AnimatedHeading';
export { AnimatedCheckmark } from './components/AnimatedCheckmark';
export type { AnimatedCheckmarkProps } from './components/AnimatedCheckmark';
export { AnimatedArrow } from './components/AnimatedArrow';
export type { AnimatedArrowProps, ArrowDirection } from './components/AnimatedArrow';
export { MarkerCodeBlock } from './components/MarkerCodeBlock';
export type { MarkerCodeBlockProps } from './components/MarkerCodeBlock';
export { ShikiCodeBlock } from './components/ShikiCodeBlock';
export type { ShikiCodeBlockProps } from './components/ShikiCodeBlock';
export { ProgressSteps } from './components/ProgressSteps';
export type { ProgressStepsProps, ProgressStep } from './components/ProgressSteps';
export { BeforeAfterSplit } from './components/BeforeAfterSplit';
export type { BeforeAfterSplitProps } from './components/BeforeAfterSplit';
export { PipelineDiagram } from './components/PipelineDiagram';
export type { PipelineDiagramProps, PipelineStep } from './components/PipelineDiagram';
export { CandidateGrid } from './components/CandidateGrid';
export type { CandidateGridProps } from './components/CandidateGrid';
export { MarkerCard } from './components/MarkerCard';
export type { MarkerCardProps } from './components/MarkerCard';
export { RevealCarousel } from './components/RevealCarousel';
export type { RevealCarouselProps } from './components/RevealCarousel';

// Reveal components
export { Reveal, RevealAtMarker, RevealGroup, RevealContext, RevealSequence, MarkerDim, AnnotateAtMarker } from './components/reveal';
export type { RevealProps, RevealGroupProps, RevealContextProps, RevealAnimation, RevealVisibilityProps, MarkerDimProps, AnnotateAtMarkerProps } from './components/reveal';

// Contexts
export { SegmentProvider, useSegmentContext, useSegmentContextOptional, useSegmentedAnimation } from './contexts/SegmentContext';
export type { SegmentedAnimationAPI, SegmentState, SegmentControls, SegmentContextValue } from './contexts/SegmentContext';
export { AudioTimeProvider, useAudioTimeContext, useAudioTimeContextOptional } from './contexts/AudioTimeContext';
export type { AudioTimeContextValue } from './contexts/AudioTimeContext';
export { HideInterfaceProvider, useHideInterface } from './contexts/HideInterfaceContext';

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
  createModalBackdrop,
  cardStyle,
  createCard,
  calloutStyle,
  createCallout,
  badgeStyle,
  monoText,
  gradientBadge
} from './slides/SlideStyles';
export type { CardVariant, CalloutVariant, BadgeOptions } from './slides/SlideStyles';
export { spacing, spacingPx, radii, shadows, fontSizes } from './slides/tokens';
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

// Alignment types
export type { AlignedWord, ResolvedMarker, SegmentAlignment, DemoAlignment } from './alignment/types';

// Video bookmark types
export type { VideoBookmark, VideoBookmarkSet, VideoBookmarksFile } from './types/videoBookmarks';
export type { VideoSeekTrigger, VideoWaitTrigger } from './slides/SlideMetadata';

// Video sync context
export { VideoSyncProvider, useVideoSyncContext, useVideoSyncContextOptional } from './contexts/VideoSyncContext';
export type { VideoSyncContextValue } from './contexts/VideoSyncContext';

// Utils
export { loadNarration, getNarrationSegment } from './utils/narrationLoader';
export { checkApiHealth, saveNarrationToFile, realignSegment } from './utils/narrationApiClient';
export { debug } from './utils/debug';
export { buildAudioFileName, buildAudioOutputPath, buildAudioFilePath, resolveAudioFilePath } from './utils/audioPath';
export { loadAlignment, clearAlignmentCache } from './utils/alignmentLoader';

// Hooks
export { useAudioPlayback } from './hooks/useAudioPlayback';
export type { UseAudioPlaybackOptions, UseAudioPlaybackResult } from './hooks/useAudioPlayback';
export { useTtsRegeneration } from './hooks/useTtsRegeneration';
export { useNotifications } from './hooks/useNotifications';
export { useRuntimeTimer } from './hooks/useRuntimeTimer';
export { useApiHealth } from './hooks/useApiHealth';
export { useNarrationEditor } from './hooks/useNarrationEditor';
export { useFocusTrap } from './hooks/useFocusTrap';
export { useAudioTime } from './hooks/useAudioTime';
export type { AudioTimeState } from './hooks/useAudioTime';
export { useMarker, useMarkerRange } from './hooks/useMarker';
export type { MarkerState, MarkerRangeState } from './hooks/useMarker';
export { useWordHighlight } from './hooks/useWordHighlight';
export type { WordHighlightState } from './hooks/useWordHighlight';
export { useLocalStorage } from './hooks/useLocalStorage';
export { useFavorites } from './hooks/useFavorites';
export { useIntersectionObserver } from './hooks/useIntersectionObserver';
export { getParam, getParamList, setParams, pushDemo, pushWelcome } from './hooks/useUrlParams';

// Welcome screen types
export type { SortMode, SortDirection, ViewMode } from './components/welcome/types';

// Accessibility
export { ReducedMotionProvider, WithReducedMotionProvider, ReducedMotionToggle, useReducedMotion } from './accessibility/ReducedMotion';

// Testing utilities
export { TestSlideWrapper, createTestSegment, createTestMetadata, createTestSlide } from './testing/index';
