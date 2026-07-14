/**
 * Shared mint-quote builder — SERVER ONLY. Used by both the featured-recipe GET
 * quote and the generic POST quote so the cost logic never drifts.
 */

import { getPersonalizedPricingContext } from "@/lib/economy/livePricing";
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
 * flat four-coin cost, and the premium chart-weighted redistribution preview
 * for each possible dominant coin.
 *
 * Every recipe costs exactly TARGET_ESMS (20) to mint: the fingerprint totals
 * are normalized to that target, and the live sky × chart multiplier is
 * intentionally NOT applied to the mint cost — so `liveCost` equals `baseCost`.
 * The pricing context is still surfaced (aNumber, dominant element) for display,
 * but the charged/quoted cost is flat.
 */
export async function buildMintQuote(
  recipe: MintableRecipe,
  natalPositions?: Record<string, string> | null,
): Promise<RecipeMintQuote> {
  const fingerprint = computeRecipeFingerprint(recipe);
  const base = baseMintCost(fingerprint);

  const pricing = await getPersonalizedPricingContext(natalPositions ?? null);
  const live = base; // flat cost — multiplier intentionally bypassed

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
        // Multiplier is not applied to mint cost — reported as 1 (flat) so the
        // UI never implies a floating price.
        multiplier: 1,
        aNumber: pricing.aNumber,
        dominantElement: pricing.dominantElement,
        personalized: false,
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
