# Phase 36 TypeScript Burndown & Health Campaign

_Primary agent prompt for Next Session. Auth & Session Persistence status is archived to [docs/handovers/session-persistence-status-2026-09-16.md](docs/handovers/session-persistence-status-2026-09-16.md). Phase 35 is **100% COMPLETE & VERIFIED** on branch `refactor/phase-35-typescript-burndown`._

---

## 1. Verified Quality & Type Health Baselines (Post Phase 35 Close-Out)

Always re-measure before acting — never assume or inherit a number:

| Metric | Baseline | Honest Accounting / Breakdown | Verification Gate |
| :--- | :--- | :--- | :--- |
| **Strict-Index (`exactOptionalPropertyTypes`)** | **57** errors / 57 files | Reduced from 97 (−40 errors across 24 files): 100% construction/caller fixes, **0** domain widenings | `bun run strict-index:check` |
| **Scripts Typecheck** | **142** errors across 36 files | Down from 187 across 47 files (−45 errors); 11 script files cleared to 0 errors | `bun run check:scripts` |
| **Bare `res.json() as T` Casts** | **208** prod (217 total) across 133 files | Down from 211 (−3 boundary-validated); new AST gate wired into `verify:static` | `bun run check:bare-json` |
| **Loose Optionality (`?: T \| undefined`)** | **439** AST sites | Reduced from 462 (−23 properties eliminated in `recipeNutrition.ts`) | AST scan in `lint:debt` |
| **Single Assertion Sites (`assertionSites.single`)** | **3,116** sites | Down from 3,121 (−5 sites decreased) | AST `assertionSites` in `lint:debt` |
| **Total Assertion Sites** | **3,282** sites | Down from 3,287 (−5 sites decreased); Rule 8 relabelling blocked | AST scan in `lint:debt` |
| **Tracked Lint Debt** | **1,334** total across 9 tracked rules | ESLint Node API engine; all 28 audited rules passing without gate regressions | `bun run lint:debt` |
| &nbsp;&nbsp;↳ `@typescript-eslint/no-unnecessary-condition` | 832 | Pinned at baseline (defensive runtime checks preserved) | `bun run lint:debt` |
| &nbsp;&nbsp;↳ `@typescript-eslint/no-unsafe-assignment` | 135 | Flat | `bun run lint:debt` |
| &nbsp;&nbsp;↳ `@typescript-eslint/no-explicit-any` | 136 | Flat | `bun run lint:debt` |
| &nbsp;&nbsp;↳ `@typescript-eslint/no-unsafe-member-access` | 127 | Flat | `bun run lint:debt` |
| &nbsp;&nbsp;↳ `@typescript-eslint/no-unsafe-argument` | 47 | Flat | `bun run lint:debt` |
| &nbsp;&nbsp;↳ `sonarjs/no-useless-assignment` | 33 | Flat | `bun run lint:debt` |
| &nbsp;&nbsp;↳ `@typescript-eslint/no-unsafe-return` | 19 | Flat | `bun run lint:debt` |
| &nbsp;&nbsp;↳ `@typescript-eslint/no-unsafe-call` | 6 | Flat | `bun run lint:debt` |
| &nbsp;&nbsp;↳ `no-console` | **0** | Enforced with file-level disable ban outside 4 logger sinks | `bun run lint:debt` |
| **Nullish Coalescing (`prefer-nullish-coalescing`)** | **212** | Tracked as sub-baseline | `scripts/checkLintDebt.ts` |
| **Tracked Type Casts** | **167** | 38 `as any`, 129 `as unknown as`; 135 production | `bun run lint:debt` |
| **Non-Null Assertions (`!`)** | **605** | Enforced by hard gate; red-proof confirmed | AST scan in `lint:debt` |
| **File-Level `eslint-disable` Comments** | **5** hand-written (61 total) | Hard gate `scanFileLevelDisables` enforces `no-console` ban outside 4 sinks | Source / ESLint suppression scan |
| **Declined Rules** | **4,905** | Tracked and ratcheted | `bun run lint:debt` |
| **Behavioral Snapshot Witness** | **100% Parity** (0 deviations) | Re-recorded post PR #819/#831 and wired directly into `verify:static` | `bun run check:snapshot-witness` |
| **Full Jest Test Suite** | **385 passed / 385 total** | 3,983 tests passed, 0 failures (10 skipped) | `bun run test` |
| **Production Build (`bun run build`)** | **0 errors, 0 warnings** | All routes within bundle budgets | `bun run build` |

---

## 2. Phase 35 Accomplishments (Shipped & Audited)

1. **Strict-Index Burndown (57 errors / 57 files)**:
   - Reduced from 97 to 57 errors (−40 reduction across 24 files), beating the target of ≤65.
   - 100% caller/construction fixes; **0 domain widenings** to `T | undefined`.
   - Restored declared `viem/chains` with `withTestnet` normalizer on `/account` and `/shop`.
   - Prevented `cookingOptimization` leak in `adaptRecipeToMonicaOptimized`.
   - Preserved full passthrough on Zod `.passthrough()` recipes in `batchEnrichment.ts`.
2. **Scripts Typecheck Burndown (142 errors / 36 files)**:
   - Reduced from 187 to 142 errors (−45 reduction across 11 files), beating the target of ≤150.
   - Cleaned up typing in `scripts/verify-recipe-generation.ts`, `scripts/lib/lintDebt.ts`, `scripts/sync-agents.ts`, and `scripts/snapshot-witness.ts`.
