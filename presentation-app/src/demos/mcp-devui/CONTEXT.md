# MCP DevUI — Demo Context

This document captures domain knowledge about the MCP DevUI project so that demo maintainers can understand and extend the presentation without needing direct access to DevUI.

## What is DevUI?

DevUI is an internal debugging portal for **Sydney-powered Copilot conversations**. Sydney is the AI orchestration engine behind Microsoft 365 Copilot. When a user sends a query to Copilot, Sydney coordinates multiple services (search, reasoning, grounding, plugins) to produce a response. Each of these steps emits **telemetry**.

DevUI lets engineers inspect this telemetry — but manually. The portal renders raw JSON across many tabs, and with hundreds of telemetry entries per conversation turn, searching through them is slow and the browser often freezes.

## What is MCP DevUI?

MCP DevUI is an **MCP server** that exposes DevUI's debugging capabilities as structured tools for AI agents. Instead of engineers manually browsing the portal, their AI assistant (Claude, Copilot in VS Code, Roo Code, Cline, etc.) reads and interprets the data for them.

Key distinction: the tools themselves are **not AI-powered** — they return structured data from DevUI. The AI agent is what interprets the results.

## Architecture

- **MCP Server**: `mcp-servers/servers/devui/` — C# server exposing 21 tools
- **Agent**: `plugins/devui-agent/agents/devui-debugger.md` — orchestrates tools via skills
- **Skills**: `plugins/devui-agent/skills/` — 4 guided workflows that chain tools
- **Source**: `D:\ai-developer-toolkit\` (separate repo)

## Tool Categories (21 tools)

### Conversation Loading (3 tools)
Load conversation data into the debugger for analysis.

| Tool | Description |
|------|-------------|
| `load_conversation` | Load by conversation ID from Substrate Sydney |
| `load_shared_conversation` | Load by shared session ID (e.g., from SEVAL jobs) |
| `load_conversation_from_file` | Load from an exported JSON file |

Conversation IDs can be provided directly by the user, pulled from a SEVAL job by the agent, or obtained via a shared session link. Exported JSON files can come from manual DevUI exports or SEVAL job downloads.

### Turn Inspection (2 tools)
View details of specific turns within a loaded conversation.

| Tool | Description |
|------|-------------|
| `get_turn` | Get turn detail: user input, bot response, telemetry summary |
| `get_turn_message` | Get full raw message content for a turn |

### Telemetry & Diagnostics (10 tools)
The largest group — covers all debugging and analysis of conversation telemetry.

| Tool | Description |
|------|-------------|
| `get_symptom_report` | Primary triage — categorized diagnostic view (utterance, retrieval, reasoning, synthesis, web search, suggestions, agent runtime) |
| `get_turn_telemetry` | Flat table of all telemetry rows (service calls, statuses) |
| `search_telemetry` | Search/filter by metadata (serviceName, status, free-text) |
| `search_telemetry_content` | Search inside telemetry payload content with context snippets |
| `get_telemetry_detail` | Full input/output for one specific telemetry entry |
| `get_execution_flow` | Hierarchical service call execution tree |
| `get_turn_variants` | OptionsSets + variants (flight selections) |
| `get_agent_manifest` | Full Helix Agent Runtime configuration (AgentJson) |
| `get_call_flow` | Helix Agent call flow DAG (Feature → Event → Handler map) |
| `get_search_results` | O365/Substrate search results with grounding info |

### Chat Execution (1 tool)
Send live requests and automatically load telemetry.

| Tool | Description |
|------|-------------|
| `send_chat_request` | Send chat request to Sydney via SignalR ChatHub — auto-loads telemetry |

### Config Management (5 tools)
Create, update, and manage chat configurations and runtime settings.

| Tool | Description |
|------|-------------|
| `list_chat_configs` | List saved configs (personal + shared defaults) |
| `create_chat_config` | Create a new config, optionally forking a default (important: always fork to preserve telemetry-enabling optionsSets) |
| `update_chat_config` | Update an existing config by GUID |
| `get_sydney_config` | Get Sydney runtime config from Substrate (feature flags, apps) |
| `list_test_accounts` | List available test accounts |

## Skills (4 guided workflows)

### debug-conversation
**Purpose**: Debug a single conversation end-to-end.

**Workflow**: Load conversation → `get_symptom_report` → triage results → drill into specific telemetry with `get_telemetry_detail` → optionally inspect execution flow, variants, agent manifest.

**Key scenarios**: Prompt verification, search grounding failures, wrong bot responses.

### send-and-debug
**Purpose**: Send a live chat request and immediately debug the response.

**Workflow**: Select/create a chat config → `send_chat_request` (auto-loads telemetry) → check for failures → triage with symptom report → drill down.

**Key feature**: Telemetry auto-loads after sending — no separate `load_conversation` needed. Supports multi-turn conversations.

### setup-config
**Purpose**: Create or fork a chat configuration for local debugging with variant flights.

**Workflow**: `list_chat_configs` → choose base config to fork → configure variant flights in optionsSets → `create_chat_config` → test with `send_chat_request`.

**Critical**: Always fork from a default config to preserve telemetry-enabling optionsSets — creating from scratch means no telemetry emission.

### check-flight
**Purpose**: Verify whether a specific flight/variant is active in a conversation.

**Workflow**: Load conversation → `get_turn_variants` → search for flight in optionsSets and resolved variants → report enabled/disabled state.

## DevUI Portal Tabs

The DevUI web portal has a two-panel design: Chat Window (left) and Debug Window (right). The debug window has these tabs:

| Tab | What it shows |
|-----|---------------|
| **Symptom Report** | Categorized diagnostic summary — flags common errors like empty 3S ContentSource, missing LU domains, high fcfr latency. Has "Go to telemetry" links for each issue. |
| **Latency View** | Waterfall chart of execution timeline — each bar is a telemetry entry's start time and duration. |
| **Telemetry** | Raw telemetry entries from Sydney. Searchable/filterable. Supports "3S Full Results" button for SubstrateSearch entries and "DeepLeo Results" for reasoning output. |
| **Variants** | Feature flags and context information applied to the conversation. |
| **Extension Graph** | Execution order of all ExtensionRunners (plugins). |
| **MCP** | 3-phase visualization: Discover → Describe → Invoke. Shows MCP server capabilities and invocation details. |

## Sydney Architecture

### Request/Response Flow
1. User sends query via Copilot client (BizChat, M365, etc.)
2. Request hits **ChatHub** (WebSocket endpoint on Substrate)
3. **TuringBot** orchestrates the pipeline:
   - **LU** (Language Understanding) classifies intent, produces altered queries
   - **SubstrateSearchService (3S)** performs enterprise search, returns grounding results
   - **DeepLeo** reasoning iterations process search results + prompt
   - **DeepLeo** synthesis generates the final response
   - **ExtensionRunners** execute plugins (including MCP servers)
4. Telemetry emitted at each step
5. Response streamed back via ChatHub

### Key Sydney Components
- **TuringBot**: Root orchestrator service, hosted on Substrate (Microsoft.Falcon.TuringBot)
- **ChatHub**: WebSocket endpoint — modern (Avalon/master) or legacy (SecuredChatHub/sydcomp)
- **SubstrateSearchService (3S)**: Enterprise search — returns files, entities, content from O365
- **DeepLeo**: LLM reasoning and response synthesis. Multiple iterations possible.
- **LU**: Language Understanding — intent classification, query reformulation
- **ExtensionRunners**: Plugin execution pipeline (sequential)
- **Augloop**: Middleware for Office app integration (PowerPoint, Excel → Sydney)

### Sydney Endpoints
- **Production**: `wss://substrate.office.com/m365Copilot/ChatHub`
- **SDF**: `wss://substrate-sdf.office.com/m365Copilot/ChatHub`
- **Local**: `ws://localhost:86/ChatHub` (Avalon) or `localhost:44344` (legacy)
- Regional variants: WestUS3, MSIT, Frontier, Government Cloud

