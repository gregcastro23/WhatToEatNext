/**
 * Recipe alchemical fingerprint — SERVER ONLY (imports the ingredient catalog).
 *
 * v3 aggregation ("potency_weighted_v3"):
 *   • Each ingredient resolves to per-unit ESMS + elemental + potency (catalog
 *     or curated override).
 *   • weight_i = massGrams_i × potencyFactor_i, where potencyFactor = potency/5
 *     (5 = neutral). A potent pinch (chili, spice) punches above its mass.
 *   • Totals are NORMALIZED to a fixed economy target: raw = Σ(esms_i × weight_i)
 *     per coin, then each coin is scaled by TARGET_ESMS ÷ (raw four-coin sum) so
 *     EVERY recipe's four coins sum to TARGET_ESMS (20). Ingredient density no
 *     longer changes the total — only the SPLIT across coins varies, reflecting
 *     the recipe's alchemical signature. (v2 divided by servings × a global
 *     CALIBRATION constant, so denser recipes drifted above the target.)
 *   • Elemental shares feeding the physics are INGREDIENT-DERIVED (weight-weighted),
 *     not the authored elementalBalance (which only seeds the fallback).
 *   • Mass prefers precise measures (g/ml/tsp/tbsp/cup, incl. from the household
 *     description); rough count units ("2 medium") are flagged `gramsEstimated`.
 */

import { calculateThermodynamicMetrics } from "@/utils/monicaKalchmCalculations";
import { lookupIngredientFull } from "@/utils/recipeAlchemicalQuantities";
import type { MintableRecipe } from "./mintableRecipe";
import type {
  CoinAmounts,
  ElementalShares,
  IngredientFingerprint,
  RecipeFingerprint,
} from "./types";

/** Bump when the alchemical computation changes — committed on-chain as engineVersion. */
export const ENGINE_VERSION = 3;

/**
 * Fixed mint-economy target: every recipe's four ESMS coins are normalized to
 * sum to exactly this value, so all recipes cost the same to mint (20 ESMS) and
 * density no longer inflates the price. The per-recipe SPLIT across the four
 * coins still reflects its alchemical signature. Tune this single constant to
 * scale the whole mint economy up or down.
 */
export const TARGET_ESMS = 20.0;

const NEUTRAL_POTENCY = 5;

const DEFAULT_ESMS: CoinAmounts = { spirit: 0.25, essence: 0.3, matter: 0.25, substance: 0.2 };

