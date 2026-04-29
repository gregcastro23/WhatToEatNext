/**
 * Restaurant Search API Route
 *
 * GET  /api/restaurants/search?query=...&near=...
 *   → Foursquare Places v3 proxy (text search, used by profile RestaurantSearch UI).
 *
 * POST /api/restaurants/search
 *   Body: { cuisineType, latitude, longitude, radius?, limit? }
 *   → Yelp Fusion + alchm-scored restaurants for the "Order it" discovery flow.
 *
 * Both API keys (FOURSQUARE_API_KEY, YELP_API_KEY) live server-side only.
 */

import { NextResponse } from "next/server";
import { yelpService } from "@/services/yelpService";
import type { ElementalProperties } from "@/types/alchemy";
import type {
  AstrologicalState,
  Element,
  AlchemicalProperties,
  Planet,
} from "@/types/celestial";
import type {
  AlchmScoredRestaurant,
  RestaurantSearchResponse,
  CosmicContext,
  YelpBusiness,
} from "@/types/yelp";
import { getAccuratePlanetaryPositions } from "@/utils/astrology/positions";
import { getLunarPhaseFromDate } from "@/utils/lunarPhaseUtils";
import {
  aggregateEnhancedZodiacElementals,
  calculateAlchemicalFromPlanets,
  isSectDiurnal,
} from "@/utils/planetaryAlchemyMapping";
import { getTimeFactors } from "@/utils/time";
import type { NextRequest } from "next/server";

export const dynamic = "force-dynamic";
// Note: Removed `runtime = 'edge'` - Cloudflare Workers are already edge functions
// and OpenNext requires edge functions to be configured separately.

const FOURSQUARE_BASE = "https://api.foursquare.com/v3/places/search";
const RESTAURANT_CATEGORY_ID = "13065"; // Foursquare "Dining and Drinking" parent category

// ─── Foursquare GET (existing) ─────────────────────────────────────────────

interface FoursquarePlaceRaw {
  fsq_id?: string;
  name?: string;
  location?: {
    formatted_address?: string;
    locality?: string;
    region?: string;
    address?: string;
  };
  categories?: Array<{
    name?: string;
    icon?: { prefix?: string; suffix?: string };
  }>;
  rating?: number;
  distance?: number;
}

