/**
 * Where a food diary entry's food came from: one list for the type, the API
 * schema, and the `food_source` database enum.
 *
 * [MEASURED 2026-09-28, prod, read-only] The enum held quick, recipe, manual,
 * barcode, favorite and custom, so an entry logged from a restaurant or a food
 * search could never be stored. Migration 89 adds `restaurant` and `search`.
 * `scripts/checkFoodDiaryPersistenceSql.mjs` checks every value here against
 * the live enum.
 *
 * No imports: that gate loads this file directly.
 */

function literals<const T extends readonly string[]>(...values: T): T {
  return values;
}

export const FOOD_SOURCES = literals(
  "recipe", // From app recipes
  "custom", // User-entered custom food
  "restaurant", // Logged from restaurant discovery
  "barcode", // Scanned barcode (future)
  "search", // FDC database search
  "quick", // Quick-add common foods
  "favorite", // From user favorites
);

export type FoodSource = (typeof FOOD_SOURCES)[number];
