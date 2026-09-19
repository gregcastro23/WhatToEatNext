# Phase 37: Zero Strict Debt & High-Impact Boundary Validation Campaign

_Primary agent prompt for Next Session. Auth & Session Persistence status is archived to [docs/handovers/session-persistence-status-2026-09-16.md](docs/handovers/session-persistence-status-2026-09-16.md). Phase 36 is **100% COMPLETE & VERIFIED** on branch `refactor/phase-36-typescript-burndown`._

---

## 1. Verified Quality & Type Health Baselines (Post Phase 36 Close-Out)

Always re-measure before acting — never assume or inherit a number:

| Metric | Baseline | Honest Accounting / Breakdown | Verification Gate |
| :--- | :--- | :--- | :--- |
| **Strict-Index (`exactOptionalPropertyTypes`)** | **26** errors / 26 files | Reduced from 57 (−31 errors across 31 files): 100% construction/caller fixes, **0** domain widenings | `bun run strict-index:check` |
| **Scripts Typecheck** | **95** errors across 38 files | Down from 142 across 44 files (−47 errors); 6 script files cleared to 0 errors | `bun run check:scripts` |
| **Bare `res.json() as T` Casts (Prod)** | **188** prod (197 total) across 128 files | Down from 208 prod (−20 prod casts); +23 new validated `readJson` calls (32 → 55 total) | `bun run check:bare-json` |
| **Loose Optionality (`?: T \| undefined`)** | **392** AST sites | Reduced from 439 (−47 sites eliminated in `foodDiary.ts` & consumers) | AST scan in `lint:debt` |
| **Single Assertion Sites (`assertionSites.single`)** | **3,094** sites | Down from 3,121 (−27 sites decreased) | AST `assertionSites` in `lint:debt` |
| **Total Assertion Sites** | **3,260** sites | Down from 3,287 (−27 sites decreased) | AST scan in `lint:debt` |
| **Tracked Lint Debt** | **1,334** total across 9 tracked rules | ESLint Node API engine; all 28 audited rules passing without gate regressions | `bun run lint:debt` |
| &nbsp;&nbsp;↳ `@typescript-eslint/no-unnecessary-condition` | 831 | Down from 832 (−1 unnecessary condition eliminated in `CommensalManager.tsx`) | `bun run lint:debt` |
| &nbsp;&nbsp;↳ `@typescript-eslint/no-explicit-any` | 136 | Flat | `bun run lint:debt` |
| &nbsp;&nbsp;↳ `@typescript-eslint/no-unsafe-assignment` | 135 | Flat | `bun run lint:debt` |
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
| **Boundary Contract Tests** | **26 passed / 26 total** | High-fidelity positive fixtures and negative rejection proofs | `bun test boundaryValidationSchemas` |
| **Fast Test Suite (`test:fast`)** | **19 suites / 494 tests passed** | Inner-loop unit and conformance suite clean | `bun run test:fast` |
| **Production Build (`bun run build`)** | **Exit 0 (all route budgets pass)** | 108 static pages generated; pre-existing external bundler warnings noted | `bun run build` |

---

## 2. Phase 36 Accomplishments (Shipped, Audited & Review Closeout)

1. **Strict-Index Burndown (57 → 26 errors / 26 files)**:
   - Reduced from 57 to 26 errors (−31 reduction across 31 files), beating the target of ≤35.
   - 100% caller/construction fixes; **0 domain widenings** to `T | undefined`.
   - Conditional spreads `...(x !== undefined ? { x } : {})` or exact type narrowing applied cleanly across all 31 cleared files.
2. **Scripts Typecheck Burndown (142 → 95 errors / 38 files)**:
   - Reduced from 142 to 95 errors (−47 reduction across 6 files), beating the target of ≤100.
   - Brought 6 script files completely to 0 errors: `enrichIngredients.ts` (16→0), `backfillPhaseMonica.ts` (9→0), `audit-cooking-method-physics.ts` (7→0), `checkAgentMonicaDrift.ts` (5→0), `applyCoverageDescriptionCuration.ts` (5→0), `measureThreeOpenNumbers.ts` (5→0).
   - Zero synthetic SQL aggregate defaults (`?? 0`) were introduced.
3. **Remote Boundary Validation over Assertions (208 → 188 prod casts)**:
   - Eliminated 20 bare casts across 5 high-impact components: `SocialSection.tsx` (4), `CommensalManager.tsx` (5 + 3 unvalidated `Promise.all` reads), `FoodLabBook.tsx` (4), `CosmicRecipeGenerator.tsx` (4), and `admin/users/[userId]/page.tsx` (3).
   - Created 4 comprehensive Zod schema modules in `src/lib/validation/` (`socialResponseSchemas.ts`, `commensalResponseSchemas.ts`, `foodLabResponseSchemas.ts`, `adminUserResponseSchemas.ts`).
   - Wired +23 new `readJson` calls (32 → 55 total) under the AST gate `checkReadJsonValidation.ts` (0 unvalidated).
4. **Loose Optionality Elimination (439 → 392 sites)**:
   - Tightened 48 declarations in `src/types/foodDiary.ts` from `?: T | undefined` to strict `?: T`.
   - Updated consumers in `FoodDiaryService.ts`, `logMealFromPlan.ts`, and `useFoodDiary.ts` without triggering strict-index regressions.
   - Ratcheted `.lint-debt-baseline.json` loose optionality down to 392 sites.
