/**
 * What the recipe catalog page can display. The page validates every recipe
 * the API sends and drops the ones that fail, so a recipe that fails this
 * check is served but never seen. The page counts the drops and says so; the
 * catalog audit applies the same predicate to prove none are dropped.
 */
import type { Recipe } from "@/types/recipe";

function hasValidElementalProperties(ep: unknown): boolean {
  if (!ep || typeof ep !== "object") return false;
  return (
    "Fire" in ep &&
    typeof ep.Fire === "number" &&
    "Water" in ep &&
    typeof ep.Water === "number" &&
    "Earth" in ep &&
    typeof ep.Earth === "number" &&
    "Air" in ep &&
    typeof ep.Air === "number"
  );
}

export function isDisplayableRecipe(r: unknown): r is Recipe {
  if (!r || typeof r !== "object") return false;
  if (!("id" in r) || typeof r.id !== "string") return false;
  if (!("name" in r) || typeof r.name !== "string") return false;
  if (!("ingredients" in r) || !Array.isArray(r.ingredients)) return false;
  if (!("instructions" in r) || !Array.isArray(r.instructions)) return false;
  return "elementalProperties" in r && hasValidElementalProperties(r.elementalProperties);
}

/** Why a recipe would not display, or null when it would. For audit output. */
export function whyNotDisplayable(r: unknown): string | null {
  if (isDisplayableRecipe(r)) return null;
  if (!r || typeof r !== "object") return "not an object";
  if (!("id" in r) || typeof r.id !== "string") return "id";
  if (!("name" in r) || typeof r.name !== "string") return "name";
  if (!("ingredients" in r) || !Array.isArray(r.ingredients)) return "ingredients";
  if (!("instructions" in r) || !Array.isArray(r.instructions)) return "instructions";
  return "elementalProperties";
}

/** "middle-eastern" → "Middle Eastern", for a heading. */
export function cuisineHeading(slug: string | null): string {
  if (!slug) return "All";
  return slug
    .trim()
    .split(/[\s_-]+/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}
