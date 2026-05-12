/**
 * Yelp restaurant discovery.
 *
 * Uses Yelp Fusion at request time, then annotates results with local partner
 * metadata from Postgres. API keys stay server-side.
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

const YELP_SEARCH_URL = "https://api.yelp.com/v3/businesses/search";
const DEFAULT_RADIUS_METERS = 2000;
const DEFAULT_LIMIT = 20;

interface DiscoverBody {
  latitude?: unknown;
  longitude?: unknown;
  radius?: unknown;
  limit?: unknown;
}

interface YelpBusinessRaw {
  id?: string;
  name?: string;
  image_url?: string;
  url?: string;
  rating?: number;
  review_count?: number;
  price?: string;
  distance?: number;
  phone?: string;
  categories?: Array<{ alias?: string; title?: string }>;
  coordinates?: {
    latitude?: number;
    longitude?: number;
  };
  location?: {
    address1?: string;
    city?: string;
    state?: string;
    zip_code?: string;
    display_address?: string[];
  };
  is_closed?: boolean;
}

interface NormalizedYelpRestaurant {
  externalId: string;
  name: string;
  imageUrl?: string;
  address: string;
  rating: number;
  business: YelpBusiness;
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

function normalizeYelpBusiness(raw: YelpBusinessRaw): NormalizedYelpRestaurant | null {
  const externalId = text(raw.id);
  const name = text(raw.name);
  if (!externalId || !name) return null;

  const displayAddress = Array.isArray(raw.location?.display_address)
    ? raw.location.display_address.filter((part): part is string => Boolean(part))
    : [];

  const business: YelpBusiness = {
    id: externalId,
    name,
    url: text(raw.url) || `https://www.yelp.com/biz/${encodeURIComponent(externalId)}`,
    phone: text(raw.phone),
    rating: numberFrom(raw.rating) ?? 0,
    review_count: Math.max(Math.trunc(numberFrom(raw.review_count) ?? 0), 0),
    price: text(raw.price) || undefined,
    distance: numberFrom(raw.distance) ?? undefined,
    categories: (raw.categories ?? []).flatMap((category) => {
      const title = text(category.title);
      if (!title) return [];
      return [{ alias: text(category.alias) || title.toLowerCase(), title }];
    }),
    location: {
      address1: text(raw.location?.address1),
      city: text(raw.location?.city),
      state: text(raw.location?.state),
      zip_code: text(raw.location?.zip_code),
      display_address: displayAddress,
    },
    coordinates: {
      latitude: numberFrom(raw.coordinates?.latitude) ?? 0,
      longitude: numberFrom(raw.coordinates?.longitude) ?? 0,
    },
    image_url: text(raw.image_url) || undefined,
    is_closed: raw.is_closed === true,
  };

  return {
    externalId,
    name,
    imageUrl: business.image_url,
    address: displayAddress.join(", "),
    rating: business.rating,
    business,
  };
}

function neutralEntry(
  restaurant: NormalizedYelpRestaurant,
  partner?: PartnerRestaurantRow,
): AlchmScoredRestaurant {
  const isPartner = Boolean(partner?.stripe_connect_account_id);

  return {
    externalId: restaurant.externalId,
    name: restaurant.name,
    imageUrl: restaurant.imageUrl,
    address: restaurant.address,
    rating: restaurant.rating,
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
      : ["Nearby restaurant from Yelp"],
    cuisineElement: { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 },
  };
}

async function fetchYelpBusinesses(input: {
  latitude: number;
  longitude: number;
  radiusMeters: number;
  limit: number;
}): Promise<{ restaurants: NormalizedYelpRestaurant[]; sourceNotice?: string }> {
  const apiKey = process.env.YELP_API_KEY;
  if (!apiKey) {
    return {
      restaurants: [],
      sourceNotice: "YELP_API_KEY is not configured.",
    };
  }

  const params = new URLSearchParams({
    latitude: String(input.latitude),
    longitude: String(input.longitude),
    radius: String(input.radiusMeters),
    categories: "restaurants",
    limit: String(input.limit),
  });

  try {
    const response = await fetch(`${YELP_SEARCH_URL}?${params.toString()}`, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        Accept: "application/json",
      },
      signal: AbortSignal.timeout(8000),
    });

    if (!response.ok) {
      const body = await response.text().catch(() => "");
      return {
        restaurants: [],
        sourceNotice: `Yelp returned ${response.status}: ${body.slice(0, 160)}`,
      };
    }

    const data = (await response.json()) as { businesses?: YelpBusinessRaw[] };
    return {
      restaurants: (data.businesses ?? [])
        .filter((business) => business.is_closed !== true)
        .flatMap((business) => {
          const normalized = normalizeYelpBusiness(business);
          return normalized ? [normalized] : [];
        }),
    };
  } catch (error) {
    const timedOut =
      error instanceof DOMException && error.name === "TimeoutError";
    return {
      restaurants: [],
      sourceNotice: timedOut
        ? "Yelp request timed out."
        : error instanceof Error
          ? `Yelp request failed: ${error.message}`
          : "Yelp request failed.",
    };
  }
}

async function findYelpPartners(
  yelpIds: string[],
): Promise<Map<string, PartnerRestaurantRow>> {
  if (yelpIds.length === 0) return new Map();

  const result = await executeQuery<PartnerRestaurantRow>(
    `SELECT id AS internal_restaurant_id,
            external_id,
            stripe_connect_account_id,
            deliverect_location_id
     FROM restaurants
     WHERE external_provider = 'yelp'
       AND external_id = ANY($1)`,
    [yelpIds],
  );

  return new Map(result.rows.map((row) => [row.external_id, row]));
}

async function discover(input: DiscoverBody) {
  const latitude = numberFrom(input.latitude);
  const longitude = numberFrom(input.longitude);
  const radiusMeters = Math.min(
    Math.max(numberFrom(input.radius) ?? DEFAULT_RADIUS_METERS, 100),
    40000,
  );
  const limit = Math.min(Math.max(numberFrom(input.limit) ?? DEFAULT_LIMIT, 1), 50);

  if (latitude === null || longitude === null) {
    return NextResponse.json(
      {
        restaurants: [],
        cosmicContext: emptyCosmicContext(),
        source: "yelp",
        error: "lat and lng query parameters are required",
      } satisfies RestaurantSearchResponse,
      { status: 400 },
    );
  }

  const { restaurants: normalized, sourceNotice } = await fetchYelpBusinesses({
    latitude,
    longitude,
    radiusMeters,
    limit,
  });

  const partnerMap = await findYelpPartners(
    normalized.map((restaurant) => restaurant.externalId),
  ).catch((error) => {
    console.warn(
      "[api/restaurants/discover] Partner lookup failed:",
      error instanceof Error ? error.message : error,
    );
    return new Map<string, PartnerRestaurantRow>();
  });

  const restaurants = normalized.map((restaurant) =>
    neutralEntry(restaurant, partnerMap.get(restaurant.externalId)),
  );

  return NextResponse.json(
    {
      restaurants,
      cosmicContext: emptyCosmicContext(),
      source: "yelp",
      sourceNotice,
    } satisfies RestaurantSearchResponse,
    { status: 200 },
  );
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  return discover({
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
        source: "yelp",
        error: "Invalid JSON body",
      } satisfies RestaurantSearchResponse,
      { status: 400 },
    );
  }

  return discover(body);
}
