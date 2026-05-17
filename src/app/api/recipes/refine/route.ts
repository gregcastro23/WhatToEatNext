/**
 * POST /api/recipes/refine
 * Spends Substance (🝉) tokens to get a high-precision recommendation based on current transits.
 */
import { NextResponse } from "next/server";
import { getDatabaseUserFromRequest } from "@/lib/auth/validateRequest";
import {
  applyPersonalizedPricing,
  getPersonalizedPricingContext,
} from "@/lib/economy/livePricing";
import { OPERATION_COSTS } from "@/lib/economy/operationCosts";
import { PlanetaryScoringService } from "@/services/planetaryScoring";
import { tokenEconomy } from "@/services/TokenEconomyService";
import type { Recipe } from "@/types/recipe";
import { getCapitalizedNatalPositions } from "@/utils/astrology/chartDataUtils";
import type { NextRequest } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const user = await getDatabaseUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    // Throttling: Substance token spend (debited below) is the economic gate.
    // No per-minute rate cap — logged-in users are paced by their token balance.

    const body = await request.json().catch(() => ({}));
    const { cuisine } = body;

    // Personalised live pricing: even though refine debits only Substance, run
    // it through the same chart × current-sky multiplier so the economy stays
    // self-consistent. A user the universe says Substance is hard to come by
    // for right now feels that friction here too.
    const baseSubstance = OPERATION_COSTS.refine_oracle.substance ?? 0;
    const natalPositions = getCapitalizedNatalPositions(user.profile?.natalChart);
    const pricing = await getPersonalizedPricingContext(natalPositions);
    const { substance: liveSubstance } = applyPersonalizedPricing(
      { spirit: 0, essence: 0, matter: 0, substance: baseSubstance },
      pricing,
    );

    const deductResult = await tokenEconomy.debitTokens(
      user.id,
      "Substance",
      liveSubstance,
      "purchase",
      {
        description: pricing.personalized
          ? `Refined Oracle Recommendation (live x${pricing.multiplier.toFixed(2)} · personalized)`
          : `Refined Oracle Recommendation (live x${pricing.multiplier.toFixed(2)})`,
      },
    );
    if (!deductResult) {
      return NextResponse.json(
        {
          success: false,
          error: `Insufficient Substance (🝉) tokens. You need ${liveSubstance.toFixed(2)} Substance right now${pricing.personalized ? " (your chart's rate)" : ""}.`,
          liveCost: { substance: liveSubstance },
          pricing,
        },
        { status: 402 }
      );
    }

    // Fetch recipes for the cuisine
    const { LocalRecipeService } = await import("@/services/LocalRecipeService");
    
    let recipes: Recipe[] = [];
    if (cuisine) {
      recipes = await LocalRecipeService.getRecipesByCuisine(cuisine);
    } else {
      recipes = await LocalRecipeService.getAllRecipes();
    }
    
    // Limit to 50 for scoring performance
    recipes = recipes.slice(0, 50);

    // Score recipes with high precision (simulated by adding a transit multiplier)
    const scoringService = PlanetaryScoringService.getInstance();
    const scoredRecipes = await Promise.all(
      recipes.map(async (recipe) => {
        try {
          const result = await scoringService.scoreRecipe(recipe);
          return {
            ...recipe,
            score: (result.overallScore || 0) * 1.25, // 25% precision boost
            planetaryScore: result.overallScore,
            planetaryReason: `[ORACLE REFINED] ${result.planetaryReason}`,
            recommendedTiming: result.recommendedTiming,
            rulingPlanet: result.rulingPlanet,
          };
        } catch {
          return { ...recipe, score: 50 };
        }
      })
    );

    scoredRecipes.sort((a, b) => (b.score ?? 0) - (a.score ?? 0));

    const newBalances = await tokenEconomy.getBalances(user.id);

    return NextResponse.json({
      success: true,
      recipes: scoredRecipes.slice(0, 10), // Top 10 refined recommendations
      balances: newBalances,
    });
  } catch (error) {
    console.error("[recipes/refine] Error:", error);
    return NextResponse.json({ success: false, error: "Failed to refine recipes" }, { status: 500 });
  }
}
