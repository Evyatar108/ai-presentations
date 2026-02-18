# Demo Documentation Structure

This document defines the expected documentation hierarchy for all demos in this project.

## Overview

Each demo has **two separate but related directory structures**:
1. **Documentation** (`docs/demos/{demo-id}/`) - High-level overview and context materials
2. **Implementation** (`src/demos/{demo-id}/`) - React code and technical implementation

This separation ensures:
- Documentation is accessible without navigating through code
- Context materials are centralized for reference
- Implementation details remain in the codebase
- New contributors can understand demos before diving into code

## Standard Directory Structure

```
docs/demos/{demo-id}/
├── {demo-id}.md                 # Main demo documentation file
├── context/                     # Background materials for demo creation
│   ├── *.md                    # Context documents (flexible naming)
│   └── v{N}/                   # Version-specific implementation details (optional)
│       ├── *.md
│       ├── *.py
│       └── ...

src/demos/{demo-id}/
├── index.ts                     # Demo configuration (exports default DemoConfig)
├── metadata.ts                  # Demo metadata
├── README.md                    # Technical implementation notes
└── slides/
    ├── SlidesRegistry.ts
    └── chapters/
        └── Chapter*.tsx

public/
├── audio/{demo-id}/             # Generated TTS audio files
├── images/{demo-id}/            # Images, logos, thumbnails
└── videos/{demo-id}/            # Video assets
```

## Key Principle: Demo ID Consistency

**The demo ID must be consistent across all locations:**
- `docs/demos/{demo-id}/` - Documentation
- `src/demos/{demo-id}/` - Implementation
- `public/{audio|images|videos}/{demo-id}/` - Assets

This predictability means: Given demo ID `meeting-highlights`, you immediately know:
- Documentation: `docs/demos/meeting-highlights/meeting-highlights.md`
- Implementation: `src/demos/meeting-highlights/`
- Assets: `public/{audio|images|videos}/meeting-highlights/`

## Documentation Files

### Main Demo File: `{demo-id}.md`

The main demo documentation file should be named using the demo ID (e.g., `meeting-highlights.md`).

**Required Sections:**
- **Overview** - What the demo presents and its purpose
- **Demo Structure** - Chapter breakdown with slide counts and descriptions
- **Slide Visual Reference** (optional) - Detailed visual descriptions of key slides
- **Design System** (optional) - Colors, typography, animation principles
- **Key Metrics** (if applicable) - Important numbers/statistics shown in the demo
- **Target Audience** - Who the presentation is for
- **Assets** - Location of videos, images, audio files
- **Notable Implementation Details** - Technical highlights
- **Demo-Specific Commands** (optional) - TTS generation, builds, etc.
- **Presentation Tips** (optional) - How to use different modes
- **Related Documentation** - Links to context files

**Example:**
```markdown
# Meeting Highlights Demo

## Overview
The Meeting Highlights demo is a comprehensive presentation about...

## Demo Structure
**Total Slides**: 15 slides across 9 chapters
**Duration**: ~4:07 minutes (audio only)

### Chapter Breakdown
#### Chapter 0: Introduction (1 slide)
- **Ch0_S1_Intro** - Opening title slide
...
```

### Context Directory: `context/`

The `context/` directory answers: **"What does someone unfamiliar with this subject need to know to create or update this demo?"**

**Purpose:**
- Provide domain knowledge for demo creation
- Document technical architecture and components
- Explain concepts shown in the presentation
- Reference materials for future updates

**Common Context Files:**
- **Product/Feature Overview** - What is being presented
- **Architecture Documentation** - Technical components and relationships
- **Team Collaboration** - Who works on different parts
- **Technical Comparisons** - Different approaches or versions
- **User Access Instructions** - How users can try the feature
- **Version-Specific Details** - Implementation details in `v{N}/` subdirectories

**Example Structure:**
```
context/
├── what-is-meeting-highlights.md       # Product overview
├── team-collaboration.md                # Collaboration info
├── architecture-comprehensive.md        # Technical architecture
├── extractive-vs-abstractive.md        # Technical comparison
├── how-can-users-try.md                # User instructions
├── v2-goals-and-efforts.md             # Version 2 details
├── v1/                                  # Version 1 implementation
│   └── HighlightsPromptMaper.py
└── v2/                                  # Version 2 implementation
    ├── prompt.md
    ├── prompt-output-schema.md
    └── TRANSCRIPT_TABLE_SCHEMA.md
```

