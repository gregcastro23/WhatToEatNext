# Next Session: Phase 28 — Response-Side Narrowing (Tranche B), Latent Strict-Index Repairs (Tranche D) & Route Ratchet

> **Status note.** Phase 27 completed the route inbound boundary campaign and installed the AST Route-Validation ratchet gate:
> - **Tranche A PR 1** (`3aa41293`): 5/5 economy boundaries validated (`purchase`, `transmute`, `practice`, `shop/purchase`, `sync-event`).
> - **Tranche A PR 2** (`701dc5ec`): Inbound body validation across 19 money and identity routes with 18 unit test suites.
> - **Tranche A PR 3**: Full completion of remaining money boundaries (`admin/users/[userId]/grant`, `admin/restaurants/settlement`), dedicated `quests/claim` unit test suite, new AST route validation gate (`scripts/checkRouteValidation.ts` + `.route-validation-baseline.json` allowlist of 21), `checkLintDebt.ts` progress/heartbeat/timeout overhaul, and dead `Parsed*` type pruning from `apiSchemas.ts`.
>
> | Metric | P23 | P24 | P25 | P26 | P27 (Shipped) |
> |---|---:|---:|---:|---:|---:|
> | Tracked lint debt | 2,630 | 1,944 | 1,635 | 1,520 | **1,493** |
> | Declined pool | 6,236 | 4,911 | 4,910 | 4,910 | **4,910** |
> | Casts (gated) | 252 | 169 | 169 | 168 | **167** |
> | Assertion sites (AST) | 4,357 | 3,398 | 3,396 | 3,353 | **3,325** |
> | `prefer-nullish-coalescing` sub-baseline | 294 | 214 | 214 | 214 | **214** |
> | `exactOptionalPropertyTypes` strict-index | — | — | 674 / 329 files | 671 / 328 files | **668 / 325 files** |
> | Route validation gate (unvalidated / body-reading) | — | — | — | — | **21 / 123** (102 validated) |
> | Gate test suites / tests | — | — | — | 6 / 88 | **7 / 96** |
>
> Every number above was re-measured on 2026-09-09 against live static gates and reproduces committed baselines exactly.

---

## 1. What Phase 27 Closed

Cross off against the Phase 27 commitments:

| item | status |
|---|---|
| **Untracked Source Gate (§0 purge)** | ✅ `7fccdf73`. 29 phantom files purged from disk. `scripts/checkUntrackedSourceFiles.ts` wired as Gate 1 in `verify:static`. Red-proved (exit 1 / exit 0) for `src/` and `scripts/`. |
| **Tranche A: Economy Boundaries (5/5)** | ✅ `b26e35d9` & `3aa41293`. All 5 economy routes (`purchase`, `transmute`, `practice`, `shop/purchase`, `sync-event`) validated against `@/lib/validation/apiSchemas`. |
| **Tranche A: Money & Identity Routes (19/19)** | ✅ `701dc5ec`. 19 endpoints across `account`, `user`, `admin`, `quests`, `sessions`, `waitlist`, and `adept-table` wired with Zod schemas and backed by unit tests. |
| **Tranche A: Remaining Money Boundaries (2/2)** | ✅ shipped in PR 3. `admin/users/[userId]/grant` and `admin/restaurants/settlement` converted from untyped bodies to `safeParse` with dedicated unit test suites. |
| **AST Route-Validation Gate & Ratchet** | ✅ shipped in PR 3. Built `scripts/checkRouteValidation.ts` + `scripts/lib/routeValidation.ts` using TypeScript AST. Seeded `.route-validation-baseline.json` at 21 unvalidated routes across 123 body-reading endpoints. Wired into `verify:static` as Gate 2; 8 unit tests in `scripts/lib/__tests__/routeValidation.test.ts`. |
| **Dedicated Test Isolation for `quests/claim`** | ✅ shipped in PR 3. Extracted `quests/claim` tests into `src/app/api/quests/claim/__tests__/route.test.ts` (5 tests) and scoped `quests/__tests__/route.test.ts` cleanly to `POST /api/quests` (4 tests). |
| **`checkLintDebt.ts` Progress & Timeout Overhaul** | ✅ shipped in PR 3. Added step phase logging (`[1/4]` through `[4/4]`), a 15s heartbeat interval, and an unref'd 5-minute wall-clock timeout safety to avoid silent hung processes. |
| **Pruned Dead `Parsed*` Type Aliases** | ✅ shipped in PR 3. Pruned 19 unused `export type Parsed*` aliases from `src/lib/validation/apiSchemas.ts`. |
| **Refuted `ElementalProperties` Declaration Myth** | ✅ measured & closed in Phase 27. Proven that stripping index signatures adds 57 typecheck errors and +60 lint warnings. Renamed the genuine collision in `elementalMappings.ts` to `ElementalQualityMap` (`f66aacf6`). |

