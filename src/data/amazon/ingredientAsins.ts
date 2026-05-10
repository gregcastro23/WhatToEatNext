/**
 * Verified Amazon grocery ASIN mappings.
 *
 * The previous table contained stale/recycled ASINs and caused Fresh checkout
 * to submit unrelated products. This file is now intentionally allow-list only:
 * add an ingredient here only after verifying the ASIN is the intended grocery
 * product and works with Amazon grocery/Fresh cart handoff.
 *
 * To add an entry safely:
 *   1. Open the product on amazon.com and copy the 10-char ASIN from the URL.
 *   2. Confirm the product is in stock and has Fresh/Grocery handoff support.
 *   3. Add the entry under its normalized key (lowercase singular, no units).
 *   4. The TOP_STAPLES_TO_VERIFY list below is the priority order — fill these
 *      first so the live PA-API isn't called for everyday ingredients.
 */

export { AMAZON_ASSOCIATE_TAG } from "@/lib/amazon/config";

export const ingredientAsins: Record<string, string> = {
  // Fill these in over time. Keys MUST be the normalized form (see
  // normalizeIngredientKey below) — singular, lowercase, no units, no parens.
  // Example shape (do NOT uncomment until verified):
  //   "olive oil": "B0XXXXXXXX",
};

/**
 * Top-priority staples to verify and add to `ingredientAsins` first.
 * These show up in nearly every recipe and account for the bulk of PA-API
 * traffic during beta. Verifying these 25 entries cuts live API calls 60-80%.
 */
export const TOP_STAPLES_TO_VERIFY: readonly string[] = [
  "salt",
  "black pepper",
  "olive oil",
  "butter",
  "egg",
  "milk",
  "flour",
  "sugar",
  "garlic",
  "onion",
  "tomato",
  "potato",
  "carrot",
  "rice",
  "pasta",
  "chicken breast",
  "ground beef",
  "lemon",
  "soy sauce",
  "vinegar",
  "honey",
  "vanilla extract",
  "baking powder",
  "baking soda",
  "yeast",
];

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
