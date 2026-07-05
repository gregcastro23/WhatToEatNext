# Linting Situation Next Session Prompt

Use this document as the opening prompt/context for the next TypeScript linting cleanup session.

## Current State

The current branch is `feat/restaurant-best-match-explorer`.

Recent cleanup completed:

- Fixed the deployment-blocking Jest issue caused by importing `bun:test` in a Jest test.
- Reduced suppressed ESLint warnings from `125` to `77`.
- Reduced TypeScript ESLint suppressed warnings from `47` to `0`.
- Kept active ESLint warnings at `0`.
- Centralized legacy naming exceptions in `eslint.config.mjs`.
- Removed stale unused compatibility interfaces/type aliases and dead duplicate tarot data.
- Added typed DB row boundaries in several services:
  - `src/services/TokenEconomyService.ts`
  - `src/services/QuestService.ts`
  - `src/services/StreakService.ts`
  - `src/services/authEventsService.ts`
  - `src/services/FoodDiaryService.ts`
  - `src/services/commensalDatabaseService.ts`
  - `src/services/notificationDatabaseService.ts`
  - `src/services/userDatabaseService.ts`
- Replaced several callback `any` usages in:
  - `src/app/api/auth/sessions/route.ts`
  - `src/lib/degree-agent-matcher.ts`
  - `src/lib/mcp/synastryTools.ts`

Verification already passed after this campaign:

```bash
bun run typecheck
bunx eslint --config eslint.config.mjs src --max-warnings=0
bun run test --passWithNoTests
git diff --check
bun run build
```

The production build completes successfully but still emits pre-existing dependency warnings around optional wallet modules from Privy/Reown/x402/viem.

## Current Inventory Commands

Use these to re-check the situation before starting the next pass:

```bash
bun run typecheck
bunx eslint --config eslint.config.mjs src --max-warnings=0
node - <<'NODE'
const { spawnSync } = require('node:child_process');
const result = spawnSync('bunx', ['eslint', '--config', 'eslint.config.mjs', 'src', '--format=json', '--max-warnings=10000'], {
  encoding: 'utf8',
  maxBuffer: 1024 * 1024 * 50,
});
if (result.error) throw result.error;
const rows = result.stdout.trim() ? JSON.parse(result.stdout) : [];
const active = [];
const suppressed = [];
const tsSuppressed = [];
for (const file of rows) {
  for (const message of file.messages || []) if (message.severity === 1) active.push({ filePath: file.filePath, ...message });
  for (const message of file.suppressedMessages || []) {
    const item = { filePath: file.filePath, ...message };
    suppressed.push(item);
    if (String(message.ruleId).startsWith('@typescript-eslint/')) tsSuppressed.push(item);
  }
}
console.log(`active=${active.length}`);
console.log(`suppressed=${suppressed.length}`);
console.log(`typescriptSuppressed=${tsSuppressed.length}`);
NODE
```

To find the next explicit-any hotspots:

```bash
rg "as any|: any|any\\[\\]|<any>" src \
  --glob '!**/*.test.ts' \
  --glob '!**/*.test.tsx' \
  --glob '!**/__tests__/**' -n \
  | cut -d: -f1 \
  | sort \
  | uniq -c \
  | sort -nr \
  | head -20
```

**⚠️ Recovery note (2026-07-05):** mid-way through a large "wave1" push (38 files, self-gating investigate stage), the background workflow hit a hard session usage limit, producing ~20 failed agent calls and 2 pipeline items that never completed. Separately, the user landed a small legitimate commit (`797454bd`, "Restore ingredient filters and auth session endpoint") containing real new homepage features, and at some point the working tree's other uncommitted changes (everything from this campaign — round1 through batch4) ended up stashed rather than lost. Recovery: confirmed via `git stash show --stat` that `stash@{0}` held all of it; restored 23 non-conflicting files directly via `git checkout stash@{0} -- <file>`; discarded 2 files (`AlchmKitchen.tsx`, `data/unified/enhancedIngredients.ts`) whose `implement` stage had genuinely failed mid-write, leaving broken partial edits (back in the safe-files queue for a future pass); left 6 files that wave1 had already re-processed on their newer wave1 content instead of the older stashed version. `EnhancedIngredientRecommender.tsx` needed a full fresh redo (not a stash restore) since the user's restore commit added real new features — a Vegetables category, compact-mode filters and search — on top of an older pre-cleanup base, so simply reapplying the old stashed diff would have destroyed that new feature work. Net effect: no completed, reviewed work from this campaign was permanently lost, but several hours were spent on reconciliation. **Lesson reinforced**: uncommitted work in a shared working directory is only as safe as the next `git stash`/reset a concurrent process runs — this campaign's fixes remain uncommitted by design (only commit when the user asks), so this risk is structural and will recur; see [[reference_concurrent_sessions]].

