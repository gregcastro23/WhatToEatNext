/**
 * Recipe Elemental Service
 *
 * Real implementation of recipe elemental operations — normalizes recipe
 * elemental properties, derives missing values from ingredients or zodiac
 * influences, and computes similarity using Euclidean distance on the
 * four-element vector.
 */

import type { ElementalProperties } from "@/types/alchemy";

const DEFAULT_ELEMENTS: ElementalProperties = {
  Fire: 0.25,
  Water: 0.25,
  Earth: 0.25,
  Air: 0.25,
};

const ZODIAC_ELEMENT: Record<string, keyof ElementalProperties> = {
  aries: "Fire",
  leo: "Fire",
  sagittarius: "Fire",
  taurus: "Earth",
  virgo: "Earth",
  capricorn: "Earth",
  gemini: "Air",
  libra: "Air",
  aquarius: "Air",
  cancer: "Water",
  scorpio: "Water",
  pisces: "Water",
};

function isFiniteNumber(x: unknown): x is number {
  return typeof x === "number" && Number.isFinite(x);
}

/**
 * Normalize a raw ElementalProperties object: clamp negatives, fill missing
 * keys, and rescale so Fire+Water+Earth+Air = 1. Returns the default balanced
 * vector when inputs are empty or all zero.
 */
export function normalizeElementalProperties(
  raw: Partial<ElementalProperties> | undefined | null,
): ElementalProperties {
  if (!raw) return { ...DEFAULT_ELEMENTS };
  const fire = Math.max(0, isFiniteNumber(raw.Fire) ? raw.Fire : 0);
  const water = Math.max(0, isFiniteNumber(raw.Water) ? raw.Water : 0);
  const earth = Math.max(0, isFiniteNumber(raw.Earth) ? raw.Earth : 0);
  const air = Math.max(0, isFiniteNumber(raw.Air) ? raw.Air : 0);
  const total = fire + water + earth + air;
  if (total === 0) return { ...DEFAULT_ELEMENTS };
  return {
    Fire: fire / total,
    Water: water / total,
    Earth: earth / total,
    Air: air / total,
  };
}

/**
 * Average an array of ElementalProperties. Empty input returns defaults.
 */
export function averageElementalProperties(
  list: Array<Partial<ElementalProperties>>,
): ElementalProperties {
  if (!list || list.length === 0) return { ...DEFAULT_ELEMENTS };
  const acc: ElementalProperties = { Fire: 0, Water: 0, Earth: 0, Air: 0 };
  let count = 0;
  for (const item of list) {
    if (!item) continue;
    acc.Fire += isFiniteNumber(item.Fire) ? item.Fire : 0;
    acc.Water += isFiniteNumber(item.Water) ? item.Water : 0;
    acc.Earth += isFiniteNumber(item.Earth) ? item.Earth : 0;
    acc.Air += isFiniteNumber(item.Air) ? item.Air : 0;
    count++;
  }
  if (count === 0) return { ...DEFAULT_ELEMENTS };
  return normalizeElementalProperties({
    Fire: acc.Fire / count,
    Water: acc.Water / count,
    Earth: acc.Earth / count,
    Air: acc.Air / count,
  });
}

interface RecipeLike {
  elementalProperties?: Partial<ElementalProperties>;
  ingredients?: Array<{
    elementalProperties?: Partial<ElementalProperties>;
  }>;
  zodiacInfluences?: string[];
  [key: string]: unknown;
}

/**
 * Derive elemental properties from a recipe-like object. Priority:
 *   1. Explicit `elementalProperties` (normalized)
 *   2. Average of ingredient elemental properties
 *   3. Zodiac influences → element proxies
 *   4. Balanced default
 */
