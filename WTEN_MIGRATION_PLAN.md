# wten-migration-ui-components/ Port — Multi-Session Plan

This plan ports the untracked `wten-migration-ui-components/` directory (a paste of the [`planetary_agents-main`](file:///Users/cookingwithcastro/Desktop/planetary_agents-main) Next.js app's UI surface) into the WhatToEatNext codebase under `src/`. After Session 1's full transitive-dep closure (2026-05-20), the scope is **~54 files / ~22k LOC** — split across 11 sessions because that's still too large for one chat.

Each session prompt below is **self-contained**. Copy-paste a session into a fresh Claude Code chat and it will have everything it needs to do that session's work.

---

## Progress reconciliation (2026-05-29, verified against git)

The per-session `[x]` checkboxes below were only filled in for Session 1; later sessions shipped without updating them. Actual state on `master`:

- **Session 1** ✅ — closure audit.
- **Session 2** ✅ — shadcn UI + leaf utilities (merged).
- **Session 3** ✅ — foundation libs (`#419`); also did opportunistic bonus ports of `kinetics-client` + `agents/kinetic-profiles` (commit `1a046c03`).
- **Session 4** ✅ — astronomy + ephemeris (`#420`).
- **Session 5** ✅ — monica + alchemy core (`#422`, commit `8e85096c`).
- **Session 6** ✅ — agent layer ported in commit `d1449d23` (consciousness-memory, unified-agent-factory, degree-planetary-agent-mapping, planetary-agent-activation, degree-agent-matcher) + the 2 Session-3 bonus ports. The 8th module, `alchemical-kinetics-sampler.ts`, was deferred there and **completed on 2026-05-29** (branch `claude/wten-migration-session-6-sampler`) — see the Session 6 note below.
- **Sessions 7–11** — pending. **7 of 11 effectively done.**

> Plan line counts are stale where the source repo evolved after the 2026-05-20 audit (e.g. `alchemical-kinetics-sampler.ts` is 415L, not 33L). Re-measure against the source before trusting a session's size estimate.

---

## Shared context (reference for every session)

### Repo layout
- **Target repo**: `/Users/cookingwithcastro/Desktop/WhatToEatNext-master` (this repo). Branch from `origin/master`.
- **Source repo**: `/Users/cookingwithcastro/Desktop/planetary_agents-main` (sibling on disk). Read-only — all ports copy FROM here TO `src/` in the target repo.
- **Staging dir**: `wten-migration-ui-components/` at the root of the target repo. Currently untracked; `tsconfig.json` excludes it (`"wten-migration-ui-components/**"`) so it doesn't poison typecheck/lint. Final session removes that exclusion.

### Toolchain (per CLAUDE.md)
- Always `bun`, never `npm` / `yarn`. `bun install`, `bun run dev`, `bun run build`, `bun run typecheck`, `bun run lint`.
- `packageManager`: `bun@1.3.13` pinned in `package.json`.

### Path aliases (from `tsconfig.json`)
- `@/*` → `src/*`
- `@components/*` → `src/components/*`
- `@lib/*` → `src/lib/*`
- `@hooks/*` → `src/hooks/*`
- (etc.)

The source repo uses the same `@/*` → `src/*` convention but its `src/` is the source repo's root `lib/`, `components/`, `hooks/`. So `@/lib/foo` in a source file maps to `lib/foo` in `planetary_agents-main`. **Adaptation is mostly path-equivalent.**

### Known gotchas (PR #413 + this work)
- `bun run verify` (typecheck + lint) does **not** exercise the production `next build`. Always `bun run build` before pushing route-handler changes.
- Pre-commit hook (husky) runs `bun run typecheck && bun run lint` — both must pass. Untracked broken files in tsconfig include paths will block the hook.
- Next.js 15's route type-check rejects generic context typings like `Record<string, unknown>`. Use rest-tuple generics for dynamic routes.
- CSS Modules' "pure selectors" rule rejects `:global(.foo)` without a local class.
- `wten-migration-ui-components/` has 20+ non-import TS errors (TS2339, TS2769, TS2345) that survive even after all imports resolve. Session 11 fixes those.

### Dep graph — full closure (audited 2026-05-20, Session 1)

All modules in `planetary_agents-main/` that need porting. Topo-sorted: leaves first, then ordered so each module's deps appear above it. "Internal deps" lists OTHER modules in this table (not external libs or shadcn UI).

#### Leaves (no internal deps; can be ported in any order)

| Module | LOC | Notes |
| --- | ---: | --- |
| `lib/observability.ts` | 12 | Port to `src/lib/observability-legacy.ts` — name clash with existing `src/lib/observability/` dir |
| `lib/kinetics-integration.ts` | 16 | |
| `lib/performance-cache.ts` | 154 | |
| `lib/structured-logger.ts` | 420 | |
| `lib/agent-types.ts` | 499 | Pure types |
| `lib/astrological-data.ts` | 199 | **NEW** (transitive — surfaced in Session 1) |
| `lib/elemental-reinforcement.ts` | 430 | |
| `lib/core-energy-rules.ts` | 523 | |
| `lib/moon-phase-calculator.ts` | 396 | |
| `lib/planetary-motion-tracker.ts` | 473 | |
| `lib/planetary-api-client.ts` | 291 | Check for env var `NEXT_PUBLIC_PLANETARY_API_URL` or similar |
| `lib/enhanced-astronomical-calculator.ts` | 881 | Pure math, no deps |
| `lib/ephemeris/solar-ephemeris.ts` | 357 | **NEW** (transitive) |
| `lib/historical-transit-data.ts` | 690 | **NEW** (transitive) |
| `lib/kinetics-client.ts` | 27 | **NEW** (transitive) |
| `lib/astrological-character-vectors.ts` | 740 | **NEW** (transitive) |
| `lib/agents/kinetic-profiles.ts` | 732 | |
| `lib/alchemical-kinetics-sampler.ts` | 33 | |
| `lib/degree-planetary-agent-mapping.ts` | 406 | |
| `lib/runes/rune-system.ts` | 431 | |
| `lib/historical-transits.ts` | 274 | **NEW** (transitive). **ADAPTATION REQUIRED**: drops `@prisma/client` import — see "Severed chains" below |
| `hooks/useGalileoLog.ts` | 140 | react-only |

#### Single-dep tier

| Module | LOC | Internal deps |
| --- | ---: | --- |
| `lib/unified-agent-types.ts` | 255 | `agent-types` |
| `lib/galileo-logger.ts` | 548 | `core-energy-rules` |
| `lib/ephemeris/degree-calendar-map.ts` | 405 | `ephemeris/solar-ephemeris` (**NEW**) |
| `lib/calculate-transits.ts` | 56 | `enhanced-astronomical-calculator` |
| `lib/transit-patterns.ts` | 380 | `historical-transit-data`, `historical-transits` (**NEW**) |
| `lib/astrological-pattern-recognition.ts` | 667 | `planetary-motion-tracker` |
| `lib/degree-agent-mapping.ts` | 541 | `agents/kinetic-profiles` (**NEW** — distinct from `degree-planetary-agent-mapping`) |
| `lib/runes/sign-vector-runes.ts` | 701 | `astrological-character-vectors` (**NEW**), `runes/rune-system` |

#### Multi-dep tier

| Module | LOC | Internal deps |
| --- | ---: | --- |
| `lib/monica/horoscope-generator.ts` | 679 | `enhanced-astronomical-calculator`, `ephemeris/solar-ephemeris`, `ephemeris/degree-calendar-map`. **ADAPTATION**: inline `BirthInfo` (was imported from `./alchemical-trainer`) — see "Severed chains" |
| `lib/planetary-config-helper.ts` | 240 | `unified-agent-types`, `agent-types`, `astrological-data`, `moon-phase-calculator` |
| `lib/agents/consciousness-memory.ts` | 413 | `agent-types`, `kinetics-client`, `agents/kinetic-profiles` |
| `lib/unified-agent-factory.ts` | 430 | `unified-agent-types`, `agent-types`, `astrological-data`, `moon-phase-calculator` |
| `lib/dynamic-aspects-engine.ts` | 571 | `planetary-motion-tracker`, `astrological-pattern-recognition` |
| `lib/alchemizer.ts` | 1122 | `performance-cache`, `monica/horoscope-generator`, `observability` |
| `lib/celestial-energy-calculator.ts` | 729 | `monica/horoscope-generator` |
| `lib/services/planetary-agent-activation.ts` | 445 | `degree-planetary-agent-mapping`, `unified-agent-factory`, `unified-agent-types`, `astrological-data`, `moon-phase-calculator`, `planetary-config-helper` |
| `lib/temporal-analysis-engine.ts` | 979 | `agents/kinetic-profiles`, `planetary-api-client`, `agents/consciousness-memory`, `structured-logger`, `alchemical-kinetics-sampler`, `transit-patterns`, `astrological-pattern-recognition`, `degree-agent-mapping` |
| `lib/degree-agent-matcher.ts` | 916 | `agent-types`, `celestial-energy-calculator` |

#### Components (UI leaves — only depend on shadcn + react + lucide-react + date-fns)

| Module | LOC | shadcn / external |
| --- | ---: | --- |
| `components/charts/aspect-phase-indicator.tsx` | 392 | ui/badge |
| `components/natal-chart-input.tsx` | 294 | ui/button+input+label+card+textarea+select |
| `components/planetary-agent-display.tsx` | 345 | ui/badge+card+button+separator |
| `components/transit-comparison.tsx` | 604 | ui/card+button+badge+dialog+select+progress+alert+separator+checkbox+label, date-fns |
| `components/transit-notification-center.tsx` | 566 | ui/button+card+badge+dialog+select+tabs+alert-dialog, date-fns |
| `components/job-monitoring-dashboard.tsx` | 500 | ui/card+button+badge+dialog+select+switch+progress+alert+separator+label, date-fns |

#### Components (with internal deps)

| Module | LOC | Internal deps |
| --- | ---: | --- |
| `components/misc/cosmic-time-laboratory.tsx` | 572 | `elemental-reinforcement` |
| `components/misc/temporal-oracle.tsx` | 460 | `temporal-analysis-engine` (+ ui/textarea) |
| `components/misc/temporal-timeline.tsx` | 661 | `elemental-reinforcement`, `temporal-analysis-engine` (+ recharts) |
| `components/natal-chart-manager.tsx` | 475 | `natal-chart-input`, `planetary-agent-display` (+ ui/dialog+alert-dialog) |
| `components/transit-dashboard.tsx` | 966 | `planetary-agent-display` (+ ui/tabs+slider+dialog+alert-dialog+select+switch+input+label+checkbox) |

**Total: 39 lib files + 1 hook + 11 components = 51 modules, ~21,600 LOC** (plus 3 wten-only components and 2 small adapter edits).

### shadcn UI components missing in target

Target already has: `avatar`, `badge`, `button`, `card`, `checkbox`, `input`, `label`, `progress`, `scroll-area`, `select`, `slider`, `tabs`. Required by the ports but missing: `dialog`, `separator`, `switch`, `alert`, `textarea`, `alert-dialog` (6 components — note `alert-dialog` was missed in the original plan; surfaced by Session 1's audit). Run once in Session 2:

```bash
bunx shadcn add dialog separator switch alert textarea alert-dialog
```

### External npm packages

- **`date-fns`**: NOT in target `package.json`. Used by 5 ported components (`format`, `formatDistanceToNow`, `differenceInDays`). Source uses `date-fns@2.30.0`. Run `bun add date-fns@2` in Session 2.
- **`recharts`**: target has `^3.8.1` ✓. No action.
- **`lucide-react` — version mismatch flag**: target has `^1.14.0` (the OLD 1.x line, frozen 2021). Source uses `^0.542.0` (the modern, maintained 0.x line — same package, renumbered). The two versions have different icon name sets. Recommend upgrading target to `^0.542.0` BEFORE Session 8 (the first component-porting session): `bun add lucide-react@^0.542.0`. The existing target consumers use common icons (`Flame`, `Droplets`, `AlertTriangle`, `RefreshCw`, …) that all exist in the modern version — low regression risk.
- **`@prisma/client`**: source uses this in `lib/historical-transits.ts`. Target uses raw `pg` (no Prisma). Do NOT install — strip the import instead (see "Severed chains" below).

### Severed chains (deliberately not ported)

**`alchemical-trainer` chain** — 6 files / 2,889 LOC of training-pipeline code that the UI does not need. The ONLY hook is one `BirthInfo` type import in `monica/horoscope-generator.ts:4`. Adaptation: inline the `BirthInfo` interface in `horoscope-generator.ts` (7 fields: `year`, `month`, `day`, `hour`, `minute`, `latitude`, `longitude` — `alchemical-trainer.ts:21-29`). This eliminates:

- `lib/monica/alchemical-trainer.ts` (893L)
- `lib/monica/monica-constant.ts` (362L)
- `lib/services/planetary-position-sync.ts` (511L)
- `lib/services/sync-monitoring.ts` (377L)
- `lib/backend.ts` (608L) — would have required Prisma schema port
- `lib/planetary-hour.ts` (138L)

**`@prisma/client` in `historical-transits.ts`** — only used in `getTransitsForDate(date, prisma?: PrismaClient)` as an optional path; the function already has a fallback that returns `[]`. Adaptation: drop the `@prisma/client` import + simplify `getTransitsForDate` to always return `[]`. The wten UI never passes a prisma instance, so this is a no-op for the live code path.

### Modules that exist in `wten/` but NOT in source repo (port-from-wten)
- `wten-migration-ui-components/components/misc/alchm-quantities-display.tsx`
- `wten-migration-ui-components/components/misc/kinetics-visualization.tsx`
- `wten-migration-ui-components/components/charts/alchemical-metrics-chart.tsx`

### Modules that exist in target at different paths (path-redirect, not port)
- `alchm-quantities-trends` → already at `src/components/alchm-quantities-trends.tsx`
- `zodiac-wheel` → already at `src/components/time-laboratory/zodiac-wheel-interactive.tsx`

### Verification pattern per session
After each session's ports:
1. `bun run typecheck` — should pass (0 errors). Untracked `wten/` is excluded, so a port that breaks IT won't fail typecheck; you must spot-check separately by temporarily un-excluding the wten/ file that consumes the ported module.
2. `bun run lint` — 0 errors allowed (warnings OK).
3. `bun run build` — must succeed. Move `wten-migration-ui-components/` aside (`mv wten-migration-ui-components /tmp/`) before running if the build fails on it; restore after.
4. Open PR per session. Each PR is small enough to review.

---

## Session 1 — Full closure audit + final session breakdown ✅ COMPLETE

This session is **done** (2026-05-20). The dep table above and Sessions 2–11 below reflect its findings. Summary of what changed vs. the original plan:

**Closure (transitive deps surfaced)**
- 8 new modules pulled in by level-1 deps: `astrological-data` (199L), `monica/alchemical-trainer` (severed — see below), `ephemeris/solar-ephemeris` (357L), `ephemeris/degree-calendar-map` (405L), `kinetics-client` (27L), `transit-patterns` (380L), `degree-agent-mapping` (541L), `astrological-character-vectors` (740L).
- 2 more pulled in by `transit-patterns`: `historical-transit-data` (690L), `historical-transits` (274L, Prisma-stripped).

**Severed chains**
- The `alchemical-trainer` → `monica-constant` → `planetary-position-sync` → `sync-monitoring` → `backend` chain (6 files / 2,889 LOC, plus `@prisma/client` schema port) is deliberately not ported. Sole hook is one `BirthInfo` type import in `monica/horoscope-generator.ts` — inline it (the interface is 7 trivial fields).
- `historical-transits.ts` references `@prisma/client` only in an optional path. Strip the import; the function already falls back to `[]`.

**External packages**
- Install: `date-fns@2` (not in target).
- Upgrade before Session 8: `lucide-react@^0.542.0` (target's `^1.14.0` is the abandoned 1.x line).
- 6 shadcn components to add (Session 2): `dialog`, `separator`, `switch`, `alert`, `textarea`, `alert-dialog` (the last was missed in the original plan).

**Scope decision**
- Total: 51 modules + 3 wten-only components ≈ **54 files, ~22k LOC**.
- Under the 80-file / 50k-LOC abort threshold from this plan. **Recommended: continue.**

**Pre-flight (for reference):**
```bash
git fetch origin master
git checkout -b claude/wten-migration-session-1 origin/master
bun install
```

**Acceptance criteria:**
- [x] `WTEN_MIGRATION_PLAN.md` updated with full closure table
- [x] No source code changes in `src/` yet
- [x] PR opened against `master` with title `docs(wten-migration): closure audit + final session breakdown`
- [x] PR description notes scope discovery and recommended path forward (stacks on #415)

---

## Session 2 — shadcn UI + leaf utilities

**Pre-flight:**
```bash
git fetch origin master
git checkout -b claude/wten-migration-session-2 origin/master
bun install
```

**What's done:**
- Session 1's closure audit is complete; the dep table in `WTEN_MIGRATION_PLAN.md` is authoritative.
- `wten-migration-ui-components/**` is in `tsconfig.json` exclude (don't touch that — Session 11 removes it).

**This session's scope:** Add the 6 missing shadcn components, install `date-fns`, then port the smallest leaf modules. These have no dependencies on other ported modules, so they're a low-risk warmup.

1. Install shadcn components: `bunx shadcn add dialog separator switch alert textarea alert-dialog`. Commit those files separately.
2. Install `date-fns`: `bun add date-fns@2` (source uses 2.30.0; later components rely on `format`, `formatDistanceToNow`, `differenceInDays`). Single small commit.
3. Port these files **verbatim** from `~/Desktop/planetary_agents-main/` to `src/`:
   - `lib/observability.ts` → `src/lib/observability-legacy.ts` (12L). NOTE: target already has `src/lib/observability/` (directory) — file/dir collision avoided by the `-legacy` suffix. Update `alchemizer.ts` import path during Session 5 to `'./observability-legacy'`. The source file is a single `recordElementalLogicMode` placeholder; merging into the existing observability module is overkill.
   - `lib/kinetics-integration.ts` → `src/lib/kinetics-integration.ts` (16L)
   - `lib/calculate-transits.ts` → `src/lib/calculate-transits.ts` (56L) — imports `./enhanced-astronomical-calculator` (NOT YET PORTED — order matters: port enhanced-astronomical-calculator FIRST or move calculate-transits to Session 4).
   - `lib/performance-cache.ts` → `src/lib/performance-cache.ts` (154L)
   - `hooks/useGalileoLog.ts` → `src/hooks/useGalileoLog.ts` (140L)
4. **Sequencing note**: `calculate-transits.ts` depends on `enhanced-astronomical-calculator` which is Session 4. EITHER port `enhanced-astronomical-calculator` opportunistically in Session 2 (it's a leaf — no deps), OR defer `calculate-transits` to Session 4. Recommended: port `enhanced-astronomical-calculator.ts` (881L) in this session too — it's a heavy leaf and dragging it in here unblocks `calculate-transits`. Adjust acceptance criteria below.
5. For each port: verify its imports against the target tree. If imports another not-yet-ported module, that's a sequencing error — surface and stop.
6. Verify each file typechecks. Spot-check by temporarily editing `tsconfig.json` to UN-exclude just the wten/ files that consume these modules, run `bun run typecheck`, confirm imports resolve, then revert the tsconfig change.

**Acceptance criteria:**
- [ ] 6 shadcn components added (dialog, separator, switch, alert, textarea, alert-dialog)
- [ ] `date-fns` installed
- [ ] 5–6 leaf modules ported into `src/` (5 originals + optional `enhanced-astronomical-calculator`)
- [ ] `bun run typecheck` passes (0 errors)
- [ ] `bun run lint` passes (0 errors)
- [ ] `bun run build` succeeds (move `wten/` aside if it interferes)
- [ ] PR opened with title `feat(wten-migration): shadcn UI + leaf utilities (session 2)`

**Common gotchas:**
- The target already has `src/lib/observability/` (a directory, not a file) from PR #412. Renaming-vs-merging the new file matters. Check the existing structure first.

---

## Session 3 — Foundation libs: types, logger, energy rules

**Pre-flight:**
```bash
git fetch origin master
git checkout -b claude/wten-migration-session-3 origin/master
bun install
```

**What's done:** Sessions 1–2 complete. Leaf utilities + shadcn UI in `src/`.

**This session's scope:** Port the type/logger/rule modules that everything else depends on. Order matters here — port in this sequence:

1. `lib/structured-logger.ts` → `src/lib/structured-logger.ts` (420L) — utility, no internal deps
2. `lib/agent-types.ts` → `src/lib/agent-types.ts` (499L) — type definitions, no internal deps
3. `lib/unified-agent-types.ts` → `src/lib/unified-agent-types.ts` (255L) — type definitions
4. `lib/core-energy-rules.ts` → `src/lib/core-energy-rules.ts` (523L)
5. `lib/elemental-reinforcement.ts` → `src/lib/elemental-reinforcement.ts` (430L)
6. `lib/galileo-logger.ts` → `src/lib/galileo-logger.ts` (548L) — imports `./core-energy-rules`, so AFTER step 4.

For each: read source, copy to target, adapt `@/...` imports (source's `@/lib/foo` should still map to `src/lib/foo` in target — usually a no-op). Run typecheck after each individual port to catch errors early.

**Acceptance criteria:**
- [ ] 6 foundation modules ported
- [ ] `bun run typecheck` passes after each individual port
- [ ] `bun run lint` passes
- [ ] `bun run build` succeeds (move wten/ aside if needed)
- [ ] PR opened with title `feat(wten-migration): foundation libs (session 3)`

**Common gotchas:**
- `structured-logger` likely references env vars (e.g., LOG_LEVEL). Confirm target env has them or supply sensible defaults.
- Type-only re-exports may need `export type` (verbatim) syntax under strict `isolatedModules`.

---

## Session 4 — Astronomy + ephemeris

**Pre-flight:**
```bash
git fetch origin master
git checkout -b claude/wten-migration-session-4 origin/master
bun install
```

**What's done:** Sessions 1–3. Types, loggers, rules are in `src/`.

**This session's scope:** Port the astronomy math layer + ephemeris.

1. `lib/astrological-data.ts` → `src/lib/astrological-data.ts` (199L) — leaf
2. `lib/moon-phase-calculator.ts` → `src/lib/moon-phase-calculator.ts` (396L) — leaf
3. `lib/planetary-motion-tracker.ts` → `src/lib/planetary-motion-tracker.ts` (473L) — leaf
4. `lib/planetary-api-client.ts` → `src/lib/planetary-api-client.ts` (291L) — leaf
5. `lib/ephemeris/solar-ephemeris.ts` → `src/lib/ephemeris/solar-ephemeris.ts` (357L) — leaf (creates `src/lib/ephemeris/` dir)
6. `lib/ephemeris/degree-calendar-map.ts` → `src/lib/ephemeris/degree-calendar-map.ts` (405L) — depends on solar-ephemeris (step 5)
7. `lib/planetary-config-helper.ts` → `src/lib/planetary-config-helper.ts` (240L) — depends on `agent-types` (Session 3), `unified-agent-types` (Session 3), `astrological-data` (step 1), `moon-phase-calculator` (step 2)
8. `lib/enhanced-astronomical-calculator.ts` → `src/lib/enhanced-astronomical-calculator.ts` (881L) — leaf. If already ported opportunistically in Session 2, skip.
9. `lib/calculate-transits.ts` → `src/lib/calculate-transits.ts` (56L) — depends on enhanced-astronomical-calculator. Same caveat as step 8.

For `planetary-api-client.ts`: it makes HTTP requests to an external service. Check what URL/endpoint and whether the target has env vars for it (`NEXT_PUBLIC_PLANETARY_API_URL` or similar — grep the source file).

**Acceptance criteria:**
- [ ] 7–9 astronomy + ephemeris modules ported (depending on Session 2's opportunistic ports)
- [ ] `src/lib/ephemeris/` directory created
- [ ] `bun run typecheck` passes
- [ ] `bun run lint` passes
- [ ] `bun run build` succeeds
- [ ] PR opened with title `feat(wten-migration): astronomy + ephemeris (session 4)`

**Common gotchas:**
- Floating-point math: don't refactor the equations during port. Copy verbatim, test later.
- API client URL: source repo may have its own `NEXT_PUBLIC_PLANETARY_API_URL`. Wire to target env or hardcode a default with a TODO.

---

## Session 5 — Monica + alchemy core

**Pre-flight:**
```bash
git fetch origin master
git checkout -b claude/wten-migration-session-5 origin/master
bun install
```

**What's done:** Sessions 1–4 complete. Astronomy layer in `src/`.

**This session's scope:** Port the alchemy / horoscope generation core. These are the biggest single files; budget extra time.

1. Port `lib/monica/horoscope-generator.ts` → `src/lib/monica/horoscope-generator.ts` (679L) — depends on `enhanced-astronomical-calculator` (Session 2/4), `ephemeris/solar-ephemeris` (Session 4), `ephemeris/degree-calendar-map` (Session 4). **ADAPTATION REQUIRED**: source line 4 reads `import { BirthInfo } from './alchemical-trainer'`. Replace that import with an inlined interface declaration in `horoscope-generator.ts` itself:
   ```ts
   export interface BirthInfo {
     year: number
     month: number
     day: number
     hour: number
     minute: number
     latitude: number
     longitude: number
   }
   ```
   This severs the alchemical-trainer chain. Source for the interface: `alchemical-trainer.ts:21-29`. Do NOT port alchemical-trainer or any of its downstream deps (monica-constant, planetary-position-sync, sync-monitoring, backend, planetary-hour).
2. Port `lib/alchemizer.ts` → `src/lib/alchemizer.ts` (1122L) — THE biggest single file. Depends on `monica/horoscope-generator` (step 1), `observability-legacy` (Session 2 — note: source imports `./observability` but target file is `observability-legacy.ts`), `performance-cache` (Session 2). Update the observability import path during port.
3. Port `lib/celestial-energy-calculator.ts` → `src/lib/celestial-energy-calculator.ts` (729L) — depends on `monica/horoscope-generator` (step 1).

For each: copy verbatim except the documented adaptations, adapt aliases, run typecheck.

**Acceptance criteria:**
- [ ] 3 core modules ported
- [ ] `BirthInfo` inlined in `horoscope-generator.ts` (no `alchemical-trainer` import)
- [ ] `alchemizer.ts` observability import points at `observability-legacy`
- [ ] `bun run typecheck` passes
- [ ] `bun run lint` passes
- [ ] `bun run build` succeeds
- [ ] PR opened with title `feat(wten-migration): monica + alchemy core (session 5)`

**Common gotchas:**
- `alchemizer.ts` has the alchemy formula. The codebase has its own elemental logic — DON'T merge. Port as a sibling, deduplicate later if needed.
- Circular import: `alchemizer → monica/horoscope-generator → ` (no longer to alchemical-trainer after sever, but `alchemizer` is imported BY other modules indirectly — verify no init-time cycle in target).

---

## Session 6 — Agents + matching ✅ COMPLETE

> **Done.** Modules 1–4, 6–8 ported in commit `d1449d23` (+ Session-3 bonus ports of `kinetics-client` and `agents/kinetic-profiles`). Module 5, `alchemical-kinetics-sampler.ts`, was deferred there because it imports the severed `planetary-hour` module; **completed 2026-05-29** with two adaptations (see item 5).

**Pre-flight:**
```bash
git fetch origin master
git checkout -b claude/wten-migration-session-6 origin/master
bun install
```

**What's done:** Sessions 1–5. Alchemy core in `src/`.

**This session's scope:** Port the agent layer — types, profiles, matchers.

1. Port `lib/kinetics-client.ts` → `src/lib/kinetics-client.ts` (27L) — leaf, brought in by consciousness-memory
2. Port `lib/agents/kinetic-profiles.ts` → `src/lib/agents/kinetic-profiles.ts` (732L) — leaf. (Target's `src/lib/agents/` already has unrelated files; no name collision.)
3. Port `lib/agents/consciousness-memory.ts` → `src/lib/agents/consciousness-memory.ts` (413L) — depends on `agent-types` (Session 3), `kinetics-client` (step 1), `agents/kinetic-profiles` (step 2)
4. Port `lib/unified-agent-factory.ts` → `src/lib/unified-agent-factory.ts` (430L) — depends on `unified-agent-types` (Session 3), `agent-types` (Session 3), `astrological-data` (Session 4), `moon-phase-calculator` (Session 4)
5. Port `lib/alchemical-kinetics-sampler.ts` → `src/lib/alchemical-kinetics-sampler.ts` (**415L**, not 33L — the source grew after the audit) — **NOT a leaf.** Two adaptations done on 2026-05-29:
   - It imports `./alchemical-kinetics` (700L), which the plan never assigned to any session. That zero-import leaf was ported alongside as `src/lib/alchemical-kinetics.ts`.
   - It imports `PlanetaryHourCalculator` from `./planetary-hour` — part of the **deliberately severed** alchemical-trainer chain. The target already ships `src/lib/PlanetaryHourCalculator.ts` with the same constructor `(lat, long)` and `getPlanetaryHour(date) → { planet, isDaytime }` shape, so the import was redirected there rather than porting the severed module.
6. Port `lib/degree-planetary-agent-mapping.ts` → `src/lib/degree-planetary-agent-mapping.ts` (406L) — leaf
7. Port `lib/services/planetary-agent-activation.ts` → `src/lib/services/planetary-agent-activation.ts` (445L) — depends on `degree-planetary-agent-mapping` (step 6), `unified-agent-factory` (step 4), `unified-agent-types` (Session 3), `astrological-data` (Session 4), `moon-phase-calculator` (Session 4), `planetary-config-helper` (Session 4). Creates `src/lib/services/` dir.
8. Port `lib/degree-agent-matcher.ts` → `src/lib/degree-agent-matcher.ts` (916L) — depends on `agent-types` (Session 3), `celestial-energy-calculator` (Session 5)

**Acceptance criteria:**
- [ ] 8 agent modules ported
- [ ] `src/lib/services/` directory created
- [ ] `bun run typecheck` passes
- [ ] `bun run lint` passes
- [ ] `bun run build` succeeds
- [ ] PR opened with title `feat(wten-migration): agents + matchers (session 6)`

---

## Session 7 — Aspects, patterns, runes, temporal

**Pre-flight:**
```bash
git fetch origin master
git checkout -b claude/wten-migration-session-7 origin/master
bun install
```

**What's done:** Sessions 1–6. Agent layer in `src/`.

**This session's scope:** Port the aspect / pattern / rune / temporal layers. This is the heaviest session — 10 files, ~5,400 LOC.

Leaf-tier ports (no deps on other Session 7 files):
1. `lib/astrological-character-vectors.ts` → `src/lib/astrological-character-vectors.ts` (740L) — leaf
2. `lib/historical-transit-data.ts` → `src/lib/historical-transit-data.ts` (690L) — leaf
3. `lib/historical-transits.ts` → `src/lib/historical-transits.ts` (274L) — **ADAPTATION**: source line 1 reads `import { PrismaClient } from '@prisma/client'` and the function `getTransitsForDate(date, prisma?: PrismaClient)` uses it optionally. Drop the import; change the signature to `getTransitsForDate(date: Date)` returning `Promise<HistoricalTransit[]>` that always returns `[]` (the existing fallback). The pure helpers (`findLastOccurrence`, `getPlanetCycleLength`, etc.) carry over verbatim.
4. `lib/runes/rune-system.ts` → `src/lib/runes/rune-system.ts` (431L) — leaf (creates `src/lib/runes/` dir)
5. `lib/astrological-pattern-recognition.ts` → `src/lib/astrological-pattern-recognition.ts` (667L) — depends on `planetary-motion-tracker` (Session 4)

Single-dep tier:
6. `lib/transit-patterns.ts` → `src/lib/transit-patterns.ts` (380L) — depends on `historical-transit-data` (step 2), `historical-transits` (step 3)
7. `lib/degree-agent-mapping.ts` → `src/lib/degree-agent-mapping.ts` (541L) — depends on `agents/kinetic-profiles` (Session 6). NOTE: distinct file from `degree-planetary-agent-mapping.ts`.
8. `lib/runes/sign-vector-runes.ts` → `src/lib/runes/sign-vector-runes.ts` (701L) — depends on `astrological-character-vectors` (step 1), `runes/rune-system` (step 4)
9. `lib/dynamic-aspects-engine.ts` → `src/lib/dynamic-aspects-engine.ts` (571L) — depends on `planetary-motion-tracker` (Session 4), `astrological-pattern-recognition` (step 5)

Final-tier:
10. `lib/temporal-analysis-engine.ts` → `src/lib/temporal-analysis-engine.ts` (979L) — depends on `agents/kinetic-profiles` (Session 6), `planetary-api-client` (Session 4), `agents/consciousness-memory` (Session 6), `structured-logger` (Session 3), `alchemical-kinetics-sampler` (Session 6), `transit-patterns` (step 6), `astrological-pattern-recognition` (step 5), `degree-agent-mapping` (step 7).

**Acceptance criteria:**
- [ ] 10 modules ported
- [ ] `src/lib/runes/` directory created
- [ ] `historical-transits.ts` Prisma-stripped (no `@prisma/client` import; `getTransitsForDate` always returns `[]`)
- [ ] `bun run typecheck` passes
- [ ] `bun run lint` passes
- [ ] `bun run build` succeeds
- [ ] PR opened with title `feat(wten-migration): aspects + runes + temporal (session 7)`

**Common gotchas:**
- `temporal-analysis-engine` is the largest file (979L) — read it in chunks. Don't try to read+port in one pass.
- `degree-agent-mapping.ts` vs `degree-planetary-agent-mapping.ts` — two distinct files. Don't confuse them. The former lives in this session (depends on kinetic-profiles), the latter was Session 6.

---

## Session 8 — Domain components: natal + planetary

**Pre-flight:**
```bash
git fetch origin master
git checkout -b claude/wten-migration-session-8 origin/master
bun install
```

**What's done:** Sessions 1–7. All `lib/` and `hooks/` modules ported.

**This session's scope:** Port the foundational React components that the bigger UI components depend on.

1. `components/natal-chart-input.tsx` → `src/components/natal-chart-input.tsx` (294L)
2. `components/planetary-agent-display.tsx` → `src/components/planetary-agent-display.tsx` (345L)
3. `components/natal-chart-manager.tsx` → `src/components/natal-chart-manager.tsx` (475L) — depends on steps 1 + 2
4. `components/charts/aspect-phase-indicator.tsx` → `src/components/charts/aspect-phase-indicator.tsx` (392L) — leaf (badge + react + lucide-react)

After each port, run a localized typecheck by temporarily un-excluding just one wten/ file that consumes the component.

**Acceptance criteria:**
- [ ] 4 components ported
- [ ] `bun run typecheck` passes
- [ ] `bun run lint` passes
- [ ] `bun run build` succeeds
- [ ] PR opened with title `feat(wten-migration): natal + planetary components (session 8)`

**Common gotchas:**
- `'use client'` directive — source files probably have it. Preserve it.
- **BEFORE this session**, upgrade `lucide-react`: `bun add lucide-react@^0.542.0`. Target's `^1.14.0` is the abandoned 1.x line and lacks icons like `MessageCircle`, `Sparkles`, `TrendingUp`/`TrendingDown`. The existing 5 target consumers use icons (`Flame`, `Droplets`, `AlertTriangle`, etc.) that exist in 0.x, so the upgrade is low-risk.
- `date-fns` should already be installed from Session 2.

---

## Session 9 — Transit components

**Pre-flight:**
```bash
git fetch origin master
git checkout -b claude/wten-migration-session-9 origin/master
bun install
```

**What's done:** Sessions 1–8. Natal + planetary components in `src/`.

**This session's scope:** Port the transit-related components.

1. `components/transit-comparison.tsx` → `src/components/transit-comparison.tsx` (604L)
2. `components/transit-dashboard.tsx` → `src/components/transit-dashboard.tsx` (966L) — biggest UI file. Depends on `./planetary-agent-display` (done in Session 8).
3. `components/transit-notification-center.tsx` → `src/components/transit-notification-center.tsx` (566L)
4. `components/job-monitoring-dashboard.tsx` → `src/components/job-monitoring-dashboard.tsx` (500L) — uses separator + switch (from Session 2)

**Acceptance criteria:**
- [ ] 4 transit components ported
- [ ] `bun run typecheck` passes
- [ ] `bun run lint` passes
- [ ] `bun run build` succeeds
- [ ] PR opened with title `feat(wten-migration): transit components (session 9)`

**Common gotchas:**
- `transit-dashboard` at 966L will have a lot of state. Don't refactor during port; keep verbatim.

---

## Session 10 — Misc + wten-only components

**Pre-flight:**
```bash
git fetch origin master
git checkout -b claude/wten-migration-session-10 origin/master
bun install
```

**What's done:** Sessions 1–9. Most components ported.

**This session's scope:** Port the remaining misc components, plus the 3 components that exist ONLY in `wten-migration-ui-components/`.

From source repo:
1. `components/misc/cosmic-time-laboratory.tsx` → `src/components/misc/cosmic-time-laboratory.tsx` (572L) — depends on `@/lib/elemental-reinforcement` (done)
2. `components/misc/temporal-oracle.tsx` → `src/components/misc/temporal-oracle.tsx` (460L) — depends on `@/lib/temporal-analysis-engine` (done) and `@/components/ui/textarea` (done in Session 2)
3. `components/misc/temporal-timeline.tsx` → `src/components/misc/temporal-timeline.tsx` (661L) — depends on elemental-reinforcement + temporal-analysis-engine + slider (done)

From `wten-migration-ui-components/` (NOT in source):
4. Move `wten-migration-ui-components/components/misc/alchm-quantities-display.tsx` → `src/components/misc/alchm-quantities-display.tsx`
5. Move `wten-migration-ui-components/components/misc/kinetics-visualization.tsx` → `src/components/misc/kinetics-visualization.tsx`
6. Move `wten-migration-ui-components/components/charts/alchemical-metrics-chart.tsx` → `src/components/charts/alchemical-metrics-chart.tsx` (if it exists; verify)

**Acceptance criteria:**
- [ ] 3 misc components ported from source
- [ ] 2–3 wten-only components moved into `src/`
- [ ] `bun run typecheck` passes
- [ ] `bun run lint` passes
- [ ] `bun run build` succeeds
- [ ] PR opened with title `feat(wten-migration): misc + wten-only components (session 10)`

**Common gotchas:**
- The wten-only files import via `@/components/misc/alchm-quantities-trends` (already at `src/components/alchm-quantities-trends.tsx`). After move, fix the path — either move alchm-quantities-trends to `src/components/misc/` or re-export.

---

## Session 11 — Integration: fix wten/ non-import errors, remove exclusion, ship

**Pre-flight:**
```bash
git fetch origin master
git checkout -b claude/wten-migration-session-11 origin/master
bun install
```

**What's done:** Sessions 1–10. Every dep ported into `src/`. `wten-migration-ui-components/` should now have its import errors resolved.

**This session's scope:** The final cleanup.

1. Run `bun run typecheck` (with `wten-migration-ui-components/**` still in tsconfig.exclude). Expect 0 errors.
2. **Edit `tsconfig.json`**: REMOVE the `"wten-migration-ui-components/**"` exclude line.
3. Run `bun run typecheck` again. Expect ~20 errors of types TS2339, TS2769, TS2345, TS18046 — none import-related. These are in `wten-migration-ui-components/` itself. Examples:
   - `app/api/alchm-quantities/route.ts` — `'data' is of type 'unknown'`, `Property 'sign' does not exist on type '{}'`, `Property 'currentAspects' does not exist on type 'never'`
   - `app/(app)/time-laboratory/page.tsx` — overload mismatches
   - `components/time-laboratory/zodiac-wheel-interactive.tsx` — `Property 'degree' does not exist on type 'never'` (likely `useState<...>()` with no initial generic)
4. Fix each. Type-narrowing with `as` is OK but prefer proper inference. For `useState<...>()` cases, supply the element type.
5. Decide on **integration strategy**:
   - **Option A**: leave `wten-migration-ui-components/` as a dead second app inside the repo. Update imports inside it to point at `src/...` so it compiles, but nothing routes to it. Useful as reference for future feature integration.
   - **Option B**: move `wten-migration-ui-components/app/...` routes into `src/app/...` (Next.js routing layer) and delete the dir. The new routes become live.
   - **Option C**: keep both. Add `wten-migration-ui-components/` to `next.config.ts`'s `transpilePackages` or similar so its routes serve alongside the main app.
   
   Surface the trade-offs and let the user choose before integrating.
6. Once integrated, delete or relocate any obsolete files.
7. Run full verification: `bun run typecheck`, `bun run lint`, `bun run build`, `bun run dev` + smoke test the new routes in a browser.

**Acceptance criteria:**
- [ ] `tsconfig.json` no longer excludes `wten-migration-ui-components/**`
- [ ] All 20+ non-import errors fixed
- [ ] `bun run typecheck` passes (0 errors)
- [ ] `bun run lint` passes (0 errors)
- [ ] `bun run build` succeeds
- [ ] Dev server runs and the integrated route (per chosen option) renders without error
- [ ] PR opened with title `feat(wten-migration): integrate + finalize (session 11)`

**Common gotchas:**
- Fixing TS2339 on `never` often means adding an initial state value or a generic to `useState`.
- The unknown `data` errors in `alchm-quantities/route.ts` need Zod validation or a type assertion at the parse boundary.
- After removing tsconfig exclude, the lint hook may also flag style issues in wten-migration-ui-components/. Budget 30 minutes for that cleanup.

---

## Total scope estimate (Session 1 closure, 2026-05-20)

| Group | Files | LOC |
| :--- | ---: | ---: |
| shadcn UI components | 6 | (auto) |
| `src/lib/*` (39 files) | 39 | 16,193 |
| `src/hooks/*` | 1 | 140 |
| `src/components/*` (from source) | 11 | 6,189 |
| `src/components/*` (from wten staging only) | 3 | (varies) |
| Adapter edits (inline BirthInfo, strip Prisma) | 2 | ~20 |
| Non-import error fixes (Session 11) | ~10 | ~50 (changes) |
| **Total** | **~62** | **~22,600** |

**Scope decision: CONTINUE.** Under the 80-file / 50k-LOC abort threshold. The severed `alchemical-trainer` chain (6 files / 2,889 LOC + Prisma schema port) reduced total scope by ~13% and eliminated a hard blocker.

**Estimated wall time**: 15–25 hours of focused work across 11 sessions (slightly under the original 15–35h estimate, due to the sever). Realistic schedule: 2–3 weeks at 1 session per 2–3 days.

**If at any point during execution the scope expands past 80 files or 30k LOC, STOP and re-evaluate with the user.** The closure looks tight, but unexpected level-N transitive deps inside the ports (e.g., a function referencing a sibling file not detected by static import analysis) could surface.
