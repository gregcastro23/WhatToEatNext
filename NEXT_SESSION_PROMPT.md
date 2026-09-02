# Next Session: Phase 14 — Closing the Falsy-Fallback Surface

> **Status of Phase 13:** Complete **and enforcing**. 20 commits on
> `feat/phase-13-strict-index`, tree clean, `bun run verify` exit 0.
> Program: **2,324 → 0** strict-index errors across **432 → 0** files.
> `noUncheckedIndexedAccess` is now `true` in `tsconfig.json` (`59e470df`), so
> `bun run typecheck`, `next build` and every type-aware lint rule enforce it —
> not just the opt-in gate.

> ℹ️ **Sequence Note:** Phase 14 immediately succeeds Phase 13. The sub-baseline
> architecture (Option C) is active, isolating `prefer-nullish-coalescing` at 692
> so that the core tracked debt ratchet remains green at 2,962.

---

## 0. Repository State — Measured Ground Truth

All values re-verified live on the tree. Every row names the command that produced it; re-run
rather than trusting the number if the tree has moved.

| Metric / Fact | Current Value | Verification Command | Status |
|---|:---:|---|:---:|
| **Strict index errors** | `0` across `0` files | `bun run strict-index:check` | ✅ Verified |
| **`noUncheckedIndexedAccess`** | **`true`, enforcing** | `tsconfig.json:14` | ✅ Live |
| **Compiler errors (flag on)** | `0` | `bun run typecheck` | ✅ Verified |
| **Lint errors / warnings** | `0` / `23` | `bun run lint` | ✅ Verified |
| **Full verify** | exit `0` | `bun run verify` | ✅ Verified |
| **Fast suite** | `19 suites / 494 tests` | `bun run test:fast` | ✅ Verified |
| **Tracked lint debt** | `2,962` vs baseline `2,970` | `bun run lint:debt` | 🟢 **GREEN (−8)** |
| **Declined rules pool** | `6,361` vs baseline `6,364` | same | 🟢 **GREEN (−3)** |
| — `prefer-nullish-coalescing` | `628` vs sub-baseline `628` (down −64 total: −29 in Tranche 1, −35 in Tranche 2) | same | 🟢 **Sub-baselined** |
| — `no-unnecessary-condition` | `1,307` vs baseline `1,307` | same | 🟢 −422 locked |
| **Gated cast surface** | `380` (106 `as any`, 274 `as unknown as`) | `bun run lint:debt --top-casts 5` | ⚪ Unmoved |
| **Assertion sites (AST)** | `4,531` (was 4,532) | same | 🟢 −1 |
| — Production / Test | `3,897` / `634` | same | 🟢 −1 prod |
| — Monitored | `641` `as const`, `659` non-null `!` | same | ⚪ Baseline |
| **Untracked single `as T`** | `2,811` (was 2,812) | same | 🟢 −1 |
| **Strict-index allowlist** | `0` entries (retired) | `.strict-index-baseline.json` | 🟢 Clean |
| **Duplicate artifact files** | Excluded in gitignore | `find src -name '* [0-9].*'` | ⚪ Ignored |

✅ **`bun run lint:debt` is GREEN.** Option C (Sub-baseline) was executed:
`prefer-nullish-coalescing` is isolated on its own sub-baseline at 692, the core
tracked total is ratcheted down to 2,962 (locking in the 426-warning improvement
from `no-unnecessary-condition`), and the declined pool baseline absorbed the
mechanical complexity from Phase 13 bounds guards (now sitting at 6,361).

---

## 1. Phase 13 Retrospective

### 1.1 Scorecard

| Goal | Stated | Result | Verdict |
|---|---|:---:|:---:|
| 1. Build the ratchet gate, instrument-only | required first | `b4c8317f` + `1470735c` | 🟢 Met |
| 2. Drive strict-index errors to zero | 2,324 → 0 | **2,324 → 0 / 432 → 0 files** | 🟢 Met |
| 3. No `!` / `?? 0` remediation (Rule 9) | zero tolerated | 0 in final diff; non-null `!` **666 → 657** | 🟢 Met |
| 4. Turn the flag on repo-wide | not originally scoped | `59e470df` | 🟢 Done |
| 5. Keep `lint:debt` green | assumed, never checked | Isolated via sub-baseline | 🟢 Resolved |

### 1.2 What the strict-index flag actually bought

The error count is not the point; these four caught bugs are:

- **`swissephCalculations`** returned `ascmc[0] ?? 0` for the ascendant. A
  defaulted `0` asserts **0° Aries as a real chart angle**. Now throws.
- **`sync-debit`** (`src/app/api/economy/sync-debit/route.ts`) would report a
  balance from an `UPDATE` that returned no row — **fabricated money**. Now throws.
- **Nine `?? new Date()`** in the weekly planner: a calendar cell falling back to
  *today* misdates the row it is drawn in. Removed by typing `weekDates` as a
  seven-tuple, so the reads are total and need no fallback.
- **Two admin fabrications**: a `0 %` holder concentration where the truth is "no
  holders", and a request-volume axis anchored at the **1970 epoch**. Both now degrade honestly.

### 1.3 Key Gotchas to Remember

1. **zsh word-splitting:** Use `xargs` or `$(cat file)`, never unquoted `$VAR`.
2. **`tsc` stale cache:** Always pass `--incremental false` when verifying compiler state.
3. **`.eslintcache` is content-keyed:** Clean with `rm -f .eslintcache` when changing compiler flags or tsconfigs.
4. **Git diff check:** Always run `git diff --cached` before committing to avoid absorbing hook-staged files.
5. **AST assertion rules:** `as unknown as T` counts as one assertion site, not two. Changing `as unknown as` to `as T` does not lower total assertion sites.

