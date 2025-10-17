# Highlights COGS Reduction

This repository contains work related to meeting highlights and COGS (Cost of Goods Sold) reduction efforts.

## Directory Structure

```
cogs reduction/
├── README.md
├── extractive vs abstractive highlights.md
├── v2 goal and efforts.md
├── what is meeting highlights.md
├── demo/
│   ├── 1_intro.txt
│   ├── 2_generation.txt
│   ├── 3_teams.txt
│   └── 4_feedback.txt
├── v1/
│   └── HighlightsPromptMaper.py
└── v2/
    ├── prompt.md
    ├── prompt_output_schema.md
    └── TRANSCRIPT_TABLE_SCHEMA.md
```

## Files Overview

### Root Level Documentation
- **extractive vs abstractive highlights.md** - Documentation comparing extractive and abstractive highlight approaches
- **v2 goal and efforts.md** - Goals and efforts for version 2
- **what is meeting highlights.md** - Overview of meeting highlights functionality

### Demo Directory
Contains demonstration files:
- `1_intro.txt` - Introduction demo
- `2_generation.txt` - Generation demo
- `3_teams.txt` - Teams integration demo
- `4_feedback.txt` - Feedback demo

### V1 Directory
- `HighlightsPromptMaper.py` - Python script for highlights prompt mapping (version 1)

### V2 Directory
Contains version 2 documentation:
- `prompt.md` - Prompt documentation
- `prompt_output_schema.md` - Output schema specification
- `TRANSCRIPT_TABLE_SCHEMA.md` - Transcript table schema definition
## COGS Reduction Demo Expansion

This project now includes an interactive React + Vite demo illustrating how meeting highlights costs were reduced while improving output quality.

### Key Improvements
- LLM calls: 4 → 1 (single unified prompt preserves full algorithmic flow segment→narrate→extract→rank→compose)
- Estimated GPU capacity: ~600 → ~200 (simplified concurrency, fewer orchestration turnarounds, lower token volume)
- COGS: 50%+ reduction enabling private preview + GA path
- Quality: Internal reviewers strongly prefer unified prompt highlights vs multi-prompt V1 output (higher cohesion, less redundancy)

### V1 Four-Prompt Pipeline
1. Abstractive Topics [`highlights_abstractives()`](v1/HighlightsPromptMaper.py:13)  
2. Extractive Selection [`highlights_extractives()`](v1/HighlightsPromptMaper.py:140)  
3. Quality Ranking [`highlights_extractive_ranking()`](v1/HighlightsPromptMaper.py:230)  
4. Final Narrative Synthesis [`highlights_final()`](v1/HighlightsPromptMaper.py:318)  

Each step invoked the LLM separately, adding latency padding, retry surface, token overhead, and GPU reservation pressure.

### Unified V2 Prompt
All semantic transforms executed in one structured pass (segment → narrations → verbatim extraction → quality ranking → narrative composition). Removes intermediate JSON stitching and orchestration overhead while improving narrative flow.

### Demo Run Instructions
```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

Open http://localhost:5173 to view the demo. Reduced-motion accessibility toggle is included (header bar).

### Demo Source Structure
- [`index.html`](react_cogs_demo/index.html)
- [`src/main.tsx`](react_cogs_demo/src/main.tsx)
- [`src/App.tsx`](react_cogs_demo/src/App.tsx)
- Core components: [`CoreComponents.tsx`](react_cogs_demo/src/components/CoreComponents.tsx)
- Impact components: [`ImpactComponents.tsx`](react_cogs_demo/src/components/ImpactComponents.tsx)
- Accessibility: [`ReducedMotion.tsx`](react_cogs_demo/src/accessibility/ReducedMotion.tsx)
- Slide registry: [`SlideRegistry.ts`](react_cogs_demo/src/slides/SlideRegistry.ts)

### Script Reference
Expanded demo segment script: [`2b_cogs_reduction.txt`](demo/2b_cogs_reduction.txt) (Slides 19–32) documents the transition from four prompts to a single unified prompt and associated GPU / cost / quality impacts.

### Summary
The consolidation from 4 calls to 1 reduced projected GPU needs (~600 → ~200) and produced higher-quality highlight videos, directly enabling scaled rollout within approved capacity constraints.