/** Curated per-unit ESMS + elemental + potency for ingredients absent from the catalog. */
const CURATED_OVERRIDES: Array<{
  match: string;
  key: string;
  esms: CoinAmounts;
  elemental: ElementalShares;
  potency: number;
  servingGrams: number;
  category: string;
}> = [
  { match: "leek", key: "curated:leek", esms: { spirit: 0.45, essence: 0.55, matter: 0.5, substance: 0.4 }, elemental: { Fire: 0.15, Water: 0.3, Earth: 0.35, Air: 0.2 }, potency: 4, servingGrams: 89, category: "vegetable" },
  { match: "carrot", key: "curated:carrot", esms: { spirit: 0.25, essence: 0.4, matter: 0.6, substance: 0.35 }, elemental: { Fire: 0.1, Water: 0.3, Earth: 0.5, Air: 0.1 }, potency: 5, servingGrams: 61, category: "vegetable" },
  { match: "tarragon", key: "curated:tarragon", esms: { spirit: 0.6, essence: 0.4, matter: 0.15, substance: 0.25 }, elemental: { Fire: 0.3, Water: 0.2, Earth: 0.1, Air: 0.4 }, potency: 7, servingGrams: 2, category: "culinary_herb" },
  { match: "mafaldine", key: "curated:pasta", esms: { spirit: 0.15, essence: 0.25, matter: 0.6, substance: 0.35 }, elemental: { Fire: 0.1, Water: 0.2, Earth: 0.6, Air: 0.1 }, potency: 3, servingGrams: 56, category: "grain" },
  { match: "chili", key: "curated:chili-flakes", esms: { spirit: 0.7, essence: 0.35, matter: 0.15, substance: 0.2 }, elemental: { Fire: 0.7, Water: 0, Earth: 0.1, Air: 0.2 }, potency: 9, servingGrams: 1, category: "seasoning" },
  // Chorizo Bolognese (flagship v3) — real-valued fallbacks for ingredients the
  // catalog may miss or mis-resolve. Element→coin: Fire=Spirit, Water=Essence,
  // Earth=Matter, Air=Substance. The catalog is still tried first (resolveIngredient).
  { match: "chorizo", key: "curated:chorizo-fresh", esms: { spirit: 0.7, essence: 0.4, matter: 0.5, substance: 0.3 }, elemental: { Fire: 0.55, Water: 0.12, Earth: 0.23, Air: 0.1 }, potency: 8, servingGrams: 85, category: "protein" },
  { match: "paprika", key: "curated:smoked-paprika", esms: { spirit: 0.7, essence: 0.3, matter: 0.15, substance: 0.25 }, elemental: { Fire: 0.72, Water: 0.03, Earth: 0.1, Air: 0.15 }, potency: 9, servingGrams: 2, category: "seasoning" },
  { match: "tomato paste", key: "curated:tomato-paste", esms: { spirit: 0.3, essence: 0.6, matter: 0.45, substance: 0.3 }, elemental: { Fire: 0.15, Water: 0.5, Earth: 0.3, Air: 0.05 }, potency: 6, servingGrams: 16, category: "condiment" },
  { match: "red wine", key: "curated:red-wine", esms: { spirit: 0.4, essence: 0.55, matter: 0.15, substance: 0.4 }, elemental: { Fire: 0.25, Water: 0.45, Earth: 0.05, Air: 0.25 }, potency: 6, servingGrams: 150, category: "beverage" },
  { match: "nutmeg", key: "curated:nutmeg", esms: { spirit: 0.6, essence: 0.3, matter: 0.2, substance: 0.35 }, elemental: { Fire: 0.4, Water: 0.1, Earth: 0.15, Air: 0.35 }, potency: 8, servingGrams: 1, category: "spice" },
  { match: "rigatoni", key: "curated:pasta", esms: { spirit: 0.15, essence: 0.25, matter: 0.62, substance: 0.33 }, elemental: { Fire: 0.08, Water: 0.17, Earth: 0.65, Air: 0.1 }, potency: 3, servingGrams: 56, category: "grain" },
  { match: "celery", key: "curated:celery", esms: { spirit: 0.2, essence: 0.45, matter: 0.35, substance: 0.4 }, elemental: { Fire: 0.05, Water: 0.55, Earth: 0.2, Air: 0.2 }, potency: 4, servingGrams: 40, category: "vegetable" },
  { match: "whole milk", key: "curated:milk", esms: { spirit: 0.2, essence: 0.5, matter: 0.45, substance: 0.35 }, elemental: { Fire: 0.05, Water: 0.6, Earth: 0.25, Air: 0.1 }, potency: 4, servingGrams: 244, category: "dairy" },
  { match: "butter", key: "curated:butter", esms: { spirit: 0.15, essence: 0.35, matter: 0.5, substance: 0.3 }, elemental: { Fire: 0.1, Water: 0.35, Earth: 0.45, Air: 0.1 }, potency: 4, servingGrams: 14, category: "dairy" },
  { match: "oregano", key: "curated:oregano", esms: { spirit: 0.5, essence: 0.35, matter: 0.15, substance: 0.3 }, elemental: { Fire: 0.35, Water: 0.15, Earth: 0.15, Air: 0.35 }, potency: 7, servingGrams: 2, category: "culinary_herb" },
  { match: "confit", key: "curated:confit-garlic", esms: { spirit: 0.35, essence: 0.5, matter: 0.4, substance: 0.35 }, elemental: { Fire: 0.2, Water: 0.35, Earth: 0.35, Air: 0.1 }, potency: 6, servingGrams: 15, category: "aromatic" },
];

// Categories that don't define a serving portion (oils, seasonings, garnishes,
// cooking liquids) — excluded from the binding servings calc.
const NON_PORTION_CATEGORIES = new Set([
  "oil", "oils", "seasoning", "seasonings", "spice", "spices", "salt", "salts",
  "condiment", "vinegar", "vinegars", "sweetener", "culinary_herb", "herb", "herbs",
  "beverage", "beverages", "aromatic", "aromatics",
]);
/** Fallback serving grams by broad category when the catalog doesn't declare one. */
const CATEGORY_SERVING_GRAMS: Record<string, number> = {
  grain: 75, grains: 75, vegetable: 90, vegetables: 90, protein: 85,
  proteins: 85, dairy: 40, fruit: 120, fruits: 120, legume: 80, legumes: 80,
};
const DEFAULT_SERVING_GRAMS = 90;
/** An ingredient must contribute at least this much mass to define the serving count. */
const PORTION_MASS_FLOOR = 70;

