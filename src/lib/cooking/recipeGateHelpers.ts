/**
 * Verification Gate Helpers — unit parsing, catalog resolution, and thermal extraction
 *
 * @file src/lib/cooking/recipeGateHelpers.ts
 */

import { countToMass } from "@/lib/cooking/countToMass";
import { MEASURE_ML, volumeToMass } from "@/lib/cooking/volumetrics";
import type { CatalogIngredient } from "@/lib/ingredients/ingredientCatalog";
import { tryResolveFromCatalog } from "./recipeGateResolver";
import type { RecipeContentIngredient } from "./recipeGateTypes";

export const UNIT_CANONICAL_MAP: Record<string, string> = {
  tablespoon: "tbsp",
  tablespoons: "tbsp",
  tbs: "tbsp",
  tb: "tbsp",
  teaspoon: "tsp",
  teaspoons: "tsp",
  cups: "cup",
  c: "cup",
  grams: "g",
  gram: "g",
  kilograms: "kg",
  kilogram: "kg",
  ounces: "oz",
  ounce: "oz",
  pounds: "lb",
  pound: "lb",
  lbs: "lb",
  milliliters: "ml",
  milliliter: "ml",
  liters: "l",
  liter: "l",
  cloves: "clove",
  stalks: "stalk",
  slices: "slice",
  pinches: "pinch",
  pieces: "piece",
};

export function parseFractionalQuantity(qtyStr: string): number {
  const trimmed = qtyStr.trim();
  const mixedMatch = trimmed.match(/^(\d+)\s+(\d+)\/(\d+)$/);
  if (mixedMatch) {
    const whole = parseInt(mixedMatch[1] ?? "0", 10);
    const num = parseInt(mixedMatch[2] ?? "0", 10);
    const den = parseInt(mixedMatch[3] ?? "1", 10);
    return den > 0 ? whole + num / den : whole;
  }
  const fracMatch = trimmed.match(/^(\d+)\/(\d+)$/);
  if (fracMatch) {
    const num = parseInt(fracMatch[1] ?? "0", 10);
    const den = parseInt(fracMatch[2] ?? "1", 10);
    return den > 0 ? num / den : 0;
  }
  const parsed = parseFloat(trimmed);
  return Number.isNaN(parsed) ? 0 : parsed;
}

export function normalizeUnit(rawUnit: string): string {
  const trimmed = rawUnit.trim();
  if (trimmed === "T" || trimmed === "T.") return "tbsp";
  if (trimmed === "t" || trimmed === "t.") return "tsp";
  const lower = trimmed.toLowerCase();
  return UNIT_CANONICAL_MAP[lower] ?? lower;
}

export {
  GLUTEN_CONTAINING_TERMS,
  GLUTEN_EXEMPT_TERMS,
  isKnownGlutenSource,
} from "./recipeGateDietCoverage";

export interface ResolvedIngredientResult {
  ingredient: RecipeContentIngredient;
  entry: CatalogIngredient | null;
  gramWeight: number;
}

export * from "./recipeGateResolver";

export function computeGramWeight(
  name: string,
  qty: number,
  unit: string,
): number {
  if (unit === "g") return qty;
  if (unit === "kg") return qty * 1000;
  if (unit === "oz") return qty * 28.35;
  if (unit === "lb") return qty * 453.59;
  if (unit === "cup" || unit === "tbsp" || unit === "tsp") {
    const vol = volumeToMass(name, qty, unit);
    return vol?.grams ?? qty * MEASURE_ML[unit];
  }
  const count = countToMass(name, qty, unit);
  return count?.grams ?? qty * 50;
}

export function resolveSingleIngredient(ing: RecipeContentIngredient): {
  entry: CatalogIngredient | null;
  gramWeight: number;
} {
  const entry = tryResolveFromCatalog(ing.name);
  const qty = parseFractionalQuantity(ing.quantity);
  const gramWeight = computeGramWeight(ing.name, qty, ing.unit);
  return { entry, gramWeight };
}

export * from "./recipeGateThermalParsing";
