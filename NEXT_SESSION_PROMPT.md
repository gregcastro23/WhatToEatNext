# Phase 38: Honest Boundaries, Real Budgets, and a Metric That Means Something

Implement this campaign end to end in the existing WhatToEatNext repository. Start with a short evidence-based plan, then implement and verify; do not stop at a proposal. Use judgment for routine reversible decisions. Ask only when a missing requirement or permission genuinely blocks dependent work, and continue independent work meanwhile.

## 1. Starting state (measured 2026-09-20, re-measure before editing)

Phase 37 is completed, merged with `origin/master` (`22d98b5d`), and committed as `a09c947d` on `codex/phase-37-typescript-health`. The working tree is clean at hand-off. **The branch is ready for push and PR creation.**

Commit history on `codex/phase-37-typescript-health`:
- `1d4c597e`: `feat(phase-37): zero strict debt, runtime boundary validation, and defect fixes`
- `f2406a69`: `fix(commensal): remove fabricated Fire element fallback in CompanionCard` (resolved P1)
- `a09c947d`: `Merge remote-tracking branch 'origin/master' into codex/phase-37-typescript-health`

The merge base with `origin/master` is `22d98b5d`, and the true PR delta is verified:
- `git diff origin/master HEAD --stat` = **64 files changed, 1,749 insertions(+), 397 deletions(-)**.
- All 7 merge conflicts were cleanly resolved: commensal schemas and tests take the branch side (deliberately superseding master's #862 test to support 71/79 legacy database charts lacking modern alchemical fields), and all 4 baselines were re-ratcheted to measured Phase 37 values.

Verified gate state on `a09c947d` (each re-run independently):

| Gate | Value | Required outcome (Phase 37) | Status |
|---|---:|---|---|
| `strict-index:check` | 0 errors / 0 files | 0 | Met (Zero Debt) |
| `check:scripts` | 66 across 32 files | ≤70 | Met (-29 errors) |
| `check:bare-json` | 162 prod (171 total), 122 files | ≤175, stretch ≤165 | Met (Stretch Exceeded) |
| `check:read-json` | 0 unvalidated / 81 calls | 0 unvalidated | Met (100% Compliant) |
| `check:snapshot-witness` | 100% parity, fixture untouched | exact parity | Met (Exact Parity) |
| `lint:debt` | 1,333 tracked / 4,904 declined | no regression | Met (-1 debt, -1 pool) |
| Loose optionality | **365 sites** | **≤350** | **MISSED by 15** |
| `bun run test` | 389 suites / 4,038 passed, exit 0 | natural clean completion | **Passed with a force-exited worker** |
| `bun run build` | exit 0, 5 configured routes parsed | budgets met, warnings recorded | Met; 3 dependency warnings recorded |

## 2. Prerequisite: the force-exited Jest worker

**P1 (fabricated element in commensal list)** was resolved in `f2406a69`: `CommensalManager.tsx` now conditionally renders the element pill and avoids defaulting absent elements to "Fire", preserving honest unknown states for legacy charts.

**P2 — the force-exited Jest worker** remains open as the primary prerequisite before feature work:
- `bun run test` still ends with:
  ```
  A worker process has failed to exit gracefully and has been force exited. This is likely caused by tests leaking due to improper teardown. Try running with --detectOpenHandles to find leaks. Active timers can also cause this, ensure that .unref() was called on them.
  ```
- Diagnose it with `--detectOpenHandles` (suspect unclosed pg pools in database service tests and un-`unref`'d timers in integration/spacetime mocks).
- Fix the teardown hooks in the offending test suites and require a natural worker exit. Do not add `--forceExit`.

## 3. Workstreams

### A. Make loose optionality a metric that means something

The ≤350 target was missed at 365, and the remaining sites are concentrated in types where `| undefined` is **correct**:

| File | Sites | Nature |
|---|---:|---|
| `src/types/yelp.ts` | 23 | external API DTO |
| `src/types/chat.ts` | 21 | wire + domain, mixed |
| `src/services/restaurantDiscoveryService.ts` | 21 | external API consumer |
| `src/lib/api/alchmClientTypes.ts` | 19 | API client DTO |
| `src/types/menuPlanner.ts`, `src/types/recipe.ts`, `src/utils/menuPlanner/recommendationBridge.ts` | 15 each | mixed |

Zod 4.4.3 outputs `T | undefined` for `.optional()`, which cannot be assigned to a tightened `?: T` under `exactOptionalPropertyTypes` without a cast — verified. So tightening a wire type forces either an `as` (which hides defects; it hid the `actorRevealed` strip in Phase 37) or an adapter.

Required: classify wire-facing types separately in `scanLooseOptionality`, report domain and wire counts as distinct numbers, and set the target on the **domain** count only. Then split the two largest mixed types (`chat.ts`, `recipe.ts`) into `XWire` (from `z.output`) plus a domain type joined by one adapter. Do not tighten a type to move a counter.

### B. Element-level tolerance for list responses

Verified: one unknown notification `type` rejects the **entire** notification list, blanking the bell. `NOTIFICATION_TYPES` in `src/lib/validation/notificationResponseSchemas.ts` is a third hand-copy of the DB enum, so a database-first `ALTER TYPE … ADD VALUE` breaks the client until it ships.

Add a `parseEach` helper beside `readJson` in `src/lib/api/json.ts`: validate list items individually, keep the valid ones, count the dropped, report once per response via `_logger.error` (`warn` is gated off in production). Apply it to notifications, feed, messages, agents and transactions. Keep all-or-nothing only where a partial result is meaningless.

Write-acknowledgement reads (purchase, settle, swap, send, mark-read) must not present a parse failure as a failed operation — the server already committed. Refetch canonical state instead.

### C. Producer-built round-trip tests for the remaining schema families

Only the feed schema currently has a producer-shaped round-trip test (D3 guard). For `userProfile`, `shop`, `instacart`, `chat` and `notification`, add per family:

1. A minimal fixture with every optional field omitted (catches the Zod-4 required-key class).
2. A maximal fixture built by the real producer mapping, asserting the parse output deep-equals the input. **This is the only check that catches a silently stripped key**, because no type check can: an optional key is allowed to be absent.
3. One consumer-recovery test for what the hook or page shows when validation fails.

### D. Real route budgets

The two heaviest routes are unbudgeted, and the budget on the third is too loose to catch a regression:

| Route | First load | Budget |
|---|---:|---|
| `/shop` | **907 kB** | none |
| `/account` | **898 kB** | none |
| `/menu-planner` | 799 kB | 950 kB (passes trivially) |

Add `/shop` and `/account` to `scripts/check-route-sizes.cjs`, set ceilings near current size so regressions fail, and reduce `/shop` — start with the wallet dependencies behind the three recorded build warnings (`@privy-io/react-auth` → `@farcaster/mini-app-solana`, `@reown/appkit` and `x402` critical-dependency expressions). Measure before and after; do not resolve a warning by installing an optional package the app never calls.

### E. Bare JSON casts: choose by surface, not by count

162 production casts remain across 122 files, with a maximum of 3 per file — a flat tail. Counter-grinding has no yield left. Pick by what the endpoint does: `src/app/api/planetary-positions/route.ts`, `src/utils/reliableAstronomy.ts`, `src/hooks/useConversation.ts`, `src/app/admin/*`. Report reads meaningfully validated as a separate number from casts removed.

### F. Two decisions to measure, not assume

- **Promoting `exactOptionalPropertyTypes` to the base tsconfig.** `strict-index:check` is now 0, so the strict project adds no signal over `typecheck` unless promoted. `scripts/tsconfig.json` inherits the base config, so promotion changes the scripts error universe (currently 66). Measure that number first, report it, and decide explicitly.
- **Production reachability for `audit:dead-modules`.** It treats `scripts/` as entry points, so `src/utils/ingredientRecommender.ts`, `src/utils/cookingMethodRecommender.ts` and `src/types/ExtendedRecipe.ts` count as reachable although nothing in `src/` outside their own tests references them; the snapshot witness is their only consumer. Add a production-root mode (app + middleware) and record the set before proposing any deletion.

## 4. Invariants

- Never fabricate a domain value to satisfy a type. A missing element, modality, constant or coordinate renders as unknown or is omitted.
- Fix the producing value, call site, or an explicit adapter. No new unchecked, double, or non-null assertions.
- Preserve meaningful falsy values; use `!== undefined` or `!= null` per the actual contract.
- Update baselines only through their ratchet commands, and only for measured reductions.
- Snapshot-witness parity is evidence for values, not key presence: `JSON.stringify` erases the difference between an absent key and `undefined`, which is exactly what optionality edits change. For those edits, compare a scratch copy of the witness that encodes `undefined` as a sentinel; never re-record the committed fixture.
- A schema is not evidence that it matches its producer. Build fixtures from the producer, and check every producer an endpoint has (`/api/user/profile` has two: the Hono proxy and the database path).

## 5. Verification and completion

On the final state, run each once, recording stdout, stderr and exit code separately:

```sh
bun run verify:static
bun run test
bun run build
```

Then write `docs/PHASE_38_CLOSEOUT.md` with:

- Starting and ending branch/HEAD, and whether the result is committed, pushed, or in a PR.
- Before/after/target per metric, with any missed target stated as missed, next to its number, in the same table.
- Quoted evidence copied from the actual command output or log file. Do not retype numbers into a summary: the Phase 37 chat walkthrough quoted route sizes that matched neither `.next-build.log` nor its own closeout document.
- Warnings, skipped checks, and unresolved issues.

If a target is missed, report the campaign as incomplete with a precise continuation plan. Never relabel a miss as met, and never relax a baseline to reach one.

## 6. Out of scope

Production mutations, deployment, auth-flag changes, and unrelated dependency upgrades. Read-only production queries for exposure counts are allowed and encouraged before changing a validation contract.
