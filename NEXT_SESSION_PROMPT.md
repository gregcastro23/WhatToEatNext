# Phase 42: Domain Loose Optionality (≤150), Bare JSON Casts (≤100), and Scripts Typecheck Hardening (≤20)

Implement this campaign end to end in the existing WhatToEatNext repository. Start with a short evidence-based plan, then implement and verify; do not stop at a proposal. Use judgment for routine reversible decisions. Ask only when a missing requirement or permission genuinely blocks dependent work, and continue independent work meanwhile.

---

## 1. Starting State (Phase 41, measured on `master` @ `98b81ead` + the Phase 41 diff, September 24, 2026)

Phase 41's full report is `docs/PHASE_41_CLOSEOUT.md`. Branch from `master` after Phase 41 merges, not from the Phase 41 branch. Phase 40 was squash-merged, and a branch cut from pre-squash commits carries them again.

| Gate | Measured | Baseline file |
|---|---:|---|
| Domain loose optionality | **170** (89 wire, allowlisted) | `.lint-debt-baseline.json` → `looseOptionality` |
| Bare JSON casts (`check:bare-json`) | **115 prod / 124 total**: 104 `res.json()` casts + 11 predicate-less `z.custom<T>()` | `.bare-json-casts-baseline.json` |
| Scripts typecheck errors (`check:scripts`) | **30 across 14 files** | `.scripts-typecheck-baseline.json` |
| Single assertion sites | **2,942** (3,106 total) | `.lint-debt-baseline.json` → `assertionSites` |
| Tracked lint debt | **1,308** | `.lint-debt-baseline.json` |
| Declined-rules pool | **4,877** | `.lint-debt-baseline.json` |

---

## 2. Rules Phase 41 learned the hard way

1. **A schema that checks nothing is still a cast.** `z.custom<T>()` with no
   predicate accepts every value. `check:bare-json` counts it, so rewriting a
   cast that way no longer lowers the number. Use a real `z.object` for the
   fields the reader uses.
2. **Drift-guard every response schema against its server type.** Use the
   pattern in `src/lib/validation/accountResponseSchemas.ts`:
   `type _X = AssertTrue<ServerSatisfies<ServerType, z.infer<typeof Schema>>>`.
   If the route builds its payload inline, first give the payload a named type
   and annotate `NextResponse.json<T>(…)` with it. Route files may not export
   extra names, so put the type in `src/types/` or the service.
3. **Match nullability exactly.** Two Phase 41 schemas used `.optional()` where
   the route sends `null` on its degrade path. That dropped the whole response
   (the `/profile/security` session list and the agent-sync chip). Read every
   return path of the route, not just the happy path.
4. **A failed parse must not degrade silently.** Show an error or keep the prior
   state honestly. A key that may have been minted, or a claim that may have
   settled, needs a message that says so.
5. **`check:diff-assertions` scans `src/` only.** Casts added under `scripts/`
   do not show up there, so review the scripts diff yourself. Bun's
   `import.meta.main`/`dir` are declared in `scripts/types/bun-import-meta.d.ts`;
   do not cast `import.meta`.
6. **Prove each type-only edit.** Compare the emitted JavaScript before and after
   (`ts.transpileModule`). For any file where it differs, read the change.

---

## 3. Recommended Scope for Phase 42

1. **Workstream A: Domain loose optionality (170 → ≤ 150).** Target the next
   high-density domain files: `src/utils/dayCircuitCalculations.ts`,
   `src/types/mealCircuit.ts`, `src/types/menuPlanner.ts`, and the calculation
   layers around them. Under `exactOptionalPropertyTypes`, dropping
   `| undefined` stops callers passing an explicit `undefined`. Check key-presence
   readers before switching an assignment to a conditional spread.
2. **Workstream B: Bare JSON (115 → ≤ 100).** Start with the 11 opaque
   `z.custom` sites in `useFoodDiary`, `useMealPlan`, `useTables`,
   `useChatInbox`, `CommentList`, `CommentComposer` and `PremiumContext`
   (see closeout §3). Then move to the client hooks and admin panels in
   `src/app/admin/_dashboard/` and `src/app/(alchm)/`. Follow rules 1–4.
3. **Workstream C: Assertion sites (2,942 → ≤ 2,900).** Typed accumulators and
   type-guarded unions across `src/data/` and `src/utils/`.
4. **Workstream D: Scripts typecheck (30 → ≤ 20).** Start with
   `generate-recipe-images.ts` (7), `generate-method-images.ts` (3) and
   `healConstitutionGeometry.ts` (3). No new `as unknown as`.
5. **Workstream E: Operator verification of ASOL webhook signatures.** Check the
   `/admin/asol` signature-audit metrics in shadow mode once ASOL deploys its
   signing headers.
