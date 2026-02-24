# Strategic Roadmap: Initiatives

## Overview

This document aggregates eight strategic initiatives for the presentation framework. These are distinct from the tactical feature list in [`docs/FUTURE_ENHANCEMENTS.md`](../FUTURE_ENHANCEMENTS.md) — initiative 01 covers package research and visual enhancements; initiatives 02-08 are architectural and infrastructure investments.

| # | Initiative | Document | Size | Status |
|---|-----------|----------|------|--------|
| 1 | [Packages & Enhancements](#1-packages--enhancements) | [`01-packages-and-enhancements.md`](./01-packages-and-enhancements.md) | M-L | Proposed |
| 2 | [Config Unification](#2-config-unification) | [`02-config-unification.md`](./02-config-unification.md) | S | Proposed |
| 3 | [Cloud GPU](#3-cloud-gpu) | [`03-cloud-gpu.md`](./03-cloud-gpu.md) | M | Proposed |
| 4 | [Azure Deployment](#4-azure-deployment) | [`04-azure-deployment.md`](./04-azure-deployment.md) | M | Proposed |
| 5 | [Azure Production Enhancements](#5-azure-production-enhancements) | [`05-azure-production.md`](./05-azure-production.md) | S-M | Proposed |
| 6 | [Content Pipeline](#6-content-pipeline) | [`06-content-pipeline.md`](./06-content-pipeline.md) | S-M | Proposed |
| 7 | [Slide Variants](#7-slide-variants) | [`07-slide-variants.md`](./07-slide-variants.md) | M | Proposed |
| 8 | [Repo Split](#8-repo-split) | [`08-repo-split.md`](./08-repo-split.md) | XL | Proposed |

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
| Packages & Enhancements (01) | 5 | 4 | 5 | 5 | 5 | **4.8** |
| Config Unification (02) | 3 | 5 | 5 | 5 | 5 | **4.5** |
| Cloud GPU (03) | 4 | 4 | 4 | 5 | 5 | **4.4** |
| Azure Deployment (04) | 4 | 4 | 4 | 5 | 4 | **4.2** |
| Azure Production (05) | 3 | 4 | 4 | 5 | 3 | **3.8** |
| Content Pipeline (06) | 4 | 4 | 3 | 5 | 2 | **3.6** |
| Slide Variants (07) | 3 | 3 | 3 | 4 | 4 | **3.4** |
| Repo Split (08) | 4 | 2 | 2 | 2 | 2 | **2.4** |

*Weighted Score = 0.25 &times; Value + 0.25 &times; Effort + 0.15 &times; Risk + 0.15 &times; Reversibility + 0.20 &times; Independence*

## Recommended Implementation Order

### 1. Packages & Enhancements (01) — Start Now

**Why first**: Highest weighted score (4.8). Directly improves the flagship demo's visual impact — the thing audiences actually see. Phase 1 requires zero new dependencies (pure Framer Motion + SVG), so there's no risk or bundle cost. New framework components (`CircularProgress`, `AnimatedHeading`, `AnimatedCheckmark`, `AnimatedArrow`) benefit all future demos too. Completely independent of infrastructure work.

**Timeline**: ~1-2 weeks (3 internal phases)
**Depends on**: Nothing — fully independent
**Parallel with**: Can overlap with Config Unification (02) or any infrastructure initiative

### 2. Config Unification (02) — Day 1 Prerequisite for Infrastructure

**Why next**: Every infrastructure initiative adds config (env vars, URLs, API keys). Establishing `.env.development` / `.env.production` and the `VITE_*` naming convention before other work prevents config sprawl.

**Timeline**: ~1-2 hours
**Blocks**: Nothing, but all infrastructure initiatives benefit from it

### 3. Cloud GPU (03) — Start First (Infrastructure)

**Why here**: Highest value/effort ratio among infrastructure initiatives. The servers are already HTTP — only configuration URLs change. Zero code changes for the basic case. Unblocks remote work and team collaboration on TTS/alignment.

**Timeline**: ~1-1.5 weeks
**Parallel with**: Azure Deployment (04)

### 4. Azure Deployment (04) — Overlap with Cloud GPU

**Why here**: SPA deployment (Phase 1) is straightforward and can start immediately. PR preview environments come nearly free. Blob storage + CDN (Phase 2) adds scope but is independent of other work.

**Timeline**: ~1-1.5 weeks (Phase 1 can start day 1, overlapping with Cloud GPU)
**Depends on**: Config Unification (02) for `VITE_*` pattern

### 5. Azure Production Enhancements (05) — After Core Deployment

**Why here**: Error reporting and offline support are production-quality polish. They depend on Azure being deployed (04) and MP3 conversion being in place (04, Phase 3). Can be deferred until the deployed SPA sees real usage.

**Timeline**: ~5-10 hours
**Depends on**: Azure Deployment (04)

### 6. Content Pipeline (06) — After Cloud GPU + Azure

**Why here**: The automated pipeline is the payoff of doing Cloud GPU and Azure Deployment first — it stitches them together. Requires cloud GPU to be accessible from CI runners and blob storage to be available.

**Timeline**: ~4-6 hours
**Depends on**: Cloud GPU (03) + Azure Deployment Phase 2 (04)

### 7. Slide Variants (07) — After Infrastructure Stabilizes

**Why here**: A feature that changes the framework's public API surface (`defineSlideVariants`, extended types, new audio path scheme). Should be finalized before the repo split so the API surface is stable.

**Timeline**: ~1-1.5 weeks
**Depends on**: Nothing technically, but benefits from Cloud GPU for faster TTS iteration

### 8. Repository Split (08) — Last

**Why last**: Most disruptive — touches every import path, splits the package.json, restructures the entire project. Should only be done when the API surface is stable (i.e., after Slide Variants) and when there's a concrete need for a second demo project.

**Timeline**: ~2-3 weeks (Phase 1: monorepo workspaces)
**Depends on**: Slide Variants (07) for API stability; ideally after Azure Deployment (04) CI/CD is settled

## Dependency Graph

```
Packages & Enhancements (01) ──── NO DEPENDENCIES ──── START NOW
  Phase 1: Pure Framer Motion + SVG (zero new deps)
  Phase 2: Must-have packages (rough-notation, shiki, xyflow v12)
  Phase 3: Nice-to-have packages (visx, type-animation, lottie)

                    ┌─── can run in parallel ───┐
                    ▼                            ▼

Config Unification (02) ─────────────────────────────────────────────┐
  (prerequisite — establishes env var pattern)                       │
                                                                     │
Cloud GPU (03) ──────────────────────────────────────────────┐       │
  (config URLs only, no code changes)                        │       │
                                                             │       │
Azure Deployment (04) ───────────────────────────────┐       │       │
  Phase 1: SPA deploy                                │       │       │
  Phase 2: Blob storage + CDN                        │       │       │
  Phase 3: CI/CD + audio conversion                  │       │       │
                                                     │       │       │
Azure Production (05) ◄──────────────────────────────┘       │       │
  Part A: Error reporting                                    │       │
  Part B: Offline/PWA (needs MP3 from Phase 3)               │       │
                                                             │       │
Content Pipeline (06) ◄──────────────────────────────────────┘       │
  (orchestrates Cloud GPU + Azure Blob)                              │
                                                                     │
Slide Variants (07) ─────────────────────────────────────┐           │
  (changes framework API surface)                        │           │
                                                         ▼           │
Repo Split (08) ─────────────────────────────────────────────────────┘
  Phase 1: Monorepo workspaces (after API stable)
  Phase 2: Full split (future, when justified)
```

**Hard dependencies:**
- Packages & Enhancements (01) has **no dependencies** — fully independent of infrastructure
- Azure Production (05) requires Azure Deployment (04)
- Content Pipeline (06) requires Cloud GPU (03) + Azure Deployment Phase 2 (04)
- Repo Split (08) should wait for Slide Variants (07) for API surface stability

**Soft dependencies (nice-to-have ordering):**
- Config Unification (02) benefits all infrastructure initiatives but technically doesn't block any
- Cloud GPU (03) running makes Slide Variants (07) development faster (remote TTS)
- Azure Deployment (04) is smoother before Repo Split (08) — one build pipeline to configure
- Packages & Enhancements Phase 2 (shiki CodeBlock rewrite) should land before Slide Variants (07) to avoid reworking CodeBlock twice

## Phasing Suggestions

### Phase 0: Visual Enhancements (Weeks 1-2) — START HERE

Build new framework components and enhance the flagship demo. Three internal phases:

| Phase | Packages & Enhancements (01) | Scope |
|-------|------------------------------|-------|
| 01-P1 | `CircularProgress`, `AnimatedHeading`, `AnimatedCheckmark`, `AnimatedArrow` | Zero new deps — pure Framer Motion + SVG |
| 01-P2 | `react-rough-notation`, `shiki` CodeBlock rewrite, `@xyflow/react` v12 | Must-have packages |
| 01-P3 | `@visx/*`, `react-type-animation`, `lottie-react` (as needed per demo) | Nice-to-have packages |

Apply to `highlights-deep-dive`: Ch0 title, Ch1 annotations, Ch2 pipeline flow, Ch7 checkmarks, Ch9 progress rings, Ch10 closing.

**Outcome**: Flagship demo has polished visual effects. New reusable components available for all future demos. Documented in ANIMATION_REFERENCE.md.

### Phase 1: Foundation (Day 1, can overlap with Phase 0)

| Task | Time |
|------|------|
| Config Unification: `.env` files, `VITE_*` pattern, docs | 1-2 hours |

**Outcome**: Clean config foundation for all infrastructure initiatives.

### Phase A: Infrastructure (Weeks 2-3)

Work on Cloud GPU and Azure Deployment in parallel:

| Week | Cloud GPU (03) | Azure Deployment (04) |
|------|---------------|----------------------|
| 2 | Dockerfile, gunicorn, AWS setup, auto-stop | Static Web App, GitHub Actions, PR previews |
| 3 | API key auth, monitoring, testing | Blob storage, CDN, audio format conversion |

**Outcome**: TTS/WhisperX accessible remotely; presentations viewable via URL; PR previews active.

### Phase B: Automation + Polish (Weeks 4-5)

| Week | Content Pipeline (06) | Azure Production (05) |
|------|----------------------|----------------------|
| 4 | `detect-stale-demos.ts`, GitHub Actions workflow, GPU lifecycle | Error reporting (App Insights) |
| 5 | Testing, edge cases | PWA / offline support |

**Outcome**: Narration changes auto-generate audio and deploy. Production errors are reported. Offline playback works.

### Phase C: Feature Development (Weeks 6-7)

| Week | Slide Variants (07) |
|------|---------------------|
| 6 | `defineSlideVariants()` factory, SlidePlayer changes, audio path scheme |
| 7 | TTS script updates, Playwright support, URL-based variant selection |

**Outcome**: Framework supports multiple component variants per slide position.

### Phase D: Structural Split (Weeks 8-10)

| Week | Repo Split (08) |
|------|-----------------|
| 8 | Deep import audit, barrel expansion, workspace structure |
| 9 | Script migration, Vite config updates |
| 10 | Test migration, CI/CD rework, documentation |

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
| Packages & Enhancements (01) | #4 Advanced Animations, #8 Chart/Data Visualization | 01 builds the specific components and installs the packages; FUTURE_ENHANCEMENTS tracks broader capability wishlists |
| Slide Variants (07) | #21 A/B Testing Framework | Variants provide the component-swapping mechanism; A/B Testing adds analytics, user assignment, and statistical analysis on top |
| Azure Deployment (04) | #3 Presentation Recording | Recording could target deployed URL instead of localhost |
| Azure Deployment (04) | #16 Shareable Links | Deployed SPA makes shareable links actually work for external viewers |
| Azure Production (05) | #7 Lazy Loading Optimization | Service worker pre-caching complements lazy loading for offline use |
| Repo Split (08) | #11 Asset Management System | Repo split forces clearer asset ownership; asset management becomes more relevant with multiple demo projects |
| Content Pipeline (06) | (new) | Automated TTS + deploy pipeline not in FUTURE_ENHANCEMENTS — consider adding |

## Decision Log

| Date | Decision | Rationale |
|------|----------|-----------|
| 2026-02-23 | Created initial 4 exploration documents | Flesh out strategic ideas to assess complexity and ordering |
| 2026-02-23 | Restructured into 7 docs with new numbering | Split Azure into core + production enhancements; extracted Config Unification and Content Pipeline as standalone docs; renumbered by implementation order |
| 2026-02-23 | Added Packages & Enhancements as first-priority initiative | High visual impact on flagship demo, zero-dep Phase 1, fully independent of infrastructure — delivers audience-facing value immediately |
| 2026-02-23 | Renumbered all docs 01-08 to match priority order | Packages & Enhancements → 01, Config → 02, Cloud GPU → 03, Azure Deploy → 04, Azure Prod → 05, Content Pipeline → 06, Slide Variants → 07, Repo Split → 08 |
| | | |

*Update this table as decisions are made during implementation.*
