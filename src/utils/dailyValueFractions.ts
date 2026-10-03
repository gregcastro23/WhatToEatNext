/**
 * Vitamins and minerals as the ingredient data records them: fractions of a
 * Daily Value, never amounts. Published as labelled %DV, and marked as a lower
 * bound where not every ingredient lists the nutrient (owner ruling
 * 2026-09-27, option c).
 *
 * [MEASURED 2026-09-27, 1,002 unified ingredient profiles] 791 carry numeric
 * vitamins or minerals and none is an amount: spinach `K: 1.81` is 145 µg per
 * 30 g over the pre-2016 80 µg Daily Value. The tables are mixed. Against USDA
 * (the 42 FDC-pinned ingredients, 163 values) the pre-2016 table reproduces
 * 95 values, the 2016 table 74, and 44 fit neither table or are per 100 g
 * rather than per serving. So a figure here is approximate %DV, and its label
 * says so. They used to be copied into fields named as mg and µg.
 *
 * A recipe's figure is the per-serving sum over the ingredients in its total.
 * An ingredient that does not list a nutrient adds nothing to it, so a figure
 * listed by fewer than all of them is shown "≥". Potassium is not here: the
 * profiles carry it in mg (`macros.potassium`).
 */

export type DvNutrient =
  | "vitaminA" | "vitaminC" | "vitaminD" | "vitaminE" | "vitaminK"
  | "thiamin" | "riboflavin" | "niacin" | "vitaminB6" | "folate" | "vitaminB12"
  | "calcium" | "iron" | "magnesium" | "phosphorus" | "zinc" | "copper"
  | "manganese" | "selenium";

interface Source {
  group: "vitamins" | "minerals";
  /** Profile keys that name the nutrient, first match wins. */
  keys: readonly string[];
  label: string;
}

const SOURCES: Record<DvNutrient, Source> = {
  vitaminA: { group: "vitamins", keys: ["A", "a", "vitaminA"], label: "Vitamin A" },
  vitaminC: { group: "vitamins", keys: ["C", "c", "vitaminC"], label: "Vitamin C" },
  vitaminD: { group: "vitamins", keys: ["D", "d", "vitaminD"], label: "Vitamin D" },
  vitaminE: { group: "vitamins", keys: ["E", "e", "vitaminE"], label: "Vitamin E" },
  vitaminK: { group: "vitamins", keys: ["K", "k", "vitaminK"], label: "Vitamin K" },
  thiamin: { group: "vitamins", keys: ["B1", "b1", "thiamin"], label: "Thiamin" },
  riboflavin: { group: "vitamins", keys: ["B2", "b2", "riboflavin"], label: "Riboflavin" },
  niacin: { group: "vitamins", keys: ["B3", "b3", "niacin"], label: "Niacin" },
  vitaminB6: { group: "vitamins", keys: ["B6", "b6", "vitaminB6"], label: "Vitamin B6" },
  folate: { group: "vitamins", keys: ["folate", "Folate"], label: "Folate" },
  vitaminB12: { group: "vitamins", keys: ["B12", "b12", "vitaminB12"], label: "Vitamin B12" },
  calcium: { group: "minerals", keys: ["calcium"], label: "Calcium" },
  iron: { group: "minerals", keys: ["iron"], label: "Iron" },
  magnesium: { group: "minerals", keys: ["magnesium"], label: "Magnesium" },
  phosphorus: { group: "minerals", keys: ["phosphorus"], label: "Phosphorus" },
  zinc: { group: "minerals", keys: ["zinc"], label: "Zinc" },
  copper: { group: "minerals", keys: ["copper"], label: "Copper" },
  manganese: { group: "minerals", keys: ["manganese"], label: "Manganese" },
  selenium: { group: "minerals", keys: ["selenium"], label: "Selenium" },
};

/** Label order: vitamins, then minerals. */
export const DV_NUTRIENTS: readonly DvNutrient[] = [
  "vitaminA", "vitaminC", "vitaminD", "vitaminE", "vitaminK", "thiamin",
  "riboflavin", "niacin", "vitaminB6", "folate", "vitaminB12", "calcium",
  "iron", "magnesium", "phosphorus", "zinc", "copper", "manganese", "selenium",
];

export interface DailyValueFractions {
  /** Fraction of a Daily Value, by nutrient: 0.12 is 12% DV. */
  fractions: Partial<Record<DvNutrient, number>>;
  /** How many of the ingredients in the total list each nutrient. */
  listedBy: Partial<Record<DvNutrient, number>>;
  /** How many ingredients the total sums over. */
  ingredients: number;
}

/** A number listed under `group`, or null for a name list ("c", "folate") or no entry. */
function readListed(group: unknown, keys: readonly string[]): number | null {
  if (typeof group !== "object" || group === null || Array.isArray(group)) return null;
  for (const key of keys) {
    const value: unknown = Reflect.get(group, key);
    if (typeof value === "number" && Number.isFinite(value)) return value;
  }
  return null;
}

