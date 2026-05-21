# wten-migration-ui-components/ Port — Multi-Session Plan

This plan ports the untracked `wten-migration-ui-components/` directory (a paste of the [`planetary_agents-main`](file:///Users/cookingwithcastro/Desktop/planetary_agents-main) Next.js app's UI surface) into the WhatToEatNext codebase under `src/`. The work is split across 11 sessions because the full dep closure is ~60-80 files / 25-40k LOC — too large for one chat.

Each session prompt below is **self-contained**. Copy-paste a session into a fresh Claude Code chat and it will have everything it needs to do that session's work.

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

### Dep graph (level 1, audited 2026-05-20)

Modules in `planetary_agents-main/` that need porting, grouped by likely session and ordered roughly by dep direction (leaves → roots):

| Module                                       | LOC  | Imports from (relative paths within source)              |
| -------------------------------------------- | ---- | -------------------------------------------------------- |
| `lib/observability.ts`                       | 12   | (none)                                                   |
| `lib/kinetics-integration.ts`                | 16   | (none)                                                   |
| `lib/calculate-transits.ts`                  | 56   | (none)                                                   |
| `lib/performance-cache.ts`                   | 154  | (none)                                                   |
| `hooks/useGalileoLog.ts`                     | 140  | `react`                                                  |
| `lib/structured-logger.ts`                   | 420  | (probably none — utility logger)                         |
| `lib/agent-types.ts`                         | 499  | (probably leaf — types)                                  |
| `lib/unified-agent-types.ts`                 | 255  | (probably leaf — types)                                  |
| `lib/elemental-reinforcement.ts`             | 430  | (TBD)                                                    |
| `lib/core-energy-rules.ts`                   | 523  | (probably leaf — rule definitions)                       |
| `lib/galileo-logger.ts`                      | 548  | `./core-energy-rules`                                    |
| `lib/moon-phase-calculator.ts`               | 396  | (probably leaf — math)                                   |
| `lib/planetary-motion-tracker.ts`            | 473  | (TBD)                                                    |
| `lib/planetary-api-client.ts`                | 291  | (TBD)                                                    |
| `lib/planetary-config-helper.ts`             | 240  | `./agent-types`, `./astrological-data`, `./moon-phase-calculator`, `./unified-agent-types` |
| `lib/enhanced-astronomical-calculator.ts`    | 881  | (TBD — likely deep)                                      |
| `lib/monica/horoscope-generator.ts`          | 679  | `../ephemeris/degree-calendar-map`, `../ephemeris/solar-ephemeris`, `./alchemical-trainer` |
| `lib/alchemizer.ts`                          | 1122 | `./monica/horoscope-generator`, `./observability`, `./performance-cache` |
| `lib/celestial-energy-calculator.ts`         | 729  | `./monica/horoscope-generator`                           |
| `lib/agents/consciousness-memory.ts`         | 413  | `../agent-types`, `../kinetics-client`, `./kinetic-profiles` |
| `lib/agents/kinetic-profiles.ts`             | 732  | (TBD)                                                    |
| `lib/unified-agent-factory.ts`               | 430  | `./agent-types`                                          |
| `lib/alchemical-kinetics-sampler.ts`         | 33   | (probably leaf)                                          |
| `lib/services/planetary-agent-activation.ts` | 445  | `../moon-phase-calculator`, `../planetary-config-helper`, `../unified-agent-factory`, `../unified-agent-types` |
| `lib/degree-agent-matcher.ts`                | 916  | `./agent-types`, `./celestial-energy-calculator`         |
| `lib/degree-planetary-agent-mapping.ts`      | 406  | (TBD)                                                    |
| `lib/dynamic-aspects-engine.ts`              | 571  | `./planetary-motion-tracker`                             |
| `lib/astrological-pattern-recognition.ts`    | 667  | `./planetary-motion-tracker`                             |
| `lib/temporal-analysis-engine.ts`            | 979  | `./agents/consciousness-memory`, `./agents/kinetic-profiles`, `./alchemical-kinetics-sampler`, `./planetary-api-client`, `@/lib/structured-logger` |
| `lib/runes/rune-system.ts`                   | 431  | (TBD)                                                    |
| `lib/runes/sign-vector-runes.ts`             | 701  | `./rune-system`                                          |
| `components/natal-chart-input.tsx`           | 294  | (TBD)                                                    |
| `components/planetary-agent-display.tsx`     | 345  | (TBD)                                                    |
| `components/natal-chart-manager.tsx`         | 475  | `@/components/natal-chart-input`, `@/components/planetary-agent-display` |
| `components/charts/aspect-phase-indicator.tsx` | 392 | (leaf — react + badge)                                   |
| `components/transit-comparison.tsx`          | 604  | (TBD — UI only)                                          |
| `components/transit-dashboard.tsx`           | 966  | `./planetary-agent-display`                              |
| `components/transit-notification-center.tsx` | 566  | (UI only)                                                |
| `components/job-monitoring-dashboard.tsx`    | 500  | (UI only — needs separator+switch from shadcn)           |
| `components/misc/cosmic-time-laboratory.tsx` | 572  | `@/lib/elemental-reinforcement`                          |
| `components/misc/temporal-oracle.tsx`        | 460  | `@/lib/temporal-analysis-engine`                         |
| `components/misc/temporal-timeline.tsx`      | 661  | `@/lib/elemental-reinforcement`, `@/lib/temporal-analysis-engine` |

(TBD = imports not yet audited. Session 1 finalizes these.)

### shadcn UI components missing in target
Run once (likely in Session 2):
```bash
bunx shadcn add dialog separator switch alert textarea
```

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

## Session 1 — Full closure audit + final session breakdown

**Pre-flight:**
```bash
git fetch origin master
git checkout -b claude/wten-migration-session-1 origin/master
bun install
```

**What's done:** This document exists with a level-1 dep audit. Most TBD entries above need to be resolved.

**This session's scope:** Do the full transitive-dep closure so the rest of the plan is accurate. NO porting yet.

1. For every module listed in the table above with `(TBD)` imports, read the source file in `~/Desktop/planetary_agents-main/` and record:
   - All `import` / `export ... from` statements
   - For each, classify: `react`/external lib (no port), `@/components/ui/*` (shadcn — check if exists), `@/...` aliased (probably ports to source repo's `lib/components/hooks/`), relative path (siblings to port).
2. Recurse on any newly-discovered modules until closure (i.e., every transitive dep is either external or already in the table).
3. Produce the **final** table: every module to port, its LOC, its dependencies (in terms of OTHER modules in the table). Topo-sort so leaves come first.
4. Identify any **external npm packages** the source uses that aren't in target `package.json` (search `import ... from '<pkg-name>'`). Append a "Packages to install" section.
5. **Update this `WTEN_MIGRATION_PLAN.md`** with the closed dep table and a revised session 2–11 breakdown if the closure changes things.
6. **DECISION POINT**: if the closure exceeds 80 files or 50k LOC, surface that to the user and recommend either:
   - Continue (accept the multi-week timeline).
   - Delete `wten-migration-ui-components/` entirely (give up on the port, keep the planetary_agents-main repo separate).
   - Reduce scope (port only a subset — e.g., only what's needed for the `/time-laboratory` route).

**Acceptance criteria:**
- [ ] Updated `WTEN_MIGRATION_PLAN.md` with full closure table
- [ ] No source code changes in `src/` yet
- [ ] PR opened against `master` with title `docs(wten-migration): closure audit + final session breakdown`
- [ ] PR description explicitly notes the scope discovery and recommended path forward

**Common gotchas:**
- Some imports in the source repo may resolve to its own `types/` or `utils/` dirs — those need to be added to the table too.
- `package.json` in source has its own dep list; cross-reference against target's `package.json` for missing packages.

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

**This session's scope:** Add the 5 missing shadcn components, then port the smallest leaf modules. These have no dependencies on other ported modules, so they're a low-risk warmup.

1. Install shadcn components: `bunx shadcn add dialog separator switch alert textarea`. Commit those files separately.
2. Port these files **verbatim** from `~/Desktop/planetary_agents-main/` to `src/`:
   - `lib/observability.ts` → `src/lib/observability.ts` (12L). NOTE: target already has `src/lib/observability/` (the admin-panel directory from PR #412) — port the source file to `src/lib/observability-legacy.ts` and update wten/ imports to match, OR merge cleanly with the existing module if shape allows. Check before clobbering.
   - `lib/kinetics-integration.ts` → `src/lib/kinetics-integration.ts` (16L)
   - `lib/calculate-transits.ts` → `src/lib/calculate-transits.ts` (56L)
   - `lib/performance-cache.ts` → `src/lib/performance-cache.ts` (154L)
   - `hooks/useGalileoLog.ts` → `src/hooks/useGalileoLog.ts` (140L)
3. For each port: check its imports. If it imports an external lib not in target `package.json`, install with `bun add <pkg>`. If it imports another not-yet-ported module, that's a sequencing error — surface and stop.
4. Verify each file typechecks. Spot-check by temporarily editing `tsconfig.json` to UN-exclude just the wten/ files that consume these modules, run `bun run typecheck`, confirm imports resolve, then revert the tsconfig change.

**Acceptance criteria:**
- [ ] 5 shadcn components added (dialog, separator, switch, alert, textarea)
- [ ] 5 leaf modules ported into `src/`
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

**This session's scope:** Port the astronomy math layer.

1. `lib/moon-phase-calculator.ts` → `src/lib/moon-phase-calculator.ts` (396L)
2. `lib/planetary-motion-tracker.ts` → `src/lib/planetary-motion-tracker.ts` (473L)
3. `lib/planetary-api-client.ts` → `src/lib/planetary-api-client.ts` (291L)
4. `lib/planetary-config-helper.ts` → `src/lib/planetary-config-helper.ts` (240L) — depends on `agent-types` (✓ done), `moon-phase-calculator` (step 1), `unified-agent-types` (✓ done), and `astrological-data` (NEW — check if it exists in source, port if so).
5. `lib/enhanced-astronomical-calculator.ts` → `src/lib/enhanced-astronomical-calculator.ts` (881L) — likely heavy, audit imports first
6. Port any `ephemeris/*` files surfaced by Session 1's audit.

For `planetary-api-client.ts`: this probably makes HTTP requests to an external service. Check what URL/endpoint and whether the target has env vars for it.

**Acceptance criteria:**
- [ ] All astronomy modules ported
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

1. Port `lib/monica/horoscope-generator.ts` → `src/lib/monica/horoscope-generator.ts` (679L) — depends on `ephemeris/*` (Session 4) and `./alchemical-trainer` (port separately if not yet in `src/`).
2. Port `lib/alchemizer.ts` → `src/lib/alchemizer.ts` (1122L) — THE biggest single file. Depends on `monica/horoscope-generator`, `observability`, `performance-cache`.
3. Port `lib/celestial-energy-calculator.ts` → `src/lib/celestial-energy-calculator.ts` (729L) — depends on `monica/horoscope-generator`.

For each: copy verbatim, adapt aliases, run typecheck.

**Acceptance criteria:**
- [ ] 3 core modules ported (+ `alchemical-trainer` if needed)
- [ ] `bun run typecheck` passes
- [ ] `bun run lint` passes
- [ ] `bun run build` succeeds
- [ ] PR opened with title `feat(wten-migration): monica + alchemy core (session 5)`

**Common gotchas:**
- `alchemizer.ts` has the alchemy formula. The codebase has its own elemental logic — DON'T merge. Port as a sibling, deduplicate later if needed.

---

## Session 6 — Agents + matching

**Pre-flight:**
```bash
git fetch origin master
git checkout -b claude/wten-migration-session-6 origin/master
bun install
```

**What's done:** Sessions 1–5. Alchemy core in `src/`.

**This session's scope:** Port the agent layer — types, profiles, matchers.

1. Port `lib/agents/kinetic-profiles.ts` → `src/lib/agents/kinetic-profiles.ts` (732L) — audit its deps first
2. Port `lib/agents/consciousness-memory.ts` → `src/lib/agents/consciousness-memory.ts` (413L) — depends on `agent-types`, `kinetics-client` (NEW, port), `kinetic-profiles` (step 1)
3. Port `lib/unified-agent-factory.ts` → `src/lib/unified-agent-factory.ts` (430L) — depends on `agent-types`
4. Port `lib/alchemical-kinetics-sampler.ts` → `src/lib/alchemical-kinetics-sampler.ts` (33L) — leaf
5. Port `lib/services/planetary-agent-activation.ts` → `src/lib/services/planetary-agent-activation.ts` (445L) — depends on moon-phase-calculator, planetary-config-helper, unified-agent-factory, unified-agent-types
6. Port `lib/degree-agent-matcher.ts` → `src/lib/degree-agent-matcher.ts` (916L) — depends on agent-types, celestial-energy-calculator
7. Port `lib/degree-planetary-agent-mapping.ts` → `src/lib/degree-planetary-agent-mapping.ts` (406L) — audit deps

**Acceptance criteria:**
- [ ] 7 agent modules ported
- [ ] `bun run typecheck` passes
- [ ] `bun run lint` passes
- [ ] `bun run build` succeeds
- [ ] PR opened with title `feat(wten-migration): agents + matchers (session 6)`

**Common gotchas:**
- `kinetics-client` is a new module discovered transitively — verify it exists in source before assuming.

---

## Session 7 — Aspects, patterns, runes, temporal

**Pre-flight:**
```bash
git fetch origin master
git checkout -b claude/wten-migration-session-7 origin/master
bun install
```

**What's done:** Sessions 1–6. Agent layer in `src/`.

**This session's scope:** Port the aspect / pattern / rune / temporal layers.

1. `lib/dynamic-aspects-engine.ts` → `src/lib/dynamic-aspects-engine.ts` (571L) — depends on planetary-motion-tracker (done)
2. `lib/astrological-pattern-recognition.ts` → `src/lib/astrological-pattern-recognition.ts` (667L) — depends on planetary-motion-tracker (done)
3. `lib/runes/rune-system.ts` → `src/lib/runes/rune-system.ts` (431L)
4. `lib/runes/sign-vector-runes.ts` → `src/lib/runes/sign-vector-runes.ts` (701L) — depends on `./rune-system` (step 3)
5. `lib/temporal-analysis-engine.ts` → `src/lib/temporal-analysis-engine.ts` (979L) — depends on consciousness-memory (done), kinetic-profiles (done), alchemical-kinetics-sampler (done), planetary-api-client (done), structured-logger (done)

**Acceptance criteria:**
- [ ] 5 modules ported
- [ ] `bun run typecheck` passes
- [ ] `bun run lint` passes
- [ ] `bun run build` succeeds
- [ ] PR opened with title `feat(wten-migration): aspects + runes + temporal (session 7)`

**Common gotchas:**
- `temporal-analysis-engine` is one of the largest files (979L) — read it in chunks. Don't try to read+port in one pass.

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
- date-fns version mismatch between source and target. Check `package.json` versions; upgrade or pin if API shape differs.

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

## Total scope estimate (subject to Session 1 revision)

| Group | Files | LOC |
| :--- | ---: | ---: |
| shadcn UI components | 5 | (auto) |
| `src/lib/` (level 1) | 13 | 7,690 |
| `src/lib/` (level 2, transitive) | ~14 | 5,700 |
| `src/hooks/` | 1 | 140 |
| `src/components/` (UI) | 10 | 5,545 |
| Non-import error fixes (Session 11) | ~10 | ~50 (changes) |
| **Total** | **~53** | **~19,000** |

Plus Session 1's audit may surface more level-3 transitive deps not yet known.

**Estimated wall time**: 15–35 hours of focused work across 11 sessions. Realistic schedule: 2–4 weeks at 1 session per 2–3 days.

**If at any point during execution the scope expands past 70 files or 30k LOC, STOP and re-evaluate with the user.** The migration may not be worth the cost.