**⚠️⚠️ Phantom-diff incident (2026-07-05, wave3):** a NEW and more concerning failure mode, distinct from the stash-sweep incidents above. Wave3 (30 files, same self-gating design) ran for ~3 hours (2010 tool calls, 72 agents). It reported 21 files "fixed," each with a detailed, technically-specific self-report (exact line numbers, interface names, verification command output). When independently checked against the actual working tree immediately after the workflow completed, **only 5 of those 21 files had real, surviving diffs** — the other 16 had zero working-tree changes, several confirmed via reviewer agents that ran fresh `git diff`/`rg`/`eslint` and found the claimed edits simply don't exist (`databaseCleanup.ts`, `types/guards.ts`, `types/alchemy.ts`, `AstrologizeApiCache.ts`, `usePlanetaryKinetics.ts` — all explicitly called out as fabricated by their reviewers). Critically, at least 2 files (`recipeCalculations.ts`, and others with a genuine "PASS" review) were confirmed to have been REAL and reviewed at the time their reviewer checked, then vanished before the final result was returned — meaning some files were correctly implemented AND correctly reviewed, then reverted by something DURING the wave, not fabricated by the agent at all. No new git stash or commit explains this loss (`git log`/`git stash list` showed nothing new), so unlike the two stash-sweep incidents, this wasn't a clean, recoverable git event — the changes just didn't persist or got silently wiped by something outside git's visible history. **Working hypothesis**: a 3-hour wall-clock window with ~30 concurrently-progressing pipeline items is long enough that whatever external process periodically disrupts this shared working directory hit it multiple times mid-run, and — unlike the single-file-at-a-time earlier waves — the sheer duration meant some agents' final "let me re-verify before reporting" step ran against a file that had already been silently reverted by the time they got there, without the agent detecting the mismatch between its own memory of what it did and current reality. **Mitigation going forward**: commit checkpoints need to happen much more frequently than "once per wave" for long-running waves — ideally, do not trust ANY agent self-report as proof of a durable change; the only proof is an independent `git diff` check run by *this* session, immediately, before moving on. Consider capping wave duration/size more aggressively (smaller batches, shorter wall-clock windows) specifically to shrink the disruption window, not just to reduce blast radius.

After wave3's ground-truth reconciliation (2026-07-05), that production-code scan finds about `1365` explicit-any-like matches. The largest clusters are:

```text
 35 src/data/ingredients/fruits/index.ts
 19 src/calculations/index.ts
 19 src/app/(alchm)/recipe-generator/page.tsx
 18 src/data/unified/recipeBuilding.ts
 18 src/data/unified/flavorProfileMigration.ts
 17 src/components/profile/ProfileBlockRegistry.tsx
 15 src/utils/monicaKalchmCalculations.ts
 15 src/utils/menuPlanner/recommendationBridge.ts
 16 src/utils/recommendation/foodRecommendation.ts
 16 src/lib/celestial-energy-calculator.ts
 16 src/hooks/useCookingMethods.ts
```

**⚠️ High-risk targets deliberately deferred, not yet touched:** `src/calculations/index.ts` is a barrel re-exported into ~19 live consumers including API routes (`app/api/group-recommendations`, `app/api/cuisines/recommend`, `app/api/nanobanana/cuisine`) and a live page (`app/cuisines/[slug]/page.tsx`). `src/app/(alchm)/recipe-generator/page.tsx` is itself a live route. `src/data/unified/recipeBuilding.ts` is 3241 lines with many live menu-planner component importers plus a live page (`app/(alchm)/generated-recipe/[id]/page.tsx`). Treat these like the homepage ingredient pair — dedicated round, live-preview verification, not a routine batch.

**⚠️ Process note on attribution (2026-07-04):** this campaign has been worked concurrently by two separate AI tools sharing this working directory (a Claude Code session and a Gemini/Antigravity session), coordinating via this doc as shared task state. This caused one real collision (mid-edit `git checkout` on `alchemicalPillarUtils.ts` — recovered, no data lost) and, separately, a shared branch typecheck break (`astrology/core.ts`, fixed below). **Every entry below that a Gemini-authored implementation claimed "done" was independently adversarially reviewed by a fresh Claude Code agent before being trusted** — this caught two real bugs (see `EnhancedIngredientRecommender.tsx` and `ingredientRecommender.ts` entries). Gemini's usage has since been exhausted; this session is now the sole active editor. Entries for `cuisineFlavorProfiles.ts`, `astrology/positions.ts`, and `astrologyUtils.ts` below are Gemini's self-report only, NOT YET independently reviewed — treat with the same skepticism until reviewed.