/** One ingredient's %DV, read from its profile's `vitamins` and `minerals` records. */
export function readDailyValueFractions(profile: {
  vitamins?: unknown;
  minerals?: unknown;
}): DailyValueFractions {
  const out: DailyValueFractions = { fractions: {}, listedBy: {}, ingredients: 1 };
  for (const nutrient of DV_NUTRIENTS) {
    const { group, keys } = SOURCES[nutrient];
    const value = readListed(group === "vitamins" ? profile.vitamins : profile.minerals, keys);
    if (value === null) continue;
    out.fractions[nutrient] = value;
    out.listedBy[nutrient] = 1;
  }
  return out;
}

export function addDailyValueFractions(
  a: DailyValueFractions,
  b: DailyValueFractions,
): DailyValueFractions {
  const out: DailyValueFractions = {
    fractions: { ...a.fractions },
    listedBy: { ...a.listedBy },
    ingredients: a.ingredients + b.ingredients,
  };
  for (const nutrient of DV_NUTRIENTS) {
    const fraction = b.fractions[nutrient];
    if (fraction === undefined) continue;
    out.fractions[nutrient] = (out.fractions[nutrient] ?? 0) + fraction;
    out.listedBy[nutrient] = (out.listedBy[nutrient] ?? 0) + (b.listedBy[nutrient] ?? 0);
  }
  return out;
}

/** Scale the fractions (to an amount or a serving); the counts are unchanged. */
export function scaleDailyValueFractions(
  dv: DailyValueFractions,
  factor: number,
): DailyValueFractions {
  const fractions: DailyValueFractions["fractions"] = {};
  for (const nutrient of DV_NUTRIENTS) {
    const fraction = dv.fractions[nutrient];
    if (fraction !== undefined) fractions[nutrient] = fraction * factor;
  }
  return { fractions, listedBy: { ...dv.listedBy }, ingredients: dv.ingredients };
}

// ── Display ────────────────────────────────────────────────────────────────

export interface DailyValueEntry {
  nutrient: DvNutrient;
  label: string;
  group: Source["group"];
  /** Fraction of a Daily Value in the portion shown. */
  fraction: number;
  listedBy: number;
  ingredients: number;
}

export const DAILY_VALUE_BASIS =
  "% Daily Value as the ingredient data records it. That data mixes the pre-2016 and 2016 Daily Value tables, so read these as approximate.";
export const LOWER_BOUND_NOTE =
  "≥ marks a lower bound: not every ingredient lists that nutrient.";

function countOf(record: object, key: string): number | null {
  const value: unknown = Reflect.get(record, key);
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

/**
 * The nutrients a recipe lists, in label order, for `servings` servings.
 * Empty when it publishes no %DV: authored recipes, and menus saved before
 * the ruling, whose mg-named fields held these fractions.
 */
export function dailyValueEntries(nutrition: unknown, servings = 1): DailyValueEntry[] {
  if (typeof nutrition !== "object" || nutrition === null) return [];
  const dv: unknown = Reflect.get(nutrition, "dailyValue");
  if (typeof dv !== "object" || dv === null) return [];
  const fractions: unknown = Reflect.get(dv, "fractions");
  const listedBy: unknown = Reflect.get(dv, "listedBy");
  const ingredients = countOf(dv, "ingredients");
  if (typeof fractions !== "object" || fractions === null) return [];
  if (typeof listedBy !== "object" || listedBy === null || ingredients === null) return [];
  const entries: DailyValueEntry[] = [];
  for (const nutrient of DV_NUTRIENTS) {
    const fraction = countOf(fractions, nutrient);
    const listed = countOf(listedBy, nutrient);
    if (fraction === null || listed === null || listed < 1) continue;
    const { label, group } = SOURCES[nutrient];
    entries.push({ nutrient, label, group, fraction: fraction * servings, listedBy: listed, ingredients });
  }
  return entries;
}

export function isLowerBound(entry: DailyValueEntry): boolean {
  return entry.listedBy < entry.ingredients;
}

/** "12%", "≥12%" when a lower bound, one decimal under 1%: "≥0.4%". */
export function formatDailyValue(entry: DailyValueEntry): string {
  const percent = entry.fraction * 100;
  const shown = percent > 0 && percent < 1 ? percent.toFixed(1) : String(Math.round(percent));
  return `${isLowerBound(entry) ? "≥" : ""}${shown}%`;
}

/** "Listed by 3 of the 8 ingredients in the nutrition total". */
export function listedByNote(entry: DailyValueEntry): string {
  const of = entry.ingredients === 1 ? "the 1 ingredient" : `the ${entry.ingredients} ingredients`;
  return `Listed by ${entry.listedBy} of ${of} in the nutrition total`;
}
