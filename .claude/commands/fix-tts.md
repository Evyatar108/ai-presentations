# Fix TTS Audio Quality (Interactive)

Verify and fix TTS audio for demo: $ARGUMENTS

## Overview

This command verifies TTS audio by comparing Whisper transcriptions against original narration text, then lets the user decide per-segment whether audio needs regeneration. Decisions are logged for future calibration.

## Step 1: Transcribe all audio via Whisper

Run the verification script. Use `--force` only if you need to re-transcribe segments that already have cached results.

```bash
cd presentation-app && npm run tts:verify -- --demo $ARGUMENTS
```

If the user passed `--force` in `$ARGUMENTS`, pass it through. Otherwise omit it — the script uses a cache file (`.tts-verification-cache.json`) to skip segments whose audio hasn't changed.

## Step 2: Read the verification report

Read the file `presentation-app/verification-report-$ARGUMENTS.json` (use the demo ID portion only, strip any flags).

## Step 3: Load prior decisions

Read `presentation-app/.tts-verification-decisions.json` if it exists. This file contains past user decisions for segments. Use these to inform your evaluation — if the user previously marked a segment as "ok" and the diff pattern is the same, you can note that.

## Step 3b: Scan narration text for known TTS-breaking patterns

Before evaluating Whisper output, proactively scan the narration text for patterns known to cause TTS pronunciation failures:

- **Underscored identifiers**: `highlights_extractives`, `max_end_utterance_id`, `final_narrative` — the underscore causes TTS to garble the word. Replace with spaces (e.g., "highlights extractives", "max end utterance ID").
- **Hyphenated compound terms**: `copy-then-parse`, `pre-computed` — hyphens can cause TTS to insert extra syllables. Replace with spaces (e.g., "copy then parse"). Note: em-dashes (—) used as sentence punctuation are fine.
- **Snake_case or camelCase code identifiers** used verbatim in narration text — rephrase for speech.
- **Special characters in spoken text**: `$`, `%`, `#`, `@`, `&`, `<`, `>`, backticks — can confuse TTS. Spell out or remove (e.g., "percent" instead of "%").
- **URLs, file paths, or code expressions** embedded in narration — rephrase for speech.

If you find any of these patterns, flag them to the user and offer to fix the narration text before regenerating. Fixing the root cause in the text is always better than regenerating the same broken input.

## Step 4: Evaluate and present each segment interactively

For each segment in the report, compare `original` (intended narration) vs `transcribed` (what Whisper heard).

First, do your own triage. Classify each segment:
- **OK (auto)**: The transcription is essentially identical — only whitespace, punctuation, or trivial differences.
- **Flagged**: There's a meaningful difference that the user should review.
- **Text fix needed**: The narration text itself contains a TTS-breaking pattern (from Step 3b). Flag these separately — they need a text fix, not just regeneration.

For segments you classified as OK (auto), briefly list them as "auto-approved" so the user knows they were checked.

For each **flagged** segment, do the following one at a time:

### 4a. Show the diff

Present:
- **Segment**: `ch{N}:s{N}:{id}`
- **Original**: the intended narration text
- **Transcribed**: what Whisper heard
- **Diff summary**: a concise description of what's different (e.g., "acronym casing: 4o vs 4O", "missing word: 'the'", "wrong word: 'model' vs 'module'")

### 4b. Play the audio

Play the audio file so the user can listen:

```bash
start "" "D:\MyRepos\ai-presentations\presentation-app\public\audio\{filepath}"
```

Where `{filepath}` is the audio file path from the verification report (the path relative to the `public/audio/` directory).

### 4c. Ask the user

Use the AskUserQuestion tool to ask the user what to do:

- **Sounds fine** — The audio is acceptable despite the transcription difference
- **Regenerate** — The audio needs to be regenerated
- **Skip** — Skip this segment without logging a decision

### 4d. Log the decision

If the user chose "Sounds fine" or "Regenerate", log the decision to `presentation-app/.tts-verification-decisions.json`.

The file structure is:
```json
{
  "decisions": [
    {
      "demoId": "the-demo-id",
      "segmentKey": "ch1:s2:intro",
      "original": "the original narration text",
      "transcribed": "what whisper heard",
      "diffSummary": "concise diff description",
      "decision": "ok | regenerate",
      "reason": "Why this decision was made — capture the user's rationale or your summary of it",
      "decidedAt": "ISO 8601 timestamp"
    }
  ]
}
```

When the user chooses "Sounds fine", ask them briefly why (or infer from context) and record it in `reason`. This is the most valuable field — it teaches what differences are acceptable.

When the user chooses "Regenerate", note what's wrong in `reason`.

**Important**: Append to the existing decisions array, don't overwrite. If a decision already exists for the same `demoId` + `segmentKey`, update the existing entry in place (replace it with the new decision).

## Step 5: Regenerate user-flagged segments

Collect all segment keys the user marked as "Regenerate" into a comma-separated list and run:

```bash
cd presentation-app && npm run tts:generate -- --demo $ARGUMENTS --segments {comma-separated-keys}
```

If no segments were flagged for regeneration, report success and stop.

## Step 6: Re-verify regenerated segments

Run verification again on just the regenerated segments with `--force` (since the audio files changed):

```bash
cd presentation-app && npm run tts:verify -- --demo {demo-id} --segments {comma-separated-keys} --force
```

Read the updated report. For each re-verified segment, show the user the new result. If a segment still has issues, repeat Steps 4-6 up to 3 total attempts.

After 3 attempts, report persistent issues and suggest the user consider:
- Checking for TTS-breaking patterns in the narration text (underscores, hyphens, special characters, code identifiers)
- Rephrasing the narration text to be more speech-friendly
- Adding an `instruct` override on the segment for TTS style guidance

## Step 7: Summary

Print a final summary:
- Total segments checked
- Auto-approved (trivial differences)
- User-approved (sounds fine)
- Regenerated (and whether they passed on retry)
- Persistent issues (if any)
