# Fix TTS Audio Quality

Verify and fix TTS audio for demo: $ARGUMENTS

## Step 1: Transcribe all audio via Whisper

Run the verification script to get Whisper transcriptions of all audio segments:

```bash
cd presentation-app && npm run tts:verify -- --demo $ARGUMENTS --force
```

## Step 2: Read the verification report

Read the file `presentation-app/verification-report-$ARGUMENTS.json`.

## Step 3: Evaluate each segment

For each segment in the report, compare `original` (intended narration) vs `transcribed` (what Whisper heard).

Use your judgment to classify each segment:
- **OK**: The transcription matches the intent. Differences in acronyms (GPT, AI, CIQ), product names (BizChat, GPT-4o), punctuation, or minor phrasing are acceptable.
- **Problem**: Missing words, wrong words, garbled audio, or meaning-altering differences indicate the TTS output is unclear.

## Step 4: Report findings

Show a table of problematic segments with:
- Segment key (ch{N}:s{N}:{id})
- Original text (abbreviated)
- Transcribed text (abbreviated)
- What's wrong

If all segments are OK, report success and stop.

## Step 5: Regenerate problematic segments

Collect all problematic segment keys into a comma-separated list and run:

```bash
cd presentation-app && npm run tts:generate -- --demo $ARGUMENTS --segments {comma-separated-keys}
```

## Step 6: Re-verify

Run verification again on just the regenerated segments:

```bash
cd presentation-app && npm run tts:verify -- --demo $ARGUMENTS --segments {comma-separated-keys} --force
```

Read the report and re-evaluate. If segments still have problems after 3 regeneration attempts, report them as persistent issues that may need narration text changes or instruct adjustments.