---

## 2. Phase 28 Prioritized Plan

Ordered by measured leverage per unit of risk, highest first.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ Phase 28 Priority Order:                                                    │
│ 1. Tranche B: Inbound Response Narrowing (`readJson<T>`)                    │
│    -> Eliminate the largest unverified assertion surface (236 raw sites)    │
│ 2. Tranche D: Strict-Index Latent Type Errors (144 sites)                   │
│    -> Fix the 144 non-flag compiler bugs wearing the strict-flags label     │
│ 3. Tranche A Extension: Route Validation Burn-down (21 remaining)           │
│    -> Burn down .route-validation-baseline.json from 21 toward 0            │
│ 4. Tranche E: Dead Runtime Exports Pruning (976 runtime symbols)            │
│    -> Clean up dead code in src/utils and src/data                          │
│ 5. Tranche C: `no-unnecessary-condition` Background Work (840 findings)     │
│    -> Red-proof guard removals, 1 file per PR                               │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

### Priority 1: Tranche B — Inbound Response Narrowing (`readJson<T>`)

#### The Problem
Now that inbound request bodies on money/identity routes are fully validated, **the response side is the dominant source of unchecked type assertions**:
- **236** raw `.json()) as T` calls across the repository (43 in `src/app/api/**`).
- **69** `JSON.parse(...) as T` calls.
- **25** calls to `readJson<T>` / `safeReadJson<T>`, of which ~20 pass **no parse function**, falling back to unsafe `return body as T`.

#### The Architecture
`src/lib/api/json.ts:38` already supports honest schema narrowing:
```typescript
export async function readJson<T>(
  response: Response,
  options?: {
    parse?: (data: unknown) => T;
    context?: string;
  }
): Promise<T>
```
When `parse` is provided, `readJson` validates the incoming JSON payload at runtime before returning. When omitted, it asserts `body as T`.

#### Phase 28 Targets

1. **`src/services/AlchemicalApiClient.ts` (8 calls — highest concentration)**:
   - Communicates with the external Planetary Agents Python service (`NEXT_PUBLIC_BACKEND_URL` / `API_BASE_URL`).
   - All 8 calls currently invoke `readJson<T>(res)` without a `parse` option:
     - `generateRecipe` -> `CosmicRecipe`
     - `chatWithAgent` -> `AgentChatResponse`
     - `getAgentProfile` -> `AgentProfile`
     - `getNatalChart` -> `NatalChart`
     - `getSynastry` -> `SynastryReport`
     - `getTransits` -> `TransitData`
     - `calculateDignities` -> `DignityMap`
     - `orchestrateRitual` -> `RitualResult`
   - **Action**: Create Zod response schemas in `src/lib/validation/planetaryAgentSchemas.ts`, pass `{ parse: schema.parse }` to each call, and add unit tests validating error handling on malformed backend responses.

2. **`src/services/astrologizeApi.ts` (3 calls)**:
   - Calls external Swiss Ephemeris / astrological calculation endpoints.
   - 3 calls to `readJson<T>` with unchecked casts.
   - **Action**: Define response schemas in `src/lib/validation/astrologySchemas.ts` and wire into `readJson`.

3. **Follow-up service conversions**:
   - `src/services/natalChartService.ts`
   - `src/services/railwayUsageService.ts`
   - `src/services/restaurantDiscoveryService.ts`
   - `src/services/githubTriageService.ts`
   - `src/services/mcpNetworkService.ts`

4. **AST Ratchet Gate: `scripts/checkReadJsonValidation.ts`**:
   - Build an AST gate patterned after `checkRouteValidation.ts`:
     - Scan `src/**/*.ts` for `readJson(` and `safeReadJson(` AST CallExpressions.
     - Verify the second argument object contains a `parse:` property assignment.
     - Seed a baseline allowlist `.read-json-baseline.json` and enforce shrink-only ratchet behavior via `--ratchet`.
     - Wire into `verify:static` as Gate 11.

