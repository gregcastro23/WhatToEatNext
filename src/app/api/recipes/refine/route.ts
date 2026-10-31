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
import { _logger } from "@/lib/logger";
import { filterRecipes } from "@/lib/recipes/catalogQuery";
import { loadCanonicalCatalog, withAuthoredFactsAll } from "@/lib/recipes/recipeRefResolver";
import { RecipeRefineRequestSchema } from "@/lib/validation/apiSchemas";
import { PlanetaryScoringService } from "@/services/planetaryScoring";
import { tokenEconomy } from "@/services/TokenEconomyService";
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

    let rawBody: unknown;
    try {
      rawBody = await request.json();
    } catch {
      return NextResponse.json({ success: false, error: "Invalid JSON in request body" }, { status: 400 });
    }
    const parsed = RecipeRefineRequestSchema.safeParse(rawBody);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: "Invalid request", details: parsed.error.flatten().fieldErrors },
        { status: 400 },
      );
    }
    const { cuisine } = parsed.data;

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

    // Every recipe of the cuisine is a candidate, from the same catalog and
    // cuisine matching as the recipe list. Nothing is capped: with positions
    // cached, scoring is arithmetic (13 ms for all 1,113 recipes).
    const recipes = filterRecipes(await loadCanonicalCatalog(), { cuisine: cuisine ?? null });

    // Score recipes with high precision (simulated by adding a transit multiplier)
    const scoringService = PlanetaryScoringService.getInstance();
    // Warm the shared position cache once. Every scoreRecipe awaits it, and
    // without a warm-up N concurrent calls make N position requests.
    await scoringService.getCurrentPlanetaryPositions();
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
      // Top 10 refined recommendations, with their authored times and meal
      recipes: await withAuthoredFactsAll(scoredRecipes.slice(0, 10)),
      balances: newBalances,
    });
  } catch (error) {
    _logger.error("[recipes/refine] Error:", error);
    return NextResponse.json({ success: false, error: "Failed to refine recipes" }, { status: 500 });
  }
}
