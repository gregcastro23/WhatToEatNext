/**
 * POST /api/generate-cosmic-recipe
 * Requests a structured cosmic recipe using the planetary_agents microservice.
 * Uses the cosmicRecipeSchema for structured output.
 */
import { z } from "zod";
import { gateDemoOrAuth } from "@/lib/auth/demoAccess";
import {
  applyPersonalizedPricing,
  getPersonalizedPricingContext,
} from "@/lib/economy/livePricing";
import { withObservability } from "@/lib/observability/withObservability";
import { foodDiaryService } from "@/services/FoodDiaryService";
import { getCachedHistoricalStats } from "@/services/HistoricalStatsService";
import { reportQuestEventBestEffort } from "@/services/questEventReporter";
import { alchemize } from "@/services/RealAlchemizeService";
import { subscriptionService } from "@/services/subscriptionService";
import { tokenEconomy } from "@/services/TokenEconomyService";
import { getCapitalizedNatalPositions } from "@/utils/astrology/chartDataUtils";
import { getAccuratePlanetaryPositions } from "@/utils/astrology/positions";
import {
  SIGN_TO_ELEMENT,
  getDominantElementFromPositions,
  type ClassicalElement,
} from "@/utils/astrology/signElement";
import {
  getCuisineEntry,
  normalizeCuisineName,
} from "@/utils/cuisine/cuisineIndex";
import { findTopIngredientsForElement } from "@/utils/ingredient/ingredientIndex";
import { calculateAlchemicalFromPlanets } from "@/utils/planetaryAlchemyMapping";
import type { NextRequest } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const maxDuration = 60;

const birthDataSchema = z
  .object({
    dateTime: z.string().min(1).optional(),
    latitude: z.number().finite().optional(),
    longitude: z.number().finite().optional(),
  })
  .passthrough()
  .optional();

const cosmicRecipeBodySchema = z.object({
  prompt: z.string().trim().max(2000).optional(),
  diet: z.string().trim().max(200).optional(),
  ingredients_main: z.array(z.string().max(80)).max(40).optional(),
  disallowed_ingredients: z.array(z.string().max(80)).max(40).optional(),
  birthData: birthDataSchema,
  preferredCuisine: z.string().trim().max(80).optional(),
});

