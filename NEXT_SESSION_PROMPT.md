# Phase 34 TypeScript Burndown & Health Campaign

_Primary agent prompt for Next Session. Auth & Session Persistence status is archived to [docs/handovers/session-persistence-status-2026-09-16.md](docs/handovers/session-persistence-status-2026-09-16.md). PR #852 is **MERGED** (`39a56d78`). Phase 33 burndown is open in PR [#853](https://github.com/gregcastro23/WhatToEatNext/pull/853) on branch `chore/phase-33-burndown` (Status: PR #853, CI in progress; NOT complete until CI is green)._

---

## 1. Verified Quality & Type Health Baselines (Post Phase 33 Close-Out)

Always re-measure before acting — never assume or inherit a number:

| Metric | Baseline | Honest Accounting / Breakdown | Verification Gate |
| :--- | :--- | :--- | :--- |
| **Strict-Index (`exactOptionalPropertyTypes`)** | **133** errors / 117 files | Reverted from 217 (−84): ~77 from construction/parameter fixes, ~7 from domain type widenings | `bun run strict-index:check` |
| **Tracked Lint Debt** | **1,335** total across 9 tracked rules | Down from 1,473 (−138); all 28 audited rules passing without gate regressions | `bun run lint:debt` |
| &nbsp;&nbsp;↳ `@typescript-eslint/no-unnecessary-condition` | 832 | Pinned at baseline (defensive runtime checks preserved) | `bun run lint:debt` |
| &nbsp;&nbsp;↳ `@typescript-eslint/no-unsafe-assignment` | 135 | Down from 143 (−8) | `bun run lint:debt` |
| &nbsp;&nbsp;↳ `@typescript-eslint/no-explicit-any` | 136 | Down from 140 (−4) | `bun run lint:debt` |
| &nbsp;&nbsp;↳ `@typescript-eslint/no-unsafe-member-access` | 127 | Down from 148 (−21) | `bun run lint:debt` |
| &nbsp;&nbsp;↳ `@typescript-eslint/no-unsafe-argument` | 47 | Down from 48 (−1) | `bun run lint:debt` |
| &nbsp;&nbsp;↳ `sonarjs/no-useless-assignment` | 33 | Flat | `bun run lint:debt` |
| &nbsp;&nbsp;↳ `@typescript-eslint/no-unsafe-return` | 19 | Flat | `bun run lint:debt` |
| &nbsp;&nbsp;↳ `@typescript-eslint/no-unsafe-call` | 6 | Flat | `bun run lint:debt` |
| &nbsp;&nbsp;↳ `no-console` | **0** | 102 → 0: 74 migrated to `createLogger`, 4 exempted with reasons, 19 in legitimate sinks | `bun run lint:debt` |
| **Nullish Coalescing (`prefer-nullish-coalescing`)** | **212** | Down from 214 (tracked separately as sub-baseline) | `scripts/checkLintDebt.ts` |
| **Tracked Type Casts** | **167** | 38 `as any`, 129 `as unknown as`; 135 production | `bun run lint:debt` |
| **Untracked Single `as T` Casts** | **2,002** | Rose 1,997 → 2,002; honest ceiling must be ratcheted | AST scan in `lint:debt` |
| **Non-Null Assertions (`!`)** | **605** | Enforced by hard gate; red-proof confirmed (606 fails) | AST scan in `lint:debt` |
| **Total Assertion Sites** | **3,288** | Down from 3,293 baseline (Rule 8 relabelling blocked) | AST scan in `lint:debt` |
| **Loose Optionality (`?: T \| undefined`)** | **488** | Rose 427 → 530 before Phase 33 revert of CelestialPosition & profiler; currently 488 | AST / Grep scan |
| **File-Level `eslint-disable` Comments** | **60-65** | File-level `no-console` banned outside 4 sinks | Source scan |
| **Scripts Typecheck** | **246** errors across 55 files | Down from 302 across 58 files (−56); deviceB-verify & measureNormalisation hardened | `bun run check:scripts` |
| **Declined Rules** | **4,906** | Strictly pinned; no headroom | `bun run lint:debt` |

---

## 2. Campaign Priorities & Execution Order (Phase 34)

### Priority 1: Anti-Pattern Ratchets & Enforcement Gates (P1)
Turn Phase 33 anti-patterns into programmatic ratchets with end-to-end red-proof tests:
1. **Loose-Optionality Ratchet**:
   - Establish ceiling on `?: T | undefined` in tracked `src/` (currently 488).
   - Reject any PR that widens core domain interfaces instead of fixing construction/caller sites. Provide automated test with a red proof.
2. **File-Level `eslint-disable` Ratchet**:
   - Ceiling on file-level disables across `src/` (currently ~62).
   - Hard ban on file-level `/* eslint-disable no-console */` outside the 4 legitimate sinks (`src/utils/logger.ts`, `src/lib/logger.ts`, `src/services/LoggingService.ts`, `src/utils/clientLogger.ts`). Require per-line `-- reason` for exemptions.
