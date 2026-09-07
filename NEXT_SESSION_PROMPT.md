# Next Session: Phase 26 — Close the ungated surface, then make the boundaries honest

> **Numbering note.** The previous copy of this file described "Phase 24" as upcoming.
> Phases 24 **and** 25 have since been completed and merged. This document is Phase 26.
>
> **Status of Phase 25:** complete, verified, and **recovered onto master by PR #832**
> (this commit). It had been stranded — see §0, kept as the record of how and why.
>
> | Metric | P23 | P24 | P25 | on master today |
> |---|---:|---:|---:|---:|
> | Tracked lint debt | 2,630 | 1,944 | **1,635** | **1,635** |
> | Declined pool | 6,236 | 4,911 | 4,910 | 4,910 |
> | Casts (gated) | 252 | 169 | 169 | 169 |
> | Assertion sites (AST) | 4,357 | 3,398 | 3,396 | 3,396 |
> | `prefer-nullish-coalescing` sub-baseline | 294 | 214 | 214 | 214 |
>
> Master was `1f3c32c1` before #832. The audited rule set has been stable at 28 rules since Phase 12,
> so Phases 12–25 are like-for-like comparisons.

---

## 0. RESOLVED by PR #832 — how Phase 25 went missing, and why it matters

**What happened.** PR #830 was opened with base `refactor/phase-24-dead-modules` instead of
`master`. PR #828 squash-merged that same branch into master at `11:44:36`; #830 then merged
into it at `11:45:30` — 54 seconds after its base had already been merged away. GitHub reports
#830 as `MERGED`, so nothing looks wrong from the PR list.

**Evidence that master lacks the work** (four independent witnesses):

| probe | master | Phase 25 tip |
|---|---:|---:|
| `.lint-debt-baseline.json` → `trackedTotal` | 1,944 | 1,635 |
| `console.error` occurrences in `src/` | 304 | 45 |
| `Partial<` in `api/economy/sync-credit/route.ts` | 0 | 2 |
| `GET /compare/master...<tip>` → `.status` | `diverged` | — |

