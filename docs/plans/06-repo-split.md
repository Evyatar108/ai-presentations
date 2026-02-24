# Repository Split: Framework + Demos

## Motivation

The `src/framework/` and `src/demos/` directories are architecturally separate — the framework provides a reusable presentation engine, while demos are project-specific content. Currently they live in one repo and one `package.json`. Splitting them would:

- **Enable reuse** — the framework can power multiple independent presentation projects
- **Enforce the boundary** — compile-time guarantees that demos only use the framework's public API
- **Independent versioning** — framework releases don't require demo changes and vice versa
- **Smaller clones** — demo repos don't carry other projects' audio/image assets (which can be 100s of MB)

## Current State

### Existing Separation

The boundary is already well-defined:

| Aspect | Status |
|--------|--------|
| Directory structure | `src/framework/` vs `src/demos/` |
| Barrel export | `src/framework/index.ts` with explicit named exports |
| Import enforcement | ESLint `no-restricted-imports` blocks `@framework/*/*` deep imports |
| TypeScript alias | `@framework` → `src/framework/index.ts` |
| No cross-contamination | Framework has zero imports from `src/demos/` |

### 6 Coupling Points

Despite the clean logical separation, these concrete coupling points exist:

#### 1. `import.meta.glob` Hardcoded to `src/demos/*`

`src/demos/registry.ts` uses Vite's glob import:
```typescript
const metadataModules = import.meta.glob<{ metadata: DemoMetadata }>('./*/metadata.ts', { eager: true });
const configLoaders = import.meta.glob<{ default: DemoConfig }>('./*/index.ts');
```

This pattern hardcodes the filesystem location of demos relative to the registry file. In a split repo, the framework can't know where demos live.

#### 2. Scripts with Deep `@framework/*` Imports

Multiple scripts under `presentation-app/scripts/` import from framework internals:

| Script | Deep Imports |
|--------|-------------|
| `generate-tts.ts` | `@framework/slides/SlideMetadata`, `@framework/utils/audioPath` |
| `generate-alignment.ts` | `@framework/alignment/types`, `@framework/utils/audioPath` |
| `calculate-durations.ts` | `@framework/slides/SlideMetadata` |
| `check-tts-cache.ts` | `@framework/slides/SlideMetadata` |
| `verify-tts.ts` | Framework types |
| `run-overflow-test.ts` | Framework types |
| `check-narration.ts` | Framework types |

These scripts bypass the barrel export because they need internal types and utilities. The ESLint rule only covers `src/`, not `scripts/`.

#### 3. Vite Plugin Depends on `scripts/utils/`

`vite-plugin-audio-writer.ts` imports handler factories from `vite-plugin-handlers/`, which in turn import from `scripts/utils/` (e.g., `tts-cache.ts`, `alignment-io.ts`, `narration-cache.ts`). These utilities are shared between CLI scripts and the Vite dev server.

#### 4. `main.tsx` Side-Effect Import

```typescript
import './demos/registry';  // Side-effect: registers all demos
```

The framework's entry point (`App.tsx` → `main.tsx`) depends on this side-effect import existing at a known relative path.

#### 5. Demo Discovery Reads Filesystem

`scripts/utils/demo-discovery.ts` (used by TTS scripts) reads the filesystem to find demos:
```typescript
// Scans src/demos/*/metadata.ts to discover all demos
```

This hardcodes the demo directory location.

#### 6. `public/` Assets Served by Framework Dev Server

Audio, images, and videos live under `public/` and are served by Vite's static file server. In a split setup, each demo project would need its own `public/` or a shared asset storage solution.

## Strategy Recommendation

### Phase 1: Monorepo with Workspaces (Recommended First Step)

Use npm or pnpm workspaces within the existing repo:

```
ai-presentations/
├── packages/
│   ├── framework/           # Publishable package
│   │   ├── src/             # Current src/framework/
│   │   ├── scripts/         # Shared CLI tools
│   │   ├── package.json     # "@presentation/framework"
│   │   └── tsconfig.json
│   └── demos/               # Current project (depends on framework)
│       ├── src/
│       │   ├── demos/       # Current src/demos/
│       │   ├── main.tsx
│       │   ├── App.tsx
│       │   └── project.config.ts
│       ├── public/          # Audio, images, videos
│       ├── vite.config.ts
│       ├── package.json     # Depends on "@presentation/framework"
│       └── tsconfig.json
├── tts/                     # TTS server scripts (shared infra)
├── docs/
├── package.json             # Root workspace config
└── pnpm-workspace.yaml      # Or npm workspaces in root package.json
```

**Key decisions for Phase 1:**