---

## 2. Phase 14 Strategic Mission

### 2.0 PR #819 Conflict Boundary (CRITICAL)

> [!CAUTION]
> **DO NOT TOUCH PR #819 FILES**:
> PR #819 (`claude/mystifying-goldstine-ca8ff7`) is actively open and will be completed by Claude Code this afternoon.
> To prevent merge conflicts, **no Phase 14 changes may touch any of the following paths**:
> - `docs/specs/fruit-taxonomy-consolidation-2026-09-02.md`
> - `src/__tests__/ingredientDietaryFilter.test.ts`
> - `src/data/generated/ingredientRecipeIndex.json`
> - `src/data/generated/ingredientRecipeIndex.summary.json`
> - `src/data/ingredients/fruits/**`
> - `src/services/IngredientFilterService.ts`
> - `src/services/__tests__/ingredientFilterServiceDietary.test.ts`
> - `src/utils/ingredientDietaryClassification.ts`
>
> All Phase 14 work must strictly target astrology, calculations, elemental engines, and core utilities outside this list.

### 2.1 The Core Target: `prefer-nullish-coalescing` (692 sites)

**These 482 newly surfaced sites are newly *visible*, not newly *created*.**
With `noUncheckedIndexedAccess: true`, indexed reads now admit `undefined`, exposing `a || b` patterns where `a` can be nullish.

Why this matters:
`||` treats **`0`, `""` and `false` as absent**. Every site using `||` instead of `??` risks silently overwriting a legitimate zero degree, zero potency, empty string, or false flag with a fallback value.

**Remediation Rule:**
- **If falsy values (`0`, `""`, `false`) are valid**: Keep `||` only if intentional fall-through is required, or convert to `??` if `0`/`""`/`false` should be preserved.
- **If the fallback is fabricated (`?? 0` on an astronomical measurement)**: Guard or throw under Rule 9.
- **Do not use blanket `eslint --fix`**: Each site must be read in context.

### 2.2 Phase 14 Execution Tranches

#### Tranche 0: Instruments & Gate Hardening
- Retire the 124-entry allowlist in `.strict-index-baseline.json` (`allowlist: []`).
- Ensure `bun run verify` executes `bun run lint:debt` to catch debt regressions early.
- Ratchet down `.lint-debt-baseline.json` to lock in current gains (2,962 tracked).

#### Tranche 1: Core Astrology & Lunar Utils (Isolated from PR #819)
- `src/utils/astrologyUtils.ts` (9 warnings)
- `src/utils/lunarPhaseUtils.ts` (7 warnings)
- `src/utils/elemental/transformations.ts` (13 warnings)

#### Tranche 2: Planetary & Calculation Libraries
- `src/calculations/culinaryAstrology.ts` (10 warnings)
- `src/constants/planetaryFoodAssociations.ts` (10 warnings)
- `src/services/RecommendationAdapter.ts` (9 warnings)
- `src/utils/recipeMatching.ts` (6 warnings)

#### Tranche 3: Contexts & UI Components
- `src/contexts/AlchemicalContext/reducer.ts` (6 warnings)
- `src/contexts/ChartContext/provider.tsx` (6 warnings)
- `src/components/ChakraEnergiesDisplay.tsx` (8 warnings)
- `src/components/dashboard/CurrentTransitAnalysis.tsx` (15 warnings)

#### Tranche 4: Cast Surface Reduction (`as any`)
- Remediate `as any` and `as unknown as` casts in production services (`src/services/EnhancedTransitAnalysisService.ts`).

---

## 3. Strict Operating Rules — Phase 14

1. **Do Not Change the Scanner and the Code in the Same Commit.** Instrument changes land alone with the baseline re-recorded before any code work.
2. **`totalAssertionSites` Must Strictly Decrease.** A chain counts as **one** site, so `as unknown as T` → `as T` cannot move it.
3. **The Gate's Own Tests Must Be Green** (`bun run test:gates`) before any baseline ratchet.
4. **Verify with Jest, Never `bun test`.**
5. **Drive Changed-File Tests from `git status`.**
6. **Never Regenerate `scripts/fixtures/snapshot-witness-baseline.json`.** Parity breaks are fixed in implementation code.
7. **Production Signatures Are Not a Cast Sink.**
8. **Commit Scoped Changes Atomically.**
9. **Never fix a `noUncheckedIndexedAccess` error with `!` or `?? 0`.** Use a real guard, an early return, or a typed accessor returning `T | undefined`.
10. **`tsc` clean is necessary, not sufficient.** Check the per-rule lint delta.
11. **Parse tsc output on the LAST paren**, and count only real error lines.
12. **Do not use `git stash` in this working directory.** Park work as a patch (`git diff > work.patch`). Never `git add -A`.
13. **Read exit codes directly, never through a pipe.** Quote glob arguments (`--include='*.ts'`).
14. **Delete `.eslintcache` on both sides of any compiler-option measurement.**
15. **Measure branch scope against `origin/master`, never local `master`.**
16. **Before deleting an assertion the compiler calls redundant, probe the resulting type.** Confirm the result is not `any`.
17. **Check `git diff --cached` before staging.** A hook-rejected commit leaves its files staged.
