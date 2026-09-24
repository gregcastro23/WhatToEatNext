/**
 * Inbound options adapter for POST /api/recommendations/generate.
 * Enforces an allowlist of valid DayRecommendationOptions fields,
 * strips undefined properties, and strictly discards client-supplied userContext.
 *
 * @file src/app/api/recommendations/generate/optionsAdapter.ts
 */

import type { DayRecommendationOptions } from "@/utils/menuPlanner/recommendationBridge";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function toStringArray(value: unknown): string[] | undefined {
  if (!Array.isArray(value)) return undefined;
  const items: string[] = [];
  for (const item of value) {
    if (typeof item === "string" && item.trim().length > 0) {
      items.push(item.trim());
    }
  }
  return items.length > 0 ? items : undefined;
}

function toMealTypeArray(value: unknown): DayRecommendationOptions["mealTypes"] {
  if (!Array.isArray(value)) return undefined;
  const result: NonNullable<DayRecommendationOptions["mealTypes"]> = [];
  for (const item of value) {
    if (typeof item === "string") {
      if (item === "breakfast" || item === "lunch" || item === "dinner" || item === "snack") {
        result.push(item);
      }
    }
  }
  return result.length > 0 ? result : undefined;
}

function toComplexityPreference(value: unknown): DayRecommendationOptions["complexityPreference"] {
  if (value === "simple" || value === "moderate" || value === "complex") {
    return value;
  }
  return undefined;
}

function toExistingMeals(value: unknown): DayRecommendationOptions["existingMeals"] {
  if (!Array.isArray(value)) return undefined;
  const meals: NonNullable<DayRecommendationOptions["existingMeals"]> = [];
  for (const item of value) {
    if (!isRecord(item)) continue;
    if (typeof item.recipeId === "string" && typeof item.recipeName === "string") {
      const entry: NonNullable<DayRecommendationOptions["existingMeals"]>[number] = {
        recipeId: item.recipeId,
        recipeName: item.recipeName,
      };
      if (typeof item.cuisine === "string") entry.cuisine = item.cuisine;
      if (typeof item.primaryProtein === "string") entry.primaryProtein = item.primaryProtein;
      meals.push(entry);
    }
  }
  return meals.length > 0 ? meals : undefined;
}

function toNutritionalContext(value: unknown): DayRecommendationOptions["nutritionalContext"] {
  if (!isRecord(value)) return undefined;
  const ctx: NonNullable<DayRecommendationOptions["nutritionalContext"]> = {};
  if (typeof value.remainingCalories === "number") ctx.remainingCalories = value.remainingCalories;
  if (typeof value.remainingProteinG === "number") ctx.remainingProteinG = value.remainingProteinG;
  if (typeof value.remainingCarbsG === "number") ctx.remainingCarbsG = value.remainingCarbsG;
  if (typeof value.remainingFatG === "number") ctx.remainingFatG = value.remainingFatG;
  if (typeof value.remainingFiberG === "number") ctx.remainingFiberG = value.remainingFiberG;
  if (typeof value.prioritizeProtein === "boolean") ctx.prioritizeProtein = value.prioritizeProtein;
  if (typeof value.prioritizeFiber === "boolean") ctx.prioritizeFiber = value.prioritizeFiber;
  return ctx;
}

/**
 * Adapt raw client options to typed DayRecommendationOptions.
 * userContext is strictly excluded so client charts are never used.
 */
export function toDayRecommendationOptions(raw: unknown): DayRecommendationOptions {
  if (!isRecord(raw)) return {};

  const mealTypes = toMealTypeArray(raw.mealTypes);
  const dietaryRestrictions = toStringArray(raw.dietaryRestrictions);
  const preferredCuisines = toStringArray(raw.preferredCuisines);
  const excludeIngredients = toStringArray(raw.excludeIngredients);
  const requiredIngredients = toStringArray(raw.requiredIngredients);
  const preferredCookingMethods = toStringArray(raw.preferredCookingMethods);
  const flavorPreferences = toStringArray(raw.flavorPreferences);
  const favoriteIngredients = toStringArray(raw.favoriteIngredients);
  const dislikedIngredients = toStringArray(raw.dislikedIngredients);
  const complexityPreference = toComplexityPreference(raw.complexityPreference);
  const existingMeals = toExistingMeals(raw.existingMeals);
  const nutritionalContext = toNutritionalContext(raw.nutritionalContext);

  const opts: DayRecommendationOptions = {};
  if (mealTypes) opts.mealTypes = mealTypes;
  if (dietaryRestrictions) opts.dietaryRestrictions = dietaryRestrictions;
  if (typeof raw.useCurrentPlanetary === "boolean") opts.useCurrentPlanetary = raw.useCurrentPlanetary;
  if (typeof raw.maxRecipesPerMeal === "number") opts.maxRecipesPerMeal = raw.maxRecipesPerMeal;
  if (preferredCuisines) opts.preferredCuisines = preferredCuisines;
  if (excludeIngredients) opts.excludeIngredients = excludeIngredients;
  if (requiredIngredients) opts.requiredIngredients = requiredIngredients;
  if (preferredCookingMethods) opts.preferredCookingMethods = preferredCookingMethods;
  if (flavorPreferences) opts.flavorPreferences = flavorPreferences;
  if (favoriteIngredients) opts.favoriteIngredients = favoriteIngredients;
  if (dislikedIngredients) opts.dislikedIngredients = dislikedIngredients;
  if (complexityPreference) opts.complexityPreference = complexityPreference;
  if (existingMeals) opts.existingMeals = existingMeals;
  if (typeof raw.budgetPerMeal === "number") opts.budgetPerMeal = raw.budgetPerMeal;
  if (typeof raw.maxPrepTimeMinutes === "number" || raw.maxPrepTimeMinutes === null) {
    opts.maxPrepTimeMinutes = raw.maxPrepTimeMinutes;
  }
  if (nutritionalContext) opts.nutritionalContext = nutritionalContext;

  return opts;
}
