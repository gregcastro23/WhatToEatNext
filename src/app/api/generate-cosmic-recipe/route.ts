/**
 * POST /api/generate-cosmic-recipe
 * Streams a structured cosmic recipe using Vercel AI SDK + OpenAI.
 * Uses the cosmicRecipeSchema for structured output.
 */
import { openai } from "@ai-sdk/openai";
import { streamObject } from "ai";
import { cosmicRecipeSchema } from "@/types/cosmicRecipeSchema";
import { getAccuratePlanetaryPositions } from "@/utils/astrology/positions";
import { auth } from "@/lib/auth/auth";
import { subscriptionService } from "@/services/subscriptionService";
import { tokenEconomy } from "@/services/TokenEconomyService";
import { reportQuestEventBestEffort } from "@/services/questEventReporter";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const maxDuration = 60;

const SIGN_TO_ELEMENT: Record<string, string> = {
  aries: "Fire", leo: "Fire", sagittarius: "Fire",
  taurus: "Earth", virgo: "Earth", capricorn: "Earth",
  gemini: "Air", libra: "Air", aquarius: "Air",
  cancer: "Water", scorpio: "Water", pisces: "Water",
};

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
  if (!isPremium) {
    const purchase = await tokenEconomy.purchaseShopItem(userId, "unlock-cosmic-recipe");
    if (!purchase.success && purchase.reason !== "already_owned") {
      return new Response(JSON.stringify({
        error: "Insufficient tokens",
        message: "Cosmic recipes require 15 Spirit and 15 Essence tokens. Earn more or upgrade to Premium!"
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
  await reportQuestEventBestEffort(userId, "generate_cosmic_recipe");

  const body = await request.json();
  const {
    prompt,
    diet,
    ingredients_main: ingredientsMain,
    disallowed_ingredients: disallowedIngredients,
    birthData,
  } = body;

  // Get current sky for context
  const raw = getAccuratePlanetaryPositions(new Date());
  const skySnapshot: string[] = [];
  const elementCounts: Record<string, number> = { Fire: 0, Water: 0, Earth: 0, Air: 0 };
  Object.entries(raw).slice(0, 6).forEach(([planet, pos]) => {
    const sign = typeof pos.sign === "string" ? pos.sign : String(pos.sign);
    skySnapshot.push(`${planet} in ${sign}${pos.isRetrograde ? " (R)" : ""}`);
    const el = SIGN_TO_ELEMENT[sign];
    if (el) elementCounts[el]++;
  });
  const dominantElement = Object.entries(elementCounts).sort(([, a], [, b]) => b - a)[0][0];

  const currentSky = skySnapshot.join(", ");
  const birthChartNote = birthData
    ? `The user's birth data: ${JSON.stringify(birthData)}.`
    : "No birth chart provided; base recommendations on current sky only.";

  const systemPrompt = `You are an expert alchemical chef and astrologer for Alchm Kitchen.
Current planetary positions: ${currentSky}.
Dominant element today: ${dominantElement}.
${birthChartNote}
Diet preference: ${diet || "omnivore"}.
${ingredientsMain?.length ? `Preferred main ingredients: ${ingredientsMain.join(", ")}.` : ""}
${disallowedIngredients?.length ? `Never use: ${disallowedIngredients.join(", ")}.` : ""}

Create a detailed, authentic, cosmic recipe that:
- Aligns with the current planetary positions and dominant ${dominantElement} element
- Uses real culinary techniques with precise measurements
- Explains the astrological and elemental correspondences
- Is achievable by a home cook`;

  // @ts-expect-error - Auto-fixed by script
  const result = streamObject({
    model: openai("gpt-4o-mini"),
    schema: cosmicRecipeSchema,
    prompt: `${systemPrompt}\n\nUser request: ${prompt || "A nourishing, restorative meal aligned with today's cosmic energies."}`,
  });

  return result.toTextStreamResponse();
}
