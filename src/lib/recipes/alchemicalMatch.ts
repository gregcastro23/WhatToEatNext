/**
 * Matching a recipe's alchemical quantities to a chart's.
 *
 * A recipe's Spirit, Essence, Matter and Substance are the sum of its
 * ingredients' (see recipeAlchemicalQuantities), so they grow with the number
 * of ingredients: across the static catalog the total runs from 1 to 41. A
 * chart's quantities are a different unit altogether (a natal chart's total is
 * about 5, often with some axes at zero). Subtracting one from the other
 * measures mostly how big the recipe is, so the two are compared as
 * proportions: each profile is scaled to sum to 1, and the match is the share
 * of proportion they have in common.
 *
 * Quantities are never derived from a recipe's elements; they come from the
 * recipe's own ESMS fields, or its static twin's, or the recipe is not ranked.
 */
import type { Recipe } from "@/types/recipe";

export interface EsmsQuantities {
  spirit: number;
  essence: number;
  matter: number;
  substance: number;
}

function isQuantity(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value) && value >= 0;
}

function totalOf(q: EsmsQuantities): number {
  return q.spirit + q.essence + q.matter + q.substance;
}

/**
 * A recipe's ESMS totals, or null when it carries none to compare (a missing
 * field, or all four at zero). Absence is not a neutral profile.
 */
export function recipeQuantities(
  recipe: Pick<Recipe, "spirit" | "essence" | "matter" | "substance"> | null | undefined,
): EsmsQuantities | null {
  if (!recipe) return null;
  const { spirit, essence, matter, substance } = recipe;
  if (!isQuantity(spirit) || !isQuantity(essence) || !isQuantity(matter) || !isQuantity(substance)) return null;
  const quantities = { spirit, essence, matter, substance };
  return totalOf(quantities) > 0 ? quantities : null;
}

/** A chart's ESMS (capitalized keys), or null when it has no quantity to match. */
export function chartQuantities(chart: {
  Spirit: number;
  Essence: number;
  Matter: number;
  Substance: number;
}): EsmsQuantities | null {
  const { Spirit, Essence, Matter, Substance } = chart;
  if (!isQuantity(Spirit) || !isQuantity(Essence) || !isQuantity(Matter) || !isQuantity(Substance)) return null;
  const quantities = { spirit: Spirit, essence: Essence, matter: Matter, substance: Substance };
  return totalOf(quantities) > 0 ? quantities : null;
}

function sharesOf(q: EsmsQuantities): [number, number, number, number] {
  const total = totalOf(q);
  return [q.spirit / total, q.essence / total, q.matter / total, q.substance / total];
}

/**
 * 0 to 100: how much proportion two profiles share. 100 is identical
 * proportions (whatever the totals), 0 is no overlap. Symmetric, and
 * unchanged if either profile is scaled.
 */
export function esmsAffinity(a: EsmsQuantities, b: EsmsQuantities): number {
  const pa = sharesOf(a);
  const pb = sharesOf(b);
  let distance = 0;
  for (let i = 0; i < 4; i++) distance += Math.abs((pa[i] ?? 0) - (pb[i] ?? 0));
  return 100 * (1 - distance / 2);
}

export interface RankedRecipe {
  recipe: Recipe;
  score: number;
}

/**
 * The recipes that have quantities, best match first. A recipe with none is
 * left out rather than scored; ties keep catalog order.
 */
export function rankByAffinity(
  recipes: readonly Recipe[],
  target: EsmsQuantities,
  quantitiesOf: (recipe: Recipe) => EsmsQuantities | null,
): RankedRecipe[] {
  const ranked: RankedRecipe[] = [];
  for (const recipe of recipes) {
    const quantities = quantitiesOf(recipe);
    if (quantities) ranked.push({ recipe, score: esmsAffinity(target, quantities) });
  }
  return ranked.sort((a, b) => b.score - a.score);
}
