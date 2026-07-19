/**
 * GET/POST /api/cuisines/recommend
 *
 * Primary: Calls Railway backend (/cuisines/recommend) for full astrological cuisine recommendations.
 * Fallback: Computes locally using planetary positions from astronomy-engine.
 *
 * Returns cuisine recommendations based on current planetary positions, including
 * recipe counts per cuisine from the local data layer.
 *
 * Query parameters:
 * - zodiacSign: optional zodiac sign filter (e.g. "aries", "taurus")
 * - season: optional season filter ("spring" | "summer" | "fall" | "winter")
 * - mealType: optional meal type ("breakfast" | "lunch" | "dinner" | "snack" | "brunch" | "dessert")
 * - bias: optional user elemental bias — four normalized non-negative floats
 *   in Fire,Earth,Air,Water order (e.g. "0.5,0.1,0.1,0.3"), produced by
 *   useUserElementalBias/biasQueryParam. Blended (30%) into the sky's element
 *   distribution before ranking, so the cuisine ORDER follows the visitor's
 *   table. Invalid values are ignored. The response's elementDistribution
 *   always stays the raw sky; `personalized: true` marks a biased ranking.
 */
import { NextResponse } from "next/server";
import { getAllRecipes } from "@/data/recipes/index";
import { withObservability } from "@/lib/observability/withObservability";
import { rateLimit } from "@/lib/rateLimit";
import { CuisinesQuerySchema, parseCuisinesResponse } from "@/lib/validation/railway";
import { getAccuratePlanetaryPositions } from "@/utils/astrology/positions";
import { elementalSignature } from "@/utils/elemental/signature";

const CUISINES_LIMIT = { window: 60_000, max: 60, bucket: "cuisines-recommend" };

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
async function getRecipeCounts(): Promise<Record<string, number>> {
  const counts: Record<string, number> = {};
  const recipes = await getAllRecipes();
  for (const recipe of recipes) {
    const cuisine = typeof recipe.cuisine === "string" ? recipe.cuisine.toLowerCase() : "";
    if (cuisine) {
      counts[cuisine] = (counts[cuisine] || 0) + 1;
    }
  }
  return counts;
}

/**
 * Try Railway backend for full astrological cuisine recommendations.
 * Returns a validated response object or null on failure/schema mismatch.
 */
async function fetchFromBackend(params: { zodiacSign?: string; season?: string; mealType?: string }) {
  if (!RAILWAY_URL) return null;

  try {
    const url = new URL(`${RAILWAY_URL}/cuisines/recommend`);
    if (params.zodiacSign) url.searchParams.set("zodiac_sign", params.zodiacSign);
    if (params.season)     url.searchParams.set("season",      params.season);
    if (params.mealType)   url.searchParams.set("meal_type",   params.mealType);
    url.searchParams.set("limit", "14");

    const response = await fetch(url.toString(), {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...(INTERNAL_SECRET ? { "X-Internal-Secret": INTERNAL_SECRET } : {}),
      },
      signal: AbortSignal.timeout(30000),
    });

    if (!response.ok) {
      console.error(`Railway /cuisines/recommend error: ${response.status}`);
      return null;
    }

    const raw: unknown = await response.json();
    return parseCuisinesResponse(raw); // validated or null
  } catch (error) {
    console.warn("Railway /cuisines/recommend unavailable, falling back to local:", error);
    return null;
  }
}

/** Weight of the user bias when blending into the sky's element shares. */
const BIAS_ALPHA = 0.3;

/**
 * Parse the `bias` query param: four non-negative finite floats in
 * Fire,Earth,Air,Water order. Returns a normalized vector or null.
 */
function parseBias(raw: string | null): Record<string, number> | null {
  if (!raw) return null;
  const parts = raw.split(",").map(Number);
  if (parts.length !== 4 || parts.some((n) => !Number.isFinite(n) || n < 0)) {
    return null;
  }
  const sum = parts.reduce((a, b) => a + b, 0);
  if (!(sum > 0)) return null;
  const [fire, earth, air, water] = parts.map((n) => n / sum);
  return { Fire: fire, Earth: earth, Air: air, Water: water };
}

/**
 * Local fallback: compute recommendations from planetary positions, with the
 * visitor's elemental bias (when present) blended into the ranking input.
 */
