# COGs Reduction Demo – Visual & Asset Plan

This plan maps the scripted slides in [`demo/cogs_reduction_plan.md`](demo/cogs_reduction_plan.md) to proposed visuals, animations, and optional AI‑generated image assets. It targets a polished PowerPoint (or video) segment inserted after [`demo/2_generation.txt`](demo/2_generation.txt) and before [`demo/3_teams.txt`](demo/3_teams.txt).

## Design Principles
- Consistent palette: Microsoft 365 blues, neutral grays, accent teal for “optimization” moments.
- Visual progression: Complexity (4-box chain) collapsing into elegance (single unified module).
- Motion emphasis: Reduction (fade out / merge), efficiency (speed lines / throughput), preference (thumbs-up metric card).
- Avoid third‑party logos or copyrighted UI; keep abstract.

## Slide-by-Slide Visual Storyboard

| Slide | Script Focus | Visual Concept | Animation Note |
| ----- | ------------ | -------------- | -------------- |
| 19 | Challenge framing | BEFORE cost driver metric tiles (4 LLM Calls • ~600 GPUs • High Input Tokens) above arrow to TARGET tile (Unified Single Prompt: 1 Call • ~200 GPUs • Fewer Tokens) | Sequential tile fades → arrow wipe → target zoom/glow |
| 20 | 4 sequential LLM calls | Horizontal chain: 4 labeled blocks (Prompt 1–4) with arrows | Staggered appear left→right |
| 21 | Prompt 1 (topics) | Block 1 expanded; inside: stacked “Topic” cards with range bars | Zoom focus on block 1 |
| 22 | Prompt 2 (extractives) | Block 2 focus; grid of “Verbatim Clip” sticky notes | Slide up notes |
| 23 | Prompt 3 (ranking) | Block 3 focus; vertical leaderboard with ranks 1..N | Rank cards cascade |
| 24 | Prompt 4 (narrative synthesis) | Block 4 focus; timeline ribbon combining abstractive + extractive icons | Ribbon draws across |
| 25 | Collapse to one prompt | 4 blocks converge into a single luminous “Unified Prompt” node | Merge morph animation |
| 26 | Unified flow preserved | Single node feeding a concise flow diagram (segment→narrate→extract→rank→compose) | Flow pulses along path |
| 27 | Input token & format optimization | Before/after comparison: Left shows tall input token bar (verbose format); Right shows significantly shorter input token bar (streamlined format) with efficiency glow | Left bar shrinks and transitions to right shorter bar |
| 28 | 4→1 call reduction | Large $4 \to 1$ with circular dial going from 100% to 25% | Dial needle sweeps |
| 29 | GPU drop $600 \to 200$ | Three GPU rack silhouettes reducing to one highlighted rack | Racks fade out |
| 30 | COGs savings | Cost curve descending; marker at 50%+ savings | Curve animates downward |
| 31 | Team preference (quality) | Side-by-side comparison frames V1 vs V2; V2 has “Preferred” badge | Badge pops in |
| 32 | Unblocking & forward path | Roadmap arrow: “Private Preview” → “GA” with green capacity check | Arrow extends forward |

## Optional Supporting Micro-Visuals
- Topic card: Rounded rectangle with “Topic Title” + range bar.
- Extractive clip: Quote bubble + waveform icon.
- Ranking badge: Shield with rank number.
- Unified prompt: Central glowing hexagon or rounded square.
- Token bar: Dual bar (Input / Output) with percentage labels.

## Animation Strategy
- Keep transitions under 0.7s.
- Use “Morph” in PowerPoint for merging sequence (Slide 25).
- Consistent easing: FastOutSlowIn for emphasis reductions (Slides 25, 28, 29).
- Avoid distracting motion during narration; one focal change per slide.

## AI Image Generation Prompts
Use a consistent stylistic directive: “isometric minimal tech illustration, flat gradients, azure/teal palette, white background, vector style, no text.”

1. Prompt (Slide 20 – Four Prompts Chain):
   “Isometric minimal tech illustration showing four connected rectangular modules labeled Prompt 1, Prompt 2, Prompt 3, Prompt 4 in a horizontal chain with subtle arrows, azure and teal gradient, clean white background, vector style, no extra text.”

