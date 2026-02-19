/**
 * Auto-Discovery Demo Registration
 *
 * Uses Vite's import.meta.glob to automatically discover and register all demos.
 * Each demo in src/demos/{demo-id}/ must have:
 *   - metadata.ts with `export const metadata: DemoMetadata`
 *   - index.ts with `export default demoConfig: DemoConfig`
 *
 * Import this file as a side-effect in main.tsx to ensure demos are registered at startup.
 */

import { DemoRegistry } from '@framework';
import type { DemoMetadata, DemoConfig } from '@framework';

// Eagerly load all metadata (for welcome screen listing)
const metadataModules = import.meta.glob<{ metadata: DemoMetadata }>(
  './*/metadata.ts',
  { eager: true }
);

// Lazily load all configs (on-demand when demo is selected)
const configLoaders = import.meta.glob<{ default: DemoConfig }>(
  './*/index.ts'
);

for (const [metadataPath, metadataModule] of Object.entries(metadataModules)) {
  const metadata = metadataModule.metadata;
  if (!metadata?.id) {
    console.warn(`[DemoRegistry] Skipping ${metadataPath}: no metadata.id`);
    continue;
  }

  const configPath = metadataPath.replace('/metadata.ts', '/index.ts');
  const configLoader = configLoaders[configPath];
  if (!configLoader) {
    console.warn(`[DemoRegistry] Skipping ${metadata.id}: no index.ts`);
    continue;
  }

  DemoRegistry.registerDemo({
    id: metadata.id,
    metadata,
    loadConfig: async () => (await configLoader()).default,
  });
}
