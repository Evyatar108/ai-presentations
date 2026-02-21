# Highlights Deep-Dive Demo

## Overview

Technical deep-dive presentation about collapsing a 4-call GPT-4 pipeline into a single unified prompt for Meeting Highlights generation. The redesign reduced COGS by ~70% through three key innovations: compact transcript table format, pseudocode algorithm instructions, and copy-then-parse grounding pattern.

This demo targets **engineering peers** familiar with LLMs and prompt engineering, featuring code-heavy slides, before/after comparisons, and animated algorithm visualizations.

## Demo Structure

**Total Slides**: 25 slides across 11 chapters
**Estimated Duration**: ~15-18 minutes (narrated)
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

#### Chapter 4: The O(n^2) Problem (4 slides)
- **Ch4_S1_NestedLoop** — The nested loop code from highlights_utils.py with highlighted for-loops
- **Ch4_S2_CandidateRows** — Concrete example showing overlapping candidate ranges with duplication callout
- **Ch4_S3_Visualized** — Animated upper-triangle grid, scale-up math, 128K context bar
- **Ch4_S4_OutputSafety** — Why V1 precomputed candidates: output safety via closed index list, trade-off balance, V2 preview

#### Chapter 5: Compact Transcript Table (3 slides)
- **Ch5_S1_FormatComparison** — Side-by-side V1 JSON vs V2 compact table with comparison table
- **Ch5_S2_MaxEndId** — Annotated row showing max_end_utterance_id, V1 vs V2 complexity comparison
- **Ch5_S3_TurnUtteranceConcept** — Turn/utterance grouping model: V1 flat list vs V2 turn-grouped, valid/invalid extractive range cards

#### Chapter 6: Prompt Overview + Pseudocode Algorithm (4 slides)
- **Ch6_S1_PromptOverview** — Full V2 prompt overview with six section cards
- **Ch6_S2_Pseudocode** — Full generate_highlights() pseudocode with 6 output field checkmarks
- **Ch6_S3_ProseVsPseudocode** — Side-by-side V1 prose vs V2 pseudocode with 4 benefit cards
- **Ch6_S4_OutputSchema** — V2's single JSON response: 6 fields replacing 4 calls, extractive_ranges schema with copy-then-parse field names

#### Chapter 7: Copy-then-Parse + Self-Checks (2 slides)
- **Ch7_S1_CopyThenParse** — Two-step code: copy raw strings, then parse structured values
- **Ch7_S2_SelfChecks** — Grid of 10 boolean self-check cards with cascade animation

#### Chapter 8: Evaluation & Iteration (2 slides)
- **Ch8_S1_ValidationChallenges** — Output range validation + max utterance threshold checks, copy-then-parse callout
- **Ch8_S2_EvalTool** — Local evaluation tool pipeline diagram, error statistics as primary metric

#### Chapter 9: Results (2 slides)
- **Ch9_S1_Metrics** — Three large metric cards: 75% call reduction, 60% token reduction, ~70% GPU reduction
- **Ch9_S2_QualityAndImpact** — Quality tiles, roadmap arrow, testimonial quote

#### Chapter 10: Lessons + Closing (2 slides)
- **Ch10_S1_Lessons** — Six takeaway cards with progressive highlight
- **Ch10_S2_Closing** — Thank you with gradient text + CTA badge

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

- **Audio**: `public/audio/highlights-deep-dive/c{0-10}/` (TTS generated later)
- **Images**: `public/images/highlights-deep-dive/thumbnail.jpeg`
- Start silence: Uses the default 1s `beforeFirstSlide` blank screen before the first slide
- Start transition: Uses the default 0.8s fade-out (`DEFAULT_START_TRANSITION`)

## Narration Style (Instruct)

This demo uses the three-level `instruct` hierarchy for TTS style control (Qwen3-TTS). The `instruct` field can be set at the demo, slide, or segment level — most-specific wins.

### Demo-Level Default

All slides and segments inherit this unless overridden:

> *"Speak in a clear, confident, professional tone at a moderate pace, suitable for a technical presentation to software engineers."*

### Slide-Level Overrides (6 of 25 slides)

| Chapter.Slide | Title | Instruct |
|---|---|---|
| 0.1 | Title | Speak with calm authority and a hint of intrigue, like opening a keynote. |
| 1.2 | COGS Problem | Speak with urgency and concern, emphasizing the severity of the cost problem. |
| 4.3 | O(n^2) Visualized | Speak with building intensity, like revealing the scale of a problem. |
| 9.1 | Results Metrics | Speak with energy and pride, celebrating the achievement. |
| 10.1 | Six Lessons | Speak in a thoughtful, advisory tone, like sharing hard-won wisdom. |
| 10.2 | Closing | Speak warmly and inspirationally. |

### Segment-Level Overrides (4 segments)

| Slide | Segment ID | Instruct |
|---|---|---|
| Ch1_S2 (COGS Problem) | `emphasis` | Speak with firm conviction, slower pace, emphasizing every word. |
| Ch3_S1 (Cost Drivers) | `driver4` | Speak with dramatic emphasis, pausing before revealing the biggest driver. |
| Ch9_S1 (Results Metrics) | `gpus` | Speak with triumph, this is the headline number. |
| Ch9_S2 (Quality and Impact) | `quote` | Speak as if quoting someone admiringly, slightly slower and more measured. |

### Emotional Arc

The instruct values guide the TTS voice through a deliberate emotional arc:

1. **Calm exposition** (Ch0-Ch2) — Professional default with keynote opening
2. **Building tension** (Ch3-Ch4) — Urgency around cost drivers, intensity at O(n^2) reveal
3. **Resolution** (Ch5-Ch7) — Returns to professional default as solutions are presented
4. **Validation** (Ch8) — Professional default for evaluation methodology
5. **Celebration** (Ch9) — Energy and pride for results, triumph on headline GPU number
6. **Reflection** (Ch10) — Thoughtful wisdom for lessons, warm inspiration for closing

## Related Documentation

- [Context README](context/README.md) — Source file provenance
- [session-prompt-deep-dive.md](context/session-prompt-deep-dive.md) — Authoritative content source
- [Implementation README](../../../presentation-app/src/demos/highlights-deep-dive/README.md) — Technical implementation details
