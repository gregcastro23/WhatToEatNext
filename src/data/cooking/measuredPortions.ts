/**
 * MEASURED household-measure weights, from USDA FoodData Central.
 *
 * ⚠️ GENERATED — do not hand-edit. Regenerate with:
 *     FDC_API_KEY=… bun run fetch:portions
 * then re-run the generator in that script's docs. Every row carries the
 * `fdcId` it came from, so any figure here can be checked against its source.
 *
 * ── Why this file has to exist ──────────────────────────────────────────────
 *
 * `src/utils/unitConversion.ts` converts every volume unit as if the ingredient
 * were water — 1 cup = 240 g for flour, oil and cilantro alike. `[MEASURED
 * 2026-08-18]` across the 1,078-recipe corpus that overstates the total mass of
 * volume-measured ingredients by 11.6 %, and individual errors reach 15x: a cup
 * of chopped cilantro is scored 240 g against a measured 16 g.
 *
 * ── Why composition could not fix it ────────────────────────────────────────
 *
 * Choi & Okos predicts TRUE density — the density of the material itself. A cup
 * of flour is mostly the air between particles: flour's true density is near
 * 1450 kg·m⁻³ while a scooped cup is about 528 kg·m⁻³, so roughly 64 % of that
 * cup is air. For a liquid the two coincide; for anything granular or leafy the
 * packing has to be MEASURED, and that is what these numbers are.
 *
 * @file src/data/cooking/measuredPortions.ts
 */

/** The volume measures a recipe actually uses. */
export type VolumeMeasure = "cup" | "tbsp" | "tsp";

export interface MeasuredPortion {
  /** Matches the `ingredient` key used by the USDA composition fetch. */
  ingredient: string;
  /** The FoodData Central record these weights were measured on. */
  fdcId: number;
  fdcDescription: string;
  /** ISO date the source was read. FDC revises records. */
  retrieved: string;
  /** Grams per ONE of each measure. Absent means USDA published none. */
  gramsPer: Partial<Record<VolumeMeasure, number>>;
}

