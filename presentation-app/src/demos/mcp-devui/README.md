# MCP DevUI Demo

## Purpose

This demo presents MCP DevUI — an MCP server that exposes DevUI's debugging capabilities as structured tools for AI agents. The presentation is aimed at engineers who already use DevUI manually and want to understand how MCP DevUI lets their AI assistant do the work for them.

## Goal

Convince the audience that:
1. Manually debugging through DevUI is slow and painful (browser lag, raw JSON, hundreds of telemetry entries)
2. MCP DevUI solves this by letting an AI agent read and interpret the same data
3. The tools are easy to adopt (2-minute setup) and cover the most-used DevUI surfaces

## Target Audience

Sydney/Copilot engineers who:
- Already use DevUI regularly for debugging conversations
- Are familiar with concepts like telemetry, symptom reports, flights, SEVAL
- Want to speed up their debugging workflow using AI assistants (Claude, Copilot in VS Code, Roo Code, Cline, etc.)

## Presentation Structure

| Chapter | Slides | Purpose |
|---------|--------|---------|
| 0 — The Black Box | Title + The Debugging Problem | Hook: show the pain of manual DevUI debugging |
| 1 — The Toolkit | 22 Tools, 3 Skills, 1 Agent | Overview: categories, skill names, agent architecture |
| 2 — What You Can Do | Debug a Conversation, Send and Debug, Setup Config | Deep dive into each skill with tool usage breakdowns |
| 3 — The Full Toolkit | 22 Tools at Your Fingertips | Visual tool map showing all categories |
| 4 — Get Started | Two Minutes to Start Debugging | Installation and setup steps |
| 5 — Impact | Impact & What's Next | Before/after comparison, future roadmap |

## Key Messaging

- **Tools are not AI-powered** — they return structured data. The AI agent interprets the results.
- **DevUI already has these features** (symptom reports, execution flow, etc.) — the value is that the agent reads them instead of you.
- **Skills chain tools** — each skill is a guided workflow that combines multiple tool calls into one request.
- **Conversation IDs come from many sources** — provided directly, pulled from SEVAL, shared session links, or exported JSON files.

## Duration

~8 minutes narrated, 10 slides across 6 chapters.

## Narration Conventions

- Use `Dev-UI` (hyphenated) in narration text for proper TTS pronunciation. Display text uses `DevUI`.
- Use `Kwen` for Qwen TTS narrator name (subtitle correction maps it back to "Qwen").
- Use `EvYatar` for the author name (subtitle correction maps to "Evyatar").
- When referring to tools, say "uses the X tool" — make it explicit they are tools.
- When referring to skills, say "the X skill" — make it explicit they are skills.
- Don't hardcode specific telemetry entry counts — they vary per conversation.

## Domain Context

See [CONTEXT.md](./CONTEXT.md) for detailed domain knowledge about DevUI, Sydney architecture, tool categories, skill workflows, and presentation accuracy guidelines.

## Source Code

The MCP server, agent, and skills live in a separate repo:
- **Repo**: `D:\ai-developer-toolkit\`
- **MCP Server**: `mcp-servers/servers/devui/` (C#)
- **Agent**: `plugins/devui-agent/agents/devui-debugger.md`
- **Skills**: `plugins/devui-agent/skills/` (3 skill folders)

## Extending This Demo

When adding or modifying slides:
1. Update `CONTEXT.md` if the domain knowledge changes (new tools, renamed categories, etc.)
2. Keep narration consistent with the conventions above
3. Each Ch2 workflow slide should show a `(Skill)` suffix in the title and a `ToolsUsed` row listing the tools
4. Regenerate TTS after narration changes: `npm run tts:generate -- --demo mcp-devui`
5. The CSS loader (`scripts/css-loader.mjs`) is required for TTS generation because some components import CSS from `@xyflow/react`
