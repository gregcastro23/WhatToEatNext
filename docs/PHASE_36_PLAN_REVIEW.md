# Phase 36 plan improvement report

Reviewed September 18, 2026 against commit `6649e26822f7db4c74fa0072f692b34dc00c37df` on `refactor/phase-35-typescript-burndown`.

**Recommendation: retain the campaign targets, but revise the implementation scope and acceptance criteria before execution.** The direction is sound: caller fixes, real response validation, and downward-only baselines. The current plan underestimates dependencies between priorities and leaves several concrete fixes unspecified.

The review uses the attached plan. There is no `implementation_plan.md` in this checkout, and the checked-out branch differs from the Phase 36 branch named in the plan. Record the execution branch and starting commit when transferring these recommendations.

## Verified starting point

| Metric | Fresh measurement | Phase 36 acceptance target |
|---|---:|---:|
| Strict-project diagnostics | 57 across 57 files | ≤35, with no per-file regressions |
| Scripts diagnostics | 142 across 44 files | ≤100, with no per-file regressions |
| Bare JSON casts | 208 production; 217 total | ≤190 production; no total/per-file regressions |
| Loose optionality | 439 AST sites | ≤400 |
| Unvalidated JSON-helper calls | 0 of 32 calls | Remain 0 |

The strict, scripts, bare-JSON, and read-JSON gates passed. Loose optionality was measured using the same `scanLooseOptionality` implementation used by `lint:debt`; the full ESLint debt gate was not run for this review. The read-JSON baseline records 30 total calls, whereas the live scanner reports 32.

## Required improvements

### 1. Treat food-diary tightening and its consumers as one change

**High priority.** Priority 4 is not a one-file cleanup. A compiler experiment intercepted reads of `src/types/foodDiary.ts` in memory and removed its explicit `| undefined` unions while leaving repository source untouched. Strict-project diagnostics rose **57 → 64**, with seven newly reported diagnostics in `FoodDiaryService.ts`, currently a zero-error file:

| Consumer location | Newly exposed incompatibility |
|---|---|
| `FoodDiaryService.ts:2632` | Entry construction explicitly supplies possibly undefined `sourceId` |
| `FoodDiaryService.ts:2826` | Serving construction supplies possibly undefined `description` |
| `FoodDiaryService.ts:2833` | Nutrition construction retains possibly undefined nutrient values |
| `FoodDiaryService.ts:3006` | Rating update supplies possibly undefined `moodTags` |
| `FoodDiaryService.ts:3196` | Nutrition calculation retains possibly undefined nutrient values |
| `FoodDiaryService.ts:3336` | Favorite search result supplies possibly undefined `brandName` |
| `FoodDiaryService.ts:3385` | Favorite construction supplies possibly undefined `sourceId` |

These are initial diagnostics, not an exhaustive list of fields needing changes: TypeScript may reveal another incompatible property after the first is fixed. The strict gate rejects a regression in a previously clean file even when the overall count falls.

**Revise the plan:** include `FoodDiaryService.ts`, affected callers, and relevant fixtures in the food-diary tranche. Pair type tightening with consumer repairs before ratcheting. Run the whole strict project, not just inspections of the edited type file. In nutrient construction, capture `toOptionalNumber(...)` once, then narrow that local value; checking one invocation does not narrow a second invocation.

The AST scanner confirms **47 counted sites**, but the file contains **48 explicit undefined unions**. The extra site is the mapped `FoodDiaryNutrition` type at line 15, which this scanner does not count. Tightening it is useful, but earns no additional metric reduction. The forecast remains 439 − 47 = **392** if nothing else changes.

### 2. Correct the scripts work list and give it contingency

**High priority.** The five clusters total exactly **42**, not more than 42. Fixing all of them reaches exactly **100**, with no allowance for a missed diagnostic.

Two concrete gaps occur in `enrichIngredients.ts`:

- `defaults[cat] ?? defaults.misc` is already the code at line 203 and already fails. Both accesses are possibly undefined under `Record<string, CategoryDefaults>`. Keep a separately typed, guaranteed fallback value, or use a structure that explicitly guarantees the `misc` key.
- `categoryFromFile()` at line 287 dereferences `rel[0]` without narrowing; the plan mentions only the separate summary-splitting error at line 69. Include both.

Changing `CategoryDefaults.qualities` to `string` matches its current source-code initializer representation and is a valid fix. Make that representation explicit in a comment or name, and verify emitted ingredient data still contains an array.

For fixed populations in `checkAgentMonicaDrift.ts`, prefer `Record<"single" | "phase" | "fullChart", number[]>` to unnecessary guards around keys that are guaranteed by construction. Guard the census row explicitly. For percentile/min/max reads, narrow captured values or use a small checked-access helper; a length check alone does not resolve arbitrary indexed reads under the current compiler settings.

The proposed `kalchms[0]!` approach shifts the proof into an assertion. Prefer runtime checks at the actual access points. Also, the assertion ratchet scans `src`, so newly added assertions in `scripts` are not covered by that metric (`checkLintDebt.ts:255`).

**Revise the plan:** retain ≤100 as the requirement; aim for ≤95 only after identifying additional diagnostics as reserve work. Do not imply that the named five files can deliver 95. Verify empty, singleton, and normal samples with offline fixtures, including zero-valued data and descriptive empty-sample failure. Preserve the existing write refusal in the superseded `backfillPhaseMonica.ts`; typecheck and fixture validation do not require running production backfills.

### 3. Specify response contracts before replacing casts

**High priority.** The proposed schema names are not currently exported under those names in `src`. The canonical cosmic recipe schema does exist as **`cosmicRecipeSchema`** in `src/types/cosmicRecipeSchema.ts`; the generator currently imports it only as a type.

**Revise the plan:** add schema creation/reuse and contract tests as explicit work. For each endpoint, list its producer route, success shape, error shape, nullable fields, consumer, and schema location. Reuse compatible response schemas rather than creating another domain model. Infer response types from schemas where practical and normalize at domain boundaries where stricter optionality requires it.

Schema decisions must cover:

- Success and failure payloads separately, including required fields when success is true.
- Missing versus null fields and real empty-list responses.
- Non-JSON/empty error bodies and existing status-specific messages.
- Whether extra keys should survive parsing; do not accidentally discard fields consumed later.
- Browser-safe imports and client bundle impact when converting type-only imports to runtime imports.

For example, the cosmic route adds `success`, `recipesGeneratedToday`, and sometimes demo metadata around the recipe (`generate-cosmic-recipe/route.ts:513`). Decide explicitly whether the client needs only the recipe or a validated response envelope. Preserve the existing 401/402/429/5xx messages in the generator, and distinguish schema failures from network failures.

The read-JSON gate checks the syntactic presence of a parser; it does not prove that the parser validates a meaningful contract (`scripts/lib/readJsonValidation.ts:105`). Avoid permissive catch-all schemas, identity parsers, or assertions hidden inside parsers. Use representative producer payloads plus malformed payloads to demonstrate validation.

### 4. Include the uncounted CommensalManager boundary

**High priority.** `CommensalManager.tsx:859–867` performs three raw response reads in `Promise.all`, then asserts the resulting tuple. Those reads are outside the five direct bare casts listed in the plan.

**Revise the plan:** validate the three initial-load responses individually, reusing the list schemas. Preserve the optional linked-commensals failure behavior. Track both metrics: **20 planned direct cast removals → 188 production casts**, and the number of actual response reads validated. The additional three reads improve boundary coverage without necessarily changing the bare-cast metric. Do not describe the selected components as fully validated merely because their counted casts disappear.

### 5. Make omission semantics and behavioral coverage explicit

**Medium priority.** Conditional spreads are appropriate only where absence is the intended contract. Preserve legitimate `0`, `false`, and empty strings with `!== undefined`; do not replace those checks with truthiness. Review consumers that use property-presence checks or merge partial objects, where an absent key can behave differently from an explicitly undefined key.