## Common DevUI Concepts

- **Turn**: A single user query + bot response in a conversation. Each turn has its own telemetry.
- **Telemetry entries**: Service calls, their inputs/outputs, statuses, and metadata. A single turn can have hundreds of entries.
- **Symptom report**: A categorized diagnostic view of a turn's telemetry, grouped into sections (utterance, retrieval, reasoning, synthesis, web search, suggestions, agent runtime).
- **Execution flow**: The hierarchical service call tree showing which services called which, with TuringBot at the root.
- **Slots**: Named containers (A, B) for loading multiple conversations for comparison.
- **Flights/Variants**: Feature flags (optionsSets) that control Sydney's behavior. Format: `feature.myFlightName`. Can be passed via URL params, Edit Request panel, or Plugin Data (for 3S-specific flights).
- **SDF config**: A chat request configuration that specifies endpoint, flights, and other parameters. Always fork from defaults to preserve telemetry-enabling optionsSets.
- **SEVAL**: Offline evaluation framework that runs conversations at scale. Pipeline: Scraping → Parser → Comet (metrics) → Scorecard. Each job produces many conversations with IDs. Debug links have a default 12h TTL (extendable to 28 days).
- **Sydney endpoints**: WebSocket connections to ChatHub (local, Avalon/CAFE, Frontier, GCC variants).
- **fcfr**: First Character Fetch Response — key latency metric for DeepLeo synthesis (should be < 21s).
- **3S**: SubstrateSearchService — enterprise search providing grounding data for responses.
- **Scenarios**: Different conversation modes — Enterprise (default), Bing_CompliantWebChat (CWC), Bing_StandaloneEDP, Bing_StandaloneBasic.

