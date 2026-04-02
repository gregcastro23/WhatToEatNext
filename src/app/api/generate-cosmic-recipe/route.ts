/**
 * POST /api/generate-cosmic-recipe
 * Streams a structured cosmic recipe using Vercel AI SDK + OpenAI.
 * Uses the cosmicRecipeSchema for structured output.
 */
import { openai } from "@ai-sdk/openai";
import { streamObject } from "ai";
import { getAccuratePlanetaryPositions } from "@/utils/astrology/positions";
import { cosmicRecipeSchema } from "@/types/cosmicRecipeSchema";

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
  if (!process.env.OPENAI_API_KEY) {
    return new Response(JSON.stringify({ error: "Recipe generation not configured" }), {
      status: 503,
      headers: { "Content-Type": "application/json" },
    });
  }

  const body = await request.json();
  const { prompt, diet, ingredients_main, disallowed_ingredients, birthData } = body;

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
${ingredients_main?.length ? `Preferred main ingredients: ${ingredients_main.join(", ")}.` : ""}
${disallowed_ingredients?.length ? `Never use: ${disallowed_ingredients.join(", ")}.` : ""}

Create a detailed, authentic, cosmic recipe that:
- Aligns with the current planetary positions and dominant ${dominantElement} element
- Uses real culinary techniques with precise measurements
- Explains the astrological and elemental correspondences
- Is achievable by a home cook`;

  const result = streamObject({
    model: openai("gpt-4o-mini"),
    schema: cosmicRecipeSchema,
    prompt: `${systemPrompt}\n\nUser request: ${prompt || "A nourishing, restorative meal aligned with today's cosmic energies."}`,
  });

  return result.toTextStreamResponse();
}
