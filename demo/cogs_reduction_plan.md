# COGS Reduction Demo Script Plan

## File: demo/2b_cogs_reduction.txt

This document contains the complete script for the COGS reduction demo segment to be inserted between [`demo/2_generation.txt`](demo/2_generation.txt) and [`demo/3_teams.txt`](demo/3_teams.txt).

---

## Demo Script Content

### Slide 19 (00:02:16,000 --> 00:02:22,000)
Achieving cost efficiency while maintaining quality was a critical challenge for scaling Meeting Highlights to global availability.

### Slide 20 (00:02:22,400 --> 00:02:28,800)
The initial implementation required four sequential calls to large language models for each meeting, creating significant computational costs.

### Slide 21 (00:02:29,200 --> 00:02:36,400)
The first prompt analyzed the transcript to segment it into key topics, identifying one to seven distinct discussion areas within each meeting.

### Slide 22 (00:02:36,800 --> 00:02:44,000)
The second prompt extracted engaging verbatim moments from the meeting, selecting up to ten self-contained utterance blocks that captured important feedback, exciting news, or demonstration segments.

### Slide 23 (00:02:44,400 --> 00:02:51,200)
The third prompt ranked these extracted moments by quality, assessing clarity, intelligibility, self-containment, and overall interest level.

### Slide 24 (00:02:51,600 --> 00:02:59,200)
The fourth prompt synthesized everything into a cohesive narrative, rephrasing summaries and creating smooth transitions between abstractive and extractive sections.

### Slide 25 (00:03:00,000 --> 00:03:07,600)
Through architectural innovation, the four-step pipeline was collapsed into a single unified prompt—preserving the algorithmic flow (segment→narrate→extract→rank→compose) and improving COGs via fewer tokens and a single model invocation.

### Slide 26 (00:03:08,000 --> 00:03:15,200)
The new unified prompt processes transcripts through the same logical flow: segment into topics, write narrations, extract verbatim ranges, rank by quality, and build the final narrative.

### Slide 27 (00:03:15,600 --> 00:03:22,400)
This consolidation also significantly reduced the number of input tokens per meeting by streamlining what is sent to the model—cutting total processed tokens and lowering COGs even more.

### Slide 28 (00:03:23,200 --> 00:03:30,000)
The impact was substantial: reducing LLM calls from four to one represents a seventy-five percent reduction in model invocations per meeting.

### Slide 29 (00:03:30,400 --> 00:03:38,400)
Based on capacity estimations, the original implementation would have required approximately six hundred GPUs to support global availability, but the optimized approach reduced this to around two hundred GPUs.

### Slide 30 (00:03:38,800 --> 00:03:45,600)
This optimization cut COGs by more than fifty percent, making the feature economically viable for worldwide rollout.

### Slide 31 (00:03:46,400 --> 00:03:53,600)
Rigorous evaluation shows the unified prompt produces higher‑quality highlights than the previous multi‑prompt version, with internal reviewers and early users strongly preferring its output.

### Slide 32 (00:03:54,000 --> 00:04:01,200)
These cost and quality improvements directly unblock the private preview release and pave the way for general availability within approved capacity constraints.

---

## Key Technical Points Covered

### V1 Four-Prompt Architecture
1. **Abstractive Topics** ([`highlights_abstractives`](v1/HighlightsPromptMaper.py:13))
   - Segments transcript into 1-7 topics
   - Generates narration summaries
   - Selects video playback anchors
   - Categorizes topics and assesses interest levels

2. **Extractive Selection** ([`highlights_extractives`](v1/HighlightsPromptMaper.py:140))
   - Identifies engaging verbatim moments
   - Selects up to 10 self-contained blocks
   - Filters by content type (feedback/news/demo)
   - Ensures coherent boundaries

3. **Quality Ranking** ([`highlights_extractive_ranking`](v1/HighlightsPromptMaper.py:230))
   - Assesses clarity and intelligibility
   - Evaluates self-containment
   - Scores interest level (0-100)
   - Provides overall quality ranking

4. **Final Narrative** ([`highlights_final`](v1/HighlightsPromptMaper.py:318))
   - Rephrases narrations for story flow
   - Creates transition sentences
   - Unifies abstractive + extractive sections
   - Ensures gender-neutral language

### V2 Unified Prompt Innovation
- **Single-pass processing**: All operations in one LLM call
- **Algorithm preservation**: Same logical flow (segment→narrate→extract→rank→build)
- **Token optimization**: Significant reduction in input and output tokens per meeting, lowering COGs
- **Quality improvement**: Enhanced output quality based on user feedback

### Impact Metrics
- **LLM Calls**: 4 → 1 (75% reduction)
- **GPU Requirements**: ~600 → ~200 (67% reduction)  
- **COGs**: 50%+ cost savings
- **Quality**: Initial feedback strongly positive, with V2 generating superior highlights compared to V1

### Business Impact
- Unblocks private preview release
- Enables GA rollout within capacity constraints
- Met Capacity Council requirements
- Delivered efficiency gains with quality improvement

---

## Timeline Context
- **August 2025**: COGS identified as primary cost driver
- **September 2025**: V2 unified prompt designed and implemented
- **September 30, 2025**: PR with new prompt ready
- **October 2025**: Quality validation completed
- **Result**: Feature released to private preview with approved GPU allocation

---

## References
- [`v2 goal and efforts.md`](v2 goal and efforts.md) - Detailed contribution summary
- [`v1/HighlightsPromptMaper.py`](v1/HighlightsPromptMaper.py) - Original four-prompt implementation
- [`v2/prompt.md`](v2/prompt.md) - Unified prompt architecture