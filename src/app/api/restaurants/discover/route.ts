/**
 * Restaurant discovery API — orchestrates Google Places → Yelp → Foursquare.
 *
 * Returns 200 with graceful degradation when a single provider is unavailable.
 * Returns 503 only when an unexpected runtime error occurs in the orchestrator.
 *
 * @file src/app/api/restaurants/discover/route.ts
 */

import { NextResponse } from "next/server";
import {
  discoverRestaurants,
  emptyCosmicContext,
} from "@/services/restaurantDiscoveryService";
import type { RestaurantSearchResponse } from "@/types/yelp";
import type { NextRequest } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

interface DiscoverBody {
  cuisine?: unknown;
  latitude?: unknown;
  longitude?: unknown;
  radius?: unknown;
  limit?: unknown;
}

function numberFrom(value: unknown): number | null {
  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function textValue(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

async function discover(input: DiscoverBody) {
  const latitude = numberFrom(input.latitude);
  const longitude = numberFrom(input.longitude);

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

  try {
    const data = await discoverRestaurants({
      cuisine: textValue(input.cuisine),
      latitude,
      longitude,
      radiusMeters: numberFrom(input.radius) ?? undefined,
      limit: numberFrom(input.limit) ?? undefined,
    });
    return NextResponse.json(data, { status: 200 });
  } catch (err) {
    console.error("[api/restaurants/discover] orchestrator failed:", err);
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

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  return discover({
    cuisine: searchParams.get("cuisine"),
    latitude: searchParams.get("lat"),
    longitude: searchParams.get("lng"),
    radius: searchParams.get("radius"),
    limit: searchParams.get("limit"),
  });
}

export async function POST(request: NextRequest) {
  let body: DiscoverBody;
  try {
    body = (await request.json()) as DiscoverBody;
  } catch {
    return NextResponse.json(
      {
        restaurants: [],
        cosmicContext: emptyCosmicContext(),
        source: "google",
        error: "Invalid JSON body",
      } satisfies RestaurantSearchResponse,
      { status: 400 },
    );
  }

  return discover(body);
}
