# Phase 35 TypeScript Burndown & Health Campaign

_Primary agent prompt for Next Session. Auth & Session Persistence status is archived to [docs/handovers/session-persistence-status-2026-09-16.md](docs/handovers/session-persistence-status-2026-09-16.md). Phase 34 is **100% COMPLETE & MERGED**: PR #854 (`4039a34f`), PR #855 (`7b5923e4`), PR #856 (`299d8fa2`), PR #857 (`1ef66b0a`), and PR #858 (`9e98bff8`)._

---

## 1. Verified Quality & Type Health Baselines (Post Phase 34 Close-Out)

Always re-measure before acting — never assume or inherit a number:

| Metric | Baseline | Honest Accounting / Breakdown | Verification Gate |
| :--- | :--- | :--- | :--- |
| **Strict-Index (`exactOptionalPropertyTypes`)** | **99** errors / 83 files | Reduced from 133 (−34 errors across 34 files): 100% construction/caller fixes, **0** domain widenings | `bun run strict-index:check` |
| **Scripts Typecheck** | **187** errors across 47 files | Down from 246 across 55 files (−59 errors); 6 script files reduced to 0 errors | `bun run check:scripts` |
| **Tracked Lint Debt** | **1,334** total across 9 tracked rules | Down from 1,335 (−1); all 28 audited rules passing without gate regressions | `bun run lint:debt` |
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
| **Single Assertion Sites (`assertionSites.single`)** | **3,121** | Down from 3,122 (−1) via AST scanner | AST `assertionSites` in `lint:debt` |
| **Total Assertion Sites** | **3,287** | Down from 3,288 (−1); Rule 8 relabelling blocked | AST scan in `lint:debt` |
| **Non-Null Assertions (`!`)** | **605** | Enforced by hard gate; red-proof confirmed | AST scan in `lint:debt` |
| **Loose Optionality (`?: T \| undefined`)** | **459** AST (488 regex) | Enforced by hard gate (`compareLooseOptionality`) | AST scan in `lint:debt` |
| **File-Level `eslint-disable` Comments** | **5** hand-written (61 total) | Hard gate `scanFileLevelDisables` enforces `no-console` ban outside 4 sinks | Source / ESLint suppression scan |
| **Declined Rules** | **4,905** | Down from 4,906 (−1) | `bun run lint:debt` |

---

## 2. Phase 34 Accomplishments (Shipped & Merged)

1. **Anti-Pattern Ratchets & Scanners (PR #854 / `4039a34f`)**:
   - Programmatic loose-optionality AST scanner (`compareLooseOptionality`) blocking domain widenings with red-proof test.
   - File-level disable scanner (`scanFileLevelDisables`) banning file-level `no-console` disables outside 4 legitimate sinks.
   - Suppression tracking integration with ESLint Node API.
   - Baseline JSON schema validation with sub-baselines.
2. **Ephemeris Boundary Strict Validation (PR #855 / `7b5923e4`)**:
   - Implemented strict Zod schema `backendPlanetaryPositionsSchema` in `src/utils/serverPlanetaryCalculations.ts` requiring all 10 `PRICED_BODIES` and validating lowercase signs.
   - Removed unsafe `as BackendResponse` casts and banned numeric-string degree coercion (`"15" + 1 === "151"`).
   - Added unit test suite `serverPlanetaryCalculations.test.ts` verifying rejection of partial bodies, uppercase signs, and string degrees with `backend-schema-invalid` status.
3. **Exact-Optional Property Burndown (PR #856 / `299d8fa2`)**:
   - Burned down `exactOptionalPropertyTypes` from 133 to **99** errors (-34 errors across 34 files) with **0** domain widenings.
   - Ratcheted `.strict-index-baseline.json` down to 99.
4. **Scripts Typecheck Burndown (PR #857 / `1ef66b0a`)**:
   - Burned down `scripts/**` typecheck errors from 246 to **187** (-59 errors across 47 files) under `scripts/tsconfig.json`.
   - Cleaned up array indexing and query row destructuring in `auditAgentDataIntegrity.ts`, `backfill-recipe-embeddings.ts`, `measureLnKalchmGap.ts`, `purgeFabricatedAscendants.ts`, `remeasureAfterKalchmFix.ts`, and `verify-spl-mirror-cluster.ts` (all 6 files at 0 errors).
   - Ratcheted `.scripts-typecheck-baseline.json` down to 187.
5. **Type Unification (PR #858 / `9e98bff8`)**:
   - Unified `ElementalProperties` by re-exporting canonical `ElementalProperties` from `src/types/alchemy.ts` in `src/types/celestial.ts`.
   - Preserved canonical string index signature (`[key: string]: number`).

---

## 3. Campaign Priorities & Execution Order (Phase 35)

### Priority 1: Exact-Optional Property Burndown (99 → ≤65) (P1)
- Target strict-index errors down from 99 to ≤65.
- **Strict Rule:** Fix caller/construction sites with conditional spreads or property omissions. 0 additions to loose optionality (`?: T | undefined`).
- Every ratchet report must disclose the split: `N construction/caller fixes vs M widenings`.

### Priority 2: Scripts Typecheck Burndown (187 → ≤150) (P2)
- Target scripts typecheck down from 187 to ≤150.
- Focus on `scripts/snapshot-witness.ts` (24 errors), `scripts/backfillAgentMonica.ts` (11 errors), `scripts/curatedDescriptions.ts` (10 errors).
- Apply safe indexed-access guards (`rows[0]?.foo ?? fallback`), and explicit CLI arg checks (`process.exit(1)` on missing args).

### Priority 3: Remote Boundary Validation over Assertions (P2)
- Audit and replace bare `res.json() as T` / `(await res.json()) as T` across API routes and client fetchers with Zod schemas.
- Burn down `unsafe-*` debt (135 assignment, 127 member access, 47 argument, 19 return, 6 call).

### Priority 4: Loose-Optionality Ratchet Reduction (459 → <450) (P3)
- Investigate and clean up legacy `?: T | undefined` declarations in `src/` to ratchet down the AST loose optionality gate.

---

## 4. Operational Caveats & Anti-Patterns (DO NOT DO)

- ⚠️ **DO NOT replace runtime validation with `as T` at unvalidated boundaries.** Always validate or defensively coerce unvalidated external data.
- ⚠️ **DO NOT use truthy conditional spreads where falsy values are valid.** `...(x ? { x } : {})` drops intentional `0`, `""`, and `false`. Use `x !== undefined ? { x } : {}`.
- ⚠️ **DO NOT replace Error objects with `err.message` in loggers.** Always pass the complete error object (`logger.error("action failed", err)`).
- ⚠️ **DO NOT default missing CLI script inputs.** Validate argument counts and fail fast with usage errors and `process.exit(1)`.
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

