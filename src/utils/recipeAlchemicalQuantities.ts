/**
 * Recipe Alchemical Quantities
 *
 * Computes the summed alchemical profile (A#, Spirit, Essence, Matter, Substance)
 * for a recipe by aggregating per-ingredient alchemical quantities.
 *
 * Unlike elemental properties (normalized to sum to 1), ingredient alchemical
 * quantities are independent dimensions that are summed directly across all
 * recipe ingredients to produce the recipe's total alchemical quantity.
 *
 * A# for a recipe = Σ A#_ingredient = Σ (Spirit + Essence + Matter + Substance)
 */

import { beveragesIngredients } from "@/data/ingredients/beverages/beverages";
import { dairyIngredients } from "@/data/ingredients/dairy/dairy";
import { berries } from "@/data/ingredients/fruits/berries";
import { citrus } from "@/data/ingredients/fruits/citrus";
import { exotic } from "@/data/ingredients/fruits/exotic";
import { melons } from "@/data/ingredients/fruits/melons";
import { pome } from "@/data/ingredients/fruits/pome";
import { _stoneFruit } from "@/data/ingredients/fruits/stoneFruit";
import { tropical } from "@/data/ingredients/fruits/tropical";
import { wholeGrains } from "@/data/ingredients/grains/wholeGrains";
import { driedHerbs } from "@/data/ingredients/herbs/driedHerbs";
import { freshHerbs } from "@/data/ingredients/herbs/freshHerbs";
import { medicinalHerbs } from "@/data/ingredients/herbs/medicinalHerbs";
import { oilsIngredients } from "@/data/ingredients/oils/oils";
import { legumes as proteinLegumes } from "@/data/ingredients/proteins/legumes";
import { _meats } from "@/data/ingredients/proteins/meat";
import { poultry } from "@/data/ingredients/proteins/poultry";
import { seafood } from "@/data/ingredients/proteins/seafood";
import { aromatics } from "@/data/ingredients/seasonings/aromatics";
import { _peppers } from "@/data/ingredients/seasonings/peppers";
import { salts } from "@/data/ingredients/seasonings/salts";
import { alliums } from "@/data/ingredients/vegetables/alliums";
import { cruciferous } from "@/data/ingredients/vegetables/cruciferous";
import { fungi } from "@/data/ingredients/vegetables/fungi";
import { leafyGreens } from "@/data/ingredients/vegetables/leafyGreens";
import { legumes as vegLegumes } from "@/data/ingredients/vegetables/legumes";
import { nightshades } from "@/data/ingredients/vegetables/nightshades";
import { _otherVegetables } from "@/data/ingredients/vegetables/otherVegetables";
import { squash } from "@/data/ingredients/vegetables/squash";
import { starchy } from "@/data/ingredients/vegetables/starchy";
import { _allVinegars } from "@/data/ingredients/vinegars/vinegars";

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

// Default alchemical values for unmatched ingredients (neutral/average values)
const DEFAULT_ALCHEMICAL: IngredientAlchemicalProperties = {
  Spirit: 0.25,
  Essence: 0.30,
  Matter: 0.25,
  Substance: 0.20,
  aSharp: 1.00,
};

/**
 * Build the consolidated ingredient alchemical lookup map.
 * Keys are normalized ingredient names; values are Spirit/Essence/Matter/Substance.
 */
function buildIngredientAlchemicalMap(): Map<string, { key: string; alchemical: IngredientAlchemicalProperties }> {
  const map = new Map<string, { key: string; alchemical: IngredientAlchemicalProperties }>();

  const allCollections: Record<string, Record<string, unknown>> = {
    ...beveragesIngredients,
    ...dairyIngredients,
    ...berries,
    ...citrus,
    ...exotic,
    ...melons,
    ...pome,
    ..._stoneFruit,
    ...tropical,
    ...wholeGrains,
    ...driedHerbs,
    ...freshHerbs,
    ...medicinalHerbs,
    ...oilsIngredients,
    ...proteinLegumes,
    ..._meats,
    ...poultry,
    ...seafood,
    ...aromatics,
    ..._peppers,
    ...salts,
    ...alliums,
    ...cruciferous,
    ...fungi,
    ...leafyGreens,
    ...vegLegumes,
    ...nightshades,
    ..._otherVegetables,
    ...squash,
    ...starchy,
    ..._allVinegars,
  };

  for (const [key, ingredient] of Object.entries(allCollections)) {
    if (!ingredient || typeof ingredient !== "object") continue;

    const ing = ingredient as Record<string, unknown>;
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

    // Index by normalized key
    const normalizedKey = normalizeIngredientName(key);
    map.set(normalizedKey, { key, alchemical });

    // Also index by the display name if different
    const displayName = (ing.name as string | undefined) ?? key;
    const normalizedDisplayName = normalizeIngredientName(displayName);
    if (normalizedDisplayName !== normalizedKey) {
      map.set(normalizedDisplayName, { key, alchemical });
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

// Lazily initialized lookup map
let _ingredientAlchemicalMap: Map<string, { key: string; alchemical: IngredientAlchemicalProperties }> | null = null;

function getIngredientAlchemicalMap() {
  if (!_ingredientAlchemicalMap) {
    _ingredientAlchemicalMap = buildIngredientAlchemicalMap();
  }
  return _ingredientAlchemicalMap;
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
  const map = getIngredientAlchemicalMap();
  const normalized = normalizeIngredientName(ingredientName);

  // 1. Exact match
  const exact = map.get(normalized);
  if (exact) return exact;

  // 2. Token-based partial matching: find map entry that shares the most tokens
  const queryTokens = new Set(normalized.split(" ").filter((t) => t.length > 2));
  if (queryTokens.size === 0) return null;

  let bestMatch: { key: string; alchemical: IngredientAlchemicalProperties } | null = null;
  let bestScore = 0;

  for (const [mapKey, value] of map.entries()) {
    const keyTokens = mapKey.split(" ").filter((t) => t.length > 2);
    let sharedCount = 0;
    for (const token of keyTokens) {
      if (queryTokens.has(token)) sharedCount++;
    }
    // Score: shared tokens / total unique tokens (Jaccard-like)
    const unionSize = new Set([...keyTokens, ...queryTokens]).size;
    const score = unionSize > 0 ? sharedCount / unionSize : 0;

    if (score > bestScore && score >= 0.3) {
      bestScore = score;
      bestMatch = value;
    }
  }

  return bestMatch;
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
