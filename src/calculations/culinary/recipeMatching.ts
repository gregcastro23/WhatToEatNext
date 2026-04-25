/**
 * Recipe Matching Module
 *
 * Computes real compatibility scores between a recipe and the caller's
 * astrological / elemental state. Combines three signals:
 *
 *   elemental   — Euclidean similarity between the recipe's elemental
 *                 properties and the current dominant elements
 *   temporal    — alignment with the active season (derived from the
 *                 lunar phase + current month) if metadata is available
 *   astrological — overlap between the recipe's zodiac/planet influences
 *                 and the current astrological state
 *
 * The function never throws. Missing inputs fall through to neutral (0.5)
 * scores for that axis so partial data still yields usable results.
 */

import {
  calculateElementalSimilarity,
  deriveElementalProperties,
  normalizeElementalProperties,
} from "@/services/RecipeElementalService";
import type { AstrologicalState, ElementalProperties } from "@/types/alchemy";
import type { Recipe } from "@/types/recipe";

export interface RecipeCompatibilityResult {
  score: number;
  factors: {
    elemental: number;
    temporal: number;
    astrological: number;
  };
  recommendations: string[];
}

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

/**
 * Extract the state's reference elemental properties. Prefers explicit
 * `domElements` / `elementalInfluence`; falls back to translating the current
 * zodiac into its element, or to balanced defaults.
 */
function deriveStateElements(
  state: AstrologicalState | null | undefined,
): ElementalProperties {
  if (!state) return { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 };
  const anyState = state as AstrologicalState & {
    elementalInfluence?: ElementalProperties;
  };
  if (anyState.domElements) {
    const d = anyState.domElements as unknown as Record<string, number>;
    return normalizeElementalProperties({
      Fire: d.Fire,
      Water: d.Water,
      Earth: d.Earth,
      Air: d.Air,
    });
  }
  if (anyState.elementalInfluence) {
    const d = anyState.elementalInfluence as unknown as Record<string, number>;
    return normalizeElementalProperties({
      Fire: d.Fire,
      Water: d.Water,
      Earth: d.Earth,
      Air: d.Air,
    });
  }
  const zodiac =
    (anyState.currentZodiac ?? (anyState as { zodiacSign?: string }).zodiacSign ?? "")
      .toString()
      .toLowerCase();
  if (zodiac && ZODIAC_ELEMENT[zodiac]) {
    const el = ZODIAC_ELEMENT[zodiac];
    return normalizeElementalProperties({ [el]: 1 });
  }
  return { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 };
}

/**
 * Temporal alignment score: did the recipe's declared season match the
 * current date's season? 1.0 = match, 0.6 = adjacent season, 0.3 = opposite.
 */
function calculateTemporalScore(recipe: Recipe, now: Date = new Date()): number {
  const month = now.getMonth(); // 0-11
  const currentSeason =
    month >= 2 && month <= 4
      ? "spring"
      : month >= 5 && month <= 7
        ? "summer"
        : month >= 8 && month <= 10
          ? "autumn"
          : "winter";

  const seasons = (recipe as Recipe & {
    season?: string | string[];
    currentSeason?: string | string[];
  }).season
    ?? (recipe as Recipe & { currentSeason?: string | string[] }).currentSeason;
  if (!seasons) return 0.7; // neutral-positive when unlabeled

  const list = Array.isArray(seasons) ? seasons : [seasons];
  const normalized = list.map((s) => s?.toString().toLowerCase());
  if (normalized.includes(currentSeason) || normalized.includes("all")) {
    return 1.0;
  }
  const adjacency: Record<string, string[]> = {
    spring: ["summer", "winter"],
    summer: ["spring", "autumn"],
    autumn: ["summer", "winter"],
    winter: ["autumn", "spring"],
  };
  if (normalized.some((s) => s && adjacency[currentSeason]?.includes(s))) {
    return 0.65;
  }
  return 0.35;
}

/**
 * Astrological overlap between the recipe's declared influences and the
 * current state's zodiac + active planets. Uses Jaccard-style overlap when
 * we have sets, falls back to zodiac-element match otherwise.
 */
