# Next Session Prompt: Finalizing the Architecture & Interactive Experience

This prompt is designed to kick off the next session, bridging the recent data infrastructure optimizations with the interactive recipe UI enhancements.

## Context & Recent Progress

We have recently completed several critical reliability and performance optimizations:
1. **API Hardening:** Replaced manual body parsing with strict Zod validation schemas (`CreateFoodDiaryEntrySchema`, `CommensalRequestSchema`, `UserProfileUpdateSchema`) in key `src/app/api/` routes, ensuring malformed requests are caught at the boundary.
2. **Auth Reliability:** Addressed NextAuth v5 origin mismatches by strictly applying the request auth origin, fixing 401s during the onboarding flow.
3. **Connection Pooling:** Bumped the `DB_MAX_CONNECTIONS` from 10 to 50 in `src/lib/database/config.ts` to alleviate the "thundering herd" bottleneck during the heavy initial app load (Astrology + Cuisines + Recipes).
4. **Denormalized Read Model:** Ensured that `LocalRecipeService` utilizes the `read_model` JSONB column in `RECIPE_QUERY` to avoid costly SQL joins.
5. **Asset Optimization:** Shipped the 69KB optimized `Aklogo.jpg`.
6. **Planetary Validation:** `PLANETARY_VALIDATION.md` confirms we have robust logic catching corrupt natal chart data before persistence.
7. **Amazon Fallback:** Fallback UI links for Amazon affiliate sales are in place for provisional accounts.

## Core Objectives for This Session

The primary goal for this session is two-fold: Execute the Short-Term Data Migration tasks, and continue Phase 3 & 5 of the Recipe Page Interactive overhaul.

### Objective 1: Infrastructure – Bulk Migration & Caching (The "Data Infra" Roadmap)
According to the `DATA_INFRA_REVIEW.md`, we need to address the remaining bottlenecks in our data fetching patterns.
*   **Task 1A: Bulk Migration Scripting.** The current `migrate_data.py` (or its JS equivalent) performs serial inserts (1.5-2 recipes/second). Rewrite this to utilize bulk `INSERT` statements wrapped in batched transactions.
*   **Task 1B: Edge Caching Strategy.** While `LocalRecipeService` uses the `read_model` column, we still fetch all recipes into memory frequently. Implement a caching layer or investigate moving the static JSON catalog to an Edge KV store (Cloudflare KV or Upstash Redis) to bypass the DB entirely for reads, targeting sub-20ms latency.

### Objective 2: Recipe Page Phase 3 – Dynamic Customization
The recipe page at `src/app/recipes/[recipeId]/page.tsx` currently has interactive ingredients, techniques, and nutrition visualization. We need to add real-time adaptation.
*   **Task 2A: Dietary Adaptation Engine.** Create `src/utils/dietaryAdaptation.ts` with pure functions to adapt recipes (Make Vegan, Gluten-Free, Keto). Show inline swaps with strikethroughs and a diff banner summarizing the changes (calories, elemental delta).
*   **Task 2B: Flavor Profile Tuning.** Add an inline control panel (+ Sweeter, + Umami, + Acidic) that suggests micro-adjustments via `src/utils/flavorTuning.ts`.
*   **Task 2C: Time-Constraint Shortcuts.** Add time-based pills (15m, 30m) that parse the recipe and highlight skippable steps or suggest equipment swaps (e.g., pressure cooker).

### Objective 3: Recipe Page Phase 5 – Discovery & Planning
*   **Task 3A: Meal Planning Integration.** Build a "Add to Meal Plan" button and local storage hook (`useMealPlan`) or integrate with existing `src/app/menu-planner/` API routes.
*   **Task 3B: Discovery Enhancements.** Create a new endpoint `src/app/api/recipes/[recipeId]/discover/route.ts` that returns `{ similarElemental, similarAlchemical, sameCuisine }` using cosine similarity on ESMS and Euclidean distance on Fire/Water/Earth/Air.

## Operating Constraints
1. **Type Safety:** Maintain zero TypeScript errors. Run `npx tsc --noEmit && npm run lint` frequently.
2. **Visual Consistency:** Stick to the dark glass aesthetic (`glass-card-premium`, `border-white/8`, amber/orange gradients).
3. **Modular Components:** Place new UI elements in `src/components/recipes/` and logic in `src/utils/`. Do not mutate the core recipe object; return a derived state for adapted recipes.

## Getting Started
To begin, run `npx tsc --noEmit && npm run lint` to confirm a clean state, and then select whether to begin with **Objective 1 (Infrastructure)** or **Objective 2 (Recipe Customization)**.