---

### Priority 2: Tranche D — Strict-Index Latent Type Errors (144 sites)

#### The Problem
`bun run strict-index:check` enforces `tsconfig.strict-index.json`. The current baseline sits at **668 errors across 325 files**.
However, this count is split into two distinct categories:

| Category | Diagnostic Codes | Count | Nature of Fix |
|---|---|---:|---|
| **Pure `exactOptionalPropertyTypes`** | TS2375 (369), TS2379 (129), TS2412 (28) | **524** | Mechanical: omit keys instead of passing `undefined` (`...(v !== undefined ? { v } : {})`). |
| **Latent Type Errors Wearing the Label** | TS2322, TS2345, TS2339, TS2352, TS2344, TS2769, TS7006, TS2740, TS1360 | **144** | **True compiler defects / bugs-in-waiting** that appear because strictness flags expose them. |

#### Latent Errors Breakdown (144 sites)
- **24 TS2339** ("Property does not exist on type") — **Highest priority**. These are real runtime `undefined` reads masked by loose typing in production builds.
- **54 TS2322** ("Type 'X' is not assignable to type 'Y'") — Mismatched return or assignment types.
- **29 TS2345** ("Argument of type 'X' is not assignable to parameter of type 'Y'") — Parameter type drift.
- **16 TS2352** ("Conversion of type 'X' to type 'Y' may be a mistake") — Dangerously incompatible casts.
- **10 TS2344** ("Type 'X' does not satisfy constraint 'Y'") — Generic type constraint violations.
- **5 TS2769** ("No overload matches this call") — Function overload mismatches.
- **4 TS7006** ("Parameter 'X' implicitly has an 'any' type") — Missing parameter type declarations.
- **1 TS2740** ("Type 'X' is missing properties from type 'Y'") — Incomplete interface implementation.
- **1 TS1360** ("Type contains recursive references") — Circular structural type reference.

#### Phase 28 Execution Strategy
1. Run `tsc -p tsconfig.strict-index.json --noEmit` and extract all non-(TS2375|TS2379|TS2412) errors.
2. Group and tackle by error code starting with the 24 **TS2339** errors.
3. Fix each cluster in small, focused PRs.
4. Ratchet down `.strict-index-baseline.json` using `bun run strict-index:ratchet`.

---

### Priority 3: Route Validation Allowlist Burn-down (21 routes remaining)

#### The Problem
Gate 2 (`bun run check:route-validation`) currently holds an allowlist of **21 unvalidated body-reading routes** in `.route-validation-baseline.json`.

#### The 21 Routes (Grouped by Concern)

**Batch 1: Agent & Menu Workflows (4 routes)**
1. `src/app/api/menu-planner/agent-weekly-menu/route.ts`
2. `src/app/api/agents/group-chat/route.ts`
3. `src/app/api/agents/unified/route.ts`
4. `src/app/api/feed/route.ts`

**Batch 2: Admin Operations (7 routes)**
5. `src/app/api/admin/agent-sync/route.ts`
6. `src/app/api/admin/planetary-sync/route.ts`
7. `src/app/api/admin/environment/seed/route.ts`
8. `src/app/api/admin/send-test-email/route.ts`
9. `src/app/api/admin/feed/comment-reports/[id]/route.ts`
10. `src/app/api/admin/observability/slow-query-threshold/route.ts`
11. `src/app/api/admin/chat/reports/[id]/route.ts`

**Batch 3: Calculations & Lab (5 routes)**
12. `src/app/api/planetary-rectification/route.ts`
13. `src/app/api/planetary-positions/route.ts`
14. `src/app/api/philosophers-stone/positions/route.ts`
15. `src/app/api/food-lab/upload/route.ts`
16. `src/app/api/internal/revalidate/route.ts`

**Batch 4: External Integrations & Recommendations (5 routes)**
17. `src/app/api/instacart/recipe/route.ts`
18. `src/app/api/amazon/feedback/route.ts`
19. `src/app/api/amazon/search/route.ts`
20. `src/app/api/personalized-recommendations/route.ts`
21. `src/app/api/transmutation_recommendations/route.ts`

