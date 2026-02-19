/**
 * Demo Registry - Manages registration and lazy loading of demo presentations.
 * Provides centralized access to demo metadata and configurations.
 *
 * Internally uses a Map<string, DemoRegistryEntry> for O(1) lookups
 * and structural duplicate prevention.
 */

import type { DemoMetadata, DemoConfig, DemoRegistryEntry } from './types';

// Internal registry storage (Map prevents duplicate keys structurally)
const registry = new Map<string, DemoRegistryEntry>();

/**
 * Register a demo in the registry.
 * Only registers if the ID is not already present.
 *
 * @param entry - Demo registry entry to register
 */
function registerDemo(entry: DemoRegistryEntry): void {
  // Validate loadConfig is a function
  if (typeof entry.loadConfig !== 'function') {
    console.error(`[DemoRegistry] Cannot register "${entry.id}": loadConfig is not a function`);
    return;
  }

  // Warn if metadata.title is missing
  if (!entry.metadata?.title) {
    console.warn(`[DemoRegistry] Demo "${entry.id}" is missing metadata.title`);
  }

  // Warn if entry.id and metadata.id are inconsistent
  if (entry.metadata?.id && entry.id !== entry.metadata.id) {
    console.warn(
      `[DemoRegistry] ID mismatch for "${entry.id}": entry.id="${entry.id}" vs metadata.id="${entry.metadata.id}"`
    );
  }

  if (registry.has(entry.id)) {
    console.warn(`[DemoRegistry] Skipping duplicate registration for "${entry.id}"`);
    return;
  }
  registry.set(entry.id, entry);
}

/**
 * Get metadata for all registered demos.
 * Returns shallow copies to prevent consumer mutation.
 *
 * @returns Array of demo metadata objects
 */
function getAllMetadata(): DemoMetadata[] {
  return Array.from(registry.values()).map(entry => ({ ...entry.metadata }));
}

/**
 * Get all registered demo IDs.
 *
 * @returns Array of demo IDs
 */
function getDemoIds(): string[] {
  return Array.from(registry.keys());
}

/**
 * Get metadata for a specific demo by ID.
 * Returns a shallow copy to prevent consumer mutation.
 *
 * @param id - Demo identifier
 * @returns Demo metadata or undefined if not found
 */
function getMetadataById(id: string): DemoMetadata | undefined {
  const entry = registry.get(id);
  return entry ? { ...entry.metadata } : undefined;
}

/**
 * Load full configuration for a demo.
 *
 * @param id - Demo identifier
 * @returns Promise resolving to demo configuration
 * @throws Error if demo not found
 */
async function loadDemoConfig(id: string): Promise<DemoConfig> {
  const entry = registry.get(id);
  if (!entry) {
    throw new Error(`Demo not found: ${id}`);
  }
  return entry.loadConfig();
}

/**
 * Reset registry state. Only intended for test isolation.
 */
function _resetForTesting(): void {
  registry.clear();
}

/**
 * Exported DemoRegistry API
 */
export const DemoRegistry = {
  registerDemo,
  getAllMetadata,
  getDemoIds,
  getMetadataById,
  loadDemoConfig,
  _resetForTesting,
};
