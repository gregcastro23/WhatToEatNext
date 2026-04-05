"use strict";

import { allSauces, type Sauce as DataSauce } from "@/data/sauces";
import {
  recommendSauces,
  type SauceRecommendationResult,
  type Sauce as RecommenderSauce,
} from "@/utils/cuisine/intelligentSauceRecommender";
import { sauceRecommender } from "@/services/sauceRecommender";
import type { EnhancedRecipe, ElementalProperties } from "@/types/recipe";

// ========== INPUT / OUTPUT TYPES ==========

export interface UnifiedSauceInput {
  /** If provided, extract elemental/alchemical/thermodynamic props for intelligent recommendation */
  recipe?: EnhancedRecipe;

  /** Cuisine name for simple recommender filtering */
  cuisine?: string;

  /** Protein for simple recommender */
  protein?: string;

  /** Cooking method for simple recommender */
  cookingMethod?: string;

  /** Desired sauce role — defaults to "complement" */
  role?: "complement" | "contrast" | "enhance" | "balance";

  /** Maximum results returned — defaults to 8 */
  maxResults?: number;
}

export interface UnifiedSauceResult {
  /** Sauce identifier */
  id: string;

  /** Display name */
  name: string;

  /** Description */
  description: string;

  /** Overall compatibility score (0-1) */
  compatibilityScore: number;

  /** Source of the recommendation */
  source: "intelligent" | "simple" | "merged";

  /** Full recommendation detail when available */
  detail?: SauceRecommendationResult;
}

// ========== CONVERSION HELPERS ==========

/**
 * Convert a data-layer Sauce (from @/data/sauces) into the format
 * expected by the intelligent recommender.
 */
function toRecommenderSauce(key: string, sauce: DataSauce): RecommenderSauce {
  return {
    id: key,
    name: sauce.name,
    description: sauce.description,
    keyIngredients: sauce.keyIngredients,
    elementalProperties: sauce.elementalProperties,
    alchemicalProperties: sauce.alchemicalProperties
      ? {
          Spirit: sauce.alchemicalProperties.Spirit,
          Essence: sauce.alchemicalProperties.Essence,
          Matter: sauce.alchemicalProperties.Matter,
          Substance: sauce.alchemicalProperties.Substance,
        }
      : undefined,
    thermodynamicProperties: sauce.thermodynamicProperties
      ? {
          heat: sauce.thermodynamicProperties.heat,
          entropy: sauce.thermodynamicProperties.entropy,
          reactivity: sauce.thermodynamicProperties.reactivity,
          gregsEnergy: sauce.thermodynamicProperties.gregsEnergy,
        }
      : undefined,
    cuisineAssociations: sauce.cuisine ? [sauce.cuisine] : undefined,
    nutritionalProfile: sauce.nutritionalProfile,
  };
}

/**
 * Build the full pool of recommender-formatted sauces from the data layer.
 */
function buildSaucePool(): RecommenderSauce[] {
  return Object.entries(allSauces).map(([key, sauce]) =>
    toRecommenderSauce(key, sauce),
  );
}

/**
 * Extract default elemental properties when a recipe has none.
 */
function defaultElemental(): ElementalProperties {
  return { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 };
}

// ========== CORE LOGIC ==========

/**
 * Run the intelligent recommender against the full sauce pool using
 * properties extracted from a recipe.
 */
function runIntelligentFromRecipe(
  recipe: EnhancedRecipe,
  role: "complement" | "contrast" | "enhance" | "balance",
  maxResults: number,
): SauceRecommendationResult[] {
  const pool = buildSaucePool();

  const targetElemental = recipe.elementalProperties ?? defaultElemental();

  // EnhancedRecipe.alchemicalProperties uses heat/entropy/reactivity/stability
  // which is really thermodynamic data. The ESMS alchemical data lives in mappedAlchemy.
  const targetAlchemical = recipe.mappedAlchemy ?? undefined;

  const targetThermodynamic =
    recipe.alchemicalProperties
      ? {
          heat: recipe.alchemicalProperties.heat ?? 0,
          entropy: recipe.alchemicalProperties.entropy ?? 0,
          reactivity: recipe.alchemicalProperties.reactivity ?? 0,
          gregsEnergy: 0, // Not present on EnhancedRecipe; default to 0
        }
      : undefined;

  return recommendSauces(
    {
      targetElementalProperties: targetElemental,
      targetAlchemicalProperties: targetAlchemical,
      targetThermodynamicProperties: targetThermodynamic,
      sauceRole: role,
      maxRecommendations: maxResults,
    },
    pool,
  );
}

/**
 * Run the simple cuisine-based recommender, then score results via the
 * intelligent recommender for consistent compatibility values.
 */
