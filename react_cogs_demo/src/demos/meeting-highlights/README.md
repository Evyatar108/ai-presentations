# Meeting Highlights COGS Reduction Demo

**Demo ID**: `meeting-highlights`  
**Duration**: ~4 minutes (narrated mode)  
**Slides**: 15 slides across 9 chapters

## Overview

This demo presents the Meeting Highlights product and its cost optimization journey. It showcases how the team achieved a 70%+ reduction in computational costs while maintaining or improving quality.

## Target Audience

All-hands meeting where:
- Many attendees are **not familiar** with Meeting Highlights feature
- Focus is on **product value** and **business impact**
- Technical details are high-level, not implementation-specific
- Emphasis on user satisfaction and cost optimization enabling global rollout

## Content Structure

### Chapter 0: Introduction (1 slide)
- Blank intro slide to start presentation

### Chapter 1: What is Meeting Highlights (3 slides)
- **S1**: Product overview - AI-generated meeting recaps
- **S2**: How to access via BizChat (with demo video)
- **S3**: How to access via SharePoint (with demo video)

### Chapter 2: Team Collaboration (1 slide, 9 segments)
- Multi-segment slide showing 6+ teams working together
- Interactive ReactFlow architecture diagram
- Backend flow visualization
- Teams: ODSP, MSAI-Hive, BizChat, SharePoint, Teams (planned), Loop, Clipchamp

### Chapter 4: Highlight Types (1 slide)
- Abstractive highlights overview
- Key moments and timestamps
- Narrative highlight generation

### Chapter 5: COGS Challenge (1 slide)
- Initial metrics: 4 LLM calls, ~600 GPUs, high token usage
- Visualization of computational complexity

### Chapter 6: Optimization Solution (2 slides)
- **S1**: Unified convergence (4→1 call reduction)
- **S4**: Token optimization (60% reduction)

### Chapter 7: Business Impact (3 slides)
- **S2**: GPU reduction (600→200, 67% reduction)
- **S4**: Quality comparison (internal reviewers prefer unified output)
- **S5**: Path to general availability

### Chapter 8: User Reception (1 slide)
- 80% find it extremely/very useful
- 96% likely to use again
- Fits workflow metrics

### Chapter 9: Testimonials & Thank You (2 slides)
- **S1**: 4 user testimonials with animated cards
- **S2**: Thank you, feedback email, and CTA

## Key Metrics

### Product Metrics
- **80%** of users rate Meeting Highlights as extremely/very useful
- **96%** of users likely to use again
- **3-5 minutes** typical highlight video length

### Optimization Metrics
- **75%** reduction in LLM calls (4 → 1)
- **60%** reduction in input tokens
- **67%** reduction in GPU capacity (~600 → ~200 GPUs)
- **70%+** estimated COGS reduction overall

## Technical Implementation

### Slide Organization
- Slides organized in chapter-based files: [`Chapter0.tsx`](slides/chapters/Chapter0.tsx) through [`Chapter9.tsx`](slides/chapters/Chapter9.tsx)
- Central registry: [`SlidesRegistry.ts`](slides/SlidesRegistry.ts)
- Shared components from `src/slides/`, `src/components/`, `src/contexts/`

### Audio Files
- Location: `public/audio/meeting-highlights/c{0-9}/`
- Format: WAV (24kHz mono)
- Generated via TTS system with smart caching
- Fallback to silence for missing files

### Assets
- **Images**: `public/images/meeting-highlights/` (logos, thumbnail)
- **Videos**: `public/videos/meeting-highlights/` (demo videos)
- **Audio**: `public/audio/meeting-highlights/c{0-9}/` (narration)

## Presentation Modes

1. **Narrated Mode** (default): Auto-advances with audio narration (~4 min)
2. **Manual Silent**: Navigate with arrow keys, no audio
3. **Manual + Audio**: Navigate manually, plays audio on each slide

## Development

### Running the Demo
```bash
cd react_cogs_demo
npm run dev
```

### Regenerating Audio
```bash
# Generate all audio (uses smart cache)
npm run tts:generate

# Force regenerate all
npm run tts:generate -- --force
```

### Adding New Slides
1. Edit appropriate chapter file in `slides/chapters/`
2. Export slide component with metadata
3. Import in [`SlidesRegistry.ts`](slides/SlidesRegistry.ts)
4. Add to `allSlides` array
5. Generate audio for new narration

## Demo Features

- **Multi-segment slides**: Progressive content reveal (e.g., Chapter 2 has 9 segments)
- **Video integration**: Embedded demo videos with freeze-on-end
- **Interactive diagrams**: ReactFlow architecture visualization
- **Animated metrics**: Framer Motion animations for visual impact
- **Smart audio**: Automatic cache detection and regeneration prompts
- **Accessibility**: Reduced motion support

## Call to Action

The presentation closes with:
- Thank you message with animated gradient
- Feedback email: meetinghlfeedback@microsoft.com
- CTA: "Try Meeting Highlights - Available now in BizChat & SharePoint"

## Files

- [`index.ts`](index.ts) - Demo configuration
- [`metadata.ts`](metadata.ts) - Demo metadata
- [`slides/SlidesRegistry.ts`](slides/SlidesRegistry.ts) - Slide registry
- [`slides/chapters/`](slides/chapters/) - Chapter-based slide files (9 files)