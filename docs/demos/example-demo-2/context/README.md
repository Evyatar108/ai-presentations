# Example Demo 2 - Context Materials

## Purpose

This directory is a placeholder for context materials. Example Demo 2 is a demonstration of dark theme design patterns and doesn't require extensive context documentation.

For real demos, this directory should contain comprehensive background materials needed to understand and create the demo content.

## What Context Materials Include

Context materials help someone unfamiliar with the subject matter understand and create the demo. They typically include:

### 1. Product/Feature Overview
Understanding what's being presented:
- Core functionality and capabilities
- User value proposition
- Key differentiators
- Usage scenarios

### 2. Technical Architecture
System design and components:
- Architecture diagrams
- Service dependencies
- Data flow patterns
- Integration points
- Performance characteristics

### 3. Team and Collaboration
Organizational context:
- Contributing teams and their roles
- DRIs (Directly Responsible Individuals)
- Cross-team dependencies
- Communication channels

### 4. User Access and Usage
Practical information:
- How users access the feature
- Prerequisites and requirements
- Step-by-step instructions
- Common workflows
- Troubleshooting

### 5. Technical Details
Implementation specifics:
- Algorithms and approaches
- Performance optimizations
- Quality metrics
- Trade-off decisions

### 6. Version History
Evolution over time:
- Version-specific implementations (`v1/`, `v2/`, etc.)
- Migration paths
- Breaking changes
- Improvement motivations

## Real-World Example

The [Meeting Highlights demo](../../meeting-highlights/context/) demonstrates comprehensive context materials:

```
meeting-highlights/context/
├── what-is-meeting-highlights.md           # Product overview
├── team-collaboration.md                    # 6+ teams collaborating
├── architecture-comprehensive.md            # Detailed architecture
├── extractive-vs-abstractive-highlights.md # Technical comparison
├── how-can-users-try-meeting-highlights.md # User access guide
├── v2-goals-and-efforts.md                 # Version 2 improvements
├── v1/                                      # Original implementation
│   └── HighlightsPromptMaper.py
└── v2/                                      # Current implementation
    ├── prompt.md                           # LLM prompt
    ├── prompt-output-schema.md             # Output schema
    └── TRANSCRIPT_TABLE_SCHEMA.md          # Input schema
```

## File Organization Best Practices

### Naming Conventions
- Use lowercase with hyphens: `product-overview.md`
- Be descriptive but concise: `team-collaboration.md` not `teams.md`
- Version directories: `v1/`, `v2/`, `v3/` etc.

### File Types
- **Markdown** (`.md`) for documentation
- **Code files** for implementation samples
- **JSON/YAML** for schemas and configurations
- **Images** for diagrams (reference from markdown)

### Structure
```
context/
├── overview-files.md           # General understanding
├── technical-details.md        # Implementation specifics
├── usage-instructions.md       # How to use
└── vN/                         # Version-specific materials
    ├── implementation.py
    ├── schema.json
    └── README.md              # Version notes
```

## When Context Materials Matter Most

### For Complex Products
- Multiple teams involved
- Intricate architecture
- Domain-specific knowledge required
- Historical evolution important

### For Optimization Stories
- Need baseline metrics
- Technical approach explanation
- Before/after comparisons
- Quality validation results

### For Cross-Team Features
- Dependencies on multiple services
- Integration complexity
- Collaboration patterns
- Shared responsibilities

## Maintenance Guidelines

Update context materials when:
- Feature functionality changes significantly
- Architecture evolves or refactors occur
- New teams become involved
- User access methods change
- New versions are implemented
- Metrics or benchmarks update
- Integration points change

## Creating Context Materials

### Start With
1. **Product overview** - What is it?
2. **User value** - Why does it matter?
3. **Key capabilities** - What can it do?

### Then Add
4. **Architecture** - How is it built?
5. **Teams** - Who works on it?
6. **Usage** - How do users access it?

### Finally Include
7. **Technical details** - Implementation specifics
8. **Version history** - How it evolved
9. **Metrics** - Performance and adoption data

## Links and References

### Within Context Directory
```markdown
See the [architecture diagram](architecture.md#system-overview) for details.
```

### To Main Demo Documentation
```markdown
This context supports the [Example Demo 2](../example-demo-2.md) presentation.
```

### To Implementation
```markdown
Implementation: [`src/demos/example-demo-2/`](../../../../react_cogs_demo/src/demos/example-demo-2/)
```

## For Simple Demos

If your demo is straightforward:
- A single overview file may suffice
- Focus on key concepts only
- Link to external documentation
- Don't over-document obvious aspects

## For Complex Demos

If your demo has depth:
- Multiple focused files (one topic each)
- Version subdirectories for implementations
- Diagrams and visual aids
- Code samples and schemas
- Comprehensive team information

## Related Documentation

- **[Demo Documentation Structure](../../DEMO_DOCUMENTATION_STRUCTURE.md)** - Comprehensive guidelines
- **[Adding Demos Guide](../../ADDING_DEMOS.md)** - Step-by-step demo creation
- **[Meeting Highlights Context](../../meeting-highlights/context/)** - Real example
- **[Example Demo 1 Context](../../example-demo-1/context/README.md)** - Similar guidelines