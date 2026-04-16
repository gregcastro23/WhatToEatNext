# Type Safety Remediation — Session Handoff

_Last session: 2026-04-16 | Branch: `claude/fix-yarn-build-QYH9X`_

This document describes work completed this session, and the larger weak
targets that were surveyed but left for a follow-up session because they
require architectural decisions or carry meaningful regression risk.

## What was completed this session

| # | Commit | Description |
|---|--------|-------------|
| 1 | `03de99d` | Fix TS2352 build error in `TodaysMealsWidget` — `sourceSlot.recipe as Recipe` → `as unknown as Recipe` (the actual reported build failure). |
| 2 | `b9bb39e` | Remove 3 silent `catch (_e) {}` blocks in `RecommendationsPanel`; widen `onPush`/`onQueue` props in `RecipeCollisionModal` to accept async and wrap with `void` at the JSX boundary (fixes two `no-misused-promises`); memoize `now` in `TodaysMealsWidget` (fixes `react-hooks/exhaustive-deps`). |
| 3 | `3f14e65` | Remove 13 `@ts-expect-error - Auto-fixed by script` suppressions from `HomeMethodsComponent`. Proper typing via local `FormattedMethod` interface and a `RuntimePlanetaryAlignment` alias that matches the hook's actual lowercase-key runtime shape. |
| 4 | `21b4688` | Rename shadowing local `interface Recipe` declarations in `lib/recipeCalculations.ts` → `TarotRecipe` (exported and reused by `AlchmKitchen.tsx`), and in `hooks/useEnhancedRecommendations.ts` → `RecommendedRecipeCard`. |

All four commits leave `tsc --noEmit` at zero errors and `next build`
passing.

## What was **not** fixed and why

### A. Recipe type sprawl (deep architectural issue)

The codebase has **three** types named `EnhancedRecipe` with incompatible
schemas:

1. `src/types/recipe.ts:596` — **Standalone, incompatible with `Recipe`.**
   `ingredients: string[]` (a deliberate workaround so `.join()` works).
   Imported by `src/types/menuPlanner.ts` (propagates through the entire
   menu planner) and `src/services/unifiedSauceRecommender.ts`.
2. `src/types/recipe/enhancedRecipe.ts:22` — `extends Recipe` properly.
   Adds astrological timing and `cookingMethodSequence`.
3. `src/data/unified/recipes.ts:30` — `extends Recipe` properly. Adds
   `alchemicalProperties` with Kalchm/Monica and `cookingOptimization`.

