/**
 * Restaurant Search API Route
 *
 * GET  /api/restaurants/search?query=...&near=...
 *   → Foursquare Places v3 text search (used by profile RestaurantSearch UI).
 *
 * POST /api/restaurants/search
 *   Body: { cuisineType, latitude, longitude, radius?, limit? }
 *   → Same orchestrator as /api/restaurants/discover (Google → Yelp → Foursquare).
 *
 * Both API keys (FOURSQUARE_API_KEY, YELP_API_KEY) live server-side only.
 */

import { NextResponse } from "next/server";
import {
  discoverRestaurants,
  emptyCosmicContext,
} from "@/services/restaurantDiscoveryService";
import type { RestaurantSearchResponse } from "@/types/yelp";
import type { NextRequest } from "next/server";

export const dynamic = "force-dynamic";

const FOURSQUARE_BASE = "https://api.foursquare.com/v3/places/search";
const RESTAURANT_CATEGORY_ID = "13065"; // Foursquare "Dining and Drinking" parent

// ─── Foursquare text-search GET (used by Profile > Restaurants UI) ─────────

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
  link?: string;
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
    params.set("fields", "fsq_id,name,location,categories,rating,distance,link");
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
      link: place.link ? `https://foursquare.com${place.link}` : undefined,
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

// ─── Cosmic-scored POST (alias of /api/restaurants/discover) ───────────────

interface ScoredSearchBody {
  cuisineType?: unknown;
  latitude?: unknown;
  longitude?: unknown;
  radius?: unknown;
  limit?: unknown;
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
      : undefined;

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

  try {
    const data = await discoverRestaurants({
      cuisine: cuisineType,
      latitude,
      longitude,
      radiusMeters: radius,
      limit,
    });
    return NextResponse.json(data, { status: 200 });
  } catch (err) {
    console.error("[api/restaurants/search] orchestrator failed:", err);
    return NextResponse.json(
      {
        restaurants: [],
        cosmicContext: emptyCosmicContext(),
        error: "Restaurant discovery failed unexpectedly. Please try again.",
      } satisfies RestaurantSearchResponse,
      { status: 503 },
    );
  }
}
