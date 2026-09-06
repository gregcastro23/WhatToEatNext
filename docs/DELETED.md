# DELETED — module deletion register

Every `src/` module removed by the Phase 23 and Phase 24 dead-code passes, with
the evidence for each removal and an explicit judgement about **whether any
proposed functionality was lost**.

This register exists because "unreachable" and "unwanted" are not the same claim.
A reachability scan proves nothing runs a module *today*; it cannot tell you
whether someone built it on purpose and never finished wiring it up. That
distinction is resolved here from git history, per file.

| | |
|---|---|
| **Deleted** | 459 modules — 450 (Phase 24, PR #828) + 9 (Phase 23) |
| **Lines** | 127,031 |
| **Functionality genuinely at risk** | **11 modules / 4,165 LOC** — [Section A](#a-never-wired--functionality-built-and-never-connected) |
| **Nothing lost** | 448 modules / 122,866 LOC — Sections B–D |
| **Restore any file** | `git show 631bb256^:<path> > <path>` (Phase 23: `31014233^`) |

Nothing here is unrecoverable. Both deletion commits are on `master`'s history via
PR #828; any file can be restored byte-identically with one command.

---

## How each file was classified

Two independent signals, neither of them an opinion:

**1. Did anything import it at deletion time?** From the reachability graph built
by `bun run audit:dead-modules` (TypeScript compiler API — models `export *`
barrels, dynamic `import()`, `require()`, path aliases, Next.js conventions,
package.json script targets and `.d.ts` files).

**2. Did anything EVER import it, in the whole history?** `git log -S<token>`
over `src`, `scripts`, `__tests__`, `tests`, excluding the file itself. Commits
from this phase's own deletions are excluded — a mention inside a file that was
deleted in the same commit is not evidence the module was ever live.

Counts below cover Phase 24's 450 modules. Phase 23's 9 are all PRE-HISTORY
(4,459 LOC), giving 140 PRE-HISTORY and 127,031 LOC across both passes.

| Class | Files | LOC | Meaning | Functionality lost? |
|---|---:|---:|---|---|
| [**NEVER-WIRED**](#a-never-wired--functionality-built-and-never-connected) | **11** | **4,165** | Added by a real feature commit, never referenced by anything, ever | **Yes — see below** |
| [PRE-HISTORY](#b-pre-history--arrived-in-a-bulk-import-never-wired) | 131 | 29,238 | Arrived in the repo's initial bulk import, never referenced | No |
| [DE-WIRED](#c-de-wired--had-callers-that-were-deliberately-removed) | 129 | 33,036 | Had real importers; a later commit removed the last one | No — superseded on purpose |
| [SUBTREE](#d-subtree--downstream-of-a-dead-root) | 179 | 56,133 | Only ever imported by other deleted modules | No — explained by its root |

**Sanity check:** of the 450 files deleted in Phase 24, **zero** were imported by
any file that survives. Verified against the pre-deletion graph, and confirmed
empirically — `typecheck` 0 errors, full jest 333/333 suites, `build` exit 0.

---

## A. NEVER-WIRED — functionality built and never connected

These 11 modules were each added by a genuine, dated feature commit, and **no
commit in the repository's entire history ever referenced them from anywhere
else.** They compiled, they were reviewed, they were merged — and then nothing
was ever pointed at them.

This is the section to read before assuming the deletion was free.

### A.1 The WTEN migration left 8 ports unwired (3,462 LOC)

`docs/architecture/CLAUDE.md:55` records the `planetary_agents-main` UI migration
as **"all 11 sessions complete — plan file retired"**, and `:275` as **"fully
ported"**. That is true in the sense that the files landed. It is not true in the
sense that they were connected: 8 modules ported across sessions 2, 3, 4 and 6
were never imported by anything.

| Module | LOC | Ported by | What it provided |
|---|---:|---|---|
| `src/lib/degree-agent-matcher.ts` | 1,030 | `d1449d23` session 6 | `DegreeAgentMatcher`, `degreeAgentMatcher` — matches agents to zodiacal degrees; `AgentDegreeProfile`, `DegreeActivation`, `DegreePattern` |
| `src/lib/planetary-motion-tracker.ts` | 484 | `381a229c` session 4 | `PlanetaryMotionTracker`, `calculatePlanetaryVelocity`, `predictPlanetaryPosition` |
| `src/lib/elemental-reinforcement.ts` | 435 | `2020b307` session 3 | `calculateElementalReinforcementScore`, `getElementalCompatibility`, `analyzeElementalReinforcement` |
| `src/lib/alchemical-kinetics-sampler.ts` | 433 | `d1449d23` session 6 | `AlchemicalKineticsSampler`, `sampleHourlyAlchm`, `attachForceToSamples` |
| `src/lib/ephemeris/degree-calendar-map.ts` | 429 | `381a229c` session 4 | `buildAnnualCalendar`, `getDegreeForDate`, `findDatesForDegree` |
| `src/lib/structured-logger.ts` | 420 | `2020b307` session 3 | `logger`, `logAPIRequest`, `logAgentInteraction`, `logPlanetaryCalculation` |
| `src/hooks/useGalileoLog.ts` | 140 | `13718aa7` session 2 | `useGalileoLog` |
| `src/lib/kinetics-integration.ts` | 91 | `13718aa7` session 2 | `KineticsIntegration`, `EnhancedKineticData` |

⚠️ **Decision required.** These are the strongest candidates for "we lost
something." Two readings, and the register does not pick one for you:

- *The migration is finished and these were speculative ports* — the repo's own
  `docs/physics/PHYSICS_QUANTITY_MAP.md:209` independently lists
  `alchemical-kinetics-sampler.ts` and the `degree-agent-matcher` chain as dead
  "verified by importer trace, not assumption", and the last WTEN commit was
  **2026-05-29**, over three months before deletion. On this reading, deleting
  them is correct and overdue.
- *They are staged work awaiting a later wiring session that never came* — in
  which case the intent survives in this register and in git, and any of them can
  be restored in one command when the consuming feature is built.

`structured-logger.ts` deserves separate thought. The logger that survives
(`src/utils/logger.ts`) is console-based and dev-gated
(`const isDev = process.env.NODE_ENV !== "production"`); it emits
`console.log`/`console.info` strings, not structured records. The deleted port
added `LogContext`/`LogEntry` plus `logAPIRequest`, `logAgentInteraction` and
`logPlanetaryCalculation`. So this is a real capability gap, not a duplicate —
if observability work is planned, restore this rather than rewrite it.

### A.2 `src/constants/environmentalResponseProfiles.ts` — 455 LOC

Added `2026-07-31` by `bd5badc6`, *"feat(environment): Dual-Baseline ingestion —
elevation trunk + daily anomaly (#680)"*. Exports `REGIME_KINETICS` and
`ENVIRONMENTAL_RESPONSE_PROFILES`.

⚠️ **The most surprising entry in this register — verify this one before
accepting the deletion.** Unlike the WTEN ports, this is recent and its feature
shipped: `environmentalIngestService.ts`, `environmentalQueries.ts` and
`kitchenSettingsService.ts` are all live and unaffected. Those services consume
`src/types/environmentalResponseSchema.ts` — the *schema* — and never read this
*profiles* table.

Two things make it notable rather than routine:

- **There is no duplicate.** `REGIME_KINETICS` and `ENVIRONMENTAL_RESPONSE_PROFILES`
  appear nowhere else in `src/` or `backend/`, and the live services do not inline
  equivalent values. So this is not "two copies, one unused" — it is a table that
  was authored and never wired to the shipped feature it was written for.
- **Its entries carry provenance.** Each is shaped
  `{ value, unit, basis, source, tunable }` — the project's own defensible-values
  convention, where a constant must name the basis it was derived from. That is
  expensive, deliberate work, and it is the hardest kind of content to
  reconstruct later from the number alone.

Recommend restoring this one, or confirming with whoever shipped #680 that the
consumer was intentionally dropped.

### A.3 `src/data/alchm/index.ts` — 156 LOC

Added `2026-07-20` by `86d2a32d`, *"feat(alchm): typed reader for the model, and
correct the Saturn fill-down"*. Exports `SYNTHESIS_POOL`, `openCells`,
`resolveSlots`, `netTerms`, `getGrids`, `MODEL_VERSION` and the `GridTerm` /
`GridCell` / `RuntimeSlot` types.

A **typed reader** for `src/data/alchm/model.json`. The model file itself is
**not deleted and remains live** — but its only consumer,
`src/__tests__/data/alchmModel.test.ts`, imports the raw JSON directly and
bypasses the reader. So the typing layer was built, and everything kept reading
the untyped JSON around it. Restoring it is the right move if anything is going
to consume that model in typed form.

### A.4 `src/components/auth/AuthScreens.tsx` — 92 LOC

Added `2026-05-21` by `9b2d7530`, *"feat(auth): add AuthScreens sign-in/error/
onboarding components"*. Exports `SignInScreen`, `AuthErrorScreen`,
`OnboardingFlow`.

Three auth screens that were never routed. The live app reaches sign-in, auth
errors and onboarding through other components, so these are a parallel unused
implementation rather than a gap — but the names suggest a designed flow, and
`docs/architecture/CLAUDE.md` references `src/components/auth/AuthScreens`.
Low risk, worth a glance if the auth flow is being revisited.

---

## B. PRE-HISTORY — arrived in a bulk import, never wired

**131 files / 29,238 LOC.** Present in the repository from its first commit (or
one of two early bulk checkpoints) and never referenced by anything afterwards.

The three commits are not feature work — they are imports:

| Commit | Date | Scale | Subject |
|---|---|---|---|
| `04e9fa72` | 2026-04-30 | 1,825 files / 1.4M insertions | *"feat(cuisines): create dedicated premium cuisines page"* — **the repository root commit**; the subject describes one change in a wholesale import |
| `e38fc601` | 2026-05-08 | 1,851 files / 1.8M insertions | *"m1checkpoint"* |
| `e66bc30a` | 2026-05-08 | 4,699 files / 2.0M insertions | *"fix: production UI/UX robustness pass"* |

**No functionality was lost.** These modules predate the project's real history,
carry no intent signal from their commit message, and were never wired in the
lifetime of this repository. All 9 Phase 23 deletions also fall in this class
(`buildQualityMonitor.ts`, `automatedQualityAssurance.ts`, `BuildValidator.ts`,
`typescriptCampaignTrigger.ts`, `LivePlanetaryTracker.tsx`, `auth-middleware.ts`,
`buildSystemRepair.ts`, `nextConfigOptimizer.ts`, `utils/common/index.ts`).

---

## C. DE-WIRED — had callers that were deliberately removed

**129 files / 33,036 LOC.** Each had real importers at some point; a later commit
removed the last one, leaving the module orphaned. The removal is the evidence of
intent: someone decided this code was superseded and unhooked it, but did not
delete it.

Commits that unhooked the most modules:

| Modules | Commit | Subject |
|---:|---|---|
| 16 | `e38fc601` | m1checkpoint |
| 5 | `2026-05-18` | feat(alchm): Phase 2 redesign — nav IA, auth followups, sessions API |
| 5 | `2026-06-02` | chore(cleanup): remove Tier 3 dead recommendation and astrology services |
| 3 | `2026-06-02` | Tier 2 code-completeness + dead-recommender cleanup (#500) |
| 3 | `2026-08-31` | feat(types): Phase 10 type cast remediation |
| 3 | `2026-08-10` | refactor(premium): retire the subscription tier |
| 2 | `2026-06-09` | v4.0: SpacetimeDB live-state layer |

**No functionality was lost.** This class is the backlog of earlier cleanups that
unhooked code without removing it — including the premium-tier retirement and two
explicit dead-recommender passes. Phase 24 finishes work those commits started.

---

## D. SUBTREE — downstream of a dead root

**179 files / 56,133 LOC.** Only ever imported by other modules in the deleted
set — 245 dead→dead import edges in total. These are the interiors of dead
feature subtrees: their loss is entirely explained by the loss of the root that
led to them, and none of them was independently reachable.

This is also why the deletion is one commit rather than several. Splitting it by
directory would produce intermediate commits in which a surviving dead module
imports a deleted one, breaking `git bisect`.

Representative roots and what they took with them: `src/components/lazy/index.tsx`
(a lazy-loading barrel with no importer, holding `dynamic()` imports of
`PlanetaryHourDisplay`, `EnergyVisualization`, `CelestialEventNotifications`);
`src/components/ClientWrapper.tsx` (took `Clock.tsx` and the whole
`ChartContext/` directory); `src/components/menu-planner/index.ts` (an unimported
barrel — the live `/menu-planner` route imports its components individually).

---

## E. What was deliberately NOT deleted

**53 modules are production-unreachable but imported by a test.** They are not in
this register and remain in the tree. Several carry the only executable
specification of the alchemical maths — `src/calculations/alchemicalCalculations.ts`,
`enhancedAlchemicalMatching.ts`, `core/elementalCalculations.ts` among them.

Deleting a module and its test together silently discards the specification of
behaviour that may still be wanted. These need per-file judgement against
`docs/physics/PHYSICS_QUANTITY_MAP.md`, not a bulk pass.

`bun run audit:dead-modules` reports them under **Test-only reachable**.

---

## F. Restoring

```bash
# Phase 24 (450 modules)
git show 631bb256^:src/lib/structured-logger.ts > src/lib/structured-logger.ts

# Phase 23 (9 modules)
git show 31014233^:src/utils/buildQualityMonitor.ts > src/utils/buildQualityMonitor.ts

# everything a commit deleted, at once
git checkout 631bb256^ -- $(git show 631bb256 --diff-filter=D --name-only --format='')
```

A restored module will be reported dead again by `bun run audit:dead-modules`
until something imports it. That is the intended behaviour: restore it *with* its
consumer, not on its own.

---

## G. Keeping this register honest

`bun run audit:dead-modules` must report **`UNREACHABLE: 0`** on `master`. If it
does not, modules have gone dead since this register was written and belong in a
new section rather than a silent deletion.

The audit's criterion is covered by 31 tests in `bun run test:gates`, including
red-proofs for the two classes that this pass discovered only by deleting the set
and running the gates: the repo-root `__tests__/` directory, and `.d.ts` files
(invisible to `bun run typecheck` entirely, because `tsconfig.json` sets
`skipLibCheck: true`).

<!-- APPENDIX -->

---

## Appendix — every deleted module

`NEVER-WIRED` = built by a feature commit, never referenced · `PRE-HISTORY` = arrived in a bulk import ·
`DE-WIRED` = had importers, later removed · `SUBTREE` = only imported by other deleted modules.

<details>
<summary><b>src/utils</b> — 120 files, 34,091 LOC</summary>

| Module | LOC | Class | Added |
|---|---:|---|---|
| `src/utils/recipeMatching.ts` | 1623 | SUBTREE | 2026-04-30 `04e9fa72` |
| `src/utils/ingredientValidation.ts` | 1312 | DE-WIRED | 2026-04-30 `04e9fa72` |
| `src/utils/cookingMethodTips.ts` | 1212 | SUBTREE | 2026-04-30 `04e9fa72` |
| `src/utils/naturalLanguageProcessor.ts` | 1063 | PRE-HISTORY | 2026-04-30 `04e9fa72` |
| `src/utils/planetaryValidation.ts` | 999 | DE-WIRED | 2026-04-30 `04e9fa72` |
| `src/utils/recipe/recipeFiltering.ts` | 879 | SUBTREE | 2026-04-30 `04e9fa72` |
| `src/utils/recipe/recipeCore.ts` | 854 | PRE-HISTORY | 2026-04-30 `04e9fa72` |
| `src/utils/recipeFilters.ts` | 770 | SUBTREE | 2026-04-30 `04e9fa72` |
| `src/utils/cuisineTypes.ts` | 708 | DE-WIRED | 2026-04-30 `04e9fa72` |
| `src/utils/data/processing.ts` | 687 | SUBTREE | 2026-04-30 `04e9fa72` |
| `src/utils/cuisine/kineticCuisineCompatibility.ts` | 685 | SUBTREE | 2026-04-30 `04e9fa72` |
| `src/utils/elemental/transformations.ts` | 679 | SUBTREE | 2026-04-30 `04e9fa72` |
| `src/utils/cuisine/thermodynamicResonance.ts` | 677 | SUBTREE | 2026-04-30 `04e9fa72` |
| `src/utils/cuisine/cuisineComputationCache.ts` | 641 | SUBTREE | 2026-04-30 `04e9fa72` |
| `src/utils/hierarchicalSystemVerification.ts` | 629 | DE-WIRED | 2026-04-30 `04e9fa72` |
| `src/utils/developmentExperienceOptimizations.ts` | 620 | PRE-HISTORY | 2026-04-30 `04e9fa72` |
| `src/utils/recommendation/foodRecommendation.ts` | 615 | DE-WIRED | 2026-04-30 `04e9fa72` |
| `src/utils/recipe/recipeEnrichment.ts` | 610 | SUBTREE | 2026-04-30 `04e9fa72` |
| `src/utils/cuisine/circuitBasedRecipeRanking.ts` | 609 | SUBTREE | 2026-04-30 `04e9fa72` |
| `src/utils/kineticsFoodMatcher.ts` | 601 | SUBTREE | 2026-04-30 `04e9fa72` |
| `src/utils/cuisine/culturalInfluenceEngine.ts` | 582 | SUBTREE | 2026-04-30 `04e9fa72` |
| `src/utils/cuisine/enhancedCuisineRecommendationEngine.ts` | 580 | SUBTREE | 2026-04-30 `04e9fa72` |
| `src/utils/seasonalCalculations.ts` | 569 | DE-WIRED | 2026-04-30 `04e9fa72` |
| `src/utils/cuisine/signatureIdentificationEngine.ts` | 551 | SUBTREE | 2026-04-30 `04e9fa72` |
| `src/utils/recipe/recipeValidation.ts` | 546 | SUBTREE | 2026-04-30 `04e9fa72` |
| `src/utils/cuisine/planetaryPatternAnalysis.ts` | 525 | SUBTREE | 2026-04-30 `04e9fa72` |
| `src/utils/typeValidation.ts` | 488 | DE-WIRED | 2026-04-30 `04e9fa72` |
| `src/utils/ephemerisParser.ts` | 480 | PRE-HISTORY | 2026-04-30 `04e9fa72` |
| `src/utils/ingredientDataNormalizer.ts` | 473 | PRE-HISTORY | 2026-04-30 `04e9fa72` |
| `src/utils/recipe/recipeUtils.ts` | 458 | SUBTREE | 2026-04-30 `04e9fa72` |
| `src/utils/chakraFoodUtils.ts` | 457 | SUBTREE | 2026-04-30 `04e9fa72` |
| `src/utils/recommendation/cuisineRecommendation.ts` | 424 | SUBTREE | 2026-04-30 `04e9fa72` |
| `src/utils/recipe/recipeComputationCache.ts` | 419 | SUBTREE | 2026-04-30 `04e9fa72` |
| `src/utils/stateManager.ts` | 412 | SUBTREE | 2026-04-30 `04e9fa72` |
| `src/utils/natalChartRecommendations.ts` | 392 | PRE-HISTORY | 2026-04-30 `04e9fa72` |
| `src/utils/swissephCalculations.ts` | 392 | PRE-HISTORY | 2026-05-08 `e38fc601` |
| `src/utils/recipe/recipeAdapter.ts` | 366 | SUBTREE | 2026-04-30 `04e9fa72` |
| `src/utils/dependencyValidation.ts` | 365 | PRE-HISTORY | 2026-04-30 `04e9fa72` |
| `src/utils/astrologyValidation.ts` | 351 | DE-WIRED | 2026-04-30 `04e9fa72` |
| `src/utils/dynamicImport.ts` | 341 | SUBTREE | 2026-04-30 `04e9fa72` |
| `src/utils/typeSafety.ts` | 321 | DE-WIRED | 2026-04-30 `04e9fa72` |
| `src/utils/enhancedAlchemicalUtils.ts` | 316 | PRE-HISTORY | 2026-04-30 `04e9fa72` |
| `src/utils/statePreservation.ts` | 303 | SUBTREE | 2026-04-30 `04e9fa72` |
| `src/utils/planetInfoUtils.ts` | 302 | SUBTREE | 2026-04-30 `04e9fa72` |
| `src/utils/elemental/compatibility.ts` | 300 | SUBTREE | 2026-04-30 `04e9fa72` |
| `src/utils/signVectors.ts` | 287 | SUBTREE | 2026-04-30 `04e9fa72` |
| `src/utils/flavorProfiles.ts` | 281 | DE-WIRED | 2026-04-30 `04e9fa72` |
| `src/utils/userChartHelpers.ts` | 247 | PRE-HISTORY | 2026-04-30 `04e9fa72` |
| `src/utils/chromeApiInitializer.ts` | 241 | PRE-HISTORY | 2026-04-30 `04e9fa72` |
| `src/utils/alchemicalCalculations.ts` | 233 | SUBTREE | 2026-04-30 `04e9fa72` |
| `src/utils/calculationCache.ts` | 222 | DE-WIRED | 2026-04-30 `04e9fa72` |
| `src/utils/cuisine/index.ts` | 206 | SUBTREE | 2026-04-30 `04e9fa72` |
| `src/utils/cuisineResolver.ts` | 197 | PRE-HISTORY | 2026-04-30 `04e9fa72` |
| `src/utils/timeUtils.ts` | 194 | PRE-HISTORY | 2026-04-30 `04e9fa72` |
| `src/utils/safeAccess.ts` | 184 | SUBTREE | 2026-04-30 `04e9fa72` |
| `src/utils/databaseCleanup.ts` | 177 | SUBTREE | 2026-04-30 `04e9fa72` |
| `src/utils/planetCalculations.ts` | 175 | PRE-HISTORY | 2026-04-30 `04e9fa72` |
| `src/utils/withRenderTracking.tsx` | 174 | PRE-HISTORY | 2026-04-30 `04e9fa72` |
| `src/utils/signVectorAdapters.ts` | 164 | PRE-HISTORY | 2026-04-30 `04e9fa72` |
| `src/utils/performance.ts` | 155 | DE-WIRED | 2026-04-30 `04e9fa72` |
| `src/utils/stateValidator.ts` | 155 | SUBTREE | 2026-04-30 `04e9fa72` |
| `src/utils/lazyLoading.ts` | 153 | SUBTREE | 2026-04-30 `04e9fa72` |
| `src/utils/scriptReplacer.ts` | 151 | DE-WIRED | 2026-04-30 `04e9fa72` |
| `src/utils/elemental/elementCompatibility.ts` | 145 | SUBTREE | 2026-04-30 `04e9fa72` |
| `src/utils/astronomiaCalculator.ts` | 142 | PRE-HISTORY | 2026-04-30 `04e9fa72` |
| `src/utils/nutritionalUtils.ts` | 134 | SUBTREE | 2026-04-30 `04e9fa72` |
| `src/utils/cuisine/cuisineUtils.ts` | 124 | DE-WIRED | 2026-04-30 `04e9fa72` |
| `src/utils/timingUtils.ts` | 119 | PRE-HISTORY | 2026-04-30 `04e9fa72` |
| `src/utils/cuisineUtils.ts` | 115 | SUBTREE | 2026-04-30 `04e9fa72` |
| `src/utils/common/arrayUtils.ts` | 105 | SUBTREE | 2026-04-30 `04e9fa72` |
| `src/utils/astroEvents.ts` | 102 | PRE-HISTORY | 2026-04-30 `04e9fa72` |
| `src/utils/commonUtils.ts` | 100 | PRE-HISTORY | 2026-04-30 `04e9fa72` |
| `src/utils/strictNullChecksHelper.ts` | 99 | PRE-HISTORY | 2026-04-30 `04e9fa72` |
| `src/utils/recipe/index.ts` | 97 | PRE-HISTORY | 2026-04-30 `04e9fa72` |
| `src/utils/recipeCalculations.ts` | 96 | DE-WIRED | 2026-04-30 `04e9fa72` |
| `src/utils/testRecommendations.ts` | 91 | SUBTREE | 2026-04-30 `04e9fa72` |
| `src/utils/validateIngredients.ts` | 91 | PRE-HISTORY | 2026-04-30 `04e9fa72` |
| `src/utils/errorHandler.ts` | 90 | SUBTREE | 2026-04-30 `04e9fa72` |
| `src/utils/kineticsAnalytics.ts` | 89 | PRE-HISTORY | 2026-04-30 `04e9fa72` |
| `src/utils/moonTimes.ts` | 82 | SUBTREE | 2026-04-30 `04e9fa72` |
| `src/utils/solarPositions.ts` | 80 | SUBTREE | 2026-04-30 `04e9fa72` |
| `src/utils/elemental/index.ts` | 74 | PRE-HISTORY | 2026-04-30 `04e9fa72` |
| `src/utils/stringUtils.ts` | 69 | DE-WIRED | 2026-04-30 `04e9fa72` |
| `src/utils/feedback.ts` | 67 | DE-WIRED | 2026-04-30 `04e9fa72` |
| `src/utils/typeGuards/astrologicalGuards.ts` | 62 | PRE-HISTORY | 2026-04-30 `04e9fa72` |
| `src/utils/globalDominantElement.ts` | 61 | PRE-HISTORY | 2026-04-30 `04e9fa72` |
| `src/utils/constants/elements.ts` | 58 | SUBTREE | 2026-04-30 `04e9fa72` |
| `src/utils/security.ts` | 56 | DE-WIRED | 2026-04-30 `04e9fa72` |
| `src/utils/constants/lunar.ts` | 52 | SUBTREE | 2026-04-30 `04e9fa72` |
| `src/utils/calculationUtils.ts` | 51 | PRE-HISTORY | 2026-04-30 `04e9fa72` |
| `src/utils/awaitThenableUtils.ts` | 50 | PRE-HISTORY | 2026-04-30 `04e9fa72` |
| `src/utils/index.ts` | 50 | PRE-HISTORY | 2026-04-30 `04e9fa72` |
| `src/utils/elementalScoring.ts` | 45 | PRE-HISTORY | 2026-04-30 `04e9fa72` |
| `src/utils/formatElementalAffinity.ts` | 44 | PRE-HISTORY | 2026-04-30 `04e9fa72` |
| `src/utils/theme.ts` | 44 | SUBTREE | 2026-04-30 `04e9fa72` |
| `src/utils/herbUtils.ts` | 43 | PRE-HISTORY | 2026-04-30 `04e9fa72` |
| `src/utils/clientEffect.ts` | 38 | PRE-HISTORY | 2026-04-30 `04e9fa72` |
| `src/utils/globalErrorHandler.ts` | 34 | SUBTREE | 2026-04-30 `04e9fa72` |
| `src/utils/testUtils.ts` | 33 | DE-WIRED | 2026-04-30 `04e9fa72` |
| `src/utils/lunarUtils.ts` | 32 | DE-WIRED | 2026-04-30 `04e9fa72` |
| `src/utils/alchemicalResults.ts` | 31 | DE-WIRED | 2026-04-30 `04e9fa72` |
| `src/utils/constants.ts` | 31 | PRE-HISTORY | 2026-04-30 `04e9fa72` |
| `src/utils/error.ts` | 31 | DE-WIRED | 2026-04-30 `04e9fa72` |
| `src/utils/env.ts` | 30 | SUBTREE | 2026-04-30 `04e9fa72` |
| `src/utils/data/index.ts` | 29 | PRE-HISTORY | 2026-04-30 `04e9fa72` |
| `src/utils/lunarMultiplier.ts` | 29 | SUBTREE | 2026-04-30 `04e9fa72` |
| `src/utils/constants/seasons.ts` | 28 | SUBTREE | 2026-04-30 `04e9fa72` |
| `src/utils/elementalMappings/cookingMethods.ts` | 27 | DE-WIRED | 2026-04-30 `04e9fa72` |
| `src/utils/initialize.ts` | 26 | DE-WIRED | 2026-04-30 `04e9fa72` |
| `src/utils/tarotMappings.ts` | 26 | SUBTREE | 2026-04-30 `04e9fa72` |
| `src/utils/monica/compatibility.ts` | 25 | DE-WIRED | 2026-04-30 `04e9fa72` |
| `src/utils/toolingDataDir.ts` | 25 | SUBTREE | 2026-05-12 `5a5d4f14` |
| `src/utils/retryChunkLoad.ts` | 24 | PRE-HISTORY | 2026-04-30 `04e9fa72` |
| `src/utils/astrology/index.ts` | 23 | PRE-HISTORY | 2026-04-30 `04e9fa72` |
| `src/utils/numberUtils.ts` | 22 | DE-WIRED | 2026-04-30 `04e9fa72` |
| `src/utils/themeScript.ts` | 12 | PRE-HISTORY | 2026-04-30 `04e9fa72` |
| `src/utils/recipe/recipeMatching.ts` | 10 | SUBTREE | 2026-04-30 `04e9fa72` |
| `src/utils/seasonUtils.ts` | 8 | PRE-HISTORY | 2026-04-30 `04e9fa72` |
| `src/utils/astrologyUtils/index.ts` | 7 | PRE-HISTORY | 2026-04-30 `04e9fa72` |
| `src/utils/common/styleUtils.ts` | 1 | DE-WIRED | 2026-04-30 `04e9fa72` |

</details>

<details>
<summary><b>src/components</b> — 104 files, 23,364 LOC</summary>

| Module | LOC | Class | Added |
|---|---:|---|---|
| `src/components/cuisines/CurrentMomentCuisineRecommendations.tsx` | 2085 | SUBTREE | 2026-04-30 `04e9fa72` |
| `src/components/CookingMethods.tsx` | 1979 | DE-WIRED | 2026-05-08 `e38fc601` |
| `src/components/CuisineRecommender.tsx` | 1347 | DE-WIRED | 2026-05-08 `e38fc601` |
| `src/components/PlanetaryCalculationsDemo.tsx` | 1017 | PRE-HISTORY | 2026-04-30 `04e9fa72` |
| `src/components/menu-planner/SmartRecommendations.tsx` | 818 | SUBTREE | 2026-04-30 `04e9fa72` |
| `src/components/home/CuisinePreview.tsx` | 773 | PRE-HISTORY | 2026-04-30 `04e9fa72` |
| `src/components/SauceRecommender.tsx` | 770 | DE-WIRED | 2026-04-30 `04e9fa72` |
| `src/components/CookingMethodsSection.tsx` | 688 | SUBTREE | 2026-04-30 `04e9fa72` |
| `src/components/menu-planner/RecipeQuickView.tsx` | 594 | SUBTREE | 2026-04-30 `04e9fa72` |
| `src/components/menu-planner/InlineNutritionDashboard.tsx` | 556 | SUBTREE | 2026-04-30 `04e9fa72` |
| `src/components/auth/OnboardingWizard.tsx` | 517 | SUBTREE | 2026-04-30 `04e9fa72` |
| `src/components/menu-planner/CircuitMetricsPanel.tsx` | 484 | SUBTREE | 2026-04-30 `04e9fa72` |
| `src/components/recommendations/KalchmRecommender.tsx` | 442 | PRE-HISTORY | 2026-04-30 `04e9fa72` |
| `src/components/MoonDisplay.tsx` | 413 | DE-WIRED | 2026-04-30 `04e9fa72` |
| `src/components/PlanetaryHourDisplay.tsx` | 406 | SUBTREE | 2026-04-30 `04e9fa72` |
| `src/components/EnergyVisualization.tsx` | 380 | SUBTREE | 2026-04-30 `04e9fa72` |
| `src/components/BackendStatus.tsx` | 377 | DE-WIRED | 2026-04-30 `04e9fa72` |
| `src/components/home/IngredientPreview.tsx` | 356 | PRE-HISTORY | 2026-05-08 `e38fc601` |
| `src/components/CelestialEventNotifications.tsx` | 338 | SUBTREE | 2026-04-30 `04e9fa72` |
| `src/components/NutritionalDataFetcher.tsx` | 336 | PRE-HISTORY | 2026-04-30 `04e9fa72` |
| `src/components/ChakraEnergiesDisplay.tsx` | 326 | SUBTREE | 2026-04-30 `04e9fa72` |
| `src/components/AlchmKitchen.tsx` | 305 | DE-WIRED | 2026-04-30 `04e9fa72` |
| `src/components/PlanetInfoModal.tsx` | 294 | DE-WIRED | 2026-04-30 `04e9fa72` |
| `src/components/CuisineSelector.tsx` | 283 | DE-WIRED | 2026-04-30 `04e9fa72` |
| `src/components/IngredientMapper.tsx` | 282 | PRE-HISTORY | 2026-04-30 `04e9fa72` |
| `src/components/TarotFoodDisplay.tsx` | 282 | PRE-HISTORY | 2026-04-30 `04e9fa72` |
| `src/components/PlanetaryPositionInitializer.tsx` | 279 | DE-WIRED | 2026-04-30 `04e9fa72` |
| `src/components/IngredientCard.tsx` | 276 | DE-WIRED | 2026-05-08 `e38fc601` |
| `src/components/profile/AlchemicalDashboard.tsx` | 275 | PRE-HISTORY | 2026-04-30 `04e9fa72` |
| `src/components/nav/LabHeader.tsx` | 239 | DE-WIRED | 2026-05-18 `a3df7b27` |
| `src/components/menu-builder/DayCard.tsx` | 228 | DE-WIRED | 2026-04-30 `04e9fa72` |
| `src/components/menu-planner/MealCircuitBadge.tsx` | 216 | SUBTREE | 2026-04-30 `04e9fa72` |
| `src/components/economy/YieldMultiplierCard.tsx` | 202 | DE-WIRED | 2026-04-30 `04e9fa72` |
| `src/components/AlchemicalRecommendations.tsx` | 198 | DE-WIRED | 2026-04-30 `04e9fa72` |
| `src/components/menu-planner/GuestAlchemistPanel.tsx` | 178 | PRE-HISTORY | 2026-04-30 `04e9fa72` |
| `src/components/HomeMethodsComponent.tsx` | 172 | DE-WIRED | 2026-04-30 `04e9fa72` |
| `src/components/AmazonCartForm.tsx` | 169 | SUBTREE | 2026-05-08 `e38fc601` |
| `src/components/home/HeroSection.tsx` | 164 | DE-WIRED | 2026-04-30 `04e9fa72` |
| `src/components/economy/BlurredLedgerPreview.tsx` | 160 | DE-WIRED | 2026-04-30 `04e9fa72` |
| `src/components/recommendations/recommendationTransforms.ts` | 152 | SUBTREE | 2026-08-20 `a70997aa` |
| `src/components/NutritionalDisplay.tsx` | 148 | PRE-HISTORY | 2026-04-30 `04e9fa72` |
| `src/components/astrological/ZodiacSelector.tsx` | 130 | SUBTREE | 2026-04-30 `04e9fa72` |
| `src/components/menu-builder/WeekProgress.tsx` | 130 | DE-WIRED | 2026-04-30 `04e9fa72` |
| `src/components/profile/BirthDataForm.tsx` | 130 | DE-WIRED | 2026-04-30 `04e9fa72` |
| `src/components/astrological/SeasonSelector.tsx` | 123 | SUBTREE | 2026-04-30 `04e9fa72` |
| `src/components/lazy/index.tsx` | 121 | PRE-HISTORY | 2026-04-30 `04e9fa72` |
| `src/components/recommendations/RecommendationStats.tsx` | 119 | SUBTREE | 2026-08-20 `a70997aa` |
| `src/components/menu-builder/PlanetaryHourIndicator.tsx` | 118 | SUBTREE | 2026-04-30 `04e9fa72` |
| `src/components/LazyAlchemicalEngine.tsx` | 116 | PRE-HISTORY | 2026-04-30 `04e9fa72` |
| `src/components/GlobalPopup.tsx` | 114 | DE-WIRED | 2026-04-30 `04e9fa72` |
| `src/components/home/PlanetaryStatusBar.tsx` | 107 | PRE-HISTORY | 2026-04-30 `04e9fa72` |
| `src/components/ZodiacSign.tsx` | 99 | DE-WIRED | 2026-04-30 `04e9fa72` |
| `src/components/filters.tsx` | 99 | DE-WIRED | 2026-04-30 `04e9fa72` |
| `src/components/nav/CelestialHeaderClock.tsx` | 97 | SUBTREE | 2026-05-18 `a3df7b27` |
| `src/components/auth/AuthScreens.tsx` | 92 | NEVER-WIRED | 2026-05-21 `9b2d7530` |
| `src/components/recommendations/RecommendationFilters.tsx` | 89 | SUBTREE | 2026-08-20 `a70997aa` |
| `src/components/Recipe.tsx` | 87 | DE-WIRED | 2026-04-30 `04e9fa72` |
| `src/components/PlanetaryHourCard.tsx` | 86 | SUBTREE | 2026-04-30 `04e9fa72` |
| `src/components/AlchemicalPropertiesDisplay.tsx` | 84 | SUBTREE | 2026-04-30 `04e9fa72` |
| `src/components/RecipeAmazonCart.tsx` | 84 | PRE-HISTORY | 2026-05-08 `e66bc30a` |
| `src/components/ThemeToggle.tsx` | 77 | DE-WIRED | 2026-04-30 `04e9fa72` |
| `src/components/MethodImage.tsx` | 76 | DE-WIRED | 2026-04-30 `04e9fa72` |
| `src/components/recommendations/RecommendationSections.tsx` | 75 | SUBTREE | 2026-08-20 `a70997aa` |
| `src/components/menu-planner/GuestSelector.tsx` | 72 | PRE-HISTORY | 2026-04-30 `04e9fa72` |
| `src/components/PlanetaryTimeDisplay.tsx` | 70 | DE-WIRED | 2026-04-30 `04e9fa72` |
| `src/components/premium/CosmicVeilOverlay.tsx` | 68 | SUBTREE | 2026-05-25 `79f06e83` |
| `src/components/CosmicRecipeWidget.tsx` | 67 | PRE-HISTORY | 2026-04-30 `04e9fa72` |
| `src/components/DebugInfo.tsx` | 65 | PRE-HISTORY | 2026-04-30 `04e9fa72` |
| `src/components/OptimizedComponentWrapper.tsx` | 63 | DE-WIRED | 2026-04-30 `04e9fa72` |
| `src/components/ElementalDisplay.tsx` | 58 | PRE-HISTORY | 2026-04-30 `04e9fa72` |
| `src/components/premium/TemporalFrictionGate.tsx` | 58 | DE-WIRED | 2026-05-25 `79f06e83` |
| `src/components/nav/MobileNavToggle.tsx` | 56 | DE-WIRED | 2026-04-30 `04e9fa72` |
| `src/components/nav/NavAuthLink.tsx` | 56 | DE-WIRED | 2026-05-08 `e38fc601` |
| `src/components/AstroErrorBoundary.tsx` | 55 | PRE-HISTORY | 2026-04-30 `04e9fa72` |
| `src/components/PayPalButton.tsx` | 55 | DE-WIRED | 2026-04-30 `04e9fa72` |
| `src/components/AstroDebug.tsx` | 54 | PRE-HISTORY | 2026-04-30 `04e9fa72` |
| `src/components/PlanetaryPositionDisplay.tsx` | 53 | PRE-HISTORY | 2026-04-30 `04e9fa72` |
| `src/components/PlanetaryPositionValidation.tsx` | 51 | PRE-HISTORY | 2026-04-30 `04e9fa72` |
| `src/components/ui/alert.tsx` | 49 | DE-WIRED | 2026-05-20 `470da8dc` |
| `src/components/KineticsPowerIndicator.tsx` | 47 | PRE-HISTORY | 2026-04-30 `04e9fa72` |
| `src/components/menu-planner/index.ts` | 47 | PRE-HISTORY | 2026-04-30 `04e9fa72` |
| `src/components/PremiumGate.tsx` | 42 | DE-WIRED | 2026-04-30 `04e9fa72` |
| `src/components/ClientWrapper.tsx` | 39 | PRE-HISTORY | 2026-04-30 `04e9fa72` |
| `src/components/ElementalExplorer.tsx` | 39 | PRE-HISTORY | 2026-04-30 `04e9fa72` |
| `src/components/profile/TierUpgradePrompt.tsx` | 39 | DE-WIRED | 2026-05-08 `e38fc601` |
| `src/components/CalculationErrors.tsx` | 37 | SUBTREE | 2026-04-30 `04e9fa72` |
| `src/components/Navigation.tsx` | 37 | DE-WIRED | 2026-05-08 `e38fc601` |
| `src/components/LoginButton.tsx` | 34 | PRE-HISTORY | 2026-04-30 `04e9fa72` |
| `src/components/nav/PremiumLink.tsx` | 34 | DE-WIRED | 2026-05-08 `e38fc601` |
| `src/components/ThemeScript.tsx` | 31 | PRE-HISTORY | 2026-04-30 `04e9fa72` |
| `src/components/profile/FeatureGate.tsx` | 30 | PRE-HISTORY | 2026-04-30 `04e9fa72` |
| `src/components/Clock.tsx` | 29 | SUBTREE | 2026-04-30 `04e9fa72` |
| `src/components/AstrologyWarning.tsx` | 28 | SUBTREE | 2026-04-30 `04e9fa72` |
| `src/components/ui/switch.tsx` | 28 | DE-WIRED | 2026-05-20 `470da8dc` |
| `src/components/ui/separator.tsx` | 25 | DE-WIRED | 2026-05-20 `470da8dc` |
| `src/components/recommendations/types.ts` | 23 | SUBTREE | 2026-08-20 `a70997aa` |
| `src/components/ElementalBalance.tsx` | 19 | DE-WIRED | 2026-04-30 `04e9fa72` |
| `src/components/premium/PremiumGate.tsx` | 15 | DE-WIRED | 2026-04-30 `04e9fa72` |
| `src/components/astrological/index.ts` | 8 | DE-WIRED | 2026-04-30 `04e9fa72` |
| `src/components/economy/index.ts` | 7 | PRE-HISTORY | 2026-04-30 `04e9fa72` |
| `src/components/cuisines/index.ts` | 6 | DE-WIRED | 2026-04-30 `04e9fa72` |
| `src/components/recipe-builder/index.ts` | 5 | PRE-HISTORY | 2026-04-30 `04e9fa72` |
| `src/components/ChakraDisplay.tsx` | 4 | DE-WIRED | 2026-04-30 `04e9fa72` |
| `src/components/PlanetaryHours.tsx` | 4 | DE-WIRED | 2026-04-30 `04e9fa72` |

</details>

<details>
<summary><b>src/lib</b> — 43 files, 16,740 LOC</summary>

| Module | LOC | Class | Added |
|---|---:|---|---|
| `src/lib/FoodAlchemySystem.ts` | 1062 | DE-WIRED | 2026-04-30 `04e9fa72` |
| `src/lib/alchemizer.ts` | 1061 | SUBTREE | 2026-05-21 `8e85096c` |
| `src/lib/degree-agent-matcher.ts` | 1030 | NEVER-WIRED | 2026-05-22 `d1449d23` |
| `src/lib/personalization/user-learning.ts` | 1012 | SUBTREE | 2026-04-30 `04e9fa72` |
| `src/lib/celestial-energy-calculator.ts` | 805 | SUBTREE | 2026-05-21 `8e85096c` |
| `src/lib/alchemical-kinetics.ts` | 759 | SUBTREE | 2026-05-29 `d188d25e` |
| `src/lib/agents/kinetic-profiles.ts` | 730 | SUBTREE | 2026-05-21 `1a046c03` |
| `src/lib/monica/horoscope-generator.ts` | 697 | SUBTREE | 2026-05-21 `8e85096c` |
| `src/lib/monitoring/prometheus-metrics.ts` | 632 | PRE-HISTORY | 2026-04-30 `04e9fa72` |
| `src/lib/galileo-logger.ts` | 554 | DE-WIRED | 2026-05-21 `2020b307` |
| `src/lib/core-energy-rules.ts` | 533 | SUBTREE | 2026-05-21 `2020b307` |
| `src/lib/services/planetary-agent-activation.ts` | 495 | DE-WIRED | 2026-05-22 `d1449d23` |
| `src/lib/planetary-motion-tracker.ts` | 484 | NEVER-WIRED | 2026-05-21 `381a229c` |
| `src/lib/unified-agent-factory.ts` | 454 | SUBTREE | 2026-05-22 `d1449d23` |
| `src/lib/elemental-reinforcement.ts` | 435 | NEVER-WIRED | 2026-05-21 `2020b307` |
| `src/lib/alchemical-kinetics-sampler.ts` | 433 | NEVER-WIRED | 2026-05-22 `d1449d23` |
| `src/lib/degree-planetary-agent-mapping.ts` | 430 | SUBTREE | 2026-05-22 `d1449d23` |
| `src/lib/ephemeris/degree-calendar-map.ts` | 429 | NEVER-WIRED | 2026-05-21 `381a229c` |
| `src/lib/structured-logger.ts` | 420 | NEVER-WIRED | 2026-05-21 `2020b307` |
| `src/lib/agents/consciousness-memory.ts` | 416 | DE-WIRED | 2026-05-22 `d1449d23` |
| `src/lib/moon-phase-calculator.ts` | 413 | SUBTREE | 2026-05-21 `1a046c03` |
| `src/lib/ChakraAlchemyService.ts` | 374 | SUBTREE | 2026-04-30 `04e9fa72` |
| `src/lib/ephemeris/solar-ephemeris.ts` | 374 | SUBTREE | 2026-05-21 `381a229c` |
| `src/lib/planetary-config-helper.ts` | 271 | SUBTREE | 2026-05-21 `0ec9b7a5` |
| `src/lib/unified-agent-types.ts` | 256 | SUBTREE | 2026-05-21 `2020b307` |
| `src/lib/chakraRecipeEnhancer.ts` | 250 | PRE-HISTORY | 2026-04-30 `04e9fa72` |
| `src/lib/astrological-data.ts` | 199 | SUBTREE | 2026-05-21 `1a046c03` |
| `src/lib/ThermodynamicCalculator.ts` | 196 | SUBTREE | 2026-04-30 `04e9fa72` |
| `src/lib/elementalSystem.ts` | 195 | PRE-HISTORY | 2026-04-30 `04e9fa72` |
| `src/lib/recipeEngine.ts` | 179 | PRE-HISTORY | 2026-04-30 `04e9fa72` |
| `src/lib/performance-cache.ts` | 161 | SUBTREE | 2026-05-20 `13718aa7` |
| `src/lib/recipeFilter.ts` | 143 | DE-WIRED | 2026-04-30 `04e9fa72` |
| `src/lib/kinetics-client.ts` | 142 | SUBTREE | 2026-05-21 `1a046c03` |
| `src/lib/recipeCalculations.ts` | 142 | SUBTREE | 2026-04-30 `04e9fa72` |
| `src/lib/api/fetchWithAuth.ts` | 125 | PRE-HISTORY | 2026-04-30 `04e9fa72` |
| `src/lib/cuisineCalculations.ts` | 120 | SUBTREE | 2026-04-30 `04e9fa72` |
| `src/lib/kinetics-integration.ts` | 91 | NEVER-WIRED | 2026-05-20 `13718aa7` |
| `src/lib/websocket/alchm-websocket.ts` | 69 | SUBTREE | 2026-04-30 `04e9fa72` |
| `src/lib/spacetime/generated/types/reducers.ts` | 66 | DE-WIRED | 2026-06-09 `8f521d11` |
| `src/lib/calculate-transits.ts` | 56 | SUBTREE | 2026-05-20 `13718aa7` |
| `src/lib/stripe/client.ts` | 26 | PRE-HISTORY | 2026-04-30 `04e9fa72` |
| `src/lib/observability-legacy.ts` | 11 | SUBTREE | 2026-05-20 `13718aa7` |
| `src/lib/spacetime/generated/types/procedures.ts` | 10 | DE-WIRED | 2026-06-09 `8f521d11` |

</details>

<details>
<summary><b>src/data</b> — 28 files, 15,704 LOC</summary>

| Module | LOC | Class | Added |
|---|---:|---|---|
| `src/data/usdaNutritionalData.ts` | 3242 | PRE-HISTORY | 2026-04-30 `04e9fa72` |
| `src/data/ingredients/seasonings/oils.ts` | 1625 | DE-WIRED | 2026-05-08 `e38fc601` |
| `src/data/ingredients/proteins/proteins.ts` | 1520 | DE-WIRED | 2026-05-08 `e38fc601` |
| `src/data/unified/enhancedIngredients.ts` | 1387 | SUBTREE | 2026-04-30 `04e9fa72` |
| `src/data/recipes.ts` | 1383 | SUBTREE | 2026-05-08 `e38fc601` |
| `src/data/nutritional.ts` | 1165 | SUBTREE | 2026-04-30 `04e9fa72` |
| `src/data/zodiacAffinities.ts` | 1142 | DE-WIRED | 2026-04-30 `04e9fa72` |
| `src/data/transits/comprehensiveTransitDatabase.ts` | 847 | SUBTREE | 2026-04-30 `04e9fa72` |
| `src/data/unified/nutritional.ts` | 692 | SUBTREE | 2026-04-30 `04e9fa72` |
| `src/data/unified/flavorProfiles.ts` | 366 | SUBTREE | 2026-04-30 `04e9fa72` |
| `src/data/astroData.ts` | 326 | SUBTREE | 2026-04-30 `04e9fa72` |
| `src/data/cooking/methods/template.ts` | 306 | DE-WIRED | 2026-04-30 `04e9fa72` |
| `src/data/cuisines/template.ts` | 295 | DE-WIRED | 2026-04-30 `04e9fa72` |
| `src/data/ingredients/vegetables/rootVegetables.ts` | 255 | DE-WIRED | 2026-05-08 `e38fc601` |
| `src/data/integrations/temperatureEffects.ts` | 183 | SUBTREE | 2026-04-30 `04e9fa72` |
| `src/data/alchm/index.ts` | 156 | NEVER-WIRED | 2026-07-20 `86d2a32d` |
| `src/data/cooking/molecularMethods.ts` | 148 | SUBTREE | 2026-04-30 `04e9fa72` |
| `src/data/integrations/elementalBalance.ts` | 134 | DE-WIRED | 2026-04-30 `04e9fa72` |
| `src/data/index.ts` | 81 | PRE-HISTORY | 2026-04-30 `04e9fa72` |
| `src/data/utils/cache.ts` | 77 | DE-WIRED | 2026-04-30 `04e9fa72` |
| `src/data/enhancedDishes.ts` | 65 | PRE-HISTORY | 2026-04-30 `04e9fa72` |
| `src/data/integrations/cuisineMatrix.ts` | 64 | DE-WIRED | 2026-04-30 `04e9fa72` |
| `src/data/unified/index.ts` | 55 | PRE-HISTORY | 2026-04-30 `04e9fa72` |
| `src/data/integrations/textureProfiles.ts` | 48 | SUBTREE | 2026-04-30 `04e9fa72` |
| `src/data/integrations/recipeBuilder.ts` | 47 | SUBTREE | 2026-04-30 `04e9fa72` |
| `src/data/integrations/types.ts` | 46 | SUBTREE | 2026-04-30 `04e9fa72` |
| `src/data/integrations/index.ts` | 25 | SUBTREE | 2026-04-30 `04e9fa72` |
| `src/data/integrations/medicinalCrossReference.ts` | 24 | SUBTREE | 2026-04-30 `04e9fa72` |

</details>

<details>
<summary><b>src/services</b> — 41 files, 15,456 LOC</summary>

| Module | LOC | Class | Added |
|---|---:|---|---|
| `src/services/SwissEphemerisService.ts` | 1100 | SUBTREE | 2026-04-30 `04e9fa72` |
| `src/services/QualityMetricsService.ts` | 1005 | DE-WIRED | 2026-05-08 `e38fc601` |
| `src/services/ErrorTrackingSystem.ts` | 958 | SUBTREE | 2026-05-08 `e38fc601` |
| `src/services/FoodAlchemySystem.ts` | 929 | DE-WIRED | 2026-04-30 `04e9fa72` |
| `src/services/RecipeFinder.ts` | 782 | PRE-HISTORY | 2026-04-30 `04e9fa72` |
| `src/services/BuildPerformanceMonitor.ts` | 770 | SUBTREE | 2026-05-08 `e38fc601` |
| `src/services/ErrorTrackingEnterpriseSystem.ts` | 722 | PRE-HISTORY | 2026-05-08 `e38fc601` |
| `src/services/AlchemicalTransformationService.ts` | 583 | SUBTREE | 2026-04-30 `04e9fa72` |
| `src/services/EnhancedAstrologyService.ts` | 583 | PRE-HISTORY | 2026-04-30 `04e9fa72` |
| `src/services/EnhancedTransitAnalysisService.ts` | 550 | PRE-HISTORY | 2026-04-30 `04e9fa72` |
| `src/services/ConfigurationService.ts` | 540 | PRE-HISTORY | 2026-04-30 `04e9fa72` |
| `src/services/AlchemicalRecommendationService.ts` | 487 | DE-WIRED | 2026-04-30 `04e9fa72` |
| `src/services/RecommendationAnalyticsService.ts` | 480 | SUBTREE | 2026-04-30 `04e9fa72` |
| `src/services/PerformanceCache.ts` | 471 | SUBTREE | 2026-04-30 `04e9fa72` |
| `src/services/PlanetaryAgentsAdapter.ts` | 460 | DE-WIRED | 2026-04-30 `04e9fa72` |
| `src/services/astrologyApi.ts` | 441 | PRE-HISTORY | 2026-04-30 `04e9fa72` |
| `src/services/UnifiedScoringAdapter.ts` | 357 | PRE-HISTORY | 2026-04-30 `04e9fa72` |
| `src/services/PerformanceMonitoringService.ts` | 353 | PRE-HISTORY | 2026-04-30 `04e9fa72` |
| `src/services/examples/UnifiedScoringExample.ts` | 334 | PRE-HISTORY | 2026-04-30 `04e9fa72` |
| `src/services/ingredientMappingService.ts` | 325 | SUBTREE | 2026-04-30 `04e9fa72` |
| `src/services/PersonalizedRecommendationService.ts` | 321 | SUBTREE | 2026-04-30 `04e9fa72` |
| `src/services/initializationService.ts` | 308 | PRE-HISTORY | 2026-04-30 `04e9fa72` |
| `src/services/ConsolidatedIngredientService.ts` | 293 | DE-WIRED | 2026-04-30 `04e9fa72` |
| `src/services/RuneAgentClient.ts` | 283 | SUBTREE | 2026-04-30 `04e9fa72` |
| `src/services/PlanetaryKineticsClient.ts` | 230 | SUBTREE | 2026-04-30 `04e9fa72` |
| `src/services/ChakraService.ts` | 229 | SUBTREE | 2026-04-30 `04e9fa72` |
| `src/services/mealTypeService.ts` | 204 | DE-WIRED | 2026-04-30 `04e9fa72` |
| `src/services/ConsolidatedRecipeService.ts` | 189 | SUBTREE | 2026-04-30 `04e9fa72` |
| `src/services/PerformanceMetricsAnalytics.ts` | 172 | SUBTREE | 2026-04-30 `04e9fa72` |
| `src/services/RecipeChakraService.ts` | 159 | PRE-HISTORY | 2026-04-30 `04e9fa72` |
| `src/services/utils/apiResponseUtils.ts` | 146 | PRE-HISTORY | 2026-04-30 `04e9fa72` |
| `src/services/KitchenBackendClient.ts` | 132 | SUBTREE | 2026-04-30 `04e9fa72` |
| `src/services/PlanetaryPositionsService.ts` | 126 | SUBTREE | 2026-04-30 `04e9fa72` |
| `src/services/loadingStateManager.ts` | 84 | PRE-HISTORY | 2026-04-30 `04e9fa72` |
| `src/services/apiClients.ts` | 79 | SUBTREE | 2026-04-30 `04e9fa72` |
| `src/services/index.ts` | 78 | DE-WIRED | 2026-04-30 `04e9fa72` |
| `src/services/NutritionService.ts` | 61 | DE-WIRED | 2026-04-30 `04e9fa72` |
| `src/services/tarotService.ts` | 53 | PRE-HISTORY | 2026-04-30 `04e9fa72` |
| `src/services/campaign/TypeScriptErrorAnalyzer.ts` | 33 | SUBTREE | 2026-04-30 `04e9fa72` |
| `src/services/TelemetryDev.ts` | 27 | PRE-HISTORY | 2026-04-30 `04e9fa72` |
| `src/services/WiccanCorrespondenceService.ts` | 19 | PRE-HISTORY | 2026-04-30 `04e9fa72` |

</details>

<details>
<summary><b>src/hooks</b> — 36 files, 7,733 LOC</summary>

| Module | LOC | Class | Added |
|---|---:|---|---|
| `src/hooks/useStatePreservation.ts` | 683 | PRE-HISTORY | 2026-04-30 `04e9fa72` |
| `src/hooks/useAstrology.ts` | 627 | DE-WIRED | 2026-04-30 `04e9fa72` |
| `src/hooks/usePersonalization.ts` | 440 | DE-WIRED | 2026-04-30 `04e9fa72` |
| `src/hooks/usePlanetaryKinetics.ts` | 407 | SUBTREE | 2026-04-30 `04e9fa72` |
| `src/hooks/useRecommendationAnalytics.ts` | 372 | PRE-HISTORY | 2026-04-30 `04e9fa72` |
| `src/hooks/useChakraInfluencedFood.ts` | 365 | SUBTREE | 2026-04-30 `04e9fa72` |
| `src/hooks/useIngredientRecommendations.ts` | 349 | PRE-HISTORY | 2026-04-30 `04e9fa72` |
| `src/hooks/useFoodRecommendations.ts` | 332 | PRE-HISTORY | 2026-04-30 `04e9fa72` |
| `src/hooks/useRecipeValidation.ts` | 327 | PRE-HISTORY | 2026-04-30 `04e9fa72` |
| `src/hooks/useAlchemicalRecommendations.ts` | 299 | SUBTREE | 2026-04-30 `04e9fa72` |
| `src/hooks/useDraggable.ts` | 292 | PRE-HISTORY | 2026-04-30 `04e9fa72` |
| `src/hooks/usePerformanceMonitoring.ts` | 289 | SUBTREE | 2026-04-30 `04e9fa72` |
| `src/hooks/usePerformanceMetrics.ts` | 233 | PRE-HISTORY | 2026-04-30 `04e9fa72` |
| `src/hooks/useRecipeRecommendations.ts` | 209 | PRE-HISTORY | 2026-04-30 `04e9fa72` |
| `src/hooks/useCircuitMetrics.ts` | 204 | SUBTREE | 2026-04-30 `04e9fa72` |
| `src/hooks/useIngredientSearch.ts` | 202 | PRE-HISTORY | 2026-04-30 `04e9fa72` |
| `src/hooks/useSafeFlavorEngine.ts` | 180 | PRE-HISTORY | 2026-04-30 `04e9fa72` |
| `src/hooks/useEnhancedRecommendations.ts` | 178 | SUBTREE | 2026-04-30 `04e9fa72` |
| `src/hooks/useCookingMethods.ts` | 164 | DE-WIRED | 2026-04-30 `04e9fa72` |
| `src/hooks/useRealtimePlanetaryPositions.ts` | 158 | DE-WIRED | 2026-04-30 `04e9fa72` |
| `src/hooks/useIngredientMapping.ts` | 157 | SUBTREE | 2026-04-30 `04e9fa72` |
| `src/hooks/useGalileoLog.ts` | 140 | NEVER-WIRED | 2026-05-20 `13718aa7` |
| `src/hooks/useDebugSettings.ts` | 134 | PRE-HISTORY | 2026-04-30 `04e9fa72` |
| `src/hooks/useAstrologicalInfluence.ts` | 132 | PRE-HISTORY | 2026-04-30 `04e9fa72` |
| `src/hooks/useRuneAgent.ts` | 131 | PRE-HISTORY | 2026-04-30 `04e9fa72` |
| `src/hooks/useUnifiedPlanetaryHour.ts` | 115 | SUBTREE | 2026-04-30 `04e9fa72` |
| `src/hooks/useDragAndDrop.ts` | 98 | SUBTREE | 2026-04-30 `04e9fa72` |
| `src/hooks/usePlanetaryWebSocket.ts` | 86 | SUBTREE | 2026-04-30 `04e9fa72` |
| `src/hooks/useErrorHandler.ts` | 84 | DE-WIRED | 2026-04-30 `04e9fa72` |
| `src/hooks/usePlanetaryHours.ts` | 82 | DE-WIRED | 2026-04-30 `04e9fa72` |
| `src/hooks/index.ts` | 72 | SUBTREE | 2026-04-30 `04e9fa72` |
| `src/hooks/useAlchmWebSocket.ts` | 66 | DE-WIRED | 2026-04-30 `04e9fa72` |
| `src/hooks/useTokens.ts` | 51 | PRE-HISTORY | 2026-04-30 `04e9fa72` |
| `src/hooks/usePlanetaryHour.ts` | 45 | DE-WIRED | 2026-04-30 `04e9fa72` |
| `src/hooks/useCustomHook.ts` | 26 | PRE-HISTORY | 2026-04-30 `04e9fa72` |
| `src/hooks/useClientEffect.ts` | 4 | DE-WIRED | 2026-04-30 `04e9fa72` |

</details>

<details>
<summary><b>src/types</b> — 31 files, 4,802 LOC</summary>

| Module | LOC | Class | Added |
|---|---:|---|---|
| `src/types/culinary.ts` | 752 | SUBTREE | 2026-04-30 `04e9fa72` |
| `src/types/standardizedIngredient.ts` | 663 | PRE-HISTORY | 2026-04-30 `04e9fa72` |
| `src/types/environmentalResponseSchema.ts` | 515 | SUBTREE | 2026-07-31 `bd5badc6` |
| `src/types/serviceLayer.ts` | 366 | PRE-HISTORY | 2026-04-30 `04e9fa72` |
| `src/types/recipe/enhancedRecipe.ts` | 299 | SUBTREE | 2026-04-30 `04e9fa72` |
| `src/types/enterpriseIntelligence.ts` | 273 | DE-WIRED | 2026-04-30 `04e9fa72` |
| `src/types/mlIntelligence.ts` | 194 | DE-WIRED | 2026-04-30 `04e9fa72` |
| `src/types/validators.ts` | 163 | SUBTREE | 2026-04-30 `04e9fa72` |
| `src/types/thermodynamic.ts` | 154 | DE-WIRED | 2026-04-30 `04e9fa72` |
| `src/types/predictiveIntelligence.ts` | 151 | DE-WIRED | 2026-04-30 `04e9fa72` |
| `src/types/advancedAnalytics.ts` | 147 | DE-WIRED | 2026-04-30 `04e9fa72` |
| `src/types/analysisResults.ts` | 122 | PRE-HISTORY | 2026-04-30 `04e9fa72` |
| `src/types/recipeIngredient.ts` | 116 | DE-WIRED | 2026-04-30 `04e9fa72` |
| `src/types/recipeAdjustments.ts` | 110 | DE-WIRED | 2026-04-30 `04e9fa72` |
| `src/types/commonTypes.ts` | 106 | PRE-HISTORY | 2026-04-30 `04e9fa72` |
| `src/types/guards.ts` | 100 | DE-WIRED | 2026-04-30 `04e9fa72` |
| `src/types/items.ts` | 77 | DE-WIRED | 2026-04-30 `04e9fa72` |
| `src/types/utils.ts` | 71 | PRE-HISTORY | 2026-04-30 `04e9fa72` |
| `src/types/validation.ts` | 66 | DE-WIRED | 2026-04-30 `04e9fa72` |
| `src/types/signVectors.ts` | 64 | SUBTREE | 2026-04-30 `04e9fa72` |
| `src/types/errors.ts` | 44 | SUBTREE | 2026-04-30 `04e9fa72` |
| `src/types/unified/astrologicalCore.ts` | 44 | PRE-HISTORY | 2026-04-30 `04e9fa72` |
| `src/types/elements.ts` | 43 | DE-WIRED | 2026-04-30 `04e9fa72` |
| `src/types/wiccan.ts` | 41 | SUBTREE | 2026-04-30 `04e9fa72` |
| `src/types/ingredient-compatibility.ts` | 29 | DE-WIRED | 2026-04-30 `04e9fa72` |
| `src/types/flavor.ts` | 24 | DE-WIRED | 2026-04-30 `04e9fa72` |
| `src/types/astrological.ts` | 17 | DE-WIRED | 2026-04-30 `04e9fa72` |
| `src/types/CurrentChart.ts` | 16 | DE-WIRED | 2026-04-30 `04e9fa72` |
| `src/types/food.ts` | 12 | DE-WIRED | 2026-04-30 `04e9fa72` |
| `src/types/timeFactors.ts` | 12 | DE-WIRED | 2026-04-30 `04e9fa72` |
| `src/types/seasonal.ts` | 11 | DE-WIRED | 2026-04-30 `04e9fa72` |

</details>

<details>
<summary><b>src/constants</b> — 4 files, 1,475 LOC</summary>

| Module | LOC | Class | Added |
|---|---:|---|---|
| `src/constants/systemDefaults.ts` | 917 | DE-WIRED | 2026-04-30 `04e9fa72` |
| `src/constants/environmentalResponseProfiles.ts` | 455 | NEVER-WIRED | 2026-07-31 `bd5badc6` |
| `src/constants/seasonalConstants.ts` | 96 | SUBTREE | 2026-04-30 `04e9fa72` |
| `src/constants/planetInfo.ts` | 7 | DE-WIRED | 2026-04-30 `04e9fa72` |

</details>

<details>
<summary><b>src/contexts</b> — 25 files, 1,263 LOC</summary>

| Module | LOC | Class | Added |
|---|---:|---|---|
| `src/contexts/ChartContext/provider.tsx` | 246 | SUBTREE | 2026-04-30 `04e9fa72` |
| `src/contexts/FlavorEngineContext.tsx` | 235 | SUBTREE | 2026-04-30 `04e9fa72` |
| `src/contexts/PopupContext/provider.tsx` | 176 | SUBTREE | 2026-04-30 `04e9fa72` |
| `src/contexts/AlchemicalContext/reducer.ts` | 172 | SUBTREE | 2026-04-30 `04e9fa72` |
| `src/contexts/ChartContext/types.ts` | 53 | SUBTREE | 2026-04-30 `04e9fa72` |
| `src/contexts/PopupContext/types.ts` | 50 | SUBTREE | 2026-04-30 `04e9fa72` |
| `src/contexts/ThemeContext/provider.tsx` | 36 | SUBTREE | 2026-04-30 `04e9fa72` |
| `src/contexts/TarotContext/provider.tsx` | 30 | SUBTREE | 2026-04-30 `04e9fa72` |
| `src/contexts/AlchemicalContext/server.ts` | 29 | SUBTREE | 2026-04-30 `04e9fa72` |
| `src/contexts/alchemicalTypes/index.ts` | 21 | SUBTREE | 2026-04-30 `04e9fa72` |
| `src/contexts/ChartContext/hooks.ts` | 20 | SUBTREE | 2026-04-30 `04e9fa72` |
| `src/contexts/PopupContext/hooks.ts` | 20 | SUBTREE | 2026-04-30 `04e9fa72` |
| `src/contexts/TarotContext/hooks.ts` | 20 | SUBTREE | 2026-04-30 `04e9fa72` |
| `src/contexts/ThemeContext/hooks.ts` | 20 | SUBTREE | 2026-04-30 `04e9fa72` |
| `src/contexts/AlchemicalContext/index.ts` | 19 | SUBTREE | 2026-04-30 `04e9fa72` |
| `src/contexts/TarotContext/context.tsx` | 18 | SUBTREE | 2026-04-30 `04e9fa72` |
| `src/contexts/ChartContext/context.tsx` | 17 | SUBTREE | 2026-04-30 `04e9fa72` |
| `src/contexts/index.ts` | 16 | PRE-HISTORY | 2026-04-30 `04e9fa72` |
| `src/contexts/ChartContext/index.ts` | 11 | SUBTREE | 2026-04-30 `04e9fa72` |
| `src/contexts/PopupContext/index.ts` | 11 | SUBTREE | 2026-04-30 `04e9fa72` |
| `src/contexts/TarotContext/index.ts` | 11 | SUBTREE | 2026-04-30 `04e9fa72` |
| `src/contexts/ThemeContext/index.ts` | 11 | PRE-HISTORY | 2026-04-30 `04e9fa72` |
| `src/contexts/ThemeContext/context.tsx` | 8 | SUBTREE | 2026-04-30 `04e9fa72` |
| `src/contexts/ThemeContext/types.ts` | 7 | SUBTREE | 2026-04-30 `04e9fa72` |
| `src/contexts/PopupContext/context.tsx` | 6 | SUBTREE | 2026-04-30 `04e9fa72` |

</details>

<details>
<summary><b>src/calculations</b> — 5 files, 874 LOC</summary>

| Module | LOC | Class | Added |
|---|---:|---|---|
| `src/calculations/culinary/seasonalAdjustments.ts` | 359 | SUBTREE | 2026-04-30 `04e9fa72` |
| `src/calculations/elementalcalculations.ts` | 267 | DE-WIRED | 2026-04-30 `04e9fa72` |
| `src/calculations/seasonalCalculations.ts` | 166 | SUBTREE | 2026-04-30 `04e9fa72` |
| `src/calculations/core/index.ts` | 51 | PRE-HISTORY | 2026-04-30 `04e9fa72` |
| `src/calculations/culinary/index.ts` | 31 | PRE-HISTORY | 2026-04-30 `04e9fa72` |

</details>

<details>
<summary><b>src/config</b> — 5 files, 401 LOC</summary>

| Module | LOC | Class | Added |
|---|---:|---|---|
| `src/config/cuisines.ts` | 169 | DE-WIRED | 2026-04-30 `04e9fa72` |
| `src/config/signVectorConfig.ts` | 124 | PRE-HISTORY | 2026-04-30 `04e9fa72` |
| `src/config/defaults.ts` | 74 | DE-WIRED | 2026-04-30 `04e9fa72` |
| `src/config/index.ts` | 21 | PRE-HISTORY | 2026-04-30 `04e9fa72` |
| `src/config/celestialConfig.ts` | 13 | PRE-HISTORY | 2026-04-30 `04e9fa72` |

</details>

<details>
<summary><b>src/scripts</b> — 2 files, 361 LOC</summary>

| Module | LOC | Class | Added |
|---|---:|---|---|
| `src/scripts/ingestRecipes.ts` | 358 | PRE-HISTORY | 2026-05-08 `e38fc601` |
| `src/scripts/test-load.ts` | 3 | PRE-HISTORY | 2026-04-30 `04e9fa72` |

</details>

<details>
<summary><b>src/providers</b> — 1 files, 119 LOC</summary>

| Module | LOC | Class | Added |
|---|---:|---|---|
| `src/providers/RecoveryProvider.tsx` | 119 | PRE-HISTORY | 2026-04-30 `04e9fa72` |

</details>

<details>
<summary><b>src/app</b> — 1 files, 84 LOC</summary>

| Module | LOC | Class | Added |
|---|---:|---|---|
| `src/app/api/error.ts` | 84 | DE-WIRED | 2026-04-30 `04e9fa72` |

</details>

<details>
<summary><b>src/config.ts</b> — 1 files, 48 LOC</summary>

| Module | LOC | Class | Added |
|---|---:|---|---|
| `src/config.ts` | 48 | SUBTREE | 2026-04-30 `04e9fa72` |

</details>

<details>
<summary><b>src/domain</b> — 1 files, 43 LOC</summary>

| Module | LOC | Class | Added |
|---|---:|---|---|
| `src/domain/culinaryKnowledge.ts` | 43 | PRE-HISTORY | 2026-04-30 `04e9fa72` |

</details>

<details>
<summary><b>src/paths.ts</b> — 1 files, 8 LOC</summary>

| Module | LOC | Class | Added |
|---|---:|---|---|
| `src/paths.ts` | 8 | DE-WIRED | 2026-04-30 `04e9fa72` |

</details>

<details>
<summary><b>src/tests</b> — 1 files, 6 LOC</summary>

| Module | LOC | Class | Added |
|---|---:|---|---|
| `src/tests/mockData.ts` | 6 | PRE-HISTORY | 2026-04-30 `04e9fa72` |

</details>

### Phase 23 (commit `31014233`) — 9 modules

| Module | LOC | Class |
|---|---:|---|
| `src/components/LivePlanetaryTracker.tsx` | 333 | PRE-HISTORY |
| `src/middleware/auth-middleware.ts` | 350 | PRE-HISTORY |
| `src/utils/BuildValidator.ts` | 456 | PRE-HISTORY |
| `src/utils/automatedQualityAssurance.ts` | 709 | PRE-HISTORY |
| `src/utils/buildQualityMonitor.ts` | 1195 | PRE-HISTORY |
| `src/utils/buildSystemRepair.ts` | 271 | PRE-HISTORY |
| `src/utils/common/index.ts` | 144 | PRE-HISTORY |
| `src/utils/nextConfigOptimizer.ts` | 213 | PRE-HISTORY |
| `src/utils/typescriptCampaignTrigger.ts` | 788 | PRE-HISTORY |