export async function GET(request: NextRequest) {
  const apiKey = process.env.FOURSQUARE_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      {
        success: false,
        message:
          "Foursquare API key not configured. Add FOURSQUARE_API_KEY to your .env.local file.",
        setupUrl: "https://foursquare.com/developers",
      },
      { status: 501 },
    );
  }

  const { searchParams } = new URL(request.url);
  const query = searchParams.get("query");
  const near = searchParams.get("near");

  if (!query && !near) {
    return NextResponse.json(
      { success: false, message: "Please provide a query or location." },
      { status: 400 },
    );
  }

  try {
    const params = new URLSearchParams();
    if (query) params.set("query", query);
    if (near) params.set("near", near);
    params.set("categories", RESTAURANT_CATEGORY_ID);
    params.set("fields", "fsq_id,name,location,categories,rating,distance");
    params.set("limit", "15");

    const response = await fetch(`${FOURSQUARE_BASE}?${params.toString()}`, {
      headers: {
        Authorization: apiKey,
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error("Foursquare API error:", response.status, errorBody);
      return NextResponse.json(
        {
          success: false,
          message: "Failed to search restaurants. Please try again.",
        },
        { status: 502 },
      );
    }

    const data = (await response.json()) as { results?: FoursquarePlaceRaw[] };
    const results = (data.results || []).map((place) => ({
      fsq_id: place.fsq_id,
      name: place.name,
      location: {
        formatted_address: place.location?.formatted_address,
        locality: place.location?.locality,
        region: place.location?.region,
        address: place.location?.address,
      },
      categories: (place.categories || []).map((cat) => ({
        name: cat.name,
        icon: cat.icon,
      })),
      rating: place.rating,
      distance: place.distance,
    }));

    return NextResponse.json({ success: true, results });
  } catch (error) {
    console.error("Restaurant search error:", error);
    return NextResponse.json(
      { success: false, message: "An error occurred while searching." },
      { status: 500 },
    );
  }
}

// ─── Yelp + alchm-scored POST ──────────────────────────────────────────────

interface ScoredSearchBody {
  cuisineType?: unknown;
  latitude?: unknown;
  longitude?: unknown;
  radius?: unknown;
  limit?: unknown;
}

function emptyCosmicContext(): CosmicContext {
  return { currentZodiac: "", planetaryHour: "", dominantElement: "" };
}

function capitalizeSign(s: string): string {
  if (!s) return s;
  return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
}

function dominantElementOf(profile: ElementalProperties): Element {
  const entries: Array<[Element, number]> = [
    ["Fire", profile.Fire],
    ["Water", profile.Water],
    ["Earth", profile.Earth],
    ["Air", profile.Air],
  ];
  entries.sort(([, a], [, b]) => b - a);
  return entries[0][0];
}

/**
 * Build a server-side AstrologicalState from current planetary positions
 * using the authoritative utilities:
 *   - `aggregateEnhancedZodiacElementals` for sect-aware elemental profile
 *   - `calculateAlchemicalFromPlanets`  for real ESMS values
 *   - `isSectDiurnal`                   for sect determination
 *   - `getLunarPhaseFromDate`           for the live lunar phase
 *
 * Returns null when essential bodies (Sun, Moon) are missing — the caller
 * surfaces a 503 rather than substituting placeholder signs.
 */
function buildAstrologicalState(now: Date = new Date()): {
  state: AstrologicalState;
  cosmicContext: CosmicContext;
  alchemicalProperties: AlchemicalProperties;
  diurnal: boolean;
} | null {
  const positions = getAccuratePlanetaryPositions(now);

  const sunSignRaw =
    typeof positions.Sun?.sign === "string" ? positions.Sun.sign : null;
  const moonSignRaw =
    typeof positions.Moon?.sign === "string" ? positions.Moon.sign : null;

  if (!sunSignRaw || !moonSignRaw) {
    return null;
  }

  const sunSign = sunSignRaw.toLowerCase();
  const moonSign = moonSignRaw.toLowerCase();

  // Capitalized position map for the alchemy/elemental aggregators
  const positionMap: Record<string, string> = {};
  for (const [planet, data] of Object.entries(positions)) {
    if (typeof data?.sign === "string" && data.sign.length > 0) {
      positionMap[planet] = capitalizeSign(data.sign);
    }
  }

  const diurnal = isSectDiurnal(now);

  // ── Elementals: sect-aware mass-weighted aggregation (60% sign + 40% sect) ──
  const domElements: ElementalProperties =
    aggregateEnhancedZodiacElementals(positionMap, diurnal);
  const dominantElement: Element = dominantElementOf(domElements);

  // ── ESMS: authoritative planetary alchemy mapping ──
  const alchemicalProperties: AlchemicalProperties =
    calculateAlchemicalFromPlanets(positionMap, diurnal);

  // ── Lunar phase: live calculation from current date ──
  const lunarPhase = getLunarPhaseFromDate(now);

  // ── Time factors for planetary hour/day ──
  const timeFactors = getTimeFactors();
  const planetaryHour = timeFactors.planetaryHour.planet as Planet;
  const planetaryDay = timeFactors._planetaryDay.planet as Planet;
  const hourOfDay = timeFactors.planetaryHour.hourOfDay;

  const state: AstrologicalState = {
    zodiacSign: sunSign,
    currentZodiac: sunSign,
    sunSign,
    moonSign,
    planetaryHour,
    dominantElement,
    domElements,
    activePlanets: [planetaryHour, planetaryDay].filter(
      (p, i, arr) => arr.indexOf(p) === i,
    ),
    isDaytime: hourOfDay >= 6 && hourOfDay < 18,
    lunarPhase,
  };

  const cosmicContext: CosmicContext = {
    currentZodiac: sunSign,
    planetaryHour: String(planetaryHour),
    dominantElement,
  };

  return { state, cosmicContext, alchemicalProperties, diurnal };
}

// ─── Foursquare fallback (used by POST when Yelp is unavailable) ───────────

interface FoursquareNearbyRaw {
  fsq_id?: string;
  name?: string;
  location?: {
    formatted_address?: string;
    locality?: string;
    region?: string;
    address?: string;
  };
  categories?: Array<{ name?: string }>;
  rating?: number;
  distance?: number;
  geocodes?: { main?: { latitude?: number; longitude?: number } };
  link?: string;
}

/**
 * Fetches restaurants near (lat,lng) for the given cuisine via Foursquare
 * Places v3 and shapes them into AlchmScoredRestaurant entries with neutral
 * scoring (Foursquare doesn't provide the cosmic alignment data we use).
 *
 * Returns null when Foursquare is unconfigured or returns no usable results.
 */
async function fetchFoursquareFallback(
  cuisineType: string,
  latitude: number,
  longitude: number,
  radiusMeters: number,
  limit: number,
): Promise<AlchmScoredRestaurant[] | null> {
  const apiKey = process.env.FOURSQUARE_API_KEY;
  if (!apiKey) return null;

  try {
    const params = new URLSearchParams();
    params.set("query", cuisineType);
    params.set("ll", `${latitude},${longitude}`);
    params.set("radius", String(Math.min(Math.max(radiusMeters, 100), 100000)));
    params.set("categories", RESTAURANT_CATEGORY_ID);
    params.set(
      "fields",
      "fsq_id,name,location,categories,rating,distance,geocodes,link",
    );
    params.set("limit", String(Math.min(Math.max(limit, 1), 50)));

    const response = await fetch(`${FOURSQUARE_BASE}?${params.toString()}`, {
      headers: { Authorization: apiKey, Accept: "application/json" },
    });
    if (!response.ok) return null;

    const data = (await response.json()) as { results?: FoursquareNearbyRaw[] };
    const results = data.results ?? [];
    if (results.length === 0) return null;

    return results
      .filter((p): p is FoursquareNearbyRaw & { fsq_id: string; name: string } =>
        Boolean(p.fsq_id && p.name),
      )
      .map((place): AlchmScoredRestaurant => {
        const business: YelpBusiness = {
          id: place.fsq_id,
          name: place.name,
          // Foursquare's deep-link to place detail; falls back to a search URL
          url:
            place.link
              ? `https://foursquare.com${place.link}`
              : `https://foursquare.com/v/${place.fsq_id}`,
          phone: "",
          rating: typeof place.rating === "number" ? place.rating / 2 : 0,
          review_count: 0,
          distance: typeof place.distance === "number" ? place.distance : undefined,
          categories: (place.categories ?? [])
            .filter((c): c is { name: string } => typeof c.name === "string")
            .map((c) => ({ alias: c.name.toLowerCase(), title: c.name })),
          location: {
            address1: place.location?.address ?? "",
            city: place.location?.locality ?? "",
            state: place.location?.region ?? "",
            zip_code: "",
            display_address: place.location?.formatted_address
              ? [place.location.formatted_address]
              : [],
          },
          coordinates: {
            latitude: place.geocodes?.main?.latitude ?? latitude,
            longitude: place.geocodes?.main?.longitude ?? longitude,
          },
          is_closed: false,
        };

        return {
          business,
          alchmScore: 0,
          elementalMatch: 0,
          planetaryAlignment: 0,
          monicaCompatibility: 0,
          dominantElement: "Earth",
          matchReasons: [
            `${cuisineType} match from Foursquare — cosmic scoring unavailable`,
          ],
          cuisineElement: { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 },
        };
      });
  } catch {
    return null;
  }
}

export async function POST(request: NextRequest) {
  let body: ScoredSearchBody;
  try {
    body = (await request.json()) as ScoredSearchBody;
  } catch {
    return NextResponse.json(
      {
        restaurants: [],
        cosmicContext: emptyCosmicContext(),
        error: "Invalid JSON body",
      } satisfies RestaurantSearchResponse,
      { status: 400 },
    );
  }

  const cuisineType =
    typeof body.cuisineType === "string" ? body.cuisineType.trim() : "";
  const latitude =
    typeof body.latitude === "number" ? body.latitude : Number(body.latitude);
  const longitude =
    typeof body.longitude === "number" ? body.longitude : Number(body.longitude);
  const radius =
    typeof body.radius === "number" && Number.isFinite(body.radius)
      ? body.radius
      : undefined;
  const limit =
    typeof body.limit === "number" && Number.isFinite(body.limit)
      ? body.limit
      : 20;

  if (!cuisineType || !Number.isFinite(latitude) || !Number.isFinite(longitude)) {
    return NextResponse.json(
      {
        restaurants: [],
        cosmicContext: emptyCosmicContext(),
        error: "cuisineType, latitude, and longitude are required",
      } satisfies RestaurantSearchResponse,
      { status: 400 },
    );
  }

  const built = buildAstrologicalState();
  const cosmicContext = built?.cosmicContext ?? emptyCosmicContext();

  // Try Yelp first when configured + planetary state is available.
  if (yelpService.isConfigured() && built) {
    const { data } = await yelpService.getScoredRestaurants({
      cuisineType,
      latitude,
      longitude,
      astrologicalState: built.state,
      alchemicalProperties: built.alchemicalProperties,
      diurnal: built.diurnal,
      radius,
      limit,
    });

    if (data && data.length > 0) {
      return NextResponse.json(
        {
          restaurants: data.slice(0, 5),
          cosmicContext,
          source: "yelp",
        } satisfies RestaurantSearchResponse,
        { status: 200 },
      );
    }
  }

  // Foursquare fallback — covers: Yelp unconfigured, Yelp errored, Yelp empty,
  // or planetary state unavailable. No cosmic scoring on these results.
  const radiusMeters = typeof radius === "number" ? radius : 8000;
  const foursquare = await fetchFoursquareFallback(
    cuisineType,
    latitude,
    longitude,
    radiusMeters,
    limit,
  );

  if (foursquare && foursquare.length > 0) {
    const reason = !yelpService.isConfigured()
      ? "Yelp not configured — showing Foursquare results without cosmic scoring."
      : !built
        ? "Planetary positions unavailable — showing Foursquare results without cosmic scoring."
        : "Yelp returned no matches — showing Foursquare results without cosmic scoring.";

    return NextResponse.json(
      {
        restaurants: foursquare.slice(0, 5),
        cosmicContext,
        source: "foursquare",
        sourceNotice: reason,
      } satisfies RestaurantSearchResponse,
      { status: 200 },
    );
  }

  // Neither provider returned anything we can show.
  return NextResponse.json(
    {
      restaurants: [],
      cosmicContext,
      error: !yelpService.isConfigured() && !process.env.FOURSQUARE_API_KEY
        ? "Restaurant discovery is not configured."
        : "No restaurants found.",
    } satisfies RestaurantSearchResponse,
    { status: 200 },
  );
}