/** Deterministic mass/volume → grams. */
const PRECISE_UNITS: Record<string, number> = {
  g: 1, gram: 1, kg: 1000, mg: 0.001,
  oz: 28.35, ounce: 28.35, lb: 453.6, pound: 453.6,
  ml: 1, l: 1000, liter: 1,
  tsp: 5, teaspoon: 5, tbsp: 15, tablespoon: 15, cup: 240, pinch: 0.5, dash: 0.6,
};
/** Rough count units — converted but flagged as estimated. */
const COUNT_UNITS: Record<string, number> = {
  clove: 5, can: 400, bunch: 150, slice: 20, piece: 50,
  head: 400, sprig: 3, stalk: 40, handful: 20, small: 60, medium: 100, large: 150,
};
const FALLBACK_GRAMS = 50;

const round = (n: number, d = 4): number => {
  const f = 10 ** d;
  return Math.round(n * f) / f;
};
const clamp = (n: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, n));

function parseAmount(raw: string): number {
  const s = raw.trim();
  const mixed = s.match(/^(\d+)\s+(\d+)\/(\d+)$/);
  if (mixed) return Number(mixed[1]) + Number(mixed[2]) / Number(mixed[3]);
  const frac = s.match(/^(\d+)\/(\d+)$/);
  if (frac) return Number(frac[1]) / Number(frac[2]);
  const n = Number(s);
  return Number.isFinite(n) ? n : NaN;
}

const normalizeUnit = (u: string) => u.toLowerCase().trim().replace(/s$/, "");

/** Estimate mass; `estimated` is true only when forced to use a rough count unit. */
function estimateMass(quantity: string, unit: string, household?: string): { grams: number; estimated: boolean } {
  const q = parseAmount(quantity);
  const u = normalizeUnit(unit);
  // 1. An explicit precise unit on the recipe line (g/ml/tsp/tbsp/cup…) wins — never
  //    override a stated gram weight with a household-description volume estimate.
  if (Number.isFinite(q) && PRECISE_UNITS[u] != null) return { grams: q * PRECISE_UNITS[u], estimated: false };
  // 2. Otherwise (count/vague unit), prefer a precise measure in the household description.
  if (household) {
    const m = household
      .toLowerCase()
      .match(/(\d+\s+\d+\/\d+|\d+\/\d+|\d+(?:\.\d+)?)\s*(cups?|cans?|tbsp|tablespoons?|tsp|teaspoons?|g|grams?|oz|ounces?|ml|l)\b/);
    if (m) {
      const hq = parseAmount(m[1]);
      const hu = normalizeUnit(m[2]);
      const g = PRECISE_UNITS[hu] ?? COUNT_UNITS[hu];
      if (Number.isFinite(hq) && g != null) return { grams: hq * g, estimated: false };
    }
  }
  // 3. Rough count-unit conversion.
  if (Number.isFinite(q) && COUNT_UNITS[u] != null) return { grams: q * COUNT_UNITS[u], estimated: true };
  if (Number.isFinite(q)) return { grams: q * FALLBACK_GRAMS, estimated: true };
  return { grams: FALLBACK_GRAMS, estimated: true };
}

function nameCandidates(name: string): string[] {
  const beforeComma = name.split(",")[0]?.trim() ?? name;
  const beforeParen = beforeComma.split("(")[0]?.trim() ?? beforeComma;
  const words = beforeParen.split(/\s+/).filter((w) => w.length > 2);
  const lastWord = words[words.length - 1] ?? beforeParen;
  return [...new Set([name, beforeComma, beforeParen, lastWord].filter(Boolean))];
}

interface Resolved {
  key: string | null;
  source: "catalog" | "curated" | "default";
  esms: CoinAmounts;
  elemental?: ElementalShares;
  potency: number;
  servingGrams?: number;
  category?: string;
}

function resolveIngredient(name: string): Resolved {
  for (const candidate of nameCandidates(name)) {
    const match = lookupIngredientFull(candidate);
    if (match) {
      const a = match.alchemical;
      return {
        key: match.key,
        source: "catalog",
        esms: { spirit: a.Spirit, essence: a.Essence, matter: a.Matter, substance: a.Substance },
        elemental: match.elemental
          ? { Fire: match.elemental.Fire, Water: match.elemental.Water, Earth: match.elemental.Earth, Air: match.elemental.Air }
          : undefined,
        potency: match.potency ?? NEUTRAL_POTENCY,
        servingGrams: match.servingGrams,
        category: match.category,
      };
    }
  }
  const lower = name.toLowerCase();
  const override = CURATED_OVERRIDES.find((o) => lower.includes(o.match));
  if (override) {
    return {
      key: override.key,
      source: "curated",
      esms: { ...override.esms },
      elemental: override.elemental,
      potency: override.potency,
      servingGrams: override.servingGrams,
      category: override.category,
    };
  }
  return { key: null, source: "default", esms: { ...DEFAULT_ESMS }, potency: NEUTRAL_POTENCY };
}