2. Prompt (Slide 21 – Topic Segmentation):
   “Isometric illustration of a single module expanding into stacked cards titled Topic with colored range bars, azure/teal palette, minimal, vector, white background.”

3. Prompt (Slide 22 – Extractive Moments):
   “Isometric tech illustration of a module feeding a grid of verbatim clip cards with quote icons and waveform symbols, teal and blue gradients, clean minimal design.”

4. Prompt (Slide 23 – Ranking Quality):
   “Isometric leaderboard panel with ranked cards descending 1,2,3, each card subtle glow, azure and teal palette, minimal vector style.”

5. Prompt (Slide 24 – Narrative Synthesis):
   “Isometric timeline ribbon combining summary narration icons (document) and extractive audio icons (waveform) into a unified flowing strip, azure/teal gradient.”

6. Prompt (Slide 25 – Collapse to Unified Prompt):
   “Isometric illustration of four separate modules converging inward into one glowing central module, energy lines showing consolidation, azure and teal palette.”

7. Prompt (Slide 27 – Input Token Optimization):
   "Isometric before-and-after comparison showing two vertical bars labeled 'Input Tokens': left side tall bar representing verbose format, right side significantly shorter bar with efficiency glow representing streamlined format, azure/teal gradient, minimal style, white background, no extra text."

8. Prompt (Slide 28 – Call Reduction):
   “Isometric circular dial going from 4 segments to 1 highlighted segment, representing reduction, azure and teal gradient, minimal.”

9. Prompt (Slide 29 – GPU Reduction):
   “Three server rack silhouettes reducing to a single highlighted rack, efficiency glow, isometric minimal azure palette.”

10. Prompt (Slide 30 – COGs Savings):
    “Downward sloping cost curve with a bright marker at midpoint labeled 50%+, isometric minimal style, azure/teal gradient.”

11. Prompt (Slide 31 – Quality Preference):
    “Side-by-side comparison frames labeled V1 and V2, V2 frame has a preference badge or star, clean isometric minimal vector.”

12. Prompt (Slide 32 – Roadmap Forward):
    “Forward arrow roadmap with two milestones: Private Preview then GA, capacity check mark near GA, minimal isometric azure palette.”

## Slide Asset Assembly Checklist
- Export AI images (PNG/SVG) uniform aspect ratio.
- Maintain consistent margins.
- Apply alt text: “Illustration of unified LLM prompt reducing calls” etc.
- Ensure contrast for accessibility (check WCAG AA for key tones).

## Optional Enhancements
- Light parallax in video version (if converted).
- Animated counter overlay counting down 4→1 (Slide 28).
- Glossary flyout (hover / click): prompt, extractive, abstractive.

## Risks & Mitigations
| Risk | Mitigation |
| ---- | ---------- |
| Over-animated sequence | Limit to one key motion per slide |
| Inconsistent style from AI | Use same base prompt template; manual color normalization |
| Text baked into images | Explicit “no text” in prompts; add labels in PPT only |
| Visual clutter | Apply 60–30–10 color distribution rule |

## Next Actions
1. Generate images using listed prompts.
2. Build PowerPoint master slide with palette + typography.
3. Apply storyboard timing (align with narration script).
4. Review accessibility (alt text + contrast).
5. Final polish pass before integration.

## Approval Targets
- Visual coherence
- Clear depiction of cost & complexity reduction
- Reinforcement of single unified prompt narrative
## Slide Build Implementation Guide

### Slide 19 – Challenge Framing
Title Options:
- Meeting Highlights Cost Optimization
- Lower COGs, Higher Quality

Visual Concept:
Explicit BEFORE → TARGET cost levers (LLM calls, projected GPUs, input tokens) transitioning visually toward unified efficiency.

Metric Tiles (Top Row):
- Tile A: 4 LLM Calls
- Tile B: ~600 GPUs (Projected)
- Tile C: High Input Tokens

Target Tile (Bottom):
Unified Single Prompt
1 Call • ~200 GPUs • Fewer Tokens

