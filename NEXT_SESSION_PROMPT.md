# Next Session: Phase 25 — Test-Only Surface, Unsafe Rules & the Big Three

> **Status of Phase 24:** Complete and verified on branch `refactor/phase-24-dead-modules`
> (PR #828), branched from `refactor/phase-23-require-await` — which is **unmerged** and
> sits 4 commits ahead of `origin/master`. Phases 19–22 ARE merged, via #824–#827.
>
> | Commit | |
> |---|---|
> | `d8469333` | `feat(gates)`: dead-module reachability audit + repurpose the no-op strict-index gate |
> | `d2e344c0` | `fix(jest)`: anchor worktree ignore patterns to `<rootDir>` |
> | `2b2e3455` | `chore(scripts)`: register `audit:dead-modules` |
> | `84b75fc4` | `fix(audit)`: close two reachability gaps found by empirically deleting the set |
> | `631bb256` | `chore(dead-code)`: **delete 450 unreachable src/ modules (122,572 LOC)** |
> | `0e825fdb` | `chore(lint)`: ratchet baseline after the dead-module deletion |
> | `e9e1f45c` | `chore(gates,docs)`: ratchet strict-flags baseline and hand off Phase 25 |
>
> Substantive commits only. Later `docs:` commits on this branch are corrections
> to this file — self-referential, so they are deliberately not enumerated here
> (each one would invalidate its own count). **PR #828 is the authoritative
> list.**
>
> | Metric | Before (P23) | After (P24) | Δ |
> |---|---:|---:|---:|
> | Tracked lint debt | 2,630 | **1,944** | **−686 (−26%)** |
> | — `max-lines-per-function` | 2,094 | **1,593** | −501 |
> | — `explicit-function-return-type` | 1,747 | **1,374** | −373 |
> | — `no-unnecessary-condition` | 1,271 | **904** | −367 |
> | — `explicit-module-boundary-types` | 839 | **671** | −168 |
> | — `no-unsafe-assignment` | 267 | **206** | −61 |
> | — `no-unsafe-member-access` | 250 | **195** | −55 |
> | — `no-explicit-any` | 203 | **146** | −57 |
> | — `no-unsafe-argument` | 95 | **63** | −32 |
> | — `no-unsafe-return` | 53 | **23** | −30 |
> | — `no-unsafe-call` | 23 | **10** | −13 |
> | Cast surface | 252 | **169** | −83 |
> | — `as any` / `as unknown as` | 67 / 185 | **40 / 129** | −27 / −56 |
> | — Production / Test | 220 / 32 | **137 / 32** | −83 / 0 |
> | Assertion sites (AST) | 4,357 | **3,398** | −959 |
> | PNC sub-baseline | 294 | **214** | −80 |
> | Declined pool | 6,236 | **4,911** | −1,325 |
>
> Gates on the final tree: `typecheck` 0 errors · `bun run verify` green ·
> `strict-index:check` 807/402 → **674/329** (ratcheted by the deletion) ·
> full jest **333/333 suites, 3,497 passed** · `bun run build` exit 0, bundle
> thresholds green · `audit:dead-modules` **UNREACHABLE: 0**.

---

## 0. What Phase 24 established

### Tranche 1 — the audit is now a checked-in gate, not a one-off
`bun run audit:dead-modules` (`scripts/auditDeadModules.ts` + `scripts/lib/deadModules.ts`,
31 tests in `test:gates`). Built on the TypeScript compiler API, not regex, and models
every edge that has previously refuted a "this is dead" claim here: `export * from`
barrels, literal dynamic `import()`, `require()`, import-equals, tsconfig `paths`
aliases, Next.js App/Pages conventions, `middleware`/`instrumentation`,
**package.json script targets**, and **`.d.ts` declaration files**. Template-literal
imports are unresolvable, so everything under their literal prefix is pinned alive.

### ⚠️ The ordering lesson, now quantified
Phase 23's handoff flagged that ~41% of its de-async work landed on dead code. That
was understated. Deleting the dead set moved `as any` from 67 to **40** — past the
target of the dedicated cast-reduction tranche — and cut the whole `no-unsafe-*`
cluster by 191, **with zero manual edits and zero runtime risk**. Always run the
reachability sweep before any type-safety sweep.

### ⚠️ Two gates in `verify` were structurally incapable of failing
1. **`strict-index:check`** enforced `noUncheckedIndexedAccess`, which
   `tsconfig.json` has set since Phase 13 (`50b15d51`) and which
   `runStrictIndexCheck` *also* hardcodes. A full 8 GB whole-program build for
   zero signal over `typecheck`, at a permanent `0/0/[]` baseline. Now carries
   **`exactOptionalPropertyTypes`**, ratcheting down, red-proven (807→808 exits 1).
   Baselined at 807/402 before the dead-module deletion; the deletion ratcheted it
   to **674 errors / 329 files**. `scripts/lib/__tests__/tsconfigPins.test.ts`
   keeps the pin the old gate incidentally provided, and fails if the two configs
   ever agree again.
2. **jest** listed `"/.worktrees/"` and `"/.claude/"` as bare substrings, matched
   against absolute paths. Inside any worktree, `test:gates` and `verify`'s
   `test:fast` collected **zero tests and exited 0**. Anchored to `<rootDir>`;
   proven both directions (primary: 334 suites, 0 from worktrees; worktree: 333,
   all its own, was 0).

### ⚠️ `typecheck` cannot see broken `.d.ts` references
`tsconfig.json` sets `skipLibCheck: true`. A declaration file holding
`typeof import("@/utils/gone")` produces **zero** tsc errors after the target is
deleted — red-proven. `src/types/global-types.d.ts` had 5 such edges. Any future
deletion work must treat `.d.ts` as referrers; the audit now does.

---

## 1. Phase 25 Prioritized Plan

> **Deletion register:** every module removed by Phases 23–24 is accounted for
> individually in `docs/DELETED.md` (merged, #829), classified by whether any
> proposed functionality was lost. 11 of 459 were built by a real feature commit
> and never wired — 8 of them WTEN migration ports — and two entries
> (`environmentalResponseProfiles.ts`, `structured-logger.ts`) are flagged there
> as worth restoring rather than accepting. Read it before deleting anything else.

### Tranche 1: The 53 test-only modules (needs a human decision)
`audit:dead-modules` reports **53** modules that are production-unreachable but
imported by a test — `src/utils` 21, `src/services` 9, `src/calculations` 8,
`src/components` 5, `src/data` 5, `src/lib` 2, `src/types` 2, `src/hooks` 1.
Includes `src/calculations/index.ts`, `alchemicalCalculations.ts`,
`enhancedAlchemicalMatching.ts`, `RecipeBuilder.tsx`.

Each is one of: (a) genuinely dead, and its test should go with it; (b) a
regression suite for behaviour that *should* be wired up but is not. **Do not
bulk-delete these** — they carry the only executable specification of some
alchemical maths. Triage individually against `docs/physics/PHYSICS_QUANTITY_MAP.md`.

### Tranche 2: The Big Three — but check which pool each one is in first
⚠️ **Only one of these three counts toward tracked debt.** The other two sit in
the *declined* pool — rules the config deliberately does not enforce — so
clearing them moves the declined number and leaves `trackedTotal` untouched.

| Rule | Count | Pool | Clearing it moves |
|---|---:|---|---|
| `max-lines-per-function` | 1,593 | **declined** | declined pool only |
| `explicit-function-return-type` | 1,374 | **declined** | declined pool only |
| `no-unnecessary-condition` | 904 | **tracked** | **tracked debt (46% of the 1,944)** |

Together 3,871 of the 6,855 tracked + declined (56%). If the goal is the headline
tracked number, `no-unnecessary-condition` is the *only* one of the three that
touches it — and it is the hardest of the three. The first two are largely
mechanical but score against a different meter; decide which meter you are
moving before starting. See
`feedback_no_unnecessary_condition_is_not_cleanup`, and note its stated root cause
(`noUncheckedIndexedAccess: false`) is **stale**: the flag has been on since Phase 13
and 904 survived it. Re-derive the cause before planning a sweep, and never fix
with `!`.

### Tranche 3: Unsafe cluster (497 remaining)
`no-unsafe-assignment` 206, `no-unsafe-member-access` 195, `no-unsafe-argument` 63,
`no-unsafe-return` 23, `no-unsafe-call` 10. Now genuinely concentrated in live code,
so root-cause fixes (Zod boundaries from `clientSchemas.ts`, narrowing external
types) will stick rather than landing on doomed files.

### Tranche 4: `exactOptionalPropertyTypes` 674 → down
The repurposed strict-flags gate ratchets automatically on any improvement.
329 files. This is the newest debt axis and nothing has been spent on it yet.

---

## 2. Verification Protocol

```bash
bun run verify          # test:gates, strict-index:check, typecheck, lint, lint:debt, test:fast
CI=1 bun run test       # full suite — 333 suites / 3,497 tests
bun run build
bun run audit:dead-modules   # must stay at UNREACHABLE: 0
```

Worktrees now run their own tests correctly (`d2e344c0`) — the old
`--testPathIgnorePatterns` override incantations are no longer needed and should
not be reintroduced.

---

## 3. Standing Hazards

1. **The primary checkout is shared and moves under you.** It was on `main`
   (665 commits behind `master`) at the start of Phase 24 and on
   `refactor/phase-23-require-await` by the end — changed by another session.
   Always `git branch --show-current` before running anything there, and prefer
   an isolated worktree. Never `git add -A` in the primary checkout.
2. **Check `origin/master`, never the local `master` ref.** The local ref in this
   checkout was stale at `e0c2df85` (Phases 16–18) while `origin/master` had
   already advanced through Phase 22 (`a23f0d55`, #827). Reading the local ref
   made Phases 19–22 look unmerged and overstated this branch's range by 3
   commits. `git fetch origin master` before computing any range, or use
   `gh api` — and note `git fetch` can be blocked outright by a broken local ref.

   Actual state: Phases 19–22 merged (#824–#827); the DELETED register merged
   (#829); **outstanding** = Phase 23's 4 commits plus Phase 24's, both carried
   by PR #828 — read the count off the PR, not off this file, which cannot
   state a number that survives its own next edit.
3. **The scratchpad is wiped between sessions.** Long-running agents that read
   input files from it degrade *silently* rather than failing — two returned 1
   verdict instead of 32. Regenerate inputs deterministically and check result
   sizes before trusting them.