The existing diary update service uses `!== undefined` for fields such as rating, notes, and `wouldEatAgain` (`FoodDiaryService.ts:2904`). Preserve that behavior. If clearing a field needs a distinct signal, specify the existing clear contract rather than inventing one during this campaign.

The snapshot witness covers selected deterministic domain calculations. It does not establish parity for admin mutations, social UI, diary persistence, or the changed scripts. Validation also intentionally changes behavior for invalid responses, so “100% behavioral parity” is too broad.

**Revise acceptance wording:** “Preserve the existing snapshot fixture exactly; preserve behavior for valid supported inputs; test the intended rejection and recovery behavior for malformed boundary inputs.” Add focused tests for changed contracts and material construction paths, rather than tests for every mechanical spread.

### 6. Separate campaign targets from ratchet success

**Medium priority.** A passing gate means “no regression against the existing baseline,” not “Phase 36 target achieved.” Every measured gate currently passes before any campaign work.

**Revise the plan:** publish a final metric ledger with explicit target assertions and per-file deltas, then ratchet to the actual lower measurements. Keep scope, exclusions, allowlists, suppressions, and witness fixtures unchanged unless a separately justified change is required. Reject regression-hiding baseline edits.

`checkReadJsonValidation.ts:48` writes its baseline only when the unvalidated count decreases. With a baseline of zero, `--ratchet` will not update `totalCalls`. Treat 32 as current live metadata and record final coverage in the report; do not promise this baseline file will change. If refreshing that metadata is desired, make the gate adjustment an explicit separate item.

### 7. Make the final verification reproducible and avoid duplicate full runs

**Medium priority.** `verify:static` already includes the individual strict, scripts, bare-JSON, read-JSON, lint-debt, and snapshot gates, plus additional checks. Use targeted checks during development, then one final `bun run verify:full` after ratcheting, or its equivalent static/test/build sequence. Repeat checks when new changes justify it.

The Next.js configuration explicitly skips lint and TypeScript validation during build (`next.config.js:186–196`). A successful build cannot replace the separate checks. The build command also does not establish a universal zero-warning policy; capture stderr as well as stdout and inspect warnings against the stated acceptance requirement.

Record commit, tool versions, commands, exit codes, final counts, test results, and build warnings. Classify any environment-blocked check as unverified rather than passed. The full suite, full lint-debt gate, snapshot witness, static composite, and production build were **not rerun for this plan review**; their clean status in the submitted plan remains unverified here.

## Suggested execution order

1. **Establish provenance:** confirm the Phase 36 checkout and capture starting diagnostics once. Reuse full compiler output for cluster analysis instead of rerunning `tsc` through `grep ... || true` for each file.
2. **Resolve food-diary dependencies:** tighten types with consumer fixes in the same tranche. Require no new per-file strict errors. This resolves the largest known interaction between Priorities 1 and 4 early.
3. **Complete caller fixes:** apply the remaining exact-optional repairs and verify the total is ≤35. The plan actually lists 27 files, despite its “22–26” description; reconcile the list and expected reduction.
4. **Fix script clusters:** address all 42 measured diagnostics, verify ≤100, then use identified reserve work only if needed or worthwhile.
5. **Validate response families:** implement schema contracts and focused tests, migrate the 20 direct cast sites plus the three initial-load reads, and verify both cast reduction and zero unvalidated helper calls. Check strict types as well, because schema-inferred optional fields can expose additional compatibility work.
6. **Close the campaign:** assert all four numeric targets, ratchet actual reductions, inspect the baseline diff, and run the final composite verification. Preserve the witness baseline.

The most important revision is to replace isolated file-count promises with complete changes to types, their consumers, and their tests. The targets remain plausible, but the current plan needs the seven newly exposed diary diagnostics, the missing script fixes, and explicit schema work in scope before its estimates are reliable.
