# Next Session Prompt — Recipe Page Phases 3 & 5

Use this as the opening message of a fresh Claude Code session to continue the recipe-page transformation.

---

## Context — What's Already Built (Phases 1, 2, 4)

The recipe page at `src/app/recipes/[recipeId]/page.tsx` has been upgraded from read-only to interactive. Completed work:

**Phase 1 — Interactive ingredients** *(shipped)*
- `src/app/api/ingredients/[name]/route.ts` — returns full ingredient profile + recipes containing it + substitution suggestions from `pairingRecommendations.complementary`
- `src/components/recipes/IngredientDrawer.tsx` — slide-in right drawer (full-screen on mobile) showing qualities, elemental signature, ESMS + Kalchm/Monica, taste profile, nutrition macros + vitamins/minerals, seasonality, origin, storage, cooking methods, ruling planets/zodiac, pairings (complements/contrasts/avoid), substitutions, and "More recipes with this ingredient" list
- Every ingredient on the recipe page is now a clickable button that opens the drawer with the scaled per-recipe amount

**Phase 2 — Technique & timer layer** *(shipped)*
- `src/app/api/techniques/[name]/route.ts` — looks up `allCookingMethods` from `src/data/cooking/methods`; includes a `VERB_ALIASES` map (roast→roasting, sauté→stir-frying, etc.)
- `src/components/recipes/TechniqueModal.tsx` — centered modal with overview, elemental signature, science/principles, benefits, optimal temperatures (F + C), doneness indicators, common mistakes, expert tips, tools, best-for chips
- `src/components/recipes/InteractiveInstruction.tsx` — parses each instruction string and renders:
  - Technique verbs as clickable orange dotted-underline tokens (opens `TechniqueModal`)
  - Time phrases ("15 minutes", "1-2 hours") with an inline countdown timer that beeps on completion (WebAudio)
  - Temperatures with Celsius/Fahrenheit conversion tooltips

**Phase 4 — Nutrition visualization** *(shipped)*
- `src/components/recipes/NutritionVisualization.tsx` — replaces the old macro grid with:
  - Headline calories + % of 2000-cal DV
  - Recharts `PieChart` showing macro split (calories from protein/carbs/fat) with custom tooltip
  - %DV bars for protein/carbs/fat/fiber/sugar/sodium (turns red when >100%)
  - Micronutrient coverage label + chip grid
- Removed the now-dead `NutritionGrid` helper from the page

**Build status:** `npx tsc --noEmit --skipLibCheck` → exit 0. ESLint on all touched files → 0 errors.

---

## Your Mission — Phases 3 & 5

### Phase 3: Dynamic Recipe Customization

Transform the recipe page from "read this exact recipe" to "adapt this recipe to me." Users should be able to one-click transform a dish while the app intelligently swaps ingredients and updates nutrition + alchemical scores.

**3A. Dietary Adaptation Engine**

Add a row of transform buttons above the ingredients section:
- "Make Vegan" · "Make Vegetarian" · "Gluten-Free" · "Dairy-Free" · "Keto" · "Low-Carb"

When clicked:
- Build a substitution map (meat → jackfruit/tofu/seitan with context; butter → olive oil or vegan butter; flour → almond flour for keto, etc.)
- Display ingredient swaps inline with strikethrough + replacement, e.g. ~~2 tbsp butter~~ → **2 tbsp olive oil**
- Show a diff banner: "Adapted for vegan — 3 swaps, -180 cal, elemental Fire -0.08"
- Add a "Reset to original" button
- Disable the transform if it's already compatible (e.g., recipe is already vegan → show ✓ chip instead)

Architecture suggestion:
- New file: `src/utils/dietaryAdaptation.ts` — pure functions `adaptRecipe(recipe, mode)` returning `{ swaps: Array<{index, from, to, reason}>, nutritionalDelta, elementalDelta }`
- Swap rules keyed by category + name substring. Draw substitution targets from `src/data/ingredients/` where possible (same category, different dietary tags). Hard-code a `COMMON_SWAPS` map for the 40-50 most frequent conversions.
- Don't mutate the recipe. Return a derived "adapted recipe" object consumed by the render layer.

**3B. Flavor Profile Tuning**

Add a small inline control panel:
- "+ Sweeter" · "+ Umami" · "+ Acidic" · "+ Spicier" · "+ Savory"

Each click adds a micro-adjustment suggestion (e.g., "+ 1 tsp honey", "+ dash of fish sauce", "+ squeeze of lemon", "+ ¼ tsp cayenne"). Collect suggestions into a sidebar "Flavor Tweaks" list the user can toggle individually.

Architecture:
- `src/utils/flavorTuning.ts` with pure function `suggestTweaks(direction, currentFlavorProfile)` → `{ ingredient, amount, reason }`
- Avoid the rabbit hole of computing new ESMS/elemental values for these small additions; just show the additive suggestions.

**3C. Time-Constraint Shortcuts**

Add a "How much time do you have?" pill row: 15 min · 30 min · 60 min · All day.

When a shorter time is selected:
- Highlight steps that can be skipped, simplified, or parallelized
- Surface make-ahead tips: "Prep the onions the night before to save 10 min"
- Suggest equipment swaps: "Use a pressure cooker: braise 4h → 35 min"
- If recipe's total time already fits, show a green ✓

