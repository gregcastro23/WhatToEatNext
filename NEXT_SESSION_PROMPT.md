# Next Session: Phase 30 — Strict-Index Latent Error Burndown (478 -> <= 380)

> **Status note.** Phase 29 is **verified in the current working tree** (not yet committed; HEAD is at `fbd52496` where baselines were 588 strict-index errors and 10 read-JSON allowlisted calls). The working tree contains 38 changed paths that complete Gate 11 response narrowing (10 -> 0), repair 15 strict-index target clusters (-110 errors, 588 -> 478), reduce AST assertion sites (-13, 3,308 -> 3,295), preserve all rich domain models (`lunarPhaseUtils.ts`, `chakraSymbols.ts`, `defaults.ts`, `typeDefaults.ts`), and pass all 11 static gates, 365 test suites, and the Next.js production build:
> - **Gate 11 Zero Allowlist Verified**: All 30 response-reading call sites in the application now strictly enforce AST `{ parse: Schema.parse }`. `.read-json-baseline.json` is at **0 unvalidated (allowlist: `[]`)**.
> - **Strict-Index Latent Type Repairs (588 -> 478 across 294 files)**: Repaired optional property assigning defects across 15 high-density targets, burning down 110 compiler errors. `.strict-index-baseline.json` is ratcheted to 478 with 0 allowlisted files.
> - **AST Assertion Sites Reduction (3,308 -> 3,295)**: Removed unsafe `as Record<string, MethodData>` assertions in favor of type-safe adapters (`adaptCookingMethods`). `.lint-debt-baseline.json` is ratcheted down to 3,295 assertion sites.
> - **Domain Physics & Alchemical Integrity Preserved**: User-directed enforcement of **FIX > REMOVE**: `src/utils/lunarPhaseUtils.ts` (586 lines), `src/constants/chakraSymbols.ts` (857 lines), `src/constants/defaults.ts` (212 lines), and `src/constants/typeDefaults.ts` (358 lines) are 100% preserved with all domain calculations intact.
> - **All 11 Static Gates Green, Full Test Suite Pass & Production Build**: All 11 static gates pass with 0 errors; 365/365 Jest test suites pass (3,801 tests); Next.js production build (`bun run build`) compiles with 0 errors and all bundle sizes within threshold.
>
> | Metric | P25 | P26 | P27 | P28 | P29 (Working Tree Verified) |
> |---|---:|---:|---:|---:|---:|
> | Tracked lint debt | 1,635 | 1,520 | 1,493 | 1,474 | **1,474** (held) |
> | Declined pool | 4,910 | 4,910 | 4,910 | 4,906 | **4,906** (held) |
> | Casts (gated) | 169 | 168 | 167 | 167 | **167** (held) |
> | Assertion sites (AST) | 3,396 | 3,353 | 3,325 | 3,308 | **3,295** (-13) |
> | `prefer-nullish-coalescing` sub-baseline | 214 | 214 | 214 | 214 | **214** |
> | `exactOptionalPropertyTypes` strict-index | 674 / 329 files | 671 / 328 files | 668 / 325 files | 588 / 312 files | **478 / 294 files** (-110 errors) |
> | Route validation gate (unvalidated / body-reading) | — | — | 21 / 123 | 0 / 123 | **0 / 123 (Allowlist: 0)** |
> | `readJson` response validation gate (Gate 11) | — | — | — | 10 / 30 | **0 / 30 (Allowlist: 0)** |
> | Gate test suites / tests | — | 6 / 88 | 7 / 96 | 8 / 110 | **8 / 110** (all green) |
> | Static Gates passing | — | — | 10 / 10 | 11 / 11 | **11 / 11 (All Green)** |
> | Unit Test Suite (Jest) | — | — | 336 suites | 364 suites | **365 suites (3,801 passed)** |
> | Next.js Production Build (`bun run build`) | — | — | Pass | Pass | **Pass (0 errors)** |
>
> Every number above was re-measured on 2026-09-11 against live static gates and reproduces working tree baselines exactly.

---

## 1. Preflight & Checkpoint Instructions

> [!IMPORTANT]
> **Do not begin Phase 30 edits until Phase 29 is intentionally checkpointed.**
> - Confirm the status of the current working tree (`git status -s`).
> - Do not commit or push unless explicitly instructed or authorized by the user.
> - Preserve all 38 modified files and baselines established in Phase 29.
> - Run `git diff --check` before any edits to ensure no trailing whitespace or EOF issues exist.

---

## 2. Definition of Done for Phase 30

### Required Objective: Strict-Index Latent Error Burndown (478 -> <= 380)

1. **Pre-edit Baseline Re-measurement**:
   - Re-measure live diagnostics using `NODE_OPTIONS=--max-old-space-size=8192 bun scripts/checkStrictIndex.ts --top 25`.
2. **Error Target**:
   - Reduce strict-index diagnostics from 478 down to **<= 380 errors** across `tsconfig.strict-index.json` (a reduction of **at least 98 errors**).
