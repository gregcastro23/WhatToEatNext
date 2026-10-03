/**
 * Shared mint-quote builder — SERVER ONLY. Used by both the featured-recipe GET
 * quote and the generic POST quote so the cost logic never drifts.
 */

import { getPersonalizedPricingContext } from "@/lib/economy/livePricing";
import {
  getPlanetaryRulers,
  tryGetCurrentSwapRates,
} from "@/lib/economy/swapRates";
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

  // Redistribution converts at live EEI parity. When the oracle cannot price
  // the sky there is no rate to convert at, so every variant is the flat cost —
  // shown as-is rather than converted at a guessed rate.
  const swap = tryGetCurrentSwapRates();
  const redistributePreview = swap
    ? buildRedistributePreview(live, swap)
    : { Spirit: { ...live }, Essence: { ...live }, Matter: { ...live }, Substance: { ...live } };
  const rulers = swap ?? getPlanetaryRulers();

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
        rulingHourPlanet: rulers.rulingHourPlanet,
        rulingDayPlanet: rulers.rulingDayPlanet,
        // No live sheet → nothing to hold the preview to; it is already stale.
        validUntil: swap?.validUntil ?? pricing.timestamp,
      },
    },
  };
}
