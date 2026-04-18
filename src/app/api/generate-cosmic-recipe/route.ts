/**
 * POST /api/generate-cosmic-recipe
 * Streams a structured cosmic recipe using Vercel AI SDK + OpenAI.
 * Uses the cosmicRecipeSchema for structured output.
 */
import { openai } from "@ai-sdk/openai";
import { streamObject } from "ai";
import { auth } from "@/lib/auth/auth";
import { applyLivePricing, getLivePricingContext } from "@/lib/economy/livePricing";
import { reportQuestEventBestEffort } from "@/services/questEventReporter";
import { subscriptionService } from "@/services/subscriptionService";
import { tokenEconomy } from "@/services/TokenEconomyService";
import { cosmicRecipeSchema } from "@/types/cosmicRecipeSchema";
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

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(request: Request) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) {
    return new Response(JSON.stringify({ error: "Authentication required" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  // 1. Check if user is premium
  const sub = await subscriptionService.getUserSubscription(userId);
  const isPremium = sub?.tier === "premium";

  // 2. If not premium, they MUST spend tokens OR have a valid monthly slot
  // (We'll prioritize tokens for 'cosmic' recipes as they are special sinks)
  // Apply live pricing so the debit matches what the Token Shop displays.
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

    const pricing = await getLivePricingContext();
    const liveCost = applyLivePricing(
      {
        spirit: item.costSpirit,
        essence: item.costEssence,
        matter: item.costMatter,
        substance: item.costSubstance,
      },
      pricing.multiplier,
    );

    const purchase = await tokenEconomy.purchaseShopItem(userId, "unlock-cosmic-recipe", {
      overrideCosts: liveCost,
      descriptionSuffix: `live x${pricing.multiplier.toFixed(2)}`,
    });
    if (!purchase.success && purchase.reason !== "already_owned") {
      return new Response(JSON.stringify({
        error: "Insufficient tokens",
        message: `Cosmic recipes require ${liveCost.spirit.toFixed(2)} Spirit and ${liveCost.essence.toFixed(2)} Essence (live x${pricing.multiplier.toFixed(2)}). Earn more or upgrade to Premium!`,
        liveCost,
        pricing,
      }), {
        status: 402,
        headers: { "Content-Type": "application/json" },
      });
    }
  }

  // 3. Increment usage counter
  try {
    await subscriptionService.incrementUsage(userId, "recipe_generation");
  } catch (error) {
    console.warn("[generate-cosmic-recipe] Failed to increment usage", error);
  }
  // Cosmic recipes count toward both the generic "Culinary Explorer" tiers
  // and the one-shot "Cosmic Chef" premium quest.
  await reportQuestEventBestEffort(userId, "generate_recipe");
  await reportQuestEventBestEffort(userId, "generate_premium_recipe");

  const body = await request.json();
  const {
    prompt,
    diet,
    ingredients_main: ingredientsMain,
    disallowed_ingredients: disallowedIngredients,
    birthData,
    preferredCuisine,
  } = body as {
    prompt?: string;
    diet?: string;
    ingredients_main?: string[];
    disallowed_ingredients?: string[];
    birthData?: unknown;
    preferredCuisine?: string;
  };

  // Get current sky for context
  const raw = getAccuratePlanetaryPositions(new Date());
  const skySnapshot: string[] = [];
  Object.entries(raw).slice(0, 6).forEach(([planet, pos]) => {
    const sign = typeof pos.sign === "string" ? pos.sign : String(pos.sign);
    skySnapshot.push(`${planet} in ${sign}${pos.isRetrograde ? " (R)" : ""}`);
  });
  const dominantElement: ClassicalElement = getDominantElementFromPositions(
    raw as Record<string, { sign?: unknown }>,
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
  const groundingBlock = groundingLines.length > 0 ? `\n${groundingLines.join("\n")}\n` : "";

  const systemPrompt = `You are an expert alchemical chef and astrologer for Alchm Kitchen.
Current planetary positions: ${currentSky}.
Dominant element today: ${dominantElement}.
${birthChartNote}
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

  const result = streamObject({
    model: openai("gpt-4o-mini"),
    schema: cosmicRecipeSchema,
    prompt: `${systemPrompt}\n\nUser request: ${prompt || "A nourishing, restorative meal aligned with today's cosmic energies."}`,
  });

  const response = result.toTextStreamResponse();

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
