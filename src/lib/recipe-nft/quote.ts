/**
 * Shared mint-quote builder — SERVER ONLY. Used by both the featured-recipe GET
 * quote and the generic POST quote so the cost logic never drifts.
 */

import { applyPersonalizedPricing, getPersonalizedPricingContext } from "@/lib/economy/livePricing";
import { getCurrentSwapRates } from "@/lib/economy/swapRates";
import { recipeNftEnabled } from "./contract";
import { baseMintCost, buildRedistributePreview } from "./cost";
import { computeRecipeFingerprint } from "./fingerprint";
import type { MintableRecipe } from "./mintableRecipe";
import type { MintQuote, RecipeFingerprint } from "./types";

export interface RecipeMintQuote {
  recipeId: string;
  title: string;
  enabled: boolean;
  fingerprint: RecipeFingerprint;
  quote: MintQuote;
}

/**
 * Compute the full mint quote for a recipe: its alchemical fingerprint, the
 * base + live (sky × optional chart) four-coin cost, and the premium
 * chart-weighted redistribution preview for each possible dominant coin.
 */
export async function buildMintQuote(
  recipe: MintableRecipe,
  natalPositions?: Record<string, string> | null,
): Promise<RecipeMintQuote> {
  const fingerprint = computeRecipeFingerprint(recipe);
  const base = baseMintCost(fingerprint);

  const pricing = await getPersonalizedPricingContext(natalPositions ?? null);
  const live = applyPersonalizedPricing(base, pricing);

  const swap = getCurrentSwapRates();
  const redistributePreview = buildRedistributePreview(live, swap);

  return {
    recipeId: recipe.id,
    title: recipe.title,
    enabled: recipeNftEnabled(),
    fingerprint,
    quote: {
      baseCost: base,
      liveCost: live,
      redistributePreview,
      pricing: {
        multiplier: pricing.multiplier,
        aNumber: pricing.aNumber,
        dominantElement: pricing.dominantElement,
        personalized: pricing.personalized,
        timestamp: pricing.timestamp,
      },
      swap: {
        rulingHourPlanet: swap.rulingHourPlanet,
        rulingDayPlanet: swap.rulingDayPlanet,
        validUntil: swap.validUntil,
      },
    },
  };
}
