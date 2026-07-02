/**
 * Recipe Alchemical Quantities
 *
 * Computes the summed alchemical profile (A#, Spirit, Essence, Matter, Substance)
 * AND the averaged elemental profile (Fire, Water, Earth, Air) for a recipe by
 * aggregating per-ingredient values.
 *
 * The two profiles aggregate differently:
 *
 *   • ESMS quantities are *additive*. Each ingredient contributes its own
 *     Spirit, Essence, Matter, Substance as independent dimensions that are
 *     summed directly across all recipe ingredients. The recipe's total is
 *     the simple sum.
 *
 *     Recipe Spirit = Σ Spirit_ingredient (and similarly for E, M, S).
 *     Recipe A#     = Σ (Spirit_i + Essence_i + Matter_i + Substance_i).
 *
 *   • Elemental composition is a *percentage* — each ingredient's Fire +
 *     Water + Earth + Air sums to 1.0, and the recipe's composition is the
 *     ingredient-averaged share of each element (equivalent to summing the
 *     four columns and renormalizing to sum to 1.0).
 *
 *     Recipe Fire = (Σ Fire_i) / (Σ (Fire_i + Water_i + Earth_i + Air_i))
 */

import { unifiedIngredients } from "@/data/unified/ingredients";
import type { ElementalProperties } from "@/types/recipe";
import {
  MATCH_STOPWORDS,
  normalize as normalizeForMatch,
  normalizedVariants,
  singularize,
  stripQuotes,
} from "@/utils/ingredientNormalization";

export interface IngredientAlchemicalProperties {
  Spirit: number;
  Essence: number;
  Matter: number;
  Substance: number;
  aSharp: number; // Spirit + Essence + Matter + Substance
}

export interface RecipeIngredientAlchemical {
  ingredientName: string;
  matchedKey: string | null;
  alchemical: IngredientAlchemicalProperties;
  isDefaultValue: boolean;
}

export interface RecipeAlchemicalSummary {
  totalSpirit: number;
  totalEssence: number;
  totalMatter: number;
  totalSubstance: number;
  totalASharp: number;
  perIngredient: RecipeIngredientAlchemical[];
  matchRate: number; // fraction of ingredients matched in database (0-1)
}

export interface RecipeElementalSummary {
  /** Normalized so Fire + Water + Earth + Air = 1.0 (unless all matched
   * ingredients had a zero/degenerate elemental profile, in which case
   * the function returns null). */
  elementalProperties: ElementalProperties;
  matchedCount: number;
  matchRate: number;
}

// Default alchemical values for unmatched ingredients (neutral/average values)
const DEFAULT_ALCHEMICAL: IngredientAlchemicalProperties = {
  Spirit: 0.25,
  Essence: 0.30,
  Matter: 0.25,
  Substance: 0.20,
  aSharp: 1.00,
};

interface IngredientEntry {
  key: string;
  alchemical: IngredientAlchemicalProperties;
  /** Present only when the source ingredient declared all four elements
   * as numbers; otherwise undefined so the elemental aggregator can skip
   * it (vs. polluting the recipe with defaults). */
  elemental?: ElementalProperties;
  /** Catalog potency/intensity (typically 1-10), when declared. */
  potency?: number;
  /** Grams in one canonical serving (parsed from nutritionalProfile.serving_size). */
  servingGrams?: number;
  /** Ingredient category (e.g., culinary_herb, oil, grain, vegetable). */
  category?: string;
}

/** Parse grams from a serving_size string: "1 cup (125g)" → 125; "3 oz" → 85. */
function parseServingGrams(servingSize?: string): number | undefined {
  if (!servingSize) return undefined;
  const paren = servingSize.match(/\(([\d.]+)\s*g\)/i);
  if (paren) return Number(paren[1]);
  const amt = servingSize.match(/([\d.]+)\s*(oz|ounce|lb|pound|g|gram|ml|tbsp|tablespoon|tsp|teaspoon|cup)\b/i);
  if (amt) {
    const n = Number(amt[1]);
    const u = amt[2].toLowerCase();
    const g: Record<string, number> = { oz: 28.35, ounce: 28.35, lb: 453.6, pound: 453.6, g: 1, gram: 1, ml: 1, tbsp: 15, tablespoon: 15, tsp: 5, teaspoon: 5, cup: 240 };
    if (Number.isFinite(n) && g[u]) return n * g[u];
  }
  return undefined;
}

