# Phase 32: Exact-Optional TypeScript Burndown (295 → ≤220)

## 0. Session Handover & Repository Boundary

This handoff assumes Phase 31 has merged into `master`.

Start Phase 32 from a clean checkout of the updated `master`:

```bash
git fetch origin
git checkout master
git pull --ff-only origin master
git checkout -b feat/phase-32-exact-optional-burndown
git status --short --branch
git rev-parse HEAD
git diff HEAD --stat
```

The active strictness tier is **`exactOptionalPropertyTypes`** (`tsconfig.strict-index.json`). `noUncheckedIndexedAccess` is already enabled in the base configuration. Keep the existing `strict-index:*` script names and both configurations unchanged.

### Baseline measurements entering Phase 32

| Metric | Measured Baseline |
| :--- | :---: |
| Strict-index diagnostics | **295 across 222 files** |
| Strict-index allowlist | `[]` (0 entries) |
| Tracked lint debt | 1,473 (ceiling 1,473) |
| Non-null assertion sites (`!`) | 605 (ceiling 605) |
| Gated casts | 167 total / 135 production |
| AST assertion sites | 3,293 total / 2,670 production |
| `readJson` unvalidated calls | 0 across 30 response calls |
| Script typecheck errors | 302 across 58 files |
| Base `typecheck` | 0 errors |

Treat live compiler output from `bun scripts/checkStrictIndex.ts` as authoritative. Never hand-edit a baseline file.

---

## 1. Phase 31 Key Lessons & Operating Rules

### Core Lessons Learned in Phase 31
1. **Widen ONLY pure-reader types, never persisted entities**:
   - Pure-reader types passed into presentational components or pure transform inputs (e.g. `AvatarPerson`, `ChatBubbleProps`, `BirthSectInput`) can be widened (`| undefined`) safely with zero runtime impact.
   - Persisted entities (e.g. `SavedRestaurant`, `UserProfile`, database rows) or objects written to storage/DB must **not** be widened; address them at the writer call sites via conditional spreads.
2. **Prove type-only edits with emit parity**:
   - For every widened type, prove zero runtime change by comparing emitted JS (`ts.transpileModule(code, { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 } })`) before and after. Emitted JS must be 100% byte-identical.
3. **Compare snapshots by count with repository path stripped**:
   - Diff snapshots on normalized `(file, code, normalizedMessage)` tuples with the workspace root stripped to avoid absolute-path mismatch or duplicate message masking.
4. **Tooling efficiency**:
   - Use `bun scripts/checkStrictIndex.ts --file <path>` for fast, targeted sub-second iteration during editing.
   - Run the full `bun scripts/checkStrictIndex.ts` only to close and verify each cluster checkpoint.
5. **Condition semantics: `!== undefined` vs truthiness**:
   - Never use truthiness checks (`if (val)`) on numbers or strings where `0` or `""` are valid semantic values (e.g. `servings`, `fdcId`, `rating`, `hourNumber`, `prepTime`, `cookTime`, `yield`). Use `!== undefined` explicitly.
   - For optional object fields or nullable strings where `null` must be preserved (e.g. `natalChart: Partial<NatalChart> | null`), guard with `!== undefined` so `null` is retained.

### Standing Rules from Phase 30 (Mandatory)

#### Absent vs Undefined vs Null Decision Table

| Scenario | Semantic Decision |
| :--- | :--- |
| Property should be absent when no value exists | Use a conditional object spread `...(val !== undefined ? { val } : {})` and omit the key |
| Property is always present but may contain `undefined` | Use `T \| undefined` only when callers and runtime data require that contract |
| Database/API represents missing data as `null` | Preserve `null` explicitly; do not collapse `null` into `undefined` or omit it |

Do not mechanically add `| undefined` to shared interfaces. That weakens `exactOptionalPropertyTypes` and can hide rather than repair the contract mismatch.

#### Non-negotiable repair rules
- **Zero new lint debt**: `bun run lint:debt` must not increase (1,473 ceiling).
- **Non-null assertion ceiling**: Non-null assertions (`!`) must not exceed 605.
- **Strict-index allowlist**: Must remain strictly empty (`[]`).
- **Forbidden constructs**: Never use `as any`, chained `as unknown as`, non-null assertions `!`, `@ts-ignore`, `@ts-expect-error`, or lint-disable comments to bypass diagnostics.
- **Preserve domain calculations**: Do not delete, gut, or replace rich domain calculations to make types pass. **FIX > REMOVE.**
- **Inspect callers**: Always check all call sites and consumers before changing a shared type.
- **Test coverage**: Add or update targeted tests when repairs touch serialization, omission, null handling, fallback behavior, or public function contracts.
- **Test environment safety**: Always ensure database-connected services (e.g., `userDatabaseService`, `TokenEconomyService`, `authEventsService`) do not connect to live databases in tests (`delete process.env.DATABASE_URL;`).

---

## 2. Phase 32 Target & Measured Candidate Pools

### Target Objective
Reduce strict-index diagnostics from **295 to ≤220** (net reduction of $\ge 75$ diagnostics), or **≤230** if avoiding deep API route validation refactoring.

