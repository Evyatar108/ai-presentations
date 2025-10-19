n# React Slides Reference - COGS Reduction Presentation

This document provides a concise reference for the animated React slides implemented for Chapters 5-7 of the Meeting Highlights COGS reduction presentation.

## Chapter 5: COGS Challenge

### Ch5_U1_ChallengeFraming
**Narration**: Cost efficiency challenge and initial metrics  
**Visualization**: 
- Three metric tiles showing initial state (4 LLM Calls, ~600 GPUs, High Input Tokens)
- Downward arrow animation
- Target tile with unified prompt metrics (1 Call, ~200 GPUs, Fewer Tokens)
- Gradient glow on target tile

**Animation Flow**: Staggered tile appearance → arrow wipe → target zoom with glow

### Ch5_U2_FourPrompts
**Narration**: Original 4-prompt pipeline explanation  
**Visualization**:
- Horizontal chain of 4 numbered prompt blocks
- Labels: Topic Abstraction, Extractive Selection, Quality Ranking, Narrative Synthesis
- Connecting arrows between blocks

**Animation Flow**: Staggered left-to-right appearance of prompt blocks and arrows

## Chapter 6: Optimization Solution

### Ch6_U1_UnifiedConvergence
**Narration**: Convergence to unified single prompt  
**Visualization**:
- Central glowing circular node labeled "Unified Prompt"
- Pulsing glow effect
- Converging energy lines radiating from center (4 angles)
- Large "4 → 1 Call" text with strikethrough on "4"
- Success rate metric tile (92% → 99%)

**Animation Flow**: Central node zoom + pulse → converging lines animation → metrics fade in

### Ch6_U2_UnifiedFlow
**Narration**: Same logical flow preserved in single pass  
**Visualization**:
- Five sequential steps shown as gradient pills: Segment → Narrate → Extract → Rank → Compose
- All within "single LLM invocation" context

**Animation Flow**: Sequential pill appearance with stagger delay

### Ch6_U4_TokenOptimization
**Narration**: Input token optimization details  
**Visualization**:
- Three metric comparison tiles:
  - Abstractive Input: Verbose JSON → Compact Schema
  - Extractive Input: Candidate Range Combinations → Direct Selection (emphasized)
  - Total Tokens: Higher → Lower

**Animation Flow**: Tiles fade in with explanatory text

## Chapter 7: Business Impact

### Ch7_U1_CallReduction (Optimization Impact)
**Narration**: Dual optimization impact (calls + tokens)  
**Visualization** - DUAL DISPLAY:

**Left Side - LLM Call Reduction Dial**:
- Circular dial with 4 segments
- Animated needle sweeping from 4 to 1
- "75%" large metric display
- "4 → 1 calls" subtitle

**Right Side - Input Token Reduction Bar**:
- Before bar (100% - tall, gray)
- Downward arrow
- After bar (40% - shorter, gradient with glow)
- "60%" large metric display
- "token reduction" subtitle

**Animation Flow**: Dial segments appear → needle sweep → bars animate (tall shrinks, short grows) → metrics display

### Ch7_U2_GPUReduction
**Narration**: GPU capacity optimization  
**Visualization**:
- Before: 3 server rack silhouettes
- Transition arrow
- After: 1 highlighted rack with checkmark badge
- "~600 → ~200 GPUs" metric
- "67% capacity reduction" subtitle

**Animation Flow**: Racks fade individually → arrow appears → final rack zooms with checkmark

### Ch7_U3_CostCurve
**Narration**: Overall COGS impact  
**Visualization**:
- Downward sloping cost curve
- Animated curve drawing
- Metric highlights at key points
- "Over 70% estimated COGS reduction" callout

**Animation Flow**: Curve draws from left to right → markers appear → callout fades in

### Ch7_U4_QualityComparison
**Narration**: Quality improvements  
**Visualization**:
- Side-by-side comparison panels
- V1 vs V2 quality metrics
- Preference indicators
- Improvement highlights (cohesion, reduced redundancy, clearer narrative)

**Animation Flow**: Panels appear → comparison metrics animate → preference badge highlights V2

### Ch7_U5_PathToGA
**Narration**: Path to general availability  
**Visualization**:
- Horizontal roadmap with two milestones
- "Private Preview" tile (gradient, labeled "Enabled by COGS reduction")
- Forward arrow
- "General Availability" tile (green gradient, labeled "Within capacity limits")
- Checkmark badge on GA tile

**Animation Flow**: Private Preview appears → arrow extends → GA appears → checkmark pops

## Key Design Elements

### Color Palette
- **Primary**: Microsoft Azure Blue (#0078D4)
- **Accent**: Teal (#00B7C3)
- **Dark Background**: Navy (#0f172a, #1e293b)
- **Success**: Green (#10b981)
- **Neutral**: Grays (#334155, #475569, #94a3b8)

### Animation Principles
- **Reduced Motion Support**: All animations gracefully degrade when user prefers reduced motion
- **Timing**: Most animations 0.3-0.8s duration with easing
- **Stagger**: Sequential elements use 0.1-0.15s delays
- **Emphasis**: Glow effects for key metrics and optimized elements

### Typography
- **Font**: Inter, system-ui, sans-serif
- **Title Sizes**: 24-48px bold
- **Body Text**: 14-18px regular
- **Metrics**: 36-48px bold for impact numbers

## Implementation Notes

All slides are implemented in [`react_cogs_demo/src/slides/AnimatedSlides.tsx`](../react_cogs_demo/src/slides/AnimatedSlides.tsx) using:
- **React** + **TypeScript** for type safety
- **Framer Motion** for animations
- **Accessibility features**: reduced motion support, semantic HTML
- **Responsive design**: flexbox layouts that adapt to viewport

Slides are registered in [`react_cogs_demo/src/slides/SlidesRegistry.ts`](../react_cogs_demo/src/slides/SlidesRegistry.ts) with metadata including chapter, utterance, title, and audio file path.