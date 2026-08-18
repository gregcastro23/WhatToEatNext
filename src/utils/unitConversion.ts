// src/utils/unitConversion.ts
// Shared unit-to-grams conversion used by the quantity scaling engine
// (elemental calculations) and the ingredient nutrition aggregator.

import { PORTIONS_BY_INGREDIENT } from "@/data/cooking/measuredPortions";
import { volumeToMass } from "@/lib/cooking/volumetrics";

/**
 * How a gram figure was arrived at.
 *
 * `usda-measured`       a real measured weight for THIS ingredient, from a
 *                       named FoodData Central record.
 * `water-approximation` nobody has measured it, so the volume was converted as
 *                       if the ingredient were water. Frequently wrong, and
 *                       wrong in both directions.
 */
export type GramBasis = "usda-measured" | "water-approximation";

export interface GramConversion {
  grams: number;
  basis: GramBasis;
  /** The FDC record backing a measured figure. Absent on an approximation. */
  fdcId?: number;
  /** Present ONLY on an approximation, so absence of data cannot look like data. */
  approximationNote?: string;
}

/**
 * Volume units, and the millilitres each represents.
 *
 * Kept separate from {@link UNIT_CONVERSIONS} because these are the units whose
 * gram weight DEPENDS ON THE INGREDIENT. A weight unit does not.
 */
const VOLUME_UNIT_TO_MEASURE: Record<string, "cup" | "tbsp" | "tsp"> = {
  cup: "cup",
  cups: "cup",
  tbsp: "tbsp",
  tablespoon: "tbsp",
  tablespoons: "tbsp",
  tsp: "tsp",
  teaspoon: "tsp",
  teaspoons: "tsp",
};

/**
 * Ingredient-name aliases, so a recipe's spelling reaches the measured row.
 *
 * Normalise on READ — the recipe corpus and the ingredient files are not
 * edited, only interpreted. Adding a spelling here is safe; renaming source
 * data is not.
 */
const NAME_ALIASES: Record<string, string> = {
  "sea salt": "salt",
  "kosher salt": "salt",
  "table salt": "salt",
  "extra virgin olive oil": "olive oil",
  "granulated sugar": "sugar",
  "white sugar": "sugar",
  "unsalted butter": "butter",
  "salted butter": "butter",
  "all purpose flour": "all-purpose flour",
  "plain flour": "all-purpose flour",
  "whole milk": "milk",
  "fresh cilantro": "cilantro",
  "fresh parsley": "parsley",
  // Derived from the ACTUAL top-miss list on the recipe corpus, not guessed:
  // each of these appeared dozens of times and had a measured row under a
  // different spelling.
  "black pepper": "pepper",
  "freshly ground black pepper": "pepper",
  "ground black pepper": "pepper",
  "white pepper": "pepper",
  "ground cinnamon": "cinnamon",
  "ground cumin": "cumin",
  "ground turmeric": "turmeric",
  "ground nutmeg": "nutmeg",
  "ground ginger": "ginger",
  "fresh ginger": "ginger",
  "fresh lemon juice": "lemon juice",
  "fresh lime juice": "lime juice",
  "fresh dill": "dill",
  "fresh thyme": "thyme",
  "scallions": "scallion",
  "green onions": "scallion",
  "heavy whipping cream": "heavy cream",
  "toasted sesame oil": "sesame oil",
  "canola oil": "vegetable oil",
  "sesame seed": "sesame seeds",
};

function canonicalIngredient(name: string): string {
  const key = name.toLowerCase().trim();
  return NAME_ALIASES[key] ?? key;
}

/** How many of the measured ingredients this table can actually resolve. */
export const MEASURED_INGREDIENT_COUNT = PORTIONS_BY_INGREDIENT.size;

export const UNIT_CONVERSIONS: Record<string, number> = {
  // Weight units
  g: 1,
  gram: 1,
  grams: 1,
  kg: 1000,
  kilogram: 1000,
  kilograms: 1000,
  oz: 28.35,
  ounce: 28.35,
  ounces: 28.35,
  lb: 453.59,
  pound: 453.59,
  pounds: 453.59,

  // Volume units (approximate conversions using water density)
  ml: 1,
  milliliter: 1,
  milliliters: 1,
  l: 1000,
  liter: 1000,
  liters: 1000,
  cup: 240,
  cups: 240,
  tbsp: 15,
  tablespoon: 15,
  tablespoons: 15,
  tsp: 5,
  teaspoon: 5,
  teaspoons: 5,
  "fl oz": 29.57,
  "fluid ounce": 29.57,
  "fluid ounces": 29.57,

  // Piece/count units (context-dependent, using approximate averages)
  piece: 50,
  pieces: 50,
  clove: 6,
  cloves: 6,
  slice: 30,
  slices: 30,
  head: 200,
  heads: 200,
  each: 50,
  "": 50,
};

/**
 * Convert an amount in a given unit to grams, saying HOW it knows.
 *
 * ⚠️ THE BASIS IS PART OF THE ANSWER. `[MEASURED 2026-08-18]` across the
 * 1,078-recipe corpus, converting volume units as if every ingredient were
 * water overstates the total mass of volume-measured ingredients by 11.6 %
 * (154.4 kg against a measured 138.4 kg over 1,417 mentions). Individual errors
 * reach 15× — a cup of chopped cilantro is 240 g by that assumption and 16 g in
 * fact — and it errs in BOTH directions: a cup of salt is 292 g, not 240 g.
 *
 * Supplying `ingredientName` lets a volume unit resolve against USDA's measured
 * household-measure weights. Without it, or for an ingredient nobody has
 * measured, the water approximation is still used — but it comes back labelled
 * `water-approximation` with a note, so a caller can never mistake it for a
 * measurement. Only {@link MEASURED_INGREDIENT_COUNT} ingredients are covered,
 * so most of the corpus still takes that path, and that is worth surfacing
 * rather than hiding.
 */
export function convertToGramsDetailed(
  amount: number,
  unit: string,
  ingredientName?: string,
): GramConversion | null {
  if (!Number.isFinite(amount) || amount <= 0) return null;
  const key = (unit ?? "").toLowerCase().trim();

  // A volume unit is the only kind whose gram weight depends on WHAT it is.
  const measure = VOLUME_UNIT_TO_MEASURE[key];
  if (measure !== undefined && ingredientName) {
    const measured = volumeToMass(canonicalIngredient(ingredientName), amount, measure);
    if (measured !== null) {
      return { grams: measured.grams, basis: "usda-measured", fdcId: measured.fdcId };
    }
  }

  const factor = UNIT_CONVERSIONS[key];
  if (factor == null) return null;
  return {
    grams: amount * factor,
    basis: "water-approximation",
    approximationNote:
      measure !== undefined
        ? `No measured weight for ${ingredientName ? `"${ingredientName}"` : "this ingredient"}; ` +
          `"${key}" was converted at water density and may be wrong by several fold.`
        : undefined,
  };
}

/**
 * Convert an amount in a given unit to grams. Returns `null` when the unit is
 * unrecognised, allowing callers to decide how to handle ambiguous inputs.
 *
 * Pass `ingredientName` wherever it is available — without it, every volume
 * unit falls back to the water approximation described in
 * {@link convertToGramsDetailed}. Callers that need to know which they got
 * should use that function directly.
 */
export function convertToGrams(
  amount: number,
  unit: string,
  ingredientName?: string,
): number | null {
  return convertToGramsDetailed(amount, unit, ingredientName)?.grams ?? null;
}