| Decision | Approach |
|----------|----------|
| Framework package name | `@presentation/framework` (scoped, private) |
| Demo registration | Framework exports a `registerDemo()` function; demos call it explicitly |
| Auto-discovery | Moves to the demo package's `registry.ts` (Vite glob stays in demo land) |
| Scripts | Split: framework-generic scripts in `packages/framework/scripts/`, demo-specific scripts in `packages/demos/scripts/` |
| Vite plugin | Stays in `packages/demos/` (it's authoring tooling) |
| Shared script utils | Framework exports them or they become a third `packages/scripts-utils/` package |
| `@framework` alias | Replaced by `@presentation/framework` package import |
| TypeScript | Project references (`packages/framework/tsconfig.json` referenced by `packages/demos/tsconfig.json`) |

### Phase 2: Full Separate Repos (Future Option)

Once the monorepo boundary is proven stable:
1. Extract `packages/framework/` to its own git repo
2. Publish to a private npm registry (GitHub Packages, Verdaccio, etc.)
3. Demo repos install it as a regular dependency
4. Version pinning via `package.json` semver

This is a significant operational step (CI/CD for framework, release workflow, cross-repo testing) and should only be done when there are multiple independent demo projects that justify the overhead.

## Key Decisions to Resolve

### 1. Demo Registration Mechanism

**Current**: `import.meta.glob` auto-discovers demos in `src/demos/*/`
**After split**: The framework can't glob into the demo package's source

Options:
- **(A)** Demo package's `registry.ts` continues to use `import.meta.glob` and calls `DemoRegistry.registerDemo()` for each found demo. Framework provides the registry API but not the discovery. **Recommended** — minimal change, glob stays in demo land.
- **(B)** Framework provides a Vite plugin that auto-discovers demos based on a configurable glob pattern. Adds Vite coupling to the framework.
- **(C)** Each demo self-registers via a top-level side effect. No auto-discovery — manual registration.

### 2. Script Package Ownership

Scripts fall into categories:

| Category | Examples | Owner |
|----------|----------|-------|
| Framework-generic | `check-narration.ts`, `calculate-durations.ts` | Framework |
| TTS infrastructure | `generate-tts.ts`, `generate-alignment.ts`, `verify-tts.ts` | Framework or shared |
| Demo-specific | `run-overflow-test.ts`, `run-screenshot-test.ts` | Demo package |
| Shared utilities | `tts-cache.ts`, `server-config.ts`, `narration-cache.ts`, `alignment-io.ts` | Framework or shared |

Challenge: Many scripts need both framework types (e.g., `SlideMetadata`, `AudioSegment`) AND demo-specific data (which demos exist, where their files are). Clean separation requires:
- Framework exports all needed types from its barrel
- Scripts accept demo paths as arguments rather than hardcoding filesystem locations

### 3. Vite Plugin Split

`vite-plugin-audio-writer.ts` and its handlers (`vite-plugin-handlers/`) depend on `scripts/utils/`. Options:
- **(A)** Plugin stays in demo package, imports shared utils from framework package
- **(B)** Framework publishes a Vite plugin that demo packages install
- **(C)** Plugin uses only its own utility code (duplicates some logic)

**Recommended**: (A) for Phase 1 — plugin stays local, imports utils from `@presentation/framework/scripts`.

### 4. Barrel Export Completeness Audit

The framework barrel (`src/framework/index.ts`) may not export everything that scripts currently deep-import. This is a substantial subtask — **7+ scripts** have deep `@framework/*` imports (see coupling point #2 above). Before splitting:

- **Full audit**: List every `@framework/*` import across `scripts/`, `vite-plugin-*`, and `tests/`
- **Categorize**: Which are types-only (can go in barrel) vs. runtime utilities (may need secondary entry point)
- **Add missing exports** to the barrel (types, utility functions)
- **Or create a secondary entry point** (`@presentation/framework/scripts`) for script-only exports — this avoids bloating the main barrel with internals that only CLI tools need
- **Tracking**: Given the scope (7+ scripts, each with multiple imports), track this as an explicit subtask with a checklist, not a bullet point

### 5. Framework CLI / Project Scaffold

After the split, creating a new demo project requires knowing the workspace structure, dependencies, and boilerplate. The existing `scripts/new-demo.ps1` scaffolds a demo *within* a project, but there's no project-level scaffold.

Options:
- **(A)** `npx @presentation/framework init` — CLI command that scaffolds a new demo project with `package.json`, `vite.config.ts`, `tsconfig.json`, sample demo, and `registry.ts`
- **(B)** Template repository on GitHub — `Use this template` button creates a new repo pre-configured as a demo project
- **(C)** Both — template repo for initial setup, CLI for adding infrastructure (Vite plugin config, script wiring)

**Recommended**: (B) for Phase 1 — lowest effort, no code to maintain. (A) becomes worthwhile only if there are frequent new project creations.

### 6. Environment Configuration Unification

The codebase currently has **5 separate config patterns** (see doc 01 — Config Unification). The repo split is an opportunity to formalize ownership:

- Framework package owns `FrameworkConfig` (TypeScript runtime config)
- Demo package owns `.env.*` files for `VITE_*` build-time variables
- `server_config.json` stays external (machine-specific, not checked in)
- `process.env.*` overrides in scripts follow a consistent naming convention

This isn't strictly required for the split but reduces confusion if addressed during the migration.

## Migration Path

### Step-by-Step for Phase 1

1. **Audit deep imports**: List all imports from `@framework/*` in `scripts/` and `vite-plugin-*`
2. **Expand barrel exports**: Add missing types/utilities to `src/framework/index.ts`
3. **Create workspace structure**: Move files into `packages/framework/` and `packages/demos/`
4. **Update `tsconfig.json`**: Switch from path alias to project references
5. **Update Vite config**: Adjust `resolve.alias` for new structure
6. **Update npm scripts**: Adjust paths in `package.json` scripts
7. **Test everything**: `npm run type-check && npm run test && npm run build`
8. **Update CI/CD**: Adjust any GitHub Actions for new paths

### Breaking Changes

- `@framework` import alias changes to `@presentation/framework` package name
- All existing demos need import path updates (search-and-replace)
- `tsconfig.json` path mapping changes
- Vite config alias changes
- Any hardcoded paths in scripts need updating

## Challenges & Open Questions

### Circular Dependencies

Scripts that need both framework types AND demo data create a potential circular dependency:
- Framework publishes types → Demo defines slides using types → Scripts need both
- Solution: Scripts live in the demo package and import framework as a dependency

### Testing Strategy

- Framework tests: Self-contained, run in framework package
- Demo tests: May need framework test utilities (already exported as `TestSlideWrapper`, etc.)
- Integration tests: Run in demo package against compiled framework
- The existing 248 vitest tests need to be split between packages

### DemoRegistry Singleton

`DemoRegistry` uses a module-level `Map`. In a monorepo with workspaces, the framework is typically symlinked — so there's one instance. But with a published package, the singleton pattern works fine since there's one `node_modules/@presentation/framework/`.

### Asset Handling

Each demo project needs its own `public/audio/`, `public/images/`, etc. This is already the case — assets are isolated per demo ID. The only shared asset is `silence-1s.wav`, which the framework should provide.

## Dependencies

- **Should be done last** — most disruptive, benefits from stable API surface
- **Depends on Slide Variants (05)** being finalized — variant support changes the framework API
- **Benefits from Config Unification (01)** — config ownership is clearer
- **Independent of Cloud GPU (02)** and **Azure Deployment (03)**, though CI/CD pipeline (03) may need rework after split

## Effort Estimate

| Phase | Work | Time |
|-------|------|------|
| Deep import audit + barrel expansion | Map all coupling points, fix exports | 3-4 hours |
| Workspace structure setup | File moves, package.json, tsconfig | 4-6 hours |
| Script migration | Update paths, split ownership | 6-8 hours |
| Vite config + plugin updates | Alias changes, plugin imports | 3-4 hours |
| Test migration + verification | Split tests, verify all pass | 4-6 hours |
| Documentation updates | CLAUDE.md, ARCHITECTURE.md, README | 2-3 hours |
| **Total (Phase 1)** | | **~2-3 weeks** |

Phase 2 (full repo split): Additional ~1-2 weeks for npm publishing, cross-repo CI, release workflow.

**Size: XL**

## Key Files

| File | Impact |
|------|--------|
| `src/framework/index.ts` | Barrel export audit + expansion |
| `src/demos/registry.ts` | Stays in demo package; glob pattern unchanged |
| `src/main.tsx` | Side-effect import path changes |
| `vite.config.ts` | Alias and workspace path updates |
| `vite-plugin-audio-writer.ts` | Import path changes for shared utils |
| `package.json` | Split into root + packages/framework + packages/demos |
| `tsconfig.json` | Split into project references |
| `scripts/*.ts` (all) | Path updates, ownership assignment |
| `scripts/utils/*.ts` (all) | Move to framework or shared package |
| `.eslintrc.*` | Update `no-restricted-imports` for new package name |

## Reversibility

**Partially reversible** — the monorepo workspace structure can be collapsed back to a flat layout, but it requires undoing all the import path changes. The more time passes and the more the packages evolve independently, the harder it becomes to merge back. This is the least reversible of all initiatives, which is why it should be done last when the API surface is stable.
