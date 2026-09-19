# Phase 37: Zero Strict Debt and High-Impact Boundary Validation

Implement this campaign end to end in the existing WhatToEatNext repository. Start with a short evidence-based plan, then proceed with implementation and verification; do not stop at a proposal. Use judgment for routine reversible decisions. Ask only when a missing requirement or permission genuinely blocks the dependent work, and continue independent work where possible.

## 1. Establish the actual starting state

Read the applicable repository guidance, `package.json`, the ratchet implementations, and `docs/PHASE_36_IMPLEMENTATION_REVIEW_AND_PHASE_37_PRIORITIES.md`. That report describes the implementation before subsequent closeout fixes; verify findings against current code rather than assuming they remain open.

At prompt preparation, the branch was `refactor/phase-36-typescript-burndown`, HEAD was `5c70e93ba3db1005ef04931150f59153c642aca6`, and Phase 36 plus its closeout changes were staged but uncommitted. This is a historical observation, not an instruction to restore that state.

- Record current branch, HEAD, staged/unstaged changes, and tool versions. Preserve inherited work and its staging. Do not discard, stash, or commit someone else's changes merely to obtain a clean baseline.
- Reuse an appropriate Phase 37 branch or create a dedicated `codex/phase-37-typescript-health` branch from the verified checkout, preserving the intended Phase 36 starting content. Do not start from an older clean checkout that omits the uncommitted closeout. Do not work on master.
- Distinguish inherited changes from your own in the final report. Claims such as committed, merged, shipped, and verified require separate evidence.
- Capture each compiler/check output once and reuse it for analysis. Preserve stdout, stderr, and exit status; do not use filtered `tsc | grep ... || true` output as proof of success.

These are reported starting values. Re-measure them once before editing and record discrepancies without relaxing targets or raising baselines:

| Metric | Reported starting value | Required outcome | Gate |
|---|---:|---:|---|
| Application strict-project diagnostics | 26 in 26 files | **0** | `strict-index:check` |
| Scripts diagnostics | 95 in 38 files | **≤70**; forecast 66 | `check:scripts` |
| Production bare JSON casts | 188; 197 including tests | **≤175**; stretch ≤165 | `check:bare-json` |
| Loose optionality | 392 AST sites | **≤350** | `lint:debt` |
| JSON-helper calls lacking a parser | 0 of 55 calls | **0**, with meaningful validation | `check:read-json` |
| Assertion sites | 3,260 total; 3,094 single; 605 non-null | No regression in enforced categories | `lint:debt` |
| Tracked / declined lint debt | 1,334 / 4,905 | No regression | `lint:debt` |
| Snapshot witness | Existing deterministic fixture | Exact parity; do not re-record | `check:snapshot-witness` |

Use checked-in baseline files and live scanner output for detailed counters rather than maintaining another copied rule inventory. `.read-json-baseline.json` still records 30 total calls: its ratchet only writes when unvalidated calls decrease. Record the live call count separately; do not interpret that stale metadata as a regression.

## 2. Verify the Phase 36 closeout before building on it

The current source is reported to include explicit commensal wire schemas, nullable social rewards, required quest reward fields, preserved empty strings, and 26 passing boundary tests. The focused suite passed when this prompt was prepared, but that does not certify the full application.

Run the repository's Jest entry point:

```sh
bun run test --runInBand src/lib/validation/__tests__/boundaryValidationSchemas.test.ts
```

Inspect the producer → schema → consumer contract for the four earlier findings:

- Commensal/group schemas reject primitives, null array elements, and missing consumed fields; no predicate-free `z.custom<T>()` replaces a real validator.
- A successful social save with `reward: null` is accepted and still updates the UI count without displaying a reward.
- Diary/database and extracted-recipe construction preserve legitimate empty strings, zero, and false while distinguishing absence from null.
- Tests use actual producer-shaped payloads and exercise rejection and relevant consumer recovery, not just successful schema parsing.

If these are already correct, retain them and proceed. Fix any reproduced remaining defect as a prerequisite. Do not weaken schemas or edit the producer merely to make an invented fixture pass.