export function deriveElementalProperties(
  recipe: RecipeLike | null | undefined,
): ElementalProperties {
  if (!recipe) return { ...DEFAULT_ELEMENTS };

  if (recipe.elementalProperties) {
    return normalizeElementalProperties(recipe.elementalProperties);
  }

  if (Array.isArray(recipe.ingredients) && recipe.ingredients.length > 0) {
    const ingredientElements = recipe.ingredients
      .map((i) => i?.elementalProperties)
      .filter((e): e is Partial<ElementalProperties> => !!e);
    if (ingredientElements.length > 0) {
      return averageElementalProperties(ingredientElements);
    }
  }

  if (Array.isArray(recipe.zodiacInfluences) && recipe.zodiacInfluences.length > 0) {
    const acc: ElementalProperties = { Fire: 0, Water: 0, Earth: 0, Air: 0 };
    for (const sign of recipe.zodiacInfluences) {
      const el = ZODIAC_ELEMENT[sign?.toLowerCase?.() ?? ""];
      if (el) acc[el] += 1;
    }
    const total = acc.Fire + acc.Water + acc.Earth + acc.Air;
    if (total > 0) return normalizeElementalProperties(acc);
  }

  return { ...DEFAULT_ELEMENTS };
}

/**
 * Cosine-similarity-free Euclidean similarity on the 4-element vector.
 * Range [0, 1]: 1 = identical distribution, 0 = maximally opposed.
 */
export function calculateElementalSimilarity(
  a: Partial<ElementalProperties> | null | undefined,
  b: Partial<ElementalProperties> | null | undefined,
): number {
  const pa = normalizeElementalProperties(a);
  const pb = normalizeElementalProperties(b);
  let sq = 0;
  (["Fire", "Water", "Earth", "Air"] as const).forEach((el) => {
    const diff = pa[el] - pb[el];
    sq += diff * diff;
  });
  const distance = Math.sqrt(sq);
  // Max distance across normalized 4-vectors summing to 1 is sqrt(2).
  const maxDistance = Math.SQRT2;
  const similarity = 1 - distance / maxDistance;
  return Math.max(0, Math.min(1, similarity));
}

export class RecipeElementalService {
  /**
   * Static entry point used by callers that don't want an instance.
   */
  static calculateElementalProperties(recipe: RecipeLike): ElementalProperties {
    return deriveElementalProperties(recipe);
  }

  /**
   * Return the recipe with a `.elementalProperties` field guaranteed present
   * and normalized. Non-destructive for the rest of the recipe shape.
   */
  standardizeRecipe<T extends RecipeLike>(
    recipe: T,
  ): T & { elementalProperties: ElementalProperties } {
    const elementalProperties = deriveElementalProperties(recipe);
    return { ...recipe, elementalProperties };
  }

  deriveElementalProperties(recipe: RecipeLike): ElementalProperties {
    return deriveElementalProperties(recipe);
  }

  /**
   * Similarity accepts either a pair of ElementalProperties or a pair of
   * recipe-like objects. This keeps the signature compatible with the
   * original stub which was often called with either.
   *
   * Per the project's elemental philosophy, different elements never oppose
   * each other — "all combinations work" with 0.7+ compatibility (see
   * CLAUDE.md). We therefore compress the raw Euclidean similarity from
   * [0, 1] into [0.7, 1.0]. The unfloored metric remains available via the
   * free function `calculateElementalSimilarity` for analytics use.
   */
  calculateSimilarity(
    a: RecipeLike | Partial<ElementalProperties> | null | undefined,
    b: RecipeLike | Partial<ElementalProperties> | null | undefined,
  ): number {
    const ea = a && "ingredients" in (a as RecipeLike)
      ? deriveElementalProperties(a as RecipeLike)
      : normalizeElementalProperties(a as Partial<ElementalProperties>);
    const eb = b && "ingredients" in (b as RecipeLike)
      ? deriveElementalProperties(b as RecipeLike)
      : normalizeElementalProperties(b as Partial<ElementalProperties>);
    const raw = calculateElementalSimilarity(ea, eb);
    return 0.7 + raw * 0.3;
  }

  /**
   * Returns the dominant element key or "Fire" when the input is flat.
   */
  getDominantElement(
    props: Partial<ElementalProperties> | null | undefined,
  ): keyof ElementalProperties {
    const normalized = normalizeElementalProperties(props);
    const entries = (Object.entries(normalized) as Array<
      [keyof ElementalProperties, number]
    >);
    return entries.reduce((a, b) => (a[1] > b[1] ? a : b))[0];
  }
}

// Export singleton instance for compatibility
export const recipeElementalService = new RecipeElementalService();
