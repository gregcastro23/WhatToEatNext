/**
 * Facts the live catalog does not carry, read from each recipe's static twin
 * (Phase 0's identity bridge): the meal the static catalog files it under,
 * and its prep and cook minutes as authored.
 *
 * [MEASURED 2026-09-25, production] All 1,063 live recipes store prep 30 +
 * cook 30 and category "main": placeholders, not facts. Every live recipe has
 * a static twin (1,064 twins over 1,063 live recipes).
 */
import { buildRecipeIdentityIndex, type RecipeIdentityRecord } from "@/lib/recipes/recipeIdentity";
import type { Recipe } from "@/types/recipe";
import { isInternalCuisineCode } from "@/utils/internalCuisineCodes";
import type { MealIntent } from "./intentLexicon";

export interface AuthoredFacts {
  /** Prep plus cook, as authored; null = not stated. */
  minutes: number | null;
  meals: readonly MealIntent[];
}

export type AuthoredLookup = (recipe: Recipe) => AuthoredFacts;

const MEALS: readonly MealIntent[] = ["breakfast", "lunch", "dinner", "dessert"];
/**
 * The HSCA archive's generator fills a missing or zero time with 15
 * (`prepTimeMinutes || 15`, `cookTimeMinutes || 15`: scripts/generateHscaCuisine.ts).
 * [MEASURED 2026-09-25] 500 of its 502 recipes carry cook 15, an agua fresca
 * included, so an HSCA total with a 15 in it is not a stated time.
 */
const HSCA_FILL_MINUTES = 15;

function identity(recipe: Recipe): RecipeIdentityRecord {
  return { id: String(recipe.id), name: recipe.name, ...(typeof recipe.cuisine === "string" ? { cuisine: recipe.cuisine } : {}) };
}

function stated(value: string | undefined): number | null {
  const minutes = Number(value);
  return value !== undefined && value.trim() !== "" && Number.isFinite(minutes) && minutes >= 0 ? minutes : null;
}

function authoredMinutes(recipe: Recipe): number | null {
  const prep = stated(recipe.prepTime);
  const cook = stated(recipe.cookTime);
  if (prep === null || cook === null) return null;
  if (isInternalCuisineCode(recipe.cuisine) && (prep === HSCA_FILL_MINUTES || cook === HSCA_FILL_MINUTES)) return null;
  const total = prep + cook;
  return total > 0 ? total : null;
}

function mealsOf(recipe: Recipe): MealIntent[] {
  const values = Array.isArray(recipe.mealType) ? recipe.mealType : [recipe.mealType];
  const lowered = values.map((value) => (typeof value === "string" ? value.trim().toLowerCase() : ""));
  return MEALS.filter((meal) => lowered.includes(meal));
}

export function authoredFactsOf(recipe: Recipe): AuthoredFacts {
  return { minutes: authoredMinutes(recipe), meals: mealsOf(recipe) };
}

/**
 * Facts for any recipe: a static recipe (the catalog's degraded fallback, or
 * a test) is its own source; a live recipe reads its first static twin; a
 * live recipe with no twin has none.
 */
export function buildAuthoredLookup(staticRecipes: readonly Recipe[], liveRecipes: readonly Recipe[]): AuthoredLookup {
  const staticById = new Map<string, Recipe>();
  for (const recipe of staticRecipes) if (!staticById.has(String(recipe.id))) staticById.set(String(recipe.id), recipe);
  const index = buildRecipeIdentityIndex(staticRecipes.map(identity), liveRecipes.map(identity));
  const byLiveId = new Map<string, Recipe>();
  for (const recipe of staticRecipes) {
    const resolved = index.resolve(String(recipe.id));
    if (resolved?.kind === "twin" && !byLiveId.has(resolved.liveId)) byLiveId.set(resolved.liveId, recipe);
  }
  return (recipe) => {
    const id = String(recipe.id);
    const source = staticById.get(id) ?? byLiveId.get(id);
    return source ? authoredFactsOf(source) : { minutes: null, meals: [] };
  };
}
