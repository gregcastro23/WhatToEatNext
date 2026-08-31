# Next Session: Phase 10 TypeScript Quality Campaign — Cast Surface Remediation & Type Safety

> **Every number in this doc is reproducible.** Each row in §0 names the command that
> re-derives it. If a command disagrees with the table, the table is wrong — fix the table.
> Numbers were last re-derived on 2026-08-31 against the working tree (not HEAD — see §1).

---

## 0. Repository State — Measured, Not Assumed

| Fact | Value | Verification Command | Re-derived? |
|---|:---:|---|:---:|
| **Tracked Baseline** | `3,706` | `bun run lint:debt` | ✅ |
| **Declined Rules Pool** | `6,323` | `bun run lint:debt` | ✅ |
| **Cast Surface (gated)** | `618` (186 `as any` + 432 `as unknown as`) | `bun run lint:debt` | ✅ |
| **Lint Errors** | `0` (22 warnings) | `bun run lint` | ✅ |
| **Compiler Errors** | `0` | `bun run typecheck` | ✅ |
| **Fast Test Suite** | `19/19 suites, 494/494 tests` | `bun run test:fast` | ✅ |
| **Snapshot Witness** | 100% parity | `bun scripts/snapshot-witness.ts` | ✅ |
| **Monica Integrity** | 0 fabricated fallbacks | `bun scripts/checkNoFabricatedMonicaFallback.ts` | ✅ |

---

## 1. ⚠️ BLOCKER — Batches A/B/C ARE NOT COMMITTED

The previous session's doc claimed "(Batches A, B, C committed)". **That was false.**
All 250 casts of work sit in the working tree as **uncommitted modifications** to 12 source
files, plus a ratcheted `.lint-debt-baseline.json`.

```bash
git status -s   # 12 modified src files + .lint-debt-baseline.json + this doc
```

Consequences to respect **before doing anything else**:

- `.lint-debt-baseline.json` in the working tree says `618` casts; **at HEAD it still says `868`**.
  The baseline and the source that justifies it must be committed **in the same commit** or the
  gate becomes unreproducible from any single commit.
- This checkout is shared with concurrent sessions and sits on a feature branch.
  **Never `git add -A`. Never `git reset --hard`. Never `git checkout --` these files.**
- **FIRST ACTION of the next session: commit this work**, scoping the `git add` to the exact 14
  paths (12 src files + `.lint-debt-baseline.json` + this doc). Nothing below is worth starting while 250 casts of work is unbacked.

---

## 2. ⚠️ The Verification Story Is Weaker Than It Looks — MEASURED

The campaign cites "100% snapshot parity" and "494/494 tests passing" as evidence that
250 refactors were behaviour-preserving. **Both gates were probed and are blind to most of
the changed code.**

**Method** (reproducible): inject a load-time `throw` at the top of each remediated module,
run the gate, and see whether it notices. A load-time throw cannot be missed by branch
precedence, dead code, or scoring tie-breaks.

**Result — snapshot witness:**

| Verdict | Modules |
|---|---|
| **COVERED** (witness loads it) | `src/data/cuisines/index.ts`, `src/data/ingredients/spices/index.ts` |
| **BLIND** (parity still "100%" while the module throws) | the other **10** of 12 |

**Result — `bun run test:fast`:** passes **19/19 suites, 494/494 tests** with load-time throws
in **all 10** witness-blind modules simultaneously.

**Instrument validated in both directions.** A positive control — the same injection into
`src/components/recommendations/EnhancedIngredientRecommender.tsx`, which
`personalizedIngredientRecommenderSmoke` genuinely imports — **went red** (1 suite failed,
error text `POSITIVE_CONTROL_LOADED`). So the "blind" verdicts are real non-coverage, not a
stale jest transform cache.

**Attribution:** the 2 covered modules account for 38 of the 250 remediated casts.
**212 casts (85%) were changed in modules that neither gate executes.**

Note the honest bound: a module *loading* only proves reachability, not that its changed
outputs are asserted on. **38 is an upper bound on real coverage, not a measurement of it.**

The witness snapshots 7 keys — 5 are astronomy (`serverPlanetary`, `ascendants`,
`livePositions`, `skySnapshots`, `diurnals`) plus `catalog` and `flavorCompatibility`. It is a
strong instrument for the physics core, which **these refactors never touched.** It is the
wrong witness for recommender refactors, and a green result from it is not evidence about them.