This one is primarily presentational — use `recipe.tips`, `recipe.variations`, `recipe.makeAheadTips` (check the Recipe type for exact field names) plus a small heuristic parser over the instruction strings to identify skippable/parallelizable steps (keywords: "marinate", "rest", "chill").

### Phase 5: Social, Discovery & Meal Planning

**5A. Meal Planning Integration**

- Add "Add to Meal Plan" button in the recipe header (next to Copy Recipe)
- Check for existing meal-plan infrastructure first: `src/app/menu-planner/`, `src/services/`, and any API route under `src/app/api/` referencing "plan" or "menu" — integrate rather than rebuild
- If missing: build a simple `useMealPlan` hook backed by `localStorage` (key: `alchm:meal-plan:v1`) with shape `{ date: string, recipeId: string, mealType?: string }[]`
- Add a date-picker mini-modal for scheduling
- Build a "Grocery List" aggregator: a new route `/meal-plan/groceries` that sums ingredients across all scheduled recipes, consolidating by name+unit

**5B. Discovery Enhancements**

On the recipe page, add new discovery surfaces:
- **"Recipes with similar elemental profile"** — API: new GET endpoint that ranks all recipes by Euclidean distance on Fire/Water/Earth/Air, returns top 6 excluding current. Use `elementalProperties` on recipes from `UnifiedRecipeService.getAllRecipes()`
- **"Recipes with similar planetary alignment"** — rank by cosine similarity on ESMS (spirit/essence/matter/substance)
- **"Try next in [cuisine]"** — 3 other recipes from the same cuisine, ordered by `monicaScore` descending

These can live in one endpoint: `src/app/api/recipes/[recipeId]/discover/route.ts` returning `{ similarElemental, similarAlchemical, sameCuisine }`.

**5C. Social UX (Design Only — No Backend)**

Build the UI shell for user contributions, wired to placeholder state (no persistence yet). The goal is to lock in UX patterns so a future session can bolt on backend/auth.
- "Made this" counter + button (optimistic update, localStorage for now)
- Star rating (1-5) with optional short review textarea
- Photo upload stub (file input → base64 preview, no upload yet)
- Community tips section — read-only mock data; display as if sourced from other users

Add a comment at the top of each placeholder component: `// TODO(phase 5.5): wire to /api/users/me/recipes when auth-gated endpoint exists`.

---

## Working Rules (Non-negotiable)

1. **Preserve zero TypeScript errors.** Run `npx tsc --noEmit --skipLibCheck` after each major change. Exit 0 or fix immediately.
2. **Dark glass aesthetic.** Follow the established visual language: `glass-card-premium`, `border-white/8`, amber/orange for primary, gradient text `bg-gradient-to-r from-amber-200 to-orange-300` for headings.
3. **Client components** must include `"use client"` directive at the top.
4. **ESMS only from planetary positions** — never recompute ESMS from elementals. For diet adaptations, just show nutritional/elemental deltas, not ESMS deltas.
5. **Elemental casing**: `Fire` `Water` `Earth` `Air` (capitalized). Zodiac signs lowercase (`aries`).
6. **No new `as any` casts** unless following documented patterns in CLAUDE.md.
7. **Component location**: `src/components/recipes/*.tsx` for recipe-specific UI.
8. **If using `<style jsx>`** wrap with `{/* eslint-disable react/no-unknown-property */}` and `{/* eslint-enable */}`.

## Key Existing Infrastructure

- `UnifiedRecipeService.getInstance()` — `getAllRecipes()`, `getRecipeById(id)`
- `IngredientService.getInstance()` — `getIngredientByName(name)`, `getAllIngredientsFlat()`, `getIngredientsByCategory(cat)`
- Recipe type: `src/types/recipe.ts` — has `ingredients: RecipeIngredient[]`, `elementalProperties`, `spirit/essence/matter/substance`, `monicaScore`, dietary booleans (`isVegan` etc.), `allergens`, `substitutions`
- Ingredient data lives in `src/data/ingredients/{category}/*.ts`; each file exports an object keyed by normalized name, with the schema shown in `src/types/ingredient.ts` and `src/data/unified/unifiedTypes.ts`
- Recharts 3.8.1 is installed. Framer Motion 12.38 is installed if you want transitions.
- Recipe page at `src/app/recipes/[recipeId]/page.tsx` already imports `IngredientDrawer`, `InteractiveInstruction`, `NutritionVisualization`, `TechniqueModal` from `src/components/recipes/`.

## Suggested Build Order

1. **Start with Phase 5B discovery endpoint** — quick win, reuses existing data, gives immediate new surface on the page
2. **Phase 3A dietary adaptation** — highest user-facing impact, most complex logic
3. **Phase 3B/3C** — layer in after 3A infrastructure is stable
4. **Phase 5A meal plan** — requires localStorage + small new route
5. **Phase 5C social shells** — last; pure UX, unblocks a future backend session

Commit after each phase lands green. Confirm with the user before opening a PR.

## First Step

Read the current state of `src/app/recipes/[recipeId]/page.tsx` to understand what's already wired. Then run `npx tsc --noEmit --skipLibCheck` to confirm the zero-error baseline. Then ask the user which phase to prioritize if they haven't already specified.
