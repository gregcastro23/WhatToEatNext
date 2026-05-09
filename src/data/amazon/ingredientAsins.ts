/**
 * Verified Amazon grocery ASIN mappings.
 *
 * The previous table contained stale/recycled ASINs and caused Fresh checkout
 * to submit unrelated products. This file is now intentionally allow-list only:
 * add an ingredient here only after verifying the ASIN is the intended grocery
 * product and works with Amazon grocery/Fresh cart handoff.
 */

export const AMAZON_ASSOCIATE_TAG =
  process.env.NEXT_PUBLIC_AMAZON_ASSOCIATE_TAG || "cookingwi03f1-20";

export const ingredientAsins: Record<string, string> = {};

const PREFIX_SUFFIX_WORDS =
  /^(fresh|dried|ground|powdered|organic|large|small|medium|cup|cups|clove|cloves|teaspoon|teaspoons|tablespoon|tablespoons|tbsp|tsp|lb|lbs|oz|g|kg|half)\s+|\s+(fresh|dried|ground|powdered|organic|large|small|medium|zest|peeled|chopped|sliced|diced|minced)$/g;

function normalizeIngredientKey(ingredientName: string): string {
  return ingredientName
    .toLowerCase()
    .trim()
    .replace(/\s*\([^)]*\)/g, "")
    .replace(PREFIX_SUFFIX_WORDS, "")
    .replace(/\s+/g, " ")
    .trim();
}

function singularize(value: string): string {
  if (value.endsWith("ies")) return `${value.slice(0, -3)}y`;
  if (value.endsWith("oes") || value.endsWith("ses") || value.endsWith("xes")) {
    return value.slice(0, -2);
  }
  if (value.endsWith("s") && !value.endsWith("ss")) return value.slice(0, -1);
  return value;
}

/**
 * Resolve a grocery ASIN only from the verified allow-list.
 *
 * Dynamic grocery lookup must go through /api/amazon/search so PA-API/Creators
 * results can be validated server-side. Returning null is safer than submitting
 * a stale ASIN to Amazon.
 */
export function resolveAsin(ingredientName: string): string | null {
  if (!ingredientName) return null;

  const normalized = normalizeIngredientKey(ingredientName);
  if (ingredientAsins[normalized]) return ingredientAsins[normalized];

  const singular = singularize(normalized);
  if (ingredientAsins[singular]) return ingredientAsins[singular];

  return null;
}
