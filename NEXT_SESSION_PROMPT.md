# Next Session: Phase 30 Completed & Verified (Strict-Index 478 -> 374)

## 0. Current Repository & Branch State

As of 2026-09-13:

- `HEAD` is `655073d0` on branch `feat/phase-29-response-narrowing-and-strict-index`.
- The committed strict-index baseline is 478; the working-tree baseline is **374**.
- The `readJson` baseline is 0 unvalidated across 30 response-reading calls.
- Non-null assertion sites decreased from 620 to **605** (-15).
- All Phase 30 source, schema, CLI tooling, test, and baseline changes are present in the working tree.
- `tests/menuPlannerStatefulSemantics.test.ts` is tracked in git.

Before any future work or checkpoint:

```bash
git status --short --branch
git diff --stat
git diff --check
bun run verify:full
```

Preserve every existing change. Do not reset, discard, stash, commit, or push without explicit user direction.

Current working-tree measurements:

| Metric                     |                 Current status |
| -------------------------- | -----------------------------: |
| Strict-index diagnostics   |           374 across 270 files |
| Strict-index allowlist     |                    0 (none)    |
| `no-unnecessary-condition` |           834 across 307 files |
| Tracked lint debt          |                          1,473 |
| Gated casts                |     167 total / 135 production |
| AST assertion sites        | 3,293 total / 2,670 production |
| Non-null assertion sites   |                            605 |
| `readJson` validation      |       0 unvalidated / 30 calls |
| Static gates               |               11 / 11 (pass)   |
| Jest test suites           |              368 / 368 (pass)  |
| Production Next.js build   |                 Exit 0 (pass)  |

If live measurements differ, treat the live diagnostic output as authoritative. Do not hand-edit a baseline to make it agree with this document.

---

## 1. Scope and Priority

Phase 30 has one required engineering objective and two stretch objectives:

1. **Required:** reduce strict-index diagnostics from 478 to **<= 380**. This is a reduction of at least **98** diagnostics.
2. **Stretch A:** reduce `no-unnecessary-condition` from 835 to **<= 780**, which should also reduce tracked lint debt from 1,474 to **<= 1,419** if no other tracked rule changes.
3. **Stretch B:** reduce AST assertion sites from 3,295 to **<= 3,250** and gated casts from 167 to **<= 165**.

Do not trade completion of the required objective for a partial result in all three areas. Finish and verify strict-index first. Re-measure before beginning either stretch objective because strict-index repairs can change lint and assertion counts.

Broad lunar, chakra, and defaults feature wiring is not part of the Phase 30 Definition of Done. It needs a deterministic vertical-slice specification and correctness repairs before production integration; see Section 6.

---

## 2. Required Objective: Strict-Index 478 -> <= 380

### Live inventory

The 478 diagnostics are dispersed rather than concentrated in a few files:

- TS2375: 264
- TS2379: 114
- TS2322: 52
- TS2345: 27
- TS2412: 11
- TS2352: 6
- TS2769: 4
- 179 files have one diagnostic; 75 files have two.

Current candidate pools with enough headroom to reach the target:

| Candidate pool                                                                                            | Diagnostics | Files |
| --------------------------------------------------------------------------------------------------------- | ----------: | ----: |
| `src/utils/**`                                                                                            |          79 |    42 |
| `src/app/api/**`                                                                                          |          65 |    52 |
| `src/services/**`                                                                                         |          58 |    31 |
| `src/app/(alchm)/**`                                                                                      |          47 |    29 |
| Menu planner: `src/components/menu-planner/**`, `src/contexts/menu-planner/**`, `src/lib/menu-planner/**` |          42 |    14 |

The highest-count individual files currently begin with:

- `src/lib/menu-planner/schemas.ts` — 8
- `src/components/menu-planner/RecipeBrowserPanel.tsx` — 5
- `src/contexts/menu-planner/useMealSlots.ts` — 5
- `src/data/unified/recipeBuilding.ts` — 5
- `src/services/UnifiedRecommendationService.ts` — 5
- `src/utils/cuisine/sauceLineage.ts` — 5
- `src/utils/ingredientRecommender.ts` — 5

