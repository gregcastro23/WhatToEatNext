# Phase 41 Closeout — Domain Loose Optionality, Bare JSON Casts, Scripts Typecheck

**Date:** 2026-09-24
**Base:** `master` @ `98b81ead` (Phase 40 landed as squash `bf937124`, #880; then #881, #882)
**Branch:** `codex/phase-41-domain-loose-optionality`

Phase 41 met all four ceilings. A review before merge found two runtime
regressions and a counting loophole in the first cut. This report gives the
numbers after those were fixed (§4), measured on the rebased tree.

---

## 1. Results

| Metric | Phase 40 baseline | Phase 41 ceiling | Measured | |
|---|---:|---:|---:|---|
| Domain loose optionality (`?: T \| undefined`) | 193 | ≤ 175 | **170** | ✅ −23 |
| Wire loose optionality (allowlisted) | 89 | ≤ 89 | **89** | ✅ unchanged |
| Bare JSON casts, production ¹ | 128 | ≤ 115 | **115** | ✅ −13 |
| Bare JSON casts, total ¹ | 137 | ≤ 125 | **124** | ✅ −13 |
| Scripts typecheck errors (`scripts/tsconfig.json`) | 66 (32 files) | ≤ 40 | **30 (14 files)** | ✅ −36 |
| Single assertion sites ² | 2,983 | ≤ 2,950 | **2,942** | ✅ −41 (−36 this phase) |
| Total assertion sites | 3,147 | ≤ 3,120 | **3,106** | ✅ −41 (−36 this phase) |
| Tracked lint debt ³ | 1,320 | ≤ 1,320 | **1,308** | ✅ −12 |
| Declined-rules pool ³ | 4,889 | no ceiling | **4,877** | −12 |

¹ **The bare-JSON metric changed in this phase.** `check:bare-json` now also
counts `z.custom<T>()` called with no predicate. That call accepts every value,
so at runtime it is `as T` under another name. The first cut of this phase
reported 104 production by rewriting 24 casts that way. The honest figure is
115: 104 `res.json()` casts plus 11 predicate-less `z.custom` sites that remain
(listed in §3). The 8 `z.custom` calls on master all pass a predicate and are
not counted.

² Master reached 2,978 while this branch was open (−5 from #881 and #882), so
Phase 41's own diff accounts for −36. Of those, 24 are the removed
`res.json() as T` casts; 11 predicate-less `z.custom` sites remain in their
place and are counted under bare JSON instead.

³ Measured on the rebased tree, so these include whatever #881 and #882 changed.

---

## 2. What changed

### A. Loose optionality (193 → 170)

Type-only edits: `?: T | undefined` became `?: T`. For each file below the
emitted JavaScript is byte-identical before and after (checked with
`ts.transpileModule`).

- `src/services/tableDatabaseService.ts`: the `patch` parameter of `updateTable` (8 sites)
- `src/types/indexedRecipe.ts`: the five `_lc*` fields of `IndexedRecipe`
- `src/app/api/meal-plan/balance/route.ts`: the `normalize` parameter, now `Partial<Record<Element, number | undefined>>` (5 sites)
- `src/services/RecipeElementalService.ts`: `RecipeLike.ingredients[].elementalProperties`
- `src/services/recipeRecommendations.ts`: the `aggregateIngredients` parameter
- `src/services/userDatabaseService.ts`: the `fallbackEmail` parameter of `updateUserProfile`
- `src/lib/auth/originCheck.ts`: `OriginCheckResult.error`
- `src/utils/planetaryAlchemyMapping.ts`: `BirthSectInput.utcInstant`

`src/actions/recipes.ts` changed at runtime. Under `exactOptionalPropertyTypes`
it can no longer assign `undefined` to the `_lc*` fields, so the new
`applyIndexedFields` sets a field only when there is a value. The recipe is
built fresh at `recipes.ts:320`, and its only reader
(`recommendationBridge.ts`) uses `??`. An absent key and an `undefined` one
therefore read the same.

### B. Bare JSON casts (128 → 115)

Real schemas, each with a compile-time drift guard against the server type it
validates, in `src/lib/validation/accountResponseSchemas.ts`:

| Reader | Endpoint | Schema |
|---|---|---|
| `MenuOrderClient`, `McpTopUpPanel` | `GET /api/economy/balance` | `EconomyBalanceResponseSchema` ↔ `EconomyBalanceResponse` |
| `OnchainEsmsPanel` | `GET /api/economy/claim-onchain` | `OnchainEsmsStatusSchema` ↔ `EsmsClaimStatusResponse` |
| `OnchainEsmsPanel` | `POST /api/economy/claim-onchain` | `OnchainClaimPostResponseSchema` (claim ↔ `EsmsClaimResponse`) |
| `ApiKeysPanel` | `GET/POST /api/account/api-keys` | `ApiKeyListResponseSchema`, `ApiKeyMintResponseSchema` (row ↔ `ApiKeyRow`) |
| `AccountSessions` | `GET /api/auth/sessions` | `AuthSessionsResponseSchema` ↔ `AuthSessionsResponse` |
| `AccountSessions` | `GET /api/internal/agent-sync/status` | `AgentSyncStatusResponseSchema` ↔ `AgentSyncStatusResponse` |

To make the guards possible, the server payloads now have named types that the
routes use:
- `EsmsClaimResponse` and `EsmsClaimStatusResponse` in `esmsOnchainClaimService.ts`
- `AuthSessionsResponse` and `AgentSyncStatusResponse` in the new `src/types/authSessions.ts`

The routes annotate their `NextResponse.json<T>` calls with them.
`claimToResponse` lost an `extra` parameter that no caller passed.

Envelope-only schemas (no domain payload) replaced the cast in
`useChatUnread`, `AvatarUpload` and the top-up checkout POST. Each field was
checked against its route. The checkout `url` is `.nullable()` because Stripe
types a session's `url` as `string | null`.

### C. Assertion sites (2,978 on master → 2,942 single)

- The 24 removed `res.json() as T` casts.
- `recipeBuilding.ts`: the typed `alchemicalNutrition` accumulator, and `PlanetName[]` candidates.
- `astrologyUtils.ts`: two `[] as string[]` casts.
- `sauceLineage.ts`: a type-predicate filter.
- `recipes.ts`: a `cookingMethod` cast.
- `ApiKeysPanel.tsx`: `json.key as ApiKeyRow`.
- `useMealPlan.ts`: `data.entry as MealPlanEntry`.

`recipeBuilding.ts` now spreads `planetaryHour` in conditionally. The loop runs
`i < altPlanets.length`, so the planet is always present. `elementalProperties.ts`
uses `String(element)` because `keyof ElementalProperties` includes `number`.

### D. Scripts typecheck (66 → 30)

- `scripts/types/bun-import-meta.d.ts` declares Bun's `import.meta.main` and
  `import.meta.dir` for the scripts project. That removed the errors in
  `migrate.ts`, `ratchetNullishCoalescing.ts`, `list_users.ts`,
  `purgeCoverageJunk.ts`, `enrichCoreCatalog.ts`, `enrichCoverageIngredients.ts`
  and `enrichNutrition.ts` with no casts, and those files are unchanged from
  master. `migrate.ts` is the production Dockerfile entrypoint. bun-types was
  not added because `bun add` clobbers the LFS hooks.
- `seedCulinary.ts`: ingredients are viewed through `toRecord()` instead of `as unknown as`.
- `updateRecipeNutrition.ts`: a `nutritionOf()` helper narrows with `in`
  instead of two new casts, and a `typeof` check keeps id matching as it was.
- Invariants that cannot fail now throw instead of substituting a value.
  `measureDignityBaselineDelta.ts` no longer falls back to `"aries"`, and
  `buildIngredientRecipeIndex.ts` no longer skips a missing bucket silently.
- Index-access guards in `migrateDataToBackend.ts`,
  `provision-privy-server-wallets.ts`, `resolveThermoCallers.ts`,
  `checkKitchenSettingsSqlParses.ts`, `dedupeAgentRows.ts` and
  `backfill-agent-sync.ts`.
- `stripe-mcp-top-up-e2e.ts` changed at runtime. Its `apiVersion` moved from
  `2025-09-30.clover` to `2026-04-22.dahlia`, the version production uses
  (`src/lib/stripe/stripe.ts:22`).

---

## 3. Remaining opaque `z.custom` sites (counted, 11)

These validate the envelope (`success`, `message` and similar, each checked
against its route) but not the payload:

| File | Payload |
|---|---|
| `src/hooks/useFoodDiary.ts` | `FoodDiaryEntry` ×2, `FoodDiaryApiResponse["summary"]` |
| `src/hooks/useMealPlan.ts` | `MealPlanEntry` ×2 |
| `src/hooks/useTables.ts` | `TableRecord`, `TableDetail` |
| `src/hooks/useChatInbox.ts` | `InboxEntry` |
| `src/components/tables/CommentList.tsx` | `TableComment` |
| `src/components/feed/CommentComposer.tsx` | `FeedComment` |
| `src/contexts/PremiumContext.tsx` | `UserSubscription` (`PremiumProvider` is not mounted anywhere) |

---

## 4. Fixed before merge

1. **The sessions list was dropped when `memberSince` was null.** The first
   cut's schema allowed a string or nothing. `/api/auth/sessions` sends `null`
   when it cannot read the users row, which is exactly its degrade path. The
   parse failed and `/profile/security` fell back to one placeholder row, so
   the user could not see or revoke other devices.
2. **The agent-sync chip showed OFFLINE when it should show ACTIVE.**
   `/api/internal/agent-sync/status` sends `lastSync: null` on every fallback
   path. The same kind of mismatch discarded the whole response.
3. **Casts were counted as removed while still being casts.** 18 predicate-less
   `z.custom<T>()` calls validated nothing, yet were counted as removed. The
   scanner now counts them (with tests in `scripts/lib/__tests__/bareJsonCasts.test.ts`).
4. **The branch was built on the pre-squash Phase 40 commits.** It was moved
   onto master, and every baseline was re-measured there.
5. **The "zero new assertions" claim did not cover scripts.**
   `check:diff-assertions` scans `src/` only. The scripts had gained three
   `as unknown as` chains and two single casts; all are gone.

Items 1 and 2 are covered by round-trip tests in
`src/lib/validation/__tests__/accountResponseSchemas.test.ts`, built from each
route's real null payloads. The first-cut schemas were run against the same
payloads and rejected both (control). The drift guards were also shown to fail
`tsc` against those schemas.

---

## 5. Verification

Run on the rebased tree, 2026-09-24:

| Command | Result |
|---|---|
| `bun run verify` | ✅ exit 0: all 13 `verify:static` gates, then jest |
| `bun run test` (inside `verify`) | ✅ 450 suites; 4,580 passed, 10 skipped, 0 failed |
| `bun run build` | ✅ exit 0; 7/7 route budgets unchanged (`/` 199 kB, `/account` 109 kB, `/shop` 109 kB first-load) |
| `bun run lint:scripts` | ✅ 0 errors, 25 warnings (cap 25, unchanged) |
| Emitted-JS equivalence | ✅ 9 type-only files byte-identical; the 4 that differ were read by hand (§2) |

The build log contains one `Module not found` for `@farcaster/mini-app-solana`.
It comes from inside `@privy-io/react-auth` (an optional dependency), not from
this diff.

Not verified in a browser. The affected surfaces (`/profile/security`, account
panels, restaurant ESMS checkout) need a signed-in user and a live database. The
round-trip tests and drift guards cover the parse paths.