export const MEASURED_PORTIONS: readonly MeasuredPortion[] = [
  {
    ingredient: "All-Purpose Flour",
    fdcId: 168894,
    fdcDescription: "Wheat flour, white, all-purpose, enriched, bleached",
    retrieved: "2026-08-18",
    gramsPer: { cup: 125 },
  },
  {
    ingredient: "Butter",
    fdcId: 173430,
    fdcDescription: "Butter, without salt",
    retrieved: "2026-08-18",
    gramsPer: { tbsp: 14.2, cup: 227 },
  },
  {
    ingredient: "Cilantro",
    fdcId: 169997,
    fdcDescription: "Coriander (cilantro) leaves, raw",
    retrieved: "2026-08-18",
    gramsPer: { cup: 16 },
  },
  {
    ingredient: "Cinnamon",
    fdcId: 171320,
    fdcDescription: "Spices, cinnamon, ground",
    retrieved: "2026-08-18",
    gramsPer: { tsp: 2.6, tbsp: 7.8 },
  },
  {
    ingredient: "Coconut Milk",
    fdcId: 170172,
    fdcDescription: "Nuts, coconut milk, raw (liquid expressed from grated meat and water)",
    retrieved: "2026-08-18",
    gramsPer: { tbsp: 15, cup: 240 },
  },
  {
    ingredient: "Coconut Oil",
    fdcId: 171412,
    fdcDescription: "Oil, coconut",
    retrieved: "2026-08-18",
    gramsPer: { cup: 218, tsp: 4.5, tbsp: 13.6 },
  },
  {
    ingredient: "Garlic",
    fdcId: 169230,
    fdcDescription: "Garlic, raw",
    retrieved: "2026-08-18",
    gramsPer: { tsp: 2.8, cup: 136 },
  },
  {
    ingredient: "Ginger",
    fdcId: 169231,
    fdcDescription: "Ginger root, raw",
    retrieved: "2026-08-18",
    gramsPer: { tsp: 2 },
  },
  {
    ingredient: "Heavy Cream",
    fdcId: 170859,
    fdcDescription: "Cream, fluid, heavy whipping",
    retrieved: "2026-08-18",
    gramsPer: { tbsp: 15 },
  },
  {
    ingredient: "Lemon Juice",
    fdcId: 167747,
    fdcDescription: "Lemon juice, raw",
    retrieved: "2026-08-18",
    gramsPer: { cup: 244 },
  },
  {
    ingredient: "Lime Juice",
    fdcId: 168156,
    fdcDescription: "Lime juice, raw",
    retrieved: "2026-08-18",
    gramsPer: { cup: 242 },
  },
  {
    ingredient: "Maple Syrup",
    fdcId: 169661,
    fdcDescription: "Syrups, maple",
    retrieved: "2026-08-18",
    gramsPer: { tbsp: 20, cup: 315 },
  },
  {
    ingredient: "Milk",
    fdcId: 171265,
    fdcDescription: "Milk, whole, 3.25% milkfat, with added vitamin D",
    retrieved: "2026-08-18",
    gramsPer: { cup: 244, tbsp: 15 },
  },
  {
    ingredient: "Nutmeg",
    fdcId: 171326,
    fdcDescription: "Spices, nutmeg, ground",
    retrieved: "2026-08-18",
    gramsPer: { tbsp: 7, tsp: 2.2 },
  },
  {
    ingredient: "Olive Oil",
    fdcId: 171413,
    fdcDescription: "Oil, olive, salad or cooking",
    retrieved: "2026-08-18",
    gramsPer: { tbsp: 13.5, tsp: 4.5, cup: 216 },
  },
  {
    ingredient: "Parsley",
    fdcId: 170416,
    fdcDescription: "Parsley, fresh",
    retrieved: "2026-08-18",
    gramsPer: { tbsp: 3.8 },
  },
  {
    ingredient: "Salt",
    fdcId: 173468,
    fdcDescription: "Salt, table",
    retrieved: "2026-08-18",
    gramsPer: { cup: 292, tsp: 6, tbsp: 18 },
  },
  {
    ingredient: "Sesame Oil",
    fdcId: 171016,
    fdcDescription: "Oil, sesame, salad or cooking",
    retrieved: "2026-08-18",
    gramsPer: { tbsp: 13.6, tsp: 4.5, cup: 218 },
  },
  {
    ingredient: "Sesame Seeds",
    fdcId: 170150,
    fdcDescription: "Seeds, sesame seeds, whole, dried",
    retrieved: "2026-08-18",
    gramsPer: { cup: 144, tbsp: 9 },
  },
  {
    ingredient: "Soy Sauce",
    fdcId: 174277,
    fdcDescription: "Soy sauce made from soy and wheat (shoyu)",
    retrieved: "2026-08-18",
    gramsPer: { tbsp: 16, tsp: 5.3, cup: 255 },
  },
  {
    ingredient: "Sugar",
    fdcId: 746784,
    fdcDescription: "Sugars, granulated",
    retrieved: "2026-08-18",
    gramsPer: { tsp: 4, cup: 188 },
  },
  {
    ingredient: "Thyme",
    fdcId: 173470,
    fdcDescription: "Thyme, fresh",
    retrieved: "2026-08-18",
    gramsPer: { tsp: 0.8 },
  },
  {
    ingredient: "Tomato Paste",
    fdcId: 170459,
    fdcDescription: "Tomato products, canned, paste, without salt added (Includes foods for USDA's Food Distribution Program)",
    retrieved: "2026-08-18",
    gramsPer: { tbsp: 16, cup: 264 },
  },
  {
    ingredient: "Turmeric",
    fdcId: 172231,
    fdcDescription: "Spices, turmeric, ground",
    retrieved: "2026-08-18",
    gramsPer: { tsp: 3, tbsp: 9.4 },
  },
  {
    ingredient: "Vanilla Extract",
    fdcId: 173471,
    fdcDescription: "Vanilla extract",
    retrieved: "2026-08-18",
    gramsPer: { tsp: 4.2, cup: 208, tbsp: 13 },
  },
  {
    ingredient: "Vegetable Oil",
    fdcId: 171411,
    fdcDescription: "Oil, soybean, salad or cooking",
    retrieved: "2026-08-18",
    gramsPer: { tbsp: 13.6, tsp: 4.5, cup: 218 },
  },
  {
    ingredient: "Water",
    fdcId: 174158,
    fdcDescription: "Water, bottled, generic",
    retrieved: "2026-08-18",
    gramsPer: { cup: 237 },
  },
];

/** Lookup by ingredient name, case-insensitive. */
export const PORTIONS_BY_INGREDIENT: ReadonlyMap<string, MeasuredPortion> = new Map(
  MEASURED_PORTIONS.map((p) => [p.ingredient.toLowerCase(), p]),
);
