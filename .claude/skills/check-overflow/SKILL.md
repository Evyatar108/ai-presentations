---
name: check-overflow
description: Run the Playwright viewport overflow test against a demo and fix any slides that overflow. Use when the user reports overflow warnings, wants to verify slides fit the viewport, or after editing slide content.
argument-hint: "[demo-id] [--viewport WxH]"
disable-model-invocation: true
allowed-tools: "Read, Grep, Glob, Bash(npm run test:overflow *), Bash(npx playwright *), Bash(npx tsc --noEmit), Bash(curl *)"
---

# Viewport Overflow Check & Fix

Run the Playwright overflow test for the specified demo and fix any slides where content exceeds 75% of viewport height.

## Prerequisites

The Vite dev server must be running on localhost:5173. Verify with:
```
curl -s -o /dev/null -w "%{http_code}" http://localhost:5173
```
If not running, tell the user to start it with `npm run dev` first.

## Step 1: Run the overflow test

```bash
cd presentation-app
npm run test:overflow -- --demo $ARGUMENTS
```

If the user didn't specify a demo ID, ask which demo to check. If they didn't specify `--viewport`, use the default (1920x1080). For the user's actual browser viewport, recommend `--viewport 1920x1019`.

**Important**: Playwright's headless Chromium renders text ~15-20px shorter than real browsers due to font fallbacks. Always also test at a slightly shorter viewport (e.g., `--viewport 1920x1019` for 1080p targets).

## Step 2: Analyze the report

The test outputs a report like:
```
PASS  Slide 5/25  Ch3_S1 "Four Cost Drivers" — all 5 segments fit
FAIL  Slide 17/25 Ch6_S4 "Output Schema"
      Segment 2 (extractive_zoom): OVERFLOW 316px (1060px / 764px threshold)
```

For each FAIL:
1. Note which slide, chapter file, and segment(s) overflow
2. Note the scrollHeight vs threshold — this tells you how much content to remove or swap

## Step 3: Fix overflowing slides

Read the chapter file containing the overflowing slide. The fix depends on the overflow pattern:

### Pattern A: Accumulating code blocks or large content sections
Content from earlier segments stacks with later segments. **Fix**: Wrap in `<RevealSequence>` and add `until={N}` so earlier content exits before later content enters.

```tsx
<SlideContainer>
  <Reveal from={0}><SlideTitle>...</SlideTitle></Reveal>  {/* persists */}

  <RevealSequence delay={300}>
    <Reveal from={0} until={0}>Content shown only on segment 0</Reveal>
    <Reveal from={1} until={1}>Replaces previous at segment 1</Reveal>
    <Reveal from={2}>Final content from segment 2 onward</Reveal>
  </RevealSequence>
</SlideContainer>
```

The `until` boundary should be placed at the **same** segment index (until={N} means visible only through segment N, exits when N+1 enters). Use this when content blocks are independent views (e.g., different code samples, different zoom levels).

### Pattern B: Marginal overflow (< 50px)
Content almost fits. **Fix**: Reduce margins, padding, font sizes, or collapse verbose text. Common tweaks:
- Reduce `marginTop`/`marginBottom` on Reveal containers
- Reduce `marginBottom` on `<SlideTitle>` containers
- Collapse multi-line code strings (e.g., function args on one line)
- Use smaller `fontSize` on code blocks

### Pattern C: Too many accumulating list items
Multiple items revealed sequentially that all persist. **Fix**: Show items in groups using `from`/`until` windows, or reduce item padding to fit all.

## Step 4: Verify the fix

Re-run the test:
```bash
npm run test:overflow -- --demo $ARGUMENTS
```

All slides should now show PASS. Also run at the user's viewport if different from 1080p.

## Step 5: Type-check

```bash
npx tsc --noEmit
```

## Important notes

- `RevealSequence` and `Reveal` with `until` are exported from `@framework` — always import from the barrel
- Never use deep imports like `@framework/components/reveal` — they're blocked by ESLint
- The `data-overflow` attribute is set by `SlideContainer`'s dev-mode ResizeObserver
- During slide transitions, `AnimatePresence` briefly mounts both old and new slides — the overflow test uses `querySelectorAll('[data-overflow]')` and picks the last element to get the current slide
