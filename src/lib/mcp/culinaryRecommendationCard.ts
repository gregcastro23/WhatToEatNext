/**
 * @file src/lib/mcp/culinaryRecommendationCard.ts
 *
 * Card formatting and sensory checkpoints for culinary recommendations.
 */
import type { Recipe } from "@/types/recipe";
import type { ToolResult } from "./culinaryCommon";

export interface ProfileFiltersResult {
  profileLoaded: boolean;
  ignored: boolean;
  excludedAllergens: string[];
  dietaryFrameworks: string[];
  dislikedIngredients: string[];
}

export interface ScoredRecipe {
  recipe: Recipe;
  score: number;
  dominantElement: string;
  matchedIngs: string[];
  missingIngs: string[];
}

export interface RecommendationCard {
  id: string;
  name: string;
  cuisine: string | null;
  prepTimeMinutes: number;
  cookTimeMinutes: number;
  totalTimeMinutes: number;
  servings: number;
  matchScore: number;
  matchedIngredients: string[];
  missingIngredients: string[];
  flavorStar: Record<string, number>;
  finishingTouch: string;
  sensoryCheckpoints: string[];
  zeroWasteTip: string;
  resourceUri: string;
}

export function getFinishingTouch(element: string): string {
  if (element === "Fire") {
    return "Finish with a swirl of chili-infused extra virgin oil and fresh lemon zest to heighten thermal contrast.";
  }
  if (element === "Water") {
    return "Finish with a gentle drizzle of cold-pressed oil and fine sea salt to preserve delicate cohesive moisture.";
  }
  if (element === "Earth") {
    return "Finish with toasted pepitas and aged balsamic reduction for grounding crunch and umami.";
  }
  if (element === "Air") {
    return "Finish with freshly torn soft herbs (dill, parsley, or chives) to release aromatic volatile oils.";
  }
  return "Finish with flaky sea salt and cracked black pepper right before serving.";
}

export function formatRecommendationCard(
  scored: ScoredRecipe,
  servings: number | null,
  totalMins: number,
): RecommendationCard {
  const { recipe: r, score, dominantElement: rDom, matchedIngs, missingIngs } = scored;
  const prepMins = Math.round(totalMins * 0.4);
  const cookMins = totalMins - prepMins;
  const props = r.elementalProperties;

  const flavorStar = {
    sweet: Math.round((props.Earth * 0.7 + props.Water * 0.3) * 100) / 100,
    salty: Math.round((props.Water * 0.6 + props.Earth * 0.4) * 100) / 100,
    sour: Math.round((props.Air * 0.7 + props.Fire * 0.3) * 100) / 100,
    bitter: Math.round((props.Fire * 0.5 + props.Air * 0.5) * 100) / 100,
    umami: Math.round((props.Earth * 0.5 + props.Water * 0.5) * 100) / 100,
  };

  return {
    id: r.id,
    name: r.name,
    cuisine: r.cuisine ?? null,
    prepTimeMinutes: prepMins,
    cookTimeMinutes: cookMins,
    totalTimeMinutes: totalMins,
    servings: servings ?? r.numberOfServings ?? 4,
    matchScore: score,
    matchedIngredients: matchedIngs,
    missingIngredients: missingIngs,
    flavorStar,
    finishingTouch: getFinishingTouch(rDom),
    sensoryCheckpoints: [
      "Aromatics soften and release fragrance into the cooking fat without burning",
      "Liquid reduces until bubbles turn glossy and sauce clings lightly to the back of a spoon",
      "Rest off heat for 2-3 minutes before plating so flavors coalesce seamlessly",
    ],
    zeroWasteTip:
      "Save vegetable peelings, mushroom stems, and allium trimmings in a freezer container to simmer into homemade mineral stock.",
    resourceUri: `alchm://recipes/${r.id}`,
  };
}

export function buildWhatToCookResult(
  safeCount: number,
  recommendations: RecommendationCard[],
  appliedProfileFilters: ProfileFiltersResult,
  dominantElement: string,
  solarReturnMeta: { year: number; moment: string; matchedCuisines: string[]; dominantElement: string } | null,
): ToolResult {
  return {
    ok: true,
    data: {
      totalCandidates: safeCount,
      dominantElement,
      appliedProfileFilters,
      recommendations,
      solarReturn: solarReturnMeta,
    },
    summary: {
      totalCandidates: safeCount,
      returnedCount: recommendations.length,
      dominantElement,
      topRecommendation: recommendations[0]?.name ?? null,
      ...(solarReturnMeta ? { solarReturnYear: solarReturnMeta.year } : {}),
    },
  };
}

