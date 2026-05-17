/**
 * Google Places (New) restaurant discovery.
 *
 * Uses Nearby Search at request time, then annotates results with local
 * partner metadata from Postgres. API keys stay server-side.
 *
 * @file src/app/api/restaurants/discover/route.ts
 */

import { NextResponse } from "next/server";
import { executeQuery } from "@/lib/database/connection";
import type {
  AlchmScoredRestaurant,
  RestaurantSearchResponse,
  YelpBusiness,
} from "@/types/yelp";
import type { NextRequest } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const GOOGLE_NEARBY_URL = "https://places.googleapis.com/v1/places:searchNearby";
const GOOGLE_TEXT_URL = "https://places.googleapis.com/v1/places:searchText";
const DEFAULT_RADIUS_METERS = 2000;
const DEFAULT_LIMIT = 20;
const GOOGLE_FIELD_MASK = [
  "places.id",
  "places.displayName",
  "places.formattedAddress",
  "places.rating",
  "places.photos",
  "places.primaryType",
  "places.primaryTypeDisplayName",
  "places.types",
].join(",");

interface DiscoverBody {
  cuisine?: unknown;
  latitude?: unknown;
  longitude?: unknown;
  radius?: unknown;
  limit?: unknown;
}

interface GooglePlaceRaw {
  id?: string;
  displayName?: { text?: string };
  formattedAddress?: string;
  rating?: number;
  photos?: Array<{ name?: string }>;
  primaryType?: string;
  primaryTypeDisplayName?: { text?: string };
  types?: string[];
}

interface NormalizedGoogleRestaurant {
  externalId: string;
  name: string;
  address: string;
  rating: number;
  imageUrl?: string;
  business: YelpBusiness;
  cuisineLabel?: string;
  primaryType?: string;
}

const PLACE_TYPE_TO_CUISINE: Record<string, string> = {
  italian_restaurant: "Italian",
  pizza_restaurant: "Italian",
  chinese_restaurant: "Chinese",
  japanese_restaurant: "Japanese",
  sushi_restaurant: "Japanese",
  ramen_restaurant: "Japanese",
  korean_restaurant: "Korean",
  thai_restaurant: "Thai",
  vietnamese_restaurant: "Vietnamese",
  indian_restaurant: "Indian",
  mexican_restaurant: "Mexican",
  american_restaurant: "American",
  hamburger_restaurant: "American",
  steak_house: "American",
  french_restaurant: "French",
  greek_restaurant: "Greek",
  mediterranean_restaurant: "Middle Eastern",
  middle_eastern_restaurant: "Middle Eastern",
  lebanese_restaurant: "Middle Eastern",
  turkish_restaurant: "Middle Eastern",
  african_restaurant: "African",
  ethiopian_restaurant: "African",
  russian_restaurant: "Russian",
  seafood_restaurant: "Seafood",
  vegetarian_restaurant: "Vegetarian",
  vegan_restaurant: "Vegan",
  brunch_restaurant: "Brunch",
  breakfast_restaurant: "Breakfast",
  bakery: "Bakery",
  cafe: "Café",
  coffee_shop: "Café",
  bar: "Bar",
  fast_food_restaurant: "Fast Food",
};

function deriveCuisineLabel(raw: GooglePlaceRaw): string | undefined {
  if (raw.primaryType && PLACE_TYPE_TO_CUISINE[raw.primaryType]) {
    return PLACE_TYPE_TO_CUISINE[raw.primaryType];
  }
  if (raw.primaryTypeDisplayName?.text) {
    return raw.primaryTypeDisplayName.text;
  }
  if (Array.isArray(raw.types)) {
    for (const t of raw.types) {
      if (PLACE_TYPE_TO_CUISINE[t]) return PLACE_TYPE_TO_CUISINE[t];
    }
  }
  return undefined;
}

interface PartnerRestaurantRow {
  internal_restaurant_id: string;
  external_id: string;
  stripe_connect_account_id: string | null;
  deliverect_location_id: string | null;
}

