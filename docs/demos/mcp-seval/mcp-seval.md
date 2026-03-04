# MCP SEVAL Demo

## Overview

Narrated presentation showcasing the MCP SEVAL server — 16 evaluation tools that give an AI agent full access to the Sydney evaluation platform lifecycle.

**Demo ID**: `mcp-seval`
**Duration**: ~7-8 minutes (narrated)
**Slides**: 11 across 5 chapters

## Chapter Structure

| Ch | Title | Slides | Focus |
|----|-------|--------|-------|
| 0 | The Challenge | 2 | Title + evaluation problem framing |
| 1 | The Toolkit | 1 | 16 tools in 4 categories (marker-driven) |
| 2 | Key Workflows | 4 | Create, Analyze, Diagnose, Download |
| 3 | Going Further | 2 | Cross-MCP bridge + quality loop vision |
| 4 | Get Started | 2 | Setup steps + closing |

## Custom Components

| Component | Description |
|-----------|-------------|
| `LiveTerminalSimulation` | Terminal with phase-based progressive disclosure (parameterized title) |
| `MetricsWall` | CSS keyframe scrolling scorecard rows |
| `ScorecardTable` | Phase-driven animated table (skeleton → data → tradeoff highlight) |
| `UtteranceDrilldown` | Detail card with query text, score comparison, delta badge, DevUI link |
| `CrossMcpBridge` | Three-column diagram: SEVAL MCP ← AI Agent → DevUI MCP |
| `DismissedMetrics` | MetricsWall + animated strikethrough on marker |

## Key Markers

- `{#conn}`, `{#lifecycle}`, `{#results}`, `{#templates}` — Tool category reveals in Ch1_S1
- `{#dismiss}` — Metrics wall strikethrough in Ch4_S2

## TTS Notes

- Subtitle corrections in `public/audio/mcp-seval/subtitle-corrections.json`
- TTS-friendly pronunciations: "SbS-Leo", "Ground-Leo", "Dev-UI", "SEVAL"

## Development

```bash
cd presentation-app
npm run dev                                     # Dev server
npm run tts:generate -- --demo mcp-seval        # Generate audio
npm run tts:duration -- --demo mcp-seval        # Update durationInfo
npm run tts:align -- --demo mcp-seval           # Resolve markers
npm run test:overflow -- --demo mcp-seval       # Check viewport overflows
npm run test:screenshot -- --demo mcp-seval     # Screenshot all slides
```