#### Execution Workflow
For each batch:
1. Define schema in `src/lib/validation/apiSchemas.ts` (or relevant feature schema file).
2. Wire `Schema.safeParse(rawBody)` into the route handler, preserving exact legacy response envelopes and error structures.
3. Write/update unit test covering valid body, invalid body (400), and malformed JSON.
4. Run `bun run check:route-validation:ratchet` to shrink `.route-validation-baseline.json`.

---

### Priority 4: Tranche E — Dead Runtime Exports Pruning (976 runtime symbols)

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
- **Verify before deleting**: Watch for barrel re-exports (`export * from`) and string-keyed lookup tables.
- Verify `bun run verify:static` and `bun run test` after each file cleanup.

---

### Priority 5: Tranche C — `no-unnecessary-condition` Background Work (840 findings)

- Count sits at **840 findings across 308 files** (`neverOptionalChain` 258, `alwaysTruthy` 223, `neverNullish` 218, `alwaysFalsy` 106, `noOverlapBooleanExpression` 24, `comparisonBetweenLiteralTypes` 11).
- **No global structural shortcut exists** (the index signature hypothesis was falsified in Phase 27).
- Treat as background cleanup: 1 file per PR, requiring an explicit red-proof test (delete guard -> watch test fail or prove unreachable).
- Never use `!` assertion to silence a warning.

---

## 3. Verification Protocol (The 10 Static Gates)

Always verify against the complete gate suite before committing or pushing:

```bash
# 1. Run all 10 static gates:
bun run verify:static

# 2. Run static gates + full test suite (336 suites / 3,589 tests):
bun run verify

# 3. Full production build verification:
bun run verify:full
```

### The 10 Static Gates Breakdown:
1. `check:untracked` — Ensures no untracked `.ts`/`.tsx` files exist in `src/` or `scripts/`.
2. `check:route-validation` — Ensures no unvalidated request bodies exist in `src/app/api/**/route.ts` outside `.route-validation-baseline.json`.
3. `test:gates` — Runs AST and gate test suites in `scripts/lib/__tests__/`.
4. `strict-index:check` — Enforces compiler strictness under `tsconfig.strict-index.json` (baseline 668 / 325 files).
5. `check:scripts` — Enforces typecheck on `scripts/**/*.ts` (baseline 302 errors / 58 files).
6. `typecheck` — Full Next.js production typegen and compiler check (`next typegen && tsc --noEmit`). Must be 0 errors.
7. `lint` — ESLint on `src/` (`--max-warnings=10000`, 5 baseline warnings).
8. `lint:scripts` — ESLint on `scripts/` (`--max-warnings=25`).
9. `lint:debt` — Ratchet gate for lint debt (1,493), casts (167), assertion sites (3,325), and sub-baselines.
10. `audit:dead-modules` — AST dead module check (0 unreachable modules).

---

## 4. Measurement Traps & Operational Lessons Learned

1. **`timeout` does not exist on macOS**:
   - macOS does not have the coreutils `timeout` command. Do not use `timeout 30s bun ...` in shell commands or scripts.
   - Implement timeouts in TypeScript/Node using `setTimeout` with `.unref()` or `AbortSignal.timeout(ms)`.

2. **Jest Character-Class Globs with Bracketed Route Paths**:
   - Jest treats square brackets `[userId]` in path CLI arguments as regex character classes.
   - When running tests for routes like `src/app/api/admin/users/[userId]/grant`, target by relative substring:
     `bun test "grant/__tests__/route.test.ts"` or escape brackets: `admin/users/\\[userId\\]/grant`.

3. **AST Cast Counting in Tests**:
   - `scripts/checkLintDebt.ts` parses the entire AST of `src/` and counts all `as` expressions.
   - Avoid using `as any` or `as unknown as` in unit tests, as they increase the gated `totalCasts` count.
   - Prefer `jest.mocked()` or explicit mock interface types to keep casts clean.

4. **`request.json()` Unsound Type Hole**:
   - `request.json()` returns `Promise<any>`. Code writing `let body: SomeType; body = await request.json();` has **no cast syntax** but represents an unverified runtime assertion.
   - Always find body-reading routes by inspecting `.json()` / `.formData()` AST call expressions, not by searching for `) as`.

5. **`zsh` Array & Glob Rules**:
   - Always quote regexes and file globs: `grep -P 'pattern' --include='*.ts'`.
   - Never suppress `stderr` with `2>/dev/null` on count probes until regex syntax is verified, or syntax errors will be reported as false zeroes.
