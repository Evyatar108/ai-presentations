# Highlights Deep-Dive Demo

**Demo ID**: `highlights-deep-dive`
**Slides**: 19 across 10 chapters
**Mode**: Manual (default), Narrated (when TTS audio is generated)

## Content Structure

| Chapter | Slides | Topic |
|---------|--------|-------|
| 0 | 1 | Title |
| 1 | 2 | Problem Context |
| 2 | 2 | V1 Pipeline Architecture |
| 3 | 2 | Five Cost Drivers |
| 4 | 2 | The O(n^2) Problem |
| 5 | 2 | Compact Transcript Table |
| 6 | 2 | Pseudocode Algorithm |
| 7 | 2 | Copy-then-Parse + Self-Checks |
| 8 | 2 | Results |
| 9 | 2 | Lessons + Closing |

## Technical Implementation

### Slide Organization
- `slides/SlidesRegistry.ts` — Ordered array of all 19 slide components
- `slides/chapters/Chapter{0-9}.tsx` — Slide definitions grouped by chapter

### Custom Components
Located in `slides/components/`:

- **CodeBlock.tsx** — Syntax-colored code display with regex-based tokenization. Supports Python, JSON, and Markdown. Features line numbers, optional line highlighting (amber background), and monospace font.
- **BeforeAfterSplit.tsx** — Two-column V1 vs V2 comparison. Left panel uses amber/warning styling, right panel uses teal/primary styling. Includes directional fade animations.
- **PipelineDiagram.tsx** — Animated vertical pipeline showing 4 sequential LLM calls. Active step gets a glow border, past steps dim, arrows labeled "markdown table".
- **CandidateGrid.tsx** — Animated upper-triangle grid visualizing O(n^2) candidate explosion. Cells light up with a fast stagger, gradient from warning to error colors. Running counter shows progress.

### Audio Files
TTS audio expected at `public/audio/highlights-deep-dive/c{chapter}/s{slide}_segment_{nn}_{id}.wav`

## Development

```bash
cd presentation-app
npm run dev          # Start dev server - demo auto-discovered on welcome screen
npm run type-check   # TypeScript type checking
npm run lint         # ESLint
```

### TTS Generation

```bash
npm run tts:generate -- --demo highlights-deep-dive  # Uses instruct from narration.json
```

TTS style/tone instructions (`instruct`) are defined in the narration JSON at three levels — demo, slide, and segment — with most-specific winning. See the [Narration Style](../../../../docs/demos/highlights-deep-dive/highlights-deep-dive.md#narration-style-instruct) section in the demo docs for the full instruct hierarchy.

## File References

- **Demo config**: [`index.ts`](./index.ts)
- **Metadata**: [`metadata.ts`](./metadata.ts)
- **Slide registry**: [`slides/SlidesRegistry.ts`](./slides/SlidesRegistry.ts)
- **Chapters**: [`slides/chapters/`](./slides/chapters/)
- **Components**: [`slides/components/`](./slides/components/)
- **Documentation**: [`docs/demos/highlights-deep-dive/`](../../../../docs/demos/highlights-deep-dive/highlights-deep-dive.md)
- **Context files**: [`docs/demos/highlights-deep-dive/context/`](../../../../docs/demos/highlights-deep-dive/context/)
