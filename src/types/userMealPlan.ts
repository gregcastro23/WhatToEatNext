/**
 * The per-user saved meal plan served by /api/users/me/meal-plan (recipes a
 * user queued for a date). Distinct from the weekly menu planner in
 * menuPlanner.ts.
 *
 * @file src/types/userMealPlan.ts
 */

/** One stored entry as the API returns it. Unset fields are absent, never null. */
export interface MealPlanEntryDTO {
  id: string;
  recipeId: string;
  recipeName?: string;
  date: string; // YYYY-MM-DD
  mealType?: string;
  servings: number;
  addedAt: number; // epoch ms
}

/** GET — `authenticated: false` always carries an empty list. */
export interface MealPlanListResponse {
  authenticated: boolean;
  entries: MealPlanEntryDTO[];
}

/** POST (single entry). */
export interface MealPlanAddResponse {
  authenticated: true;
  entry: MealPlanEntryDTO;
}
