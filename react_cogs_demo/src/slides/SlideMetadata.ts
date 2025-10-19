/**
 * Metadata interface that all narrated slide components must implement
 */
export interface SlideMetadata {
  chapter: number;
  utterance: number;
  title: string;
  audioFilePath: string;
}

/**
 * Type for a slide component with metadata
 */
export interface SlideComponentWithMetadata extends React.FC {
  metadata: SlideMetadata;
}