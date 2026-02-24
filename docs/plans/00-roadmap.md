# Strategic Roadmap: Infrastructure Initiatives

## Overview

This document aggregates seven strategic infrastructure initiatives for the presentation framework. These are distinct from the tactical feature list in [`docs/FUTURE_ENHANCEMENTS.md`](../FUTURE_ENHANCEMENTS.md) — these are architectural and infrastructure investments that change how the system is built, deployed, or operated.

| # | Initiative | Document | Size | Status |
|---|-----------|----------|------|--------|
| 1 | [Config Unification](#1-config-unification) | [`01-config-unification.md`](./01-config-unification.md) | S | Proposed |
| 2 | [Cloud GPU](#2-cloud-gpu) | [`02-cloud-gpu.md`](./02-cloud-gpu.md) | M | Proposed |
| 3 | [Azure Deployment](#3-azure-deployment) | [`03-azure-deployment.md`](./03-azure-deployment.md) | M | Proposed |
| 4 | [Azure Production Enhancements](#4-azure-production-enhancements) | [`04-azure-production.md`](./04-azure-production.md) | S-M | Proposed |
| 5 | [Slide Variants](#5-slide-variants) | [`05-slide-variants.md`](./05-slide-variants.md) | M | Proposed |
| 6 | [Repo Split](#6-repo-split) | [`06-repo-split.md`](./06-repo-split.md) | XL | Proposed |
| 7 | [Content Pipeline](#7-content-pipeline) | [`07-content-pipeline.md`](./07-content-pipeline.md) | S-M | Proposed |

## Scoring Matrix

Each initiative is scored 1-5 on five dimensions:

| Dimension | Description |
|-----------|-------------|
| **Value** | Business/developer impact if completed |
| **Effort** | Time and complexity (5 = low effort, 1 = very high effort) |
| **Risk** | Technical risk and unknowns (5 = low risk, 1 = high risk) |
| **Reversibility** | How easily it can be undone (5 = fully reversible, 1 = irreversible) |
| **Independence** | How standalone the work is (5 = no dependencies, 1 = blocks/blocked by many) |

| Initiative | Value | Effort | Risk | Reversibility | Independence | **Weighted Score** |
|-----------|-------|--------|------|---------------|-------------|-------------------|
| Config Unification | 3 | 5 | 5 | 5 | 5 | **4.5** |
| Cloud GPU | 4 | 4 | 4 | 5 | 5 | **4.4** |
| Azure Deployment | 4 | 4 | 4 | 5 | 4 | **4.2** |
| Content Pipeline | 4 | 4 | 3 | 5 | 2 | **3.6** |
| Azure Production | 3 | 4 | 4 | 5 | 3 | **3.8** |
| Slide Variants | 3 | 3 | 3 | 4 | 4 | **3.4** |
| Repo Split | 4 | 2 | 2 | 2 | 2 | **2.4** |

*Weighted Score = 0.25 &times; Value + 0.25 &times; Effort + 0.15 &times; Risk + 0.15 &times; Reversibility + 0.20 &times; Independence*

## Recommended Implementation Order

### 0. Config Unification (01) — Day 1 Prerequisite

**Why first**: Every other initiative adds config (env vars, URLs, API keys). Establishing `.env.development` / `.env.production` and the `VITE_*` naming convention before other work prevents config sprawl.

**Timeline**: ~1-2 hours
**Blocks**: Nothing, but all initiatives benefit from it

### 1. Cloud GPU (02) — Start First

**Why first**: Highest value/effort ratio among substantial initiatives. The servers are already HTTP — only configuration URLs change. Zero code changes for the basic case. Unblocks remote work and team collaboration on TTS/alignment.

**Timeline**: ~1-1.5 weeks
**Parallel with**: Azure Deployment (03)

### 2. Azure Deployment (03) — Overlap with Cloud GPU

**Why second**: SPA deployment (Phase 1) is straightforward and can start immediately. PR preview environments come nearly free. Blob storage + CDN (Phase 2) adds scope but is independent of other work.

**Timeline**: ~1-1.5 weeks (Phase 1 can start day 1, overlapping with Cloud GPU)
**Depends on**: Config Unification (01) for `VITE_*` pattern

### 3. Azure Production Enhancements (04) — After Core Deployment

**Why third**: Error reporting and offline support are production-quality polish. They depend on Azure being deployed (03) and MP3 conversion being in place (03, Phase 3). Can be deferred until the deployed SPA sees real usage.

**Timeline**: ~5-10 hours
**Depends on**: Azure Deployment (03)

### 4. Content Pipeline (07) — After Cloud GPU + Azure

**Why fourth**: The automated pipeline is the payoff of doing Cloud GPU and Azure Deployment first — it stitches them together. Requires cloud GPU to be accessible from CI runners and blob storage to be available.

**Timeline**: ~4-6 hours
**Depends on**: Cloud GPU (02) + Azure Deployment Phase 2 (03)

### 5. Slide Variants (05) — After Infrastructure Stabilizes

**Why fifth**: A feature that changes the framework's public API surface (`defineSlideVariants`, extended types, new audio path scheme). Should be finalized before the repo split so the API surface is stable.

**Timeline**: ~1-1.5 weeks
**Depends on**: Nothing technically, but benefits from Cloud GPU for faster TTS iteration

### 6. Repository Split (06) — Last

**Why last**: Most disruptive — touches every import path, splits the package.json, restructures the entire project. Should only be done when the API surface is stable (i.e., after Slide Variants) and when there's a concrete need for a second demo project.

**Timeline**: ~2-3 weeks (Phase 1: monorepo workspaces)
**Depends on**: Slide Variants (05) for API stability; ideally after Azure Deployment (03) CI/CD is settled

## Dependency Graph

```
Config Unification (01) ─────────────────────────────────────────────┐
  (prerequisite — establishes env var pattern)                       │
                                                                     │
Cloud GPU (02) ──────────────────────────────────────────────┐       │
  (config URLs only, no code changes)                        │       │
                                                             │       │
Azure Deployment (03) ───────────────────────────────┐       │       │
  Phase 1: SPA deploy                                │       │       │
  Phase 2: Blob storage + CDN                        │       │       │
  Phase 3: CI/CD + audio conversion                  │       │       │
                                                     │       │       │
Azure Production (04) ◄──────────────────────────────┘       │       │
  Part A: Error reporting                                    │       │
  Part B: Offline/PWA (needs MP3 from Phase 3)               │       │
                                                             │       │
Content Pipeline (07) ◄──────────────────────────────────────┘       │
  (orchestrates Cloud GPU + Azure Blob)                              │
                                                                     │
Slide Variants (05) ─────────────────────────────────────┐           │
  (changes framework API surface)                        │           │
                                                         ▼           │
Repo Split (06) ─────────────────────────────────────────────────────┘
  Phase 1: Monorepo workspaces (after API stable)
  Phase 2: Full split (future, when justified)
```

**Hard dependencies:**
- Azure Production (04) requires Azure Deployment (03)
- Content Pipeline (07) requires Cloud GPU (02) + Azure Deployment Phase 2 (03)
- Repo Split (06) should wait for Slide Variants (05) for API surface stability

**Soft dependencies (nice-to-have ordering):**
- Config Unification (01) benefits all initiatives but technically doesn't block any
- Cloud GPU (02) running makes Slide Variants (05) development faster (remote TTS)
- Azure Deployment (03) is smoother before Repo Split (06) — one build pipeline to configure

## Phasing Suggestions

### Phase 0: Foundation (Day 1)

| Task | Time |
|------|------|
| Config Unification: `.env` files, `VITE_*` pattern, docs | 1-2 hours |

**Outcome**: Clean config foundation for all initiatives.

### Phase A: Infrastructure (Weeks 1-2)

Work on Cloud GPU and Azure Deployment in parallel:

| Week | Cloud GPU (02) | Azure Deployment (03) |
|------|---------------|----------------------|
| 1 | Dockerfile, gunicorn, AWS setup, auto-stop | Static Web App, GitHub Actions, PR previews |
| 2 | API key auth, monitoring, testing | Blob storage, CDN, audio format conversion |

**Outcome**: TTS/WhisperX accessible remotely; presentations viewable via URL; PR previews active.

### Phase B: Automation + Polish (Weeks 3-4)

| Week | Content Pipeline (07) | Azure Production (04) |
|------|----------------------|----------------------|
| 3 | `detect-stale-demos.ts`, GitHub Actions workflow, GPU lifecycle | Error reporting (App Insights) |
| 4 | Testing, edge cases | PWA / offline support |

**Outcome**: Narration changes auto-generate audio and deploy. Production errors are reported. Offline playback works.

### Phase C: Feature Development (Weeks 5-6)

| Week | Slide Variants (05) |
|------|---------------------|
| 5 | `defineSlideVariants()` factory, SlidePlayer changes, audio path scheme |
| 6 | TTS script updates, Playwright support, URL-based variant selection |

**Outcome**: Framework supports multiple component variants per slide position.

### Phase D: Structural Split (Weeks 7-9)

| Week | Repo Split (06) |
|------|-----------------|
| 7 | Deep import audit, barrel expansion, workspace structure |
| 8 | Script migration, Vite config updates |
| 9 | Test migration, CI/CD rework, documentation |

**Outcome**: Clean monorepo with `packages/framework` and `packages/demos`.

### Phase E (Future): Full Separation

Only pursue if a second demo project is created:
- Extract framework to its own repo
- Publish to private npm registry
- Create template repository for new demo projects
- Set up cross-repo CI/CD

## Overlap with FUTURE_ENHANCEMENTS.md

| This Roadmap | FUTURE_ENHANCEMENTS.md | Relationship |
|-------------|----------------------|--------------|
| Slide Variants (05) | #21 A/B Testing Framework | Variants provide the component-swapping mechanism; A/B Testing adds analytics, user assignment, and statistical analysis on top |
| Azure Deployment (03) | #3 Presentation Recording | Recording could target deployed URL instead of localhost |
| Azure Deployment (03) | #16 Shareable Links | Deployed SPA makes shareable links actually work for external viewers |
| Azure Production (04) | #7 Lazy Loading Optimization | Service worker pre-caching complements lazy loading for offline use |
| Repo Split (06) | #11 Asset Management System | Repo split forces clearer asset ownership; asset management becomes more relevant with multiple demo projects |
| Content Pipeline (07) | (new) | Automated TTS + deploy pipeline not in FUTURE_ENHANCEMENTS — consider adding |

## Decision Log

| Date | Decision | Rationale |
|------|----------|-----------|
| 2026-02-23 | Created initial 4 exploration documents | Flesh out strategic ideas to assess complexity and ordering |
| 2026-02-23 | Restructured into 7 docs with new numbering | Split Azure into core + production enhancements; extracted Config Unification and Content Pipeline as standalone docs; renumbered by implementation order |
| | | |

*Update this table as decisions are made during implementation.*
