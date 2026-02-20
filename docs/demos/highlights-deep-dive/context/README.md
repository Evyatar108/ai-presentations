# Context Files

These files are copied from the [highlights-prompt](../../../highlights-prompt/) repository and serve as the source material for code snippets and content shown in the presentation slides.

## Files

### Root
- **session-prompt-deep-dive.md** — The authoritative technical deep-dive document describing the V1-to-V2 prompt redesign

### v1/ (Legacy Pipeline)
- **HighlightsPromptMaper.py** — The 4-call GPT-4 pipeline (abstractives, extractives, ranking, final)
- **highlights_utils.py** — Candidate generation utilities including the O(n^2) nested loop

### v2/ (Unified Prompt)
- **prompt.md** — The unified prompt with pseudocode algorithm (`generate_highlights()`)
- **prompt_output_schema.md** — JSON output schema definition
- **TRANSCRIPT_TABLE_SCHEMA.md** — Compact transcript format specification (turn tags, pipe-delimited rows, `max_end_utterance_id`)

## Usage

Slides reference these files for:
- Code snippets displayed in `CodeBlock` components
- Before/after comparisons in `BeforeAfterSplit` components
- Accuracy verification of content shown in the presentation