**The branch is deleted on origin.** It survives in exactly two places: the local worktree
`.worktrees/phase-24`, and the origin branch `refactor/phase-24-dead-modules` (head
`c3c771db`, which contains #830's merge). **Do not delete either until this is recovered.**

**What is stranded.** 309 retired warnings, and — far more important — the `Partial<T>`
boundary fix. Without it, `no-unnecessary-condition` still reports the live 400-guards on
`economy/sync-credit`, `economy/sync-debit` and `economy/swap` as provably-dead code. Those
are the PA↔alchm money bridge. Deleting them leaves tsc, ESLint and all 3,497 tests green.

**Recovery (done in PR #832).** A `git merge-tree` dry run against real master conflicted in
exactly three files:

| file | resolution |
|---|---|
| `src/app/api/economy/swap-rates/route.ts` | take Phase 25's side — it is a strict superset (both branches made the same de-async change; Phase 25 additionally routed `console.error` → `_logger.error`) |
| `.lint-debt-baseline.json` | take Phase 25's, then re-derive with `bun run lint:debt --ratchet` rather than trusting the file |
| `NEXT_SESSION_PROMPT.md` | superseded by this document |

Everything else auto-merges. Open this as a normal PR **based on `master`**, and check
`baseRefName` before merging.

```bash
gh pr view <n> --json baseRefName,headRefName
```

---

## 0b. The primary checkout is contaminated — read before running anything in it

`/Users/cookingwithcastro/Desktop/WhatToEatNext-master` is on `refactor/phase-23-require-await`
with **132 modified files**. Provenance was traced file by file:

- **125 files hold previously-committed *stale* content.** `scripts/lib/lintDebt.ts` there is
  710 bytes versus 14,525 on every branch — it is the pre-#813 version from 2026-08-14, i.e.
  **the cast ratchet, assertion-site gate, declined-pool freeze and per-rule non-regression
  assertion are all absent**. Any `lint:debt` run in this checkout measures a different thing
  than CI does.
- **6 files are genuinely novel** and must not be discarded: `package.json` (the `gen` script),
  `src/lib/spacetime/config.ts` (module default → `wten`), and
  `src/lib/spacetime/generated/{index,types,types/reducers}.ts`, plus
  `docs/design/home-living-hero-stitch-prompt.md`. These are the SpacetimeDB migration.
- 1 file deleted: `NEXT_SESSION_PROMPT_LAGGING_STRAND.md`.

**A blind `git checkout -- .` destroys the six.** Salvage them first, then reset. Do all Phase 26
measurement in `.worktrees/phase-24` (clean) or a fresh worktree off master — never here.

Also present: `NEXT_SESSION_LAB_STATS_FIX 2.md`, a Finder duplicate. `tsconfig.json` already
excludes `**/* 2.*`, but scanners that do not have inflated counts before.

---

## 1. The finding that should reorder the campaign

**The largest uncovered surface is not lint debt. It is the code no gate looks at.**

```
bun run lint      → eslint ... src --max-warnings=10000     # src only
tsconfig.json     → exclude: scripts/**, tests/**, __tests__/**, src/scripts/**,
                             **/*.test.ts, **/*.spec.ts, .storybook/**, ...
```

| population | count |
|---|---:|
| TypeScript files outside every gate's scan root | **152–163** |
| — `scripts/*.ts` | 110 |
| — **of those, referencing `executeQuery` / `DATABASE_URL` / `DATABASE_PUBLIC_URL`** | **51** |
| `tests/` + root `__tests__/` | 42 |

A ledger-repair or backfill script can be type-broken, `any`-riddled and unlinted while
`bun run verify` is green and `lint:debt` reports 1,635. Given that `DATABASE_PUBLIC_URL` points
at **production**, and that this repo's history already contains a backfill that ran against the
wrong writer twice, this is where the next real incident comes from — not from the 897.

**Tranche 0 should be: put `scripts/**` under typecheck and lint.** Expect a large one-off error
count. Ratchet it; do not try to zero it.

Two smaller gate gaps, both verified in `scripts/lib/lintDebt.ts`:

- **The declined pool has no per-rule ratchet.** `findPerRuleRegressions` line 155 reads
  `if (declinedRules.has(rule)) continue;`, and line 139 passes it
  `new Set([...declinedRules, ...subBaselineRules])`. Only the 4,910 aggregate is checked, so
  300 new `max-lines-per-function` violations can be paid for with 300 deleted `no-void` ones and
  the gate stays green. Adding per-rule declined regressions is a ~5-line change.
- **The dead-module gate is module-granular.** `UNREACHABLE: 0` is a true statement about
  modules and says nothing about dead *exports inside live modules*. Phase 24 deleted 450 whole
  modules; the same technique cannot find the next tranche, which now lives inside survivors.

---

## 2. Phase 26 prioritized plan

### Tranche 0 — gate `scripts/**` (§1)
The Phase 25 recovery half of this tranche is **done** (#832), so the baseline on master is
now the real one (1,635). What remains is putting the ungated files under typecheck and lint.

### Tranche 1 — boundary validation, scoped by ROUTE, not by grep
The Phase 25 enumeration (`grep -rl "\.json()) as" src/app/api`) **misses 14 production routes**
that assert the body a different way — including `recipes/mint`, `recipes/mint-quote` (the NFT
mint path) and `user/commensals` (the highest-risk guard found in this audit: `birthData` is
destructured out of an untrusted body via `body as {...}`, and its `latitude`/`longitude` flow
straight into `getPlanetaryPositionsForDateTime` and are then persisted as a natal chart).

**Build the inventory from the 122 `route.ts` files that read a body**, not from a cast pattern.

| shape | count | note |
|---|---:|---|
| request-body assertion sites in `src/app/api` | 63 in 50 files | 12 `as typeof body`, 10 `Record`, 6 `Partial<>`, 5 `unknown`, 30 concrete named types |
| routes invisible to the Phase 25 grep | **14** | includes the two mint routes and `user/commensals` |
| `(res\|response).json()) as` **repo-wide** | 188 | response side — never in Phase 25's scope |
| `JSON.parse(...) as` | 61 | |
| `safeReadJson<T>` / `readJson<T>` | 34 in 16 files | implementation is `return body as T` — an unvalidated cast |

**Response bodies are now the larger half of the problem.** Tranche 1 as previously scoped fixes
under a fifth of the lying-cast surface.

⚠️ **`Partial<T>` is not the destination.** Every route Phase 25 converted re-enters
`no-unnecessary-condition` at its `!body` guard, because `Partial<T>` models *absence only* — a
body sending a string where a number is expected is still mis-typed. `unknown` + a parse is what
actually retires these. A second `Partial<>` pass would *add* findings.

The zod pattern already exists (`src/lib/validation/clientSchemas.ts`; 21–36 routes already
import it, depending on probe). This is a **behavioural** change — malformed bodies start
returning 400 — so it needs its own PR and its own review.

### Tranche 2 — `.json()` is the one real lever, and it is 101 decisions
Measured causal blast radius: **261 of the 457 unsafe warnings (57%)** trace to `.json()`, from
**101 root call sites in 74 files** — 42 inbound (`request.json()`), 54 outbound
(`response.json()`) spanning 44 distinct endpoints.

The handoff's "89 unsafe sites" was a *lexical* count (sites whose own line contains `.json()`);
the causal radius is 2.9× larger. So the prize is bigger than advertised and the simplicity is
worse: 261 warnings for 101 hand-written schemas, a 2.6:1 payoff.

Use the `interface Body { json(): Promise<unknown> }` augmentation **to size the work, then
delete it** — it is a measurement probe, not a shippable fix. Measured floor: 132 error-producing
sites on 94 lines in 35 files (the handoff claimed 142 / 57).

### Tranche 3 — `no-unnecessary-condition` (897) stays last, and shrinks by being *measured*
Do not size this rule until Tranches 1–2 land. 480 of the 897 (`neverOptionalChain` 262 +
`neverNullish` 218) are derived from precisely the types the casts assert.

**Corrected distribution** — the previous handoff's table summed to 904 against a real 897:

| messageId | count |
|---|---:|
| `neverOptionalChain` | 262 |
| `alwaysTruthy` | 231 |
| `neverNullish` | 218 |
| `alwaysFalsy` | 126 |
| `noOverlapBooleanExpression` | 50 |
| `comparisonBetweenLiteralTypes` | 10 |

Two corrections to how this rule was framed:

1. **`alwaysFalsy` and `noOverlap` are the *least* defect-dense buckets, not the most.**
   24 of the 50 `noOverlap` are one benign tuple guard in `src/lib/cooking/boundaryNetwork.ts` —
   3 identical blocks, one decision, the cheapest real win in the whole rule.
2. **897 findings = 808 distinct `file:line` = 656 contiguous guard-blocks across 322 files.**
   Per-finding burn-down rates misestimate this rule in both directions.

Sampled classification (n=35, stratified across all six messageIds): **A (the type lies, guard is
live) 14 · B (genuine redundancy) 14 · C (needs judgment) 7**. Extrapolated: **40–50% is a lying
type**. State it as a band — at n=35 the point estimate carries roughly ±16pp.

Genuinely mechanical slice: ~51 findings / ~21 edits — 10 `private static instance` declarations,
~8 `let cancelled: boolean = false` annotations, and the boundaryNetwork block. **None of them are
guard deletions.**

**One high-leverage declaration fix — `ElementalProperties`.** The agent analysis said this type
is "declared twice." That is wrong, and the truth is worse: **12 structural declarations** exist,
and they disagree about whether the type has an index signature.

| declaration | index signature |
|---|---|
| `src/types/recipe.ts:9` | **`[key: string]: number`** |
| `src/types/elemental.ts:14` | **`[key: string]: number`** |
| `src/app/api/group-recommendations/route.ts:40` | **`[key: string]: number`** |
| `src/utils/elementalMappings.ts:3` | **index signature *only*** — no `Fire`/`Water`/`Earth`/`Air` at all |
| `src/types/celestial.ts:148`, `zodiac.ts:17`, `cuisine.ts:57`, `lib/api/alchm-client.ts:8`, `components/recipes/LabBookIngest.tsx:14` | none |
| `src/types/alchemy.ts:238` | `extends RawElementalProperties` — resolve before editing |
| `src/lib/database/types.ts:112` | a different shape entirely (DB row: `id`, `entity_type`, lowercase `fire`…) |

Wherever the index-signature version is in scope, **every element read types as non-nullish**, so
the guard against a missing element reads as dead code. Removing those index signatures makes the
rule tell the truth — `neverNullish` findings flip from "delete the guard" to "the guard is
required." Expect a wave of new tsc errors; that is the point. Reconciling the 12 declarations is
a prerequisite, not a side quest.

### Tranche 4 — `exactOptionalPropertyTypes` 674 is really two populations
Confirmed at 674 across 329 files, identical to `.strict-index-baseline.json`. But only **529 are
exactOptional diagnostics** (TS2375 373 + TS2379 128 + TS2412 28). The other **145 are different
errors** — TS2322 55, TS2345 29, **TS2339 "property does not exist" 24**, TS2352 16, TS2344 10,
TS2769 5, TS7006 4, TS2740 1, TS1360 1. The TS2339 slice is latent type errors, not optionality
work. Split the tranche accordingly.

### Do NOT plan Phase 26 around the `any` type roots
The August audit's root set (22 `any` lines in 7 type modules, ~686 import sites) was never
fixed — **and no longer matters.** 19 of the 22 lines are still in the tree, with 179/100/79
importers, and they now drive **6 of the 457** unsafe warnings. Of the 22, three are prose in
comments and five are stub-function parameters; the remainder are narrow optional zodiac fields.

Leverage collapsed from roughly 358:1 to **2.22:1**. The whole unsafe cluster is 457 warnings
over **206 distinct root decisions**, and the single largest root anywhere collapses **9**
warnings. Plan Phase 26 as a long series of small single-concern PRs, not a few sweeps: the
top-25 files are only 44% of the cluster.

One consolidation opportunity does remain — the `asPlanetaryPositions` copy-paste, worth ~30
warnings behind one shared normaliser typed against the existing `PlanetaryPosition`. Verify all
call sites; see the cross-repo sign-vector lesson.

---

## 3. The floor: what "pristine" cannot mean

Driving the tracked number to zero is not achievable and mostly not desirable. Best estimate of
the achievable floor: **~400 of the 1,635** (range 250–600).

| population | floor | why |
|---|---:|---|
| `no-console` 102 | **~72** | 21 are the logger implementations themselves. `_logger` (imported by 339 files) gates `info`/`warn`/`debug` behind `NODE_ENV !== "production"`, so converting a `console.warn` **silently deletes a production log line**. 51 of the 71 warns are server-side, on live degradation paths (Redis fallback, Privy token-verification failure, DB-insert fallback in `/api/sessions`). There are already 209 `_logger.warn` and 64 `_logger.info` calls that emit nothing in production. |
| `no-useless-assignment` 35 | **35** | The base config disables this rule as a domain false-positive generator. Either drop it from `AUDITED_RULES` — honestly lowering the total to 1,600 — or accept it as permanent. |
| `prefer-nullish-coalescing` 214 | ~130–214 | Tracked separately. Split by RHS: 67 string literal, 62 expression, 60 `\|\| 0`, 9 numeric, 6 `\|\| ""`, 6 null/undefined, 3 `[]`/`{}`, 1 `\|\| false`. **12 sites have a nonzero numeric fallback** (`\|\| 1`, `\|\| 0.7`, `\|\| 0.05`, `\|\| 14`) where `\|\|`→`??` is a live behaviour change. |
| `no-explicit-any` 144 | **~2–8** | Bad news, not good: the "deliberately permitted" category is nearly empty. Almost all 144 are real, fixable debt. |
| assertion sites 3,396 | ~470 | 137 `keyof` index-key narrowing + 36 generic-parameter casts + test idioms (188 `as jest.Mock`, 84 `as never` — 47% of the 624 test sites). The remaining ~2,900 are real boundary-shaping debt, dominated by 259 production `as Record<string, unknown>`. |
| `no-unnecessary-condition` 897 | 150–450, and it **moves** | The floor is unknowable until the boundaries are validated. After Tranche 1 most of these guards become genuinely dead and safely removable — the work *lowers* the floor rather than clearing warnings against it. |

### The declined pool (4,910) should not be driven to zero
- **2,492 are measured against ESLint *default* thresholds nobody on this team chose**
  (`max-lines` 300, `max-lines-per-function` 50, `complexity` 20 — `AUDITED_RULES` passes a bare
  `"warn"` with no options). 514 of 1,644 non-test files — **31% of the codebase** — are "too
  long" by that unchosen default; 115 of them are `src/data` literal tables.
- **373 `no-void` are a regression by construction.** The base config sets `"no-void": "off"` with
  the comment *"valid pattern for ignored promises"*, while `no-floating-promises` is `"warn"`.
  248 of the 373 reported lines literally begin with `void `. Fixing them re-introduces the thing
  the other rule warns about.
- **`max-lines-per-function` is useless as a priority signal.** Correlation with tracked debt per
  file: Pearson **r = 0.049**. The top 30 files by MLPF carry 303 MLPF warnings and just **23**
  tracked warnings (1.4%). It would send the team to almost exactly the wrong 30 files.
- **`explicit-function-return-type` (1,374) buys essentially no type safety here.** Inference
  under `strict` already types every return, and the dangerous subset (`no-unsafe-return`) is 19
  warnings in 13 files — only 7 of which even carry an EFRT warning. It is a readability policy;
  selling it as safety would be false.

---

## 4. Claims from the Phase 25 handoff, audited

| # | claim | verdict |
|---|---|---|
| 1 | "53 test-only modules in ~7 dependency clusters" | 53 **CONFIRMED**; **"7" is WRONG — measured 23 connected components** (29 distinct owner-sets). Largest is 19 modules; **15 are singletons**. Budgeting 7 judgments and hitting 23 will blow the phase. |
| 2 | `unifiedEngineWitness.test.ts` is unfalsifiable | **CONFIRMED** — it would pass if the engine returned one identical constant for all 20 charts. But the proposed fix is the weaker one: the fixture already supplies **exact expected values**, so assert conformance directly rather than merely counting distinct outputs. Only then is "is `UnifiedCalculationEngine` dead?" answerable. |
| 3 | Three `client.ts` functions have zero callers | **CONFIRMED** under an explicit barrel check. But note *two of the five zero-caller exports share names with live classes* (`IngredientService` among them) — so grep alone cannot answer "is this symbol used?" in this repo. |
| 4 | `pollingTestEnv.ts` is test-only by design | **CONFIRMED** — not a deletion candidate. |
| 5 | `exactOptionalPropertyTypes` 674, untouched | **674 CONFIRMED exactly**, but the label is wrong — see Tranche 4. |

**Also worth knowing:** 9 of the 22 files Phase 23 hand-edited for `require-await` were deleted
as dead by Phase 24 — **41% of that phase's judgment calls were spent on code that was about to
be deleted.** Run the reachability audit *before* a phase of hand edits, not after. (The de-async
trap itself did **not** fire: 8 rejection-preserving `Promise.resolve().then(...)` versus 94 bare
`return Promise.resolve(expr)`, and every de-async'd site traced in surviving files uses the safe
form.)

---

## 5. What could still ship with every gate green

The campaign gates lint debt, casts, assertion sites, strict-index and dead modules. It does not
gate:

1. **Anything in `scripts/**`, `tests/**`, `__tests__/**`** — 152–163 files, 51 of them touching
   the production database (§1).
2. **Dead exports inside live modules** — the dead-module gate is module-granular.
3. **Test code asserting against properties production types do not have** — tests are excluded
   from `tsc` *and* exempted from the two most common type errors. This is the exact shape of the
   recorded "schema change shipped before its 6 readers" incident.
4. **Deletion of a live runtime guard** — proven by Phase 25: removing the `sync-credit` /
   `sync-debit` / `swap` 400-guards leaves tsc, ESLint and all 3,497 tests green.
5. **Retiring a warning with a suppression comment** — the gate has no directive-count axis.
   Today there are only 4 such directives and each carries a written reason, but a
   "drive it to zero" push creates a strong incentive to add more.
6. **New unsafe warnings in ordinary development** — the `no-unsafe-*` rules exist only in the
   audit overlay (`eslint.config.audit.mjs`), not in the `bun run lint` that actually runs in CI.

---

## 6. Verification protocol

```bash
bun run verify               # test:gates, strict-index:check, typecheck, lint, lint:debt, test:fast
CI=1 bunx jest               # full suite — 333 suites / 3,497 tests
bun run build
bun run audit:dead-modules   # must stay at UNREACHABLE: 0
```

⚠️ `verify` ends in `test:fast` (19 suites). It is **not** the full suite — run `CI=1 bunx jest`
separately before claiming green.

⚠️ `lint:debt` is only a valid local witness when `git status --porcelain | grep -c '^??'`
returns **0** and the tree contains only your changeset. It is **not** valid in the primary
checkout today (§0b).

⚠️ `rm -f .eslintcache` before re-running lint to verify a fix; `--cache-strategy content` has
failed to invalidate here.

⚠️ A pipeline's exit code is the last command's — `bun run typecheck 2>&1 | tail -20` reports
`tail`'s status. Use `set -o pipefail`.

---

## 7. Measurement traps that produced false results while writing this document

- **zsh does not word-split `"$VAR"`.** A variable holding a space-separated file list becomes
  **one** argument, matches nothing, and reports a confident **0**. Use `$(cat file)` or an array.
- **`$REF:path` is a zsh history modifier.** Write `${REF}:path` or you get `bad substitution`.
- **`2>/dev/null` turns "bad revision" into "0 differences."** A comparison against a ref that
  does not exist reported *"0 of 132 files differ"* — which read as proof of a hypothesis that
  was in fact false. Verify refs with `git rev-parse --verify` first.
- **Unquoted URLs glob.** `gh api "...?ref=master"` needs the quotes; unquoted, zsh fails with
  `no matches found`.
- **`grep` here is ugrep**, which rejects some ERE alternations with escaped parens and returns a
  false 0 rather than an error. POSIX ERE `\s` is a literal `s`. Use `-P`.
- **Before reporting any count as 0, prove the probe returns non-zero on a known positive.**

---

## 8. Honest limits of this document

The four analyses behind §§1–5 were produced by parallel agents; their **adversarial verification
pass did not run** (session limit). I independently re-verified the load-bearing claims — the
ungated-file counts, the `findPerRuleRegressions` skip, the `any` root-set collapse, the branch
topology, the merge dry run, and the corrected NUC distribution.

**That spot-check already caught one false claim**: the analysis reported `ElementalProperties`
as "declared twice"; it is declared **12 times**, with at least four variants disagreeing on the
index signature (Tranche 3). Assume other unverified specifics carry similar error — re-measure
before acting on any single number below, and treat the following as single-sourced:

- The **A/B/C 40–50%** split for `no-unnecessary-condition` rests on n=35 hand-classified sites
  (±16pp), and **no guard was red-proved** by actually removing it and observing a failure.
- The **~400 floor** is an estimate assembled from several per-rule estimates, not a measurement.
- The **51 "scripts touching the production DB"** is a text match on
  `executeQuery|DATABASE_URL|DATABASE_PUBLIC_URL`; it does not distinguish readers from writers.
- Route-level zod adoption measured **21** with one probe and **36** with another. Both are in
  this document because the disagreement is real and unresolved; build the Tranche 1 inventory
  from the 122 body-reading routes rather than trusting either.
- Effort figures in hours are unanchored order-of-magnitude guesses with no baseline from this
  team's actual throughput.