## 3. Implementation workstreams

### A. Eliminate application strict debt

Resolve all diagnostics from `tsconfig.strict-index.json`. Group work around profile/state, wire-to-domain adapters, and recommendation construction. Locations from the earlier review are navigation hints; obtain current diagnostics and line numbers.

Pay particular attention to:

- `src/app/api/user/profile/route.ts`: validate and normalize the profile patch instead of asserting a generic record is a natal chart.
- `src/utils/ingredientRecommender.ts`: reconcile the actual aspect representation rather than asserting an incompatible `aspectType` shape.
- `src/utils/cookingMethodRecommender.ts`: map the authored thermodynamics representation without fabricating entropy/reactivity.
- `src/lib/menu-planner/schemas.ts`: separate inferred wire optionality from exact domain construction.
- Profile pages/dashboards, `UserContext`, `useProfile`, `useAstrologicalState`, `useTokenEconomy`, Instacart adapters, table composition, and recipe/ingredient indexes.

Target zero in the existing strict project. Do not promote `exactOptionalPropertyTypes` into the base tsconfig during this campaign: scripts inherit that configuration and promotion changes their diagnostic scope. Report a promotion recommendation separately after measuring its implications if needed.

### B. Validate high-impact response families

The required candidate set has **13 direct cast sites**, forecasting 188 → 175:

| Candidate | Reported sites |
|---|---:|
| `src/contexts/UserContext/index.tsx` | 3 |
| `src/app/(alchm)/shop/page.tsx` | 4 |
| `src/services/InstacartService.ts` | 3 |
| `src/hooks/useTableChat.ts` | 3 |

`useTableChat` supplies the three sites missing from the original ten-site plan. Re-measure before committing to that forecast. Stretch candidates are `useNotifications.ts` (7) and the feed page (6); completing both after the core set would forecast 162, exceeding the ≤165 stretch target.

For each response family, inventory the producer/serializer, callers, HTTP statuses, success/error variants, and every consumed nested field. Use validated `readJson` calls with reusable browser-safe wire schemas. Require success data when the producer guarantees it; model errors separately. Respect nullable fields, legitimate empty arrays, non-JSON error bodies, unknown-key policy, existing status-specific messages, and partial-failure behavior.

Add representative success fixtures, missing/wrong-field rejection cases, and focused consumer tests for material behavior changes. Include grouped or indirect JSON reads in the boundary inventory even when the bare-cast scanner does not count them. Track direct casts removed and response reads meaningfully validated as separate measures.

### C. Reduce scripts debt by operational risk

These six clusters contain 29 reported diagnostics; resolving all forecasts 95 → 66. **≤70 is the acceptance ceiling; 66 is the expected result of clearing the full candidate set.**

| Script | Reported diagnostics |
|---|---:|
| `measureFullChartScale.ts` | 7 |
| `snapshotAgentMonica.ts` | 5 |
| `measureSacred7Distributions.ts` | 4 |
| `backfillHumanNatalPositions.ts` | 4 |
| `backfillSignupGrants.ts` | 4 |
| `reattributeChefFeedEvents.ts` | 5 |

Prioritize write invariants and aggregate correctness. Use offline mocks/fixtures for missing rows, empty/singleton/normal samples, and genuine zero values. Preserve write refusals, dry-run behavior, transaction/idempotency guarantees, and client cleanup on every exit path. Runtime guards must narrow the values actually accessed; an array-length check alone may not establish that proof.

### D. Tighten optionality with its consumers

Inventory affected callers and serializers before tightening `src/types/natalChart.ts` (12 reported sites) and `src/types/table.ts` (30). Together they provide exactly 42 counted sites, forecasting 392 → 350 with no margin. `src/types/chat.ts` (21) is a reserve candidate if live counts or semantic constraints leave a shortfall.

Implement each type change with its constructors, adapters, and material regression tests. Treat these as coupled domain changes, not single-file replacements. Do not remove an intentional undefined state solely to reduce the count; explain the contract and choose another valid site if needed.