function calculateAstrologicalScore(
  recipe: Recipe,
  state: AstrologicalState | null | undefined,
): number {
  if (!state) return 0.5;
  const recipeZodiac: string[] = (
    (recipe as Recipe & { zodiacInfluences?: string[] }).zodiacInfluences ?? []
  ).map((z) => z?.toString().toLowerCase());
  const recipePlanets: string[] = (
    (recipe as Recipe & { planetaryInfluences?: string[] | { favorable?: string[] } })
      .planetaryInfluences as string[]
      ?? []
  ).map?.((p: string) => p?.toString().toLowerCase()) ?? [];

  const stateZodiac = (state.currentZodiac ?? (state as { zodiacSign?: string }).zodiacSign ?? "")
    .toString()
    .toLowerCase();
  const statePlanets: string[] = (state.activePlanets ?? []).map((p) =>
    p.toString().toLowerCase(),
  );

  let score = 0.5;
  let signals = 0;

  if (recipeZodiac.length > 0 && stateZodiac) {
    signals++;
    if (recipeZodiac.includes(stateZodiac)) {
      score += 0.4;
    } else {
      // Same element counts for partial credit
      const stateEl = ZODIAC_ELEMENT[stateZodiac];
      const hasElementMatch = recipeZodiac.some(
        (z) => ZODIAC_ELEMENT[z] === stateEl,
      );
      if (hasElementMatch) score += 0.2;
    }
  }

  if (recipePlanets.length > 0 && statePlanets.length > 0) {
    signals++;
    const intersect = recipePlanets.filter((p) =>
      statePlanets.includes(p),
    ).length;
    const union = new Set([...recipePlanets, ...statePlanets]).size;
    const jaccard = union === 0 ? 0 : intersect / union;
    score += jaccard * 0.4;
  }

  if (signals === 0) return 0.5;
  return Math.max(0, Math.min(1, score));
}

function buildRecommendations(
  factors: RecipeCompatibilityResult["factors"],
  recipe: Recipe,
): string[] {
  const recs: string[] = [];
  if (factors.elemental >= 0.85) {
    recs.push(`${recipe.name} mirrors today's elemental profile closely.`);
  } else if (factors.elemental < 0.4) {
    recs.push(
      `Consider a recipe whose elements shift the current imbalance rather than deepen it.`,
    );
  }
  if (factors.temporal >= 0.9) {
    recs.push(`In season right now — freshness peaks in this window.`);
  } else if (factors.temporal < 0.4) {
    recs.push(
      `Out-of-season ingredients may be weaker; consider a seasonal swap.`,
    );
  }
  if (factors.astrological >= 0.8) {
    recs.push(`Strong planetary alignment — the sky favors this dish.`);
  }
  if (factors.astrological < 0.4 && factors.elemental < 0.5) {
    recs.push(`Low overall alignment; save for another day.`);
  }
  return recs;
}

/**
 * Calculate compatibility between a recipe and astrological state.
 */
export function calculateRecipeCompatibility(
  recipe: Recipe,
  state: AstrologicalState | null | undefined,
): RecipeCompatibilityResult {
  try {
    const recipeElements = deriveElementalProperties(recipe as any);
    const stateElements = deriveStateElements(state);

    // Compress raw similarity into [0.7, 1.0] so this helper honors the
    // project's "no opposing elements" rule — different elements always
    // remain compatible (see CLAUDE.md → Elemental Logic Principles).
    const rawElementalScore = calculateElementalSimilarity(
      recipeElements,
      stateElements,
    );
    const elementalScore = 0.7 + rawElementalScore * 0.3;
    const temporalScore = calculateTemporalScore(recipe);
    const astrologicalScore = calculateAstrologicalScore(recipe, state);

    // Weighted blend — elemental dominates because it's the most direct match
    const totalScore =
      elementalScore * 0.5 + temporalScore * 0.2 + astrologicalScore * 0.3;

    const factors = {
      elemental: elementalScore,
      temporal: temporalScore,
      astrological: astrologicalScore,
    };

    return {
      score: Math.max(0, Math.min(1, totalScore)),
      factors,
      recommendations: buildRecommendations(factors, recipe),
    };
  } catch {
    // Never throw from a scoring helper — return neutral result.
    return {
      score: 0.5,
      factors: { elemental: 0.5, temporal: 0.5, astrological: 0.5 },
      recommendations: [],
    };
  }
}

export default {
  calculateRecipeCompatibility,
};
