# Next Session: Phase 27 — Finish the boundaries, and stop chasing the lever that isn't there

> **Numbering note.** The previous copy of this file described Phase 26 as upcoming. Phase 26
> shipped as PR #835 (`refactor/phase-26-close-ungated-surface`, merged into master at
> `e98c46cb`) plus the faucet work in #836. This document is Phase 27.
>
> | Metric | P23 | P24 | P25 | P26 (master) | P27 (today) |
> |---|---:|---:|---:|---:|---:|
> | Tracked lint debt | 2,630 | 1,944 | 1,635 | 1,520 | **1,518** |
> | Declined pool | 6,236 | 4,911 | 4,910 | 4,910 | 4,910 |
> | Casts (gated) | 252 | 169 | 169 | 168 | **168** (`untrackedSingleAsT` 2,029 → 2,024) |
> | Assertion sites (AST) | 4,357 | 3,398 | 3,396 | 3,353 | **3,346** |
> | `prefer-nullish-coalescing` sub-baseline | 294 | 214 | 214 | 214 | 214 |
> | `exactOptionalPropertyTypes` strict-index | — | — | 674 / 329 files | 671 / 328 files | **670 / 327 files** |
>
> Every number above was re-measured on 2026-09-09 against a live `eslint --config
> eslint.config.audit.mjs src` run and reproduces `.lint-debt-baseline.json` exactly, **once the
> 29 stale files in §0 are excluded**. The audited rule set has been stable at 28 rules since
> Phase 12, so Phases 12–26 are like-for-like.

---

## 0. RESOLVED — and the gate that prevents recurrence

