/**
 * Backward compatibility shim for SlidesRegistry.ts
 * 
 * This file re-exports all exports from the new location to maintain
 * compatibility with existing code that imports from the old path.
 * 
 * The actual SlidesRegistry has been moved to:
 * src/demos/meeting-highlights/slides/SlidesRegistry.ts
 */

export * from '../demos/meeting-highlights/slides/SlidesRegistry';