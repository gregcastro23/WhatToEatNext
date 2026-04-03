/**
 * Shared meal type matching utilities for the menu planner.
 * Determines whether a recipe is suitable for a given meal slot
 * (breakfast, lunch, dinner, snack) based on explicit mealType
 * fields and keyword heuristics.
 *
 * @file src/utils/menuPlanner/mealTypeMatching.ts
 */

import type { MealType } from "@/types/menuPlanner";

interface RecipeLike {
  name?: string;
  mealType?: string | string[];
  tags?: string[];
}

/**
 * Check if a recipe is suitable for a given meal type.
 * First checks the explicit `mealType` field, then falls back
 * to keyword matching on recipe name and tags.
 */
export function isSuitableForMealType(
  recipe: RecipeLike,
  mealType: MealType,
): boolean {
  // Check explicit mealType field
  if (recipe.mealType) {
    const recipeMealTypes = Array.isArray(recipe.mealType)
      ? recipe.mealType
      : [recipe.mealType];
    const normalized = recipeMealTypes.map((t) => t.toLowerCase());
    if (normalized.includes(mealType)) return true;
  }

  // Check tags for meal type hints
  const tags = (recipe.tags || []).map((t) => t.toLowerCase());
  const name = (recipe.name || "").toLowerCase();

  if (mealType === "breakfast") {
    const breakfastKeywords = [
      "egg",
      "oat",
      "pancake",
      "waffle",
      "smoothie",
      "cereal",
      "toast",
      "breakfast",
      "muffin",
      "granola",
      "yogurt",
      "porridge",
      "congee",
      "crepe",
      "frittata",
      "omelette",
      "omelet",
    ];
    return breakfastKeywords.some(
      (k) => name.includes(k) || tags.some((t) => t.includes(k)),
    );
  }

  if (mealType === "lunch") {
    const lunchKeywords = [
      "sandwich",
      "salad",
      "soup",
      "wrap",
      "bowl",
      "lunch",
      "bento",
      "poke",
    ];
    return lunchKeywords.some(
      (k) => name.includes(k) || tags.some((t) => t.includes(k)),
    );
  }

  if (mealType === "dinner") {
    const dinnerKeywords = [
      "pasta",
      "steak",
      "roast",
      "stir-fry",
      "curry",
      "stew",
      "dinner",
      "casserole",
      "grill",
      "bake",
      "braise",
      "risotto",
      "tagine",
      "biryani",
      "paella",
      "ramen",
      "pho",
      "lasagna",
    ];
    return dinnerKeywords.some(
      (k) => name.includes(k) || tags.some((t) => t.includes(k)),
    );
  }

  return true; // snacks - anything works
}
