/**
 * Core type definitions for multi-demo support system.
 * Defines interfaces for demo metadata, configuration, and registry entries.
 */

import { SlideComponentWithMetadata } from '../slides/SlideMetadata';

/**
 * Metadata describing a demo presentation.
 */
export interface DemoMetadata {
  /** Unique stable identifier (kebab-case) */
  id: string;
  /** Display name for the demo */
  title: string;
  /** Short summary of the demo content */
  description?: string;
  /** Public path to thumbnail image */
  thumbnail?: string;
  /** Categorical labels for filtering/organizing demos */
  tags?: string[];
  /** Total duration in seconds (for narrated presentations) */
  duration?: number;
}

/**
 * Default playback mode for a demo presentation.
 */
export type DemoDefaultMode = 'narrated' | 'manual' | 'manual-audio';

/**
 * Complete configuration for a demo presentation.
 */
export interface DemoConfig {
  /** Unique identifier matching metadata */
  id: string;
  /** Demo metadata */
  metadata: DemoMetadata;
  /** Default playback mode (defaults to 'narrated' if not specified) */
  defaultMode?: DemoDefaultMode;
  /** Lazy loader for slide definitions */
  getSlides: () => Promise<SlideComponentWithMetadata[]>;
}

/**
 * Registry entry for a demo, supporting lazy loading.
 */
export interface DemoRegistryEntry {
  /** Unique identifier */
  id: string;
  /** Demo metadata (always available without loading full config) */
  metadata: DemoMetadata;
  /** Lazy loader for full demo configuration */
  loadConfig: () => Promise<DemoConfig>;
}