Steps:
1. Background: Solid dark navy (#102437) for strong metric contrast.
2. Create three rounded rectangles (300x110px, fill #1E3C5C, white Segoe UI Semibold 22pt). Add minimalist icons above each label: chain link (calls), server rack (GPUs), stacked lines (tokens).
3. Center a downward white outline arrow (3pt stroke) pointing to a larger teal target tile (340x120px, fill #00B7C3).
4. Target tile text: Line 1 Segoe UI Semibold 22pt “Unified Single Prompt”; Line 2 Segoe UI Regular 18pt “1 Call • ~200 GPUs • Fewer Tokens”.
5. Caption (below target): Segoe UI Regular 16pt “Objective: Reduce COGs without losing highlight quality.”
6. Animation sequence: Tiles A–C Fade In left→right (0.3s each, 0.1s stagger); arrow Wipe Down (0.4s); target tile Zoom 105% + Fade (0.5s); caption Fade In with target (0.4s).
7. Emphasis: Glow emphasis on target tile (teal outer glow 15pt, auto‑reverse 0.8s) after entrance.
8. Optional AI alternative: Isometric convergence illustration (see prompt adaptation) replacing manual tiles; overlay all text labels manually.
9. Accessibility: Verify contrast (white on #1E3C5C); alt text: “Original cost drivers (calls, GPUs, tokens) and optimized unified target metrics.”
10. Timing: Keep total entrance ≤5s to align with narration pacing.

### Slide 20 – Original 4-Prompt Pipeline
Title: Original Four-Prompt Pipeline
Steps:
1. Create four equal rounded rectangles labeled Prompt 1–Prompt 4.
2. Color: Neutral blue (#4F6EA7) fill 80%, white text; subtle drop shadow (offset 2pt, blur 6pt, 20% opacity).
3. Connectors: Use arrows with 1.25pt stroke.
4. Add caption bar below: “Sequential calls drove high COGs.”
5. Animation: Staggered “Fade” left→right (order: P1–P4, 0.3s each, 0.1s delay increments).
6. Optional AI Image: Replace rectangles with generated asset from prompt #1 (import, crop, align center).
7. Emphasis: After all appear, pulse outline of entire chain once (Emphasis → Grow/Shrink 105%, auto-reverse).

### Slide 21 – Prompt 1 (Topics)
Title: Prompt 1 – Topic Segmentation
Steps:
1. Reuse Prompt 1 rectangle enlarged center; reduce others to 40% opacity or convert to ghost outlines.
2. Inside enlarged shape: Stack 3–5 mini “Topic” cards (small rectangles with colored range bar strip).
3. Range Bars: Thin rectangle bars (#00A4B4, #0078D4 variations).
4. Animation: Zoom entrance on enlarged Prompt 1; Topic cards “Fly In” from bottom (0.2s each).
5. Optional AI Image: Use prompt #2 positioned center; overlay labels manually (avoid baked text).
6. Caption: “Identifies 1–7 discussion segments per meeting.”

### Slide 22 – Prompt 2 (Extractives)
Title: Prompt 2 – Extractive Selection
Steps:
1. Focus shift: Replace center with Prompt 2; fade others.
2. Grid of selection cards (quote icon + waveform icon). Icons: Insert built-in Icons (quotation mark + wave).
3. Color accent teal for selected blocks; grayed variants for non-selected.
4. Animation: Cards “Float In” upward staggered (Row-wise).
5. Callout text: “Up to 10 compelling verbatim clips.”
6. AI Image: Use prompt #3 as central art; ensure no embedded text.

### Slide 23 – Prompt 3 (Ranking)
Title: Prompt 3 – Quality Ranking
Steps:
1. Vertical leaderboard: Cards labeled Rank 1, Rank 2, Rank 3 (manual text).
2. Visual: Gold, Silver, Bronze border accents (subtle, 1pt).
3. Add criteria bar list: Clarity, Self-containment, Interest.
4. Animation: Cascade “Wipe” (from top) for cards; criteria fade simultaneously.
5. AI Image: Prompt #4 integration optional on right side.
6. Spotlight: Emphasis animation on Rank 1 card (Grow/Shrink 108%).

### Slide 24 – Prompt 4 (Narrative Synthesis)
Title: Prompt 4 – Narrative Assembly
Steps:
1. Horizontal ribbon shape (gradient left→right #0078D4 → #00B7C3).
2. Insert alternating icons: Document (for narration) + Waveform (for extractive).
3. Animation: “Wipe” left→right on ribbon; icons appear with 0.1s stagger.
4. Caption: “Combines abstractive + extractive seamlessly.”
5. AI Image: Prompt #5; crop to fit ribbon area.

### Slide 25 – Unified Prompt Emerges
Title: Unified Single Prompt
Steps:
1. Duplicate four prompt shapes → arrange around center.
2. Central final shape: Glowing hexagon (#00B7C3 outer glow 25pt).
3. Morph: In PowerPoint duplicate slide; on next slide delete dispersed shapes and enlarge central node → Apply Morph transition.
4. Add tagline: “4 calls → 1 call.”
5. Optional overlay: Numeric reduction badge “–75% LLM calls”.

### Slide 26 – Preserved Logic Flow
Title: Same Logical Flow, Single Pass
Steps:
1. Horizontal flow diagram with five small icons (Segment → Narrate → Extract → Rank → Compose).
2. Each icon inside circle; connecting line with arrowheads.
3. Pulse effect: Sequential emphasis (Transparency 40% baseline → full opacity per step).
4. Caption below: “All stages executed in one inference.”
5. Optional subtle animated progress bar underneath.

### Slide 27 – Input Token Reduction
Title: Input Token Reduction
Steps:
1. Before/After panel: Left tall bar (label “Before”), right shorter bar (label “After”).
2. Add % reduction badge (e.g. “↓ Tokens”).
3. Animation: Left bar Shrink (Grow/Shrink to 0%) while right bar Fade In.
4. Efficiency glow: Outer soft teal shadow (#00B7C3 35%).
5. Optional AI image per prompt #7 centered behind bars.

### Slide 28 – 4→1 Call Reduction
Title: LLM Call Reduction
Steps:
1. Large dial circle segmented into 4 quadrants; highlight final quadrant only.
2. Needle animation pointing from 4 to 1 (Spin 90°).
3. Text: “4 → 1 Call”.
4. AI Image: Prompt #8 behind dial faded to 30% opacity.

### Slide 29 – GPU Capacity Impact
Title: GPU Capacity Optimization
Steps:
1. Three server rack silhouettes (Before) transitioning to one (After).
2. Fade out racks left→right; After rack gains glow + check icon.
3. Annotation: “~600 → ~200 GPUs”.
4. AI Image: Prompt #9 optional; ensure alignment.

### Slide 30 – COGs Savings
Title: COGs Savings
Steps:
1. Downward cost curve chart: Simple line declining; start dot (High), end dot (Lower).
2. Marker with “50%+” tag (rounded rectangle).
3. Animation: Line “Wipe” left→right; marker Pop (Grow).
4. AI Image: Prompt #10 overlay semi-transparent beneath chart.

### Slide 31 – Quality Preference
Title: Quality Improvement
Steps:
1. Split frame: Left “V1” muted border; Right “V2” highlighted border (teal).
2. Preference badge (star or ribbon) on V2 corner.
3. Animation: V1 appear normal; V2 appear with Zoom + Badge Fade.
4. AI Image: Prompt #11; crop into right panel region.

### Slide 32 – Path to GA
Title: Path to General Availability
Steps:
1. Horizontal roadmap arrow: Milestones Private Preview → GA.
2. Capacity check badge (circle with check) near GA.
3. Animation: Arrow “Grow” left→right; badges fade sequentially.
4. AI Image: Prompt #12 scaled behind arrow at 20% opacity.

### Asset Production Workflow (Per Slide)
1. Content Lock: Finalize title + subtitle in [`demo/2b_cogs_reduction.txt`](demo/2b_cogs_reduction.txt).
2. Generate AI Art: Run prompts for slides 20–32 (skip 19, which is manual blur).
3. Normalize Style: Adjust all images to same aspect ratio (e.g., 16:9 or square centered).
4. Export Assets: Prefer SVG (if vector) or high-res PNG (width ≥ 1600px).
5. Import & Layer: Insert into PowerPoint, set consistent margins (safe zone 5% inset).
6. Apply Animations: Follow step definitions; use Selection Pane to name layers.
7. Accessibility: Add alt text (“Illustration of unified prompt reducing four calls to one” etc.).
8. Playback Test: Rehearse timings targeting ~6–7 seconds per slide.

### General Tips
- Avoid overuse of glow and shadow together.
- Keep font pairing: Title 32pt Segoe UI Semibold; Body 18pt Segoe UI Regular.
- Maintain consistent icon size (height ~48px).
- Ensure performance: Limit total animated objects per slide (<12).