Completed passes:

- `src/services/ElementalCalculator.ts` — 24 matches down to 0 (2026-07-04). Replaced `as any` element indexing with `keyof ElementalProperties`, typed the planetary-position API boundaries as `Record<string, unknown>` views, and fixed the misuse of the global `Planet` type where the real domain type was `string` (planet name) or `unknown` (API blob). Note: `signData.label` access in `processPlanetData`/`processCelestialBodiesData` intentionally still throws when `Sign` is absent (caught by surrounding try/catch or propagated, matching prior behavior) — do not "fix" with optional chaining without checking score impact.
- `src/services/UnifiedIngredientService.ts` — 60 matches down to 0 (2026-07-04, multi-agent investigate→implement→adversarial-review pass). Added `ZodiacSignType` typing to zodiac-facing filter params, local `LegacyAstrologicalProperties`/`LegacyNutrition` interfaces capturing only the fields actually read, and typed casts for `elementalPropertiesState`/`dietaryFlags`/`alchemicalEngine`/`metrics1`/`metrics2`. The adversarial review caught (and this session fixed) two `@typescript-eslint/no-unnecessary-type-assertion` errors the implementer's cast removal introduced at `signs.includes(sign as unknown)` (was line 467) and `signs.includes(currentZodiacSignType as unknown)` (was line 1160) — once the param type became `ZodiacSignType` instead of `any`, the `as unknown` on an `unknown[]`-typed `.includes()` argument became a no-op; both fixed by dropping the redundant cast. **Not fixed, flagged for a follow-up ticket**: several pre-existing field-name mismatches between what this file reads and what `UnifiedIngredient` actually declares (`subCategory` vs `subcategory`, `astrologicalProperties` vs `astrologicalProfile`, `elementalPropertiesState` vs `elementalProperties`, a nonexistent `dietaryFlags`, `thermodynamicProperties` vs `energyValues`/`energyProfile`, `nutrition` vs `nutritionalProfile`) mean `filterIngredients()` and several of its dependents are silently always-empty/always-false against real production data. Preserved as-is per the types-only scope of this pass.
- `src/services/RecommendationAdapter.ts` — 26 of 27 matches down to 0, 1 kept intentionally (2026-07-04, same multi-agent pass). Added local `AlchemicalResultSnapshot`/`AlchemySnapshot`/`AspectFieldsRead`/`NutritionSnapshot` interfaces; removed several fully-redundant casts where the underlying type (`AlchemicalItem.gregsEnergy`, `Record<ElementalCharacter, number>`) was already precise. The one remaining `: any` (`transformItemsWithPlanetaryPositions`) is a dead stub for a removed export, documented with an `// Intentionally any:` comment. Adversarial review verdict: PASS, no issues. **Not fixed, flagged for a follow-up ticket**: the aspect-boost block (~line 352-413) is dead code today because real `PlanetaryAspect` objects use `planet1`/`planet2`/`type`, never the `body1`/`body2`/`aspectType` fields this code reads; and `this.alchemicalResult`'s declared/assigned shape doesn't match what `alchemize()` actually returns, so `getHeatIndex`/`getEntropyIndex`/`getReactivityIndex`/`getGregsEnergyIndex`/`getDominantAlchemicalProperty` are silently computing from zeros/undefined in production today.
- `src/utils/alchemicalPillarUtils.ts` — 55 matches down to 0 (2026-07-04, implemented by Gemini/Antigravity). Replaced all `any` uses with direct type mappings and structured element rules; removed dynamic cast checks. **Independently adversarially reviewed by Claude Code: PASS.** Added `AlchemicalItemWithOptionalProperties` interface correctly reflecting `"x" in item` guard patterns; no control-flow/behavior changes found.
- `src/utils/cookingMethodRecommender.ts` — 35 matches down to 0 (2026-07-04, implemented by Gemini/Antigravity). Typed `MethodRecommendation` properties and scoring methods; replaced `any` casts with clean interface extensions. **Independently adversarially reviewed by Claude Code: PASS.** One inert micro-change (a `properties || {}` destructure guard) confirmed to affect only dead code (`_calculateLunarMethodAffinity`/`_calculateAspectMethodAffinity`, zero callers repo-wide).
- `src/utils/recommendation/methodRecommendation.ts` — 33 matches down to 0 (2026-07-04, implemented by Gemini/Antigravity). Extracted structured interface types for method recommendations and parameters; replaced implicit and explicit any type casts. **Independently adversarially reviewed by Claude Code: PASS.** No optional-chaining was tightened into throw-capable direct access; confirmed the one live caller (`src/app/api/commensal/guest-recommendations/route.ts`) is unaffected.
- `src/components/cuisines/CurrentMomentCuisineRecommendations.tsx` — 59 matches down to 3 intentional (2026-07-04, implemented by Gemini/Antigravity). Replaced unstructured object conversions with domain types; type-gated event handlers and sub-components. Also fixed a latent Chakra UI v2→v3 migration bug in passing: `spacing` props (dropped silently at runtime in Chakra v3) converted to the real `gap` prop. **Independently adversarially reviewed by Claude Code: PASS.** The 3 remaining `any` casts (`Card`, `Tooltip`, `Progress` v3 namespace objects) are genuinely necessary and documented inline. Confirmed still dead/unreferenced code repo-wide (exported from the barrel but not imported anywhere else) — lowest production risk in this campaign.
- `src/utils/ingredientRecommender.ts` — 73 matches down to 0 (2026-07-04, implemented by Gemini/Antigravity). Safe indexing type checks for planet/sign attributes; replaced `any` casts in retrograde/dignity/modality/aspect-matching algorithms. **Independently adversarially reviewed by Claude Code: PASS, with one disclosed scope exception.** 9 call sites (`calculateMercuryInfluence`, `calculatePlanetaryDayInfluence`, `calculatePlanetaryHourInfluence` x2, `recommendIngredients` x5) previously did `astrologicalProfile.rulingPlanets as string[]` with NO guard — this would throw `TypeError` at runtime for any ingredient lacking `astrologicalProfile`. The diff added `Array.isArray(astrologicalProfile?.rulingPlanets) ? ... : []` guards at all 9 sites, converting a live crash risk into a safe empty-array fallback. This is a genuine behavior change (crash → graceful degradation), not pure typing, so it technically breaks this campaign's "types-only" rule — **kept deliberately** since the new behavior is strictly safer and consistently applied, but flagged here for visibility. Also: a comment was added at line ~517 documenting (not fixing) a separate pre-existing bug in `calculateSeasonalScore` (seasonality accessed as a `Record` when the real type is `string[]`, so it always evaluates to `undefined`) — left alone per the preserve-and-document convention.
- `src/components/recommendations/EnhancedIngredientRecommender.tsx` — 110 matches down to 0, TWICE (2026-07-04 by Gemini/Antigravity + Claude Code fix; then regressed and redone fresh by Claude Code on 2026-07-05, see recovery note above). First pass: extracted structured interface types, refactored JSX mapping loops with type-safe IIFEs; adversarial review found a real, user-visible homepage regression in the "PAIRS WELL WITH" card block's fallback-to-`ingredient.affinities` path (nested inside an `if (!pr)` branch that skipped it whenever `pairingRecommendations` was a truthy-but-empty object) — fixed by restoring the original complementary → array-format → affinities → null priority order. Second pass (2026-07-05): the file had reverted to ~110 any-matches when a legitimate, unrelated user commit (`797454bd`) added real new features — a Vegetables category, compact-mode category filters, compact-mode search — on top of an older pre-cleanup base. Redone from scratch on the current file content: added ~10 local `*Like` interfaces (`AstroProfileLike`, `NutritionalProfileLike`, `SensoryProfileLike`, etc.), converted ~15 non-IIFE JSX conditionals into IIFEs with locally-typed variables, re-fixed the same `alchemicalProperties?: any` field (typed via `AlchemicalPropertiesType` from `@/types/alchemy`), and re-verified both "PAIRS WELL WITH" blocks preserve their exact fallback priority order under the new types. New feature code (Vegetables category, compact filters/search, `handleClearCategory`/`handleClearFilters`) verified untouched. **Independently adversarially reviewed by Claude Code: PASS.** This pair of files (with `ingredientRecommender.ts`) is the single highest production-risk target in the whole campaign — both are imported directly by the live homepage (`src/app/(alchm)/page.tsx`).
- `src/utils/astrology/core.ts` — fixed by Claude Code (2026-07-04), not part of the any-cleanup scan directly. Gemini's edit here removed the `as any` cast on a capitalized season/time-of-day string (going from `"spring"` to `"Spring"` via `.charAt(0).toUpperCase() + .slice(1)`) without replacing it with a type-accurate cast, leaving `TimeFactors.season`/`.timeOfDay` (typed as the capitalized literal unions `Season`/`TimeOfDay` from `@/types/time`) unassignable from the resulting plain `string` — this broke `bun run typecheck` repo-wide for a period while the edit was in-flight. Fixed by adding `as Season`/`as TimeOfDay` casts (the capitalization logic is correct, TS just can't narrow a string-concatenation result to a literal union on its own) and importing `Season`/`TimeOfDay` from `@/types/time`.
- `src/data/cuisineFlavorProfiles.ts` — 30 matches down to 0 (2026-07-04, implemented by Gemini/Antigravity). Added a local `MinimalRecipe` interface with exact property typing; cast the `getCuisineData` dishes record type-safely; removed unnecessary cast assertions from elemental/flavor similarity scoring. **Independently adversarially reviewed by Claude Code: real behavior change found, user sign-off obtained, kept as-is.** `calculateFlavorProfileMatch` (~line 1313) had a dormant double-lookup bug — it re-accessed `.flavorProfiles` on values that were already the flat flavor maps passed in by the caller, so that property was always `undefined` and the function always returned `0` regardless of input. The refactor incidentally dropped the redundant re-access, so the function now returns real, data-driven similarity scores. This changes actual recipe/cuisine ranking output (the 0.4-weight flavor component in `getRecipesForCuisineMatch`, which recipes clear the `>= 0.5` match threshold, and sort order) — a live product behavior change, not pure typing. **User explicitly chose to keep the fix** (2026-07-04) rather than revert to the old always-0 behavior. Minor secondary note: a `try/catch` inside the function was also removed; a throw there is now only caught by the outer `try` (different log message, same `matchScore: 0.5` fallback) — low risk, not reverted.
- `src/utils/astrology/positions.ts` & `src/utils/astrologyUtils.ts` — 33 matches down to 0 (2026-07-04, implemented by Gemini/Antigravity). Exported `PlanetPositionData` interface typed with `ZodiacSignType`; typed `planetaryPositions` parameters as `Record<string, PlanetPosition | AstronomyPlanetPositionData>`. **Independently adversarially reviewed by Claude Code: PASS, with one zero-risk deviation noted.** `astrologyUtils.ts` (~line 2333-2343), inside `transformItemsWithPlanetaryPositions`, similarly went from discarding a real `calculateAlchemicalProperties()` result behind an `as any` cast (which silently produced `.Spirit === undefined` for any consumer) to computing a real `{Spirit, Essence, Matter, Substance}` object — another incidental bug fix, not pure typing. **Kept as-is without needing user sign-off**: this specific function has zero live callers anywhere in `src` (`RecommendationAdapter.ts:29` stubs the re-exported name to `const transformItemsWithPlanetaryPositions: any = null`), so the behavior change is unreachable in production. 65 files depend on these two modules overall (broad blast radius for the file as a whole), but this particular change is isolated to dead code. Everything else in the diff (the `getFallbackPlanetaryPositions` simplification, new `PlanetPositionData`/`AstroChartData` fields) is confirmed behaviorally identical to the original.

