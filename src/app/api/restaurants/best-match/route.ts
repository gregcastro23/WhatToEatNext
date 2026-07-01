/**
 * Best Match restaurant API — nearby restaurants for a cuisine, cosmic-scored
 * across ALL providers (Google → Yelp → Foursquare) and sortable.
 *
 * Unlike `/api/restaurants/discover` (which short-circuits on Google and leaves
 * results unscored), this route guarantees scored + sorted output so the Best
 * Match UI always has something to rank.
 *
 * GET /api/restaurants/best-match?cuisine=&lat=&lng=[&radius=&limit=&sort=&openNow=]
 *   sort ∈ match | distance | rating | price   (default: match)
 *
 * Returns 200 with graceful degradation; 503 only on unexpected orchestrator error.
 *
 * @file src/app/api/restaurants/best-match/route.ts
 */

import { NextResponse } from "next/server";
import {
  bestMatchRestaurants,
  emptyCosmicContext,
} from "@/services/restaurantDiscoveryService";
import type { BestMatchSort } from "@/services/restaurantDiscoveryService";
import type { RestaurantSearchResponse } from "@/types/yelp";
import type { NextRequest } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const VALID_SORTS: readonly BestMatchSort[] = [
  "match",
  "distance",
  "rating",
  "price",
];

// ─── Tiny in-memory TTL cache (protects the Yelp 500/day quota) ─────────────
// Keyed on (cuisine | rounded-lat | rounded-lng | sort | openNow | hour).
// Per-instance only — best-effort, not a shared cache.
const CACHE_TTL_MS = 5 * 60 * 1000;
const cache = new Map<string, { at: number; data: RestaurantSearchResponse }>();

function cacheKey(
  cuisine: string,
  lat: number,
  lng: number,
  radius: number | null,
  limit: number | null,
  sort: BestMatchSort,
  openNow: boolean,
): string {
  // Round coordinates to ~1km so nearby requests share a cache entry, and bucket
  // by the wall-clock hour so cosmic scoring refreshes each planetary hour.
  const rLat = lat.toFixed(2);
  const rLng = lng.toFixed(2);
  const hour = Math.floor(Date.now() / (60 * 60 * 1000));
  return [
    cuisine.toLowerCase(),
    rLat,
    rLng,
    radius ?? "",
    limit ?? "",
    sort,
    openNow ? "1" : "0",
    hour,
  ].join("|");
}

function numberFrom(value: unknown): number | null {
  // NB: a missing search param is `null`, and `Number(null) === 0` — so guard
  // empty/null explicitly, else an absent `limit` becomes 0 → clamped to 1.
  if (value === null || value === undefined || value === "") return null;
  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function sortFrom(value: string | null): BestMatchSort {
  return value && (VALID_SORTS as readonly string[]).includes(value)
    ? (value as BestMatchSort)
    : "match";
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  const cuisine = (searchParams.get("cuisine") ?? "").trim();
  const latitude = numberFrom(searchParams.get("lat"));
  const longitude = numberFrom(searchParams.get("lng"));
  const radius = numberFrom(searchParams.get("radius"));
  const limit = numberFrom(searchParams.get("limit"));
  const sort = sortFrom(searchParams.get("sort"));
  const openNow = searchParams.get("openNow") === "true";

  if (latitude === null || longitude === null) {
    return NextResponse.json(
      {
        restaurants: [],
        cosmicContext: emptyCosmicContext(),
        source: "google",
        error: "lat and lng query parameters are required",
      } satisfies RestaurantSearchResponse,
      { status: 400 },
    );
  }

  const key = cacheKey(cuisine, latitude, longitude, radius, limit, sort, openNow);
  const hit = cache.get(key);
  if (hit && Date.now() - hit.at < CACHE_TTL_MS) {
    return NextResponse.json(hit.data, { status: 200 });
  }

  try {
    const data = await bestMatchRestaurants({
      cuisine,
      latitude,
      longitude,
      radiusMeters: radius ?? undefined,
      limit: limit ?? undefined,
      sort,
      openNow,
    });

    // Only cache successful, non-empty results — but NEVER cache Tripadvisor:
    // its terms require rating/review/photo data to be fetched fresh per display.
    if (
      !data.error &&
      data.restaurants.length > 0 &&
      data.source !== "tripadvisor"
    ) {
      cache.set(key, { at: Date.now(), data });
    }

    return NextResponse.json(data, { status: 200 });
  } catch (err) {
    console.error("[api/restaurants/best-match] orchestrator failed:", err);
    return NextResponse.json(
      {
        restaurants: [],
        cosmicContext: emptyCosmicContext(),
        source: "google",
        error: "Restaurant discovery failed unexpectedly. Please try again.",
      } satisfies RestaurantSearchResponse,
      { status: 503 },
    );
  }
}
