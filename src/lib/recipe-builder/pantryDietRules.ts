/**
 * What the free recipe matches can and cannot promise. Only vegan and
 * vegetarian can be checked per recipe (lib/search/recipeDiet), so any other
 * restriction or allergen is stated, never silently ignored.
 */
import { PANTRY_DIETS, type PantryQuery } from "@/lib/validation/pantrySearchSchemas";
import type { PantryDiet } from "./pantryRecipeRequest";

type Filter = PantryQuery["diet"];

function checkable(value: string): Filter {
  return PANTRY_DIETS.find((diet) => diet === value.trim().toLowerCase()) ?? null;
}

/** Whether the chosen diet can filter the free matches at all. */
export function canMatchDiet(choice: PantryDiet): boolean {
  return choice === "no-restrictions" || checkable(choice) !== null;
}

/** The choice, else the strictest checkable restriction on the profile. */
export function matchDiet(choice: PantryDiet, profile: readonly string[]): Filter {
  const chosen = checkable(choice);
  const own = profile.map(checkable);
  if (chosen === "vegan" || own.includes("vegan")) return "vegan";
  return chosen ?? (own.includes("vegetarian") ? "vegetarian" : null);
}

export function matchCaveat(profile: readonly string[], allergies: readonly string[]): string | null {
  const unchecked = [...profile.filter((entry) => checkable(entry) === null && entry.trim() !== ""), ...allergies];
  if (unchecked.length === 0) return null;
  return `These site recipes are not screened for: ${[...new Set(unchecked)].join(", ")}. Check each ingredient list.`;
}
