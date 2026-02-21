---
name: review-slides
description: Take screenshots of all slides/segments in a demo and review them for visual issues (spacing, alignment, overflow, readability). Use when the user wants a visual review of their slides.
argument-hint: "[demo-id] [--slides N-M] [--viewport WxH]"
disable-model-invocation: true
allowed-tools: "Read, Grep, Glob, Bash(npm run test:screenshot *), Bash(npx playwright *), Bash(npx tsc --noEmit), Bash(curl *)"
---

# Visual Slide Review

Capture screenshots of every slide and segment in a demo, then review them for visual quality issues.

## Prerequisites

The Vite dev server must be running on localhost:5173. Verify with:
```
curl -s -o /dev/null -w "%{http_code}" http://localhost:5173
```
If not running, tell the user to start it with `npm run dev` first.

## Step 1: Capture screenshots

```bash
cd presentation-app
npm run test:screenshot -- --demo $ARGUMENTS
```

If the user didn't specify a demo ID, ask which demo to review.

Options:
- `--slides N-M` — Only capture slides N through M (1-indexed)
- `--viewport WxH` — Custom viewport (default: 1920x1080)

Screenshots are saved to `presentation-app/screenshots/{demo-id}/` with naming:
`c{chapter}_s{slide}_seg{NN}_{segmentId}.png`

## Step 2: Review the screenshots

Use the Read tool to view each screenshot image. The Read tool can display images.

For each screenshot, evaluate:

### Spacing & Layout
- Is there enough breathing room between elements?
- Are margins consistent across similar elements?
- Is vertical spacing balanced (not top-heavy or bottom-heavy)?
- Does content feel cramped or too sparse?

### Alignment
- Are elements properly aligned (left edges, centers)?
- Are bullet points and list items consistently indented?
- Are code blocks aligned with surrounding content?

### Readability
- Is text large enough to read at presentation distance?
- Is there sufficient contrast between text and background?
- Are code blocks readable (font size, line spacing)?
- Do long lines wrap well or get cut off?

### Content Overflow
- Does content extend beyond the visible viewport?
- Are elements clipped or partially hidden?

### Visual Hierarchy
- Is the slide title clearly the most prominent element?
- Do headings stand out from body text?
- Are key points visually emphasized?

### Segment Progression
- Does each segment add content in a logical way?
- Is the reveal sequence smooth (not jarring jumps)?
- Are earlier segments still readable after new content appears?

## Step 3: Report findings

For each issue found, report:
1. Which screenshot file (includes chapter/slide/segment coordinates)
2. What the issue is
3. Severity: **minor** (polish), **moderate** (noticeable), **major** (impacts readability)
4. Suggested fix with the specific file and what to change

Group findings by slide for clarity.

## Step 4: Fix issues (if requested)

If the user asks you to fix the issues:
1. Read the chapter file containing the problematic slide
2. Apply the fix (adjust spacing, font sizes, layout, use `<RevealSequence>` with `until` for overflow, etc.)
3. Re-run screenshots for the affected slides to verify:
   ```bash
   npm run test:screenshot -- --demo {demo-id} --slides {N}-{N}
   ```
4. View the new screenshots with Read to confirm the fix looks right

## Step 5: Type-check

After any code changes:
```bash
npx tsc --noEmit
```

## Important notes

- Screenshots are 1920x1080 by default — this is the target presentation resolution
- Always review at least the first and last segment of each slide to catch progression issues
- If there are many slides, you can review in batches using `--slides`
- The `screenshots/` directory is gitignored — screenshots are ephemeral review artifacts
- `RevealSequence`, `Reveal`, and layout components are exported from `@framework` — always import from the barrel
