# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Purpose

Documentation and reference repository for the Meeting Highlights prompt optimization — the redesign that collapsed a 4-call GPT-4 pipeline into a single unified prompt, reducing COGS by ~70%.

This is a **documentation-only repo**. There are no build, test, or lint commands. The primary artifacts are markdown documents and Python source files kept as reference.

## Repository Structure

- `session-prompt-deep-dive.md` — The main technical deep-dive document. This is the primary deliverable.
- `meeting-highlights.md` — Presentation guide (all-hands audience, 15-slide format).
- `context/v1/` — V1 (legacy) source files: `HighlightsPromptMaper.py` (4-call pipeline), `highlights_utils.py` (candidate generation, token packing, parsing), `highlights_debug_utils.py`.
- `context/v2/` — V2 (current) prompt files: `prompt.md` (unified prompt with pseudocode algorithm), `prompt_output_schema.md` (JSON schema), `TRANSCRIPT_TABLE_SCHEMA.md` (compact transcript format spec).
- `context/*.md` — Supporting product/architecture docs (what the feature is, team structure, goals).

## Key Architectural Concepts

**V1 pipeline** (`context/v1/`): 4 sequential LLM calls — abstractives → extractives → ranking → final merge. The critical cost driver was `extract_highlights_candidates_from_transcript` in `highlights_utils.py`, which generates O(n²) candidate ranges per topic and greedily packs them to a 128K token budget.

**V2 unified prompt** (`context/v2/`): Single call. Three key innovations:
1. **Compact transcript table** — turn-grouped format with `max_end_utterance_id` column replacing O(n²) candidate enumeration with O(n) boundary encoding.
2. **Pseudocode algorithm** — executable function-call style instructions instead of prose.
3. **Copy-then-parse pattern** — model copies raw input strings verbatim before deriving integer IDs, preventing hallucination.

## Editing Guidelines

- When expanding `session-prompt-deep-dive.md`, always verify code snippets against the actual source files in `context/v1/` and `context/v2/`. Line numbers in the document reference those files.
- Cross-references between sections (e.g., "see Combinatorial Candidate Explosion below") use markdown anchor links. Keep them consistent when renaming headings.
- The document uses a consistent pattern: show V1 code/approach first, then contrast with V2. Maintain this structure.