/**
 * Build the consolidated ingredient lookup map.
 * Keys are normalized ingredient names; each entry carries both the
 * Spirit/Essence/Matter/Substance alchemical quantities and, when the
 * source ingredient declares one, its Fire/Water/Earth/Air composition.
 *
 * Sources from `unifiedIngredients` — the complete merged catalog whose
 * entries always carry alchemicalProperties (raw when authored, otherwise
 * derived from the elemental profile). A hand-maintained collection list
 * previously lived here; it silently omitted whole files (eggs, plant-based
 * proteins, cooking staples, root vegetables, most grains) and skipped every
 * entry without raw alchemicalProperties, leaving spices/misc/staples
 * invisible to recipe ESMS sums.
 */
function buildIngredientAlchemicalMap(): Map<string, IngredientEntry> {
  const map = new Map<string, IngredientEntry>();

  for (const [key, ingredient] of Object.entries(unifiedIngredients)) {
    if (!ingredient || typeof ingredient !== "object") continue;

    const ing = ingredient as unknown as Record<string, unknown>;
    const alchProps = ing.alchemicalProperties as Record<string, number> | undefined;
    if (!alchProps) continue;

    const spirit = alchProps.Spirit ?? 0;
    const essence = alchProps.Essence ?? 0;
    const matter = alchProps.Matter ?? 0;
    const substance = alchProps.Substance ?? 0;

    const alchemical: IngredientAlchemicalProperties = {
      Spirit: spirit,
      Essence: essence,
      Matter: matter,
      Substance: substance,
      aSharp: spirit + essence + matter + substance,
    };

    // Extract elementalProperties if all four are numbers. Uniform profiles
    // (all four equal, i.e. the 0.25 backfill for entries that never declared
    // elementals) are treated as unknown so they don't dilute recipe averages.
    const elemProps = ing.elementalProperties as
      | Record<string, number>
      | undefined;
    let elemental: ElementalProperties | undefined;
    if (
      elemProps &&
      typeof elemProps.Fire === "number" &&
      typeof elemProps.Water === "number" &&
      typeof elemProps.Earth === "number" &&
      typeof elemProps.Air === "number" &&
      !(
        elemProps.Fire === elemProps.Water &&
        elemProps.Water === elemProps.Earth &&
        elemProps.Earth === elemProps.Air
      )
    ) {
      elemental = {
        Fire: elemProps.Fire,
        Water: elemProps.Water,
        Earth: elemProps.Earth,
        Air: elemProps.Air,
      };
    }

    const potency = typeof ing.potency === "number" ? (ing.potency) : undefined;
    const nutri = ing.nutritionalProfile as { serving_size?: string } | undefined;
    const servingGrams = parseServingGrams(nutri?.serving_size);
    const category = typeof ing.category === "string" ? ing.category : undefined;

    const entry: IngredientEntry = { key, alchemical, elemental, potency, servingGrams, category };

    // Index under every reasonable variant of the catalog key + display name
    // (mirrors the elemental backfill matcher so ESMS and elemental resolve the
    // same ingredients). Earlier insertions win — equally-valid variants from a
    // later ingredient don't clobber an existing mapping.
    const indexUnder = (variantKey: string) => {
      if (variantKey && !map.has(variantKey)) map.set(variantKey, entry);
    };
    for (const v of catalogVariants(key)) indexUnder(v);
    const displayName = (ing.name as string | undefined) ?? key;
    if (displayName !== key) {
      for (const v of catalogVariants(displayName)) indexUnder(v);
    }
    // Authored aliases ("shoyu" → soy_sauce, "firm tofu" → tofu_varieties)
    // resolve exactly like the display name.
    const aliases = Array.isArray(ing.aliases) ? (ing.aliases as unknown[]) : [];
    for (const alias of aliases) {
      if (typeof alias !== "string" || !alias) continue;
      for (const v of catalogVariants(alias)) indexUnder(v);
    }
  }

  return map;
}

