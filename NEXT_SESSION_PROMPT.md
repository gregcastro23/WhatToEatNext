# Next Session: TypeScript Warning & Lint-Debt Elimination (15,367 → sub-14,000)

**Priority directive:** Suspend new feature expansion (including Solana mainnet roadmap progression) in favor of TypeScript type safety and ESLint warning remediation.
**Target:** Tracked lint debt below **14,000** (−1,368 or better, achieving ≤ 13,999), with zero regressions. Aim locally for **< 13,990** to safely absorb the ±1 macOS vs. Linux CI variance.
**Baseline:** **15,367 tracked warnings, 0 lint errors** across 1,352 files carrying tracked warnings in `src`.
**Target Scope:** **22 files, 1,806 target warnings** (16 primary + 6 buffer files) split across 3 PRs to comfortably absorb ~150 legitimately unremovable defect signals while guaranteeing sub-14,000 headroom.

---

## 0. Why this campaign exists (the actual motivation)

The lint-debt ratchet is a **hard, blocking, non-advisory PR gate**, and it is now coupled to the Solana mainnet track. The last two PRs on that track both went red in CI:

| PR | What failed | Root cause |
|---|---|---|
| [#801](https://github.com/gregcastro23/WhatToEatNext/pull/801) — dual-rail ledger isolation (K1) | `checks (Lint debt, bun run lint:debt)` | `Lint debt increased by 1: 15368 exceeds the baseline of 15367.` → `no-console: 744 -> 745 (+1)`. **One** `console.error` in `chainReconcileService`. Fixed in `74fc7fb2`. |
| [#800](https://github.com/gregcastro23/WhatToEatNext/pull/800) — Token-2022 metadata + icons (K0) | `checks (Test, bun run test --passWithNoTests)` | ESMS SVG icons are Git-LFS tracked (`*.svg` in `.gitattributes`); CI checked out **LFS pointer files**, so the pinned SHA-256 digest gate failed 8 tests. Fixed by adding `lfs: true` in `74859085`. |

A single incidental `console.error` on a settlement path cost a full CI cycle on a money-path PR. **Cutting the total buys headroom so that ordinary Solana work stops tripping the gate.** That is the point of this campaign — not aesthetics.

### The trap that produced #801's red

```bash
bun run verify   # typecheck + lint + test:fast — was GREEN
bun run lint:debt  # separate CI job — was RED
```

`bun run verify` does **not** include `lint:debt`. A green `verify` tells you nothing about the ratchet. Never conclude "ready to push" from `verify` alone.

---

## 1. Current State (2026-08-24)

- **Master & PR #801 Status:** PR #801 is **MERGED** (`a910b1bb` on `origin/master`). Branch fresh off `origin/master` (`git checkout -b feat/wten-lint-debt-remediation-p1 origin/master`) for Phase 1.
- **Baseline file:** `.lint-debt-baseline.json`, `trackedTotal: 15367`.
- **Snapshot Witness Harness:** `scripts/snapshot-witness.ts` and `scripts/fixtures/snapshot-witness-baseline.json` are committed. Runs offline in <10ms, exiting `0` on 100% value/distribution parity and `1` on mismatch with diff.

### Tracked rule breakdown (measured = baseline, exactly)

| Rule | Count | Share | Auto-fixable |
|---|---:|---:|---|
| `@typescript-eslint/no-unnecessary-condition` | 3,876 | 25.2% | No |
| `@typescript-eslint/explicit-function-return-type` | 2,535 | 16.5% | No |
| `@typescript-eslint/no-unsafe-member-access` | 2,149 | 14.0% | No |
| `@typescript-eslint/no-unsafe-assignment` | 1,452 | 9.4% | No |
| `@typescript-eslint/explicit-module-boundary-types` | 1,127 | 7.3% | No |
| `@typescript-eslint/no-explicit-any` | 892 | 5.8% | No |
| `no-console` | 744 | 4.8% | No |
| `no-void` | 719 | 4.7% | No |
| `@typescript-eslint/prefer-nullish-coalescing` | 700 | 4.6% | No |
| `@typescript-eslint/no-unsafe-argument` | 482 | 3.1% | No |
| `@typescript-eslint/no-unsafe-call` | 265 | 1.7% | No |
| `@typescript-eslint/no-unsafe-return` | 175 | 1.1% | No |
| `@typescript-eslint/require-await` | 163 | 1.1% | No |
| `no-useless-assignment` | 88 | 0.6% | No |
| **Tracked total** | **15,367** | | |

Measured at **0**, so ignore them: `no-inferrable-types`, `prefer-optional-chain`, `prefer-readonly`, `arrow-body-style`, `prefer-destructuring`, `max-nested-callbacks`, `react/display-name`, all three `jsx-a11y` rules.

**Declined rules earn zero credit.** `complexity` (371), `max-depth` (100), `max-lines` (648), `max-lines-per-function` (2,112) are measured but subtracted from the tracked total. Note they have already drifted **above** their recorded values (+21 / +6 / +4) with no gate consequence. **Splitting a large file for its own sake moves the number by nothing.** Modularize only when it is the means to removing tracked warnings.

---

## 2. Gate mechanics you must internalize

Read `scripts/checkLintDebt.ts` (108 lines) once before starting:

1. **The gate compares the TOTAL only — never per-rule.** `compareLintDebt` fails on `currentTotal > baselineTotal`. Adding 5 `no-console` while removing 6 `no-unnecessary-condition` **passes**. The per-rule delta list is only printed on failure, as diagnostics.
2. **The audit aborts if the *normal* lint config reports any error.** `bun run lint` must be at 0 errors or the debt job exits 1 before counting anything.
3. **`--ratchet` rewrites `.lint-debt-baseline.json` in place** (or with `LINT_DEBT_AUTO_RATCHET=1`), and only when the total *decreased*. It updates `trackedTotal` and every per-rule count. **The rewritten file must be committed in the same PR** — otherwise the reduction is invisible and the next PR gets no headroom.
4. **The audit config re-enables rules that the normal config turns off**, via a trailing `files: ["src/**/*.{ts,tsx,js,jsx}"]` block in `eslint.config.audit.mjs`.
5. **All 15,367 warnings are real production code.** `__tests__/`, `src/__tests__/`, `src/scripts/`, `src/server/`, and `src/lib/spacetime/generated/` are in the global `ignores` block of `eslint.config.mjs` and contribute **0**. Every reduction has to be earned.
6. **CI runs on `push` *and* `pull_request`** (`branches: ["**"]`), so every commit produces two identical CI runs. Concurrency cancels in-progress runs on the same ref — a `cancelled` conclusion is not a failure.
7. **`skipping` is not `pass`.** `gh pr checks <PR>` may show `skipping` for optional/conditional jobs. Do not read those as green.

---

## 3. Measurement discipline

### Commands that are trustworthy

```bash
bun run lint:debt
```
Full audit, run from repo root. Prints the tracked total on stdout.

```bash
bun scripts/checkFileLint.ts src/path/to/File.tsx
```
Per-file audit with line numbers and per-rule tally. This is your active feedback loop.

```bash
bun scripts/snapshot-witness.ts
```
Instant regression check asserting 100% parity across planetary kinematics, live ephemeris, and ingredient catalog samples.

```bash
NODE_OPTIONS=--max-old-space-size=8192 bun scripts/checkLintDebt.ts --ratchet
```
Only at the end of a PR, once the total is genuinely down. Commit the baseline diff it produces.

### ⚠️ The measurement trap that fired during prep

An ad-hoc audit script placed **outside the repo tree** (in a scratchpad dir) resolved **eslint 10.9.1 from `~/.bun/install/cache`** instead of the repo's pinned **9.39.4**. ESLint 10 broke `eslint-plugin-react@7.37.5`, which threw:

```
TypeError: Error while loading rule 'react/display-name': contextOrFilename.getFilename is not a function
```

No output file was written — **and `bun` still exited 0.** The harness reported "completed (exit code 0)" for a run that produced nothing.

Rules that follow from this:
- Run every audit script **from inside the repo tree** so `node_modules` resolution matches CI (`bun install --frozen-lockfile` → eslint 9.39.4).
- **A zero exit code is not a measurement.** Assert on the artifact — the printed number, the written file — never on the exit status.
- If a count looks impossibly good, you measured the wrong thing. Local and CI agreed exactly (15,367); historically they can differ by ±1 (macOS vs Linux).

---

## 4. The Targeted Remediation Plan (22 Files · 1,806 Tracked Warnings)

Split across **3 sequential PRs** to keep diffs bisectable and reviewable. Target 1,806 warnings to provide ~438 warnings of buffer over the required 1,368 reduction, ensuring the target of < 14,000 is met even if ~150 condition defect-signal warnings are retained after investigation.

### Phase 1 PR — Boundaries & `no-unsafe-*` Clusters (435 warnings)

| # | File | Tracked | Dominant rules | Architectural Actions |
|---|---|---:|---|---|
| 1 | `src/app/admin/_dashboard/panels.tsx` | 117 | unsafe-member-access 36 · efrt 20 · unsafe-assignment 18 · embt 15 · unsafe-call 14 | Import `EnginePerformanceData` and `CommerceSummaryData` from `@/services/dashboardPanelsService` (lines 598 & 618). Replace `any` props on `EngineHealth` and `CommercePanel`. Strictly preserve `live: false` fallback gating. Annotate return types last. |
| 4 | `src/utils/serverPlanetaryCalculations.ts` | 99 | unsafe-member-access 48 · unsafe-assignment 34 · unsafe-call 8 | Replace `(AstronomyModule as any).default` with typed shim: `const Astronomy: typeof AstronomyModule = (AstronomyModule as unknown as { default?: typeof AstronomyModule }).default ?? AstronomyModule;`. Type boundary return structures. |
| 14 | `src/services/LocalRecipeService.ts` | 72 | unsafe-member-access 34 · unsafe-assignment 18 · unsafe-argument 7 | Type internal storage operations and search helpers using domain `Recipe` interface from `@/types/recipe`. |
| 16 | `src/utils/liveEphemeris.ts` | 69 | unsafe-member-access 31 · unsafe-assignment 22 · unsafe-call 13 | Apply typed `Astronomy` shim identical to `serverPlanetaryCalculations.ts`. Type ephemeris and transit position mappings. |
| 10 | `src/utils/menuPlanner/recommendationBridge.ts` | 78 | unsafe-member-access 23 · unnecessary-condition 21 · explicit-any 16 | Replace `any` casts with explicit domain types (`Recipe`, `MealPlan`, `AlchemicalState`). Verify LHS nullability before converting `||`. |

### Phase 2 PR — Conditions & Logic Engines (458 warnings)

| # | File | Tracked | Dominant rules | Architectural Actions |
|---|---|---:|---|---|
| 6 | `src/services/UnifiedIngredientService.ts` | 94 | unnecessary-condition 90 (45 optional-chain, 31 truthy, 9 no-overlap, 5 falsy) | Clean static `?.` chains. Investigate the 14 defect signals (9 no-overlap, 5 falsy) for stale types vs unreachable branches; do not delete active invariants. Fix 1 `no-useless-assignment`, 1 `no-void`. |
| 9 | `src/services/UnifiedRecommendationService.ts` | 82 | unnecessary-condition 73 · require-await 4 · efrt 3 · no-console 1 | Clean recommendation conditions; remove `async` from 4 non-awaiting functions after confirming no callers use `.then()`; convert 1 `console.error` to `_logger.error`. |
| 5 | `src/utils/ingredientRecommender.ts` | 98 | unnecessary-condition 52 · unsafe-call 18 · unsafe-member-access 18 | Type scoring functions and elemental harmony calculators; align parameter types with callers. |
| 2 | `src/components/recipe/CosmicRecipeGenerator.tsx` | 114 | unnecessary-condition 41 · unsafe-member-access 19 · no-console 5 | Type generator state against `CosmicRecipe`. Remove dead fallbacks on non-nullish LHS; convert 5 `console.error` to `_logger.error`. |
| 15 | `src/components/CookingMethods.tsx` | 70 | unnecessary-condition 35 · efrt 8 · nullish-coalescing 7 · no-console 5 | Clean conditional rendering; convert 4 `console.error` to `_logger.error` and 1 `console.log` to `_logger.debug`; add return types. |

### Phase 3 PR — UI, Hooks, Data & Buffer Tier (913 warnings)

| # | File | Tracked | Dominant rules | Architectural Actions |
|---|---|---:|---|---|
| 3 | `src/app/recipes/[recipeId]/RecipeClient.tsx` | 105 | unnecessary-condition 31 · nullish-coalescing 25 · explicit-any 14 · no-console 1 | Convert `||` to `??` only where `0` or `""` must be preserved; delete dead fallbacks on non-nullish LHS; convert 1 `console.error` to `_logger.error`. |
| 7 | `src/data/unified/flavorCompatibilityLayer.ts` | 90 | unsafe-member-access 29 · nullish-coalescing 29 · unsafe-assignment 22 | Type affinity matrices; convert `||` to `??` preserving numeric `0` scores. |
| 8 | `src/hooks/useAstrology.ts` | 83 | unsafe-member-access 22 · nullish-coalescing 16 · unsafe-assignment 16 | Strongly type planetary positions hook return values and transit cache. |
| 11 | `src/components/recommendations/EnhancedCookingMethodRecommender.tsx` | 76 | unnecessary-condition 24 · efrt 21 · embt 11 · no-console 2 | Add return types; convert 2 `console.warn` to `_logger.warn`. |
| 12 | `src/components/dashboard/CommensalManager.tsx` | 76 | unsafe-member-access 18 · efrt 17 · no-void 9 · no-console 1 | Type lobby state; evaluate 9 `no-void` calls; convert 1 `console.error` to `_logger.error`. |
| 13 | `src/components/recommendations/EnhancedIngredientRecommender.tsx` | 75 | efrt 40 · unnecessary-condition 26 · no-console 1 | Add 40+ explicit return types; clean conditions; convert 1 `console.error` to `_logger.error`. |
| 17 | `src/components/home/DynamicCuisineRecommender.tsx` | 69 | unsafe-member 32 · unsafe-assign 15 · no-console 7 · explicit-any 5 | Type cuisine recommender state and callbacks; convert console logs to `_logger`. |
| 18 | `src/components/cuisines/CurrentMomentCuisineRecommendations.tsx` | 69 | cond 47 · efrt 11 · unsafe-assign 4 · explicit-any 3 | Clean unnecessary conditions and annotate return types. |
| 19 | `src/components/CuisineRecommender.tsx` | 69 | unsafe-member 18 · cond 15 · unsafe-assign 9 · efrt 8 · no-console 4 | Type recommendations and props; convert console logs to `_logger`. |
| 20 | `src/services/feedDatabaseService.ts` | 68 | unsafe-member 30 · unsafe-assign 27 · unsafe-call 4 · cond 3 | Type database rows and feed event mappings. |
| 21 | `src/calculations/index.ts` | 67 | explicit-any 19 · nullish 13 · unsafe-arg 8 · unsafe-assign 8 · member 6 | Replace `any` casts with domain types and fix nullish coalescing operators. |
| 22 | `src/data/recipes.ts` | 67 | nullish 47 · cond 13 · unsafe-arg 2 · efrt 2 · embt 2 | Convert `||` to `??` preserving `0` ratings/elemental values across recipe entries. |

---

## 5. Per-Rule Remediation Rules

### 5.1 `no-unnecessary-condition` (3,876 in codebase)
- **Distinguish Defect Signals from Noise**:
  - `Unnecessary optional chain on a non-nullish value` (157 in target set): Safe to remove.
  - `Unnecessary conditional, value is always truthy` (185 in target set): Safe once confirmed local non-null construction.
  - `Types have no overlap` (18 in target set) & `Unnecessary conditional, value is always falsy` (22 in target set): **Investigate as potential bugs or stale type assertions. Do not delete active invariants just to hit a number.**
- **Phase 1 Creates Phase 2 Warnings**: `no-unnecessary-condition` bails out on `any`/`unknown`. As you type `any` variables, previously hidden conditional warnings will appear. Always re-measure with `checkFileLint` after typing.

### 5.2 `no-console` (744 in codebase)
- **Level-for-Level Mapping**:
  - `console.error` → `_logger.error`
  - `console.log` / `console.debug` → `_logger.debug`
  - `console.warn` → `_logger.warn` (or `_logger.error` **only on money paths**)
- **Target File Console Inventory (16 instances)**:
  - `CosmicRecipeGenerator.tsx`: 5× `console.error` → `_logger.error`
  - `CookingMethods.tsx`: 4× `console.error` → `_logger.error`, 1× `console.log` → `_logger.debug`
  - `EnhancedCookingMethodRecommender.tsx`: 2× `console.warn` → `_logger.warn`
  - `UnifiedRecommendationService.ts`: 1× `console.error` → `_logger.error`
  - `CommensalManager.tsx`: 1× `console.error` → `_logger.error`
  - `RecipeClient.tsx`: 1× `console.error` → `_logger.error`
  - `EnhancedIngredientRecommender.tsx`: 1× `console.error` → `_logger.error`
- **Never convert console calls inside logger implementations** (`galileo-logger.ts`, `logger.ts`, `LoggingService.ts`).

### 5.3 `prefer-nullish-coalescing` (700 in codebase)
- **LHS Nullability Check**: If LHS is provably non-nullish, **delete the fallback** instead of swapping `||` to `??` (which just trades for a `no-unnecessary-condition` warning).
- **Preserve Falsy Values**: If LHS is nullable and `0`, `""`, or `false` is meaningful domain data (scores, coordinates, weights), convert `||` to `??`.

### 5.4 `explicit-function-return-type` (2,535) & `explicit-module-boundary-types` (1,127)
- Always annotate return types **last within a file** after all internal typing is clean.

### 5.5 `no-void` (719) & `require-await` (163)
- Only remove `void` if the caller is genuinely async and awaiting.
- Only remove `async` from a function after grepping all call sites to ensure none rely on `.then()` / `.catch()`.

---

## 6. Verification Protocol

1. **Before editing a file**: `bun scripts/checkFileLint.ts <path>` (record before count).
2. **After editing a file**: `bun scripts/checkFileLint.ts <path>` (record after count & delta).
3. **Behavioral witness check**: `bun scripts/snapshot-witness.ts` (asserts exact 100% parity with baseline fixture).
4. **Typecheck & Lint**: `bun run typecheck && bun run lint` (0 errors).
5. **Fast Tests**: `bun run test:fast`.
6. **Full Test Suite**: `bun run test --passWithNoTests`.
7. **Next.js Build Check**: `bun run build`.
8. **Git hygiene**: `git diff --stat` before staging; never use `git add -A`.
9. **Intermediate PR Check**: `bun run lint:debt` (must be ≤ 15,367).
10. **Final PR Ratchet**: `bun run lint:debt` (must be < 14,000) → `NODE_OPTIONS=--max-old-space-size=8192 bun scripts/checkLintDebt.ts --ratchet` and commit `.lint-debt-baseline.json`.

---

## 7. Hard Rules

1. **Zero suppressions**: No `eslint-disable`, `@ts-ignore`, `@ts-expect-error`, or `as any`.
2. **Money-path logging**: `_logger.error` only.
3. **Elemental logic**: Additive and self-reinforcing.
4. **Never fabricate admin data**: Preserve `live: false` fallbacks in `panels.tsx`.
5. **Do not touch the `declined` block** of `.lint-debt-baseline.json`.
6. **Assert on printed numbers**: A zero exit code is not a measurement.
