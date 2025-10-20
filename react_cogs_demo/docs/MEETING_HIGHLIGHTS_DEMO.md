# Meeting Highlights Demo

## Overview

The Meeting Highlights demo is a comprehensive presentation about the Meeting Highlights feature and its COGS (Cost of Goods Sold) optimization. The presentation is designed for an all-hands audience and explains both what Meeting Highlights is as a product and the technical optimizations that reduced computational costs by over 70%.

## Demo Structure

**Total Slides**: 15 slides across 9 chapters  
**Duration**: ~4:07 minutes (audio only, actual runtime longer with delays)  
**Default Mode**: Narrated

### Chapter Breakdown

#### Chapter 0: Introduction (1 slide)
- **Ch0_S1_Intro** - Opening title slide

#### Chapter 1: What is Meeting Highlights (3 slides)
- **Ch1_S1_ProductIntro** - Introduction to the feature
- **Ch1_S2_BizChatDemo** - Accessing highlights through BizChat with video demonstration
- **Ch1_S3_SharePointDemo** - Accessing highlights through SharePoint with video demonstration

#### Chapter 2: Team Collaboration (1 slide, 9 segments)
- **Ch2_S1_TeamCollaboration** - Multi-segment slide showing:
  - Team collaboration overview with 6+ teams (ODSP, MSAI-Hive, Clipchamp, Loop, BizChat, Teams)
  - Dual visualization: ReactFlow architecture diagram + Backend Flow
  - Progressive reveal of each team's role
  - Total 9 segments with synchronized narration

#### Chapter 4: Highlight Types (1 slide)
- **Ch4_S1_HighlightTypes** - Abstractive highlights with key moments, timestamps, and narrative text

#### Chapter 5: COGS Challenge (1 slide)
- **Ch5_S1_ChallengeFraming** - Initial metrics showing the problem:
  - 4 LLM calls required
  - ~600 GPUs needed
  - High token usage
  - Stacked complexity visualization

#### Chapter 6: Optimization Solution (2 slides)
- **Ch6_S1_UnifiedConvergence** - Convergence to unified single prompt (4→1 calls)
- **Ch6_S4_TokenOptimization** - 60% input token reduction explanation

#### Chapter 7: Business Impact (3 slides)
- **Ch7_S2_GPUReduction** - GPU optimization (600→200, 67% reduction)
- **Ch7_S4_QualityComparison** - Quality metrics (internal reviewers strongly prefer unified output)
- **Ch7_S5_PathToGA** - Path to general availability roadmap

#### Chapter 8: User Reception (1 slide)
- **Ch8_S1_UserSatisfaction** - User satisfaction metrics:
  - 80% rate as extremely/very useful
  - 96% likely to use again
  - 3-5 minute typical video length

#### Chapter 9: Closing (2 slides)
- **Ch9_S1_Testimonials** - 4 user testimonials with animated cards
- **Ch9_S2_ClosingThanks** - Thank you slide with:
  - Feedback email (meetinghlfeedback@microsoft.com)
  - CTA: "Try Meeting Highlights - Available now in BizChat & SharePoint"

## Key Metrics

### Product Metrics
- **80%** of users rate Meeting Highlights as extremely/very useful
- **96%** of users likely to use again
- **3-5 minutes** typical highlight video length

### Optimization Metrics
- **75%** reduction in LLM calls (4 → 1)
- **60%** reduction in input tokens
- **67%** reduction in GPU capacity (~600 → ~200 GPUs)
- **70%+** estimated COGS reduction overall

## Target Audience

The presentation is designed for an all-hands meeting where:
- Many attendees are **not familiar** with Meeting Highlights feature
- Focus is on **product value** and **business impact**
- Technical details are high-level, not implementation-specific
- Emphasis on user satisfaction and cost optimization enabling global rollout

## Content Philosophy

### Streamlined for All-Hands
The presentation was intentionally simplified from a more technical version:
- Removed detailed prompt explanations (originally 6 slides → 1 slide in Chapter 5)
- Removed redundant architecture overview (Chapter 3 deleted)
- Removed intermediate algorithm flow details (Chapter 6: 5 slides → 2 slides)
- Removed redundant metrics slides (Chapter 7: 5 slides → 3 slides)
- **Result**: 15 total slides (down from 23), clearer narrative flow