/** Normalize a name for fuzzy matching: lowercase, strip punctuation, collapse spaces */
function normalizeIngredientName(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** Tokenize for matching: normalized words of length > 1. */
function tokenizeForMatch(s: string): string[] {
  return normalizeForMatch(s)
    .split(" ")
    .filter((t) => t.length > 1);
}

/**
 * Full-identity lookup keys for a CATALOG ingredient: the canonical
 * `normalizedVariants` (handles "fresh"/"minced", "X or Y", diacritics, and the
 * stub "foundation of …" repairs) plus a singularized whole-string form. These
 * never reduce a specific ingredient to a bare head-noun — otherwise "garlic"
 * would resolve to "garlic-infused olive oil".
 */
function catalogVariants(text: string): Set<string> {
  const set = normalizedVariants(text);
  const tokens = tokenizeForMatch(text).map((t) => singularize(t));
  if (tokens.length) set.add(tokens.join(" "));
  return set;
}

/**
 * Lookup keys for a QUERY ingredient name. Same full-phrase variants as the
 * catalog, plus head-noun reductions (last/first non-stopword token) so
 * "agave nectar" finds "agave" and "fresh tomatoes" finds "tomato". Stopwords
 * ("oil", "sauce", "pepper", …) are excluded from the bare-token fallbacks so a
 * query never collapses to a generic modifier. Insertion order is
 * specific→generic, and the map is probed in that order.
 */
function queryVariants(text: string): Set<string> {
  const set = catalogVariants(text);
  // Compound lines ("sea salt and pepper to taste") resolve as their first
  // item — query-side only, so catalog names keep their full identity.
  const firstSegment = text.split(/\s+and\s+/i)[0];
  if (firstSegment && firstSegment.trim() && firstSegment !== text) {
    for (const v of catalogVariants(firstSegment)) set.add(v);
  }
  const tokens = tokenizeForMatch(text)
    .map((t) => singularize(t))
    .filter((t) => t.length > 2 && !MATCH_STOPWORDS.has(t));
  if (tokens.length) {
    set.add(tokens[tokens.length - 1]);
    set.add(tokens[0]);
  }
  return set;
}

// Lazily initialized lookup map
let _ingredientAlchemicalMap: Map<string, IngredientEntry> | null = null;

function getIngredientAlchemicalMap() {
  if (!_ingredientAlchemicalMap) {
    _ingredientAlchemicalMap = buildIngredientAlchemicalMap();
  }
  return _ingredientAlchemicalMap;
}

/** Internal: full ingredient entry lookup (alchemical + elemental). */
function lookupIngredient(ingredientName: string): IngredientEntry | null {
  const map = getIngredientAlchemicalMap();

  // 1. Variant match: try every normalized / singularized / token variant of
  //    the query against the variant-indexed map (exact match is included as
  //    one variant, so prior exact-match behavior is preserved).
  const cleaned = stripQuotes(ingredientName);
  for (const v of queryVariants(cleaned)) {
    const hit = map.get(v);
    if (hit) return hit;
  }

  // 2. Token-based partial matching: find map entry that shares the most tokens
  const normalized = normalizeIngredientName(ingredientName);
  const queryTokens = new Set(normalized.split(" ").filter((t) => t.length > 2));
  if (queryTokens.size === 0) return null;

  let bestMatch: IngredientEntry | null = null;
  let bestScore = 0;

  for (const [mapKey, value] of map.entries()) {
    const keyTokens = mapKey.split(" ").filter((t) => t.length > 2);
    let sharedCount = 0;
    for (const token of keyTokens) {
      if (queryTokens.has(token)) sharedCount++;
    }
    // Score: shared tokens / total unique tokens (Jaccard-like). The 0.5
    // floor requires at least half the combined tokens to agree — at 0.3,
    // "black pepper" matched black_seed_oil and silently poisoned ESMS sums.
    const unionSize = new Set([...keyTokens, ...queryTokens]).size;
    const score = unionSize > 0 ? sharedCount / unionSize : 0;

    if (score > bestScore && score >= 0.5) {
      bestScore = score;
      bestMatch = value;
    }
  }

  return bestMatch;
}

/**
 * Look up alchemical properties for an ingredient by name.
 * Uses a multi-step matching strategy:
 *   1. Exact normalized name match
 *   2. Longest common word-token subset match
 * Returns null if no reasonable match is found.
 */
export function lookupIngredientAlchemical(
  ingredientName: string,
): { key: string; alchemical: IngredientAlchemicalProperties } | null {
  const entry = lookupIngredient(ingredientName);
  return entry ? { key: entry.key, alchemical: entry.alchemical } : null;
}

/**
 * Richer lookup that also returns the ingredient's elemental profile and
 * potency when the catalog declares them — used by the recipe-NFT fingerprint
 * for potency-weighted, ingredient-derived aggregation.
 */
export function lookupIngredientFull(ingredientName: string): {
  key: string;
  alchemical: IngredientAlchemicalProperties;
  elemental?: ElementalProperties;
  potency?: number;
  servingGrams?: number;
  category?: string;
} | null {
  const entry = lookupIngredient(ingredientName);
  return entry
    ? {
        key: entry.key,
        alchemical: entry.alchemical,
        elemental: entry.elemental,
        potency: entry.potency,
        servingGrams: entry.servingGrams,
        category: entry.category,
      }
    : null;
}

/**
 * Calculate the summed alchemical quantities for all ingredients in a recipe.
 *
 * Each ingredient contributes its own Spirit, Essence, Matter, Substance
 * (independent dimensions, not normalized). The recipe total is the simple sum.
 *
 * Recipe A# = Σ (Spirit_i + Essence_i + Matter_i + Substance_i) for all i
 */
export function calculateRecipeAlchemicalQuantities(
  ingredientNames: string[],
): RecipeAlchemicalSummary {
  const perIngredient: RecipeIngredientAlchemical[] = [];
  let totalSpirit = 0;
  let totalEssence = 0;
  let totalMatter = 0;
  let totalSubstance = 0;
  let matchedCount = 0;

  for (const name of ingredientNames) {
    const match = lookupIngredientAlchemical(name);

    if (match) {
      matchedCount++;
      totalSpirit += match.alchemical.Spirit;
      totalEssence += match.alchemical.Essence;
      totalMatter += match.alchemical.Matter;
      totalSubstance += match.alchemical.Substance;
      perIngredient.push({
        ingredientName: name,
        matchedKey: match.key,
        alchemical: match.alchemical,
        isDefaultValue: false,
      });
    } else {
      // Use default values for unmatched ingredients
      totalSpirit += DEFAULT_ALCHEMICAL.Spirit;
      totalEssence += DEFAULT_ALCHEMICAL.Essence;
      totalMatter += DEFAULT_ALCHEMICAL.Matter;
      totalSubstance += DEFAULT_ALCHEMICAL.Substance;
      perIngredient.push({
        ingredientName: name,
        matchedKey: null,
        alchemical: DEFAULT_ALCHEMICAL,
        isDefaultValue: true,
      });
    }
  }

  const totalASharp = totalSpirit + totalEssence + totalMatter + totalSubstance;
  const matchRate = ingredientNames.length > 0 ? matchedCount / ingredientNames.length : 0;

  return {
    totalSpirit,
    totalEssence,
    totalMatter,
    totalSubstance,
    totalASharp,
    perIngredient,
    matchRate,
  };
}

/**
 * Compute the recipe's elemental composition as the ingredient-averaged
 * share of Fire / Water / Earth / Air, normalized to sum to 1.0.
 *
 * Ingredients that have no matched elemental profile are simply skipped
 * (rather than pulled toward a `0.25/0.25/0.25/0.25` default), so a recipe
 * dominated by an ingredient whose Fire is high stays Fire-leaning even
 * when a few obscure flavorings are missing from the lookup table.
 *
 * Returns null when no ingredient matched, so callers can fall back to
 * whatever the source recipe declared.
 */
export function calculateRecipeElementalFromIngredients(
  ingredientNames: string[],
): RecipeElementalSummary | null {
  if (ingredientNames.length === 0) return null;

  let fireSum = 0;
  let waterSum = 0;
  let earthSum = 0;
  let airSum = 0;
  let matched = 0;

  for (const name of ingredientNames) {
    const entry = lookupIngredient(name);
    if (!entry?.elemental) continue;
    fireSum += entry.elemental.Fire;
    waterSum += entry.elemental.Water;
    earthSum += entry.elemental.Earth;
    airSum += entry.elemental.Air;
    matched++;
  }

  if (matched === 0) return null;
  const total = fireSum + waterSum + earthSum + airSum;
  if (total <= 0) return null;

  return {
    elementalProperties: {
      Fire: fireSum / total,
      Water: waterSum / total,
      Earth: earthSum / total,
      Air: airSum / total,
    },
    matchedCount: matched,
    matchRate: matched / ingredientNames.length,
  };
}
