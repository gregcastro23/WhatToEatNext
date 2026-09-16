# Phase 33 TypeScript Burndown & Health Campaign

_Primary agent prompt for Next Session. Auth & Session Persistence status has been archived to [docs/handovers/session-persistence-status-2026-09-16.md](docs/handovers/session-persistence-status-2026-09-16.md). PR [#852](https://github.com/gregcastro23/WhatToEatNext/pull/852) addresses session cap gaps and is open against `master`._

---

## 1. Verified Quality & Type Health Baselines

Always re-measure before acting — never assume or inherit a number:

| Metric | Baseline | Verification Gate |
| :--- | :--- | :--- |
| **Strict-Index (`exactOptionalPropertyTypes`)** | **217** errors / 166 files (allowlist 0) | `bun run strict-index:check` |
| **Tracked Lint Debt** | **1,473** total across 9 tracked rules | `bun run lint:debt` |
| &nbsp;&nbsp;↳ `@typescript-eslint/no-unnecessary-condition` | 834 | `bun run lint:debt` |
| &nbsp;&nbsp;↳ `@typescript-eslint/no-unsafe-member-access` | 148 | `bun run lint:debt` |
| &nbsp;&nbsp;↳ `@typescript-eslint/no-unsafe-assignment` | 143 | `bun run lint:debt` |
| &nbsp;&nbsp;↳ `@typescript-eslint/no-explicit-any` | 140 | `bun run lint:debt` |
| &nbsp;&nbsp;↳ `no-console` | 102 | `bun run lint:debt` |
| &nbsp;&nbsp;↳ `@typescript-eslint/no-unsafe-argument` | 48 | `bun run lint:debt` |
| &nbsp;&nbsp;↳ `sonarjs/no-useless-assignment` | 33 | `bun run lint:debt` |
| &nbsp;&nbsp;↳ `@typescript-eslint/no-unsafe-return` | 19 | `bun run lint:debt` |
| &nbsp;&nbsp;↳ `@typescript-eslint/no-unsafe-call` | 6 | `bun run lint:debt` |
| **Nullish Coalescing (`prefer-nullish-coalescing`)** | **214** (tracked separately as sub-baseline) | `scripts/checkLintDebt.ts` |
| **Type Casts** | **167** (38 `as any`, 129 `as unknown as`; 135 production) | `bun run lint:debt` |
| **Non-Null Assertions (`!`)** | **605** | AST scan in `lint:debt` |
| **Scripts Typecheck** | **302** errors across 58 files | `bun run check:scripts` |
| **Declined Rules** | **4,906** (strictly pinned; no headroom) | `bun run lint:debt` |

---

## 2. Campaign Priorities & Execution Order

### Priority 1: Exact-Optional Property Burndown (217 → ≤160)
Candidate pools preserved in commit `36a6d3e7`:
- `src/app/api/` (58 diagnostics)
- `src/components/` (59 diagnostics)
- `src/utils/` (21 diagnostics)
- `src/components/menu-planner/` (10 diagnostics)

**Decision Rule:**
- Follow the `absent` vs `undefined` vs `null` decision table.
- Verify compiled JS emit parity via `ts.transpileModule` / JS diff before ratcheting.
- Run `bun run strict-index:ratchet` after each validated batch.

### Priority 2: Unsafe-* (364 total) + Explicit Any (140) + Casts
- Break down member access (148), assignments (143), arguments (48), returns (19), calls (6).
- Type boundaries properly rather than applying local casts.
- Note: `executeQuery` now defaults to `Record<string, unknown>`, so do not assume unsafe access comes solely from DB queries.

### Priority 3: Scripts Typecheck Burndown (302 → ≤250)
- Many scripts in `scripts/` touch the production database or run critical cron jobs with 0 type validation.
- Fix high-impact operational scripts first, ratcheting with `bun run check:scripts:ratchet`.

### Priority 4: `no-console` Burndown (102 → 0)
- Replace bare `console.log` / `console.error` with the structured logger (`createLogger` from `@/lib/logger` or `@/utils/logger`).

---

## 3. Operational Caveats & Anti-Patterns (DO NOT DO)

- ⚠️ **DO NOT treat the 834 `no-unnecessary-condition` warnings as mechanical cleanup.** Many flag live defensive runtime validation code as "always true" according to TypeScript's types. Stripping them or adding `!` suppresses the warning while breaking runtime resilience.
- ⚠️ **DO NOT mass-convert `||` to `??`.** Audits show only ~62% of `||` conversions are mechanical. Replacing `||` where empty strings (`""`) or zero (`0`) are valid falsy fallbacks introduces subtle behavior shifts.
- ⚠️ **DO NOT blindly delete a "lying" type.** Deleting an imprecise interface previously introduced 57 cascading `tsc` errors. Narrow interfaces incrementally.
- ⚠️ **DO NOT trust a clean `tsc` for cast removal.** Removing a cast can silently change emitted JavaScript. Always diff the transpile output for non-trivial refactors.
- ⚠️ **DO NOT run `tsc` without `--incremental false`.** Incremental builds cache stale error sets and report phantom diagnostics.
- ⚠️ **DO NOT assume test files are typechecked by default.** `tsconfig.json` excludes test files; test suites must be checked explicitly.
- ⚠️ **Finder Duplicates:** If a duplicate file like `.strict-index-baseline 2.json` appears untracked, delete it immediately before running metric baselines.

---

## 4. Session Persistence Tail (Context & Watch Items)

Full details are documented in [docs/handovers/session-persistence-status-2026-09-16.md](docs/handovers/session-persistence-status-2026-09-16.md).

1. **Production Revocation Flag (`AUTH_REVOCATION_CHECK`)**:
   - `AUTH_REVOCATION_CHECK` is currently **unset** in production. Revoked sessions linger until the 30-day cap expires.
   - ⚠️ *Ordering Trap:* Missing rows count as revoked. Audit missing `device_sessions` rows before enabling the flag to avoid logging out legitimate active users.
2. **Live Browser Witness (`authTime`)**:
   - Open `https://alchm.kitchen/api/auth/session` in a session from before 2026-09-16 12:03:22Z to witness `"authTime": 1789504380`.
   - Sign out and back in to witness a fresh Unix timestamp.
3. **Upcoming Milestone Dates**:
   - **2026-09-22T20:33:00Z**: Earliest review date for 7-day idle session timeouts (needs telemetry verification).
   - **2026-10-15T20:33:00Z**: Hard deadline instant when all pre-policy legacy sessions expire simultaneously.
