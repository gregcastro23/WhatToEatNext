/**
 * MEASURED count-portion weights ("1 large", "1 stalk", "1 fruit"), from USDA
 * FoodData Central.
 *
 * ⚠️ GENERATED — do not hand-edit. Regenerate with:
 *     bun run generate:count-portions          (offline, from scripts/data/usda-portions.json)
 *     FDC_API_KEY=… bun run fetch:portions     (refetch, then regenerate)
 *
 * Each entry is FDC's own label, amount and gram weight, verbatim, under the
 * record (`fdcId`) it was weighed on. `count` is the unit a recipe would write;
 * `qualifier` is present when USDA weighed only a qualified form of it
 * ("stalk, medium"), and such an entry is never a plain stalk.
 *
 * @file src/data/cooking/measuredCountPortions.ts
 */

/** Every count unit USDA's labels are read as. */
export type CountUnit = "extra small" | "small" | "medium" | "large" | "extra large" | "jumbo" | "whole" | "stalk" | "sprig" | "leaf" | "clove" | "slice" | "bunch" | "can" | "stick" | "ear" | "dash" | "head";

export interface MeasuredCount {
  count: CountUnit;
  /** USDA's qualifier on the unit ("medium" in "stalk, medium"). Absent when unqualified. */
  qualifier?: string;
  /** FDC's label for the portion, verbatim. */
  label: string;
  /** How many of `count` USDA weighed together ("9 sprigs"). */
  amount: number;
  gramWeight: number;
}

export interface MeasuredCountRow {
  /** The catalog ingredient's `name:`, or a composition key an alias maps it to. */
  ingredient: string;
  /** The FoodData Central record these weights were measured on. */
  fdcId: number;
  fdcDescription: string;
  /** ISO date the source was read. FDC revises records. */
  retrieved: string;
  counts: readonly MeasuredCount[];
}

