/**
 * What a COUNT of a named ingredient weighs — "2 large eggs", "3 sprigs
 * cilantro" — from USDA's measured count portions.
 *
 * ⚠️ RETURNS NULL RATHER THAN GUESSING, like `volumeToMass`. A null means
 * USDA published no weight for exactly that unit of exactly that food, and
 * the caller must treat the mass as unknown. In particular:
 *
 * - no size is chosen for the recipe. "1 stalk celery" finds only USDA's
 *   small, medium and large stalks (17–64 g), so it is null; and "1 whole
 *   lemon" finds two fruit sizes (58 g and 84 g), so it is null too;
 * - the conversion table's own count guesses (`piece`, `each`, a blank unit,
 *   `clove`, `slice`, `head`) are not read here. The owner kept those weights
 *   pending measured ones (ruling 2026-09-26), and replacing them is a
 *   separate decision.
 *
 * @file src/lib/cooking/countToMass.ts
 */
import { COUNT_PORTIONS_BY_INGREDIENT, type CountUnit } from "@/data/cooking/measuredCountPortions";

/** The recipe units read as USDA count portions, by every spelling. */
const RECIPE_COUNT_UNITS: ReadonlyMap<string, CountUnit> = new Map<string, CountUnit>([
  ["extra small", "extra small"],
  ["small", "small"],
  ["medium", "medium"],
  ["large", "large"],
  ["extra large", "extra large"],
  ["jumbo", "jumbo"],
  ["whole", "whole"],
  ["stalk", "stalk"],
  ["stalks", "stalk"],
  ["sprig", "sprig"],
  ["sprigs", "sprig"],
  ["leaf", "leaf"],
  ["leaves", "leaf"],
  ["bunch", "bunch"],
  ["bunches", "bunch"],
  ["can", "can"],
  ["cans", "can"],
  ["stick", "stick"],
  ["sticks", "stick"],
  ["ear", "ear"],
  ["ears", "ear"],
  ["dash", "dash"],
  ["dashes", "dash"],
]);

export interface CountConversion {
  grams: number;
  /** The FDC record the weight was measured on. */
  fdcId: number;
  /** FDC's label for the portion weighed, verbatim ("medium (2-1/2\" dia)"). */
  measuredAs: string;
}

/**
 * The mass of `amount` of `unit` of `ingredient` (a catalog or composition
 * name, case-insensitive), or `null` when USDA weighed no single unqualified
 * portion of exactly that unit.
 */
export function countToMass(ingredient: string, amount: number, unit: string): CountConversion | null {
  const count = RECIPE_COUNT_UNITS.get(unit.trim().toLowerCase());
  const row = COUNT_PORTIONS_BY_INGREDIENT.get(ingredient.trim().toLowerCase());
  if (count === undefined || row === undefined) return null;
  const matches = row.counts.filter((c) => c.count === count && c.qualifier === undefined);
  const [portion] = matches;
  if (portion === undefined || matches.length > 1) return null;
  return {
    grams: (amount * portion.gramWeight) / portion.amount,
    fdcId: row.fdcId,
    measuredAs: portion.label,
  };
}
