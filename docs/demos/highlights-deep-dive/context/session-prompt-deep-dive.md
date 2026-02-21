# From 4 Calls to 1 — Redesigning the Meeting Highlights LLM Prompt

**A Prompt Engineering Deep-Dive**

---

## Part 1: Context Setting

---

### 1.1 — What Meeting Highlights Produces

Meeting Highlights generates AI video recaps of Teams meetings. Each recap interleaves two content types:

- **Abstractive narration** — AI-summarized voiceover played over muted meeting video
- **Extractive clips** — Actual meeting audio/video segments where someone said something compelling

The LLM's job is the middle step of a three-stage pipeline:

```
Meeting Transcript  →  [LLM: Structured Metadata]  →  Video Assembly
```

The model reads the full transcript, identifies the key topics, writes narration summaries, selects the best verbatim audio clips, ranks them by quality, and outputs a single structured JSON that the video assembly pipeline consumes directly.

The model does NOT produce the video — it produces the **editing instructions** that tell the video pipeline what to show, when, and in what order.

---

### 1.2 — The COGS Problem

Meeting Highlights was built on **4 sequential GPT-4 calls per meeting**. At projected GA scale:

- **~600 A100 GPUs** needed — far exceeding the approved quota
- **Capacity council gate**: "Reduce costs or no GA"
- The feature was technically ready, but **economically blocked**

> *"Even with new capacity, we cannot release… the bottleneck is Evyatar finishing his changes to reduce capacity."*
> — Eli Lekhtser, Team Sync (Sept 2025)

This was not an infrastructure problem. We weren't going to solve it by getting more GPUs or switching to a faster cluster. The cost was **inherent in the prompt architecture** — and the fix had to come from **prompt engineering**.

---

## Part 2: V1 Architecture — The 4-Call Pipeline

---

### 2.1 — The Four Calls

The V1 code lives in `HighlightsPromptMaper.py`. Each call is a separate `Query` object with its own prompt template, model config, and output format. Here's the pipeline:

```
Call 1: highlights_abstractives
    ↓ (markdown table output)
Call 2: highlights_extractives
    ↓ (markdown table output)
Call 3: highlights_extractive_ranking
    ↓ (markdown table output)
Call 4: highlights_final
    ↓ (markdown table output → final result)
```

Each call's output feeds as input to the next. Let's walk through each.

---

#### Call 1: `highlights_abstractives` (lines 13–137)

**Purpose**: Identify key topics and write narration summaries.

```python
self.query_to_prompt["highlights_abstractives"] = Query(
    first_prompt_template="""
<|im_start|>system
# General instructions
- Envision yourself as a video editor, tasked with transforming a long meeting
  into a short, engaging summary...
- You should create two types of sections for the highlights video:
  abstractive sections... and extractive sections...
- This task will be performed in steps, the first of which is the extraction
  of the abstractive sections.

# RAI Rules:
- You will **never** provide profiling information on people's background...
- To refer to people, you will **always** use the singular "they" pronoun...
- You will **never** speculate or infer anything about the participants' roles...
- You will **never** speculate or infer anything about people's feelings...
[... ~12 more RAI rules ...]

# Detailed instructions
# Structure of the transcript:
- The transcript of the meeting is formatted as a series of JSON objects,
  with each JSON object separated by '/r/n'. Each object details a single
  utterance and includes these keys:
  - **Index**: The sequential number of the utterance.
  - **Speaker**: The person delivering the utterance.
  - **Start**: The start time of the utterance.
  - **End**: The end time of the utterance.
  - **Utterance**: The exact text of what was spoken.

# **Abstractive Sections Creation**
- Please identify those key topics and write a short summary of each topic.
- Provide no more than 7 abstractive sections.
- Each narration should be concise, with a maximum of 350 characters or 40 words.

**Output**: a markdown table with columns for Topic Title, Topic Utterance Range,
Narration, Playback Video Start Utterance Index, Category, Level of interest...
""")
```

**Output format**: A markdown table wrapped in `<Copilot Response>` tags.

---

#### Call 2: `highlights_extractives` (lines 140–228)

**Purpose**: Select verbatim audio clips from pre-enumerated candidate blocks.

```python
self.query_to_prompt["highlights_extractives"] = Query(
    first_prompt_template="""
<|im_start|>system
- Your task is to select utterance blocks from the given list, such that each
  block is a self-contained, clear, impactful and engaging snippet...

# Structure of the input table:
- 'utterance_range': the start and end indices of the utterance block
- 'uttrances_texts': a block of text containing several utterances

# Detailed instructions:
  - Select blocks that contain **full, uninterrupted statements** from a single speaker.
  - Ensure each selected block encompasses one of the following:
      - important feedback
      - exciting news or declaration
      - part of a demo
  - Restrict the number of blocks to **no more than 10**.

# RAI Rules:
  - You will *never* select an utterance block that provides profiling information...
  - You will *Never* select an utterance block that contains biased, racist...

**Output**: a markdown table with utterance_range, uttrances_texts,
selection_reason, is_self_contained, is_engaging...
""")
```

Key detail: **the input** (`$abstractives_output$`) was **not** the raw output of Call 1. Between the two calls, the upstream Python code ran `extractive_input_cleaner`, which:

1. Parsed Call 1's markdown table via `parse_table_for_display` to extract topic ranges
2. Called `extract_highlights_candidates_from_transcript` — an O(n²) nested loop that enumerated **every valid contiguous utterance range** within each topic
3. Formatted the resulting candidate rows back into a markdown table via `format_as_markdown_table`
4. Greedily packed candidates into the prompt until hitting a **128K token budget**

The LLM in Call 2 simply picked from this pre-materialized list. It never saw the raw transcript — only a massive table of overlapping candidate ranges with duplicated text.