/** The structural staples that define how many servings a dish makes. */
const STAPLE_CATEGORIES = new Set(["grain", "grains", "protein", "proteins", "pasta", "noodle", "noodles"]);

/**
 * Smart default servings via the yield-limiting ingredient, computed per recipe.
 *
 * Each ingredient's "serving yield" = its recipe mass ÷ its standard serving. The
 * recipe serves the BINDING (smallest-yield) ingredient — but only among the
 * structural staples (grain/protein) that actually scale with servings, since
 * supporting veg, aromatics, seasonings, garnishes, and cooking liquids are
 * written at roughly a single portion regardless of how many the dish feeds and
 * would otherwise collapse the count to ~1. If a recipe has no staple (e.g. a
 * salad), fall back to the median yield of its substantial food ingredients.
 */
function computeSmartServings(
  rows: Array<{ name: string; r: Resolved; grams: number }>,
  authoredYields: number,
): { servings: number; limitedBy: string | null } {
  const yieldOf = (r: Resolved, grams: number) => {
    const cat = (r.category ?? "").toLowerCase();
    const serving = r.servingGrams ?? CATEGORY_SERVING_GRAMS[cat] ?? DEFAULT_SERVING_GRAMS;
    return serving > 0 ? grams / serving : null;
  };

  // Primary: yield-limiting among structural staples.
  let binding: { y: number; name: string } | null = null;
  for (const { name, r, grams } of rows) {
    const cat = (r.category ?? "").toLowerCase();
    if (!STAPLE_CATEGORIES.has(cat)) continue;
    const y = yieldOf(r, grams);
    if (y == null) continue;
    if (!binding || y < binding.y) binding = { y, name };
  }
  if (binding) {
    return { servings: Math.max(1, Math.min(12, Math.round(binding.y))), limitedBy: binding.name };
  }

  // Fallback: median yield of substantial, non-seasoning/garnish/liquid food.
  const yields = rows
    .filter(({ r, grams, name }) => {
      const cat = (r.category ?? "").toLowerCase();
      return !NON_PORTION_CATEGORIES.has(cat) && grams >= PORTION_MASS_FLOOR && !/\b(water|stock|broth|juice)\b/i.test(name);
    })
    .map(({ r, grams }) => yieldOf(r, grams))
    .filter((y): y is number => y != null)
    .sort((a, b) => a - b);
  if (yields.length === 0) return { servings: authoredYields, limitedBy: null };
  const mid = Math.floor(yields.length / 2);
  const median = yields.length % 2 ? yields[mid] : (yields[mid - 1] + yields[mid]) / 2;
  return { servings: Math.max(1, Math.min(12, Math.round(median))), limitedBy: null };
}

function authoredElementalShares(recipe: MintableRecipe): ElementalShares {
  const b = recipe.elementalBalance;
  const total = b.fire + b.water + b.earth + b.air || 1;
  return { Fire: round(b.fire / total), Water: round(b.water / total), Earth: round(b.earth / total), Air: round(b.air / total) };
}

/**
 * Compute the v2 alchemical fingerprint. Deterministic for a given recipe +
 * ingredient catalog, so it is safe to hash into `contentHash`.
 */