function numberFrom(value: unknown): number | null {
  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function text(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function emptyCosmicContext() {
  return { currentZodiac: "", planetaryHour: "", dominantElement: "" };
}

function cuisineQuery(value: unknown): string {
  const cuisine = text(value);
  return cuisine ? `${cuisine} restaurants` : "";
}

function googleMapsUrl(name: string, address: string): string {
  const query = encodeURIComponent([name, address].filter(Boolean).join(" "));
  return `https://www.google.com/maps/search/?api=1&query=${query}`;
}

function normalizeGooglePlace(raw: GooglePlaceRaw): NormalizedGoogleRestaurant | null {
  const externalId = text(raw.id);
  const name = text(raw.displayName?.text);
  const address = text(raw.formattedAddress);
  if (!externalId || !name) return null;

  const business: YelpBusiness = {
    id: externalId,
    name,
    url: googleMapsUrl(name, address),
    phone: "",
    rating: numberFrom(raw.rating) ?? 0,
    review_count: 0,
    categories: [{ alias: "restaurant", title: "Restaurant" }],
    location: {
      address1: address,
      city: "",
      state: "",
      zip_code: "",
      display_address: address ? [address] : [],
    },
    coordinates: { latitude: 0, longitude: 0 },
    image_url: undefined,
    is_closed: false,
  };

  return {
    externalId,
    name,
    address,
    rating: business.rating,
    imageUrl: undefined,
    business,
    cuisineLabel: deriveCuisineLabel(raw),
    primaryType: raw.primaryType,
  };
}

function toEntry(
  restaurant: NormalizedGoogleRestaurant,
  partner?: PartnerRestaurantRow,
): AlchmScoredRestaurant {
  const isPartner = Boolean(partner?.stripe_connect_account_id);

  return {
    externalId: restaurant.externalId,
    name: restaurant.name,
    address: restaurant.address,
    rating: restaurant.rating,
    imageUrl: restaurant.imageUrl,
    business: restaurant.business,
    isPartner,
    partnerRestaurantId: isPartner ? partner?.internal_restaurant_id : undefined,
    stripeConnectAccountId: isPartner
      ? partner?.stripe_connect_account_id ?? undefined
      : undefined,
    deliverectLocationId: isPartner
      ? partner?.deliverect_location_id ?? undefined
      : undefined,
    alchmScore: 0,
    elementalMatch: 0,
    planetaryAlignment: 0,
    monicaCompatibility: 0,
    dominantElement: "Earth",
    matchReasons: isPartner
      ? ["Partner restaurant with in-app menu ordering"]
      : ["Nearby restaurant from Google Places"],
    cuisineElement: { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 },
    cuisineLabel: restaurant.cuisineLabel,
    primaryType: restaurant.primaryType,
  };
}

async function fetchGoogleNearby(
  cuisine: string,
  latitude: number,
  longitude: number,
  radiusMeters: number,
  limit: number,
): Promise<{
  restaurants: NormalizedGoogleRestaurant[];
  sourceNotice?: string;
  error?: string;
}> {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  if (!apiKey) {
    return {
      restaurants: [],
      error: "Google Places integration is not configured.",
    };
  }

  try {
    const isCuisineSearch = cuisine.length > 0;
    const response = await fetch(isCuisineSearch ? GOOGLE_TEXT_URL : GOOGLE_NEARBY_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": apiKey,
        "X-Goog-FieldMask": GOOGLE_FIELD_MASK,
      },
      body: JSON.stringify(
        isCuisineSearch
          ? {
              textQuery: cuisine,
              maxResultCount: limit,
              locationBias: {
                circle: {
                  center: { latitude, longitude },
                  radius: radiusMeters,
                },
              },
            }
          : {
              includedTypes: ["restaurant"],
              maxResultCount: limit,
              locationRestriction: {
                circle: {
                  center: { latitude, longitude },
                  radius: radiusMeters,
                },
              },
            },
      ),
      signal: AbortSignal.timeout(8000),
    });

    if (!response.ok) {
      const body = await response.text().catch(() => "");
      return {
        restaurants: [],
        sourceNotice: `Google Places returned ${response.status}: ${body.slice(0, 160)}`,
      };
    }

    const data = (await response.json()) as { places?: GooglePlaceRaw[] };
    return {
      restaurants: (data.places ?? []).flatMap((place) => {
        const normalized = normalizeGooglePlace(place);
        return normalized ? [normalized] : [];
      }),
    };
  } catch (error) {
    const timedOut =
      error instanceof DOMException && error.name === "TimeoutError";
    return {
      restaurants: [],
      sourceNotice: timedOut
        ? "Google Places request timed out."
        : error instanceof Error
          ? `Google Places request failed: ${error.message}`
          : "Google Places request failed.",
    };
  }
}

async function findGooglePartners(
  externalIds: string[],
): Promise<Map<string, PartnerRestaurantRow>> {
  if (externalIds.length === 0) return new Map();

  const result = await executeQuery<PartnerRestaurantRow>(
    `SELECT id AS internal_restaurant_id,
            external_id,
            stripe_connect_account_id,
            deliverect_location_id
     FROM restaurants
     WHERE external_provider = 'google'
       AND external_id = ANY($1)`,
    [externalIds],
  );

  return new Map(result.rows.map((row) => [row.external_id, row]));
}

async function discover(input: DiscoverBody) {
  const cuisine = cuisineQuery(input.cuisine);
  const latitude = numberFrom(input.latitude);
  const longitude = numberFrom(input.longitude);
  const radiusMeters = Math.min(
    Math.max(numberFrom(input.radius) ?? DEFAULT_RADIUS_METERS, 100),
    50000,
  );
  const limit = Math.min(Math.max(numberFrom(input.limit) ?? DEFAULT_LIMIT, 1), 20);

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

  const { restaurants: normalized, sourceNotice, error } = await fetchGoogleNearby(
    cuisine,
    latitude,
    longitude,
    radiusMeters,
    limit,
  );

  if (error) {
    return NextResponse.json(
      {
        restaurants: [],
        cosmicContext: emptyCosmicContext(),
        source: "google",
        error,
      } satisfies RestaurantSearchResponse,
      { status: 503 },
    );
  }

  const partnerMap = await findGooglePartners(
    normalized.map((restaurant) => restaurant.externalId),
  ).catch((error) => {
    console.warn(
      "[api/restaurants/discover] Partner lookup failed:",
      error instanceof Error ? error.message : error,
    );
    return new Map<string, PartnerRestaurantRow>();
  });

  const restaurants = normalized.map((restaurant) =>
    toEntry(restaurant, partnerMap.get(restaurant.externalId)),
  );

  return NextResponse.json(
    {
      restaurants,
      cosmicContext: emptyCosmicContext(),
      source: "google",
      sourceNotice,
    } satisfies RestaurantSearchResponse,
    { status: 200 },
  );
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