async function handlePost(request: NextRequest) {
  // Auth'd users → token economy (Spirit/Essence per cosmic recipe) is the throttle.
  // Anonymous → 2 demo cosmic recipes per IP per day, then sign-in nudge.
  const access = await gateDemoOrAuth(request, {
    dailyDemoQuota: 2,
    feature: "cosmic recipe",
  });
  if (access.mode === "denied") return access.blocked;

  // Auth'd path: token economy is the throttle. Premium users skip the
  // shop-item debit but everyone else pays personalized live pricing — the
  // user's natal chart × the chart of the moment shapes the per-token cost.
  if (access.mode === "auth") {
    const userId = access.userId;

    const sub = await subscriptionService.getUserSubscription(userId);
    const isPremium = sub?.tier === "premium";

    if (!isPremium) {
      const item = await tokenEconomy.getShopItem("unlock-cosmic-recipe");
      if (!item || !item.isActive) {
        return new Response(JSON.stringify({
          error: "shop_item_unavailable",
          message: "Cosmic recipe unlock is not configured.",
        }), {
          status: 500,
          headers: { "Content-Type": "application/json" },
        });
      }

      // Fetch natal chart for per-user pricing. Falls back to global multiplier
      // when the user hasn't onboarded a chart yet.
      const { userDatabase } = await import("@/services/userDatabaseService");
      const dbUser = await userDatabase.getUserById(userId);
      const natalPositions = getCapitalizedNatalPositions(dbUser?.profile?.natalChart);

      const pricing = await getPersonalizedPricingContext(natalPositions);
      const liveCost = applyPersonalizedPricing(
        {
          spirit: item.costSpirit,
          essence: item.costEssence,
          matter: item.costMatter,
          substance: item.costSubstance,
        },
        pricing,
      );

      const purchase = await tokenEconomy.purchaseShopItem(userId, "unlock-cosmic-recipe", {
        overrideCosts: liveCost,
        descriptionSuffix: pricing.personalized
          ? `live x${pricing.multiplier.toFixed(2)} · personalized`
          : `live x${pricing.multiplier.toFixed(2)}`,
      });
      if (!purchase.success && purchase.reason !== "already_owned") {
        return new Response(JSON.stringify({
          error: "Insufficient tokens",
          message: `Cosmic recipes require ${liveCost.spirit.toFixed(2)} Spirit and ${liveCost.essence.toFixed(2)} Essence right now${pricing.personalized ? " (your chart's rate)" : ""}. Earn more via the daily Cosmic Yield or upgrade to Premium!`,
          liveCost,
          pricing,
        }), {
          status: 402,
          headers: { "Content-Type": "application/json" },
        });
      }
    }

    // Cosmic recipes count toward both the generic "Culinary Explorer" tiers
    // and the one-shot "Cosmic Chef" premium quest.
    await reportQuestEventBestEffort(userId, "generate_recipe");
    await reportQuestEventBestEffort(userId, "generate_premium_recipe");
  }

  // Beyond this point, both auth and demo paths build the same prompt and call
  // the agents network. Demo users skip personalization that requires a userId
  // (food history note) but still see the wow grounding payload.
  const demoMode = access.mode === "demo";
  const userId: string | null = access.mode === "auth" ? access.userId : null;

  const rawBody = await request.json().catch(() => null);
  if (!rawBody || typeof rawBody !== "object") {
    return new Response(
      JSON.stringify({ error: "invalid_request", message: "Request body must be JSON." }),
      { status: 400, headers: { "Content-Type": "application/json" } },
    );
  }
  const parsed = cosmicRecipeBodySchema.safeParse(rawBody);
  if (!parsed.success) {
    return new Response(
      JSON.stringify({
        error: "invalid_request",
        message: "Recipe input failed validation.",
        issues: parsed.error.issues.slice(0, 5).map((i) => ({
          path: i.path.join("."),
          message: i.message,
        })),
      }),
      { status: 400, headers: { "Content-Type": "application/json" } },
    );
  }
  const {
    prompt,
    diet,
    ingredients_main: ingredientsMain,
    disallowed_ingredients: disallowedIngredients,
    birthData,
    preferredCuisine,
  } = parsed.data;

  // Get current sky for context
  const raw = getAccuratePlanetaryPositions(new Date());
  const skySnapshot: string[] = [];
  Object.entries(raw).slice(0, 6).forEach(([planet, pos]) => {
    const sign = typeof pos.sign === "string" ? pos.sign : String(pos.sign);
    skySnapshot.push(`${planet} in ${sign}${pos.isRetrograde ? " (R)" : ""}`);
  });
  const dominantElement: ClassicalElement = getDominantElementFromPositions(
    raw,
  );

  const currentSky = skySnapshot.join(", ");
  const birthChartNote = birthData
    ? `The user's birth data: ${JSON.stringify(birthData)}.`
    : "No birth chart provided; base recommendations on current sky only.";

  // ----- Indexed grounding -----
  // Pull real statistical + culinary data so the LLM is anchored to the
  // project's curated cuisine signatures and ingredient elemental profile
  // rather than hallucinating correspondences from its pretraining.

  const cuisineName = preferredCuisine ? normalizeCuisineName(preferredCuisine) : "";
  const cuisineEntry = cuisineName ? getCuisineEntry(cuisineName) : null;

  const topIngredients = findTopIngredientsForElement(dominantElement, 8).map((i) => i.name);

  const cuisineSignatureLines =
    cuisineEntry?.signatures?.slice(0, 4).map((sig) => {
      const direction = sig.zscore >= 0 ? "elevated" : "reduced";
      return `${sig.property} ${direction} (z=${sig.zscore.toFixed(2)}, ${sig.strength})`;
    }) ?? [];

  const planetaryPatternLines =
    cuisineEntry?.planetaryPatterns?.slice(0, 4).map((pattern) => {
      const topSign = pattern.commonSigns?.[0];
      const element = topSign ? SIGN_TO_ELEMENT[String(topSign.sign).toLowerCase()] ?? "" : "";
      return `${pattern.planet}${topSign ? ` usually in ${topSign.sign}${element ? ` (${element})` : ""}` : ""}`;
    }) ?? [];

  const groundingLines: string[] = [];
  if (cuisineEntry) {
    groundingLines.push(
      `Selected cuisine: ${cuisineEntry.cuisine} (n=${cuisineEntry.sampleSize} recipes).`,
    );
    if (cuisineSignatureLines.length > 0) {
      groundingLines.push(`Cuisine signatures: ${cuisineSignatureLines.join("; ")}.`);
    }
    if (planetaryPatternLines.length > 0) {
      groundingLines.push(`Cuisine planetary patterns: ${planetaryPatternLines.join("; ")}.`);
    }
  }
  if (topIngredients.length > 0) {
    groundingLines.push(
      `Project-indexed ingredients strongest in ${dominantElement}: ${topIngredients.join(", ")}.`,
    );
  }

  // Fetch recent history for personalization (auth path only — demo users
  // have no diary to draw from, and the LLM still gets the current-sky context).
  const recentEntries = userId
    ? await foodDiaryService.getEntries(userId, { limit: 10 })
    : [];
  const recentFoods = recentEntries.map(e => e.foodName).join(", ");
  const historyNote = recentFoods
    ? `User recently consumed: ${recentFoods}. Ensure variety or complementary pairings.`
    : "";

  // Inject Alchemical Z-Score Rarity Matrix
  const planetarySigns: Record<string, string> = {};
  const normalizedPositions: Record<string, any> = {};
  Object.entries(raw).forEach(([planet, pos]) => {
    const p = pos as any;
    planetarySigns[planet] = typeof p.sign === "string" ? p.sign : String(p.sign);
    normalizedPositions[planet] = {
      sign: String(p.sign ?? "").toLowerCase(),
      degree: Number(p.degree) || 0,
      minute: Number(p.minute) || 0,
      isRetrograde: Boolean(p.isRetrograde),
    };
  });
  const esms = calculateAlchemicalFromPlanets(planetarySigns);
  const alchemized = alchemize(normalizedPositions);
  const stats = await getCachedHistoricalStats();

  const formatZ = (val: number, stat?: { mean: number, stdDev: number }) => {
    if (!stat || stat.stdDev === 0) return "Average";
    const z = (val - stat.mean) / stat.stdDev;
    if (z > 2.0) return `Extreme High (+${z.toFixed(2)}σ)`;
    if (z > 1.0) return `Elevated (+${z.toFixed(2)}σ)`;
    if (z < -2.0) return `Extreme Low (${z.toFixed(2)}σ)`;
    if (z < -1.0) return `Reduced (${z.toFixed(2)}σ)`;
    return "Average";
  };

  if (stats?.metrics && alchemized?.thermodynamicProperties) {
    const thermo = alchemized.thermodynamicProperties;
    const heatZ = formatZ(thermo.heat ?? 0.5, stats.metrics.heat);
    const entropyZ = formatZ(thermo.entropy ?? 0.5, stats.metrics.entropy);
    const reactivityZ = formatZ(thermo.reactivity ?? 0.5, stats.metrics.reactivity);
    groundingLines.push(
      `Current Thermodynamic Rarity (30-day baseline): Heat is ${heatZ}, Entropy is ${entropyZ}, Reactivity is ${reactivityZ}. Modify the physical intensity of ingredients and cooking method precisely to match these statistical extremes. If Extreme, make the recipe Extreme.`
    );
    groundingLines.push(
      `Current ESMS Baseline Yields: Spirit ${esms.Spirit.toFixed(2)}, Essence ${esms.Essence.toFixed(2)}, Matter ${esms.Matter.toFixed(2)}, Substance ${esms.Substance.toFixed(2)}.`
    );
  }

  const groundingBlock = groundingLines.length > 0 ? `\n${groundingLines.join("\n")}\n` : "";

  const systemPrompt = `You are an expert alchemical chef and astrologer for Alchm Kitchen.
Current planetary positions: ${currentSky}.
Dominant element today: ${dominantElement}.
${birthChartNote}
${historyNote}
Diet preference: ${diet || "omnivore"}.
${ingredientsMain?.length ? `Preferred main ingredients: ${ingredientsMain.join(", ")}.` : ""}
${disallowedIngredients?.length ? `Never use: ${disallowedIngredients.join(", ")}.` : ""}${groundingBlock}
Create a detailed, authentic, cosmic recipe that:
- Aligns with the current planetary positions and dominant ${dominantElement} element
${cuisineEntry ? `- Honours the statistical profile of ${cuisineEntry.cuisine} cuisine listed above` : ""}
- Favours the indexed ingredients above where they fit the dish
- Uses real culinary techniques with precise measurements
- Explains the astrological and elemental correspondences
- Is achievable by a home cook`;

  const userRequest = prompt || "A nourishing, restorative meal aligned with today's cosmic energies.";
  const agentPayload = {
    prompt: userRequest,
    context: {
      systemPrompt,
      dominantElement,
      cuisine: cuisineEntry?.cuisine ?? null,
      topIngredients,
      birthData,
      dietPreference: diet || "omnivore",
      alchemicalState: esms,
      thermodynamicProperties: alchemized?.thermodynamicProperties
    }
  };

  let responseJson: any;
  try {
    const agentBaseUrl = process.env.NEXT_PUBLIC_PLANETARY_KINETICS_URL || "https://agents.alchm.kitchen";
    const agentResponse = await fetch(`${agentBaseUrl}/api/generate-recipe`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(agentPayload)
    });

    if (!agentResponse.ok) {
      return new Response(JSON.stringify({ error: "Failed to generate recipe via agents network" }), { status: agentResponse.status, headers: { "Content-Type": "application/json" } });
    }

    responseJson = await agentResponse.json();
  } catch (error) {
    console.error("[generate-cosmic-recipe] Error calling planetary agents API:", error);
    return new Response(JSON.stringify({ error: "Internal server error contacting agents network" }), { status: 500, headers: { "Content-Type": "application/json" } });
  }

  // Annotate demo responses so the client can render a "sign in to save / get
  // personalized" CTA instead of treating this as a saved cosmic recipe.
  if (demoMode) {
    responseJson = {
      ...responseJson,
      demo: true,
      demoRemaining: access.mode === "demo" ? access.demoRemaining : undefined,
    };
  }

  const response = new Response(JSON.stringify(responseJson), {
    status: 200,
    headers: { "Content-Type": "application/json" }
  });

  // Expose the grounding payload on a response header so the client can
  // surface the exact anchors the LLM was given (useful for debugging
  // drift and for rendering a "why this recipe" footer).
  try {
    const groundingPayload = {
      dominantElement,
      cuisine: cuisineEntry?.cuisine ?? null,
      sampleSize: cuisineEntry?.sampleSize ?? null,
      signatures: cuisineSignatureLines,
      planetaryPatterns: planetaryPatternLines,
      topIngredients,
    };
    const encoded = Buffer.from(JSON.stringify(groundingPayload), "utf8").toString("base64");
    response.headers.set("X-Cosmic-Grounding", encoded);
  } catch {
    // Non-fatal — header is purely informational.
  }

  return response;
}

export const POST = withObservability(
  { routeName: "/api/generate-cosmic-recipe" },
  handlePost,
);
