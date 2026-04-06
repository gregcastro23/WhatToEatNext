/**
 * GET/POST /api/cuisines/recommend
 *
 * Primary: Calls Railway backend (/cuisines/recommend) for full astrological cuisine recommendations.
 * Fallback: Computes locally using planetary positions from astronomy-engine.
 *
 * Returns cuisine recommendations based on current planetary positions, including
 * recipe counts per cuisine from the local data layer.
 */
import { NextResponse } from "next/server";
import { allRecipes } from "@/data/recipes/index";
import { getAccuratePlanetaryPositions } from "@/utils/astrology/positions";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const RAILWAY_URL = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL;
const INTERNAL_SECRET = process.env.INTERNAL_API_SECRET;

const SIGN_TO_ELEMENT: Record<string, string> = {
  aries: "Fire", leo: "Fire", sagittarius: "Fire",
  taurus: "Earth", virgo: "Earth", capricorn: "Earth",
  gemini: "Air", libra: "Air", aquarius: "Air",
  cancer: "Water", scorpio: "Water", pisces: "Water",
};

const CUISINE_MAP: Record<string, { cuisines: string[]; cookingMethods: string[]; flavors: string[] }> = {
  Fire:  { cuisines: ["Mexican", "Indian", "African", "Thai", "Korean"], cookingMethods: ["Grilling", "Roasting", "Searing", "Stir-frying"], flavors: ["Spicy", "Smoky", "Bold"] },
  Water: { cuisines: ["Japanese", "Vietnamese", "Greek", "Korean", "French"], cookingMethods: ["Steaming", "Poaching", "Braising", "Simmering"], flavors: ["Umami", "Briny", "Delicate"] },
  Earth: { cuisines: ["Italian", "French", "Middle Eastern", "Russian", "American"], cookingMethods: ["Baking", "Slow-cooking", "Fermenting", "Curing"], flavors: ["Hearty", "Earthy", "Rich"] },
  Air:   { cuisines: ["Chinese", "Vietnamese", "Greek", "Thai", "Japanese"], cookingMethods: ["Sautéing", "Wok-frying", "Smoking", "Dehydrating"], flavors: ["Light", "Aromatic", "Fresh"] },
};

/**
 * Get recipe counts per cuisine from local data.
 */
function getRecipeCounts(): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const recipe of allRecipes) {
    const cuisine = typeof recipe.cuisine === "string" ? recipe.cuisine.toLowerCase() : "";
    if (cuisine) {
      counts[cuisine] = (counts[cuisine] || 0) + 1;
    }
  }
  return counts;
}

/**
 * Try Railway backend for full astrological cuisine recommendations.
 */
async function fetchFromBackend(params?: { zodiacSign?: string; season?: string; mealType?: string }) {
  if (!RAILWAY_URL) return null;

  try {
    const url = new URL(`${RAILWAY_URL}/cuisines/recommend`);
    if (params?.zodiacSign) url.searchParams.set("zodiac_sign", params.zodiacSign);
    if (params?.season) url.searchParams.set("season", params.season);
    if (params?.mealType) url.searchParams.set("meal_type", params.mealType);
    url.searchParams.set("limit", "14");

    const response = await fetch(url.toString(), {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...(INTERNAL_SECRET ? { "X-Internal-Secret": INTERNAL_SECRET } : {}),
      },
      signal: AbortSignal.timeout(8000),
    });

    if (!response.ok) {
      console.error(`Railway /cuisines/recommend error: ${response.status}`);
      return null;
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.warn("Railway /cuisines/recommend unavailable, falling back to local:", error);
    return null;
  }
}

/**
 * Local fallback: compute recommendations from planetary positions.
 */
function computeLocalRecommendations() {
  const positions = getAccuratePlanetaryPositions(new Date());

  const elementCounts: Record<string, number> = { Fire: 0, Water: 0, Earth: 0, Air: 0 };
  Object.values(positions).forEach((pos) => {
    const sign = typeof pos.sign === "string" ? pos.sign : "";
    const el = SIGN_TO_ELEMENT[sign];
    if (el) elementCounts[el]++;
  });

  const sorted = Object.entries(elementCounts).sort(([, a], [, b]) => b - a);
  const dominant = sorted[0][0];
  const secondary = sorted[1][0];

  const primData = CUISINE_MAP[dominant];
  const secData = CUISINE_MAP[secondary];

  return {
    dominantElement: dominant,
    secondaryElement: secondary,
    recommendations: {
      cuisines: [...primData.cuisines.slice(0, 3), ...secData.cuisines.slice(0, 2)],
      cookingMethods: [...primData.cookingMethods.slice(0, 2), ...secData.cookingMethods.slice(0, 2)],
      flavors: [...primData.flavors, ...secData.flavors],
    },
    elementDistribution: elementCounts,
  };
}

async function handleRequest() {
  try {
    const recipeCounts = getRecipeCounts();

    // Try backend first
    const backendData = await fetchFromBackend();
    if (backendData) {
      return NextResponse.json({
        success: true,
        source: "backend",
        ...backendData,
        recipeCounts,
        calculatedAt: new Date().toISOString(),
      });
    }

    // Fallback to local calculation
    const localData = computeLocalRecommendations();

    return NextResponse.json({
      success: true,
      source: "local",
      ...localData,
      recipeCounts,
      calculatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Cuisine recommendation error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to compute recommendations" },
      { status: 500 },
    );
  }
}

export async function GET() {
  return handleRequest();
}

export async function POST() {
  return handleRequest();
}