### Pool Size & Headroom Requirement
To achieve a net reduction of 75 diagnostics with standard 20% pool headroom, Phase 32 requires a candidate pool of at least **~94 vetted diagnostics**.

### Measured Distribution of Remaining 295 Diagnostics

```
Remaining Diagnostics: 295 across 222 files

By Directory:
  - src/components/   : 59 diagnostics
  - src/app/api/      : 58 diagnostics (API routes)
  - src/utils/        : 46 diagnostics
  - src/lib/          : 36 diagnostics
  - src/app/(alchm)/  : 33 diagnostics (pages)
  - src/services/     : 24 diagnostics
  - src/calculations/ : 16 diagnostics
  - other/types/data  : 23 diagnostics
```

### Categorized Candidate Pools

#### 1. Vetted from Phase 31 (Not Yet Started): 32 diagnostics
- **Group C Utilities Backlog** (21 diagnostics):
  - `src/utils/errorHandling.ts`: remaining diagnostic sites.
  - `src/utils/astrology/transitValidation.ts` & `src/utils/astrology/aspectCalculations.ts`.
  - `src/utils/recipeSearchEngine.ts` & `src/utils/pantryManager.ts` remaining sites.
  - `src/utils/menuPlanner/recommendationBridge.ts:607`.
- **Menu Planner Reserve** (10 diagnostics):
  - Option objects and transform bridges in `src/utils/menuPlanner/`.

#### 2. Shared Types Candidate for Pure Reader Widening: ~26 diagnostics
Shared domain types where values are purely consumed/read (verify with `ts.transpileModule`):
- `CookingMethodData`
- `PlanetaryPosition` / `PlanetaryPositionData`
- `AstrologicalState` / `AlchemicalPlanetPosition`
- `RestaurantItem`
- `TarotCard`

#### 3. Third-Party Types (CANNOT be Widened - Fix at Writer Sites): 7 diagnostics
- `viem` `Chain` objects
- `next-auth` `GetTokenParams`
- Must be fixed using conditional spreads or proper optional parameter objects.

#### 4. Deferred Decisions & Known Complexities: 11 diagnostics
Do not attempt without explicit architectural care:
1. **`src/lib/menu-planner/schemas.ts` (7 diagnostics)**:
   - Zod schemas for planner meals and recipes.
   - **CRITICAL ZOD FINDING**: In Zod, `.exactOptional()` rejects explicit `{ key: undefined }` during `.parse()`. Modifying schema definitions to resolve compiler diagnostics can break runtime JSON parsing if payloads contain `{ key: undefined }`. Verify with test cases before touching.
2. **`scripts/batchEnrichment.ts:373, 382` (2 diagnostics)**:
   - Shared Zod schema issue identical to `schemas.ts`.
3. **`src/utils/menuPlanner/recommendationBridge.ts:376` (1 diagnostic)**:
   - Existing invalid cast where alignment boost is bypassed.
4. **`src/components/recipe/RecipeSelector.tsx:353` (1 diagnostic)**:
   - Queue-merge decision on recipe selection state.

#### 5. Components & API Routes: ~117 diagnostics
Because the easy utility + shared-type pools provide ~58 candidates, Phase 32 must venture into `src/components/` (59 diags) or `src/app/api/` (58 diags) to reach the $\le 220$ goal:
- **Components**: Modals, form inputs, and drawer components where optional callbacks (`onClose?: () => void`) or styles receive `undefined`. Widen component prop interfaces where purely read, or conditionally spread props.
- **API Routes**: Next.js route handlers returning JSON responses or reading request bodies. Use conditional spreads when constructing response payloads.

---

## 3. Workflow & Cluster Execution Protocol

1. **Establish Evidence Directory**:
   ```bash
   mkdir -p /tmp/phase32_session.XXXXXX
   ```
2. **Cluster Grouping**:
   - Cluster A: Shared pure-reader type widening (verified via `ts.transpileModule`).
   - Cluster B: Component prop interfaces & object-literal writer repairs.
   - Cluster C: Utility and service layer contracts.
3. **Per-Cluster Iteration**:
   - Check targeted file: `bun scripts/checkStrictIndex.ts --file <path>`
   - Run targeted tests: `bun test <matching-test-suite>`
   - Check lint changed: `bun run lint:changed`
4. **Cluster Checkpoint**:
   - Save patch: `git diff HEAD > /tmp/phase32_session.XXXXXX/clusterX.patch`
   - Capture diagnostic snapshot: `bun scripts/checkStrictIndex.ts`

---

## 4. Final Verification & Ratchet Protocol

When target ($\le 220$ or $\le 230$) is reached:

```bash
# 1. Ratchet strict-index baseline
bun run strict-index:ratchet

# 2. Ratchet lint debt ONLY if debt decreased
# bun run lint:debt:ratchet

# 3. Full canonical verification (includes static gates, Jest suite, and Next.js build)
bun run verify:full

# 4. Git status inspection
git status --short --branch
git diff --stat
git diff --check
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