> This candidate generation was the **single biggest token cost driver** in V1 — see [Combinatorial Candidate Explosion](#5-combinatorial-candidate-explosion) below.

---

#### Call 3: `highlights_extractive_ranking` (lines 230–315)

**Purpose**: Rank the selected clips by quality.

```python
self.query_to_prompt["highlights_extractive_ranking"] = Query(
    first_prompt_template="""
<|im_start|>system
- Your task is to rank the given utterance blocks according to various criteria...

# Detailed instructions:
  - Each block should be assessed based on the following criteria:
    - proper English usage
    - clarity
    - intelligibility
    - self-containment
    - level of interest

**Output**: a markdown table with range, clarity, self-containment,
level of interest, overall rank...
""")
```

This entire call exists just to assign a quality ranking to clips that were already selected.

---

#### Call 4: `highlights_final` (lines 318–454)

**Purpose**: Merge abstractive and extractive sections into a unified narrative with transition sentences.

```python
self.query_to_prompt["highlights_final"] = Query(
    first_prompt_template="""
<|im_start|>system
# General instructions
- Envision yourself as a video editor, tasked with transforming a long meeting
  into a short, engaging summary...
- This task is performed in steps:
    1. The first step involves extracting the abstractive sections.
    2. The second step involves extracting the extractive sections.
    3. The abstractive and extractive sections have been added to a table...
    4. Your current task is to rephrase the narration... so that, when reading
       the narration row-by-row, the story of the meeting is coherently formed.

# RAI Rules:
- You will **never** provide profiling information on people's background...
- To refer to people, you will **always** use the singular "they" pronoun...
[... same ~20 lines of RAI rules repeated again ...]

## Objective: Synthesize Abstractive and Extractive Sections into a Unified
Meeting Narrative
- The "Narration" from the Meeting's combined table will be rephrased...
- Where extractive sections correspond to abstractive ones, you will need to
  devise a single transition sentence...

**Output**: a markdown table with Topic title, Rephrased Narration,
Playback Video Start Utterance Index, Transition sentence,
Extractive section Utterance range...
""")
```

---

### 2.2 — Why V1 Was Expensive

Five structural cost drivers:

#### 1. Four sequential calls = 4x latency

Each call had to wait for the previous call's output. No parallelism possible — strict sequential dependency.

#### 2. Verbose JSON input format

Every single utterance in the transcript repeated the full JSON key structure:

```json
{"Index": "42", "Speaker": "Sarah", "Start": "00:05:23", "End": "00:05:31", "Utterance": "Let me share the results"}
{"Index": "43", "Speaker": "Sarah", "Start": "00:05:31", "End": "00:05:38", "Utterance": "We saw a 15% improvement"}
{"Index": "44", "Speaker": "Sarah", "Start": "00:05:38", "End": "00:05:45", "Utterance": "Across all key metrics"}
```

For a 60-minute meeting with ~500 utterances, the key names `"Index"`, `"Speaker"`, `"Start"`, `"End"`, `"Utterance"` repeat 500 times each. That's thousands of tokens spent on structural noise.

#### 3. Duplicated RAI rules across prompts

The same ~20 lines of Responsible AI rules appeared in **3 of the 4 prompts** (Calls 1, 2, and 4).

**Call 1** (lines 29–41):
```
# RAI Rules:
- You will **never** provide profiling information on people's background and
  demography (e.g., gender, religion, origin, or language proficiency).
- To refer to people, you will **always** use the singular "they" pronoun or
  a person's name (if it is known) instead of the pronouns "he" and "she"...
- You will **never** speculate or infer anything about the participants' roles...
- You will **never** speculate or infer anything about people's feelings...
- Feelings -- You will **never** point out anyone's feelings or attitude...
- Conduct -- You will **never** point out anyone's conduct or behavior...
- There are exactly 3 exceptions to the above...
- You will **never** generate biased, racist, violence, sexist...
```

**Call 4** (lines 337–348) — **the exact same rules, copy-pasted**:
```
# RAI Rules:
- You will **never** provide profiling information on people's background and
  demography (e.g., gender, religion, origin, or language proficiency).
- To refer to people, you will **always** use the singular "they" pronoun or
  a person's name (if it is known) instead of the pronouns "he" and "she"...
[... identical text ...]
```

That's ~60 lines of duplicated RAI instructions across the pipeline, burning tokens three times over.

#### 4. Intermediate markdown tables parsed between calls

Each call produced a markdown table in `<Copilot Response>` tags. The next call received that table as input — but not directly. Between every pair of calls, Python code had to parse the markdown, transform it, and re-format it.

The full chain for the Call 1 → Call 2 handoff:

```
Call 1 LLM output (markdown table in <Copilot Response> tags)
  ↓  parse_table_for_display()    — regex-based markdown → DataFrame
  ↓  extract topic ranges from "Topic Utterance Range" column
  ↓  extract_highlights_candidates_from_transcript()  — O(n²) candidate generation
  ↓  pd.DataFrame(candidates)     — dict list → DataFrame
  ↓  format_as_markdown_table()   — DataFrame → markdown string
  ↓
Call 2 LLM input ($abstractives_output$ variable)
  ↓  ...LLM picks candidates...
  ↓
Call 2 LLM output (markdown table in <Copilot Response> tags)
  ↓  parse_table_for_display()    — regex-based markdown → DataFrame again
  ↓
Call 3 LLM input
```

Every hop was regex-based and fragile. The `parse_table_for_display` function used string splitting on `|` characters to reconstruct DataFrames — and any malformed LLM output would break the pipeline. The sheer number of custom error classes in `highlights_utils.py` tells the story:

- `AbstractivesTableParsingError` — Call 1 output couldn't be parsed
- `ExtractivesTableParsingError` — Call 2 output couldn't be parsed
- `AbstractivesTableMissingColumnsError` — parsed table was missing expected columns
- `ExtractivesTableMissingColumnsError` — same, for Call 2's output
- `TopicRangeExtractionFailedError` — topic ranges couldn't be extracted from the parsed table
- `HighlightsCandidateFilteringFailedError` — candidate filtering step failed

Six error classes just for inter-call data passing — a direct consequence of using a fragile text format as the serialization layer between LLM calls.

#### 5. Combinatorial candidate explosion

This was the **single largest token cost driver** in V1. The upstream system pre-enumerated every valid contiguous utterance range as a candidate row — an O(n²) operation — then greedily packed them into Call 2's prompt until hitting 128K tokens.

##### a) The O(n²) nested loop

From `highlights_utils.py` (lines 199–234), `extract_highlights_candidates_from_transcript`:

```python
def extract_highlights_candidates_from_transcript(contexts_blocks, topic_ranges,
                                                   duration_thresh_low, duration_thresh_high):
    data = contexts_blocks[0]
    result = []
    ranges = [[int(x) for x in s.split("-")] for s in topic_ranges]
    speaker_list = [x["userDisplayName"] for x in data["uttrances_speakers_info"]]
    utterances = list(
        zip(data["uttrances_start_times"], data["uttrances_end_times"],
            data["uttrances_texts"], data["uttrances_ids"], speaker_list)
    )

    for i in range(1, len(ranges) - 1):           # for each topic (skip first & last)
        start_ind = ranges[i][0]
        end_ind = ranges[i][1]
        topic_blocks = []
        for j in range(start_ind, end_ind + 1):    # ← O(n) start positions
            for k in range(j + 1, end_ind + 1):    # ← O(n) end positions  → O(n²) total
                start_time = utterances[j][0]
                end_time = utterances[k][1]
                duration = end_time - start_time

                if duration_thresh_low <= duration <= duration_thresh_high:
                    utt = [ut[2] for ut in utterances[j : k + 1]]
                    subset = {
                        "utterance_range": [j, k],
                        "uttrances_texts": utt,       # ← full text repeated per candidate
                        "uttrances_speaker": [ut[4] for ut in utterances[j : k + 1]],
                    }
                    topic_blocks.append(subset)

        topic_blocks_filt = apply_filters_on_blocks(topic_blocks)
        result.append(topic_blocks_filt)
    return result
```

Key callouts:
- **Double nested loop** `for j... for k in range(j+1, ...)` — generates O(n²) candidates per topic
- `uttrances_texts` is a **string array** — each candidate carries the full verbatim text of every utterance in its range
- Duration filter (20–40 sec) limits some candidates, but still produces hundreds per topic

##### b) The 128K token-filling algorithm

From `highlights_utils.py` (lines 249–307), `extractive_input_cleaner`:

```python
tokenizer = GptTokenizer()
token_thresh = 128000          # ← fills up to 128K tokens with candidates!
total_tokens = 0
all_candidates = []

for ind in sorted_indices:     # topics sorted by interest level (highest first)
    if ind == 0 or ind == len(sorted_indices) - 1:
        continue
    cand = candidates[ind - 1]
    if len(cand) == 0:
        continue
    df_output = pd.DataFrame(cand)
    df_output = df_output.drop("uttrances_speaker", axis=1)
    formatted = format_as_markdown_table(df_output)
    str_tokens = len(tokenizer.get_tokens(formatted, model_name=model_name)["input_ids"])
    if total_tokens + str_tokens <= token_thresh:
        total_tokens += str_tokens    # ← keeps adding until hitting 128K
        all_candidates += cand
```

The algorithm **greedily fills the entire 128K context window** with combinatorial candidate rows. It doesn't stop at "enough" — it keeps packing candidates until the token budget is exhausted.

##### c) Worked example: text duplication across overlapping ranges

Take a single topic spanning utterances 40–44 (5 utterances). The nested loop generates all valid pairs:

| utterance_range | uttrances_texts (string array) |
|-----------------|-------------------------------|
| [40, 41] | `['Let me share the results', 'We saw a 15% improvement']` |
| [40, 42] | `['Let me share the results', 'We saw a 15% improvement', 'Across all key metrics']` |
| [40, 43] | `['Let me share the results', 'We saw a 15% improvement', 'Across all key metrics', 'Which exceeded our target']` |
| [40, 44] | `['Let me share the results', 'We saw a 15% improvement', 'Across all key metrics', 'Which exceeded our target', 'Let me walk you through']` |
| [41, 42] | `['We saw a 15% improvement', 'Across all key metrics']` |
| [41, 43] | `['We saw a 15% improvement', 'Across all key metrics', 'Which exceeded our target']` |
| [41, 44] | `['We saw a 15% improvement', 'Across all key metrics', 'Which exceeded our target', 'Let me walk you through']` |
| [42, 43] | `['Across all key metrics', 'Which exceeded our target']` |
| [42, 44] | `['Across all key metrics', 'Which exceeded our target', 'Let me walk you through']` |
| [43, 44] | `['Which exceeded our target', 'Let me walk you through']` |

That's **10 candidate rows from just 5 utterances**. Notice how "Let me share the results" appears in 4 rows, "We saw a 15% improvement" appears in 7 rows, etc. The same text is duplicated across overlapping ranges.

For a topic spanning 30 utterances (typical for a real meeting): 30×29/2 = **435 candidate ranges** — for a single topic. Across 5 topics, that's ~2,000+ candidates, each carrying a string array of duplicated utterance texts, greedily packed until 128K tokens are consumed.

This formatted markdown table was then sent as the `$abstractives_output$` input to Call 2's LLM prompt:

```
# Meeting's utterance blocks:
|utterance_range|uttrances_texts|
|---|---|
|[40, 41]|['Let me share the results', 'We saw a 15% improvement']|
|[40, 42]|['Let me share the results', 'We saw a 15% improvement', 'Across all key metrics']|
|[40, 43]|['Let me share the results', 'We saw a 15% improvement', 'Across all key metrics', 'Which exceeded our target']|
... (hundreds more rows, filling to 128K tokens)
```

##### d) How V2 eliminates the explosion

V2 eliminates the combinatorial explosion entirely. Instead of materializing all possible ranges and shipping them to the LLM, V2:

1. Sends each utterance **exactly once** with a precomputed `max_end_utterance_id` boundary
2. The model itself decides which ranges are worth selecting (per the pseudocode algorithm)
3. The boundary constraint comes from the same duration budget (20–40 sec) — but encoded as O(n) values instead of O(n²) candidate rows

From `TRANSCRIPT_TABLE_SCHEMA.md`: *"Precomputed allowed ends: removes need to enumerate or transmit every contiguous span combination (avoids quadratic explosion the model would otherwise scan)"*

| Aspect | V1 | V2 |
|--------|----|----|
| Representation | O(n²) candidate rows with duplicated text | O(n) utterance rows, each with one boundary value |
| Token budget consumed | Up to **128K tokens** of candidates | ~same tokens as the raw transcript |
| Text duplication | Same utterance appears in many overlapping ranges | Each utterance appears exactly once |
| Who decides? | LLM picks from pre-materialized list | LLM evaluates conceptually per pseudocode |

---

## Part 3: V2 Unified Prompt Deep-Dive

The V2 prompt (`prompt.md`) collapses all four calls into one. Let's walk through the key innovations.

---

### 3.1 — Compact Transcript Table Format

**File**: `TRANSCRIPT_TABLE_SCHEMA.md`

The single biggest token savings came from redesigning how we represent the transcript input.

#### Side-by-Side: V1 JSON vs V2 Table

**V1 — Verbose JSON** (one object per utterance):
```json
{"Index": "42", "Speaker": "Sarah", "Start": "00:05:23", "End": "00:05:31", "Utterance": "Let me share the quarterly results"}
{"Index": "43", "Speaker": "Sarah", "Start": "00:05:31", "End": "00:05:38", "Utterance": "We saw a 15% improvement in activation"}
{"Index": "44", "Speaker": "Sarah", "Start": "00:05:38", "End": "00:05:45", "Utterance": "Across all key engagement metrics"}
{"Index": "45", "Speaker": "Sarah", "Start": "00:05:45", "End": "00:05:52", "Utterance": "Which exceeded our original target"}
{"Index": "46", "Speaker": "Sarah", "Start": "00:05:52", "End": "00:05:59", "Utterance": "Let me walk you through the breakdown"}
{"Index": "47", "Speaker": "John", "Start": "00:06:01", "End": "00:06:05", "Utterance": "That's great, can you show the regional data?"}
```

**V2 — Compact Table** (turn-grouped, local IDs, precomputed boundaries):
```
utterance_id|utterance_text|max_end_utterance_id
---|---|---
<t5 Sarah>
u0|Let me share the quarterly results|u4
u1|We saw a 15% improvement in activation|u4
u2|Across all key engagement metrics|u4
u3|Which exceeded our original target|u4
u4|Let me walk you through the breakdown|u4
</t5>
<t6 John>
u0|That's great, can you show the regional data?|u0
</t6>
```

#### What changed:

| Aspect | V1 | V2 |
|--------|----|----|
| Speaker name | Repeated every row | Once per turn block (`<t5 Sarah>`) |
| Timestamps | Every row (`"Start"`, `"End"`) | Removed entirely (resolved downstream) |
| Key names | 5 keys × N rows (`"Index"`, `"Speaker"`, `"Start"`, `"End"`, `"Utterance"`) | 1 global header line |
| Utterance IDs | Global sequential (0, 1, 2, ... 500) | Local per-turn, reset to u0 (small numbers) |
| Extractive boundaries | Computed by LLM (entire Call 2) | `max_end_utterance_id` column — precomputed |

#### The `max_end_utterance_id` innovation

This is the column that does the work that **an entire LLM call used to do**.

In V1, the upstream system pre-enumerated all possible extractive ranges and sent them to Call 2 for the LLM to pick from. In V2, we precompute the valid boundary for each starting utterance and bake it directly into the input:

```
u2|Across all key engagement metrics|u4
```

This row tells the model: "If you start an extractive clip at u2, you can extend it up to u4 (inclusive) — but no further." The boundary comes from a precomputed duration budget (~40 seconds of audio). The model doesn't need to enumerate candidates — it just reads the constraint directly from the input.

> **Key Insight**: *"The `max_end_utterance_id` column does the work that an entire LLM call used to do. We precompute valid extractive boundaries and bake them into the input."*

#### The token math: why this matters

This column is the direct answer to the [combinatorial candidate explosion](#5-combinatorial-candidate-explosion) described in Section 2.2. The key insight is that encoding the *constraint* (max boundary) is O(n), while enumerating the *candidates* is O(n²):

| | V1: Candidate enumeration | V2: Boundary encoding |
|-|---------------------------|----------------------|
| **What's sent** | ~2,000+ candidate rows, each carrying a string array of overlapping utterance texts | ~500 utterance rows, each with one `max_end_utterance_id` value |
| **Tokens consumed** | Up to **128K tokens** (greedily packed to the limit) | ~same tokens as the raw transcript itself |
| **Information content** | Redundant: the same utterance text appears in dozens of overlapping ranges | Lossless: each utterance appears exactly once; the boundary column encodes the same duration constraint |
| **Complexity** | O(n²) per topic | O(n) total |

The same 20–40 second duration budget drives both approaches. V1 *enumerates* every range that fits; V2 *encodes* the upper bound and lets the model decide. Same constraint, fundamentally different representation cost.

---

### 3.2 — Pseudocode Algorithm

**File**: `prompt.md`, lines 78–186

Instead of prose instructions like V1's *"Please identify those key topics and write a short summary of each topic"*, V2 gives the model an **executable algorithm in pseudocode**:

```python
def generate_highlights(transcript_markdown):
    """Main pipeline: segment → narrate → extract → rank → build narrative."""
    turns = parse_turn_markers(transcript_markdown)

    substantive_start = skip_intro_content(turns)
    substantive_end = skip_closing_content(turns)
    topics = segment_into_topics(turns, substantive_start, substantive_end, min=1, max=7)
    for topic in topics:
        topic.narration = write_narration(topic)
        topic.playback_anchor = choose_playback_anchor(topic)
        topic.topic_id = generate_topic_id()
    topics[-1].narration = add_natural_closure(topics[-1].narration)

    topic_order = create_chronological_topic_order(topics)

    candidates = enumerate_valid_extractive_candidates(turns)
    candidates = filter_by_content_quality(candidates)
    selected = select_best_extractives_within_topic_bounds(
        candidates, topics, max_total=10, max_per_topic=2
    )
    selected = remove_overlaps(selected)
    ranking = rank_extractives(selected, by=["interest_level", "clarity", "self_containment"])
    final_narrative = build_narrative_rows(topics, selected, topic_order)

    self_checks = validate_all_constraints(topics, selected, ranking, final_narrative, topic_order)

    return MeetingHighlightsOutput(
        abstractive_topics=topics,
        topic_order=topic_order,
        extractive_ranges=selected,
        ranking=ranking,
        final_narrative=final_narrative,
        self_checks=self_checks
    )
```

#### Side-by-Side: V1 Prose vs V2 Pseudocode

**V1 — Prose instructions** (Call 1, abstractive selection):
```
- Please identify those key topics and write a short summary of each topic.
  These topics will be the abstractive sections of the highlights video, and
  the summaries will be the voice-overs for these sections.
- Make sure that all the main topics of the meeting are covered, each topic
  as a different abstractive section. Ensure each topic is distinct and
  non-overlapping.
- Concentrate only on the content that relates to the meeting's purpose and
  skip any meta-content, personal, logistical, agenda, or introductory content.
- Provide no more than 7 abstractive sections. If necessary, merge consecutive
  sections in order to make sure that this instruction is fulfilled.
```

**V2 — Pseudocode** (same logic, unambiguous):
```python
substantive_start = skip_intro_content(turns)
substantive_end = skip_closing_content(turns)
topics = segment_into_topics(turns, substantive_start, substantive_end, min=1, max=7)
```

Three lines vs. a paragraph. And the pseudocode leaves **zero room for creative interpretation**:

- `skip_intro_content` — unambiguous: skip the intro
- `skip_closing_content` — unambiguous: skip the closing
- `min=1, max=7` — explicit bounds, not a guideline

#### Why pseudocode beats prose

| Prose | Pseudocode |
|-------|-----------|
| "Please identify those key topics" | `segment_into_topics(turns, ...)` |
| "Provide no more than 7" | `max=7` |
| "Ensure each topic is distinct and non-overlapping" | Enforced by `validate_all_constraints()` |
| "Arrange topics in chronological order" | `create_chronological_topic_order(topics)` |
| "Rank the candidates by quality" | `rank_extractives(selected, by=["interest_level", "clarity", "self_containment"])` |

Pseudocode provides:
- **Unambiguous execution order** — function calls make dependencies explicit
- **Named intermediate variables** — clear data flow (`candidates` → `selected` → `ranking` → `final_narrative`)
- **Activates "code execution" mode** — the model reasons systematically instead of creatively
- **Single source of truth** — the V1 pipeline spread these instructions across 4 separate prompts

> **Key Insight**: *"When you give an LLM prose, it interprets creatively. When you give it pseudocode, it executes systematically."*

---

### 3.3 — Copy-Then-Parse Pattern

**File**: `prompt.md`, lines 43–53

This is the anti-hallucination technique that reduced extractive ID errors to near zero.

The problem: when models output IDs (turn numbers, utterance IDs), they sometimes hallucinate values that don't exist in the input. In V1, each call parsed the previous call's markdown table output, and ID mismatches propagated through the pipeline.

V2 forces a **chain-of-thought grounding** pattern: copy first, then derive.

#### The Pattern

**Step 1 — Copy EXACTLY** (character-for-character from input):
```
selected_turn_opening_tag_raw_copy_from_input: "<t5 Sarah>"
raw_pipe_delimited_table_row_copied_from_input: "u2|Across all key engagement metrics|u4"
```

**Step 2 — Parse from copied strings** (derive values from what was copied):
```
speaker_name: "Sarah"           ← parsed from "<t5 Sarah>"
turn_id: 5                      ← strip 't', convert to int
start_utterance_id: 2           ← strip 'u' from first column
max_end_utterance_id: 4         ← strip 'u' from third column
```

#### How this appears in the output schema

From `prompt_output_schema.md` — the `selected_start_position` object in each extractive range:

```json
{
  "selected_turn_opening_tag_raw_copy_from_input": "<t5 Sarah>",
  "speaker_name": "Sarah",
  "turn_id": 5,
  "selected_start_position": {
    "raw_pipe_delimited_table_row_copied_from_input": "u2|Across all key engagement metrics|u4",
    "start_utterance_id_parsed_from_first_column": 2,
    "max_end_utterance_id_parsed_from_third_column": 4
  },
  "candidate_end_utterance_ids_within_max_boundary": [
    {"is_within_max_allowed_boundary": true, "utterance_id": 2},
    {"is_within_max_allowed_boundary": true, "utterance_id": 3},
    {"is_within_max_allowed_boundary": true, "utterance_id": 4}
  ],
  "final_chosen_end_utterance_id_from_candidates": 3
}
```

The model must first **copy** the raw tag and row verbatim, then **parse** integer values from what it copied. If it tries to hallucinate a turn ID of 7 when it copied `<t5 Sarah>`, the inconsistency is immediately visible — both to the model itself (self-correction) and to downstream validation.

> **Key Insight**: *"Chain-of-thought grounding — copy first, derive second. This reduced extractive ID hallucination to near zero."*

---

### 3.4 — Structured JSON Output

#### V1: Markdown tables in `<Copilot Response>` tags

Each V1 call produced output like:
```
<Copilot Response>
|Topic title|Topic Utterance Range|Narration|Playback Video Start Utterance Index|Is topic taken from meeting intro|Category|Level of interest|
|-----------|---------------------|---------|------------------------------------|---------------------------------|--------|-----------------|
|Q2 Results|42-67|The team reviewed quarterly results...|45|False|exciting news|85|
|Architecture|68-105|A technical discussion about...|78|False|other|72|
</Copilot Response>
```

Parsed with regex between calls. Fragile, error-prone, no type safety.

#### V2: Strict JSON schema with validation

From `prompt_output_schema.md` — a strict JSON schema with:

```json
{
  "title": "MeetingHighlightsOutput",
  "type": "object",
  "required": ["abstractive_topics", "topic_order", "extractive_ranges",
               "ranking", "final_narrative", "self_checks"],
  "additionalProperties": false,
  "properties": {
    "abstractive_topics": {
      "type": "array",
      "items": {
        "type": "object",
        "required": ["topic_id", "topic_title", "start", "end", "narration",
                     "playback_start", "is_intro", "category", "interest_level"],
        "additionalProperties": false,
        "properties": {
          "topic_id": {
            "type": "string",
            "pattern": "^[A-Z]{3}$"
          },
          "category": {
            "type": "string",
            "enum": ["important feedback", "exciting news or declaration",
                     "part of a demo", "decision rationale", "problem analysis",
                     "action planning", "design explanation", "status update",
                     "technical discussion", "risk assessment",
                     "priority discussion", "knowledge sharing", "other"]
          }
        }
      }
    }
  }
}
```

**6 top-level sections** in one output — replacing 4 separate markdown tables from 4 separate calls:

| Section | Role | What it replaces |
|---------|------|-----------------|
| `abstractive_topics` | Chain-of-thought | Call 1 output |
| `topic_order` | Chain-of-thought | Implicit ordering across calls |
| `extractive_ranges` | Chain-of-thought | Call 2 output |
| `ranking` | Chain-of-thought | Call 3 output |
| `final_narrative` | **Deliverable** | Call 4 output |
| `self_checks` | Validation | Nothing — new in V2 |

Only `final_narrative` is consumed by the product — it contains the playback coordinates and narration text that drive video assembly. The other four output fields are structured chain-of-thought: intermediate reasoning steps that guide the model through segmentation, selection, and ranking before it commits to the final output.

Benefits: `additionalProperties: false` prevents hallucinated fields, `enum` constraints lock down categorical values, `pattern` constraints validate ID formats.

---

### 3.5 — Consolidated Rules & Self-Checks

#### RAI Deduplication

**V1**: ~20 lines of RAI rules × 3 prompts = ~60 lines total

```
# RAI Rules (repeated in Calls 1, 2, and 4):
- You will **never** provide profiling information on people's background and
  demography (e.g., gender, religion, origin, or language proficiency).
- To refer to people, you will **always** use the singular "they" pronoun or
  a person's name (if it is known) instead of the pronouns "he" and "she".
  You don't know people's genders, and people's names may be very misleading
  with regard to gender (e.g., in different parts of the world, names such as
  "Lan" and "George" may refer to both men and women). You will never take
  chances with regard to pronouns so you will use the singular "they".
- You will **never** speculate or infer anything about the participants' roles
  and responsibilities...
- You will **never** speculate or infer anything about people's feelings,
  attitude, or how they treat each other...
- While you may perfectly well provide information on what the participants
  (and others) say or do, you will never provide any type of feedback or
  judgment *about* them (neither good or bad):
- Feelings -- You will **never** point out anyone's feelings or attitude...
- Conduct -- You will **never** point out anyone's conduct or behavior...
- There are exactly 3 exceptions to the above...
- Moreover, You will be cautious enough not to repeat or follow along with
  any assumption on people's feelings or conduct...
- You will **never** generate biased, racist, violence, sexist, religious
  bias, political bias, insults, gender-biased or otherwise inappropriate
  content.
```

**V2**: 5 bullet points, same coverage, stated once:

```
## 5. SAFETY (RAI) RULES
- No gender inference; use speaker names directly from the turn tags.
- No role/seniority/emotion/conduct speculation unless explicitly stated.
- No profiling (religion, ethnicity, origin).
- Repeat evaluative wording only if verbatim in transcript.
- No fabrication or alteration of utterance text.
```

Same policy. 5 lines instead of 60. The key difference: V2's rules are **prescriptive** ("use speaker names directly from turn tags") rather than **verbose-prohibitive** ("You don't know people's genders, and people's names may be very misleading with regard to gender (e.g., in different parts of the world...)").

#### Self-Checks: The Model Validates Its Own Output

V2 introduces a `self_checks` section (prompt lines 233–246) where the model evaluates its own output against a set of constraints:

```
## 6. SELF-CHECKS (true ONLY if satisfied)
- topic_non_overlap: Topics strictly ascending, no shared utterances. A.end < B.start.
- unique_topic_ids: All topic_id values are unique.
- one_final_highlight_per_topic: Each topic appears exactly once in final_narrative.
- extractive_non_overlap: No shared (turn_id, utterance_id).
- extractive_within_topic_bounds: All extractives within their topic's [start, end].
- max_two_extractives_per_topic: ≤2 extractives per topic.
- all_extractives_ranked: Each extractive once, ranks 1..N contiguous.
- final_narrative_alignment: Rows match topics, correct extractive or null.
- rai_policy_pass: Safety compliance.
- turn_boundary_compliance: Respects start.max_end_utterance_id.
- topic_order_compliance: topic_order preserves chronological transcript order.
- narration_excludes_transition: narration_for_final_output does not contain transition_sentence.
```

These map directly to boolean fields in the output schema's `self_checks` object:

```json
"self_checks": {
  "topic_non_overlap": true,
  "extractive_non_overlap": true,
  "extractive_within_topic_bounds": true,
  "max_two_extractives_per_topic": true,
  "all_extractives_ranked": true,
  "final_narrative_alignment": true,
  "rai_policy_pass": true,
  "turn_boundary_compliance": true,
  "topic_order_compliance": true,
  "narration_excludes_transition": true
}
```

This enables **automated quality gates**: if any check is `false`, the system can programmatically retry or reject — no human review needed. The model is its own first-line validator.

> **Key Insight**: *"Self-checks turn the model into its own first-line validator. This is the difference between a prototype and a production system."*

---

### 3.6 — End-to-End Example: Input → Output

To make this concrete, here's a fabricated but realistic short transcript and the V2 output it would produce.

#### Input: Compact Transcript Table

```
utterance_id|utterance_text|max_end_utterance_id
---|---|---
<t0 Sarah>
u0|Good morning everyone, let's get started|u0
u1|Today we're covering two things, the Q2 metrics and the new onboarding flow|u1
</t0>
<t1 Sarah>
u0|So looking at Q2, activation rates are up 15% quarter over quarter|u4
u1|The biggest driver was the simplified setup wizard we shipped in April|u4
u2|We're seeing particularly strong numbers in the EMEA region|u4
u3|Which was previously our weakest market|u4
u4|So the localization investment is clearly paying off|u4
</t1>
<t2 John>
u0|That's impressive, what's the retention picture looking like|u0
</t2>
<t3 Sarah>
u0|Retention is also trending up, 30-day retention went from 62% to 71%|u2
u1|The key factor is the new onboarding checklist|u2
u2|Users who complete it have 3x higher retention|u2
</t3>
<t4 Mark>
u0|I want to walk through the new onboarding flow we're proposing|u5
u1|The core idea is progressive disclosure|u5
u2|Instead of showing all features at once, we surface them as the user needs them|u5
u3|We tested this with 200 users last month|u5
u4|Completion rates went from 45% to 78%|u5
u5|And average time to first value dropped from 12 minutes to 4|u5
</t4>
<t5 Sarah>
u0|This is really promising, let's plan to ship this in the July release|u1
u1|Mark, can you have the PRD ready by end of next week|u1
</t5>
<t6 Mark>
u0|Absolutely, I'll have it ready by Friday|u0
</t6>
<t7 Sarah>
u0|Great, thanks everyone for the productive discussion|u0
</t7>
```

#### Output: V2 JSON (abbreviated)

```json
{
  "abstractive_topics": [
    {
      "topic_id": "QMR",
      "topic_title": "Q2 Metrics Review",
      "start": {"turn_id": 1, "utterance_id": 0},
      "end": {"turn_id": 3, "utterance_id": 2},
      "narration": "The session opened with Sarah presenting Q2 activation metrics, reporting a 15% quarter-over-quarter increase driven by the simplified setup wizard. Retention also improved significantly, with 30-day rates climbing from 62% to 71%.",
      "playback_start": {"turn_id": 1, "utterance_id": 1},
      "is_intro": false,
      "category": "status update",
      "interest_level": 85
    },
    {
      "topic_id": "NOF",
      "topic_title": "New Onboarding Flow",
      "start": {"turn_id": 4, "utterance_id": 0},
      "end": {"turn_id": 6, "utterance_id": 0},
      "narration": "Building on the retention data, Mark presented a redesigned onboarding flow based on progressive disclosure. Testing showed completion rates jumping from 45% to 78%, with time-to-first-value dropping from 12 to 4 minutes. The team committed to shipping in the July release.",
      "playback_start": {"turn_id": 4, "utterance_id": 2},
      "is_intro": false,
      "category": "design explanation",
      "interest_level": 90
    }
  ],
  "topic_order": ["QMR", "NOF"],
  "extractive_ranges": [
    {
      "topic_id": "QMR",
      "selected_turn_opening_tag_raw_copy_from_input": "<t1 Sarah>",
      "speaker_name": "Sarah",
      "turn_id": 1,
      "selected_start_position": {
        "raw_pipe_delimited_table_row_copied_from_input": "u0|So looking at Q2, activation rates are up 15% quarter over quarter|u4",
        "start_utterance_id_parsed_from_first_column": 0,
        "max_end_utterance_id_parsed_from_third_column": 4
      },
      "candidate_end_utterance_ids_within_max_boundary": [
        {"is_within_max_allowed_boundary": true, "utterance_id": 1},
        {"is_within_max_allowed_boundary": true, "utterance_id": 3},
        {"is_within_max_allowed_boundary": true, "utterance_id": 4}
      ],
      "final_chosen_end_utterance_id_from_candidates": 4,
      "selection_reason": "status update",
      "self_containment_score": 92,
      "is_engaging": true
    },
    {
      "topic_id": "NOF",
      "selected_turn_opening_tag_raw_copy_from_input": "<t4 Mark>",
      "speaker_name": "Mark",
      "turn_id": 4,
      "selected_start_position": {
        "raw_pipe_delimited_table_row_copied_from_input": "u0|I want to walk through the new onboarding flow we're proposing|u5",
        "start_utterance_id_parsed_from_first_column": 0,
        "max_end_utterance_id_parsed_from_third_column": 5
      },
      "candidate_end_utterance_ids_within_max_boundary": [
        {"is_within_max_allowed_boundary": true, "utterance_id": 3},
        {"is_within_max_allowed_boundary": true, "utterance_id": 4},
        {"is_within_max_allowed_boundary": true, "utterance_id": 5}
      ],
      "final_chosen_end_utterance_id_from_candidates": 5,
      "selection_reason": "design explanation",
      "self_containment_score": 95,
      "is_engaging": true
    }
  ],
  "ranking": [
    {
      "topic_id": "NOF", "turn_id": 4, "start_utterance_id": 0,
      "end_utterance_id": 5, "clarity_score": 95,
      "self_containment_score": 95, "interest_level": 90, "overall_rank": 1
    },
    {
      "topic_id": "QMR", "turn_id": 1, "start_utterance_id": 0,
      "end_utterance_id": 4, "clarity_score": 90,
      "self_containment_score": 92, "interest_level": 85, "overall_rank": 2
    }
  ],
  "final_narrative": [
    {
      "topic_id": "QMR",
      "topic_title": "Q2 Metrics Review",
      "narration_for_final_output": "The session opened with Sarah presenting Q2 activation metrics, reporting a 15% quarter-over-quarter increase driven by the simplified setup wizard. Retention also improved significantly, with 30-day rates climbing from 62% to 71%.",
      "playback_start": {"turn_id": 1, "utterance_id": 1},
      "extractive": {
        "turn_id": 1, "start_utterance_id": 0, "end_utterance_id": 4,
        "transition_sentence": "Let's hear how Sarah presented the Q2 numbers."
      }
    },
    {
      "topic_id": "NOF",
      "topic_title": "New Onboarding Flow",
      "narration_for_final_output": "Building on the retention data, Mark presented a redesigned onboarding flow based on progressive disclosure. Testing showed completion rates jumping from 45% to 78%, with time-to-first-value dropping from 12 to 4 minutes. The team committed to shipping in the July release, bringing this discussion to a close.",
      "playback_start": {"turn_id": 4, "utterance_id": 2},
      "extractive": null
    }
  ],
  "self_checks": {
    "topic_non_overlap": true,
    "extractive_non_overlap": true,
    "extractive_within_topic_bounds": true,
    "max_two_extractives_per_topic": true,
    "all_extractives_ranked": true,
    "final_narrative_alignment": true,
    "rai_policy_pass": true,
    "turn_boundary_compliance": true,
    "topic_order_compliance": true,
    "narration_excludes_transition": true
  }
}
```

Notice the copy-then-parse pattern in action: the model first copies `"<t1 Sarah>"` and `"u0|So looking at Q2, activation rates are up 15% quarter over quarter|u4"` verbatim, then derives `speaker_name: "Sarah"`, `turn_id: 1`, `start_utterance_id: 0`, `max_end_utterance_id: 4` from those copies.

---

## Part 4: Results & Lessons

---

### 4.1 — Quantitative Results

| Metric | Before (V1) | After (V2) | Reduction |
|--------|-------------|------------|-----------|
| LLM calls per meeting | 4 | 1 | 75% |
| Input tokens | Baseline | -60% | 60% |
| GPU capacity needed | ~600 A100s | ~180 A100s | ~70% |
| Overall COGS | Baseline | -70% | ~70% |

**Quality validation** via CoMet evaluation platform:
- **Grounding** (factual accuracy): remained very high — no regression
- **Coverage** (how much important content is captured): ~75–80%, matching V1
- Internal reviewers **preferred V2** for cohesion and narrative flow

**Business impact**:
- Unblocked private preview (October 22, 2025)
- Enabled GA rollout within approved GPU quota
- GPU ask trimmed from ~600 to ~180 — within existing capacity pool

> *"V2 is a compact prompt with only one LLM request… Evyatar was able to reduce the amount of input and output tokens, so it dramatically reduces the GPUs needed."*
> — Eli Lekhtser

---

### 4.2 — Five Lessons for Your Next LLM Pipeline

---

#### Lesson 1: Challenge the multi-call assumption

**Before**: "This task is too complex for one call — we need to break it into steps."

**After**: Modern models can handle complex multi-step reasoning in a single call if you structure the prompt well. The V2 prompt does topic segmentation, narration writing, extractive selection, ranking, narrative synthesis, and self-validation — all in one pass. The key is giving the model an **explicit algorithm** rather than hoping it figures out the steps.

Don't reach for multi-call pipelines as a first instinct. First ask: can I structure a single prompt to do this?

---

#### Lesson 2: Input format is a cost lever

**Before**: Verbose JSON — every utterance repeats 5 key names, speaker name, timestamps.

**After**: Compact table — speaker name once per turn block, timestamps removed, local IDs.

Optimizing input representation saved more tokens than any prompt wording change. Before optimizing what you *say* to the model, optimize what you *show* the model. The transcript is the largest part of the input — shrinking it by 60% has a bigger impact than shaving words off the instructions.

---

#### Lesson 3: Pseudocode beats prose

**Before**: *"Please identify those key topics and write a short summary of each topic. These topics will be the abstractive sections of the highlights video..."*

**After**: `topics = segment_into_topics(turns, substantive_start, substantive_end, min=1, max=7)`

Prose is ambiguous — it invites creative interpretation. Pseudocode is unambiguous — it specifies exact behavior. Function calls make dependencies explicit, named variables create clear data flow, and parameters encode constraints as values rather than guidelines.

When you need an LLM to follow a complex procedure, write code, not English.

---

#### Lesson 4: Force the model to ground itself

**Before**: The model outputs IDs directly — `"turn_id": 5, "start_utterance_id": 2` — with no grounding step. Hallucinated IDs propagate silently.

**After**: Copy-then-parse. The model must first copy the raw string verbatim (`"<t5 Sarah>"`, `"u2|text|u4"`), then derive integer values from those copies. Inconsistencies between the copy and the parse are self-evident.

Any time your LLM output needs to reference specific parts of the input (IDs, names, values), make the model **copy the source first, then extract**. It's chain-of-thought for structured data.

---

#### Lesson 5: Self-checks enable automation

**Before**: No automated validation. Quality issues caught by human review or not at all.

**After**: The model outputs `self_checks` — a set of boolean fields that programmatically validate constraints like topic non-overlap, extractive boundary compliance, and narrative alignment.

```json
"self_checks": {
  "topic_non_overlap": true,
  "turn_boundary_compliance": true,
  "extractive_within_topic_bounds": true,
  ...
}
```

If any check is `false`, the system can automatically retry or reject — no human in the loop. Self-checks turn a prototype into a production system. They're the difference between "this usually works" and "this provably meets our constraints or tells us it doesn't."

---

## Q&A — Seed Questions

If the audience needs a prompt:

1. **"How did you decide what to precompute vs. leave for the model?"** — The `max_end_utterance_id` is the prime example. Anything that can be computed deterministically from the audio (like duration budgets) should be precomputed. Anything that requires semantic judgment (like "is this clip engaging?") stays with the model.

2. **"Did you try intermediate approaches (2 calls, 3 calls)?"** — We went directly from 4 to 1. The pseudocode structure made it feasible to combine everything in a single pass. The key enabler was the precomputed boundaries — without `max_end_utterance_id`, we'd still need a separate call for extractive selection.

3. **"How do you handle cases where self-checks report `false`?"** — Today it's a log and something we can use to evaluate quality locally for optimization.
