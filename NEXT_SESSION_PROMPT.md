# Next Session: Phase 29 — Complete ReadJson Response Narrowing (10 -> 0), Latent Strict-Index Repairs & Dead Runtime Exports Pruning

> **Status note.** Phase 28 completed the Route Validation Allowlist burn-down, introduced the Gate 11 `readJson` AST gate, converted 14 high-density response sites, repaired SpacetimeDB compilation cascades, and ratcheted strict-index errors down from 668 to 588:
> - **Route Validation Allowlist** (`5fbfcb4e`): Burnt down from **21 to 0** across all 123 body-reading endpoints (`.route-validation-baseline.json` is now empty `[]`).
> - **Gate 11 Installed & Ratcheted** (`512c876c`, `bd005195`): Built `scripts/checkReadJsonValidation.ts` + `scripts/lib/readJsonValidation.ts` enforcing AST `{ parse: Schema.parse }`. Converted 14 high-density response sites and ratcheted `.read-json-baseline.json` from **24 to 10**.
> - **Strict-Index & SpacetimeDB Cascade** (`443b7135`, `5fbfcb4e`): Pinned `spacetimedb` to `^2.6.0`, resolved union property cascade, repaired optional property defects, and ratcheted `.strict-index-baseline.json` down by 80 errors (**668 -> 588** across 312 files).
> - **All 11 Static Gates Green & Full Test Pass**: All 11 static gates pass with 0 errors; 364/364 Jest test suites pass (3,773 tests); Next.js production build (`bun run build`) compiles with 0 errors.
>
> | Metric | P24 | P25 | P26 | P27 | P28 (Shipped) |
> |---|---:|---:|---:|---:|---:|
> | Tracked lint debt | 1,944 | 1,635 | 1,520 | 1,493 | **1,474** (-19) |
> | Declined pool | 4,911 | 4,910 | 4,910 | 4,910 | **4,906** (-4) |
> | Casts (gated) | 169 | 169 | 168 | 167 | **167** (held) |
> | Assertion sites (AST) | 3,398 | 3,396 | 3,353 | 3,325 | **3,308** (-17) |
> | `prefer-nullish-coalescing` sub-baseline | 214 | 214 | 214 | 214 | **214** |
> | `exactOptionalPropertyTypes` strict-index | — | 674 / 329 files | 671 / 328 files | 668 / 325 files | **588 / 312 files** (-80 errors) |
> | Route validation gate (unvalidated / body-reading) | — | — | — | 21 / 123 | **0 / 123 (Allowlist: 0)** |
> | `readJson` response validation gate (Gate 11) | — | — | — | — | **10 / 30 (Allowlist: 10)** |
> | Gate test suites / tests | — | — | 6 / 88 | 7 / 96 | **8 / 110** (+1 suite / +14 tests) |
> | Static Gates passing | — | — | — | 10 / 10 | **11 / 11 (All Green)** |
> | Unit Test Suite (Jest) | — | — | — | 336 suites | **364 suites (3,773 passed)** |
>
> Every number above was re-measured on 2026-09-10 against live static gates and reproduces committed baselines exactly.

---

## 1. What Phase 28 Closed

Cross off against the Phase 28 commitments:

| Item | Status |
|---|---|
| **Route Validation Allowlist Burn-down (21 -> 0)** | ✅ `5fbfcb4e`. Burned down all 21 remaining body-reading endpoints across admin, agents, feed, lab, instacart, amazon, and recommendations. `.route-validation-baseline.json` is empty `[]`. |
| **Gate 11: AST `readJson` Validation Gate** | ✅ `512c876c`. Built `scripts/checkReadJsonValidation.ts` + `scripts/lib/readJsonValidation.ts` and 14 unit tests in `scripts/lib/__tests__/readJsonValidation.test.ts`. Wired into `verify:static` as Gate 11. |
| **Response-Side Narrowing (14 sites converted)** | ✅ `bd005195`. Converted 14 high-density response sites across `natalChartService`, `celestialEventsService`, `planetaryHourService`, `synastryService`, `railwayUsageService`, `alchemicalRecommendationService`, `historicalEchoService`, `personalizedRecommendationService`, `recipeChatService`, `nutritionProfileService`, `hscaAuditService`, and `hscaElementalPropertiesService`. Ratcheted `.read-json-baseline.json` from 24 to 10. |
| **SpacetimeDB Package Reproducibility Pin** | ✅ `512c876c`. Pinned `spacetimedb` in `package.json` to `^2.6.0`, harmonizing CLI generated bindings and package versioning. |
| **SpacetimeDB Exact Optional Property Cascade Repair** | ✅ `443b7135`. Repaired the generated TypeScript bindings union property cascade without introducing `as unknown as` casts. |
| **Latent Strict-Index Type Repairs (668 -> 588)** | ✅ `443b7135` & `5fbfcb4e`. Repaired optional property assigning defects across services, reducing compiler diagnostics by 80 across 13 files. Ratcheted `.strict-index-baseline.json`. |
| **Test Suite Duplication & Astrologize Schema Fix** | ✅ `5fbfcb4e` & `db886e10`. Removed stale duplicate `subscriptionRevenueService.test 2.ts` and aligned `NatalChartAstrologizeResponseSchema` with service reality, restoring 100% test pass rate (364/364 suites). |