**Dependency order:** verify closeout first; inventory A/B/D together; complete optionality changes with affected callers before declaring the final zero-strict milestone. Scripts are largely independent. A temporary local intermediate state is not a reason to ratchet a regression into the baseline.

## 4. Invariants and scope boundaries

- Fix the producing value, call site, or explicit domain adapter. Do not widen domain types to `any`, `unknown`, `| undefined`, or arbitrary records to silence diagnostics. No new unchecked/double/non-null assertions used as substitutes for proof.
- Preserve meaningful falsy values. Use `!== undefined` or `!= null` according to the actual contract, not truthiness. Preserve patch/merge/clear semantics and property-presence behavior.
- Use strict numeric validation for ephemeris coordinates; do not coerce numeric strings or manufacture physical values.
- No synthetic defaults for missing required SQL rows, aggregates, or samples. Distinguish a legitimate zero or intentionally empty result from missing evidence.
- Preserve compiler settings, scanner coverage, allowlists, exclusions, and suppressions. Do not relocate debt or loosen a gate to reach a target. Update baselines only with their ratchet commands.
- Keep existing behavior for valid inputs. Reject invalid boundary data deliberately and test the recovery path. Snapshot equality is evidence for its covered calculations, not universal behavioral parity.
- This is repository implementation work. Production mutations, deployment, auth-flag changes, unrelated dependency upgrades, and session monitoring are outside scope. Do not push or publish merely to produce a closeout report.

## 5. Verification and completion

Use focused checks during implementation; avoid repeatedly compiling the entire scripts project for individual files. Resolve issues caused by this campaign. Identify pre-existing or environment-blocked failures separately and retain their evidence.

At closeout, measure targets explicitly, inspect per-file deltas, then ratchet actual reductions using the package's `*:ratchet` commands. A passing old ceiling is not proof that a Phase 37 target was met.

On the final code and baseline state, run each of these once, collecting stdout, stderr, exit code, and log paths; rerun affected checks if subsequent edits invalidate their results:

```sh
bun run verify:static
bun run test
bun run build
```

Run them as separate recorded steps so one failure does not hide the others. `test:fast` is only an inner-loop aid; use `bun run test` for Jest, not Bun's native `bun test` runner. Require natural full-suite completion. Do not claim success from printed test totals after killing a hung process or adding `--forceExit`.

The previous review found sandbox-related NFT subprocess failures that passed with the required local socket permission, plus a full-suite process that stayed open. Use the established approval path for genuine environment restrictions; do not bypass it. Reproduce and diagnose any remaining open handles before claiming a clean full-suite pass.

The previous build exited 0 but reported Privy/Farcaster and Reown/x402/viem dependency warnings. Record current warnings without assuming they are pre-existing or introducing broad dependency work. The size checker covers five configured routes and can pass with missing/unparseable rows: verify every configured row was actually found and parsed. Note changed client-bundle sizes; do not describe all application routes as budgeted.

Create `docs/PHASE_37_CLOSEOUT.md` containing:

- Starting and ending branch/HEAD, inherited changes, and whether the reviewed result is committed or still a working tree.
- Before/after/target metrics, per-file regressions (must be none), and the actual ratchet diff.
- Response contracts covered and positive, negative, and recovery evidence.
- Exact verification commands/results, warnings, skipped checks, and unresolved issues.
- Completed and remaining required work separately from stretch work.

Completion requires all required targets and verification criteria. If a genuine blocker remains, report the campaign as incomplete with a precise continuation plan; never substitute a relaxed baseline or “100% verified” label.

## 6. Historical auth context

`docs/handovers/session-persistence-status-2026-09-16.md` contains a separate auth/session handover. Its production flag state, PR status, fixed `authTime` witness, and milestone dates are dated observations, not live facts or instructions for this campaign. Do not inspect user sessions, change `AUTH_REVOCATION_CHECK`, or create monitors as part of Phase 37. Preserve this context for a separately scoped auth task.
