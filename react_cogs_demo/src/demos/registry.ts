/**
 * Demo Registrations
 *
 * This file registers all project-specific demos with the framework's DemoRegistry.
 * Import this file as a side-effect in main.tsx to ensure demos are registered at startup.
 */

import { DemoRegistry } from '../framework/demos/DemoRegistry';

// ---- Meeting Highlights ----
import meetingHighlightsDemo from './meeting-highlights';
import { meetingHighlightsMetadata } from './meeting-highlights/metadata';

DemoRegistry.registerDemo({
  id: meetingHighlightsDemo.id,
  metadata: meetingHighlightsMetadata,
  loadConfig: async () => meetingHighlightsDemo
});

// ---- Example Demo 1 ----
import exampleDemo1 from './example-demo-1';
import { metadata as exampleDemo1Metadata } from './example-demo-1/metadata';

DemoRegistry.registerDemo({
  id: exampleDemo1.id,
  metadata: exampleDemo1Metadata,
  loadConfig: async () => exampleDemo1
});

// ---- Example Demo 2 ----
import exampleDemo2 from './example-demo-2';
import { metadata as exampleDemo2Metadata } from './example-demo-2/metadata';

DemoRegistry.registerDemo({
  id: exampleDemo2.id,
  metadata: exampleDemo2Metadata,
  loadConfig: async () => exampleDemo2
});
