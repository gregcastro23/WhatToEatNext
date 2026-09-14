# Phase 32: Exact-Optional TypeScript Burndown (295 → ≤230 required, ≤220 stretch)

## 0. Session Handover & Repository Boundary

Phase 31 has been merged into `master` via merge commit `995805e7` (PR #843).

### Step 0: Merge Guard & Fresh Branch Checkout
Before branching, verify that `origin/master` is up to date and contains the merged Phase 31 baseline:

```bash
# 1. Verify PR #843 merge state and commit
gh pr view 843 --json state,baseRefName,mergeCommit

# 2. Verify local origin/master matches remote HEAD
gh api repos/gregcastro23/WhatToEatNext/commits/master --jq .sha

# 3. Fetch and branch from updated master
git fetch origin master
git checkout master
git pull --ff-only origin master
git checkout -b feat/phase-32-exact-optional-burndown

# 4. Verify clean starting state and baseline integrity
git status --short --branch
git rev-parse HEAD
git diff HEAD --stat

# 5. Sanity check: stop immediately if strict-index baseline isn't 295 across 222 files
bun -e 'import b from "./.strict-index-baseline.json"; if (b.totalErrors !== 295 || b.fileCount !== 222) { console.error("Stale baseline!", b); process.exit(1); } else { console.log("Baseline verified: 295 errors / 222 files"); }'
```

### Active Compiler Strictness
The active strictness tier is **`exactOptionalPropertyTypes: true`** (`tsconfig.strict-index.json`). `noUncheckedIndexedAccess: true` is already enabled in the base configuration. Keep the existing `strict-index:*` script names and both configurations unchanged.

### Baseline Measurements Entering Phase 32

| Metric | Measured Baseline | Gate / Constraint |
| :--- | :---: | :---: |
| **Strict-index diagnostics** | **295 across 222 files** | Target $\le 230$ required, $\le 220$ stretch |
| **Strict-index allowlist** | `[]` (0 entries) | Must remain strictly empty |
| **Tracked lint debt** | **1,473** | Ceiling 1,473 (zero regression allowed) |
| **Non-null assertions (`!`)** | **605** | Ceiling 605 (probe must not exceed 605) |
| **Gated casts** | **167 total / 135 prod** | Baseline preserved |
| **AST assertion sites** | **3,293 total / 2,670 prod** | Baseline preserved |
| **Route validation** | **0 unvalidated / 123 routes** | `checkRouteValidation.ts` must stay 0 |
| **`readJson` validation** | **0 unvalidated / 30 calls** | `checkReadJsonValidation.ts` must stay 0 |
| **`lint:scripts`** | **25 warnings (cap is 25)** | Zero new warnings allowed in `scripts/` |
| **Script typecheck errors** | **302 across 58 files** | Baseline preserved |
| **Base `typecheck`** | **0 errors** | Zero errors allowed |
| **Jest test suites** | **373 passed, 0 failed** | 3,837 passed, 10 skipped |

Treat live compiler output from `runStrictIndexCheck` as authoritative. Never hand-edit a baseline file.

---

## 1. Phase 31 Key Lessons & Operating Rules

### Core Lessons Learned in Phase 31
1. **Widen ONLY pure-reader types, never persisted entities**:
   - Pure-reader types passed into presentational components or pure transform inputs (e.g. `AvatarPerson`, `ChatBubbleProps`, `BirthSectInput`) can be widened (`| undefined`) safely with zero runtime impact.
   - Widen only types that are purely read (props, input objects, private fields) and never persisted or passed on to a narrower type.
   - Persisted entities (e.g. `SavedRestaurant`, `UserProfile`, database rows) or objects written to storage/DB must **not** be widened; address them at writer call sites via conditional spreads.
2. **Group shared types by declaration, not by name**:
   - Multiple interfaces in the codebase share identical names (e.g. 10 distinct declarations of `PlanetaryPosition`, 2 of `AstrologicalState`). Always trace each error site to its exact source declaration before deciding whether to widen or spread.
3. **Prove type-only edits with emit parity**:
   - For every widened type, prove zero runtime change by comparing emitted JS before and after with `fileName`, `jsx: ts.JsxEmit.ReactJSX`, and `removeComments: true`:
     ```ts
     const emit = ts.transpileModule(sourceText, {
       fileName: targetFilePath,
       compilerOptions: {
         module: ts.ModuleKind.ESNext,
         target: ts.ScriptTarget.ES2022,
         jsx: ts.JsxEmit.ReactJSX,
         removeComments: true,
       },
     }).outputText;
     ```
     Emitted JS must be 100% byte-identical.
4. **Tooling efficiency and validation limits**:
   - `bun scripts/checkStrictIndex.ts --file <path>` takes ~1.5–2s for targeted single-file iteration, but only compiles that file and its direct import graph. It cannot see regressions in downstream consumers of a widened shared type.
   - Run the full check (`~23s`) after **every** shared-type edit and at every cluster boundary.
5. **Guard semantics: `!== undefined` vs truthiness**:
   - Default to `!== undefined`: it is the only guard that behaves identically to the old pass-through for `null`, `0`, `""`, and `false`.
   - A truthiness guard (`if (val)`) is a deliberate runtime behavior change (dropping `""` or `0`). If applied, it must be verified as safe and documented in the final report.
6. **Consumer patch semantics**:
   - Before spreading, check what reads the object: `RecipeSelector.tsx:353` demonstrated that an explicit `undefined` in a merge patch is sometimes intended to *clear* fields rather than leave them unchanged.
7. **Test rigor for behavior changes**:
   - Existing tests using `toEqual` cannot distinguish `{ a: undefined }` from `{}` (Jest's `toEqual` treats missing and undefined keys as equal). Always assert missing keys with `'key' in obj === false`.
   - Any new test written to verify a behavioral change must **fail on the old code** before being committed.

### Standing Rules from Phase 30 (Mandatory)

#### Absent vs Undefined vs Null Decision Table

| Scenario | Semantic Decision |
| :--- | :--- |
| Property should be absent when no value exists | Use a conditional object spread `...(val !== undefined ? { val } : {})` and omit the key |
| Property is always present but may contain `undefined` | Use `T \| undefined` only when callers and runtime data require that contract |
| Database/API represents missing data as `null` | Preserve `null`, or normalize it explicitly at the boundary |

#### Non-negotiable repair rules
- **Zero new lint debt**: `bun run lint:debt` must not increase (1,473 ceiling).
- **Non-null assertion ceiling**: Non-null assertions (`!`) must not exceed 605.
- **Strict-index allowlist**: Must remain strictly empty (`[]`).
- **Forbidden constructs**: Never use `as any`, chained `as unknown as`, non-null assertions `!`, `@ts-ignore`, `@ts-expect-error`, or lint-disable comments to bypass diagnostics.
- **Preserve domain calculations**: Do not delete, gut, or replace rich domain calculations to make types pass. **FIX > REMOVE.**
- **Inspect callers**: Always check all call sites and consumers before changing a shared type.
- **Test coverage**: Add or update targeted tests when repairs touch serialization, omission, null handling, fallback behavior, or public function contracts.
- **Test environment safety**: Always ensure database-connected services (e.g., `userDatabaseService`, `TokenEconomyService`, `authEventsService`) isolate against real databases in tests (`delete process.env.DATABASE_URL;` before imports).
- **Correct test runner command**: Run tests using Jest via `bun run test --runTestsByPath <path>`, never `bun test` (which invokes Bun's native runner without jsdom/Jest aliases).

---

## 2. Phase 32 Target & Measured Candidate Pools

### Target Objective
- **Required Target**: Reduce strict-index diagnostics from **295 to ≤230** (net reduction of $\ge 65$ diagnostics).
- **Stretch Target**: Reduce to **≤220** (net reduction of $\ge 75$ diagnostics).

### Pool Sizing & Worklist Rule
Reaching $\le 230$ with 20% headroom requires ~82 candidate sites; reaching $\le 220$ requires ~94 candidate sites. Because vetted utilities, shared types, and auth sites provide ~57 candidates, Phase 32 **must** venture into components or API routes.
**RULE**: Build and classify a named, specific worklist before editing any file.

### Measured Distribution of Remaining 295 Diagnostics

```
Remaining Diagnostics: 295 across 222 files

By Directory:
  - src/components/   : 59 diagnostics
  - src/app/api/      : 58 diagnostics (API routes)
  - src/utils/        : 46 diagnostics
  - src/lib/          : 36 diagnostics
  - src/app/(alchm)/  : 33 diagnostics (pages)
  - src/services/     : 15 diagnostics
  - src/data/         : 12 diagnostics
  - other app routes  : 11 diagnostics
  - src/hooks/        : 10 diagnostics
  - src/calculations/ : 4 diagnostics
  - src/actions/      : 4 diagnostics
  - src/contexts/     : 3 diagnostics
  - src/server/       : 3 diagnostics
  - src/types/        : 1 diagnostic
```

### Categorized Candidate Pools

#### 1. Vetted from Phase 31 (Not Yet Started): 32 diagnostics
- **Utils (21 diagnostics)**:
  - `src/utils/cuisineAggregations.ts` (3)
  - `src/utils/recommendation/methodRecommendation.ts` (3)
  - `src/utils/cuisine/cuisineAggregationEngine.ts` (2)
  - `src/utils/cuisine/cuisineRecommendationEngine.ts` (2)
  - `src/utils/culturalMethodsAggregator.ts` (2)
  - `src/utils/methodAlchemicalSnapshot.ts` (2)
  - `src/utils/recipe/recipeSchemaValidator.ts` (2)
  - `src/utils/recipeAlchemicalQuantities.ts` (2)
  - `src/utils/guestPalate.ts` (1)
  - `src/utils/timeShortcuts.ts` (1)
  - `src/utils/logger.ts` (1)
- **Menu-Planner (10 diagnostics)**:
  - `src/components/menu-planner/NutritionalDashboard.tsx` (2)
  - `src/components/menu-planner/redesign/RedesignedMobilePlanner.tsx` (2)
  - `src/components/menu-planner/SauceSelector.tsx` (2)
  - `src/components/menu-planner/TodaysMealsWidget.tsx` (2)
  - `src/components/menu-planner/redesign/AgentProfileWeekCard.tsx` (1)
  - `src/utils/menuPlanner/nutritionalCalculator.ts` (1)
- **Bridge leftover (1 diagnostic)**:
  - `src/utils/menuPlanner/recommendationBridge.ts:607` (in same function as deferred `:376` cast; do last or defer with `:376`).

#### 2. Shared Types Pool Breakdown (Inspect Per Declaration): ~20 diagnostics
- `CookingMethodData` (7): 4 static method files already cast `thermodynamicProperties` with `as unknown as` (e.g. `broiling.ts:133`); `cookingMethodRecommender.ts:322` is an existing TS2352 cast. Two are in `methodRecommendation.ts` (already in Pool 1). **None are widening fixes.**
- `PlanetaryPosition` (5): 10 distinct declarations exist; 5 sites hit at least 3 of them. `src/lib/economy/priceIndex.ts:255` is a writer site (fix by conditional spread).
- `AstrologicalState` (3): 2 declarations plus a context alias. Identify which declaration is imported per site.
- `TarotCard` (3): 3 separate fields (`element`, `planetaryInfluences`, `suit`) across writer sites.
- `RestaurantItem` (3): Input to `AddToDiaryModal`; verify if modal only reads before widening.
- `PlanetaryPositionData` (3) & `AlchemicalPlanetPosition` (3): Pure calculation input shapes; plausibly widenable after checking consumers.

#### 3. Third-Party Types & Auth Sites: 7 diagnostics
- **`next-auth` `GetTokenParams` (3 diagnostics)**:
  - Verify that the installed `next-auth` version safely falls back to `process.env.NEXTAUTH_SECRET` when `secret` is omitted.
- **`viem` `Chain` (4 diagnostics)**:
  - In account and shop pages; cannot be widened without a cast. **Do not count toward burndown pool.**

#### 4. Deferred Decisions & Known Complexities: 11 diagnostics
Do not attempt without explicit architectural care:
1. **`src/lib/menu-planner/schemas.ts` (7 diagnostics)**:
   - Zod schemas for planner meals and recipes.
   - **CRITICAL ZOD FINDING**: In Zod, `.exactOptional()` rejects explicit `{ key: undefined }` during `.parse()`. The risk is `.parse()` or `.safeParse()` on **in-memory objects** constructed with explicit `undefined` properties. Audit what every `.parse`/`.safeParse` call receives before touching schema definitions.
2. **`src/utils/recipe/batchEnrichment.ts:373, 382` (2 diagnostics)**:
   - Zod optional output (`?: T | undefined`) flows into `Partial<Recipe>`. Note that `:470` is an easy conditional spread fix.
3. **`src/utils/menuPlanner/recommendationBridge.ts:376` (1 diagnostic)**:
   - Existing invalid cast where alignment boost is bypassed.
4. **`src/components/menu-planner/RecipeSelector.tsx:353` (1 diagnostic)**:
   - Queue-merge decision on recipe selection state (explicit `undefined` in merge patch clears fields). Note that `:301` is an easy spread fix.

#### 5. Components & API Routes: ~117 diagnostics (Required for $\le 230$ / $\le 220$)
- **API Routes (58 diagnostics)**:
  - `check:route-validation` covers 0 unvalidated body-reading routes out of 123; `check:read-json` must stay at 0.
  - In Zod 4, a key typed `z.unknown()` is **required**. Pay special attention to route request validation.
  - About 8 of the 58 appear Zod-inferred. Run each changed route's test suite immediately after editing.
  - High-risk route: `src/app/api/agent-forge/ignite/route.ts`.
- **Components (59 diagnostics)**:
  - Form inputs, tabs, and modals where optional handlers or props receive `undefined`. Widen prop interfaces only if purely read; otherwise conditionally spread at callers.

---

## 3. Workflow & Cluster Execution Protocol

### Step 1: Establish Evidence Directory & Baseline Snapshot
```bash
# Create evidence directory and persist path
EVIDENCE_DIR=$(mktemp -d /tmp/phase32_session.XXXXXX)
echo "$EVIDENCE_DIR" | tee /tmp/current_phase32_evidence_dir.txt

# Capture accurate before.json snapshot with full diagnostics
NODE_OPTIONS=--max-old-space-size=8192 bun -e 'import {writeFileSync} from "node:fs"; import {runStrictIndexCheck} from "./scripts/lib/strictIndex"; const s = runStrictIndexCheck(process.cwd()); writeFileSync(process.argv[1], JSON.stringify(s)); console.log("Baseline captured:", s.total, "errors across", s.files.length, "files");' "$EVIDENCE_DIR/before.json"
```

### Step 2: Per-Cluster Execution
For each cluster:
1. Check current branch: `git branch --show-current` (ensure no accidental branch switch).
2. Edit files according to absent/undefined/null decision rules.
3. Test single file: `bun scripts/checkStrictIndex.ts --file <path>`.
4. If a shared type was widened, verify JS emit parity via `ts.transpileModule` and run a full check (`bun scripts/checkStrictIndex.ts`).
5. Run targeted Jest tests: `bun run test --runTestsByPath <path>`.
6. Run cluster verification gates:
   ```bash
   bun run typecheck
   bun run lint:changed
   bun run lint:debt
   bun -e 'import {scanAssertionSites} from "./scripts/lib/lintDebt"; const c = scanAssertionSites().nonNullAssertions; console.log("Non-null assertions:", c); if (c > 605) process.exit(1);'
   ```
7. Stage any newly created test files: `git add -N <path>`.
8. Compare progress against `before.json` by normalized count and save cluster patch:
   ```bash
   git diff HEAD > "$EVIDENCE_DIR/clusterX.patch"
   ```

---

## 4. Final Verification & Ratchet Protocol

When target ($\le 230$ required, $\le 220$ stretch) is reached:

```bash
# 1. Ratchet strict-index baseline
bun run strict-index:ratchet

# 2. Ratchet lint debt ONLY if debt decreased
# bun run lint:debt:ratchet

# 3. Verify non-null assertion ceiling
bun -e 'import {scanAssertionSites} from "./scripts/lib/lintDebt"; const c = scanAssertionSites().nonNullAssertions; console.log("Non-null assertions:", c); if (c > 605) { console.error("Ceiling exceeded!"); process.exit(1); }'

# 4. Full canonical verification (runs verify:static, full Jest suite, Next.js build)
bun run verify:full

# 5. Inspect git state
git status --short --branch
git diff HEAD --stat
git diff HEAD --check
```

---

## 5. Standing Follow-up Design Gate: Domain Feature Wiring

Do not broadly wire `lunarPhaseUtils.ts`, `chakraSymbols.ts`, `defaults.ts`, or `typeDefaults.ts` into production during this debt-burndown phase.

Known prerequisites:
- `applyVelocityBoost` is currently a no-op placeholder.
- Lunar aspect logic documents comparisons against incompatible aspect concepts and therefore falls through to defaults.
- `calculatePhaseVelocity` reads `velocityBoost` from the wrong object level.
- Illumination-curve and void-of-course implementations are not present in `lunarPhaseUtils.ts`.
- Chakra intelligence outputs use `Math.random()` extensively and are not deterministic enough for SSR, hydration, reproducible recommendations, or stable tests.
- "Alchemy Atlas" does not identify a concrete route or component.
- Centralizing defaults can change fallback behavior and therefore needs a consumer-by-consumer audit.

Before implementation, write a separate vertical-slice specification with concrete route, validated runtime schema, deterministic formulas, SSR compatibility, and unit/acceptance tests.

---

## 6. Definition of Done & Reporting Constraints

- **Zero regression**: 0 base typecheck errors, 0 new lint debt (ceiling 1,473), non-null assertions $\le 605$, allowlist remains `[]`.
- **Target met**: Strict-index errors $\le 230$ (required) or $\le 220$ (stretch).
- **All tests green**: Full Jest test suite passes under `bun run test --passWithNoTests`.
- **Production build passes**: `bun run build` exits 0 with all route sizes within budget.
- **Reporting requirements**:
  - State starting count (295) and final count.
  - List all clusters and specific files modified.
  - Document all deliberate behavior changes (including dropped empty strings, altered default parameters, or omitted keys).
  - Document all deferred diagnostics and rationales.
- **Git safety**: Do NOT commit or push to remote without explicit user authorization.