3. **Semantic Integrity (Do Not Weaken Types)**:
   - Prioritize TS2375 (229 errors) and TS2379 (111 errors), which together constitute 79% of all strict-index defects.
   - Preserve the strict semantic distinction between:
     - **`absent`** (omitted property)
     - **`present-with-undefined`** (explicitly assigned `undefined`)
     - **`null`** (explicitly null)
   - Do NOT widen shared type definitions (e.g., blanket `| undefined` or optionalizing required fields) solely to satisfy the compiler.
   - Use the conditional spread pattern for optional fields: `...(val !== undefined ? { prop: val } : {})`.
4. **Non-regression Guarantee**:
   - Do not introduce new diagnostic locations to offset fixes elsewhere.
   - No file should see an error count increase.
5. **Ratchet & Verification**:
   - Ratchet only after the target (<= 380) is achieved: `bun run strict-index:ratchet`.
   - Run `bun run verify:full` once at the end of the phase to validate all static gates, unit tests, and production compilation.

---

### Stretch Objectives (Independent Debt Ceilings)

If the required strict-index objective is completed with headroom, address the following stretch targets without regressing any other metric:

1. **`no-unnecessary-condition` Reduction**:
   - Live count: **835 findings across 307 files** (Message distribution: `neverOptionalChain`: 258, `alwaysTruthy`: 223, `neverNullish`: 213, `alwaysFalsy`: 106, `noOverlapBooleanExpression`: 24, `comparisonBetweenLiteralTypes`: 11).
   - Stretch target: Reduce findings from **835 to <= 780** (burn down >= 55 findings).
   - **Mandatory Safety Rules for Condition Removals**:
     - Determine whether the static TypeScript type or the runtime payload behavior is authoritative.
     - Characterize malformed, absent, and null input behavior before removing any guard.
     - Prefer fixing the upstream source type or tightening boundary validation over removing downstream defensive checks.
     - Never replace guards with non-null assertions (`!`), type casts (`as T`), wider `| undefined` types, or ESLint disable comments merely to reduce the warning counter.
     - Touched files must have zero new warnings, even if the aggregate total decreases.
2. **Tracked Lint Debt Ratchet**:
   - Tracked debt: **1,474 -> <= 1,419** (driven by condition cleanups).
3. **AST Assertion Sites & Gated Casts**:
   - Assertion sites: **3,295 -> <= 3,250** (eliminate >= 45 `as` assertions using runtime narrowing or type adapters).
   - Gated casts: **167 -> <= 165**.
   - Ensure zero increase in production casts (<= 135), `as any` (<= 38), declined pool (<= 4,906), or PNC sub-baseline (<= 214).

---

### Deferred Feature Objective: Domain Feature Wiring (Design & Vertical Slice First)

> [!CAUTION]
> **Do not broadly wire `lunarPhaseUtils.ts` or `chakraSymbols.ts` across product surfaces in this phase.**
> - `lunarPhaseUtils.ts` contains knowingly preserved latent calculations (lines 461, 517), `applyVelocityBoost` is a documented no-op placeholder (line 428), and neither illumination-curve nor void-of-course calculations are implemented.
> - `chakraSymbols.ts` generates metrics using `Math.random()` (e.g. line 150), making runtime output nondeterministic and risking hydration mismatches and test instability.
> - "Alchemy Atlas" does not identify a concrete, existing route.
>
> **Discovery & Vertical Slice Mandate**:
> Before exposing these modules to live user flows:
> 1. Select **one single route** (e.g., `/celestial-lab` or `/kitchen-lab`).
> 2. Define exact input contracts, deterministic calculation formulas (eliminate all `Math.random()` calls), and visible UI behavior.
> 3. Fix documented latent calculation defects with mathematical unit tests.
> 4. Add UI acceptance tests proving determinism before merging.

---

## 3. Live Diagnostic Distribution & Top Strict-Index Targets

Measured live across 1,982 scanned files (478 errors across 294 files):
- **Error Code Breakdown**:
  - `TS2375` (`exactOptionalPropertyTypes` assignment mismatch): **229 errors**
  - `TS2379` (`exactOptionalPropertyTypes` object literal mismatch): **111 errors**
  - `TS2322` (Type assignment mismatch): **47 errors**
  - `TS2345` (Argument type mismatch): **23 errors**
  - `TS2412` (Property in type not assignable to index): **11 errors**
  - `TS2352` (Conversion type mismatch): **6 errors**
  - `TS2769` (No overload matches call): **4 errors**
  - *TS2375 + TS2379 = 340 errors (71% of total).*

- **Area Distribution**:
  - `src/components/`: 103 errors
  - `src/utils/`: 79 errors
  - `src/app/api/`: 65 errors
  - `src/services/`: 58 errors
  - `src/app/(alchm)/`: 47 errors
  - `src/lib/`: 43 errors
  - `src/data/`: 17 errors
  - `src/contexts/`: 17 errors
  - Other: 49 errors

