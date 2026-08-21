import type { RecommendedMeal } from "@/utils/menuPlanner/recommendationBridge";
import type { RecipePayloadItem } from "./types";

export function deduplicateRecipes(recipes: RecommendedMeal[]): RecommendedMeal[] {
  const seen = new Set<string>();
  return recipes.filter((r) => {
    const normalized = r.recipe.name
      .toLowerCase()
      .replace(/\s*\(monica enhanced\)\s*/gi, "")
      .replace(/\s*[-_]?\s*(copy|duplicate)\s*\d*\s*$/gi, "")
      .replace(/[^a-z0-9\s]/g, "")
      .replace(/\s+/g, " ")
      .trim();
    if (seen.has(normalized)) return false;
    seen.add(normalized);
    return true;
  });
}

export function getMealPlannerKey(): string {
  return "alchm-meal-planner-queue";
}

export interface MealPlannerQueueItem {
  recipeId: string;
  recipeName: string;
  recipe: RecipePayloadItem;
  dayOfWeek: number;
  mealType: string;
  addedAt: string;
}

export function addToMealPlannerQueue(
  recipe: RecipePayloadItem,
  dayOfWeek: number,
  mealType: string,
): void {
  try {
    const key = getMealPlannerKey();
    const stored = localStorage.getItem(key);
    const existing = (stored ? JSON.parse(stored) : []) as MealPlannerQueueItem[];
    const item: MealPlannerQueueItem = {
      recipeId: recipe.id ?? `gen-${Date.now()}`,
      recipeName: recipe.name,
      recipe,
      dayOfWeek,
      mealType,
      addedAt: new Date().toISOString(),
    };
    const filtered = existing.filter(
      (e) =>
        !(e.recipeName === item.recipeName && e.dayOfWeek === item.dayOfWeek && e.mealType === item.mealType),
    );
    filtered.push(item);
    localStorage.setItem(key, JSON.stringify(filtered));
  } catch {
    // localStorage unavailable
  }
}

export function getRecipeIdentity(recipe: { id?: string; name?: string } | undefined): string {
  return String(recipe?.id ?? recipe?.name ?? `recipe-${Date.now()}`);
}

export function mergePreferenceList(
  explicit: string[] = [],
  learned: string[] = [],
  limit = 12,
): string[] {
  const seen = new Set<string>();
  const merged: string[] = [];
  for (const item of [...explicit, ...learned]) {
    const normalized = item.trim();
    const key = normalized.toLowerCase();
    if (!normalized || seen.has(key)) continue;
    seen.add(key);
    merged.push(normalized);
    if (merged.length >= limit) break;
  }
  return merged;
}
