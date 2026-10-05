/**
 * The computed fields every live HSCA row carries: `read_model.elemental_properties`,
 * `read_model.alchemical_quantities` and the per-serving `nutritional_profile`.
 *
 * Each is a copy of what a backfill script writes (scripts/backfillHscaElementalProperties.ts,
 * backfillRecipeAlchemicalQuantities.ts, backfillRecipeNutrition.ts); those scripts run on
 * import, so they cannot be imported. The copies were compared with the originals' own
 * functions on 538 ingredient lists (0 differences, 2026-10-04): a new row gets what the
 * backfill would compute for it today.
 */
import { computeRecipeNutritionFromIngredients } from "../../src/utils/ingredientNutritionAggregation";
import { normalize, normalizedVariants, singularize, stripQuotes } from "../../src/utils/ingredientNormalization";
import { calculateRecipeAlchemicalQuantities } from "../../src/utils/recipeAlchemicalQuantities";
import { isPlausibleNutrition } from "../../src/utils/recipeNutrition";

export interface Elemental {
  Fire: number;
  Water: number;
  Earth: number;
  Air: number;
}

/** The legacy lowercase shape the live read_model stores. */
export interface LiveElemental {
  fire: number;
  water: number;
  earth: number;
  air: number;
}

export interface LiveAlchemical {
  spirit: number;
  essence: number;
  matter: number;
  substance: number;
  totalASharp: number;
  matchRate: number;
}

export interface CatalogIngredient {
  name?: string;
  elementalProperties?: Partial<Elemental>;
}

interface IndexedEntry {
  key: string;
  elemental: Elemental;
}

export type ElementalIndex = Map<string, IndexedEntry>;

function tokenize(text: string): string[] {
  return normalize(text)
    .split(" ")
    .filter((token) => token.length > 1);
}

function buildVariants(text: string): Set<string> {
  const set = normalizedVariants(text);
  const tokens = tokenize(text).map((token) => singularize(token));
  if (tokens.length) {
    set.add(tokens.join(" "));
    const last = tokens[tokens.length - 1];
    if (last !== undefined) set.add(last);
    const first = tokens[0];
    if (first !== undefined) set.add(first);
  }
  return set;
}

function completeElemental(ep: Partial<Elemental> | undefined): Elemental | null {
  if (!ep) return null;
  const { Fire, Water, Earth, Air } = ep;
  if (typeof Fire !== "number" || typeof Water !== "number" || typeof Earth !== "number" || typeof Air !== "number") return null;
  return { Fire, Water, Earth, Air };
}

/** Every reasonable spelling of every catalog ingredient, earlier entries winning. */
export function buildElementalIndex(catalog: Record<string, CatalogIngredient | undefined>): ElementalIndex {
  const index: ElementalIndex = new Map();
  const indexUnder = (variant: string, entry: IndexedEntry): void => {
    if (variant && !index.has(variant)) index.set(variant, entry);
  };
  for (const [key, ingredient] of Object.entries(catalog)) {
    const elemental = completeElemental(ingredient?.elementalProperties);
    if (!elemental) continue;
    const entry: IndexedEntry = { key, elemental };
    for (const variant of buildVariants(key)) indexUnder(variant, entry);
    const display = ingredient?.name;
    if (display) for (const variant of buildVariants(display)) indexUnder(variant, entry);
  }
  return index;
}

function lookup(index: ElementalIndex, rawName: string): IndexedEntry | null {
  const cleaned = stripQuotes(rawName);
  for (const variant of buildVariants(cleaned)) {
    const hit = index.get(variant);
    if (hit) return hit;
  }
  const queryTokens = new Set(tokenize(cleaned).map((token) => singularize(token)));
  if (queryTokens.size === 0) return null;
  let best: IndexedEntry | null = null;
  let bestScore = 0;
  for (const [key, entry] of index.entries()) {
    const keyTokens = key.split(" ");
    let shared = 0;
    for (const token of keyTokens) if (queryTokens.has(token)) shared += 1;
    const union = new Set([...keyTokens, ...queryTokens]).size;
    const score = union > 0 ? shared / union : 0;
    if (score > bestScore && score >= 0.5) {
      bestScore = score;
      best = entry;
    }
  }
  return best;
}

/** Normalized mean of the matched ingredients' elements, or null when none match. */
export function aggregateElemental(index: ElementalIndex, names: readonly string[]): LiveElemental | null {
  let fire = 0;
  let water = 0;
  let earth = 0;
  let air = 0;
  let matched = 0;
  for (const name of names) {
    const entry = lookup(index, name);
    if (!entry) continue;
    fire += entry.elemental.Fire;
    water += entry.elemental.Water;
    earth += entry.elemental.Earth;
    air += entry.elemental.Air;
    matched += 1;
  }
  if (matched === 0) return null;
  const total = fire + water + earth + air;
  if (total <= 0) return null;
  return { fire: fire / total, water: water / total, earth: earth / total, air: air / total };
}

/**
 * What scripts/backfillRecipeNutrition.ts writes: per-serving nutrition rounded to 2 places, or
 * null when the ingredients cannot substantiate a plausible total (the honest-empty state).
 */
export function nutritionFor(
  ingredients: ReadonlyArray<{ name: string; amount: number; unit: string }>,
  servings: number,
): Record<string, unknown> | null {
  const nutrition = computeRecipeNutritionFromIngredients({
    ingredients: ingredients.map((i) => ({ name: i.name, amount: Number(i.amount) || 1, unit: i.unit, optional: false })),
    numberOfServings: servings,
  });
  if (!nutrition || !isPlausibleNutrition(nutrition)) return null;
  return Object.fromEntries(Object.entries(nutrition).map(([key, value]) => [key, typeof value === "number" ? Math.round(value * 100) / 100 : value]));
}

/** What scripts/backfillRecipeAlchemicalQuantities.ts writes. */
export function alchemicalQuantities(names: readonly string[]): LiveAlchemical {
  const summary = calculateRecipeAlchemicalQuantities([...names]);
  return {
    spirit: summary.totalSpirit,
    essence: summary.totalEssence,
    matter: summary.totalMatter,
    substance: summary.totalSubstance,
    totalASharp: summary.totalASharp,
    matchRate: summary.matchRate,
  };
}
