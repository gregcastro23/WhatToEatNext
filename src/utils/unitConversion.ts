// src/utils/unitConversion.ts
// Shared unit-to-grams conversion table used by both the quantity scaling
// engine (elemental calculations) and the ingredient-based nutrition
// aggregator. Keeping a single table avoids drift between the two.

/**
 * Unit conversion mappings for ingredient quantities.
 * Maps various units to grams (base unit for calculations).
 *
 * Volume units assume water density as an approximation; acceptable for
 * elemental scoring and nutrition estimation when a per-ingredient density
 * is not available.
 */
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
 * Convert an amount in a given unit to grams. Returns `null` when the unit is
 * unrecognised, allowing callers to decide how to handle ambiguous inputs.
 */
export function convertToGrams(amount: number, unit: string): number | null {
  if (!Number.isFinite(amount) || amount <= 0) return null;
  const key = (unit ?? "").toLowerCase().trim();
  const factor = UNIT_CONVERSIONS[key];
  if (factor == null) return null;
  return amount * factor;
}
