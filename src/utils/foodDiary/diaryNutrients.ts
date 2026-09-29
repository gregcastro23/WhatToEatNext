/**
 * Which nutrients a diary entry keeps, and how much of a day a total covers
 * (owner rulings 2026-09-28, option c).
 *
 * - A recipe logged to the diary ("I ate this") keeps only the nutrients the
 *   recipe publishes as amounts. Recipe vitamins and minerals come from
 *   ingredient data that records fractions of a Daily Value, which were copied
 *   into fields named as mg (see PR #910), so they must never feed an mg bar.
 * - The potassium and saturated-fat bars show a total only over the entries
 *   that carry a value: "≥120mg" with "2 of 3 entries list it", or "—" when
 *   none does. An entry that is silent about a nutrient is not 0 mg of it.
 */
import type { EntryCoverage, FoodDiaryEntry, FoodDiaryNutrition, FoodSource } from "@/types/foodDiary";

/** What a recipe entry keeps: amounts in g / mg / kcal, never DV fractions. */
const RECIPE_AMOUNTS: ReadonlyArray<keyof FoodDiaryNutrition> = [
  "calories", "protein", "carbs", "fat", "fiber", "sugar", "addedSugar",
  "sodium", "saturatedFat", "transFat", "cholesterol",
];

function isRecipeAmount(key: string): key is keyof FoodDiaryNutrition {
  return RECIPE_AMOUNTS.some((kept) => kept === key);
}

/** The nutrition an entry from `source` may store. */
export function storableNutrition(source: FoodSource, nutrition: FoodDiaryNutrition): FoodDiaryNutrition {
  if (source !== "recipe") return nutrition;
  const kept: FoodDiaryNutrition = {};
  for (const [key, value] of Object.entries(nutrition)) {
    if (isRecipeAmount(key) && typeof value === "number") kept[key] = value;
  }
  return kept;
}

/** The dashboard bars that say how many entries their total covers. */
export type CoveredNutrient = "potassium" | "saturatedFat";

export function entryCoverage(entries: readonly FoodDiaryEntry[], nutrient: CoveredNutrient): EntryCoverage {
  return {
    entries: entries.length,
    withValue: entries.filter((e) => Number.isFinite(e.nutrition[nutrient])).length,
  };
}

/** "120", "≥120" when only some entries carry a value, "—" when none does. */
export function formatCoveredAmount(value: number, coverage: EntryCoverage): string {
  if (coverage.withValue === 0) return "—";
  const bound = coverage.withValue < coverage.entries ? "≥" : "";
  return `${bound}${Math.round(value)}`;
}

/** "2 of 3 entries list it", "no entry lists it", or null when every entry does. */
export function coverageNote(coverage: EntryCoverage): string | null {
  const { withValue, entries } = coverage;
  if (withValue >= entries) return null;
  if (withValue === 0) return entries === 1 ? "this entry doesn't list it" : "no entry lists it";
  return `${withValue} of ${entries} entries list it`;
}