function computeLocalRecommendations(bias: Record<string, number> | null = null) {
  const positions = getAccuratePlanetaryPositions(new Date());

  const elementCounts: Record<string, number> = { Fire: 0, Water: 0, Earth: 0, Air: 0 };
  for (const pos of Object.values(positions)) {
    const sign = typeof pos.sign === "string" ? pos.sign : "";
    const el = SIGN_TO_ELEMENT[sign];
    if (el) elementCounts[el]++;
  }

  // The signature input: raw sky shares, or a 70/30 sky/bias blend when the
  // visitor has a table. elementDistribution in the response stays the raw
  // sky either way — the blend tunes the ranking, it never rewrites the sky.
  const totalCount =
    elementCounts.Fire + elementCounts.Water + elementCounts.Earth + elementCounts.Air || 1;
  const share = (el: string) =>
    bias
      ? (elementCounts[el] / totalCount) * (1 - BIAS_ALPHA) + (bias[el] ?? 0) * BIAS_ALPHA
      : elementCounts[el];

  // Canonical signature — one tie-break shared with every display surface, plus
  // adaptive co-dominant framing for the UI. The 3+2 primary/secondary cuisine
  // blend is preserved so the public marketing preview keeps its count.
  const sig = elementalSignature({
    Fire: share("Fire"),
    Water: share("Water"),
    Earth: share("Earth"),
    Air: share("Air"),
  });
  const dominant = sig.dominant;
  const secondary = sig.ranked[1].element;

  const primData = CUISINE_MAP[dominant];
  const secData  = CUISINE_MAP[secondary];

  return {
    dominantElement: dominant,
    secondaryElement: secondary,
    signature: {
      tier: sig.tier,
      coDominant: sig.coDominant,
      label: sig.label,
      shortLabel: sig.shortLabel,
    },
    recommendations: {
      cuisines:      [...primData.cuisines.slice(0, 3),      ...secData.cuisines.slice(0, 2)],
      cookingMethods:[...primData.cookingMethods.slice(0, 2), ...secData.cookingMethods.slice(0, 2)],
      flavors:       [...primData.flavors,                    ...secData.flavors],
    },
    elementDistribution: elementCounts,
    personalized: Boolean(bias),
  };
}

// NOTE: This endpoint is intentionally PUBLIC. It returns astrological
// cuisine matches computed from planetary positions — the same content
// shown on the home page as a marketing preview. The premium-only piece
// is the EnhancedSauceRecommender on the /cuisines page (UI-gated via
// PremiumGate). Don't add an auth gate here without first re-gating
// the home page recommender, or free users will see a broken state.

async function handleRequest(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    // Validate + coerce query params; unknown enum values are silently dropped via .catch(undefined)
    const { zodiacSign, season, mealType } = CuisinesQuerySchema.parse({
      zodiacSign: searchParams.get("zodiacSign") ?? undefined,
      season:     searchParams.get("season")     ?? undefined,
      mealType:   searchParams.get("mealType")   ?? undefined,
    });

    const bias = parseBias(searchParams.get("bias"));

    const recipeCounts = await getRecipeCounts();

    // Try Railway backend first — except for personalized requests: the
    // backend can't blend a user bias, and its per-cuisine scores are
    // near-flat anyway, so biased rankings always compute locally.
    const backendData = bias
      ? null
      : await fetchFromBackend({ zodiacSign, season, mealType });
    if (backendData) {
      return NextResponse.json({
        success: true,
        source: "backend",
        personalized: false,
        dominantElement:    backendData.dominantElement,
        secondaryElement:   backendData.secondaryElement,
        recommendations:    backendData.recommendations,
        elementDistribution: backendData.elementDistribution,
        cuisines:           backendData.cuisines,
        topCuisines:        backendData.topCuisines,
        cuisineRecommendations: backendData.cuisine_recommendations,
        recipeCounts,
        calculatedAt: new Date().toISOString(),
      });
    }

    // Fallback to local calculation
    const localData = computeLocalRecommendations(bias);

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

async function handleGet(request: Request) {
  const rl = await rateLimit(request, CUISINES_LIMIT);
  if (!rl.allowed) return rl.response!;
  return handleRequest(request);
}

async function handlePost(request: Request) {
  const rl = await rateLimit(request, CUISINES_LIMIT);
  if (!rl.allowed) return rl.response!;
  return handleRequest(request);
}

export const GET = withObservability(
  { routeName: "/api/cuisines/recommend" },
  handleGet,
);
export const POST = withObservability(
  { routeName: "/api/cuisines/recommend" },
  handlePost,
);