These are candidates, not a frozen worklist. The previous list contained missing and already-clean files and would have removed only 10 live diagnostics. Select work from the current compiler output.

### Diagnostic reporting prerequisite

The current `scripts/checkStrictIndex.ts` prints only aggregate totals; it does not support the previously documented `--top` behavior. Before editing production code, add and test a read-only `--top <N>` mode that prints files sorted by diagnostic count, including the per-file TypeScript code distribution. Keep the default gate output and pass/fail behavior unchanged.

After that small tooling change, generate the live worklist with:

```bash
bun scripts/checkStrictIndex.ts --top 40
```

Do not ratchet any baseline as part of the reporting change.

### Selection strategy

Work in cohesive clusters and maintain at least 20% diagnostic headroom in the candidate pool. Recommended order:

1. Menu-planner types, schemas, context, and consumers.
2. Service-layer row/adaptor construction.
3. Utilities with clear internal contracts.
4. API routes only where request/response schemas make the runtime contract explicit.

Prefer TS2375 and TS2379 repairs with locally provable semantics. For each optional property, decide which contract is intended:

| Intended runtime meaning                               | Correct repair                                                                |
| ------------------------------------------------------ | ----------------------------------------------------------------------------- |
| Property should be absent when no value exists         | Use a conditional object spread and omit the key                              |
| Property is always present but may contain `undefined` | Use `T \| undefined` only when callers and runtime data require that contract |
| Database/API represents missing data as `null`         | Preserve `null` or normalize it explicitly at the boundary                    |

Do not mechanically add `| undefined` to shared interfaces. That weakens `exactOptionalPropertyTypes` and can hide rather than repair the contract mismatch.

### Non-negotiable repair rules

- Preserve runtime behavior unless a characterized latent bug is explicitly accepted as part of the change.
- Do not silence diagnostics with `as any`, `as unknown as`, non-null assertions, `@ts-ignore`, or lint disables.
- Do not delete, gut, or replace rich domain calculations to make types pass. **FIX > REMOVE.**
- Use Zod parsing at external or persistence boundaries; use typed adapters and guards for internal transforms.
- Inspect callers before changing a shared type.
- Add or update tests when the repair changes serialization, omission, null handling, fallback behavior, or a public function contract.
- The strict-index gate enforces only the total. Do not offset new errors in one file with larger reductions elsewhere.

### Cluster workflow

For each cluster:

1. Record the exact diagnostics, codes, and files before editing.
2. Inspect the producer, target type, callers, and relevant tests.
3. Decide the intended absent/undefined/null semantics.
4. Make the smallest cohesive repair.
5. Run the closest targeted tests.
6. Run:

```bash
bun run typecheck
bun run strict-index:check
bun run lint:changed
```

7. Confirm that the global strict count fell and that no new diagnostics or lint errors were introduced.
8. Record the before/after count and semantic decision in the final handoff.

Do not ratchet the baseline after every small edit. Ratchet once after the required target is reached and the complete diff has been reviewed.

---

## 3. Stretch A: `no-unnecessary-condition` 835 -> <= 780

Start this only after strict-index is <= 380 and has been re-measured.

Current message distribution:

- `neverOptionalChain`: 258
- `alwaysTruthy`: 223
- `neverNullish`: 213
- `alwaysFalsy`: 106
- `noOverlapBooleanExpression`: 24
- `comparisonBetweenLiteralTypes`: 11

Inspect findings with:

```bash
bun scripts/checkLintDebt.ts --rule no-unnecessary-condition
```

Select high-confidence files whose runtime inputs are controlled or validated. A passing pre-existing test is not proof that a guard is redundant: declared types may be narrower than production data.

For every removed or rewritten condition:

- Establish whether the declared type or observed runtime input is authoritative.
- Characterize absent, `undefined`, `null`, malformed, zero, empty-string, and empty-array behavior when relevant.
- Prefer correcting the producer type or boundary schema when the type lies.
- Leave an intentional defensive guard and its existing baseline warning unchanged; move to a different finding instead of deleting or suppressing it.
- Do not replace a guard with `!`, a cast, or a tautological test merely to move the metric.

Stretch A is complete only when:

