/**
 * Demo Registry - Manages registration and lazy loading of demo presentations.
 * Provides centralized access to demo metadata and configurations.
 */

import type { DemoMetadata, DemoConfig, DemoRegistryEntry } from './types';

// Internal registry storage
const registry: DemoRegistryEntry[] = [];

/**
 * Register a demo in the registry.
 * Only registers if the ID is not already present.
 *
 * @param entry - Demo registry entry to register
 */
function registerDemo(entry: DemoRegistryEntry): void {
  const exists = registry.some(existing => existing.id === entry.id);
  if (!exists) {
    registry.push(entry);
  }
}

/**
 * Get metadata for all registered demos.
 *
 * @returns Array of demo metadata objects
 */
function getAllMetadata(): DemoMetadata[] {
  return registry.map(entry => entry.metadata);
}

/**
 * Get all registered demo IDs.
 *
 * @returns Array of demo IDs
 */
function getDemoIds(): string[] {
  return registry.map(entry => entry.id);
}

/**
 * Get metadata for a specific demo by ID.
 *
 * @param id - Demo identifier
 * @returns Demo metadata or undefined if not found
 */
function getMetadataById(id: string): DemoMetadata | undefined {
  const entry = registry.find(e => e.id === id);
  return entry?.metadata;
}

/**
 * Load full configuration for a demo.
 *
 * @param id - Demo identifier
 * @returns Promise resolving to demo configuration
 * @throws Error if demo not found
 */
async function loadDemoConfig(id: string): Promise<DemoConfig> {
  const entry = registry.find(e => e.id === id);
  if (!entry) {
    throw new Error(`Demo not found: ${id}`);
  }
  return entry.loadConfig();
}

/**
 * Validate that all registered demo IDs are unique.
 * Useful for development-time checks.
 *
 * @throws Error if duplicate IDs are found
 */
function ensureUniqueIds(): void {
  const ids = registry.map(e => e.id);
  const duplicates = ids.filter((id, index) => ids.indexOf(id) !== index);

  if (duplicates.length > 0) {
    throw new Error(`Duplicate demo IDs detected: ${duplicates.join(', ')}`);
  }
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
  ensureUniqueIds,
};