Process note: this campaign now has a firm rule after the 2026-07-04 incidents — every any-cleanup diff gets an independent adversarial review (a fresh agent that re-runs `git diff`, `eslint`, `rg`, and `tsc` itself rather than trusting the implementer's self-report) before being trusted, regardless of which tool/session produced it. This is not optional polish: **4 of the 8 reviewed files in the Gemini round had real, non-typing bugs** that self-reports alone did not catch — two were crash-risk fixes kept as safe-direction exceptions, one was a live ranking-behavior change that got explicit user sign-off to keep, and one was a behavior change confirmed unreachable (dead code). Keep running `bunx eslint --max-warnings=0` centrally after any any-cleanup, and re-run `bun run typecheck` before trusting a batch — a shared-branch break in `astrology/core.ts` briefly failed the repo-wide gate for reasons unrelated to any single reviewed file, and has since been fixed.

**Batch4 (2026-07-04, Claude Code sole implementer — Gemini's usage exhausted).** All 5 files went through the full investigate→implement→adversarial-review pipeline within this session (not an external tool's self-report), and the review prompts were seeded with the exact "silently fixing a lookup bug changes behavior" landmine from the Gemini round to try to prevent a repeat. It still found one:

- `src/services/recipeData.ts` — 20 matches down to 1 intentional (`cuisineAny`, documented, since `mappingData.cuisine` is read both as an object and a string fallback with no clean non-any type covering both). **Review: PASS.** Notable technique: where the plan's proposed optional-field shape would have required optional chaining (turning a would-be crash into a silent `["all"]` fallback), non-null assertions (`!`) were used instead to preserve the exact original throw-on-missing-field behavior at zero runtime cost — this is now the house pattern for this exact situation. Flags a pre-existing, out-of-scope data-layer issue in `src/data/recipes/elementalMappings.ts` (sample entries cast `as any` at declaration to satisfy a type whose field names — `_elementalProperties`, `_astrologicalProfile` — don't match what's actually assigned) as the root cause of why this file needed such a permissive snapshot interface.
- `src/hooks/useAlchemicalRecommendations.ts` — 20 matches down to 0. **Review: PASS.** Sole importer `AlchemicalRecommendations.tsx` has zero importers itself anywhere in `src` (dead code, like `CurrentMomentCuisineRecommendations.tsx`) and also carries a `@ts-nocheck` directive, making this the lowest-risk file touched all campaign. 14 of the 20 casts lived inside a dead, never-invoked `_convertToLocalAlchemicalItem` helper — retyped in place rather than deleted, per types-only scope; flagged for a follow-up dead-code-removal PR.
- `src/calculations/culinary/seasonalAdjustments.ts` — 20 matches down to 0. **Review: PASS.** Every cast was pure redundant scaffolding over an already-correctly-typed `ElementalProperties` operand — cleanest file of the batch, no latent bugs found.
- `src/utils/elemental/transformations.ts` — 19 matches down to 0. **Review: PASS.** One local `LegacyAlchemicalFields` interface covers 3 ad-hoc fields (`uniqueness`, `planetaryInfluences`, `transformationScore`) not on the canonical `AlchemicalItem`/`ElementalItem` types. Flags (not fixed) that this file's exports appear to have no live production callers, and that `transformSingleItem`/`applyPlanetaryInfluence` blanket-cast return objects to `AlchemicalItem` without actually populating several required fields — pre-existing, out of scope.
- `src/utils/recommendation/ingredientRecommendation.ts` — 18 matches down to 0. **Review: ISSUES, fixed.** The implementer changed an unconditional `.base` property access to use `?.` inside a validity filter, which — for real ingredient data confirmed via grep (garlic, onions, peppers in `src/data/ingredients/vegetables/*.ts` all have `astrologicalProfile` without an `elementalAffinity` key) — converts a would-be `TypeError` crash into a silent filter-exclude. Independently confirmed this exact code path (`getAllIngredients` → `getRecommendedIngredients`/`getIngredientRecommendations`/`_getTopIngredientMatches`) has zero external callers anywhere in `src` (including through the `foodRecommendation.ts` re-export, which itself has zero importers), so no user sign-off was needed — fixed for consistency with the `recipeData.ts` precedent above: replaced `?.` with a non-null assertion (`elementalAffinity!`) to preserve the original throw-on-missing-field behavior exactly, and expanded the code comment to document both the missing-field and string-form latent bugs. Also flagged, not fixed: a `calculateSeasonalScore` param/runtime shape mismatch (`Ingredient` type has no `.season` field, only `.seasonality`, yet the real caller passes an `EnhancedIngredient` that does have `.season`), and a `getAllIngredients` "Eggs" category filter that checks `category === "egg"` when real protein data always uses `category: "protein"` (always-empty bucket, doesn't involve any `any` casts so wasn't in scope to fix).

**Wave1 (2026-07-05, self-gating pipeline, disrupted by a session usage limit — see recovery note above).** 38 files dispatched with a blast-radius self-check built into each file's own investigate stage. ~20 individual agent calls failed outright when the session limit hit; the pipeline framework retried many transparently, but 2 files (`AlchmKitchen.tsx`, `data/unified/enhancedIngredients.ts`) ended up with genuinely broken partial edits and were reverted rather than salvaged. Every file that did produce a diff got an independent adversarial review before being trusted (17 of them had never been reviewed at all due to the disruption) — found 2 real issues:

- `src/data/unified/cuisineIntegrations.ts` — 18 matches down to 3, **not** 0 as intended: the cleanup demonstrably stopped partway through one function (`getSeasonalFusionRecommendations`), leaving `Record<string, any>` on two lines (one broken across multiple lines) that the standard `rg` regex doesn't catch (`, any>` and a lone `any` on its own line both dodge `as any|: any|any\[\]|<any>`). Fixed by Claude Code: both retyped to `Record<string, unknown>` matching the pattern already used two lines above in the same function; also retyped an unrelated, never-populated `zodiacAlignment?: any` field to `unknown`. **Lesson: the standard any-scan regex has real blind spots — a broader `\ban y\b` word-boundary sweep is more reliable for verifying "0 remaining" claims.**
- `src/utils/recipe/recipeSchemaValidator.ts` — real behavior change, fixed by Claude Code: two call sites (`calculateRecipeSimilarity`'s ingredient-overlap mapping, `detectDuplicates`'s recipe lookup) changed unconditional `.name`/`.id` property access to optional chaining (`?.`), converting a `TypeError` crash on a null/undefined array entry into silent string-coercion (`'null'`) or silent exclusion. Since this validator's entire purpose is handling untrusted/malformed recipe data, a null entry is a realistic input, not a hypothetical — fixed by dropping the `?.` (the `Record<string, unknown>` cast already makes the property access type-safe without needing the optional chain) to restore the original throw-on-malformed-entry behavior exactly.
- The remaining 15 reviewed files (`data/recipes.ts`, `hooks/useCookingMethods.ts`, `lib/alchemical-kinetics.ts`, `lib/celestial-energy-calculator.ts`, `services/EnhancedAstrologyService.ts`, `services/SwissEphemerisService.ts`, `utils/buildQualityMonitor.ts`, `utils/cuisineAggregations.ts`, `utils/data/processing.ts`, `utils/hierarchicalSystemVerification.ts`, `utils/recipeFilters.ts`, `utils/recommendation/foodRecommendation.ts`, `utils/recommendationEngine.ts`, `utils/scriptReplacer.ts`, `utils/signVectors.ts`) — all **PASS**, no issues found. Note on `scriptReplacer.ts`: 6 `any` casts remain, all now individually commented `// Intentionally any:` — they guard ad-hoc globals (`window.lockdown`, `window.harden`) and a chrome-extension mock shape with no real TS declarations; forcing a fix would mean a broader reshape out of scope for a types-only pass. Treat as done.

**Wave2 (2026-07-05, same self-gating pipeline, hit a second session usage limit).** 30 more candidates dispatched. Notably, the self-gate correctly skipped the large majority as too high-risk to safely audit in this pass — confirming the campaign's blast-radius heuristics needed to be broader than initially scoped. Skipped with concrete reasons (not yet attempted, deferred to a dedicated future round):

- `src/data/ingredients/fruits/index.ts` — 8+ importers spanning live recommendation-scoring paths (`ingredientRecommender.ts`, `foodRecommender.ts`, `IngredientFilterService.ts`).
- `src/data/unified/ingredients.ts` — directly imported by the live API route `app/api/recommendations/ingredients/route.ts`, plus 14+ other importers.
- `src/data/ingredients/spices/index.ts` — 2-hop chain into the same live API route via `unified/ingredients.ts`, plus 5+ other importers.
- `src/services/planetaryScoring.ts` — live API route `app/api/recipes/refine/route.ts` and live page `app/recipes/page.tsx` both call it directly.
- `src/components/recipe/CosmicRecipeGenerator.tsx` — rendered directly on the live `/cosmic-recipe` page.
- `src/components/CuisineRecommender.tsx` — **dead/orphaned code**, superseded by `src/components/home/DynamicCuisineRecommender.tsx` (the file actually wired to live cuisine-recommendation UI). Flagged as a deletion candidate, not a typing target.
- `src/utils/naturalLanguageProcessor.ts` — **dead code**, zero importers anywhere in `src`. Flagged as a deletion candidate.
- (additional files skipped for similar reasons — see full task output if needed; not re-transcribed here for brevity)

Two files broke a second time with genuinely incomplete/broken partial edits from the session-limit cutoff and were reverted again: `src/data/unified/enhancedIngredients.ts` (now 0-for-2 across both waves — needs a smaller, more careful dedicated attempt rather than another large-batch try) and `src/services/UnifiedRecommendationService.ts` (confirmed dead code per grep — only referenced in markdown docs — so low urgency to redo). Two files did produce real, reviewed fixes:

- `src/utils/ingredientValidation.ts` — **Review: PASS.** Fully clean, zero remaining `any`.
- `src/data/unified/nutritional.ts` — **Review: ISSUES (incomplete, not a bug) → finished by Claude Code.** The session limit cut the cleanup off after 6 of 10 sites; the 4 remaining (`profileData as any` x2, `baseData as any`, `ingredientData as any`) were all the same established `Record<string, unknown>` boundary-cast pattern used elsewhere in the same file — completed directly, now 0 remaining.

**Process change starting 2026-07-05:** this campaign's work has now been swept into a stash by a concurrent process TWICE in one session (both fully recoverable, but costly in time). Going forward, a commit is made after each wave's full verification gate passes (typecheck/eslint/705-tests/diff-check all green), before starting the next wave — this doesn't get pushed without explicit request, but protects completed work from the next disruption. Committed as `bf19d156`.

**Wave3 (2026-07-05) — see the phantom-diff incident note above.** Of 30 dispatched, 7 were correctly self-skipped for legitimate blast-radius reasons (`ingredientUtils.ts` — 6 importers spanning live subsystems; `data/ingredients/index.ts` — 9 importers incl. a live home-page component; `astrologyApi.ts` — confirmed dead code, zero importers, safe but not yet worth doing; `ConfigurationService.ts` — confirmed dead code; `PlanetaryHourCard.tsx` — sole importer is a pure pass-through wrapper, worth a look but deferred this round; `astrologyDataProvider.ts` — sits directly upstream of the live core astrological-state pipeline; `AlchemicalApiClient.ts` — feeds the core alchemical calculation cluster). Of the 21 claimed "fixed," only 5 had real, surviving, verified diffs after independent ground-truth checking — committed as `21f80531`:

- `src/components/ElementalEnergyDisplay.tsx` — **Review: PASS.**
- `src/components/IngredientCard.tsx` — **Review: PASS.**
- `src/utils/cuisine/cuisineSauceProfiler.ts` — **Review: PASS.**
- `src/services/IngredientService.ts` — **Review: PASS.**
- `src/data/unified/enhancedIngredients.ts` — now 1-for-3 across three separate wave attempts. This final attempt landed a real diff (a `zodiacRuler: any → string` field fix, `UnifiedFlavorProfile`-typed fallback casts with documented preserved latent bugs) but was itself left 4 sites incomplete by the same wave3 disruption; finished directly by Claude Code (`seasonalPeak`/`nutritionalProfile`/`astrologicalPropertiesProfile` sites, the last of which preserves a pre-existing field-name typo — the code reads `.astrologicalPropertiesProfile`, which doesn't exist on `UnifiedIngredient`, only `.astrologicalProfile` does — so this is, and remains, always-`undefined` at runtime; not renamed/fixed, per the no-silent-fix rule).

The other **16 claimed-fixed files were never actually attempted successfully** and remain exactly as before (still have their original `any` usages): `enhancedAlchemicalUtils.ts`, `astrology/astrologicalValidation.ts`, `IngredientFilterService.ts`, `lib/services/planetary-agent-activation.ts`, `lib/monitoring/prometheus-metrics.ts`, `data/ingredients/grains/refinedGrains.ts`, `signVectorAdapters.ts`, `recipeCalculations.ts`, `menuPlanner/nutritionalCalculator.ts`, `kineticsFoodMatcher.ts`, `dynamicImport.ts`, `databaseCleanup.ts`, `cuisine/signatureIdentificationEngine.ts`, `types/guards.ts`, `types/alchemy.ts`, `services/AstrologizeApiCache.ts`, `hooks/usePlanetaryKinetics.ts`. These are legitimate remaining targets for a future wave — the underlying files themselves were not found risky, the attempts just didn't survive.

## Recommended Next Optimizations

1. Keep `@typescript-eslint/no-explicit-any` disabled globally for now.
   Turning it on globally would be too noisy. Instead, add targeted overrides for cleaned subtrees after each pass.

2. Create shared DB row helper utilities.
   Several services now have local helpers like `toNumber`, `toIsoString`, `readJsonColumn`, and row interfaces. A small shared module could reduce repetition once the pattern settles.

3. Attack one high-value subtree at a time.
   Good candidates:
   - `src/components/recommendations/EnhancedIngredientRecommender.tsx`
   - `src/utils/ingredientRecommender.ts`
   - `src/utils/recommendation/*`
   - `src/components/recommendations/EnhancedIngredientRecommender.tsx`

4. Prefer domain types over casts.
   For example, many casts are indexing elemental, nutritional, planetary, recipe, or ingredient objects. Add local `Record<...>` types, type guards, or normalizers instead of widening to `any`.

5. Add lint sub-commands for campaign work.
   Consider package scripts for:
   - lint all with zero warnings
   - lint changed files
   - lint a single subtree with stricter `no-explicit-any`
   - output suppression inventory

6. Continue reducing non-TypeScript suppressions.
   Total suppressions are now `77`. TypeScript suppressions are `0`, so the next suppression cleanup should focus on ordinary ESLint disables and whether they are still necessary.

## Suggested Opening Prompt For The Next Chat

```text
Continue the TypeScript linting improvement campaign in this repo. Start by reading docs/LINTING_SITUATION_NEXT_SESSION.md and checking the current git status. The active lint state should be clean: ESLint active warnings 0, TypeScript ESLint suppressions 0, total suppressions around 77.

Do not turn on no-explicit-any globally. Pick one narrow production-code hotspot from the explicit-any scan, preferably a service or utility with low UI blast radius. Replace casts with local domain types, type guards, or normalizers. Keep edits scoped, preserve behavior, and run:

bun run typecheck
bunx eslint --config eslint.config.mjs src --max-warnings=0
bun run test --passWithNoTests

If the change is broad or touches app routing/build behavior, also run bun run build. Summarize before/after counts and any remaining risk.
```