**Guidelines:**
- Use descriptive, hyphenated lowercase filenames (e.g., `team-collaboration.md`)
- Include version subdirectories (`v1/`, `v2/`, etc.) for implementation-specific details
- Reference these files in the main demo documentation
- Keep context files focused on a single topic
- Update context when the underlying product/feature changes

## Implementation Files

### Technical README: `src/demos/{demo-id}/README.md`

Each demo should have a technical README in the source directory that covers:
- Demo ID and basic info (duration, slide count)
- Content structure (chapter-by-chapter breakdown)
- Key metrics displayed
- Technical implementation details
- Slide organization
- Asset locations
- Presentation modes
- Development commands
- File references with links

**This is separate from `docs/demos/{demo-id}/{demo-id}.md`:**
- Source README focuses on **implementation** (code structure, files, technical details)
- Docs README focuses on **content** (what's presented, visual design, narrative)

## Asset Organization

All demo assets follow the `{demo-id}` naming pattern:

```
public/
├── audio/{demo-id}/
│   └── c{N}/                    # Chapter-based organization
│       └── s{N}_segment_{NN}_*.wav
├── images/{demo-id}/
│   ├── thumbnail.jpeg           # Required: 16:9 demo thumbnail
│   └── logos/                   # Optional: logo directory
└── videos/{demo-id}/
    └── *.mp4
```

## Naming Conventions

### Demo IDs
- Use **lowercase with hyphens** (e.g., `meeting-highlights`, `example-demo-1`)
- Keep consistent across all locations (docs, src, public)
- Use descriptive names that reflect content

**Examples:**
- ✅ `meeting-highlights`
- ✅ `sales-demo`
- ❌ `Meeting_Highlights`
- ❌ `SalesDemo`

### Documentation Files
- Main demo file: `{demo-id}.md` (e.g., `meeting-highlights.md`)
- Context files: `descriptive-name.md` (lowercase with hyphens)
- Version directories: `v1/`, `v2/`, etc.

**Examples:**
- ✅ `team-collaboration.md`
- ✅ `architecture-comprehensive.md`
- ❌ `Team Collaboration.md`

### Asset Files
- Audio: `s{slide}_segment_{number}_{description}.wav`
- Images: Descriptive names, organized in subdirectories if needed
- Videos: Descriptive names (e.g., `meeting_highlights_usage_in_bizchat.mp4`)

## Cross-References

### From Documentation to Implementation
Link to source code files using relative paths:
```markdown
- Located in [`src/demos/meeting-highlights/slides/chapters/`](../../../presentation-app/src/demos/meeting-highlights/slides/chapters/)
- Registered in [`SlidesRegistry.ts`](../../../presentation-app/src/demos/meeting-highlights/slides/SlidesRegistry.ts)
```

### From Implementation to Documentation
Link to documentation files:
```markdown
- **Product Overview**: [`what-is-meeting-highlights.md`](../../../../docs/demos/meeting-highlights/context/what-is-meeting-highlights.md)
- **Demo Specification**: [`meeting-highlights.md`](../../../../docs/demos/meeting-highlights/meeting-highlights.md)
```

## Example: Meeting Highlights Demo

The Meeting Highlights demo follows this structure:

```
docs/demos/meeting-highlights/
├── meeting-highlights.md                          # Main documentation
└── context/                                       # Context materials
    ├── what-is-meeting-highlights.md
    ├── team-collaboration.md
    ├── architecture-comprehensive.md
    ├── extractive-vs-abstractive-highlights.md
    ├── how-can-users-try-meeting-highlights.md
    ├── v2-goals-and-efforts.md
    ├── v1/
    │   └── HighlightsPromptMaper.py
    └── v2/
        ├── prompt.md
        ├── prompt-output-schema.md
        └── TRANSCRIPT_TABLE_SCHEMA.md

src/demos/meeting-highlights/
├── index.ts
├── metadata.ts
├── README.md                                      # Technical notes
└── slides/
    ├── SlidesRegistry.ts
    └── chapters/
        ├── Chapter0.tsx
        ├── Chapter1.tsx
        └── ...

public/
├── audio/meeting-highlights/c{0-9}/
├── images/meeting-highlights/
│   ├── meeting_highlights_thumbnail.jpeg
│   └── logos/
└── videos/meeting-highlights/
```

## Adding a New Demo

### Quick Start: PowerShell Script

Use the automated scaffolding script to create a complete demo structure:

```powershell
# Basic usage
.\scripts\new-demo.ps1 -DemoId "my-demo"

# With custom title
.\scripts\new-demo.ps1 -DemoId "my-demo" -DemoTitle "My Amazing Demo"
```

The script creates:
- Complete directory structure
- All required files with templates
- Example slides and metadata
- README files with placeholders

### Manual Steps

If creating manually, follow these steps:

1. **Create documentation structure:**
   ```bash
   mkdir -p docs/demos/{demo-id}/context
   ```

2. **Create main documentation file:**
   ```bash
   touch docs/demos/{demo-id}/{demo-id}.md
   ```

3. **Add context materials:**
   - Create relevant `.md` files in `context/`
   - Add version-specific directories if needed
   - Reference context files in main documentation

4. **Create implementation** (see [`ADDING_DEMOS.md`](ADDING_DEMOS.md))

5. **Organize assets:**
   ```bash
   mkdir -p public/audio/{demo-id}/c0
   mkdir -p public/images/{demo-id}
   mkdir -p public/videos/{demo-id}
   ```

## Benefits of This Structure

### 1. Predictability
Given a demo ID, all file locations are immediately known:
- Documentation: `docs/demos/{demo-id}/{demo-id}.md`
- Implementation: `src/demos/{demo-id}/`
- Assets: `public/{audio|images|videos}/{demo-id}/`

### 2. Consistency
All demos follow the same pattern, making it easy to:
- Find documentation
- Navigate the codebase
- Understand project organization
- Onboard new contributors

### 3. Maintainability
Clear separation of concerns:
- Documentation lives in `docs/`
- Code lives in `src/`
- Assets live in `public/`
- No confusion about where files belong

### 4. Scalability
The structure supports unlimited demos:
- Each demo is self-contained
- No interference between demos
- Easy to add/remove demos
- Consistent patterns prevent chaos

### 5. Discoverability
Hyphenated names make files easier to:
- Type (no escaping spaces)
- Search (standard web convention)
- Tab-complete (no ambiguity)
- Sort (predictable ordering)

## Maintenance

### When Updating a Demo
1. Update the main documentation file (`{demo-id}.md`) if content changes
2. Update context files if underlying concepts change
3. Add new context files as needed
4. Update cross-references between docs and code
5. Keep asset locations documented

### When Deprecating a Demo
1. Mark the main documentation file as deprecated
2. Keep documentation for reference
3. Archive implementation code separately
4. Document migration path if applicable

## Documentation Philosophy

### Two-Tier Structure
1. **High-Level Documentation** (`docs/demos/`)
   - What the demo presents
   - Why it matters
   - Who it's for
   - Key takeaways

2. **Technical Implementation** (`src/demos/`)
   - How it's built
   - Code structure
   - Development commands
   - File organization

### Context Directory Purpose
The `context/` directory provides background information that someone unfamiliar with the subject needs to create or update the demo. It should include:
- Product/feature overview
- Technical architecture
- Team collaboration details
- User access instructions
- Version-specific implementations
- Metrics and benchmarks

## Common Questions

### Q: Why hyphenated names instead of spaces?
**A**: Easier to type, better for URLs, no escaping needed, works better with tab completion, standard web convention.

### Q: Why must directory names match demo IDs?
**A**: Consistency and predictability. Given ID `meeting-highlights`, everything is immediately findable.

### Q: What if a demo doesn't need context materials?
**A**: Still create the `context/` directory with a README explaining it's a simple demo. This maintains consistency.

### Q: Can context files have subdirectories?
**A**: Yes! Use `v1/`, `v2/`, etc. for version-specific materials, or create logical groupings as needed.

### Q: What if I need to rename a demo ID?
**A**: You'd need to:
1. Rename directories in `docs/demos/`, `src/demos/`, and `public/`
2. Update metadata files
3. Update all cross-references
4. Update demo registry
5. Regenerate TTS audio with new demo ID

**Recommendation**: Choose demo IDs carefully upfront.

## Related Documentation

- **[Adding Demos Guide](ADDING_DEMOS.md)** - Step-by-step implementation guide
- **[TTS Guide](TTS_GUIDE.md)** - Audio generation for demos
- **[Architecture](ARCHITECTURE.md)** - Overall project architecture
- **[Components](COMPONENTS.md)** - Shared component documentation
- **[Troubleshooting](TROUBLESHOOTING.md)** - Common issues and solutions