**Consequence**: `MealSlot.recipe: EnhancedRecipe` (the standalone #1)
is not assignable to `Recipe`, which drives **640 `as unknown as Recipe`
casts** across the codebase.

**Additional duplication**: 10+ distinct `Recipe` interface
declarations:

- `types/recipe.ts` (canonical, ~80 fields)
- `types/commonTypes.ts:60`, `types/unified.ts:225`,
  `types/ExtendedRecipe.ts:25` — redundant
- `lib/database/types.ts:204`, `lib/api/alchm-client.ts:28` — DB/API
  DTOs, arguably justified
- `hooks/useRecipeRecommendations.ts:4` — local card shape
- `lib/recipeCalculations.ts` (renamed this session → `TarotRecipe`)
- `components/AlchmKitchen.tsx` (deleted this session)
- `hooks/useEnhancedRecommendations.ts` (renamed this session)

**Recommended next steps** (in priority order):

1. **Unify the standalone `EnhancedRecipe` in `types/recipe.ts:596`.**
   Replace it with `EnhancedRecipe extends Recipe` (like the other two).
   The `.join()` workaround should be replaced with
   `recipe.ingredients.map(i => i.name).join(', ')` at display sites.
   Grep for `.ingredients.join(` and `.ingredients.slice(0, 6).map` to
   find the display code that needs the map step.
2. **Delete the duplicate `Recipe` in `types/commonTypes.ts` and
   `types/unified.ts`.** They are not exports used anywhere exclusive to
   the canonical one (verify with `grep -rn 'from "@/types/commonTypes"'`
   and `from "@/types/unified"` to confirm no callers need the subset).
3. **Decide policy on DB/API Recipes.** `lib/database/types.ts` and
   `lib/api/alchm-client.ts` both declare `Recipe`. Consider renaming
   them to `RecipeRow` and `RecipeDTO` respectively to make layering
   obvious.

### B. 328 `@ts-expect-error - Auto-fixed by script` suppressions

These are actual type errors that a suppression script silenced instead
of fixing. They hide real bugs — the pattern I removed from
`HomeMethodsComponent.tsx` revealed:

- Lowercase vs uppercase planet keys (`alignment.sun` vs
  `alignment.Sun`) — a runtime/type mismatch.
- `method.variations` typed as `CookingMethodData[]` but code treated it
  as `string[]`.
- `CookingMethodProfile` vs `CookingMethodData` — two different
  interfaces for the same domain object.

**Top offenders** (suppression count):

| File | Count |
|------|-------|
| `src/components/CookingMethods.tsx` | 56 |
| `src/components/RecipeList.tsx` | 30 |
| `src/components/IngredientDisplay.tsx` | 30 |
| `src/components/AlchemicalRecommendations.tsx` | 30 |
| `src/components/FoodRecommender.tsx` | 29 |
| `src/components/TarotFoodDisplay.tsx` | 17 |
| `src/components/IngredientRecommender.tsx` | 16 |
| `src/components/MoonDisplay.tsx` | 15 |
| `src/components/CuisineRecommender.tsx` | 14 |

**Recommended approach**: Fix one file at a time, in the order above.
Expect each removal to surface 1–3 real bugs. Budget ~30–60 minutes per
file for the larger ones (`CookingMethods.tsx`, `AlchemicalRecommendations.tsx`).

### C. 2,028 `as any` casts (top-5 hold 12%)

| File | Count |
|------|-------|
| `src/components/recommendations/EnhancedIngredientRecommender.tsx` | 100 |
| `src/components/recommendations/IngredientRecommender.tsx` | 82 |
| `src/utils/ingredientRecommender.ts` | 73 |
| `src/components/cuisines/CurrentMomentCuisineRecommendations.tsx` | 59 |
| `src/services/UnifiedIngredientService.ts` | 57 |

The ingredient pipeline is essentially untyped. These files share a
common cause: the ingredient data files (`src/data/ingredients/**`) are
typed loosely with `[key: string]: unknown`, and each consumer casts
through `any` to read fields.

**Recommended approach**: Start by tightening the Ingredient type
itself (in `src/types/alchemy.ts` or wherever the canonical Ingredient
lives) so that downstream consumers can drop most casts. Doing this
before tackling the components avoids whack-a-mole.

### D. Oversized modules (refactor candidates)

- `services/FoodDiaryService.ts` — 3,887 lines
- `utils/ingredientRecommender.ts` — 3,191 lines
- `data/unified/recipeBuilding.ts` — 2,837 lines (and 17 TODOs)
- `utils/astrologyUtils.ts` — 2,741 lines

Each should be split by concern (e.g., `FoodDiaryService` likely
contains CRUD, aggregations, export, and analytics). These are slow
tsc/eslint targets and hot spots for merge conflicts.

### E. Data-as-code bloat — 7 cuisine files >3,500 lines

- `data/cuisines/american.ts` — 5,215 lines
- `data/cuisines/african.ts` — 4,377
- `data/cuisines/indian.ts` — 4,325
- `data/cuisines/chinese.ts` — 4,265
- `data/cuisines/greek.ts` — 4,203
- `data/cuisines/italian.ts` — 3,982
- `data/cuisines/french.ts` — 3,887

These are static data. Converting to JSON would cut ~30k LOC from the
TypeScript compile graph. Beware: some cuisine files contain
TypeScript expressions (`as const`, references to other modules) that
would need to be extracted. Prefer a script-driven conversion with a
runtime JSON loader.

### F. Other weak targets found in the survey

- **Weak type escape hatches in core types**:
  `zodiacInfluences?: any[]` in `types/recipe.ts:32,120` and
  `constants/alchemicalPillars.ts:1210` — defeats zodiac validation
  downstream. 93 `[key: string]: unknown` index signatures that
  effectively allow any key on otherwise well-typed interfaces.
- **Debug logging leakage**:
  `utils/hierarchicalSystemVerification.ts` has 30 `console.log`
  calls; `lib/auth/auth.ts` has 10. The auth logs are the biggest
  concern — they can leak flow details to production logs. Replace
  with the `createLogger` pattern used elsewhere.
- **Remaining lint warning**: build logs show
  `@typescript-eslint/no-unnecessary-type-assertion` at some file
  line 921 — I couldn't locate it from the truncated build log;
  `yarn lint 2>&1 | grep "no-unnecessary-type-assertion"` will surface
  it.

### G. Build/tooling notes for the next session

- The codebase uses **Yarn 3.6.4 via corepack**. In sandboxed environments
  where corepack can't reach `repo.yarnpkg.com`, fall back to
  `npm install --legacy-peer-deps --ignore-scripts` to install deps,
  but **revert `yarn.lock` before committing** (`git restore yarn.lock`)
  because npm will rewrite it to a lockfile-v3 format that breaks Vercel's
  `corepack yarn install`.
- `next typegen` must run before `tsc --noEmit` to generate
  `.next/types/**/*.ts` route types.
- Build command:
  `NODE_OPTIONS="--max-old-space-size=4096" ./node_modules/.bin/next build`

## Suggested order of attack for the next session

1. **(B)** Remove `@ts-expect-error` from one large offender (e.g.
   `CookingMethods.tsx` — 56 suppressions). High-value bug discovery.
2. **(A.1)** Unify the standalone `EnhancedRecipe` in
   `src/types/recipe.ts` to `extends Recipe`. Fix the `.join()` call
   sites. This single change should let most `as unknown as Recipe`
   casts in the menu planner be deleted.
3. **(F)** Replace `console.log` in `lib/auth/auth.ts` with the logger.
4. **(C)** Tighten the core Ingredient type, then sweep the top-5
   ingredient files for redundant `as any` casts.
5. **(D)** Split `FoodDiaryService.ts` by concern.
6. **(E)** Convert cuisine data to JSON (script-driven migration).

## Signal-to-noise helpers

```bash
# Count remaining suppressions per file (to pick your next target)
grep -rn "@ts-expect-error - Auto-fixed by script" --include="*.ts" --include="*.tsx" src | cut -d: -f1 | sort | uniq -c | sort -rn | head

# Find all "Recipe" type declarations (sanity-check consolidation progress)
grep -rnE "^(export )?(interface|type) (Enhanced|Scored|Local|Raw|Queued|Basic)?Recipe\b" --include="*.ts" --include="*.tsx" src

# Count as-any pressure per file
grep -rn "as any" --include="*.ts" --include="*.tsx" src | cut -d: -f1 | sort | uniq -c | sort -rn | head

# Verify zero TS errors
./node_modules/.bin/next typegen && ./node_modules/.bin/tsc --noEmit
```