function runSimpleWithScoring(
  cuisine: string,
  protein: string | undefined,
  cookingMethod: string | undefined,
  role: "complement" | "contrast" | "enhance" | "balance",
): Promise<SauceRecommendationResult[]> {
  return sauceRecommender.recommendSauce(cuisine, {
    protein,
    cookingMethod,
  }).then(names => {
    if (names.length === 0) {
      return [];
    }

  // Resolve names to sauce data entries
  const nameSet = new Set(names.map((n) => n.toLowerCase()));
  const matchedPool: RecommenderSauce[] = [];

  for (const [key, sauce] of Object.entries(allSauces)) {
    if (nameSet.has(sauce.name.toLowerCase()) || nameSet.has(key.toLowerCase())) {
      matchedPool.push(toRecommenderSauce(key, sauce));
    }
  }

  if (matchedPool.length === 0) {
    // Return stub results when we cannot resolve data entries
    return names.map((name, idx) => ({
      sauce: {
        id: `simple-${idx}`,
        name,
        description: "",
        elementalProperties: defaultElemental(),
      },
      compatibilityScore: 0.5,
      compatibility: { elemental: 0.5 },
      reason: `Recommended for ${cuisine} cuisine`,
      detailedReasoning: [`Matched by cuisine: ${cuisine}`],
      enhancement: {},
    }));
  }

  // Use a neutral elemental target derived from the matched pool average
  const avgElemental: ElementalProperties = { Fire: 0, Water: 0, Earth: 0, Air: 0 };
  for (const s of matchedPool) {
    avgElemental.Fire += s.elementalProperties.Fire;
    avgElemental.Water += s.elementalProperties.Water;
    avgElemental.Earth += s.elementalProperties.Earth;
    avgElemental.Air += s.elementalProperties.Air;
  }
  const count = matchedPool.length;
  avgElemental.Fire /= count;
  avgElemental.Water /= count;
  avgElemental.Earth /= count;
  avgElemental.Air /= count;

    return recommendSauces(
      {
        targetElementalProperties: avgElemental,
        sauceRole: role,
        maxRecommendations: matchedPool.length,
      },
      matchedPool,
    );
  });
}

// ========== PUBLIC API ==========

/**
 * Unified sauce recommendation entry point.
 *
 * Combines the intelligent (elemental/alchemical/thermodynamic) recommender
 * with the simple cuisine-based recommender into a single call.
 *
 * @param input - Recommendation criteria
 * @returns Sorted array of sauce results, limited to maxResults
 */
export async function getRecommendedSauces(input: UnifiedSauceInput): Promise<UnifiedSauceResult[]> {
  const {
    recipe,
    cuisine,
    protein,
    cookingMethod,
    role = "complement",
    maxResults = 8,
  } = input;

  const hasRecipe = !!recipe;
  const hasSimpleCriteria = !!cuisine && (!!protein || !!cookingMethod);

  // Collect results from each path
  let intelligentResults: SauceRecommendationResult[] = [];
  let simpleResults: SauceRecommendationResult[] = [];

  if (hasRecipe) {
    intelligentResults = runIntelligentFromRecipe(recipe, role, maxResults);
  }

  if (hasSimpleCriteria) {
    simpleResults = await runSimpleWithScoring(cuisine, protein, cookingMethod, role);
  }

  // If neither path was triggered, return empty
  if (intelligentResults.length === 0 && simpleResults.length === 0) {
    return [];
  }

  // Merge and deduplicate — keep best score per sauce id
  const merged = new Map<string, { result: SauceRecommendationResult; source: "intelligent" | "simple" | "merged" }>();

  for (const r of intelligentResults) {
    merged.set(r.sauce.id, { result: r, source: "intelligent" });
  }

  for (const r of simpleResults) {
    const existing = merged.get(r.sauce.id);
    if (existing) {
      // Both paths found this sauce — keep best score, mark as merged
      if (r.compatibilityScore > existing.result.compatibilityScore) {
        merged.set(r.sauce.id, { result: r, source: "merged" });
      } else {
        existing.source = "merged";
      }
    } else {
      merged.set(r.sauce.id, { result: r, source: "simple" });
    }
  }

  // Convert to unified output, sort descending by score, and limit
  const results: UnifiedSauceResult[] = Array.from(merged.values())
    .map(({ result, source }) => ({
      id: result.sauce.id,
      name: result.sauce.name,
      description: result.sauce.description,
      compatibilityScore: result.compatibilityScore,
      source,
      detail: result,
    }))
    .sort((a, b) => b.compatibilityScore - a.compatibilityScore)
    .slice(0, maxResults);

  return results;
}