**This does not mean the refactors are broken** — typecheck is clean and the changes are
mostly mechanical. It means *the claim of verified behavioural parity is unsupported for 85%
of the work*, and should stop being made until coverage exists.

---

## 3. ⚠️ The Cast Gate Measures ~11% of the Assertion Surface

`scripts/lib/lintDebt.ts` counts casts with exactly two regexes over raw file text:
`/\bas\s+any\b/` and `/\bas\s+unknown\s+as\b/`. Measured against a TypeScript-AST count of
every assertion site in `src/`:

| Form | Count | Gated? |
|---|---:|:---:|
| `x as any` | 186 | ✅ |
| `x as unknown as T` | 432 | ✅ |
| **GATED TOTAL** | **618** | **✅** |
| `x as T` (single assertion) | **4,179** | ❌ invisible |
| `x!` (non-null assertion) | 665 | ❌ invisible |
| `: any` (annotation) | 212 | ❌ invisible |
| `eslint-disable` | 125 | ❌ invisible |
| `x as unknown` (terminal) | 34 | ❌ invisible |
| `@ts-expect-error` / `@ts-ignore` | 33 | ❌ invisible |
| **UNTRACKED TOTAL** | **5,123** | **❌** |

**The loophole, and evidence it was used.** Rewriting `x as unknown as T` → `x as T` scores
−1 against the gate while moving the assertion into the 4,179-strong untracked pool.
Measuring the A/B/C diff by AST:

- `as unknown as`: 252 → 3 (**−249**, genuine)
- untracked single `as T`: 292 → 285 (**−7 net**) — but **+30 gross** in six files
  (`cookingMethodRecommender` +12, `recipeBuilding` +6, `IngredientFilterService` +5,
  `RecommendationAdapter` +4, `cuisines/index` +2, `ingredientRecommender` +1), offset by
  −37 in four others.

So **~12% of the headline −250 was substitution, not elimination.** The remaining ~88% is
real. `as unknown as` → `as T` *is* a genuine (if modest) improvement — the compiler still
checks type overlap for a single assertion — but the gate scores it identically to deleting
the cast outright, which is the wrong incentive.

**Also unsegmented: 122 of the 618 gated casts (20%) live in test files.** `FileCastDebt`
already computes an `isTest` flag but the baseline does not use it. The two largest gated-cast
files in the repo are both tests, and the single largest `as any` concentration (15) is
`src/utils/astrology/astrologicalRules.test.ts`. A future batch could "win" 28 casts from two
test files with near-zero production type-safety benefit.

---

## 4. ⚠️ Governance Gaps in the Ratchet

Read `scripts/checkLintDebt.ts` before trusting the words "frozen" or "gated".

1. **`asUnknownAs` is not a floor.** `total` and `asAny` are written with `Math.min(current, baseline)`;
   `asUnknownAs` is written **raw**. Trade one `as any` for one `as unknown as` and the total is
   unchanged, `asAny` drops (so the ratchet fires), and the baseline records a **higher**
   `asUnknownAs`. It is a snapshot field, not a ratchet.
2. **The declined pool is frozen only in aggregate.** `findPerRuleRegressions` explicitly
   `continue`s past declined rules, and the declined check compares totals only. Any single
   declined rule (e.g. `max-lines-per-function`, currently 2,118) can grow without limit so long
   as another shrinks to cover it. "Frozen" ≠ per-rule frozen — say which one you mean.
3. **`master` has no branch protection.** Verified: `gh api repos/gregcastro23/WhatToEatNext/branches/master/protection`
   → `404 Branch not protected`. `lint:debt` runs as a real (non-`continue-on-error`) CI matrix
   job, so it goes red — but red does not block a merge. The ratchet is enforced by convention.

---

## 5. Corrected Batch D Target — the Previous List Could Not Reach Its Own Goal

The prior doc set a target of **≤ 550** casts and listed 7 files. Those files total **57** casts:
`618 − 57 = 561`. **The stated target was unreachable from the stated file list by 11 casts.**

Corrected list (production files only, current counts verified by `bun run lint:debt --top-casts 25`):