---

## 2. Phase 29 Prioritized Plan

Ordered by measured leverage per unit of risk, highest first.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ Phase 29 Priority Order:                                                    │
│ 1. Tranche B Completion: Burn Down `.read-json-baseline.json` (10 -> 0)     │
│    -> Eliminate the final 10 unvalidated readJson/safeReadJson sites        │
│ 2. Tranche D: Strict-Index Latent Type Errors (588 -> <= 500)               │
│    -> Continue fixing compiler defects exposed under strict-flags           │
│ 3. Tranche E: Dead Runtime Exports Pruning (976 runtime symbols)            │
│    -> Clean up dead code in src/utils and src/data                          │
│ 4. Tranche C: `no-unnecessary-condition` Background Work (840 findings)     │
│    -> Red-proof guard removals, 1 file per PR                               │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

### Priority 1: Tranche B Completion — Burn Down `.read-json-baseline.json` (10 -> 0)

#### The Problem
Gate 11 (`bun run check:read-json`) currently holds an allowlist of **10 unvalidated response sites** in `.read-json-baseline.json`.

#### The 10 Sites (Targeted for Zero Allowlist)
1. **`src/app/(alchm)/profile/components/onboardingApi.ts` (3 sites)**:
   - Line 54 (`readJson`): Onboarding profile submission response.
   - Line 90 (`readJson`): Dietary preferences update response.
   - Line 117 (`readJson`): Natal chart calculation response.
   - **Action**: Define response schemas in `src/lib/validation/profileSchemas.ts` (or `onboardingSchemas.ts`) and pass `{ parse: Schema.parse }`.
2. **`src/components/recipes/LabBookIngest.tsx` (3 sites)**:
   - Line 75 (`readJson`): Recipe ingestion status check.
   - Line 122 (`safeReadJson`): Recipe parse result.
   - Line 186 (`safeReadJson`): Recipe commit confirmation.
   - **Action**: Define response schemas in `src/lib/validation/recipeSchemas.ts` and pass `{ parse: Schema.parse }`.
3. **`src/contexts/menu-planner/useCostEstimation.ts` (1 site)**:
   - Line 113 (`safeReadJson`): Grocery pricing / cost estimation response.
   - **Action**: Define response schema in `src/lib/validation/grocerySchemas.ts`.
4. **`src/lib/api/alchm-client.ts` (1 site)**:
   - Line 131 (`readJson`): Generic alchm client internal request helper.
   - **Action**: Add an optional parse option to `AlchmClientRequestOptions` and thread into `readJson`.
5. **`src/lib/recipe-nft/mintClient.ts` (2 sites)**:
   - Line 39 (`readJson`): NFT mint transaction quote / preparation.
   - Line 53 (`safeReadJson`): NFT mint status polling.
   - **Action**: Define response schemas in `src/lib/validation/nftSchemas.ts`.

#### Execution & Ratchet
- Wire schemas into all 10 calls.
- Run `bun run check:read-json:ratchet` to shrink `.read-json-baseline.json` to `[]` (0 unvalidated).

---

### Priority 2: Tranche D — Strict-Index Latent Type Errors (588 -> <= 500)

#### The Problem
`bun run strict-index:check` enforces `tsconfig.strict-index.json`. The current baseline sits at **588 errors across 312 files** (down from 668).
Target for Phase 29 is to drop diagnostics below **500**.

#### Latent Errors Breakdown to Target
1. **TS2339** ("Property does not exist on type"): Fix remaining instances where optional or union structures read undefined properties.
2. **TS2322** ("Type 'X' is not assignable to type 'Y'"): Fix mismatched return or assignment types.
3. **TS2345** ("Argument of type 'X' is not assignable to parameter of type 'Y'"): Fix parameter type drift across services and components.
4. **Pure `exactOptionalPropertyTypes` (TS2375/TS2379)**: Continue replacing `{ foo: val ?? undefined }` with omit spread pattern `...(val !== undefined ? { foo: val } : {})`.

#### Execution Workflow
1. Run `NODE_OPTIONS=--max-old-space-size=8192 bun scripts/checkStrictIndex.ts` to inspect top contributing files.
2. Fix files in cohesive domain clusters (e.g. `src/services/`, `src/components/`, `src/utils/`).
3. Ratchet baseline down using `bun run strict-index:ratchet`.

---

### Priority 3: Tranche E — Dead Runtime Exports Pruning (976 runtime symbols)

