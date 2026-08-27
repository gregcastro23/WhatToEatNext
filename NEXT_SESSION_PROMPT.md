# Next Session: Phase 5 TypeScript Lint Debt Remediation (≤ 10,000)

**Status:** Phase 4 remediation is **complete but UNCOMMITTED.** All measurements below were taken
against the working tree on `feat/wten-solana-sync-p2-lint-remediation` on 2026-08-26.

---

## 0. Repository State — Measured, Not Assumed

| Fact | Value | How verified |
|---|---|---|
| Baseline in **working tree** | `10,996` | `.lint-debt-baseline.json` |
| Baseline at **HEAD** | `11,990` | `git show HEAD:.lint-debt-baseline.json` |
| Uncommitted diff | **34 files, +1,697 / −1,591** | `git diff --stat` |
| Untracked | `database/init/82-shop-items-is-one-time-not-null.sql`, `src/app/api/economy/shop/purchase/__tests__/` | `git status --porcelain` |
| Open PR | [#806](https://github.com/gregcastro23/WhatToEatNext/pull/806) — covers **Phase 2 & 3 only** | `gh pr list` |
| Phase 5 candidate pool | **1,249 tracked warnings across 35 files** | `bun scripts/checkFileLint.ts` (all 35, single run) |

> [!CAUTION]
> **Phase 4 exists only on this disk.** ~1,005 warnings of verified work — including the money-path
> `isOneTime` guard restoration, the `shop_items.is_one_time` migration, and its regression test — is
> not in any commit and not in PR #806. This working directory is shared with concurrent sessions and
> has lost work to `reset --hard` three times. **Committing Phase 4 is step 0 and blocks everything else.**

### Corrections to the previous Phase 5 queue

The prior Priority-1 queue claimed 613 warnings over 16 files. **160 of those (26%) are phantom:**

| File | Claimed | Measured | Reality |
|---|:---:|:---:|---|
| `src/components/CosmicYieldFeed.tsx` | 30 | — | **Does not exist** anywhere under `src/` (`find` returns nothing) |
| `src/components/DailyYieldCard.tsx` | 25 | — | **Does not exist** anywhere under `src/` |
| `src/components/recommendations/EnhancedCookingMethodRecommender.tsx` | 35 | **0** | 0 tracked / 14 declined |
| `src/components/cuisines/CurrentMomentCuisineRecommendations.tsx` | 35 | **0** | 0 tracked / 10 declined |
| `src/app/(alchm)/philosophers-stone/page.tsx` | 35 | **0** | 0 tracked / 5 declined |

The three zeros are **genuine, not instrument failure** — each returned a non-zero *declined* count, which
proves ESLint parsed and linted the file. All five are dropped from the Phase 5 queue.

*Probe hazard hit while measuring:* passing a non-existent path to `checkFileLint.ts` makes ESLint throw
and exit **before printing anything**, so a 12-file batch silently reported nothing. Always confirm the
count of `File:` lines equals the count of inputs. (The bracketed `src/app/(alchm)/profile/[userId]/page.tsx`
was checked specifically for glob mangling — it lints correctly at 32.)

---

## 1. Target Arithmetic

| Quantity | Value |
|---|---:|
| Start (working tree) | 10,996 |
| Goal | ≤ 10,000 |
| **Net required** | **996** |
| Gross candidate pool (35 files, measured) | 1,249 |
| Phase 4 measured displacement | **6.2%** (1,071 gross → 1,005 net) |
| Expected net at that rate | ~1,171 |
| **Margin** | **~175 (≈15%)** |

Displacement is real and was measured, not estimated: Phase 4's per-file reductions summed to 1,071 but
the whole-repo total moved only 1,005. Typing a source file makes `no-unnecessary-condition` fire in its
*consumers*. **Only the whole-repo audit is authoritative** — per-file sums will overstate progress.

## 2. Rule Composition of the 1,249

| Cluster | Count | Share | Character |
|---|---:|---:|---|
| `no-unsafe-member-access` 275 · `no-unsafe-assignment` 161 · `no-explicit-any` 78 · `no-unsafe-argument` 48 · `no-unsafe-call` 25 · `no-unsafe-return` 12 | **599** | 48% | The `any`-flow cluster. Falls together when the *source* type is fixed. Highest leverage. |
| `explicit-function-return-type` 173 · `explicit-module-boundary-types` 45 | **218** | 17% | Mechanical, low risk. |
| `no-unnecessary-condition` | **184** | 15% | ⚠️ **The dangerous rule.** Also the main displacement source. |
| `no-void` 83 · `no-console` 60 | **143** | 11% | Mechanical *except* on money/telemetry paths — see §4. |
| `prefer-nullish-coalescing` | 85 | 7% | ⚠️ `??` vs `||` changes behaviour on `0` / `""`. |
| `require-await` 16 · `no-useless-assignment` 4 | 20 | 2% | ⚠️ Dropping `async` changes `Promise<T>` → `T` for callers. |

---

## 3. Batches — Sequenced by Dependency and Risk

Re-ordered from the previous UI-themed grouping. Rationale: the DB type keystone must land before its
consumers are measured, and the money/privilege paths need the most attention while the session is fresh.

### Batch 0 — Commit Phase 4 *(blocking, not lint work)*
Commit the 34 modified files, the migration, and the regression test. Push to PR #806 or open a Phase 4 PR.
**Do not begin Batch A until `git status` is clean.**

### Batch A — DB type keystone · 4 files · 142
`src/lib/database/rawPool.ts` (38) **first**, then re-measure before touching the rest.

| File | Count |
|---|---:|
| `src/lib/database/rawPool.ts` | 38 |
| `src/services/feedCommentsDatabaseService.ts` | 39 |
| `src/hooks/useProfile.ts` | 33 |
| `src/contexts/UserContext/index.tsx` | 32 |

`executeQuery<T>` **declares a type parameter and discards it** — rows stay `any`. That single defect
plausibly feeds a large share of the 275 `no-unsafe-member-access`. Fixing it properly will reduce debt in
consumers *and* raise `no-unnecessary-condition` in them. Re-measure consumers after rawPool lands rather
than trusting the numbers above.

### Batch B — Mechanical, low risk · 6 files · 200
`dynamicImport.ts` (35) · `useStatePreservation.ts` (35) · `chromeApiInitializer.ts` (33) ·
`chakraSymbols.ts` (33) · `scriptReplacer.ts` (32) · `useMenuPersistence.ts` (32)

Return types, generics, `no-void`. Safe to move fast. Good place to bank margin.

### Batch C — Money, privilege & telemetry · 4 files · 137 ⚠️ *highest care*
`src/app/api/stripe/webhook/route.ts` (34) · `src/contexts/PremiumContext.tsx` (35) ·
`src/services/ErrorTrackingSystem.ts` (35) · `src/services/emailService.ts` (33)

### Batch D — Calculation-adjacent + admin · 10 files · 392
`zodiac-wheel-interactive.tsx` (49) · `celestial-lab/alchm/page.tsx` (47) · `admin/page.tsx` (49) ·
`NatalTransitChart.tsx` (39) · `CurrentMomentManager.ts` (39) · `planetary-positions/route.ts` (35) ·
`EnhancedAstrologyService.ts` (35) · `AlchemicalRecommendationService.ts` (35) ·
`RealAlchemizeService.ts` (32) · `admin/users/page.tsx` (32)

### Batch E — Recommenders, recipe, ingredient, UI state · 11 files · 378
`FoodLabBook.tsx` (47) · `recipeUtils.ts` (36) · `cuisineSauceProfiler.ts` (33) ·
`useAlchemicalRecommendations.ts` (33) · `recommendations/recipes/route.ts` (33) ·
`TarotFoodDisplay.tsx` (34) · `usePersonalization.ts` (34) · `useMealSlots.ts` (34) ·
`profile/[userId]/page.tsx` (32) · `ingredientUtils.ts` (31) · `AddToDiaryModal.tsx` (31)

---

## 4. Hazards Specific to These Files

**`no-unnecessary-condition` is not a free win.** The rule fires when the *declared* type says a guard is
redundant. If the declared type is optimistic, deleting the guard ships a crash. Never delete a guard to
satisfy this rule — fix the type to be honest about nullability, and the warning resolves correctly.

- **`stripe/webhook/route.ts`** — Stripe currently sends 5 of 8 subscribed events; `account.updated` has
  **never** fired (#742, still unfixed). Branches for those events look dead to the linter. *A branch that
  does not fire is not a branch that cannot fire* — keep the handlers.
- **`PremiumContext.tsx`** — privilege getters and `TIER_LIMITS`. A `no-unnecessary-condition` deletion on
  an entitlement check is an auth bypass. Type first, delete never.
- **`ErrorTrackingSystem.ts` + the 60 `no-console`** — `_logger.warn` is **silenced in production**; only
  `_logger.error` is ungated. Converting a money-path or alert `console.error` to `_logger.warn` is a
  silent outage. Convert to `_logger.error`, and do not simply delete.
- **`useProfile.ts`** — `natal_chart` **defaults to `'{}'`**, so a non-null type is honest while the object
  is still empty. Keep emptiness checks even after nullability is typed away.
- **`admin/page.tsx`, `admin/users/page.tsx`** — CLAUDE.md requires every panel to read a live source and
  degrade to an honest `live: false`. Do not let a type fix remove a "no source" fallback.
- **`NatalTransitChart.tsx`** — sits on the dignity manifest D(θ) (#722). Behaviour must not move.
- **`emailService.ts`** — typing only. Do not trigger sends; broadcast needs an explicit go-ahead.
- **`prefer-nullish-coalescing` (85)** — `||` → `??` changes behaviour whenever the value can be `0` or
  `""`. Scores, counts, and elemental values are exactly that. Check each site's value domain.

---

## 5. Verification — Per Batch, Not Only at the End

Phase 4's displacement was invisible until the whole-repo audit ran. Run the debt audit **after each
batch**, not once at the end, so a displacement surprise costs one batch instead of five.

**After each batch:**
1. `bun scripts/checkFileLint.ts <batch files>` — expect 0 tracked; confirm `File:` lines == input count.
2. `bun run verify` (typecheck + lint + test:fast).
3. `NODE_OPTIONS=--max-old-space-size=8192 bun scripts/checkLintDebt.ts` — **no `--ratchet` yet.** Record
   the real whole-repo number and compare against the per-file sum to track displacement.

**Batches C and D additionally:**
4. `bun test src/__tests__/calculations/unifiedEngineWitness.test.ts`
5. `bun scripts/snapshot-witness.ts` — 100% parity
6. `bun test src/app/api/economy/shop/purchase/__tests__/shopPurchaseOneTimeGuard.test.ts`

**Final gate, once ≤ 10,000 is measured:**
7. `bun run verify:full` (verify + build + full `bun run test`) — the full suite, not just `test:fast`.
8. `NODE_OPTIONS=--max-old-space-size=8192 bun scripts/checkLintDebt.ts --ratchet` — ratchet **last**, only
   after the build and full suite are green. The ratchet writes `.lint-debt-baseline.json`; committing a
   ratcheted baseline over unverified work makes the regression un-detectable.

> Use `NODE_OPTIONS=--max-old-space-size=8192` (or `bun run lint:debt`). The bare
> `bun scripts/checkLintDebt.ts` in the previous plan omits the 8 GB heap the whole-repo type-aware pass needs.

## 6. Standing Constraints

1. **Zero suppressions** — no `eslint-disable`, no `@ts-ignore`, no widening casts to silence a rule.
2. **Honest typing** — preserve nullability, runtime guards, and DB schema reality.
3. **Behavioural parity** — witnesses and snapshots must match, not merely pass.
4. **Commit per batch.** Do not accumulate five batches of unpushed work — that is exactly the state
   Phase 4 is in right now.

---

## 7. Appendix — Phase 4 Accomplishments (history)

Preserved from the previous handoff. **This work is uncommitted** — see §0.

> The table lists 30 files; `git diff` shows **32** modified `src/` files. The two not in the table
> are `src/components/LazyAlchemicalEngine.tsx` and `src/services/TokenEconomyService.ts` (the Track A
> schema-typing change). Both are part of the same uncommitted change set.

### Track A: Delivery Review & Money-Path Hardening
- **Hardened ESMS Shop Purchase Route**: Restored `const isOneTime = item.isOneTime ?? true;` in `src/app/api/economy/shop/purchase/route.ts`.
- **Honest Schema Typing**: Corrected `ShopItemRow.is_one_time` to `boolean | null` and updated `TokenEconomyService` return types so lint rules accurately reflect database nullability.
- **Database Migration**: Created `database/init/82-shop-items-is-one-time-not-null.sql` backfilling existing nulls and adding `NOT NULL` constraint to `shop_items.is_one_time`.
- **Regression Suite**: Authored `src/app/api/economy/shop/purchase/__tests__/shopPurchaseOneTimeGuard.test.ts` asserting that null `is_one_time` retains `alreadyOwned` check and empty nonce isolation.

### Track B: High-Density File Remediation (Target: $\le 11,000$ achieved at $10,996$)
- Remediated 30 high-density component, data, calculation, route, and service files down to **0 tracked lint warnings** (verified individually with `bun scripts/checkFileLint.ts`):

| # | File Path | Net Reduction | Core Remediation Applied |
|---|---|:---:|---|
| 1 | `src/components/BackendStatus.tsx` | −3 | Widened param to `Record<string, number | undefined>`, added `Number.isFinite`. |
| 2 | `src/components/CuisineSelector.tsx` | −2 | Fixed generic typings on `filteredCuisines.map()`. |
| 3 | `src/app/api/group-recommendations/route.ts` | −43 | Strongly typed route handlers and added index signature to `ElementalProperties`. |
| 4 | `src/app/api/alchm-quantities/route.ts` | −47 | Replaced `any` with typed request bodies and nullish operators. |
| 5 | `src/app/api/economy/shop/purchase/route.ts` | −40 | Typed request payload, structured audit logger, restored `isOneTime` guard. |
| 6 | `src/calculations/enhancedAlchemicalMatching.ts` | −42 | Replaced `any` casts with strictly typed alchemical matrix records. |
| 7 | `src/lib/sacred-7-stats.ts` | −11 | Strongly typed stat validators and type guards without `any`. |
| 8 | `src/data/unified/recipes.ts` | −44 | Strongly typed ingredient maps and recipe records. |
| 9 | `src/data/unified/seasonal.ts` | −42 | Strongly typed seasonal affinities and matrix lookups. |
| 10 | `src/data/ingredients/fruits/index.ts` | −49 | Strongly typed fruit records, elemental properties, and property getters. |
| 11 | `src/data/ingredients/proteins/index.ts` | −9 | Strongly typed protein mappings and compatible protein queries. |
| 12 | `src/data/ingredients/grains/index.ts` | −5 | Strongly typed all-grains collections and fixed spread assertions. |
| 13 | `src/data/ingredients/herbs/index.ts` | −6 | Strongly typed herb collections and nullish defaults. |
| 14 | `src/constants/alchemicalPillars.ts` | −43 | Replaced `any` with `Record<string, unknown>` and typed element getters. |
| 15 | `src/utils/hierarchicalSystemVerification.ts` | −47 | Converted `console.log` to structured `_logger.info`, typed test suite harness. |
| 16 | `src/components/recipes/SocialSection.tsx` | −46 | Strongly typed comment handlers and UI interaction state. |
| 17 | `src/components/menu-planner/PossoWidget.tsx` | −44 | Strongly typed meal plans, meal items, and day bindings. |
| 18 | `src/components/economy/TokenBalanceTrends.tsx` | −41 | Typed token balances, chart data, and period selectors. |
| 19 | `src/components/dashboard/RecommendationsPanel.tsx` | −41 | Strongly typed recommendations, dietary tags, and filter states. |
| 20 | `src/app/ingredients/IngredientsExplorer.tsx` | −40 | Typed search queries, ingredient cards, and filter options. |
| 21 | `src/lib/agents/ignition-bundle-generator.ts` | −40 | Strongly typed persona generator, natal overlays, and stats derivations. |
| 22 | `src/services/RecommendationAdapter.ts` | −40 | Typed recommendations converter, meal times, and kinetic scorers. |
| 23 | `src/app/(alchm)/generated-recipe/[id]/page.tsx` | −40 | Cleaned optional chains on non-nullish interfaces, typed recipe views. |
| 24 | `src/utils/astrologyUtils.ts` | −39 | Typed natal aspects, transits, and planetary dignity lookups. |
| 25 | `src/utils/lazyLoading.ts` | −39 | Generic typed `createLazyComponent<P>()` and preloaders. |
| 26 | `src/utils/data/processing.ts` | −39 | Replaced `any` with strongly typed data sanitizers and filters. |
| 27 | `src/utils/foodRecommender.ts` | −50 | Typed food scoring models, kinetic alignment, and season resolvers. |
| 28 | `src/utils/cookingMethodRecommender.ts` | −48 | Typed cooking method scorers, dietary preferences, and planet filters. |
| 29 | `src/utils/recipeMatching.ts` | −48 | Strongly typed recipe matchers, ingredient match vectors, and score bounds. |
| 30 | `src/utils/astrology/core.ts` | −43 | Normalized position dictionary lookups, aspect calculators, and dignities. |
| **Total** | | **−1,005** | **Net tracked lint debt reduction (12,001 measured baseline → 10,996)** |