| File | Gated Casts | `as any` | Untracked `as T` present |
|---|:---:|:---:|:---:|
| `src/data/unified/enhancedIngredients.ts` | 11 | 0 | 18 |
| `src/contexts/AlchemicalDataContext.tsx` | 8 | 0 | 3 |
| `src/utils/dynamicImport.ts` | 8 | 0 | 9 |
| `src/utils/elemental/transformations.ts` | 8 | 0 | 6 |
| `src/utils/seasonalCalculations.ts` | 8 | 0 | 10 |
| `src/services/UnifiedIngredientService.ts` | 7 | 0 | 18 |
| `src/utils/ingredientNutritionAggregation.ts` | 7 | 0 | 3 |
| `src/calculations/culinaryAstrology.ts` | **6** | 0 | 5 |
| `src/data/ingredients/fruits/index.ts` | **6** | 0 | 58 |
| **TOTAL** | **69** | | |

`618 − 69 = 549 ≤ 550` ✅ — reachable, with no margin. Add
`src/services/EnhancedAstrologyService.ts` (6) for slack.

**The `as any` axis has barely moved: 187 → 186 across 250 remediated casts.** Every file in
the Batch D list has **zero** `as any`, so Batch D as scoped will not move it either. If the
phase is meant to improve type safety rather than a counter, schedule the hard axis explicitly:
`src/data/ingredients/seasonings/index.ts` (4), `src/components/recommendations/EnhancedSauceRecommender.tsx` (4),
`src/utils/typescriptCampaignTrigger.ts` (4), `src/app/api/menu-planner/public-week/route.ts` (3),
`src/app/api/transmutation_recommendations/route.ts` (3).

---

## 6. Work Remaining for Phase 10 Completion

Ordered by dependency, not by size. **Items 1–3 gate the rest.**

1. **Commit Batches A/B/C** (§1) — scoped `git add` of the 13 paths, source + baseline together.
2. **Close the substitution loophole** (§3) — extend `scanFileCasts` to count single `as T`
   assertions as a third, separately-ratcheted axis. Without this, every remaining batch can
   hit its number without improving safety. Land the counter first so Batch D is measured by it.
3. **Earn the parity claim** (§2) — either extend `scripts/snapshot-witness.ts` to snapshot
   recommender outputs (cooking-method ranking, ingredient recommendation, recipe building,
   cuisine integration) so the 10 blind modules are covered, **or** stop citing snapshot parity
   and 494/494 as evidence for them. Prefer the former: a witness recorded *now*, before Batch D,
   converts the remaining batches from unverified to verified. Re-run the §2 probe afterwards to
   prove the new coverage is real — a witness that does not go red is not a witness.
4. **Segment test-file casts** (§3) — use the existing `isTest` flag to track production and
   test cast surfaces separately, so batch credit reflects shipped-code safety.
5. **Fix the ratchet asymmetries** (§4) — `Math.min` on `asUnknownAs`; per-rule non-regression
   for declined rules, or rename the claim to "aggregate declined pool".
6. **Batch D** (§5) — 9 files, 69 casts, → ≤ 549.
7. **Decide the `as any` policy** (§5) — currently "never increase", which 250 casts of work
   satisfied without touching it. Either schedule it or state that it is deliberately deferred.
8. **Branch protection on `master`** (§4) — otherwise every gate here is advisory.

---

## 7. Strict Operating Rules (unchanged, plus corrections)

1. **`as any` must NEVER increase** (current: 186).
2. **Total gated casts must strictly decrease** (current: 618).
3. **Declined rules pool must not increase in aggregate** (current: 6,323) — *per-rule drift is
   currently permitted; see §4.2*.
4. **0 compiler errors & 0 lint errors** at every checkpoint.
5. **Run all five gates** — `bun run typecheck`, `bun run lint`, `bun run test:fast`,
   `bun scripts/snapshot-witness.ts`, `bun scripts/checkNoFabricatedMonicaFallback.ts` — but
   **do not claim behavioural parity for modules §2 shows are uncovered.**
6. **Auto-ratchet** after each batch:
   `NODE_OPTIONS=--max-old-space-size=8192 bun scripts/checkLintDebt.ts --ratchet`
   — and commit the baseline in the same commit as the source that justifies it.
7. **Report the untracked axis too.** A batch summary that cites only gated casts hides
   substitution. Report gated casts *and* single `as T` movement.