### Business Impact Focus
- Starts with "what" (product introduction with videos)
- Shows "who" (team collaboration)
- Presents "challenge" (COGS problem)
- Explains "solution" (optimization approach)
- Proves "success" (metrics and user feedback)
- Ends with "call to action" (try it yourself)

## Assets

### Videos
Located in `public/videos/meeting-highlights/`:
- **meeting_highlights_usage_in_bizchat.mp4** - Demonstrates CIQ interface and player
- **meeting_highlights_usage_in_sharepoint.mp4** - Shows SharePoint integration

### Images
Located in `public/images/meeting-highlights/`:
- **meeting_highlights_thumbnail.jpeg** - Demo thumbnail (16:9)
- **logos/** - Team/product logos:
  - BizChat.png
  - ClipChamp.png
  - Loop.png
  - msai-hive.png
  - odsp.png
  - sharepoint.png
  - Teams.png

### Audio
Located in `public/audio/meeting-highlights/c{0-9}/`:
- Generated via TTS from narration text
- WAV format, 24kHz mono
- ~65 audio segments total
- Smart caching tracks changes

## Notable Implementation Details

### Multi-Segment Slide (Chapter 2)
The team collaboration slide uses 9 segments for progressive reveal:
- Each segment highlights a different team
- ReactFlow diagram updates dynamically
- Backend flow auto-scrolls to show new items
- Synchronized with narration timing
- Most complex slide in the presentation

### Video Integration
Both BizChat and SharePoint demos use VideoPlayer component:
- Freeze-on-end playback (pauses on last frame)
- Synchronized with slide segments
- Responsive sizing
- Smooth animations

### Narration Synchronization
All slides carefully synchronized with TTS audio:
- Segment timing matches narration
- Visual reveals aligned with speech
- Natural pacing for comprehension
- Total audio duration: 247 seconds

## Development History

### Major Milestones
1. **Initial Creation** - Comprehensive technical presentation (23 slides)
2. **All-Hands Simplification** - Reduced to 15 slides for broader audience
3. **Video Integration** - Added BizChat and SharePoint demo videos
4. **Chapter Organization** - Split into chapter-based files for maintainability
5. **Multi-Demo Migration** - Moved into multi-demo architecture
6. **TTS Integration** - Full narration with smart caching
7. **Final Polish** - Closing slide with CTA and feedback email

### Key Decisions
- **Abstractive over Extractive**: Focus on abstractive highlights (more impactful)
- **Business over Technical**: Emphasize COGS reduction and user value
- **Visual over Text**: Use animations, diagrams, and videos
- **Progressive Reveal**: Multi-segment slides for better pacing
- **Call to Action**: End with invitation to try the feature

## Related Documentation

- **Product Overview**: `highlights_demo/context/what is meeting highlights.md`
- **Team Collaboration**: `highlights_demo/context/team collaboration.md`
- **Architecture**: `highlights_demo/context/architecture comprehensive.md`
- **V2 Implementation**: `highlights_demo/context/v2/` directory
- **User Access**: `highlights_demo/context/how can users try meeting highlights.md`

## Demo-Specific Commands

```bash
# Generate TTS audio for Meeting Highlights only
npm run tts:generate -- --demo meeting-highlights

# Calculate duration
npm run tts:duration -- --demo meeting-highlights

# View duration report
cat duration-report-meeting-highlights.json
```

## Presentation Tips

### For Narrated Mode
- Let it run automatically (~4 minutes)
- Hide interface for recording
- Full audio narration provided
- Best for unattended playback

### For Manual Mode
- Use arrow keys to navigate
- Review slides at your own pace
- No audio distractions
- Good for preparation/review

### For Manual+Audio Mode
- Navigate with arrow keys
- Audio plays for each slide
- Can pause on important slides
- Best for live presentations

## Call to Action

The presentation closes with an invitation for users to try Meeting Highlights themselves through:
1. **BizChat** - Primary access point (demonstrated in slides)
2. **SharePoint** - Alternative access (demonstrated in slides)
3. **Teams** - Planned future integration

Feedback encouraged via: **meetinghlfeedback@microsoft.com**