# Highlights Deep-Dive Demo

## Overview

Technical deep-dive presentation about collapsing a 4-call GPT-4 pipeline into a single unified prompt for Meeting Highlights generation. The redesign reduced COGS by ~70% through three key innovations: compact transcript table format, pseudocode algorithm instructions, and copy-then-parse grounding pattern.

This demo targets **engineering peers** familiar with LLMs and prompt engineering, featuring code-heavy slides, before/after comparisons, and animated algorithm visualizations.

## Demo Structure

**Total Slides**: 19 slides across 10 chapters
**Estimated Duration**: ~12-15 minutes (narrated)
**Demo ID**: `highlights-deep-dive`

### Chapter Breakdown

#### Chapter 0: Introduction (1 slide)
- **Ch0_S1_Title** — Opening title: "From 4 Calls to 1: Redesigning the Meeting Highlights Prompt"

#### Chapter 1: Problem Context (2 slides)
- **Ch1_S1_ProductContext** — What Meeting Highlights is: Transcript -> LLM -> Video Assembly pipeline, abstractive narration + extractive clips
- **Ch1_S2_COGSProblem** — The cost problem: 4 LLM calls, ~600 GPUs, capacity blocker for GA

#### Chapter 2: V1 Pipeline Architecture (2 slides)
- **Ch2_S1_FourCalls** — Animated pipeline diagram showing the 4 sequential calls with descriptions
- **Ch2_S2_CallDetail** — Python code from HighlightsPromptMaper.py with annotated call structure

#### Chapter 3: Five Cost Drivers (2 slides)
- **Ch3_S1_CostDrivers** — Progressive reveal of 5 structural cost drivers, with O(n^2) highlighted in red
- **Ch3_S2_VerboseJSON** — Before/after: V1 verbose JSON vs token waste analysis

#### Chapter 4: The O(n^2) Problem (2 slides)
- **Ch4_S1_NestedLoop** — The nested loop code from highlights_utils.py with highlighted for-loops
- **Ch4_S2_Visualized** — Animated upper-triangle grid, scale-up math, 128K context bar

#### Chapter 5: Compact Transcript Table (2 slides)
- **Ch5_S1_FormatComparison** — Side-by-side V1 JSON vs V2 compact table with comparison table
- **Ch5_S2_MaxEndId** — Annotated row showing max_end_utterance_id, V1 vs V2 complexity comparison

#### Chapter 6: Pseudocode Algorithm (2 slides)
- **Ch6_S1_Pseudocode** — Full generate_highlights() pseudocode with 6 output field checkmarks
- **Ch6_S2_ProseVsPseudocode** — Side-by-side V1 prose vs V2 pseudocode with 4 benefit cards

#### Chapter 7: Copy-then-Parse + Self-Checks (2 slides)
- **Ch7_S1_CopyThenParse** — Two-step code: copy raw strings, then parse structured values
- **Ch7_S2_SelfChecks** — Grid of 10 boolean self-check cards with cascade animation

#### Chapter 8: Results (2 slides)
- **Ch8_S1_Metrics** — Three large metric cards: 75% call reduction, 60% token reduction, ~70% GPU reduction
- **Ch8_S2_QualityAndImpact** — Quality tiles, roadmap arrow, testimonial quote

#### Chapter 9: Lessons + Closing (2 slides)
- **Ch9_S1_Lessons** — Five takeaway cards with progressive highlight
- **Ch9_S2_Closing** — Thank you with gradient text + CTA badge

## Target Audience

Engineering peers familiar with:
- LLM pipelines and prompt engineering
- Token economics and GPU cost optimization
- Python code patterns
- Prompt design techniques

## Key Metrics

| Metric | Value |
|--------|-------|
| LLM Call Reduction | 75% (4 -> 1) |
| Token Reduction | ~60% |
| GPU Reduction | ~70% (~600 -> ~180 A100s) |
| Quality (Grounding) | No regression |
| Quality (Coverage) | ~75-80% |
| Reviewer Preference | Prefer V2 |

## Design System

### Color Palette
- **V1/Before**: Amber/warning tones (`#fbbf24`, `rgba(251, 191, 36, ...)`)
- **V2/After**: Teal/primary tones (`#00B7C3`, `rgba(0, 183, 195, ...)`)
- **Error/Critical**: Red (`#ef4444`)
- **Success**: Green (`#10b981`)

### Custom Components
- **CodeBlock** — Syntax-colored code with line numbers and optional line highlighting
- **BeforeAfterSplit** — Two-column V1 vs V2 comparison with directional animation
- **PipelineDiagram** — Animated vertical pipeline showing 4 calls with progressive reveal
- **CandidateGrid** — Animated upper-triangle grid visualizing O(n^2) growth

### Animation Principles
- Progressive segment reveals driven by `useSegmentedAnimation()`
- Reduced motion support via `useReducedMotion()`
- Code blocks fade in from below
- Comparison panels slide in from left/right
- Pipeline steps reveal one-by-one with glow on active step

## Assets

- **Audio**: `public/audio/highlights-deep-dive/c{0-9}/` (TTS generated later)
- **Images**: `public/images/highlights-deep-dive/thumbnail.jpeg`

## Related Documentation

- [Context README](context/README.md) — Source file provenance
- [session-prompt-deep-dive.md](context/session-prompt-deep-dive.md) — Authoritative content source
- [Implementation README](../../../presentation-app/src/demos/highlights-deep-dive/README.md) — Technical implementation details
