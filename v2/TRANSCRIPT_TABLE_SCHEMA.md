# Transcript Turn Table Format

This document defines a compact markdown table format for representing a meeting transcript segmented into speaker turns.

## 1. Narrative Example

Imagine a short exchange:

Speaker A says five short sentences that build an idea.
Speaker B gives a quick acknowledgement.

We represent it like this:

```
utterance_id|utterance_text|max_end_utterance_id
---|---|---
<t0 Speaker A>
u0|Intro line one|u4
u1|Continuation sentence two|u4
u2|Continuation sentence three|u4
u3|Continuation sentence four|u4
u4|Closing idea|u4
</t0>
<t1 Speaker B>
u0|A short response|u0
</t1>
```

How to read one row (e.g. u2 line):

utterance_id u2 = the third utterance inside this turn (local numbering always starts at u0 each turn)
utterance_text = the verbatim content
max_end_utterance_id u4 = if you start an extractive span at u2 you may extend it as far as (and including) u4, staying within the turn

## 2. What the Table Shows

A linear sequence of turns. Each turn:
- Is enclosed by an opening angle‑bracket marker and a closing marker
- Contains only data rows (no per‑turn header)
- Uses local utterance ids (u0, u1, …) that reset at each new turn
- Provides, per row, the furthest local id you are allowed to reach if you begin a span at that row

## 3. Key Terms (Glossary)

Term | Meaning
---- | -------
Turn | A contiguous block of utterances by one speaker
Turn Marker | Opening `<tN Speaker Name>` and closing `</tN>` lines that wrap a turn
Local Utterance ID | A per‑turn incremental id: u0, u1, u2, …
Utterance Text | The verbatim transcript content for that utterance
Allowed End | The value in max_end_utterance_id; the last utterance you may include when starting a span at the current row
Extractive Span | Any contiguous subset of utterances within a single turn that starts at a given local id and ends at or before that row’s Allowed End

## 4. Turn Markers

Opening marker syntax: `<tN Speaker Name>`
Components:
- tN: turn id (t0, t1, t2, …) strictly increasing, no gaps
- Speaker Name: free text (may contain spaces)

Closing marker syntax: `</tN>`

## 5. Columns

Column | Type | Rules
------ | ---- | -----
utterance_id | string | Format uN where N is the zero‑based index within its turn; sequence must be continuous starting at u0
utterance_text | string | Raw content; may include punctuation, symbols, Unicode; no escaping needed for internal pipes unless at start/end
max_end_utterance_id | string | A local id (uM) designating the furthest utterance you may include when starting a span at this row; never references a different turn; never moves backward relative to previous rows

Practical interpretation of max_end_utterance_id:
- It constrains time or length (e.g., precomputed duration budget)
- If the row alone already exceeds the budget, the value equals that row’s own id
- Otherwise it is the furthest permissible local id respecting the budget

## 6. How Allowed Ends Work

Suppose you examine a row with utterance_id u2 and allowed end u4. You may construct any contiguous span that:
- Starts at u2
- Ends at u2, u3, or u4
- Stays within the same turn

The highlight generation model uses this format to select extractive spans: contiguous, in‑turn sequences that surface the most interesting moments for a condensed highlights video. It must not skip utterances (no gaps) and must not cross into the next turn (speaker boundary). The max_end_utterance_id is a precomputed upper bound derived from a per‑start duration (e.g., up to ~40 seconds of audio) or similar budget (tokens, clip length). It caps how far the model may extend while still allowing it to stop earlier when the meaningful content ends.

For every starting row you therefore have a small set of valid end ids (current id through its allowed end). The model can enumerate candidate extractive spans (conceptually) by iterating each row and expanding to each permissible end id.

## 7. Invariants

Property | Must
-------- | ----
Single global header | Present once at very top
Turn ordering | t0, t1, t2, … strictly increasing
Turn ids unique | No duplicates
Local ids sequential | u0, u1, … no gaps inside a turn
Local ids reset | Each new turn starts at u0
Allowed end valid | For each row, allowed end index >= current row index
Allowed end contained | Never exceeds the last local id of its turn
Allowed end non‑decreasing | Never goes backward compared to prior row
No cross‑turn spans | Spans never include utterances from two turns
Clean row formatting | Rows do not start or end with pipe characters

## 8. Advantages

- Single global header: field names appear once instead of repeating on every row (unlike JSON which restates keys each object)
- Angle‑bracket turn markers: compact; avoid verbose paired XML tags and repeated speaker identifiers
- Local ids reset each turn: we do not repeat speaker name or turn id for every utterance line
- Precomputed allowed ends: removes need to enumerate or transmit every contiguous span combination (avoids quadratic explosion the model would otherwise scan)
- Compact for models: minimal structural noise increases effective token budget for semantic content

### Model‑Oriented Trade‑offs

- Hybrid syntax: angle‑bracket marker lines are custom; a model not instructed may treat them as generic tags
- Learning curve for developers and prompt maintainers