5. **Phase 36 Review Findings Resolution (S1–S4 Closeout)**:
   - **S1 (Commensal Wire Validation)**: Replaced predicate-free `z.custom<T>()` in `commensalResponseSchemas.ts` with explicit wire schemas (`BirthDataSchema`, `PlanetInfoSchema`, `NatalChartSchema`, `GroupMemberSchema`, `ExtendedDiningGroupSchema`, `LinkedCommensalSchema`). Updated `CommensalManager.tsx` to consume wire types with conditional spreading for `modality` and `ascendant`, preserving exact optionality.
   - **S2 (Social Null-Reward Handling)**: Configured `PersistResponseSchema` with `reward: PracticeRewardSchema.nullable().optional()`, ensuring unrewarded social saves (`reward: null`) parse successfully without client-side exceptions. Enforced required reward fields on `CompletedQuestSchema`.
   - **S3 (Empty String Preservation)**: Replaced truthiness checks (`?`) with `!= null` checks in `FoodDiaryService.ts` and `alchemizeExtractedRecipe.ts`, guaranteeing valid `""` strings are never dropped.
   - **S4 (Contract Test Coverage)**: Expanded `boundaryValidationSchemas.test.ts` to 26 unit tests verifying route-shaped fixtures, null-reward handling, and negative rejection proofs (primitive `42`, arrays with `null`, missing `dominantElement`, missing `userId`).

---

## 3. Campaign Priorities & Execution Order (Phase 37)

### Priority 1: Application Strict-Index Zero Debt (26 → 0) (P1)
- Target: eliminate all remaining 26 strict-index diagnostics in `tsconfig.strict-index.json` to reach **0 errors across 0 files**.
- Work by related consumer clusters:
  - **Profile/State**: profile page, operator/registered dashboards, `UserContext`, `useProfile`, `useAstrologicalState`, `useTokenEconomy`.
  - **Boundary/Model Adapters**: `src/app/api/user/profile/route.ts:250`, Instacart IDP client, `src/lib/menu-planner/schemas.ts:77`, table composition, `ExtendedRecipe`.
  - **Recommendation/Domain Construction**: `src/utils/ingredientRecommender.ts:2755` (reconcile aspect shape), `src/utils/cookingMethodRecommender.ts:322` (thermodynamics entropy/reactivity mapping), `src/services/AstrologicalService.ts:173`.
- **Integrity Guarantee**: **0 domain widenings** (`| undefined`). Never use unsafe-overlap casts (`as unknown as`) to conceal interface discrepancies.

### Priority 2: High-Impact Remote Boundary Validation (188 → ≤175; Stretch ≤165) (P2)
- Target: replace bare `res.json() as T` casts with validated `readJson` calls at core user and financial boundaries:
  - `src/contexts/UserContext/index.tsx` (3 casts)
  - `src/app/(alchm)/shop/page.tsx` (4 casts)
  - `src/services/InstacartService.ts` (3 casts)
  - Stretch: `src/hooks/useNotifications.ts` (7 casts), feed page (6 casts).
- **Rule**: Schemas must reflect the actual route serializer, reject malformed domain payloads, handle null/empty responses, and include contract tests with negative rejection assertions.

### Priority 3: Scripts Operational Risk Burndown (95 → ≤66; Budget ≤70) (P3)
- Target: reduce scripts typecheck diagnostics from 95 to ≤66 across 6 key operational scripts:
  - `scripts/measureFullChartScale.ts` (7 diagnostics)
  - `scripts/snapshotAgentMonica.ts` (5 diagnostics)
  - `scripts/measureSacred7Distributions.ts` (4 diagnostics)
  - `scripts/backfillHumanNatalPositions.ts` (4 diagnostics)
  - `scripts/backfillSignupGrants.ts` (4 diagnostics)
  - `scripts/reattributeChefFeedEvents.ts` (5 diagnostics)
- **Rule**: Protect write invariants and database client termination. Use offline mock fixtures for testing; never run raw production mutations to prove type safety.

### Priority 4: Domain Optionality Alignment (392 → ≤350) (P4)
- Audit and tighten loose optionality in types adjacent to active boundary migrations:
  - `src/types/natalChart.ts` (12 sites)
  - `src/types/table.ts` (30 sites)
  - `src/types/chat.ts` (21 sites)
- **Rule**: Inventory callers before tightening to prevent unbudgeted exact-optional regressions.

---

## 4. Operational Caveats & Anti-Patterns (DO NOT DO)

- ⚠️ **DO NOT use predicate-free `z.custom<T>()` for wire schemas.** Always define explicit Zod shape validators so malformed payloads are rejected at the boundary.
- ⚠️ **DO NOT use truthy checks `?(...)` where empty strings `""`, `0`, or `false` are valid.** Use `!= null` or `!== undefined`.
- ⚠️ **DO NOT add `| undefined` to domain interfaces to satisfy `strict-index`.** Fix at the construction or call site using conditional property spreads `...(x !== undefined ? { x } : {})`.
- ⚠️ **DO NOT use silent defaults (`?? 0` or `?? fallback`) on database counts or sample arrays in scripts.** Throw an explicit error if a required record or aggregate is missing.
- ⚠️ **DO NOT use `z.coerce` on numeric ephemeris coordinates.** Upstream Swiss-Ephemeris floats must be strict numbers; string coercion conceals contract bugs.
- ⚠️ **DO NOT work directly on `master`.** All work must be carried out on dedicated feature/chore branches.

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