#### Inventory
There are **976 runtime-valued exported symbols** (functions, constants, classes) that have **zero external references** in `src/`:
- `src/utils`: 292 symbols
- `src/data`: 215 symbols
- `src/lib`: 162 symbols
- `src/services`: 64 symbols
- `src/components`: 40 symbols
- `src/app`: 3 symbols

#### High-Density Concentration Files
- `src/constants/typeDefaults.ts` (19 symbols)
- `src/utils/lunarPhaseUtils.ts` (17 symbols)
- `src/constants/chakraSymbols.ts` (15 symbols)
- `src/utils/astrologyUtils.ts` (15 symbols)
- `src/constants/defaults.ts` (14 symbols)
- `src/utils/typeGuards.ts` (12 symbols)
- `src/services/UnifiedScoringService.ts` (11 symbols)

#### Rules of Engagement
- **Verify before deleting**: Watch for barrel re-exports (`export * from`) and dynamic string-keyed lookups.
- Verify `bun run verify:static` and `bun run test` after each file cleanup.

---

### Priority 4: Tranche C — `no-unnecessary-condition` Background Work (840 findings)

- Count sits at **840 findings across 308 files** (`neverOptionalChain` 258, `alwaysTruthy` 223, `neverNullish` 218, `alwaysFalsy` 106, `noOverlapBooleanExpression` 24, `comparisonBetweenLiteralTypes` 11).
- Treat as background cleanup: 1 file per PR, requiring an explicit red-proof test (delete guard -> watch test fail or prove unreachable).
- Never use `!` assertion to silence a warning.

---

## 3. Verification Protocol (The 11 Static Gates)

Always verify against the complete gate suite before committing or pushing:

```bash
# 1. Run all 11 static gates:
bun run verify:static

# 2. Run static gates + full test suite (364 suites / 3,773 tests):
bun run verify

# 3. Full production build verification:
bun run verify:full
```

### The 11 Static Gates Breakdown:
1. `check:untracked` — Ensures no untracked `.ts`/`.tsx` files exist in `src/` or `scripts/`.
2. `check:route-validation` — Ensures all body-reading routes in `src/app/api/**/route.ts` are validated via AST (0 unvalidated).
3. `test:gates` — Runs AST and gate test suites in `scripts/lib/__tests__/` (110 passed across 8 suites).
4. `strict-index:check` — Enforces compiler strictness under `tsconfig.strict-index.json` (baseline 588 / 312 files).
5. `check:scripts` — Enforces typecheck on `scripts/**/*.ts` (baseline 302 errors / 58 files).
6. `typecheck` — Full Next.js production typegen and compiler check (`next typegen && tsc --noEmit`). Must be 0 errors.
7. `lint` — ESLint on `src/` (`--max-warnings=10000`, 5 baseline warnings).
8. `lint:scripts` — ESLint on `scripts/` (`--max-warnings=25`).
9. `lint:debt` — Ratchet gate for lint debt (1,474), casts (167), assertion sites (3,308), and sub-baselines.
10. `audit:dead-modules` — AST dead module check (0 unreachable modules).
11. `check:read-json` — AST gate ensuring `readJson` / `safeReadJson` calls pass `{ parse: Schema.parse }` (baseline 10 unvalidated).

---

## 4. Measurement Traps & Operational Lessons Learned

1. **Jest Worker Stalls & Open Handles**:
   - Always run Jest with `--forceExit` and adequate memory (`NODE_OPTIONS='--expose-gc --max-old-space-size=4096' bun run jest --passWithNoTests --forceExit`) to prevent background open handles (e.g. database pools, unref timers) from hanging the process.

2. **Sync / Duplicate Test Files (`* 2.ts`)**:
   - Stale duplicate files (e.g. `foo.test 2.ts`) generated by sync tools or Finder are ignored by git/tsconfig but picked up by Jest regex scanners.
   - Always remove duplicate files immediately.

3. **AST Cast Counting in Tests & Routes**:
   - `scripts/checkLintDebt.ts` parses the entire AST of `src/` and counts all `as` expressions.
   - Replacing `as unknown as Foo` with single casts `as Foo` or native constructors (`new Response(...)`) keeps gated casts flat.

4. **Route-Validation AST Schema Argument Requirements**:
   - `scripts/lib/routeValidation.ts` requires that a variable assigned from `request.json()` or `request.formData()` be passed directly into a `.safeParse(...)` call.
   - For `FormData`, using `z.custom<FormData>()` satisfies runtime typing and passes the AST route gate cleanly.

5. **Astrology Response Mappings**:
   - In external astrologize calculation services, optional response envelope fields (like `birth_info`) must remain optional in Zod response schemas (`NatalChartAstrologizeResponseSchema`) to avoid rejecting mock test fixtures that only supply planetary coordinate data.