3. **Remote Boundary Validation & Astrologize Schema Consolidation**:
   - Consolidated 5 duplicate `AstrologizeResponse` interfaces into canonical `AstrologizeResponseSchema` in `src/lib/validation/astrologySchemas.ts`.
   - Replaced bare `res.json() as AstrologizeResponse` with validated `readJson(...)` calls in `astrologizeApi.ts` and `provider.tsx`.
   - Created AST scanner `scripts/checkBareJsonCasts.ts` and `.bare-json-casts-baseline.json` (208 production / 217 total calls), wired into `verify:static`.
   - Refactored `provider.tsx` extraction logic to module scope to keep `max-lines-per-function` ≤ 50 lines.
4. **Loose Optionality Elimination (462 → 439 sites)**:
   - Cleaned up all 23 loose optional properties (`?: number | undefined`) in `NormalizedRecipeNutrition` (`src/utils/recipeNutrition.ts`).
   - Ratcheted AST loose optionality down to 439 sites.
5. **Quality & Gate Hardening**:
   - Pinned golden `contentHash` (`0x2930f8de...`) in `recipeNftContentCommitment.test.ts`.
   - Wired `bun scripts/snapshot-witness.ts` into `verify:static`.
   - Added `--file <filePath>` to `scripts/checkStrictIndex.ts` for instant per-file audits.
   - Decreased single assertion sites by 5 (down to 3,116).

---

## 3. Campaign Priorities & Execution Order (Phase 36)

### Priority 1: Exact-Optional Property Burndown (57 → ≤35) (P1)
- Target strict-index errors down from 57 to ≤35 (−22 errors).
- **Strict Rule:** Fix caller/construction sites with conditional spreads or property omissions. 0 additions to loose optionality (`?: T | undefined`).
- Every ratchet report must disclose the split: `N construction/caller fixes vs M widenings`.

### Priority 2: Scripts Typecheck Burndown (142 → ≤100) (P2)
- Target scripts typecheck down from 142 to ≤100 (−42 errors).
- Focus on remaining script error clusters: `scripts/curatedDescriptions.ts`, `scripts/backfillAgentMonica.ts`, and data migration scripts.
- **Rule:** Never use silent fallback values (`?? 0` or `?? fallback`) on SQL aggregate counts or sample arrays. Throw explicitly on missing rows (`if (!row) throw new Error(...)`).

### Priority 3: Remote Boundary Validation over Assertions (208 → ≤190) (P3)
- Continue auditing and replacing bare `res.json() as T` / `(await res.json()) as T` calls in `src/` using `readJson` with Zod validation.
- Target reducing bare JSON casts from 208 down to ≤190.
- Burn down `unsafe-*` debt (135 assignment, 127 member access, 47 argument, 19 return, 6 call).

### Priority 4: Loose-Optionality Ratchet Reduction (439 → ≤400) (P4)
- Audit legacy `?: T | undefined` declarations in domain models and replace with clean optional properties (`?: T`).
- Ratchet down `.lint-debt-baseline.json` loose optionality from 439 to ≤400.

---

## 4. Operational Caveats & Anti-Patterns (DO NOT DO)

- ⚠️ **DO NOT replace runtime validation with `as T` at unvalidated boundaries.** Always validate external data using strict Zod schemas without loose coercion.
- ⚠️ **DO NOT use `z.coerce` on numeric ephemeris coordinates.** Upstream Swiss-Ephemeris floats must be strict numbers; string-encoded numbers conceal upstream contract deviations.
- ⚠️ **DO NOT use truthy conditional spreads where falsy values are valid.** `...(x ? { x } : {})` drops intentional `0`, `""`, and `false`. Use `x !== undefined ? { x } : {}`.
- ⚠️ **DO NOT use silent defaults (`?? 0` or `?? fallback`) on database counts or sample arrays in scripts.** Throw an explicit Error if an aggregate or sample returns 0 rows, preventing corrupted state from appearing converged.
- ⚠️ **DO NOT wipe re-exported constants when mocking modules in Jest.** When mocking `@/utils/serverPlanetaryCalculations`, use `jest.requireActual` so re-exported constants (like `PRICED_BODIES`) remain defined.
- ⚠️ **DO NOT replace Error objects with `err.message` in loggers.** Always pass the complete error object (`logger.error("action failed", err)`).
- ⚠️ **DO NOT work directly on `master`.** All work must be carried out on dedicated feature/chore branches.
- ⚠️ **DO NOT trust local `verify` as identical to CI.** CI executes clean fresh checkouts without local cache artifacts. Verify commits on the open PR branch.

---

## 5. Session Persistence Tail (Context & Watch Items)

Full details are documented in [docs/handovers/session-persistence-status-2026-09-16.md](docs/handovers/session-persistence-status-2026-09-16.md). PR #852 is **MERGED** (`39a56d78465d4ffd4667e91b93ae1cef530d11a2`).

1. **Production Revocation Flag (`AUTH_REVOCATION_CHECK`)**:
   - `AUTH_REVOCATION_CHECK` remains **unset** in production environment variables.
   - ⚠️ *Ordering Trap:* Missing `device_sessions` rows count as revoked. Audit missing rows before enabling the flag to avoid inadvertent logouts of legitimate users.
2. **Live Browser Witness (`authTime`)**:
   - Inspect `https://alchm.kitchen/api/auth/session` on pre-merge sessions to witness `"authTime": 1789504380`. Fresh sign-ins yield updated timestamps.
3. **Upcoming Milestone Dates**:
   - **2026-09-22T20:33:00Z**: Review date for 7-day idle session timeouts (telemetry verification required).
   - **2026-10-15T20:33:00Z**: Hard deadline when all pre-policy legacy sessions expire simultaneously.
