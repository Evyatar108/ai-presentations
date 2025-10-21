# Timing & Duration System Refactoring

## Overview

This refactoring adds a comprehensive timing configuration system to accurately calculate presentation durations including all delays (between segments, between slides, and after final slide).

## Problem Statement

Currently, duration calculations only account for audio file durations. The actual presentation runtime includes:
- **Delays between segments** (hardcoded: 500ms)
- **Delays between slides** (hardcoded: 1000ms)  
- **Delay after final slide** (hardcoded: 2000ms)

This causes discrepancy between calculated duration (~4:07) and actual runtime.

## Solution

A flexible three-level timing hierarchy:
- **Per-Demo Defaults** - Each demo defines its timing style
- **Per-Slide Overrides** - Individual slides can adjust timing
- **Per-Segment Overrides** - Specific segments can have custom delays

**Resolution Order**: Segment → Slide → Demo → Global Defaults

## Documentation Structure

### Core Documentation
- **[Architecture](./ARCHITECTURE.md)** - System design, types, and components
- **[Implementation Guide](./IMPLEMENTATION.md)** - Step-by-step implementation phases
- **[WelcomeScreen Enhancement](./WELCOME_SCREEN.md)** - Detailed breakdown UI design
- **[Usage Examples](./EXAMPLES.md)** - Common timing configuration patterns
- **[Migration Guide](./MIGRATION.md)** - How to migrate existing demos

### Implementation Tracking
- **[TODO.md](./TODO.md)** - Implementation progress checklist

## Key Features

### ✅ Accurate Duration Calculations
- Audio-only duration
- Segment delays (between segments within slides)
- Slide delays (between slides)
- Final delay (after last slide)
- Total duration (complete runtime)

### ✅ Flexible Configuration
- Three-level hierarchy (demo/slide/segment)
- Type-safe with TypeScript
- Optional fields (backward compatible)
- Clear override precedence

### ✅ Enhanced UI
- Summary view with breakdown
- Interactive "View Details" button
- Per-slide and per-segment details
- Scrollable modal for many slides

### ✅ Developer Experience
- Single source of truth for timing
- Self-documenting configuration
- Clear examples and guidelines
- Validation warnings for common issues

## Quick Start

1. Read [Architecture](./ARCHITECTURE.md) to understand the design
2. Follow [Implementation Guide](./IMPLEMENTATION.md) phase-by-phase
3. Check [TODO.md](./TODO.md) for current progress
4. See [Examples](./EXAMPLES.md) for common patterns

## Timeline Estimate

- **Phase 1-2** (Infrastructure + Calculator): 4-6 hours
- **Phase 3-4** (Runtime Integration): 2-3 hours
- **Phase 5-6** (Demo Configs + Examples): 2-3 hours
- **Phase 7** (WelcomeScreen Enhancement): 3-4 hours
- **Documentation**: 2-3 hours

**Total**: 13-19 hours

## Benefits

| Benefit | Description |
|---------|-------------|
| **Accuracy** | Calculations match actual runtime (±1s) |
| **Flexibility** | Three levels of customization |
| **Transparency** | Users see complete breakdown |
| **Type-Safety** | Full TypeScript support |
| **Maintainability** | Single source of truth |
| **Scalability** | Easy to add custom patterns |

## Questions?

For implementation questions, see [Implementation Guide](./IMPLEMENTATION.md).  
For usage examples, see [Usage Examples](./EXAMPLES.md).  
For migration help, see [Migration Guide](./MIGRATION.md).