- `no-unnecessary-condition` is <= 780.
- Tracked lint debt is <= 1,419.
- No other audited rule, declined pool, cast counter, assertion counter, or sub-baseline regresses.
- Relevant behavioral tests cover the changed branches.

---

## 4. Stretch B: Assertion Sites <= 3,250 and Gated Casts <= 165

Start this only after the strict-index and lint measurements have stabilized.

Inventory the current surface with:

```bash
bun scripts/checkLintDebt.ts --top-casts 20
```

Prioritize production `as any` and `as unknown as T` sites at real boundaries. Use:

1. Zod `.parse()` or `.safeParse()` for untrusted external data.
2. Explicit typed adapters for internal structural transformations.
3. Narrowing guards such as `isDefined` and `isRecord`.
4. Correct discriminated unions or overloads when the assertion compensates for an incomplete API.

Do not game the aggregate by deleting useful `as const` literal narrowing or weakening test fixtures. A chained assertion rewritten as a single assertion is relabeling, not remediation.

Stretch B is complete only when both independent targets hold:

- AST assertion sites <= 3,250.
- Gated casts <= 165.
- Production assertion sites do not exceed 2,672.
- Production gated casts do not exceed 135.
- `as any`, tracked lint debt, and all strict-index metrics remain non-regressing.

---

## 5. Ratchet and Final Verification

When all work intended for this phase is complete:

```bash
# Record only genuine measured reductions.
bun run strict-index:ratchet

# Run only if a lint, cast, or assertion counter decreased.
bun run lint:debt:ratchet

# This already includes verify:static, the full Jest suite, and the build.
bun run verify:full

git diff --check
git status --short --branch
```

Do not run `verify:static`, then `verify`, then `verify:full` consecutively; `verify:full` already includes the first two workflows.

Use the canonical test scripts without `--forceExit`. If Jest appears to hang, diagnose the open handle first:

```bash
bun run test:detect-open-handles
```

Use `bun run test:memory`/`--forceExit` only as a diagnostic fallback. It can conceal resource leaks and is not the release signal.

### Required Definition of Done

- Phase 29 had a clear, preserved checkpoint before Phase 30 edits began.
- Strict-index diagnostics are <= 380 and `.strict-index-baseline.json` matches the live result.
- Base `typecheck` has 0 errors.
- All 11 static gates pass.
- The full Jest suite passes; report live counts rather than hard-coding historical suite totals.
- The Next.js production build and route-size check pass.
- Route validation and `readJson` validation remain at zero unvalidated sites.
- No existing user changes were discarded.
- No commit or push was performed without explicit user authorization.

The final report must include the starting and ending counters, clusters changed, tests added or updated, notable semantic decisions, remaining risks, and any work deferred from the stretch objectives.

---

## 6. Follow-up Design Gate: Domain Feature Wiring

Do not broadly wire `lunarPhaseUtils.ts`, `chakraSymbols.ts`, `defaults.ts`, or `typeDefaults.ts` into production during this debt-burndown phase.

Known prerequisites:

- `applyVelocityBoost` is currently a no-op placeholder.
- Lunar aspect logic documents comparisons against incompatible aspect concepts and therefore falls through to defaults.
- `calculatePhaseVelocity` reads `velocityBoost` from the wrong object level.
- Illumination-curve and void-of-course implementations are not present in `lunarPhaseUtils.ts`.
- Chakra intelligence outputs use `Math.random()` extensively and are not deterministic enough for SSR, hydration, reproducible recommendations, or stable tests.
- “Alchemy Atlas” does not identify a concrete route or component.
- Centralizing defaults can change fallback behavior and therefore needs a consumer-by-consumer audit.

Before implementation, write a separate vertical-slice specification containing:

1. One exact route and component.
2. The user-visible behavior and empty/error states.
3. Input provenance and validated runtime schema.
4. Deterministic calculation formulas and units.
5. Cache, SSR, and hydration behavior.
6. Unit, integration, and UI acceptance tests.
7. A migration plan for existing fallback/default behavior.

The first recommended slice is lunar telemetry in the Weekly Menu Planner because it has a concrete product surface and can be validated independently. Fix and characterize the lunar calculations before displaying them. Chakra intelligence and broad default centralization should remain separate follow-up work.