export const MEASURED_COUNT_PORTIONS: readonly MeasuredCountRow[] = [
  { ingredient: "Apple", fdcId: 171688, fdcDescription: "Apples, raw, with skin (Includes foods for USDA's Food Distribution Program)", retrieved: "2026-09-26", counts: [
    { count: "medium", label: "medium (3\" dia)", amount: 1, gramWeight: 182 },
    { count: "small", label: "small (2-3/4\" dia)", amount: 1, gramWeight: 149 },
    { count: "extra small", label: "extra small (2-1/2\" dia)", amount: 1, gramWeight: 101 },
    { count: "large", label: "large (3-1/4\" dia)", amount: 1, gramWeight: 223 },
  ] },
  { ingredient: "Avocado", fdcId: 171705, fdcDescription: "Avocados, raw, all commercial varieties", retrieved: "2026-09-26", counts: [
    { count: "whole", label: "avocado, NS as to Florida or California", amount: 1, gramWeight: 201 },
  ] },
  { ingredient: "Banana", fdcId: 173944, fdcDescription: "Bananas, raw", retrieved: "2026-09-26", counts: [
    { count: "extra large", label: "extra large (9\" or longer)", amount: 1, gramWeight: 152 },
    { count: "large", label: "large (8\" to 8-7/8\" long)", amount: 1, gramWeight: 136 },
    { count: "small", label: "small (6\" to 6-7/8\" long)", amount: 1, gramWeight: 101 },
    { count: "extra small", label: "extra small (less than 6\" long)", amount: 1, gramWeight: 81 },
    { count: "medium", label: "medium (7\" to 7-7/8\" long)", amount: 1, gramWeight: 118 },
  ] },
  { ingredient: "Beet", fdcId: 169145, fdcDescription: "Beets, raw", retrieved: "2026-09-26", counts: [
    { count: "whole", label: "beet (2\" dia)", amount: 1, gramWeight: 82 },
  ] },
  { ingredient: "Butter", fdcId: 173430, fdcDescription: "Butter, without salt", retrieved: "2026-08-18", counts: [
    { count: "stick", label: "stick", amount: 1, gramWeight: 113 },
  ] },
  { ingredient: "cabbage", fdcId: 169975, fdcDescription: "Cabbage, raw", retrieved: "2026-09-26", counts: [
    { count: "leaf", qualifier: "large", label: "leaf, large", amount: 1, gramWeight: 33 },
    { count: "head", qualifier: "medium", label: "head, medium (about 5-3/4\" dia)", amount: 1, gramWeight: 908 },
    { count: "leaf", qualifier: "medium", label: "leaf, medium", amount: 1, gramWeight: 23 },
    { count: "leaf", label: "leaf", amount: 1, gramWeight: 15 },
    { count: "head", qualifier: "large", label: "head, large (about 7\" dia)", amount: 1, gramWeight: 1248 },
    { count: "head", qualifier: "small", label: "head, small (about 4-1/2\" dia)", amount: 1, gramWeight: 714 },
  ] },
  { ingredient: "Carrot", fdcId: 170393, fdcDescription: "Carrots, raw", retrieved: "2026-08-18", counts: [
    { count: "slice", label: "slice", amount: 1, gramWeight: 3 },
    { count: "small", label: "small (5-1/2\" long)", amount: 1, gramWeight: 50 },
    { count: "medium", label: "medium", amount: 1, gramWeight: 61 },
    { count: "large", label: "large (7-1/4\" to 8-/1/2\" long)", amount: 1, gramWeight: 72 },
  ] },
  { ingredient: "celery", fdcId: 169988, fdcDescription: "Celery, raw", retrieved: "2026-09-26", counts: [
    { count: "stalk", qualifier: "medium", label: "stalk, medium (7-1/2\" - 8\" long)", amount: 1, gramWeight: 40 },
    { count: "stalk", qualifier: "small", label: "stalk, small (5\" long)", amount: 1, gramWeight: 17 },
    { count: "stalk", qualifier: "large", label: "stalk, large (11\"-12\" long)", amount: 1, gramWeight: 64 },
  ] },
  { ingredient: "Cilantro", fdcId: 169997, fdcDescription: "Coriander (cilantro) leaves, raw", retrieved: "2026-08-18", counts: [
    { count: "sprig", label: "sprigs", amount: 9, gramWeight: 20 },
  ] },
  { ingredient: "corn", fdcId: 169998, fdcDescription: "Corn, sweet, yellow, raw", retrieved: "2026-09-26", counts: [
    { count: "ear", qualifier: "medium", label: "ear, medium (6-3/4\" to 7-1/2\" long) yields", amount: 1, gramWeight: 102 },
    { count: "ear", qualifier: "small", label: "ear, small (5-1/2\" to 6-1/2\" long)", amount: 1, gramWeight: 73 },
    { count: "ear", qualifier: "large", label: "ear, large (7-3/4\" to 9\" long) yields", amount: 1, gramWeight: 143 },
  ] },
  { ingredient: "cucumber", fdcId: 168409, fdcDescription: "Cucumber, with peel, raw", retrieved: "2026-09-26", counts: [
    { count: "whole", label: "cucumber (8-1/4\")", amount: 1, gramWeight: 301 },
  ] },
  { ingredient: "Dill", fdcId: 172233, fdcDescription: "Dill weed, fresh", retrieved: "2026-08-18", counts: [
    { count: "sprig", label: "sprigs", amount: 5, gramWeight: 1 },
  ] },
  { ingredient: "Egg", fdcId: 171287, fdcDescription: "Egg, whole, raw, fresh", retrieved: "2026-08-18", counts: [
    { count: "medium", label: "medium", amount: 1, gramWeight: 44 },
    { count: "extra large", label: "extra large", amount: 1, gramWeight: 56 },
    { count: "small", label: "small", amount: 1, gramWeight: 38 },
    { count: "jumbo", label: "jumbo", amount: 1, gramWeight: 63 },
    { count: "large", label: "large", amount: 1, gramWeight: 50 },
  ] },
  { ingredient: "Egg White (Albumen)", fdcId: 172183, fdcDescription: "Egg, white, raw, fresh", retrieved: "2026-09-26", counts: [
    { count: "large", label: "large", amount: 1, gramWeight: 33 },
  ] },
  { ingredient: "Egg Yolk", fdcId: 172184, fdcDescription: "Egg, yolk, raw, fresh", retrieved: "2026-09-26", counts: [
    { count: "large", label: "large", amount: 1, gramWeight: 17 },
  ] },
  { ingredient: "eggplant", fdcId: 169228, fdcDescription: "Eggplant, raw", retrieved: "2026-09-26", counts: [
    { count: "whole", label: "eggplant, unpeeled (approx 1-1/4 lb)", amount: 1, gramWeight: 548 },
  ] },
  { ingredient: "Garlic", fdcId: 169230, fdcDescription: "Garlic, raw", retrieved: "2026-08-18", counts: [
    { count: "clove", label: "clove", amount: 1, gramWeight: 3 },
  ] },
  { ingredient: "Ginger", fdcId: 169231, fdcDescription: "Ginger root, raw", retrieved: "2026-08-18", counts: [
    { count: "slice", label: "slices (1\" dia)", amount: 5, gramWeight: 11 },
  ] },
  { ingredient: "jalapenos", fdcId: 168576, fdcDescription: "Peppers, jalapeno, raw", retrieved: "2026-09-26", counts: [
    { count: "whole", label: "pepper", amount: 1, gramWeight: 14 },
  ] },
  { ingredient: "Kiwi", fdcId: 168153, fdcDescription: "Kiwifruit, green, raw", retrieved: "2026-09-26", counts: [
    { count: "whole", label: "fruit (2\" dia)", amount: 1, gramWeight: 69 },
  ] },
  { ingredient: "Lemon", fdcId: 167746, fdcDescription: "Lemons, raw, without peel", retrieved: "2026-09-26", counts: [
    { count: "whole", label: "fruit (2-3/8\" dia)", amount: 1, gramWeight: 84 },
    { count: "whole", label: "fruit (2-1/8\" dia)", amount: 1, gramWeight: 58 },
  ] },
  { ingredient: "Lime", fdcId: 168155, fdcDescription: "Limes, raw", retrieved: "2026-09-26", counts: [
    { count: "whole", label: "fruit (2\" dia)", amount: 1, gramWeight: 67 },
  ] },
  { ingredient: "Mango", fdcId: 169910, fdcDescription: "Mangos, raw", retrieved: "2026-09-26", counts: [
    { count: "whole", label: "fruit without refuse", amount: 1, gramWeight: 336 },
  ] },
  { ingredient: "Onion", fdcId: 170000, fdcDescription: "Onions, raw", retrieved: "2026-08-18", counts: [
    { count: "slice", qualifier: "medium", label: "slice, medium (1/8\" thick)", amount: 1, gramWeight: 14 },
    { count: "medium", label: "medium (2-1/2\" dia)", amount: 1, gramWeight: 110 },
    { count: "large", label: "large", amount: 1, gramWeight: 150 },
    { count: "slice", qualifier: "thin", label: "slice, thin", amount: 1, gramWeight: 9 },
    { count: "small", label: "small", amount: 1, gramWeight: 70 },
    { count: "slice", qualifier: "large", label: "slice, large (1/4\" thick)", amount: 1, gramWeight: 38 },
  ] },
  { ingredient: "Orange", fdcId: 169097, fdcDescription: "Oranges, raw, all commercial varieties", retrieved: "2026-09-26", counts: [
    { count: "small", label: "small (2-3/8\" dia)", amount: 1, gramWeight: 96 },
    { count: "large", label: "large (3-1/16\" dia)", amount: 1, gramWeight: 184 },
    { count: "whole", label: "fruit (2-5/8\" dia)", amount: 1, gramWeight: 131 },
  ] },
  { ingredient: "Parsley", fdcId: 170416, fdcDescription: "Parsley, fresh", retrieved: "2026-08-18", counts: [
    { count: "sprig", label: "sprigs", amount: 10, gramWeight: 10 },
  ] },
  { ingredient: "Pepper", fdcId: 170931, fdcDescription: "Spices, pepper, black", retrieved: "2026-08-18", counts: [
    { count: "dash", label: "dash", amount: 1, gramWeight: 0.1 },
  ] },
  { ingredient: "Potato", fdcId: 170026, fdcDescription: "Potatoes, flesh and skin, raw", retrieved: "2026-08-18", counts: [
    { count: "small", label: "Potato small (1-3/4\" to 2-1/2\" dia)", amount: 1, gramWeight: 170 },
    { count: "large", label: "Potato large (3\" to 4-1/4\" dia)", amount: 1, gramWeight: 369 },
    { count: "medium", label: "Potato medium (2-1/4\" to 3-1/4\" dia)", amount: 1, gramWeight: 213 },
  ] },
  { ingredient: "radishes", fdcId: 169276, fdcDescription: "Radishes, raw", retrieved: "2026-09-26", counts: [
    { count: "medium", label: "medium (3/4\" to 1\" dia)", amount: 1, gramWeight: 4.5 },
    { count: "small", label: "small", amount: 1, gramWeight: 2 },
    { count: "slice", label: "slice", amount: 1, gramWeight: 1 },
    { count: "large", label: "large (1\" to 1-1/4\" dia)", amount: 1, gramWeight: 9 },
  ] },
  { ingredient: "Salt", fdcId: 173468, fdcDescription: "Salt, table", retrieved: "2026-08-18", counts: [
    { count: "dash", label: "dash", amount: 1, gramWeight: 0.4 },
  ] },
  { ingredient: "Scallion", fdcId: 170005, fdcDescription: "Onions, spring or scallions (includes tops and bulb), raw", retrieved: "2026-08-18", counts: [
    { count: "small", label: "small (3\" long)", amount: 1, gramWeight: 5 },
    { count: "medium", label: "medium (4-1/8\" long)", amount: 1, gramWeight: 15 },
    { count: "large", label: "large", amount: 1, gramWeight: 25 },
  ] },
  { ingredient: "Tomato", fdcId: 170457, fdcDescription: "Tomatoes, red, ripe, raw, year round average", retrieved: "2026-08-18", counts: [
    { count: "medium", label: "medium whole (2-3/5\" dia)", amount: 1, gramWeight: 123 },
    { count: "slice", qualifier: "medium", label: "slice, medium (1/4\" thick)", amount: 1, gramWeight: 20 },
    { count: "large", label: "large whole (3\" dia)", amount: 1, gramWeight: 182 },
    { count: "slice", qualifier: "thin/small", label: "slice, thin/small", amount: 1, gramWeight: 15 },
    { count: "small", label: "small whole (2-2/5\" dia)", amount: 1, gramWeight: 91 },
    { count: "slice", qualifier: "thick/large", label: "slice, thick/large (1/2\" thick)", amount: 1, gramWeight: 27 },
  ] },
  { ingredient: "Tomato Paste", fdcId: 170459, fdcDescription: "Tomato products, canned, paste, without salt added (Includes foods for USDA's Food Distribution Program)", retrieved: "2026-08-18", counts: [
    { count: "can", label: "can (6 oz)", amount: 1, gramWeight: 170 },
  ] },
  { ingredient: "zucchini", fdcId: 169291, fdcDescription: "Squash, summer, zucchini, includes skin, raw", retrieved: "2026-09-26", counts: [
    { count: "large", label: "large", amount: 1, gramWeight: 323 },
    { count: "medium", label: "medium", amount: 1, gramWeight: 196 },
    { count: "slice", label: "slice", amount: 1, gramWeight: 9.9 },
    { count: "small", label: "small", amount: 1, gramWeight: 118 },
  ] },
];

/** Lookup by ingredient name, case-insensitive. */
export const COUNT_PORTIONS_BY_INGREDIENT: ReadonlyMap<string, MeasuredCountRow> = new Map(
  MEASURED_COUNT_PORTIONS.map((row) => [row.ingredient.toLowerCase(), row]),
);