3. **Untracked Single `as T` Ceiling**:
   - Enforce `untrackedSingleAsT` ceiling at **2,002** in `scripts/checkLintDebt.ts`, failing the build if untracked single casts increase.

### Priority 2: Remote Boundary Validation over Assertions (P2)
Eliminate unvalidated type escapes that hide runtime bugs:
1. **Zod Parsing at Ephemeris / Railway Boundary**:
   - `serverPlanetaryCalculations.ts:107`: Replace `(await response.json()) as BackendResponse` with a strict Zod schema parse (`calculatePlanetaryPositionsBackend`).
   - Feeds both ESMS debit and reward sides (`livePricing.ts`, `celestial.ts`).
2. **Systematic `res.json() as T` Remediation**:
   - Audit and replace bare `as T` casts across fetch calls with Zod validators.
   - This is the authentic mechanism to burn down unsafe-* debt (334 remaining: 135 assignment, 127 member access, 47 argument, 19 return, 6 call).

### Priority 3: Exact-Optional Property Burndown (133 → ≤100) (P2)
- Target strict-index errors down from 133 to ≤100.
- **Strict Rule:** A batch that merely adds `| undefined` or deletes type annotations does NOT count.
- Every ratchet report must disclose the split: `N construction/caller fixes vs M widenings`.

### Priority 4: Scripts Typecheck Burndown (246 → ≤200) (P2)
- Target scripts typecheck down from 246 to ≤200.
- Focus on production database and cron scripts first (`grep -E "DATABASE_URL|executeQuery" scripts/`).
- Never default missing CLI arguments to `0` or `""`; require explicit arguments and fail fast with exit code 1.

### Priority 5: Type Unification (P3)
- `src/types/celestial.ts` `ElementalProperties` gained `[key: string]: number` to drop 2 casts in `groupDynamics.ts`, duplicating `src/types/alchemy.ts:238`.
- Prefer a clean re-export of the canonical type from `alchemy.ts`.
- ⚠️ **DO NOT delete the canonical index signature** (`[key: string]: number` in `RawElementalProperties`), as that previously triggered 57 cascading `tsc` errors.

---

## 3. Operational Caveats & Anti-Patterns (DO NOT DO)

- ⚠️ **DO NOT replace runtime validation with `as T` at unvalidated boundaries.** As demonstrated by the Phase 33 pricing regression in `livePricing.ts` / `celestial.ts`, an `as RawBodyPosition` cast bypassed defensive checks, causing string degrees (`"15" + 1 === "151"`), `null` longitude pass-through, and runtime exceptions on numeric signs. Always validate or defensively coerce unvalidated external data.
- ⚠️ **DO NOT use truthy conditional spreads where falsy values are valid.** `...(x ? { x } : {})` drops intentional `0`, `""`, and `false`. In `food-lab/[entryId]/route.ts`, an in-memory fallback dropped the explicit `false` and kept stale tokens; in `stripe/webhook/route.ts`, absent keys were serialized as literal `null`. Use `x !== undefined ? { x } : {}` or explicit deletion.
- ⚠️ **DO NOT replace Error objects with `err.message` in loggers.** Stripping the error object loses stack traces in stdout, which is the primary alerting channel in production. Always pass the complete error object (`logger.error("action failed", err)`).
- ⚠️ **DO NOT default missing CLI script inputs.** Defaulting missing args in operational scripts (e.g. `args[0] ?? ""` in `deviceB-verify.ts` or quantile `?? 0` on empty samples) can trigger live reducers against real production states or fabricate data. Validate argument counts and fail fast with usage errors and `process.exit(1)`.
- ⚠️ **DO NOT work directly on `master`.** All work must be carried out on dedicated feature/chore branches (e.g. `chore/phase-33-burndown`). Never commit directly to `master`.
- ⚠️ **DO NOT trust local `verify` as identical to CI.** CI executes clean fresh checkouts without local cache artifacts. Verify commits on the open PR branch.

---

## 4. Session Persistence Tail (Context & Watch Items)

Full details are documented in [docs/handovers/session-persistence-status-2026-09-16.md](docs/handovers/session-persistence-status-2026-09-16.md). PR #852 is **MERGED** (`39a56d78465d4ffd4667e91b93ae1cef530d11a2`).

1. **Production Revocation Flag (`AUTH_REVOCATION_CHECK`)**:
   - `AUTH_REVOCATION_CHECK` remains **unset** in production environment variables.
   - ⚠️ *Ordering Trap:* Missing `device_sessions` rows count as revoked. Audit missing rows before enabling the flag to avoid inadvertent logouts of legitimate users.
2. **Live Browser Witness (`authTime`)**:
   - Inspect `https://alchm.kitchen/api/auth/session` on pre-merge sessions to witness `"authTime": 1789504380`. Fresh sign-ins yield updated timestamps.
3. **Upcoming Milestone Dates**:
   - **2026-09-22T20:33:00Z**: Review date for 7-day idle session timeouts (6 days out; telemetry verification required).
   - **2026-10-15T20:33:00Z**: Hard deadline when all pre-policy legacy sessions expire simultaneously.
