# Strategic Roadmap: Initiatives

## Overview

This document aggregates strategic initiatives for the presentation framework. These are distinct from the tactical feature list in [`docs/FUTURE_ENHANCEMENTS.md`](../FUTURE_ENHANCEMENTS.md) — initiatives 01a–01d cover package research and visual enhancements; initiatives 02-08 are architectural and infrastructure investments.

| # | Initiative | Document | Size | Status |
|---|-----------|----------|------|--------|
| — | [Packages Research](#packages-research-reference) | [`01-packages-research.md`](./01-packages-research.md) | — | Reference |
| 1a | [Visual Components](#1a-visual-components) | [`01a-visual-components.md`](./01a-visual-components.md) | M | **Done** |
| 1b | [Boilerplate Reduction](#1b-boilerplate-reduction) | [`01b-boilerplate-reduction.md`](./01b-boilerplate-reduction.md) | S-M | **Done** |
| 1c | [Must-Have Packages](#1c-must-have-packages) | [`01c-must-have-packages.md`](./01c-must-have-packages.md) | M | **Done** |
| 1d | [Nice-to-Have Packages](#1d-nice-to-have-packages) | [`01d-nice-to-have-packages.md`](./01d-nice-to-have-packages.md) | S-M | Proposed (Deferred) |
| 2 | [Config Unification](#2-config-unification) | [`02-config-unification.md`](./02-config-unification.md) | S | **Done** |
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
| Visual Components (01a) | 5 | 4 | 5 | 5 | 5 | **4.8** |
| Boilerplate Reduction (01b) | 4 | 5 | 5 | 5 | 5 | **4.8** |
| Config Unification (02) | 3 | 5 | 5 | 5 | 5 | **4.5** |
| Cloud GPU (03) | 4 | 4 | 4 | 5 | 5 | **4.4** |
| Must-Have Packages (01c) | 4 | 4 | 4 | 5 | 4 | **4.2** |
| Azure Deployment (04) | 4 | 4 | 4 | 5 | 4 | **4.2** |
| Azure Production (05) | 3 | 4 | 4 | 5 | 3 | **3.8** |
| Content Pipeline (06) | 4 | 4 | 3 | 5 | 2 | **3.6** |
| Slide Variants (07) | 3 | 3 | 3 | 4 | 4 | **3.4** |
| Nice-to-Have Packages (01d) | 3 | 4 | 4 | 5 | 5 | **4.1** |
| Repo Split (08) | 4 | 2 | 2 | 2 | 2 | **2.4** |

*Weighted Score = 0.25 &times; Value + 0.25 &times; Effort + 0.15 &times; Risk + 0.15 &times; Reversibility + 0.20 &times; Independence*

*01d scores well numerically but is deferred — it lacks immediate application and should be installed per-demo when the need arises.*

## Recommended Implementation Order

### 1a. Visual Components (01a) — Start Now

**Why first**: Highest visual impact on the flagship demo. Zero new dependencies — pure Framer Motion + SVG. New framework components (`CircularProgress`, `AnimatedHeading`, `AnimatedCheckmark`, `AnimatedArrow`) benefit all future demos. Completely independent of infrastructure work.

**Timeline**: ~3-4 sessions
**Depends on**: Nothing — fully independent
**Parallel with**: Boilerplate Reduction (01b), Config Unification (02)

### 1b. Boilerplate Reduction (01b) — Start Now (Parallel with 01a)

**Why now**: Zero new dependencies. Eliminates ~825 lines of repeated patterns across 42 instances in the flagship demo. Makes subsequent package integration (01c) touch less code. `MarkerCard` and `RevealCarousel` make new demos significantly faster to author.

**Timeline**: ~2 sessions
**Depends on**: Nothing — fully independent
**Parallel with**: Visual Components (01a)

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

### 1c. Must-Have Packages (01c) — After 01a/01b

**Why here**: Benefits from 01b completing first (less code to update after `MarkerCard` refactoring). `react-rough-notation` annotations, `shiki` CodeBlock rewrite, and `@xyflow/react` v12 are high-value, low-risk additions.

**Timeline**: ~3-4 sessions
**Depends on**: Benefits from 01b (soft dependency)

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

### 1d. Nice-to-Have Packages (01d) — Deferred (Per-Demo)

**Why deferred**: These packages (`@visx/*`, `react-type-animation`, `lottie-react`) are best justified by specific demo needs. Install them when building the demo that needs them, not speculatively.

**Timeline**: ~2-3 sessions per demo
**Depends on**: Nothing — fully independent, install on demand

### 8. Repository Split (08) — Last

**Why last**: Most disruptive — touches every import path, splits the package.json, restructures the entire project. Should only be done when the API surface is stable (i.e., after Slide Variants) and when there's a concrete need for a second demo project.

**Timeline**: ~2-3 weeks (Phase 1: monorepo workspaces)
**Depends on**: Slide Variants (07) for API stability; ideally after Azure Deployment (04) CI/CD is settled

## Dependency Graph

```
Visual Components (01a) ────── NO DEPENDENCIES ────── START NOW
  CircularProgress, AnimatedHeading, AnimatedCheckmark, AnimatedArrow
  Graduated gauge, animated bars (inline)

Boilerplate Reduction (01b) ── NO DEPENDENCIES ────── START NOW (parallel with 01a)
  MarkerCard, RevealCarousel, cardStyle() overrides, gradientBadge(), monoText()

Must-Have Packages (01c) ──── benefits from 01b ──── AFTER 01a/01b
  react-rough-notation + AnnotateAtMarker
  shiki CodeBlock rewrite
  @xyflow/react v12 upgrade

Nice-to-Have Packages (01d) ─ NO DEPENDENCIES ────── DEFERRED (per-demo)
  @visx/*, react-type-animation, lottie-react

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
- Visual Components (01a) and Boilerplate Reduction (01b) have **no dependencies** — fully independent
- Must-Have Packages (01c) benefits from 01b (soft dependency — less code to touch)
- Nice-to-Have Packages (01d) has **no dependencies** — install per-demo
- Azure Production (05) requires Azure Deployment (04)
- Content Pipeline (06) requires Cloud GPU (03) + Azure Deployment Phase 2 (04)
- Repo Split (08) should wait for Slide Variants (07) for API surface stability

**Soft dependencies (nice-to-have ordering):**
- Config Unification (02) benefits all infrastructure initiatives but technically doesn't block any
- Cloud GPU (03) running makes Slide Variants (07) development faster (remote TTS)
- Azure Deployment (04) is smoother before Repo Split (08) — one build pipeline to configure
- Must-Have Packages (01c) shiki CodeBlock rewrite should land before Slide Variants (07) to avoid reworking CodeBlock twice

## Phasing Suggestions

### Phase 0: Visual Enhancements + Boilerplate (Weeks 1-2) — START HERE

Build new framework components, reduce boilerplate, and enhance the flagship demo:

| Sub-Plan | Scope | Parallel? |
|----------|-------|-----------|
| [01a — Visual Components](./01a-visual-components.md) | `CircularProgress`, `AnimatedHeading`, `AnimatedCheckmark`, `AnimatedArrow`, graduated gauge, animated bars | Yes — 01a and 01b can run in parallel |
| [01b — Boilerplate Reduction](./01b-boilerplate-reduction.md) | `MarkerCard`, `RevealCarousel`, `cardStyle()` overrides, `gradientBadge()`, `monoText()`, `StatusLabel` | Yes — 01a and 01b can run in parallel |

Apply to `highlights-deep-dive`: Ch0 title, Ch1 arrows + cards, Ch2 pipeline flow, Ch4 gauge + carousel, Ch6 cards + carousel, Ch7 checkmarks + cards, Ch8 cards, Ch9 progress rings + bars, Ch10 closing.

**Outcome**: Flagship demo has polished visual effects. ~825 lines of boilerplate eliminated. New reusable components available for all future demos. Documented in ANIMATION_REFERENCE.md and COMPONENT_CATALOG.md.

### Phase 0.5: Must-Have Packages (Weeks 2-3)

| Sub-Plan | Scope |
|----------|-------|
| [01c — Must-Have Packages](./01c-must-have-packages.md) | `react-rough-notation` + `<AnnotateAtMarker>`, `shiki` CodeBlock rewrite, `@xyflow/react` v12 upgrade |

**Outcome**: Hand-drawn annotations synced to narration. VS Code-quality syntax highlighting. ReactFlow upgraded with dark mode and better types.

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

### Deferred: Nice-to-Have Packages (01d)

Install per-demo when the need arises:

| Package | Install When |
|---------|-------------|
| `@visx/*` | Building a metrics dashboard or chart-heavy demo |
| `react-type-animation` | Building a terminal/CLI or code generation demo |
| `lottie-react` | Adding celebration effects or polished icon animations |

See [01d](./01d-nice-to-have-packages.md) for full details and demo ideas.

## Overlap with FUTURE_ENHANCEMENTS.md

| This Roadmap | FUTURE_ENHANCEMENTS.md | Relationship |
|-------------|----------------------|--------------|
| Visual Components (01a) + Must-Have Packages (01c) | #4 Advanced Animations, #8 Chart/Data Visualization | 01a/01c build the specific components and install the packages; FUTURE_ENHANCEMENTS tracks broader capability wishlists |
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
| 2026-02-25 | Split Plan 01 into 01a–01d sub-plans | Original 800-line doc mixed research with implementation. Split into: 01-packages-research.md (reference), 01a (visual components), 01b (boilerplate reduction), 01c (must-have packages), 01d (nice-to-have packages). Each sub-plan is a clear session-sized scope. |
| 2026-02-27 | Completed Plan 01a — Visual Components | Built 4 framework components (CircularProgress, AnimatedHeading, AnimatedCheckmark, AnimatedArrow) + 2 inline enhancements (graduated gauge, animated bar chart). Showcased in new `component-showcase` demo instead of modifying `highlights-deep-dive`. Discovered pathLength animation pattern (no explicit strokeDasharray) and WSL2 reduced-motion gotcha. |
| 2026-02-27 | Completed Plan 01b — Boilerplate Reduction | Added `cardStyle()` overrides param, `monoText()`, `gradientBadge()` utilities to SlideStyles.ts. Created `MarkerCard` (MarkerDim + themed card wrapper) and `RevealCarousel` (auto-indexed one-at-a-time carousel) components. Showcased in `component-showcase` demo (slides 8-10). Refactoring of `highlights-deep-dive` deferred to a future pass. |
| 2026-02-27 | Completed Plan 02 — Config Unification | Established `.env` / `.env.production` / `.env.local.example` convention with `VITE_*` variable naming. Added `assetBaseUrl`, `ttsEnabled`, `audioFormat` to `FrameworkConfig` wired to `import.meta.env`. Added `loadApiKey()` to `server-config.ts`. Applied 01b utilities (`monoText`, `cardStyle` overrides, `MarkerCard`) to `highlights-deep-dive` demo. |
| 2026-02-27 | Completed Plan 01c — Must-Have Packages | Installed `react-rough-notation`, `shiki`, `@xyflow/react` (replacing `reactflow`). Built `AnnotateAtMarker` with zoom-compatible counter-scale fix. Built `ShikiCodeBlock` with `colorTheme` prop (`one-dark-pro`, `framework`, or any of 65+ bundled themes) — recommended as default code block. Created custom framework shiki theme mapping token scopes to `theme.colors`. Added showcase slide with 44 dark theme gallery. Migrated ReactFlow imports in Chapter2.tsx. Task 8 (integration tests) deferred. |
| | | |

*Update this table as decisions are made during implementation.*