export function computeRecipeFingerprint(recipe: MintableRecipe): RecipeFingerprint {
  const authoredYields = recipe.yields && recipe.yields > 0 ? recipe.yields : 4;

  const rows = recipe.ingredients.map((ing) => {
    const r = resolveIngredient(ing.name);
    const { grams, estimated } = estimateMass(ing.quantity, ing.unit, ing.household_description);
    const potencyFactor = clamp((r.potency || NEUTRAL_POTENCY) / NEUTRAL_POTENCY, 0.3, 2.5);
    const weight = grams * potencyFactor;
    return { ing, r, grams, estimated, potencyFactor, weight };
  });

  // Smart default servings (yield-limiting per recipe) drives the per-serving divisor.
  const servingsResult = computeSmartServings(
    rows.map((x) => ({ name: x.ing.name, r: x.r, grams: x.grams })),
    authoredYields,
  );
  const smartServings = servingsResult.servings;

  const ingredients: IngredientFingerprint[] = rows.map(({ ing, r, grams, estimated, potencyFactor, weight }) => ({
    name: ing.name,
    key: r.key,
    matched: r.source !== "default",
    source: r.source,
    esms: {
      spirit: round(r.esms.spirit),
      essence: round(r.esms.essence),
      matter: round(r.esms.matter),
      substance: round(r.esms.substance),
    },
    aSharp: round(r.esms.spirit + r.esms.essence + r.esms.matter + r.esms.substance),
    elemental: r.elemental,
    quantity: ing.quantity,
    unit: ing.unit,
    massGrams: round(grams, 1),
    gramsEstimated: estimated,
    potency: r.potency,
    potencyFactor: round(potencyFactor, 3),
    weight: round(weight, 2),
  }));

  // Potency-weighted ESMS, summed across all ingredients (the raw signature).
  const weighted = rows.reduce(
    (acc, { r, weight }) => ({
      spirit: acc.spirit + r.esms.spirit * weight,
      essence: acc.essence + r.esms.essence * weight,
      matter: acc.matter + r.esms.matter * weight,
      substance: acc.substance + r.esms.substance * weight,
    }),
    { spirit: 0, essence: 0, matter: 0, substance: 0 },
  );
  // Normalize to the fixed economy target: every recipe's four coins sum to
  // TARGET_ESMS, so all recipes cost the same to mint. Only the SPLIT varies,
  // preserving the raw potency-weighted ratio between coins. A degenerate recipe
  // with no resolved ESMS (rawTotal 0) yields all-zero totals rather than NaN.
  const rawTotal =
    weighted.spirit + weighted.essence + weighted.matter + weighted.substance;
  const normScale = rawTotal > 0 ? TARGET_ESMS / rawTotal : 0;
  const totals: CoinAmounts = {
    spirit: weighted.spirit * normScale,
    essence: weighted.essence * normScale,
    matter: weighted.matter * normScale,
    substance: weighted.substance * normScale,
  };
  const aSharp = totals.spirit + totals.essence + totals.matter + totals.substance;

  // Ingredient-derived elemental shares (potency-weighted); fall back to authored.
  const elemAccum = rows.reduce(
    (acc, { r, weight }) => {
      if (!r.elemental) return acc;
      acc.Fire += r.elemental.Fire * weight;
      acc.Water += r.elemental.Water * weight;
      acc.Earth += r.elemental.Earth * weight;
      acc.Air += r.elemental.Air * weight;
      acc.total += weight;
      return acc;
    },
    { Fire: 0, Water: 0, Earth: 0, Air: 0, total: 0 },
  );
  let elemental: ElementalShares;
  let elementalSource: RecipeFingerprint["elementalSource"];
  const elemSum = elemAccum.Fire + elemAccum.Water + elemAccum.Earth + elemAccum.Air;
  if (elemAccum.total > 0 && elemSum > 0) {
    elemental = {
      Fire: round(elemAccum.Fire / elemSum),
      Water: round(elemAccum.Water / elemSum),
      Earth: round(elemAccum.Earth / elemSum),
      Air: round(elemAccum.Air / elemSum),
    };
    elementalSource = "ingredient-derived";
  } else {
    elemental = authoredElementalShares(recipe);
    elementalSource = "authored";
  }

  const metrics = calculateThermodynamicMetrics(
    { Spirit: totals.spirit, Essence: totals.essence, Matter: totals.matter, Substance: totals.substance },
    elemental,
  );

  const resolvedCount = ingredients.filter((i) => i.source !== "default").length;
  const catalogCount = ingredients.filter((i) => i.source === "catalog").length;
  const totalMass = rows.reduce((s, r) => s + r.grams, 0) || 1;
  const preciseMass = rows.filter((r) => !r.estimated).reduce((s, r) => s + r.grams, 0);
  const n = ingredients.length || 1;

  return {
    ingredients,
    totals: {
      spirit: round(totals.spirit, 2),
      essence: round(totals.essence, 2),
      matter: round(totals.matter, 2),
      substance: round(totals.substance, 2),
    },
    aSharp: round(aSharp, 2),
    elemental,
    physics: {
      heat: round(metrics.heat, 4),
      entropy: round(metrics.entropy, 4),
      reactivity: round(metrics.reactivity, 4),
      gregsEnergy: round(metrics.gregsEnergy, 4),
      kalchm: round(metrics.kalchm, 4),
      monica: round(metrics.monica ?? 1, 4),
    },
    matchRate: round(resolvedCount / n, 2),
    catalogMatchRate: round(catalogCount / n, 2),
    massPrecision: round(preciseMass / totalMass, 2),
    yields: authoredYields,
    smartServings,
    servingsLimitedBy: servingsResult.limitedBy,
    aggregationMode: "potency_weighted_v3",
    elementalSource,
    engineVersion: ENGINE_VERSION,
  };
}