## Conversation Sharing

Engineers can share conversations for collaborative debugging:

- **`/debug` command**: Type `/debug` in any M365 Copilot conversation to generate a DevUI debug link for that conversation.
- **`/share` command**: Type `/share` in BizChat to generate a shareable link others can use to help debug.
- **Share button**: DevUI's share button stores conversation data in shared storage with **28-day retention**.
- **Download/Upload**: Conversations can be downloaded as JSON files and re-uploaded later or shared manually.

## Common Symptom Report Error Patterns

The symptom report auto-flags these common issues:

| Pattern | What it means |
|---------|---------------|
| 3S /unfurl ContentSource empty | SubstrateSearch returned results but with empty content |
| 3S /unfurl FileName missing | Search results lack file metadata (name, size, summary) |
| 3S LU domain empty | Language Understanding didn't classify into any domain |
| 3S LU Output missing | Missing LuAlteredQueries, LlmLuOutput, or LuClassification |
| fcfr > 21000 | DeepLeo synthesis took over 21 seconds (First Character Fetch Response) |
| Next turn suggestion count ≠ 2-3 | Unexpected number of follow-up suggestions |

## Ways to Load Conversations in DevUI

1. **By conversation ID** — provided directly or pulled from a SEVAL job
2. **By shared session link** — e.g., from the `/debug` command in BizChat
3. **From exported JSON file** — manual DevUI export or SEVAL job download
4. **Live in DevUI** — start a new conversation directly in the chat panel

## Presentation accuracy notes

- The tools are **not AI-powered** — they return structured data. The AI agent is what interprets the results.
- DevUI already has features like symptom reports, execution flow, etc. The value of MCP DevUI is that the **agent reads and interprets** this data instead of engineers doing it manually.
- The browser lag when searching telemetry in DevUI is a real, well-known pain point.
- Conversation IDs are dynamic — don't hardcode specific counts like "1,247 telemetry entries" as if they're universal.
- When mentioning tools in narration, make it clear they are **tools** (e.g., "uses the 'load conversation' tool"). When mentioning skills, make it clear they are **skills**.
- Use `Dev-UI` (hyphenated) in narration text for proper TTS pronunciation. Display text uses `DevUI`.