- **Top Live Files (Inspect via `bun scripts/checkStrictIndex.ts --top 20`)**:
  - `src/lib/menu-planner/schemas.ts` (8 errors)
  - `src/components/menu-planner/RecipeBrowserPanel.tsx` (5 errors)
  - `src/contexts/menu-planner/useMealSlots.ts` (5 errors)
  - `src/data/unified/recipeBuilding.ts` (5 errors)
  - `src/services/UnifiedRecommendationService.ts` (5 errors)
  - `src/utils/cuisine/sauceLineage.ts` (5 errors)
  - `src/utils/ingredientRecommender.ts` (5 errors)
  - `src/app/(alchm)/feed/page.tsx` (4 errors)
  - `src/app/api/group-recommendations/route.ts` (4 errors)
  - `src/app/cooking-methods/[method]/page.tsx` (4 errors)
  - `src/app/ingredients/IngredientsExplorer.tsx` (4 errors)
  - `src/components/time-laboratory/planetary-agents-view.tsx` (4 errors)
  - `src/contexts/GroceryCartContext.tsx` (4 errors)
  - `src/contexts/menu-planner/MenuPlannerProvider.tsx` (4 errors)
  - `src/lib/orders/fulfillment.ts` (4 errors)
  - `src/services/EnhancedRecommendationService.ts` (4 errors)
  - `src/services/stripeWebhookCoverageService.ts` (4 errors)
  - `src/utils/cookingMethodRecommender.ts` (4 errors)
  - `src/utils/menuPlanner/recommendationBridge.ts` (4 errors)

---

## 4. Verification Protocol

Use targeted inner-loop commands during development and run `bun run verify:full` once upon completion:

```bash
# Inner-loop checks during development:
NODE_OPTIONS=--max-old-space-size=8192 bun scripts/checkStrictIndex.ts --top 15
bun run typecheck
bun run lint:fast

# Targeted test running:
bun run test -- <target-pattern>

# Full gate verification (run ONCE when work is complete):
bun run verify:full
```

### The 11 Static Gates Checklist:
1. `check:untracked` — Ensures no untracked `.ts`/`.tsx` files exist in `src/` or `scripts/`.
2. `check:route-validation` — 0 unvalidated body-reading routes (allowlist: `[]`).
3. `test:gates` — AST and gate tests in `scripts/lib/__tests__/` (110 passed across 8 suites).
4. `strict-index:check` — Enforces `tsconfig.strict-index.json` (baseline 478 / 294 files).
5. `check:scripts` — Typecheck on `scripts/**/*.ts` (baseline 302 errors / 58 files).
6. `typecheck` — Full Next.js production typegen and compiler check (`next typegen && tsc --noEmit`). Must be 0 errors.
7. `lint` — ESLint on `src/` (`--max-warnings=10000`).
8. `lint:scripts` — ESLint on `scripts/` (`--max-warnings=25`).
9. `lint:debt` — Ratchet gate for lint debt (1,474), casts (167), assertion sites (3,295), and sub-baselines.
10. `audit:dead-modules` — AST dead module check (0 unreachable modules).
11. `check:read-json` — AST gate ensuring `readJson` / `safeReadJson` calls pass `{ parse: Schema.parse }` (0 unvalidated, allowlist: `[]`).

---

## 5. Operational Lessons & Traps to Avoid

1. **Do Not Over-Rely on `--forceExit`**:
   - Canonical `package.json` scripts intentionally do not use `--forceExit` so handle leaks are detectable.
   - Run `bun run test:detect-open-handles` if a worker hangs rather than masking leaks with unconditional process termination.

2. **Compliance Test Regex Spans (`HooksCompliance.test.tsx`)**:
   - `HooksCompliance.test.tsx` tests `/try\s*\{[\s\S]*?useAlchemical\(\)[\s\S]*?\}\s*catch/`.
   - Never declare helper functions containing `try/catch` above components that invoke `useAlchemical()`. Place top-level helpers *after* the component at the bottom of the file.

3. **Cyclomatic Complexity in Loop Bodies**:
   - In components like `EnhancedCookingMethodRecommender.tsx` with complexity limits of 20, inline conditional object spreads (`...(cond ? { k: v } : {})`) inside `.flatMap()` or `.map()` callbacks will trigger `complexity` lint debt.
   - Extract multi-branch evaluations into standalone pure functions (`computeTransformedESMS`, `computeMethodKinetics`).

4. **Finder Duplicate Artifacts (`* 2` and `* 3`)**:
   - macOS Finder conflict copies (e.g., `mechanics 2/page.tsx`) are ignored by `.gitignore` and `tsconfig.json`, but the Next.js App Router will attempt to discover and compile them.
   - Always ensure no `* 2` folders remain under `src/app/`.

5. **`import/order` ESLint Rule**:
   - `eslint.config.mjs` enforces `"newlines-between": "never"`.
   - All `import type` statements must precede any `export *` statements to prevent import order warnings.
