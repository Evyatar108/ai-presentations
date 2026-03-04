# MCP SEVAL — Domain Context

## What is SEVAL?

SEVAL (Sydney Evaluation) is the offline AI evaluation platform for Microsoft Copilot. It runs automated A/B experiments to measure AI response quality by comparing control and experiment configurations across hundreds of utterances.

## The 16 MCP Tools

### Connectivity (2)
- `check_health` — Verify SEVAL API connectivity
- `list_job_templates` — Discover available evaluation templates

### Job Lifecycle (6)
- `list_jobs` — Browse recent jobs with filtering
- `get_job` — Get full job details and configuration
- `create_job` — Submit a new evaluation job
- `cancel_job` — Stop an in-progress or stuck job
- `rerun_job` — Retry with the same configuration
- `rename_job` — Label experiments for tracking

### Results & Metrics (7)
- `get_job_metrics` — Aggregate scorecard with p-values
- `query_utterance_metrics` — Per-utterance metric breakdowns
- `query_utterance_detail` — Full detail for a specific utterance
- `query_utterance_conversation` — DevUI SBS debug link
- `query_svalue` — S-value statistical queries
- `get_job_output` — List available output files
- `download_job_file` — Download with auto blob backend detection

### Templates (1)
- `get_template_versions` — Version history and build selection

## Key Metrics

| Metric | Category | Description |
|--------|----------|-------------|
| SbSLeov3 | LLM Quality | Primary quality metric, pairwise comparison (-99 to +99) |
| GroundLeo | LLM Quality | Factual grounding fidelity (0-100) |
| CitationLeo | LLM Quality | Citation accuracy |
| ChecklistLeo | Rule-Based | Custom YAML assertion pass rate |
| RuleLeo | Rule-Based | Rule-based quality checks |
| RAI Safety | Safety | Content harms, security, elections, IP |
| Latency P95 | Performance | 95th percentile response latency |
| NDCG@10 | Retrieval | Normalized discounted cumulative gain |

## Quality vs Grounding Tradeoff

SbSLeo (creativity/engagement) and GroundLeo (factual accuracy) naturally move in opposite directions. A quality improvement that comes with a grounding regression is a classic tradeoff. The strongest signal is a quality win with no grounding regression.

## Job Configuration

Jobs use a v2 configuration with:
- **Control arm**: Baseline flight/configuration
- **Experiment arm**: New flight/configuration to test
- **Template**: Evaluation template (UnifiedBizChat, MChat-SDF, RSP, etc.)
- **Dataset**: Set of utterances to evaluate
- **Metrics**: Which metrics to compute

## Template Types

- **UnifiedBizChat** — Primary BizChat evaluation template
- **MChat-SDF** — Mobile Chat with SDF configuration
- **RSP** — Response Satisfaction Prediction

## Output Files

- `flattened_scrape_with_metrics_output.zip` — Most commonly downloaded, contains per-utterance scrape data with computed metrics
