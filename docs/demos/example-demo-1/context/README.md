# Example Demo 1 - Context Materials

## Purpose

This directory would typically contain background materials needed to understand and create the demo content. For Example Demo 1, which is a placeholder demonstration, minimal context is needed.

## Typical Context Materials

For a real demo, this directory should include:

### 1. Product/Feature Overview
**File**: `product-overview.md`

Explains:
- What the product/feature is
- Key capabilities and benefits
- User value proposition
- Market positioning

### 2. Technical Architecture
**File**: `architecture.md`

Documents:
- System components and services
- Data flow diagrams
- Integration points
- Technical dependencies
- Performance characteristics

### 3. Team Collaboration
**File**: `team-collaboration.md`

Details:
- Teams involved in the feature
- Roles and responsibilities
- DRIs (Directly Responsible Individuals)
- Communication channels
- ICM (Incident Management) teams

### 4. User Instructions
**File**: `user-access.md`

Provides:
- How users access the feature
- Step-by-step usage instructions
- Prerequisites and requirements
- Common use cases
- Troubleshooting tips

### 5. Technical Comparisons
**File**: `approach-comparison.md`

Compares:
- Different implementation approaches
- Trade-offs between options
- Performance implications
- Quality metrics

### 6. Version-Specific Implementation
**Directory**: `v1/`, `v2/`, etc.

Contains:
- Implementation code samples
- Schema definitions
- Prompt templates
- Configuration files
- API specifications

## Example: Meeting Highlights Demo

For a real-world example, see the [Meeting Highlights context directory](../../meeting-highlights/context/):

```
meeting-highlights/context/
├── what-is-meeting-highlights.md       # Product overview
├── team-collaboration.md                # Teams and collaboration
├── architecture-comprehensive.md        # Technical architecture
├── extractive-vs-abstractive-highlights.md  # Technical comparison
├── how-can-users-try-meeting-highlights.md  # User instructions
├── v2-goals-and-efforts.md             # Version 2 goals
├── v1/                                  # Version 1 implementation
│   └── HighlightsPromptMaper.py
└── v2/                                  # Version 2 implementation
    ├── prompt.md
    ├── prompt-output-schema.md
    └── TRANSCRIPT_TABLE_SCHEMA.md
```

## When Creating Context Materials

### For Product Demos
Focus on:
- What problem does it solve?
- Who are the users?
- What are the key features?
- How does it compare to alternatives?

### For Technical Optimization Demos
Include:
- Baseline metrics (before)
- Optimization approach
- Implementation details
- Results and impact (after)
- Quality validation

### For Process/Workflow Demos
Document:
- Current state challenges
- Proposed solution
- Implementation steps
- Expected benefits
- Success metrics

## File Naming Conventions

Use descriptive, hyphenated lowercase names:
- ✅ `product-overview.md`
- ✅ `team-collaboration.md`
- ✅ `v2-goals-and-efforts.md`
- ❌ `Product Overview.md` (spaces)
- ❌ `TEAM_COLLABORATION.md` (uppercase with underscores)

## Maintenance

Context materials should be updated when:
- Product/feature functionality changes
- Architecture evolves
- New teams become involved
- User access methods change
- New versions are implemented
- Metrics or benchmarks update

## Related Documentation

- **[Demo Documentation Structure](../../DEMO_DOCUMENTATION_STRUCTURE.md)** - Overall documentation guidelines
- **[Adding Demos Guide](../../ADDING_DEMOS.md)** - Creating new demos
- **[Meeting Highlights Context](../meeting-highlights/context/)** - Comprehensive example