`/Users/cookingwithcastro/Desktop/WhatToEatNext-master` carried **29 untracked `.ts` files under
`src/`**. Every one of them was a module Phase 24 deleted in `381fb1fc` (#828). They were never
removed from disk, so they were inside `src/` — which is exactly the scan root of `bun run lint`,
`tsc`, `lint:debt` and `audit:dead-modules`.

**What they cost, measured:**

| probe | with them | without them | truth |
|---|---:|---:|---|
| `tsc --noEmit --incremental false` errors | **78** | **0** | typecheck is RED locally, GREEN on master |
| — of those, `TS2307 Cannot find module` | 8 | 0 | they import modules Phase 24 also deleted |
| audit-overlay warnings | 7,213 | 6,649 | **+564 phantom warnings** |
| — `no-unsafe-call` | 66 | 6 | 11× the entire real count |
| — `prefer-nullish-coalescing` | 313 | 214 | would read as a 99-warning regression |
| strict-index errors | 765 | 670 | +95 |

**Deleting them was provably lossless.** Each file's content was matched against git history:

- **12 of 29** were byte-identical to their blob at `381fb1fc^` — the version that was deleted.
- **17 of 29** were *older* than that: exact blobs from earlier commits. Two traced precisely —
  `src/utils/recipe/recipeUtils.ts` is the blob from `0877c82f` (2026-08-14) and
  `src/utils/elemental/transformations.ts` is from `70e53837` (2026-07-13).
- **0 of 29** contained anything absent from history (content match: `29 MATCH · 0 NOMATCH`). All 29 have been purged from disk.

**Permanent gate installed and red-proved.**
To prevent future untracked source files from poisoning gates, `scripts/checkUntrackedSourceFiles.ts` (and `scripts/lib/untrackedSourceFiles.ts`) is now wired as the very first step of `verify:static`:
- **Red-proved**: Dropping a throwaway `src/__gate_redproof__.ts` made `check:untracked` exit 1 with the file named; removing it exits 0.
- **Extended to `scripts/`**: While the initial draft filtered only `src/`, `scripts/tsconfig.json` includes `./**/*.ts`, meaning `check:scripts` and `lint:scripts` had the same exposure. The gate queries `git status --porcelain -uall src scripts` and filters both `src/` and `scripts/`.
- **Inert Finder duplicate check**: `src/app/discover/layout 2.tsx` on disk is gitignored (thus invisible to `check:untracked`), and was verified inert: `tsconfig` explicitly excludes `**/* 2.*` and ESLint ignores it.

---

## 1. What Phase 26 actually closed

Merged in #835 and #836. Cross off against the old plan:

| old item | status |
|---|---|
| **Phase 27 PR 1: §0 purge** | ✅ closed. 29 untracked dead modules purged from disk; content match verified (29 MATCH · 0 NOMATCH). |
| **Phase 27 PR 1: untracked source gate** | ✅ closed. `scripts/checkUntrackedSourceFiles.ts` wired as first check in `verify:static`. Red-proved (exit 1 / exit 0) and covers both `src/` and `scripts/`. |
| **Phase 27 PR 1: Tranche A (economy boundaries)** | ⚠️ **3 of 5 shipped.** `purchase`, `transmute`, and `practice` validated with `@/lib/validation/apiSchemas`. `shop/purchase` and `sync-event` remain. |
| **Tranche 0 — gate `scripts/**`** | ✅ `3a0c8b25`. `verify:static` now runs `check:scripts` (`tsc -p scripts/tsconfig.json`) and `lint:scripts` (`--max-warnings=25`). The 110 ungated script files are gated. |
| **The declined pool has no per-rule ratchet** | ✅ closed. `scripts/checkLintDebt.ts:241` now reads `new Set([...subBaselineRules])` — declined rules are no longer exempt. Only `prefer-nullish-coalescing` is, by design. Paying for 300 new `max-lines-per-function` with 300 deleted `no-void` no longer passes. |
| **`verify` ends in `test:fast` (19 suites)** | ✅ closed by `c1829a02` / `97fd3c99`. `verify` = `verify:static && test` (336 suites / 3,589 tests). CI runs `verify:static` because its Test leg runs the suite in parallel. Cost of closing the blind spot: 5.2s. |
| **boundaryNetwork's 24 dead tuple checks** | ✅ `aca0f1d0`. `noOverlapBooleanExpression` fell 50 → 24. |
| **11 singleton services → nullish-assignment** | ✅ `85a44ade`. |
| **Tranche 1 — route body validation** | ⚠️ **partial.** Batches 1A/1B/1C landed. `user/commensals` and `recipes/mint` — the two highest-risk routes named in the last document — now read `unknown` and `safeParse` against `@/lib/validation/apiSchemas`. **50 body-reading routes still have no schema.** See §3. |
| **`ElementalProperties` 12 declarations** | ❌ untouched — **and the plan for it was wrong.** See §2. |
| **Tranche 2 `.json()`, Tranche 3 NUC, Tranche 4 strict-index** | ❌ untouched. Re-scoped in §3. |

---

## 2. The finding that reorders Phase 27: the `ElementalProperties` lever is refuted

The last document called this "one high-leverage declaration fix" and predicted that removing the
`[key: string]: number` index signatures would make `no-unnecessary-condition` tell the truth —
`neverNullish` findings flipping from "delete the guard" to "the guard is required," at the price
of "a wave of new tsc errors; that is the point."

**It was measured today. The prediction is backwards.**

The structural claim held up exactly. There are **12 structural declarations** of
`ElementalProperties` and **172 import sites**; `@/types/alchemy` supplies **125 of them** and
inherits `[key: string]: number` from `RawElementalProperties` (`src/types/alchemy.ts:205`). 50
files both import the type and carry NUC findings, holding **169 of the 840**.

The experiment: drop the index signature from all three declaring modules
(`alchemy.ts`/`RawElementalProperties`, `recipe.ts`, `elemental.ts`), re-run the audit overlay
over those same 50 files, revert.

| | before | after | delta |
|---|---:|---:|---:|
| `no-unnecessary-condition` | 169 | **189** | **+20** |
| — `neverNullish` | 34 | **45** | **+11** |
| — `noOverlapBooleanExpression` | 6 | **15** | +9 |
| — `alwaysTruthy` / `alwaysFalsy` / `neverOptionalChain` | 59 / 44 / 25 | 59 / 44 / 25 | 0 |
| `no-unsafe-return` | 1 | **22** | +21 |
| `no-unsafe-assignment` | 2 | **21** | +19 |
| `tsc` errors (whole repo, excl. §0 files) | 0 | **57** | +57 |

Removing the index signature does not restore honest optionality — it removes the type that made
element access checkable at all, so those reads degrade toward `any`, and `any` makes the rule
fire *more*, not less. The change costs 57 real type errors and **adds 60 audit warnings**.

**Consequences for the plan:**

1. **Do not open Phase 27 with a declaration-reconciliation PR.** There is no 169-warning prize
   behind it. If the 12 declarations are consolidated, do it for coherence — one type, one
   meaning — and budget it as a refactor with a *negative* short-term lint return.
2. **`no-unnecessary-condition` has no cheap structural lever left.** The last document's own
   sample (n=35, ±16pp, no guard red-proved) is now the *only* evidence for the 40–50% "lying
   type" band, and the one structural hypothesis derived from it has been falsified. Treat 840 as
   840 individual decisions until someone produces a *measured* cluster.
3. **`src/utils/elementalMappings.ts:3` is a genuine naming collision, not a variant.** It
   declares `ElementalProperties` as an index signature *only* — no `Fire`/`Water`/`Earth`/`Air` —
   and its `elements` table stores `heat`, `_dryness`, `_transformation`, `_expansion`. It is a
   different concept wearing the same name. Rename it; that part is free.

---

## 3. Phase 27 prioritized plan

Ordered by measured leverage per unit of risk, highest first.

### Tranche A — finish inbound body validation (50 routes remaining, 2 of them on the money path)

This is the only tranche where the work prevents an incident rather than lowering a number.

```
257  route.ts files under src/app/api
122  read a request body
 78  import zod or @/lib/validation (+3 in PR 1)
 50  read a body with NO schema (down from 53)
```

Distribution of the 50: `admin` 9 · `user` 8 · `chat` 7 · `menu-planner` 3 ·
`account` 3 · **`economy` 2** · `quests` 2 · `amazon` 2 · `agents` 2 · 18 others with 1 each.

**PR 1 completed 3 of 5 economy routes:**
- `economy/purchase` ✅ validated with `EconomyPurchaseRequestSchema.safeParse(rawBody)`
- `economy/transmute` ✅ validated with `EconomyTransmuteRequestSchema.safeParse(rawBody)`
- `economy/practice` ✅ validated with `EconomyPracticeRequestSchema.safeParse(rawBody)`

**Finish PR 1 with the remaining two:**

| route | how it reads the body |
|---|---|
| `economy/shop/purchase` | `body = (await request.json()) as PurchaseRequestBody` |
| `economy/sync-event` | `body = (await req.json()) as SyncEventBody` |

⚠️ **Two of the economy routes carried no cast at all.** `request.json()` returns `Promise<any>`, so
`let body: {…}; body = await request.json();` was a silent unsound assignment — a declared type
with nothing behind it. **A cast-pattern grep cannot find these.** Build the inventory from the
122 body-reading routes, never from `) as`.

**Natural PR 2: 19 money/identity routes.**
After PR 1 closes the economy group, the next natural boundary is the 19 remaining money and identity routes: `user/charts` (`body = (await request.json()) as Record<string, unknown>`), `account/api-keys`, `account/billing/mcp-top-up`, `account/privy`, `quests/claim`, `user/identity`, etc.

The shipped pattern to copy is `src/app/api/user/commensals/route.ts:117-135`: `let rawBody:
unknown` → `await request.json()` in a try/catch → `Schema.safeParse(rawBody)` → 400 with
`error.flatten().fieldErrors`. Schemas live in `src/lib/validation/apiSchemas.ts`.

This is a **behavioural** change — malformed bodies start returning 400. Its own PR, its own
review. Ship the remaining 2 economy routes to complete PR 1 before touching the 19 money/identity routes in PR 2.

### Tranche B — the response side is now the larger half

| shape | count |
|---|---:|
| `.json()) as` **repo-wide** (response side dominates) | **236** |
| — inside `src/app/api` | 43 |
| `JSON.parse(...) as` | 69 |
| `readJson<T>` / `safeReadJson<T>` call sites | 25 |

**The helper already exists and is already the right shape.** `src/lib/api/json.ts` takes an
optional `parse` narrowing function — *"`parse` is the honest path: give it a narrowing function
and the result is checked rather than asserted"* — and falls back to `return body as T` only when
none is supplied. So there is nothing to build here. The work is **supplying `parse` at the call
sites that omit it**: of the 25, roughly **20 pass no parse function** and 4–5 already validate.

Start with `src/services/AlchemicalApiClient.ts` — **7 unvalidated `readJson<T>` calls in one
file**, all against the external alchm backend, all convertible in a single PR with one schema
module. Then `astrologizeApi.ts` (2), `natalChartService.ts`, `railwayUsageService.ts`,
`restaurantDiscoveryService.ts`, `githubTriageService.ts`, `mcpNetworkService.ts`.

Only after that is exhausted should anyone hand-edit the 236 raw `.json()) as` sites — many will
have been routed through the helper by then.

### Tranche C — `no-unnecessary-condition`, 840, with no shortcut

Re-measured distribution (2026-09-09, clean of §0), superseding the last document's table:

| messageId | P26 doc | today | note |
|---|---:|---:|---|
| `neverOptionalChain` | 262 | **258** | |
| `alwaysTruthy` | 231 | **223** | |
| `neverNullish` | 218 | **218** | |
| `alwaysFalsy` | 126 | **106** | |
| `noOverlapBooleanExpression` | 50 | **24** | boundaryNetwork fixed in P26 |
| `comparisonBetweenLiteralTypes` | 10 | **11** | |
| **total** | 897 | **840** | across **308 files** |

No file holds more than 13. The top 15 files hold 141 — 17% of the rule. There is no head to this
distribution; §2 removed the one hypothesised structural cause. **Schedule this as background
work behind Tranches A and B, one file per PR**, and require a red-proof (delete the guard, watch
a test fail) before any guard deletion. The recorded lesson stands: `no-unnecessary-condition` is
a trap, not cleanup, and `!` is never the fix.

### Tranche D — strict-index 671 is two populations; split the tranche

Measured today (`tsc -p tsconfig.strict-index.json`, clean of §0): **670 errors**, confirming the
671 baseline to within one.

| | codes | count |
|---|---|---:|
| **Genuinely `exactOptionalPropertyTypes`** | TS2375 369 · TS2379 129 · TS2412 28 | **526** |
| **Latent type errors wearing the label** | TS2322 54 · TS2345 29 · **TS2339 24** · TS2352 16 · TS2344 10 · TS2769 5 · TS7006 4 · TS2740 1 · TS1360 1 | **144** |

The 526 have one mechanical fix — omit the key rather than pass `undefined`
(`...(x === undefined ? {} : { x })`). The 144 are real bugs-in-waiting; the 24 TS2339 "property
does not exist" especially. **Fix the 144 first** — they are fewer, they are defects, and they do
not depend on the flag.

### Tranche E — dead exports inside live modules

The dead-module gate is module-granular; `UNREACHABLE: 0` says nothing about exports inside
surviving modules. Sized today:

```
6,674  exported symbol declarations in src/ (5,333 distinct names)
1,930  whose name appears in NO other file in src/
```

| kind | exported | no consumer | files |
|---|---:|---:|---:|
| interface | 1,555 | 687 | 339 |
| const | 1,905 | 482 | 201 |
| function | 2,504 | 478 | 198 |
| type | 624 | 258 | 115 |
| class | 69 | 16 | 14 |
| enum | 17 | 9 | 3 |

**976 are runtime-valued** (function/const/class) — the slice that is actual shipped dead code.
By area: `src/utils` 292 · `src/data` 215 · `src/lib` 162 · `src/services` 64 ·
`src/components` 40 · `src/app` **3** (so Next.js framework exports are not polluting the count).

Concentrations worth one PR each: `src/constants/typeDefaults.ts` 19 · `src/utils/lunarPhaseUtils.ts`
17 · `src/constants/chakraSymbols.ts` 15 · `src/utils/astrologyUtils.ts` 15 ·
`src/constants/defaults.ts` 14 · `src/utils/typeGuards.ts` 12 · `src/services/UnifiedScoringService.ts` 11.

⚠️ **This is an upper bound, not a delete list.** The probe asks "does this name appear anywhere
else in `src/`" — it does not resolve dynamic access, string-keyed registries, or the 35
`export * from` barrels. This repo's record has `export *` refuting a delete-as-dead claim **3
times out of 3**. Verify each symbol individually; the number is for sizing the tranche, not for
scripting it.

One clean sub-slice, already verified: **51 of the 120 exports in `src/lib/validation/apiSchemas.ts`
are `Parsed*` aliases** (`z.infer<typeof X>`) that nobody imports. Those are safe — but Tranche A
will consume some of them, so do Tranche A first.

### Not a Phase 27 tranche: the `any` root set

Unchanged from the last audit and still correct — leverage is ~2.2:1, the whole unsafe cluster is
**403 warnings** (`no-unsafe-assignment` 165 · `member-access` 162 · `argument` 51 · `return` 19 ·
`call` 6) over ~200 root decisions, and the largest single root collapses 9. Small single-concern
PRs, not sweeps. The one remaining consolidation is the `asPlanetaryPositions` copy-paste (~30
warnings behind one shared normaliser) — verify every call site first; see the sign-vector
cross-repo lesson.

---

## 4. Streamlining the site, as distinct from typing it

Type-safety tranches lower a number. These change what the site *is*. Sized, not yet planned:

- **976 runtime dead exports** (Tranche E) — the direct one.
- **Duplicate concept declarations.** `ElementalProperties` at 12 structural declarations is the
  worst, and §2 shows the fix is coherence work with no lint payoff. But the same shape recurs:
  27 cooking-method registries with 5 normalizers, 3 parallel dietary filters over 1 shared
  classifier, and a recommendation-services map where live and dead implementations sit side by
  side. Pick **one** concept per PR and land the consolidation end to end; a half-migrated concept
  is worse than two honest ones.
- **257 API routes against 79 pages.** Worth an inventory pass: which routes have no caller in
  `src/`? The Tranche E probe method applies directly to route paths and would answer it cheaply.
- The five economy routes in Tranche A are simultaneously a type-safety fix and a functional
  hardening — the highest-value overlap on the board. Start there.

---

## 5. Verification protocol (updated — this changed in Phase 26)

```bash
bun run verify         # verify:static + the FULL suite (336 suites / 3,589 tests)
bun run verify:static  # test:gates, strict-index:check, check:scripts, typecheck,
                       #   lint, lint:scripts, lint:debt, audit:dead-modules
bun run build
```

`verify` no longer has the `test:fast` blind spot — it runs the whole suite. CI calls
`verify:static` instead, because its Test leg runs the suite in a parallel job; running full
`verify` there would execute jest twice per PR and let a static-gate failure mask the test result.
Same coverage, split for independent signals. `test:fast` is inner-loop only and must not gate.

⚠️ `lint:debt` is a valid local witness only when the tree has **zero** untracked files (§0).

⚠️ `rm -f .eslintcache` before re-running lint to check a fix; `--cache-strategy content` has
failed to invalidate here.

⚠️ A pipeline's exit code is the last command's. `bun run typecheck 2>&1 | tail -20` reports
`tail`'s status. Use `set -o pipefail`.

⚠️ Renaming a CI matrix command blocks every merge with all jobs green — ruleset `20950461`
pins the required context by name.

---

## 6. What can still ship with every gate green

Phase 26 closed items 1 and 6 of the old list. What remains:

1. ~~Anything in `scripts/**`~~ — **closed** by Tranche 0.
2. **Dead exports inside live modules** — 976 runtime-valued, unmeasured by any gate (Tranche E).
3. **Test code asserting against properties production types do not have** — tests are excluded
   from `tsc` *and* from the two most common type errors. This is the exact shape of the recorded
   "schema change shipped before its 6 readers" incident.
4. **Deletion of a live runtime guard** — proven by Phase 25: removing the `sync-credit` /
   `sync-debit` / `swap` 400-guards left tsc, ESLint and the whole suite green.
5. **Retiring a warning with a suppression comment** — no directive-count axis. 4 such directives
   exist today, each with a written reason. A "drive it to zero" push creates the incentive.
6. ~~New unsafe warnings in ordinary development~~ — still true that `no-unsafe-*` lives only in
   `eslint.config.audit.mjs`, but `lint:debt` now ratchets every rule including the declined pool,
   so a regression is caught at the gate rather than at the aggregate.
7. **An unvalidated request body on a money route** — five of them today (Tranche A).

---

## 7. Measurement traps (carry-forward, plus three found writing this)

**New, from this session:**

- **A declared type with no cast is invisible to every cast probe.** `let body: {a: string};
  body = await request.json();` type-checks, lints clean under `bun run lint`, and asserts a shape
  nothing verified. Two of the five unvalidated economy routes are this shape.
- **Removing a lying type can make the lint worse.** §2: the index-signature removal was expected
  to retire `neverNullish` findings and instead added 11 of them plus 40 unsafe warnings. Always
  run the experiment on a scoped file list and revert; never plan a tranche on a predicted delta.
- **`grep --include='*.ts'` must be quoted.** Unquoted, zsh globs it against the cwd and the
  command dies with `no matches found` — which reads as a legitimate 0 in a pipeline ending in
  `wc -l`. Three probes in this session returned a confident false zero this way.
- **Unbalanced regex paren swallowed by `2>/dev/null` returns a false zero.** An unescaped or
  unbalanced paren in a regex (e.g. `(zod|@/lib/validation`) when redirected with `2>/dev/null`
  swallowed the syntax error and returned a confident `1` instead of erroring. Never suppress stderr
  on a count probe until syntax is verified.
- **`echo "$LIST" | xargs grep -l` collapses to 1 under zsh's no-word-split.** zsh does not split
  unquoted or quoted multi-line scalar strings into separate arguments for xargs across pipes,
  collapsing 122 files into 1 file scanned. Use arrays, `cat`, or `\n`-delimited streams.

**Carried forward:**

- **zsh does not word-split `"$VAR"`.** A variable holding a space-separated file list becomes one
  argument, matches nothing, reports 0. Use `$(cat file)` or an array.
- **`$REF:path` is a zsh history modifier.** Write `${REF}:path`.
- **`2>/dev/null` turns "bad revision" into "0 differences."** Verify refs with `git rev-parse --verify`.
- **`grep` here is ugrep**: POSIX ERE `\s` is a literal `s`, and some escaped-paren alternations
  return a false 0 rather than an error. Use `-P`.
- **`timeout` is not installed on this machine.** Background long probes instead.
- **`tsc -p` without `--incremental false` reports phantom errors.**
- **Before reporting any count as 0, prove the probe returns non-zero on a known positive.** The
  dead-export probe in Tranche E was validated this way: `AddCommensalRequestSchema` (known
  imported) correctly stayed out of the no-consumer set.

---

## 8. Honest limits of this document

Everything in §§0–3 was measured on 2026-09-09 in this checkout, and the headline lint numbers
reproduce `.lint-debt-baseline.json` exactly once §0's 29 files are excluded — which is itself the
strongest available evidence that the exclusion is correct.

Single-sourced or estimated, treat with suspicion:

- **Tranche E's 1,930 / 976** is a name-appearance probe, not a resolver. (It does have one
  control: two independently written implementations — an O(n²) pairwise scan and an
  inverted-index scan — agreed at **1,931 vs 1,930** with identical top files, so the count is at
  least reproducible.) It cannot see dynamic
  access or the 35 `export * from` barrels. A runtime-only re-pass counted **983** rather than 976
  — the 7-symbol gap is names declared as a type in one file and a value in another. Use the
  number to size the tranche; verify every symbol before deleting it.
- **The 40–50% "lying type" band for `no-unnecessary-condition`** rests on the previous session's
  n=35 hand classification (±16pp) and **no guard was ever red-proved**. §2 falsified the one
  structural hypothesis built on it. It should be re-derived, not inherited.
- **The ~400 achievable floor** is an assembly of per-rule estimates, not a measurement.
- **The §2 experiment covered the 50 EP-importing files with NUC findings**, not all 172 import
  sites; the tsc delta (+57) is repo-wide, the lint delta (+20/+40) is scoped to those 50. A
  repo-wide lint re-run would likely show a larger absolute increase, not a smaller one.
- **The three duplicate-concept examples in §4** (27 cooking-method registries / 5 normalizers,
  3 parallel dietary filters over 1 classifier, the live-vs-dead recommendation-services map) are
  **inherited from earlier audits and were not re-measured today.** Only the `ElementalProperties`
  count (12 declarations, 172 import sites) was. Re-measure before scoping any of them.
- **Effort estimates are absent from this document on purpose.** Previous ones were unanchored
  guesses with no baseline from this team's throughput.
