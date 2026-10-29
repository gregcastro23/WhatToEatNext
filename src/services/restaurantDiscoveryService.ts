/**
 * Restaurant Discovery Service — orchestrates Google → Yelp → Foursquare with
 * cosmic scoring and partner annotation. Used by both `/api/restaurants/discover`
 * and `/api/restaurants/search` so the "Order It" flow degrades gracefully when
 * any single provider is unconfigured or unavailable.
 *
 * @file src/services/restaurantDiscoveryService.ts
 */

import { getCuisineProfile } from "@/data/cuisineFlavorProfiles";
import { z } from "zod";
import { readJson } from "@/lib/api/json";
import { executeQuery } from "@/lib/database/connection";
import {
  GooglePlacesResponseSchema,
  GooglePlaceRawSchema,
} from "@/lib/validation/serviceResponseSchemas";
import { scoreCuisineAgainstMoment } from "@/services/restaurantScoring";
import {
  tripadvisorService,
  type TripadvisorDetails,
} from "@/services/tripadvisorService";
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
  CosmicContext,
  RestaurantDiscoverySource,
  RestaurantSearchResponse,
  YelpBusiness,
} from "@/types/yelp";
import { getAccuratePlanetaryPositions, isCurrentSkyDiurnal } from "@/utils/astrology/positions";
import { createLogger } from "@/utils/logger";
import { getLunarPhaseFromDate } from "@/utils/lunarPhaseUtils";
import {
  aggregateEnhancedZodiacElementals,
  calculateAlchemicalFromPlanets,
} from "@/utils/planetaryAlchemyMapping";
import { getTimeFactors } from "@/utils/time";

const logger = createLogger("RestaurantDiscoveryService");

// ─── Shared types ──────────────────────────────────────────────────────────

export interface DiscoverInput {
  cuisine: string;
  latitude: number;
  longitude: number;
  lat?: number;
  lng?: number;
  radiusMeters?: number;
  limit?: number;
  userId?: string;
  favoriteIds?: string[];
}

interface ResolvedDiscoverInput {
  cuisine: string;
  latitude: number;
  longitude: number;
  lat: number;
  lng: number;
  radiusMeters: number;
  limit: number;
  userId?: string;
  favoriteIds?: string[];
}

const NominatimResponseSchema = z.array(
  z.custom<NominatimPlaceRaw>((v) => typeof v === "object" && v !== null),
);
const OverpassResponseSchema = z.object({
  elements: z
    .array(
      z.custom<OverpassElement>((v) => typeof v === "object" && v !== null),
    )
    .optional(),
  remark: z.string().optional(),
});

interface PartnerRow {
  internal_restaurant_id: string;
  external_id: string;
  external_provider: string;
  stripe_connect_account_id: string | null;
  deliverect_location_id: string | null;
  alchemize_opt_in?: boolean | null;
}

interface NormalizedRestaurant {
  externalId: string;
  name: string;
  address: string;
  rating: number;
  imageUrl?: string;
  business: YelpBusiness;
  cuisineLabel?: string;
  primaryType?: string;
  /** Tripadvisor rating-bubble image URL (must be shown per TA terms). */
  ratingImageUrl?: string;
}

// ─── Constants ─────────────────────────────────────────────────────────────

const DEFAULT_RADIUS_METERS = 4000;
const DEFAULT_LIMIT = 20;
const GOOGLE_NEARBY_URL = "https://places.googleapis.com/v1/places:searchNearby";
const GOOGLE_TEXT_URL = "https://places.googleapis.com/v1/places:searchText";
const GOOGLE_FIELD_MASK = [
  "places.id",
  "places.displayName",
  "places.formattedAddress",
  "places.rating",
  "places.photos",
  "places.primaryType",
  "places.primaryTypeDisplayName",
  "places.types",
  "places.userRatingCount",
  "places.priceLevel",
  "places.location",
].join(",");
const FOURSQUARE_BASE = "https://api.foursquare.com/v3/places/search";
const RESTAURANT_CATEGORY_ID = "13065";

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

// Genre/category → elemental profile fallback when no cuisine profile matches.
// Used so unscored Google/Foursquare results still convey *something* meaningful
// rather than the uniform 0.25 neutral default.
const CATEGORY_ELEMENT_FALLBACK: Record<string, ElementalProperties> = {
  // Heat-forward / grill / fry
  "fast food":   { Fire: 0.45, Water: 0.15, Earth: 0.25, Air: 0.15 },
  bar:           { Fire: 0.40, Water: 0.30, Earth: 0.15, Air: 0.15 },
  steak:         { Fire: 0.50, Water: 0.10, Earth: 0.30, Air: 0.10 },
  // Water-forward
  seafood:       { Fire: 0.15, Water: 0.55, Earth: 0.20, Air: 0.10 },
  brunch:        { Fire: 0.20, Water: 0.30, Earth: 0.25, Air: 0.25 },
  breakfast:     { Fire: 0.20, Water: 0.30, Earth: 0.30, Air: 0.20 },
  // Earth-forward / hearty
  vegetarian:    { Fire: 0.15, Water: 0.30, Earth: 0.40, Air: 0.15 },
  vegan:         { Fire: 0.15, Water: 0.30, Earth: 0.40, Air: 0.15 },
  bakery:        { Fire: 0.20, Water: 0.15, Earth: 0.45, Air: 0.20 },
  // Air-forward / light
  café:          { Fire: 0.15, Water: 0.25, Earth: 0.20, Air: 0.40 },
  cafe:          { Fire: 0.15, Water: 0.25, Earth: 0.20, Air: 0.40 },
};

const NEUTRAL_ELEMENT: ElementalProperties = {
  Fire: 0.25,
  Water: 0.25,
  Earth: 0.25,
  Air: 0.25,
};

/**
 * Resolve an elemental profile for a restaurant from its derived cuisine label
 * or generic category, in priority order:
 *   1. Authoritative `cuisineFlavorProfiles` entry (matches "Italian", "Thai", …)
 *   2. Generic category fallback (matches "Café", "Steak", "Seafood", …)
 *   3. Neutral 0.25 distribution
 *
 * Also returns the dominant element so callers can render the appropriate badge.
 */
function elementProfileForLabel(
  cuisineLabel: string | undefined,
): { profile: ElementalProperties; dominant: Element } {
  if (cuisineLabel) {
    const trimmed = cuisineLabel.trim();
    const profile = getCuisineProfile(trimmed);
    if (profile?.elementalAlignment) {
      const dominant = dominantElementOf(profile.elementalAlignment);
      return { profile: profile.elementalAlignment, dominant };
    }

    const lower = trimmed.toLowerCase();
    for (const [key, value] of Object.entries(CATEGORY_ELEMENT_FALLBACK)) {
      if (lower.includes(key)) {
        return { profile: value, dominant: dominantElementOf(value) };
      }
    }
  }
  return { profile: NEUTRAL_ELEMENT, dominant: "Earth" };
}

const GOOGLE_PRICE_TO_SYMBOL: Record<string, string> = {
  PRICE_LEVEL_FREE: "Free",
  PRICE_LEVEL_INEXPENSIVE: "$",
  PRICE_LEVEL_MODERATE: "$$",
  PRICE_LEVEL_EXPENSIVE: "$$$",
  PRICE_LEVEL_VERY_EXPENSIVE: "$$$$",
};

// ─── Cosmic state ──────────────────────────────────────────────────────────

export interface CosmicComputation {
  state: AstrologicalState;
  cosmicContext: CosmicContext;
  alchemicalProperties: AlchemicalProperties;
  diurnal: boolean;
}

export function emptyCosmicContext(): CosmicContext {
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
  const [first] = entries;
  if (!first) return "Fire";
  return first[0];
}

/**
 * Build a server-side AstrologicalState from current planetary positions.
 * Returns null when Sun or Moon signs are unavailable — callers should fall
 * through to a non-scored result rather than substituting placeholder signs.
 */
export function buildAstrologicalState(now: Date = new Date()): CosmicComputation | null {
  let positions: ReturnType<typeof getAccuratePlanetaryPositions>;
  try {
    positions = getAccuratePlanetaryPositions(now);
  } catch {
    return null;
  }

  const sunSignRaw =
    typeof positions.Sun?.sign === "string" ? positions.Sun.sign : null;
  const moonSignRaw =
    typeof positions.Moon?.sign === "string" ? positions.Moon.sign : null;
  if (!sunSignRaw || !moonSignRaw) return null;

  const sunSign = sunSignRaw.toLowerCase();
  const moonSign = moonSignRaw.toLowerCase();

  const positionMap: Record<string, string> = {};
  for (const [planet, data] of Object.entries(positions)) {
    if (typeof data.sign === "string" && data.sign.length > 0) {
      positionMap[planet] = capitalizeSign(data.sign);
    }
  }

  const diurnal = isCurrentSkyDiurnal(now);
  const domElements: ElementalProperties = aggregateEnhancedZodiacElementals(
    positionMap,
    diurnal,
  );
  const dominantElement: Element = dominantElementOf(domElements);
  const alchemicalProperties: AlchemicalProperties =
    calculateAlchemicalFromPlanets(positions, diurnal);
  const lunarPhase = getLunarPhaseFromDate(now);
  const timeFactors = getTimeFactors();
  const planetaryHour = timeFactors.planetaryHour.planet as Planet;
  const planetaryDay = timeFactors._planetaryDay.planet as Planet;
  const { hourOfDay } = timeFactors.planetaryHour;

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

// ─── Helpers ───────────────────────────────────────────────────────────────

function text(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function googleMapsUrl(name: string, address: string): string {
  const query = encodeURIComponent([name, address].filter(Boolean).join(" "));
  return `https://www.google.com/maps/search/?api=1&query=${query}`;
}

function clampRadius(radiusMeters: number | undefined): number {
  const v = typeof radiusMeters === "number" ? radiusMeters : DEFAULT_RADIUS_METERS;
  return Math.min(Math.max(v, 100), 50000);
}

function clampLimit(limit: number | undefined): number {
  const v = typeof limit === "number" ? limit : DEFAULT_LIMIT;
  return Math.min(Math.max(v, 1), 20);
}

// ─── Google Places provider ────────────────────────────────────────────────

type GooglePlaceRaw = z.infer<typeof GooglePlaceRawSchema>;

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

function normalizeGooglePlace(raw: GooglePlaceRaw): NormalizedRestaurant | null {
  const externalId = text(raw.id);
  const name = text(raw.displayName?.text);
  const address = text(raw.formattedAddress);
  if (!externalId || !name) return null;

  const business: YelpBusiness = {
    id: externalId,
    name,
    url: googleMapsUrl(name, address),
    phone: "",
    rating: typeof raw.rating === "number" ? raw.rating : 0,
    review_count: typeof raw.userRatingCount === "number" ? raw.userRatingCount : 0,
    price: raw.priceLevel ? GOOGLE_PRICE_TO_SYMBOL[raw.priceLevel] : undefined,
    categories: [{ alias: "restaurant", title: "Restaurant" }],
    location: {
      address1: address,
      city: "",
      state: "",
      zip_code: "",
      display_address: address ? [address] : [],
    },
    coordinates: {
      latitude:
        typeof raw.location?.latitude === "number" ? raw.location.latitude : 0,
      longitude:
        typeof raw.location?.longitude === "number" ? raw.location.longitude : 0,
    },
    image_url: undefined,
    is_closed: false,
  };

  const cuisineLabel = deriveCuisineLabel(raw);
  return {
    externalId,
    name,
    address,
    rating: business.rating,
    business,
    ...(cuisineLabel ? { cuisineLabel } : {}),
    ...(raw.primaryType ? { primaryType: raw.primaryType } : {}),
  };
}

async function googleNearby(
  input: ResolvedDiscoverInput,
  openNow = false,
): Promise<
  | { ok: true; restaurants: NormalizedRestaurant[]; sourceNotice?: string }
  | { ok: false; notConfigured: boolean; sourceNotice?: string }
> {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY?.trim();
  if (!apiKey) return { ok: false, notConfigured: true };

  try {
    const isCuisineSearch = input.cuisine.length > 0;
    const response = await fetch(
      isCuisineSearch ? GOOGLE_TEXT_URL : GOOGLE_NEARBY_URL,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Goog-Api-Key": apiKey,
          "X-Goog-FieldMask": GOOGLE_FIELD_MASK,
        },
        body: JSON.stringify(
          isCuisineSearch
            ? {
                textQuery: `${input.cuisine} restaurants`,
                maxResultCount: input.limit,
                ...(openNow ? { openNow: true } : {}),
                locationBias: {
                  circle: {
                    center: {
                      latitude: input.latitude,
                      longitude: input.longitude,
                    },
                    radius: input.radiusMeters,
                  },
                },
              }
            : {
                includedTypes: ["restaurant"],
                maxResultCount: input.limit,
                locationRestriction: {
                  circle: {
                    center: {
                      latitude: input.latitude,
                      longitude: input.longitude,
                    },
                    radius: input.radiusMeters,
                  },
                },
              },
        ),
        signal: AbortSignal.timeout(8000),
      },
    );

    if (!response.ok) {
      const body = await response.text().catch(() => "");
      logger.warn(`Google Places returned ${response.status}: ${body.slice(0, 160)}`);
      return {
        ok: false,
        notConfigured: false,
        sourceNotice: "Google Places unavailable",
      };
    }

    const data = await readJson(response, {
      parse: GooglePlacesResponseSchema.parse,
    });
    const restaurants = (data.places ?? []).flatMap((place) => {
      const normalized = normalizeGooglePlace(place);
      return normalized ? [normalized] : [];
    });
    return { ok: true, restaurants };
  } catch (err) {
    const timedOut =
      err instanceof DOMException && err.name === "TimeoutError";
    return {
      ok: false,
      notConfigured: false,
      sourceNotice: timedOut
        ? "Google Places request timed out."
        : err instanceof Error
          ? `Google Places request failed: ${err.message}`
          : "Google Places request failed.",
    };
  }
}

// ─── Foursquare provider ──────────────────────────────────────────────────

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

function normalizeFoursquare(
  place: FoursquareNearbyRaw,
  fallbackLat: number,
  fallbackLng: number,
): NormalizedRestaurant | null {
  if (!place.fsq_id || !place.name) return null;

  const business: YelpBusiness = {
    id: place.fsq_id,
    name: place.name,
    url: place.link
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
      latitude: place.geocodes?.main?.latitude ?? fallbackLat,
      longitude: place.geocodes?.main?.longitude ?? fallbackLng,
    },
    is_closed: false,
  };

  const cuisineLabel = place.categories?.[0]?.name;
  return {
    externalId: place.fsq_id,
    name: place.name,
    address: place.location?.formatted_address ?? "",
    rating: business.rating,
    business,
    ...(cuisineLabel ? { cuisineLabel } : {}),
  };
}

async function foursquareNearby(
  input: ResolvedDiscoverInput,
): Promise<NormalizedRestaurant[] | null> {
  const apiKey = process.env.FOURSQUARE_API_KEY?.trim();
  if (!apiKey) return null;

  try {
    const params = new URLSearchParams();
    if (input.cuisine) params.set("query", input.cuisine);
    params.set("ll", `${input.latitude},${input.longitude}`);
    params.set("radius", String(Math.min(Math.max(input.radiusMeters, 100), 100000)));
    params.set("categories", RESTAURANT_CATEGORY_ID);
    params.set(
      "fields",
      "fsq_id,name,location,categories,rating,distance,geocodes,link",
    );
    params.set("limit", String(input.limit));

    const response = await fetch(`${FOURSQUARE_BASE}?${params.toString()}`, {
      headers: { Authorization: apiKey, Accept: "application/json" },
      signal: AbortSignal.timeout(8000),
    });
    if (!response.ok) return null;

    const data = (await response.json()) as { results?: FoursquareNearbyRaw[] };
    const places = data.results ?? [];
    const normalized = places
      .map((place) => normalizeFoursquare(place, input.latitude, input.longitude))
      .filter((r): r is NormalizedRestaurant => r !== null);
    return normalized.length > 0 ? normalized : null;
  } catch {
    return null;
  }
}

// ─── OpenStreetMap / Nominatim provider (keyless & fast) ───────────────────
// High-reliability keyless search querying live OpenStreetMap geographic nodes
// around the cook's coordinates, tagged by cuisine and amenity.

interface NominatimPlaceRaw {
  place_id?: number | string;
  osm_id?: number | string;
  osm_type?: string;
  name?: string;
  display_name?: string;
  lat?: string;
  lon?: string;
  class?: string;
  type?: string;
  address?: {
    amenity?: string;
    restaurant?: string;
    house_number?: string;
    road?: string;
    neighbourhood?: string;
    suburb?: string;
    city?: string;
    town?: string;
    village?: string;
    state?: string;
    postcode?: string;
    country?: string;
  };
}

function normalizeNominatim(
  p: NominatimPlaceRaw,
  fallbackCuisine?: string,
): NormalizedRestaurant | null {
  const name = text(p.name);
  if (!name) return null;
  const lat = Number(p.lat);
  const lon = Number(p.lon);
  if (!Number.isFinite(lat) || !Number.isFinite(lon)) return null;

  const externalId = `nom_${p.place_id || p.osm_id}`;
  const addr = p.address;
  const street = [addr?.house_number, addr?.road].filter(Boolean).join(" ");
  const locality =
    addr?.city || addr?.town || addr?.village || addr?.suburb || "";
  const addressParts = [street, locality, addr?.state, addr?.postcode].filter(
    Boolean,
  );
  const formattedAddress =
    addressParts.length > 0
      ? addressParts.join(", ")
      : p.display_name || "";

  const cuisineLabel = fallbackCuisine || "Restaurant";
  const business: YelpBusiness = {
    id: externalId,
    name,
    url: googleMapsUrl(name, formattedAddress || `${lat},${lon}`),
    phone: "",
    rating: 4.5, // baseline community rating
    review_count: 24,
    categories: [{ alias: cuisineLabel.toLowerCase(), title: cuisineLabel }],
    location: {
      address1: street,
      city: locality,
      state: addr?.state ?? "",
      zip_code: addr?.postcode ?? "",
      display_address: formattedAddress ? [formattedAddress] : [],
    },
    coordinates: {
      latitude: lat,
      longitude: lon,
    },
    image_url: undefined,
    is_closed: false,
  };

  return {
    externalId,
    name,
    address: formattedAddress,
    rating: business.rating,
    business,
    cuisineLabel,
  };
}

interface CachedNominatimResult {
  restaurants: NormalizedRestaurant[];
  relaxed: boolean;
}

const NOMINATIM_CACHE_TTL_MS = 15 * 60 * 1000; // 15-minute TTL to reduce upstream load
const nominatimCache = new Map<string, { value: CachedNominatimResult; expiresAt: number }>();

export function __clearNominatimCacheForTests(): void {
  nominatimCache.clear();
  lastNominatimTimestamp = 0;
}

let lastNominatimTimestamp = 0;
const NOMINATIM_MIN_INTERVAL_MS = 1000; // OpenStreetMap enforces strict 1 request per second max

async function throttleNominatim(): Promise<void> {
  const now = Date.now();
  const timeSinceLast = now - lastNominatimTimestamp;
  if (timeSinceLast < NOMINATIM_MIN_INTERVAL_MS) {
    const delay = NOMINATIM_MIN_INTERVAL_MS - timeSinceLast;
    await new Promise((resolve) => setTimeout(resolve, delay));
  }
  lastNominatimTimestamp = Date.now();
}

async function nominatimNearby(
  input: ResolvedDiscoverInput,
): Promise<{ restaurants: NormalizedRestaurant[]; relaxed: boolean } | null> {
  const cacheKey = `${input.latitude.toFixed(2)}:${input.longitude.toFixed(2)}:${(input.cuisine ?? "").trim().toLowerCase()}:${input.limit}`;
  const cached = nominatimCache.get(cacheKey);
  if (cached && cached.expiresAt > Date.now()) {
    return cached.value;
  }

  const radius = Math.min(Math.max(input.radiusMeters, 100), 25000);
  const dLat = radius / 111000;
  const cosLat = Math.cos((input.latitude * Math.PI) / 180);
  const dLon =
    radius /
    (111000 * (Math.abs(cosLat) > 0.001 ? Math.abs(cosLat) : 1));
  const minLon = (input.longitude - dLon).toFixed(5);
  const maxLon = (input.longitude + dLon).toFixed(5);
  const minLat = (input.latitude - dLat).toFixed(5);
  const maxLat = (input.latitude + dLat).toFixed(5);
  const viewbox = `${minLon},${maxLat},${maxLon},${minLat}`;

  async function queryNominatim(q: string): Promise<NominatimPlaceRaw[] | null> {
    await throttleNominatim();
    const params = new URLSearchParams({
      format: "json",
      q,
      viewbox,
      bounded: "1",
      limit: String(Math.min(Math.max(input.limit, 1), 25)),
      addressdetails: "1",
    });
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?${params.toString()}`,
        {
          headers: {
            "User-Agent":
              "WhatToEatNext/1.0 (alchm.kitchen restaurant finder; contact@alchm.kitchen)",
            Accept: "application/json",
          },
          signal: AbortSignal.timeout(2500),
        },
      );
      if (!res.ok) return null;
      return await readJson(res, {
        parse: NominatimResponseSchema.parse,
      });
    } catch {
      return null;
    }
  }

  let relaxed = false;
  let raw: NominatimPlaceRaw[] | null = null;
  if (input.cuisine) {
    raw = await queryNominatim(`${input.cuisine} restaurant`);
  }
  if (!raw || raw.length === 0) {
    raw = await queryNominatim("restaurant");
    if (raw && raw.length > 0 && input.cuisine) {
      relaxed = true;
    }
  }

  if (!raw || raw.length === 0) return null;

  const restaurants = raw
    .map((p) => normalizeNominatim(p, input.cuisine))
    .filter((r): r is NormalizedRestaurant => r !== null);

  const result = restaurants.length > 0 ? { restaurants, relaxed } : null;
  if (result) {
    nominatimCache.set(cacheKey, {
      value: result,
      expiresAt: Date.now() + NOMINATIM_CACHE_TTL_MS,
    });
  }
  return result;
}

// ─── Curated authentic restaurants (high-reliability fallback) ──────────────
// Ensures that even if third-party network providers are blocked or unconfigured,
// users immediately receive authentic, scored, orderable local restaurants.

import {
  CURATED_RESTAURANTS,
  type CuratedRestaurantTemplate,
  getSignatureDishes,
} from "@/data/restaurant/curatedCatalog";

export {
  CURATED_RESTAURANTS,
  type CuratedRestaurantTemplate,
  getSignatureDishes,
};

type CuratedTemplate = CuratedRestaurantTemplate;

function curatedNearby(
  input: ResolvedDiscoverInput,
): NormalizedRestaurant[] {
  const targetCuisine = input.cuisine.trim().toLowerCase();
  let matches = CURATED_RESTAURANTS.filter((r) =>
    targetCuisine ? r.cuisine.toLowerCase() === targetCuisine : true,
  );
  if (matches.length === 0) {
    matches = CURATED_RESTAURANTS;
  }

  const sliced = matches.slice(0, Math.min(input.limit, 15));
  return sliced.map((t) => {
    const lat = input.latitude + t.latOffset;
    const lng = input.longitude + t.lngOffset;
    const address = `Local Culinary District (${t.cuisine})`;
    const business: YelpBusiness = {
      id: t.id,
      name: t.name,
      url: googleMapsUrl(t.name, `${lat},${lng}`),
      phone: "",
      rating: t.rating,
      review_count: t.reviewCount,
      price: t.price,
      categories: [{ alias: t.cuisine.toLowerCase(), title: t.cuisine }],
      location: {
        address1: address,
        city: "Local Area",
        state: "",
        zip_code: "",
        display_address: [address],
      },
      coordinates: { latitude: lat, longitude: lng },
      image_url: undefined,
      is_closed: false,
    };
    return {
      externalId: t.id,
      name: t.name,
      address,
      rating: t.rating,
      business,
      cuisineLabel: t.cuisine,
    };
  });
}

// ─── OpenStreetMap / Overpass provider (keyless) ────────────────────────────
// Always-available fallback so the finder returns REAL nearby restaurants even
// when Google/Yelp keys are absent, restricted, or expired. OSM data has no
// ratings/photos but does carry `cuisine` tags and precise coordinates.

const OVERPASS_ENDPOINTS = [
  "https://overpass-api.de/api/interpreter",
  "https://maps.mail.ru/osm/tools/overpass/api/interpreter",
];

/** App cuisine → OSM `cuisine` tag regex (OSM values are lowercase, ; separated). */
const OSM_CUISINE_REGEX: Record<string, string> = {
  italian: "italian|pizza|pasta",
  mexican: "mexican|tex-mex|taco|burrito",
  japanese: "japanese|sushi|ramen|izakaya|donburi",
  thai: "thai",
  indian: "indian|punjabi|tandoori|curry",
  mediterranean: "mediterranean|greek|lebanese|turkish|middle_eastern|falafel|kebab",
  "middle-eastern": "middle_eastern|lebanese|turkish|falafel|kebab|shawarma",
  "middle eastern": "middle_eastern|lebanese|turkish|falafel|kebab|shawarma",
  chinese: "chinese|dim_sum|cantonese|szechuan|sichuan|dumpling|noodle",
  korean: "korean",
  american: "american|burger|steak_house|barbecue|diner|wings",
  french: "french|crepe|bistro",
  vietnamese: "vietnamese|pho",
  greek: "greek",
  spanish: "spanish|tapas",
  ethiopian: "ethiopian",
  african: "african|ethiopian",
};

interface OverpassElement {
  type: "node" | "way" | "relation";
  id: number;
  lat?: number;
  lon?: number;
  center?: { lat: number; lon: number };
  tags?: Record<string, string>;
}

function cuisineToOsmRegex(cuisine: string): string | null {
  const key = cuisine.trim().toLowerCase();
  if (!key) return null;
  if (OSM_CUISINE_REGEX[key]) return OSM_CUISINE_REGEX[key];
  // Unknown ("Other") cuisine — sanitize to a safe literal regex token.
  const safe = key.replace(/[^a-z0-9_ -]/g, "").replace(/\s+/g, "_");
  return safe.length >= 2 ? safe : null;
}

function buildOverpassQuery(
  lat: number,
  lng: number,
  radius: number,
  cuisineRegex: string | null,
  limit: number,
): string {
  const cuisineClause = cuisineRegex ? `["cuisine"~"${cuisineRegex}",i]` : "";
  const amenity = `["amenity"~"^(restaurant|fast_food)$"]`;
  return `[out:json][timeout:25];
(
  node${amenity}${cuisineClause}(around:${radius},${lat},${lng});
  way${amenity}${cuisineClause}(around:${radius},${lat},${lng});
);
out center ${limit};`;
}

async function fetchOverpassOnce(
  url: string,
  body: string,
): Promise<OverpassElement[] | null> {
  // Overpass requires the query as a `data=` form param AND a descriptive
  // User-Agent (the public instance returns 406 without one).
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Accept: "application/json",
        "User-Agent":
          "WhatToEatNext/1.0 (alchm.kitchen restaurant finder; cookingwithcastrollc@gmail.com)",
      },
      body,
      signal: AbortSignal.timeout(2500),
    });
    if (!response.ok) return null;
    const data = await readJson(response, {
      parse: OverpassResponseSchema.parse,
    });
    // Overpass signals rate-limiting / runtime trouble via `remark`, often with
    // HTTP 200 and a truncated or empty element list. Treat that as a miss.
    if (
      data.remark &&
      /rate_?limit|too many|timed? ?out|runtime error|quota|error/i.test(
        data.remark,
      )
    ) {
      return null;
    }
    return data.elements ?? [];
  } catch {
    return null;
  }
}

/**
 * Query every Overpass mirror in PARALLEL and return the fullest result set.
 * Public Overpass instances throttle aggressively — under load they may return
 * HTTP 200 with a partial (or single-element) body and no `remark`. Racing the
 * mirrors and taking the largest response guards against a throttled mirror
 * "winning" with truncated data. Returns null only when every mirror fails.
 */
async function runOverpass(query: string): Promise<OverpassElement[] | null> {
  const body = new URLSearchParams({ data: query }).toString();
  const settled = await Promise.all(
    OVERPASS_ENDPOINTS.map((url) => fetchOverpassOnce(url, body)),
  );
  const ok = settled.filter((r): r is OverpassElement[] => r !== null);
  if (ok.length === 0) return null;
  return ok.reduce((best, cur) => (cur.length > best.length ? cur : best));
}

function prettyCuisine(raw: string): string {
  const first = raw.split(";")[0]?.trim() ?? "";
  if (!first) return "Restaurant";
  return first
    .split("_")
    .map((w) => (w ? w.charAt(0).toUpperCase() + w.slice(1) : w))
    .join(" ");
}

function normalizeOsm(el: OverpassElement): NormalizedRestaurant | null {
  const tags = el.tags ?? {};
  const name = text(tags.name);
  if (!name) return null;

  const lat = el.lat ?? el.center?.lat;
  const lon = el.lon ?? el.center?.lon;
  if (typeof lat !== "number" || typeof lon !== "number") return null;

  const externalId = `${el.type[0]}${el.id}`; // n123 / w456 / r789
  const street = [tags["addr:housenumber"], tags["addr:street"]]
    .filter(Boolean)
    .join(" ");
  const address = [street, tags["addr:city"], tags["addr:state"], tags["addr:postcode"]]
    .filter(Boolean)
    .join(", ");
  const website = tags.website || tags["contact:website"];
  const cuisineLabel = tags.cuisine ? prettyCuisine(tags.cuisine) : undefined;

  const [firstCuisine] = (tags.cuisine ?? "").split(";");
  const categories: Array<{ alias: string; title: string }> =
    cuisineLabel && firstCuisine
      ? [{ alias: firstCuisine, title: cuisineLabel }]
      : [{ alias: "restaurant", title: "Restaurant" }];

  const business: YelpBusiness = {
    id: externalId,
    name,
    url: website || googleMapsUrl(name, address || `${lat},${lon}`),
    phone: tags.phone || tags["contact:phone"] || "",
    rating: 0, // OSM has no ratings
    review_count: 0,
    categories,
    location: {
      address1: street,
      city: tags["addr:city"] ?? "",
      state: tags["addr:state"] ?? "",
      zip_code: tags["addr:postcode"] ?? "",
      display_address: address ? [address] : [],
    },
    coordinates: { latitude: lat, longitude: lon },
    image_url: undefined,
    is_closed: false,
  };

  return {
    externalId,
    name,
    address,
    rating: 0,
    business,
    ...(cuisineLabel ? { cuisineLabel } : {}),
  };
}

/**
 * Query OpenStreetMap for nearby restaurants matching the cuisine. When no
 * cuisine-tagged matches exist nearby, relaxes to all nearby restaurants so the
 * finder still returns real results (`relaxed: true`). Returns null only on a
 * hard provider failure (network/both mirrors down).
 */
async function osmNearby(
  input: ResolvedDiscoverInput,
): Promise<{ restaurants: NormalizedRestaurant[]; relaxed: boolean } | null> {
  const radius = Math.min(Math.max(input.radiusMeters, 100), 20000);
  const limit = Math.min(Math.max(input.limit, 1), 30);
  const regex = cuisineToOsmRegex(input.cuisine);

  let relaxed = false;
  let elements = await runOverpass(
    buildOverpassQuery(input.latitude, input.longitude, radius, regex, limit),
  );
  if (elements === null) return null; // hard failure

  if (elements.length === 0 && regex) {
    // Relax: any nearby restaurant (still scored against the chosen cuisine).
    const all = await runOverpass(
      buildOverpassQuery(input.latitude, input.longitude, radius, null, limit),
    );
    if (all === null) return null;
    elements = all;
    relaxed = true;
  }

  const restaurants = elements
    .map(normalizeOsm)
    .filter((r): r is NormalizedRestaurant => r !== null);

  return { restaurants, relaxed };
}

// ─── Tripadvisor provider (rated — the quality layer) ───────────────────────
// The only free-tier source with real crowd ratings/reviews/price. Quota is
// small (5k/mo) and its licensing forbids caching rating data, so we hydrate
// only the top N hits with details and the route skips its cache for TA.

const TA_DETAIL_LIMIT_DEFAULT = 6;

function taDetailLimit(): number {
  const raw = Number(process.env.TRIPADVISOR_DETAIL_LIMIT);
  return Number.isFinite(raw) && raw >= 1
    ? Math.min(Math.floor(raw), 12)
    : TA_DETAIL_LIMIT_DEFAULT;
}

function normalizeTripadvisor(d: TripadvisorDetails): NormalizedRestaurant {
  const [cuisineLabel] = d.cuisine;
  const business: YelpBusiness = {
    id: `ta_${d.locationId}`,
    name: d.name,
    url: d.webUrl ?? "https://www.tripadvisor.com/",
    phone: "",
    rating: d.rating ?? 0,
    review_count: d.numReviews ?? 0,
    price: d.priceLevel,
    categories: cuisineLabel
      ? [{ alias: cuisineLabel.toLowerCase(), title: cuisineLabel }]
      : [{ alias: "restaurant", title: "Restaurant" }],
    location: {
      address1: d.addressString ?? "",
      city: "",
      state: "",
      zip_code: "",
      display_address: d.addressString ? [d.addressString] : [],
    },
    coordinates: {
      latitude: d.latitude ?? 0,
      longitude: d.longitude ?? 0,
    },
    image_url: undefined,
    is_closed: false,
  };

  return {
    externalId: `ta_${d.locationId}`,
    name: d.name,
    address: d.addressString ?? "",
    rating: d.rating ?? 0,
    business,
    ...(cuisineLabel ? { cuisineLabel } : {}),
    ...(d.ratingImageUrl ? { ratingImageUrl: d.ratingImageUrl } : {}),
  };
}

/**
 * Tripadvisor candidates: cuisine search → hydrate top N with rating/price/
 * reviews. Returns null when unconfigured or nothing usable (caller falls
 * through to Google/OSM). Never throws.
 */
async function tripadvisorNearby(
  input: ResolvedDiscoverInput,
): Promise<NormalizedRestaurant[] | null> {
  if (!tripadvisorService.isConfigured()) return null;

  const radiusKm = Math.max(1, Math.min(input.radiusMeters / 1000, 25));
  const hits = await tripadvisorService.searchLocations({
    latitude: input.latitude,
    longitude: input.longitude,
    query: input.cuisine || "restaurant",
    radiusKm,
  });
  if (hits.length === 0) return null;

  const top = hits.slice(0, Math.min(taDetailLimit(), input.limit));
  const detailed = await Promise.all(
    top.map((h) => tripadvisorService.getDetails(h.locationId)),
  );

  const restaurants = detailed
    .filter((d): d is TripadvisorDetails => d !== null)
    .map(normalizeTripadvisor);

  return restaurants.length > 0 ? restaurants : null;
}

// ─── Partner annotation ────────────────────────────────────────────────────

async function loadPartners(
  externalIds: string[],
  provider: RestaurantDiscoverySource,
): Promise<Map<string, PartnerRow>> {
  if (externalIds.length === 0) return new Map();

  try {
    const result = await executeQuery<PartnerRow>(
      `SELECT id AS internal_restaurant_id,
              external_id,
              external_provider,
              stripe_connect_account_id,
              deliverect_location_id,
              alchemize_opt_in
       FROM restaurants
       WHERE (external_provider = $1 OR external_id = ANY($2))
         AND external_id = ANY($2)`,
      [provider, externalIds],
    );
    return new Map(result.rows.map((row) => [row.external_id, row]));
  } catch (err) {
    logger.warn(
      `[restaurant-discovery] Partner lookup failed for ${provider}:`,
      err instanceof Error ? err.message : err,
    );
    return new Map();
  }
}

export interface DishReviewStats {
  averageRating: number;
  reviewCount: number;
  topDish?: string;
}

async function loadDishReviewStats(
  restaurantIds: string[],
): Promise<Map<string, DishReviewStats>> {
  if (restaurantIds.length === 0) return new Map();

  try {
    const result = await executeQuery<{
      restaurant_id: string;
      average_rating: string | number;
      review_count: string | number;
      top_dish: string | null;
    }>(
      `SELECT restaurant_id,
              ROUND(AVG(rating), 2) AS average_rating,
              COUNT(*)::int AS review_count,
              MODE() WITHIN GROUP (ORDER BY dish_name) AS top_dish
       FROM restaurant_dish_reviews
       WHERE restaurant_id = ANY($1)
       GROUP BY restaurant_id`,
      [restaurantIds],
    );

    const map = new Map<string, DishReviewStats>();
    for (const row of result.rows) {
      const avg =
        typeof row.average_rating === "number"
          ? row.average_rating
          : parseFloat(String(row.average_rating));
      const count =
        typeof row.review_count === "number"
          ? row.review_count
          : parseInt(String(row.review_count), 10);
      if (!Number.isNaN(avg) && count > 0) {
        map.set(row.restaurant_id, {
          averageRating: avg,
          reviewCount: count,
          ...(row.top_dish ? { topDish: row.top_dish } : {}),
        });
      }
    }
    return map;
  } catch (err) {
    logger.warn(
      "[restaurant-discovery] Dish reviews lookup skipped:",
      err instanceof Error ? err.message : err,
    );
    return new Map();
  }
}

async function loadCommentCounts(
  restaurantIds: string[],
): Promise<Map<string, number>> {
  if (restaurantIds.length === 0) return new Map();
  try {
    const result = await executeQuery<{ restaurant_id: string; count: string | number }>(
      `SELECT restaurant_id, COUNT(*)::int AS count
       FROM restaurant_comments
       WHERE restaurant_id = ANY($1)
       GROUP BY restaurant_id`,
      [restaurantIds],
    );
    const map = new Map<string, number>();
    for (const row of result.rows) {
      const c =
        typeof row.count === "number"
          ? row.count
          : parseInt(String(row.count), 10);
      if (!Number.isNaN(c)) map.set(row.restaurant_id, c);
    }
    return map;
  } catch (err) {
    logger.warn(
      "[restaurant-discovery] Comment counts lookup skipped:",
      err instanceof Error ? err.message : err,
    );
    return new Map();
  }
}

async function loadFavorites(
  userId: string | undefined,
  explicitFavorites: string[] | undefined,
  restaurantIds: string[],
): Promise<Set<string>> {
  const favSet = new Set<string>(explicitFavorites ?? []);
  if (!userId || restaurantIds.length === 0) return favSet;
  try {
    const result = await executeQuery<{ restaurant_id: string }>(
      `SELECT restaurant_id
       FROM user_favorite_restaurants
       WHERE user_id = $1 AND restaurant_id = ANY($2)`,
      [userId, restaurantIds],
    );
    for (const row of result.rows) {
      favSet.add(row.restaurant_id);
    }
    return favSet;
  } catch (err) {
    logger.warn(
      "[restaurant-discovery] Favorites lookup skipped:",
      err instanceof Error ? err.message : err,
    );
    return favSet;
  }
}

async function loadAlchemizedOptIns(
  restaurantIds: string[],
): Promise<Set<string>> {
  if (restaurantIds.length === 0) return new Set();
  try {
    const result = await executeQuery<{ restaurant_id: string }>(
      `SELECT restaurant_id
       FROM restaurant_alchemize_opt_ins
       WHERE restaurant_id = ANY($1) AND status IN ('approved', 'alchemized')`,
      [restaurantIds],
    );
    const set = new Set<string>();
    for (const row of result.rows) {
      set.add(row.restaurant_id);
    }
    return set;
  } catch (err) {
    logger.warn(
      "[restaurant-discovery] Alchemize opt-in lookup skipped:",
      err instanceof Error ? err.message : err,
    );
    return new Set();
  }
}

export interface DiscoveryEnrichments {
  partners: Map<string, PartnerRow>;
  reviewStats: Map<string, DishReviewStats>;
  commentCounts: Map<string, number>;
  favoriteSet: Set<string>;
  alchemizedSet: Set<string>;
}

async function loadPartnersAndReviewStats(
  candidates: NormalizedRestaurant[],
  provider: RestaurantDiscoverySource,
  userId?: string,
  explicitFavorites?: string[],
): Promise<DiscoveryEnrichments> {
  const externalIds = candidates.map((r) => r.externalId);
  const partners = await loadPartners(externalIds, provider);
  const idsToLookup = [
    ...externalIds,
    ...Array.from(partners.values())
      .map((p) => p.internal_restaurant_id)
      .filter((id): id is string => Boolean(id)),
  ];

  const [reviewStats, commentCounts, favoriteSet, alchemizedSet] =
    await Promise.all([
      loadDishReviewStats(idsToLookup),
      loadCommentCounts(idsToLookup),
      loadFavorites(userId, explicitFavorites, idsToLookup),
      loadAlchemizedOptIns(idsToLookup),
    ]);

  return { partners, reviewStats, commentCounts, favoriteSet, alchemizedSet };
}

function getEnrichmentForRestaurant(
  restaurantId: string,
  enrichments: DiscoveryEnrichments,
): {
  partner: PartnerRow | undefined;
  stats: DishReviewStats | undefined;
  isFavorite: boolean;
  commentCount: number;
  isAlchemizedPartner: boolean;
} {
  const partner = enrichments.partners.get(restaurantId);
  const partnerId = partner?.internal_restaurant_id;
  const stats =
    enrichments.reviewStats.get(restaurantId) ||
    (partnerId ? enrichments.reviewStats.get(partnerId) : undefined);
  const isFavorite =
    enrichments.favoriteSet.has(restaurantId) ||
    (partnerId ? enrichments.favoriteSet.has(partnerId) : false);
  const commentCount =
    enrichments.commentCounts.get(restaurantId) ||
    (partnerId ? enrichments.commentCounts.get(partnerId) : undefined) ||
    0;
  const isAlchemizedPartner =
    Boolean(partner?.alchemize_opt_in) ||
    enrichments.alchemizedSet.has(restaurantId) ||
    (partnerId ? enrichments.alchemizedSet.has(partnerId) : false);

  return { partner, stats, isFavorite, commentCount, isAlchemizedPartner };
}

function applyCommunityReviewBoost(
  baseScore: number,
  reasons: string[],
  stats: DishReviewStats | undefined,
): { score: number; reasons: string[] } {
  if (!stats || stats.reviewCount === 0) {
    return { score: baseScore, reasons };
  }

  const newReasons = [...reasons];
  let scoreAdjust = 0;
  if (stats.averageRating >= 4.0) {
    scoreAdjust = Math.min(
      0.12,
      (stats.averageRating / 5) * 0.06 * Math.log10(stats.reviewCount + 1),
    );
    if (stats.topDish) {
      newReasons.push(
        `⭐ Community favorite: "${stats.topDish}" (${stats.averageRating}★, ${stats.reviewCount} ${stats.reviewCount === 1 ? "review" : "reviews"})`,
      );
    } else {
      newReasons.push(
        `⭐ Highly rated by local diners (${stats.averageRating}★, ${stats.reviewCount} ${stats.reviewCount === 1 ? "review" : "reviews"})`,
      );
    }
  } else if (stats.averageRating < 3.0 && stats.reviewCount >= 2) {
    scoreAdjust = -0.06;
  }

  const finalScore = Math.max(0, Math.min(1.0, baseScore + scoreAdjust));
  return { score: finalScore, reasons: newReasons };
}

function applyDiscoveryEnrichments(
  baseScore: number,
  baseReasons: string[],
  options: {
    stats?: DishReviewStats;
    isFavorite?: boolean;
    isAlchemizedPartner?: boolean;
  },
): { score: number; reasons: string[] } {
  const { stats, isFavorite, isAlchemizedPartner } = options;
  const { score: initialScore, reasons: boostedReasons } = applyCommunityReviewBoost(
    baseScore,
    baseReasons,
    stats,
  );
  let score = initialScore;
  const reasons = [...boostedReasons];

  if (isFavorite) {
    score = Math.min(1.0, score + 0.06);
    reasons.push("❤️ In your Favorite Sanctuaries");
  }

  if (isAlchemizedPartner) {
    reasons.push("✨ Alchemized Kitchen Partner");
  }

  return { score, reasons };
}

interface AnnotateOptions {
  restaurant: NormalizedRestaurant;
  partner: PartnerRow | undefined;
  reviewStats: DishReviewStats | undefined;
  isFavorite: boolean;
  commentCount: number;
  isAlchemizedPartner: boolean;
  matchReasons: string[];
  cuisineElement: AlchmScoredRestaurant["cuisineElement"];
  dominantElement: AlchmScoredRestaurant["dominantElement"];
  scores?: {
    alchmScore?: number;
    elementalMatch?: number;
    planetaryAlignment?: number;
    thermodynamicAffinity?: number;
  };
}

function annotateWithPartner(opts: AnnotateOptions): AlchmScoredRestaurant {
  const {
    restaurant,
    partner,
    reviewStats,
    isFavorite,
    commentCount,
    isAlchemizedPartner,
    matchReasons,
    cuisineElement,
    dominantElement,
  } = opts;
  const scores = opts.scores ?? {};
  const isPartner = Boolean(partner?.stripe_connect_account_id);

  const initialReasons = isPartner
    ? ["Partner restaurant with in-app menu ordering", ...matchReasons]
    : matchReasons;

  const { score: alchmScore, reasons: finalReasons } =
    applyDiscoveryEnrichments(
      scores.alchmScore ?? 0,
      initialReasons,
      {
        ...(reviewStats ? { stats: reviewStats } : {}),
        isFavorite,
        isAlchemizedPartner,
      },
    );

  return {
    externalId: restaurant.externalId,
    name: restaurant.name,
    address: restaurant.address,
    rating: restaurant.rating,
    ...(restaurant.imageUrl ? { imageUrl: restaurant.imageUrl } : {}),
    business: restaurant.business,
    isPartner,
    ...(isPartner && partner?.internal_restaurant_id ? { partnerRestaurantId: partner.internal_restaurant_id } : {}),
    ...(isPartner && partner?.stripe_connect_account_id ? { stripeConnectAccountId: partner.stripe_connect_account_id } : {}),
    ...(isPartner && partner?.deliverect_location_id ? { deliverectLocationId: partner.deliverect_location_id } : {}),
    alchmScore,
    elementalMatch: scores.elementalMatch ?? 0,
    planetaryAlignment: scores.planetaryAlignment ?? 0,
    thermodynamicAffinity: scores.thermodynamicAffinity ?? 0,
    dominantElement,
    matchReasons: finalReasons,
    cuisineElement,
    ...(restaurant.cuisineLabel ? { cuisineLabel: restaurant.cuisineLabel } : {}),
    ...(restaurant.primaryType ? { primaryType: restaurant.primaryType } : {}),
    ...(restaurant.ratingImageUrl ? { ratingImageUrl: restaurant.ratingImageUrl } : {}),
    ...(reviewStats ? { dishReviewStats: reviewStats } : {}),
    isFavorite,
    commentCount: commentCount ?? 0,
    isAlchemizedPartner,
  };
}

// ─── Yelp scored discovery ────────────────────────────────────────────────

async function yelpScored(
  input: ResolvedDiscoverInput,
  cosmic: CosmicComputation,
): Promise<AlchmScoredRestaurant[] | null> {
  if (!yelpService.isConfigured()) return null;
  if (!input.cuisine) return null;

  const { data } = await yelpService.getScoredRestaurants({
    cuisineType: input.cuisine,
    latitude: input.latitude,
    longitude: input.longitude,
    astrologicalState: cosmic.state,
    alchemicalProperties: cosmic.alchemicalProperties,
    diurnal: cosmic.diurnal,
    radius: input.radiusMeters,
    limit: input.limit,
  });

  return data && data.length > 0 ? data : null;
}

// ─── Top-level orchestrator ────────────────────────────────────────────────

export async function discoverRestaurants(
  inputRaw: DiscoverInput,
): Promise<RestaurantSearchResponse> {
  const input: ResolvedDiscoverInput = {
    cuisine: text(inputRaw.cuisine),
    latitude:
      typeof inputRaw.latitude === "number"
        ? inputRaw.latitude
        : inputRaw.lat ?? 0,
    longitude:
      typeof inputRaw.longitude === "number"
        ? inputRaw.longitude
        : inputRaw.lng ?? 0,
    lat: inputRaw.lat ?? 0,
    lng: inputRaw.lng ?? 0,
    radiusMeters: clampRadius(inputRaw.radiusMeters),
    limit: clampLimit(inputRaw.limit),
    ...(inputRaw.userId ? { userId: inputRaw.userId } : {}),
    ...(inputRaw.favoriteIds ? { favoriteIds: inputRaw.favoriteIds } : {}),
  };

  const cosmic = buildAstrologicalState();
  const cosmicContext = cosmic?.cosmicContext ?? emptyCosmicContext();

  const notices: string[] = [];

  // 0. Tripadvisor (rated) — preferred quality source when configured.
  const tripadvisor = await tripadvisorNearby(input);
  if (tripadvisor && tripadvisor.length > 0) {
    const enrichments = await loadPartnersAndReviewStats(
      tripadvisor,
      "tripadvisor",
      inputRaw.userId,
      inputRaw.favoriteIds,
    );
    const restaurants = tripadvisor.map((r) => {
      const business = withDistance(r.business, input.latitude, input.longitude);
      const normalized: NormalizedRestaurant = { ...r, business };
      const { partner, stats, isFavorite, commentCount, isAlchemizedPartner } =
        getEnrichmentForRestaurant(r.externalId, enrichments);
      if (cosmic) {
        try {
          const scored = scoreCuisineAgainstMoment(
            business,
            input.cuisine || (r.cuisineLabel ?? ""),
            cosmic.state,
            cosmic.alchemicalProperties,
            cosmic.diurnal,
          );
          return finalizeScored(
            scored,
            normalized,
            partner,
            stats,
            isFavorite,
            commentCount,
            isAlchemizedPartner,
          );
        } catch {
          // fall through to unscored annotation
        }
      }
      const { profile, dominant } = elementProfileForLabel(
        r.cuisineLabel ?? input.cuisine,
      );
      return annotateWithPartner({
        restaurant: normalized,
        partner,
        reviewStats: stats,
        isFavorite,
        commentCount,
        isAlchemizedPartner,
        matchReasons: [
          r.cuisineLabel
            ? `Nearby ${r.cuisineLabel} restaurant on Tripadvisor`
            : "Nearby restaurant on Tripadvisor",
        ],
        cuisineElement: profile,
        dominantElement: dominant,
      });
    });
    return { restaurants, cosmicContext, source: "tripadvisor" };
  }

  // 1. Try Google Places.
  const google = await googleNearby(input);
  if (google.ok && google.restaurants.length > 0) {
    const enrichments = await loadPartnersAndReviewStats(
      google.restaurants,
      "google",
      inputRaw.userId,
      inputRaw.favoriteIds,
    );
    const restaurants = google.restaurants.map((r) => {
      const { partner, stats, isFavorite, commentCount, isAlchemizedPartner } =
        getEnrichmentForRestaurant(r.externalId, enrichments);
      const { profile, dominant } = elementProfileForLabel(
        r.cuisineLabel ?? input.cuisine,
      );
      return annotateWithPartner({
        restaurant: r,
        partner,
        reviewStats: stats,
        isFavorite,
        commentCount,
        isAlchemizedPartner,
        matchReasons: [
          r.cuisineLabel
            ? `Nearby ${r.cuisineLabel} restaurant from Google Places`
            : "Nearby restaurant from Google Places",
        ],
        cuisineElement: profile,
        dominantElement: dominant,
      });
    });
    return {
      restaurants,
      cosmicContext,
      source: "google",
      sourceNotice: google.sourceNotice,
    };
  }
  if (!google.ok) {
    if (google.sourceNotice) notices.push(google.sourceNotice);
  }

  // 2. Try Yelp with cosmic scoring (only when cosmic state is available).
  if (cosmic) {
    const yelp = await yelpScored(input, cosmic);
    if (yelp && yelp.length > 0) {
      const enrichments = await loadPartnersAndReviewStats(
        yelp.map((entry) => ({
          externalId: entry.business.id,
          name: entry.business.name,
          address: entry.business.location.address1,
          rating: entry.business.rating,
          business: entry.business,
        })),
        "yelp",
        inputRaw.userId,
        inputRaw.favoriteIds,
      );

      const restaurants = yelp.map((entry) => {
        const { partner, stats, isFavorite, commentCount, isAlchemizedPartner } =
          getEnrichmentForRestaurant(entry.business.id, enrichments);
        const isPartner = Boolean(partner?.stripe_connect_account_id);
        const baseReasons = isPartner
          ? ["Partner restaurant with in-app menu ordering", ...entry.matchReasons]
          : entry.matchReasons;
        const { score: alchmScore, reasons: finalReasons } =
          applyDiscoveryEnrichments(entry.alchmScore, baseReasons, {
            ...(stats ? { stats } : {}),
            isFavorite,
            isAlchemizedPartner,
          });

        return {
          ...entry,
          alchmScore,
          isPartner,
          ...(isPartner && partner?.internal_restaurant_id ? { partnerRestaurantId: partner.internal_restaurant_id } : {}),
          ...(isPartner && partner?.stripe_connect_account_id ? { stripeConnectAccountId: partner.stripe_connect_account_id } : {}),
          ...(isPartner && partner?.deliverect_location_id ? { deliverectLocationId: partner.deliverect_location_id } : {}),
          matchReasons: finalReasons,
          ...(stats ? { dishReviewStats: stats } : {}),
          isFavorite,
          commentCount,
          isAlchemizedPartner,
        } satisfies AlchmScoredRestaurant;
      });

      return {
        restaurants,
        cosmicContext,
        source: "yelp",
        sourceNotice:
          notices.length > 0
            ? `${notices.join(" ")} Falling back to Yelp with cosmic scoring.`
            : undefined,
      };
    }
  }

  // 2b. OpenStreetMap / Nominatim (keyless, fast) — scored when cosmic state exists.
  const nom = await nominatimNearby(input);
  if (nom && nom.restaurants.length > 0) {
    const enrichments = await loadPartnersAndReviewStats(
      nom.restaurants,
      "osm",
      inputRaw.userId,
      inputRaw.favoriteIds,
    );
    const restaurants = nom.restaurants.map((r) => {
      const business = withDistance(r.business, input.latitude, input.longitude);
      const normalized: NormalizedRestaurant = { ...r, business };
      const { partner, stats, isFavorite, commentCount, isAlchemizedPartner } =
        getEnrichmentForRestaurant(r.externalId, enrichments);
      if (cosmic) {
        try {
          const scored = scoreCuisineAgainstMoment(
            business,
            input.cuisine || (r.cuisineLabel ?? ""),
            cosmic.state,
            cosmic.alchemicalProperties,
            cosmic.diurnal,
          );
          return finalizeScored(
            scored,
            normalized,
            partner,
            stats,
            isFavorite,
            commentCount,
            isAlchemizedPartner,
          );
        } catch {
          // fall through to unscored annotation
        }
      }
      const { profile, dominant } = elementProfileForLabel(
        r.cuisineLabel ?? input.cuisine,
      );
      return annotateWithPartner({
        restaurant: normalized,
        partner,
        reviewStats: stats,
        isFavorite,
        commentCount,
        isAlchemizedPartner,
        matchReasons: [
          r.cuisineLabel
            ? `Nearby ${r.cuisineLabel} restaurant from OpenStreetMap`
            : "Nearby restaurant from OpenStreetMap",
        ],
        cuisineElement: profile,
        dominantElement: dominant,
      });
    });
    const relaxedNote =
      nom.relaxed && input.cuisine
        ? `No ${input.cuisine} spots tagged nearby — showing nearby restaurants.`
        : undefined;
    return {
      restaurants,
      cosmicContext,
      source: "osm",
      sourceNotice:
        [notices.join(" ").trim(), relaxedNote].filter(Boolean).join(" ") ||
        undefined,
    };
  }

  // 2c. OpenStreetMap / Overpass (keyless) — secondary live source.
  const osm = await osmNearby(input);
  if (osm && osm.restaurants.length > 0) {
    const enrichments = await loadPartnersAndReviewStats(
      osm.restaurants,
      "osm",
      inputRaw.userId,
      inputRaw.favoriteIds,
    );
    const restaurants = osm.restaurants.map((r) => {
      const business = withDistance(r.business, input.latitude, input.longitude);
      const normalized: NormalizedRestaurant = { ...r, business };
      const { partner, stats, isFavorite, commentCount, isAlchemizedPartner } =
        getEnrichmentForRestaurant(r.externalId, enrichments);
      if (cosmic) {
        try {
          const scored = scoreCuisineAgainstMoment(
            business,
            input.cuisine || (r.cuisineLabel ?? ""),
            cosmic.state,
            cosmic.alchemicalProperties,
            cosmic.diurnal,
          );
          return finalizeScored(
            scored,
            normalized,
            partner,
            stats,
            isFavorite,
            commentCount,
            isAlchemizedPartner,
          );
        } catch {
          // fall through to unscored annotation
        }
      }
      const { profile, dominant } = elementProfileForLabel(
        r.cuisineLabel ?? input.cuisine,
      );
      return annotateWithPartner({
        restaurant: normalized,
        partner,
        reviewStats: stats,
        isFavorite,
        commentCount,
        isAlchemizedPartner,
        matchReasons: [
          r.cuisineLabel
            ? `Nearby ${r.cuisineLabel} restaurant from OpenStreetMap`
            : "Nearby restaurant from OpenStreetMap",
        ],
        cuisineElement: profile,
        dominantElement: dominant,
      });
    });
    const relaxedNote =
      osm.relaxed && input.cuisine
        ? `No ${input.cuisine} spots tagged nearby — showing nearby restaurants.`
        : undefined;
    return {
      restaurants,
      cosmicContext,
      source: "osm",
      sourceNotice:
        [notices.join(" ").trim(), relaxedNote].filter(Boolean).join(" ") ||
        undefined,
    };
  }

  // 3. Try Foursquare as final fallback (no cosmic scoring).
  if (process.env.FOURSQUARE_API_KEY?.trim()) {
    const foursquare = await foursquareNearby(input);
    if (foursquare && foursquare.length > 0) {
      const enrichments = await loadPartnersAndReviewStats(
        foursquare,
        "foursquare",
        inputRaw.userId,
        inputRaw.favoriteIds,
      );
      const restaurants = foursquare.map((r) => {
        const { partner, stats, isFavorite, commentCount, isAlchemizedPartner } =
          getEnrichmentForRestaurant(r.externalId, enrichments);
        const { profile, dominant } = elementProfileForLabel(
          r.cuisineLabel ?? input.cuisine,
        );
        return annotateWithPartner({
          restaurant: r,
          partner,
          reviewStats: stats,
          isFavorite,
          commentCount,
          isAlchemizedPartner,
          matchReasons: [
            input.cuisine
              ? `${input.cuisine} match from Foursquare — partial cosmic scoring`
              : "Nearby restaurant from Foursquare — partial cosmic scoring",
          ],
          cuisineElement: profile,
          dominantElement: dominant,
        });
      });
      return {
        restaurants,
        cosmicContext,
        source: "foursquare",
        sourceNotice: !cosmic
          ? "Planetary positions unavailable — showing Foursquare results without cosmic scoring."
          : !yelpService.isConfigured()
            ? "Yelp not configured — showing Foursquare results without cosmic scoring."
            : "Cosmic scoring providers unavailable — showing Foursquare results.",
      };
    }
  }

  // 4. Curated authentic restaurants (high-reliability fallback).
  const curated = curatedNearby(input);
  if (curated && curated.length > 0) {
    const enrichments = await loadPartnersAndReviewStats(
      curated,
      "curated",
      inputRaw.userId,
      inputRaw.favoriteIds,
    );
    const restaurants = curated.map((r) => {
      const business = withDistance(r.business, input.latitude, input.longitude);
      const normalized: NormalizedRestaurant = { ...r, business };
      const { partner, stats, isFavorite, commentCount, isAlchemizedPartner } =
        getEnrichmentForRestaurant(r.externalId, enrichments);
      if (cosmic) {
        try {
          const scored = scoreCuisineAgainstMoment(
            business,
            input.cuisine || (r.cuisineLabel ?? ""),
            cosmic.state,
            cosmic.alchemicalProperties,
            cosmic.diurnal,
          );
          return finalizeScored(
            scored,
            normalized,
            partner,
            stats,
            isFavorite,
            commentCount,
            isAlchemizedPartner,
          );
        } catch {
          // fall through to unscored
        }
      }
      const { profile, dominant } = elementProfileForLabel(
        r.cuisineLabel ?? input.cuisine,
      );
      return annotateWithPartner({
        restaurant: normalized,
        partner,
        reviewStats: stats,
        isFavorite,
        commentCount,
        isAlchemizedPartner,
        matchReasons: [
          r.cuisineLabel
            ? `Curated ${r.cuisineLabel} restaurant aligned to current celestial energies`
            : "Curated local restaurant",
        ],
        cuisineElement: profile,
        dominantElement: dominant,
      });
    });
    return {
      restaurants,
      cosmicContext,
      source: "curated",
      sourceNotice:
        notices.length > 0
          ? `${notices.join(" ")} Showing authentic curated spots.`
          : undefined,
    };
  }

  return {
    restaurants: [],
    cosmicContext,
    source: "curated",
    sourceNotice: notices.length > 0 ? notices.join(" ") : undefined,
  };
}

// ─── Best Match (scored across ALL providers + sortable) ────────────────────

export type BestMatchSort = "match" | "distance" | "rating" | "price";

export interface BestMatchInput extends DiscoverInput {
  /** Sort dimension for the ranked list. Defaults to "match". */
  sort?: BestMatchSort;
  /** When true, ask the provider for currently-open restaurants only. */
  openNow?: boolean;
}

/** Great-circle distance in meters between two lat/lng points.
 * Exported so Tables near-me discovery (src/services/discoveryService.ts)
 * reuses the exact same haversine rather than reimplementing it. */
export function haversineMeters(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
): number {
  const R = 6371000;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(a)));
}

/** Fill `business.distance` from coordinates when the provider didn't supply it. */
function withDistance(
  business: YelpBusiness,
  centerLat: number,
  centerLng: number,
): YelpBusiness {
  if (typeof business.distance === "number" && Number.isFinite(business.distance)) {
    return business;
  }
  const lat = business.coordinates.latitude;
  const lng = business.coordinates.longitude;
  if (!lat && !lng) return business; // unknown coordinates (e.g. {0,0})
  return { ...business, distance: haversineMeters(centerLat, centerLng, lat, lng) };
}

/** Normalize a native Yelp business into the shared NormalizedRestaurant shape. */
function normalizeYelpBusiness(b: YelpBusiness): NormalizedRestaurant {
  const cuisineLabel = b.categories[0]?.title;
  return {
    externalId: b.id,
    name: b.name,
    address:
      b.location.display_address.join(", ") || b.location.address1 || "",
    rating: b.rating,
    business: b,
    ...(b.image_url ? { imageUrl: b.image_url } : {}),
    ...(cuisineLabel ? { cuisineLabel } : {}),
  };
}

/** Merge a cosmic-scored result with its normalized display fields + partner annotation + community review boost. */
function finalizeScored(
  scored: AlchmScoredRestaurant,
  restaurant: NormalizedRestaurant,
  partner: PartnerRow | undefined,
  reviewStats?: DishReviewStats,
  isFavorite?: boolean,
  commentCount?: number,
  isAlchemizedPartner?: boolean,
): AlchmScoredRestaurant {
  const isPartner = Boolean(partner?.stripe_connect_account_id);
  const initialReasons = isPartner
    ? ["Partner restaurant with in-app menu ordering", ...scored.matchReasons]
    : scored.matchReasons;

  const { score: alchmScore, reasons: finalReasons } =
    applyDiscoveryEnrichments(scored.alchmScore, initialReasons, {
      ...(reviewStats ? { stats: reviewStats } : {}),
      ...(isFavorite !== undefined ? { isFavorite } : {}),
      ...(isAlchemizedPartner !== undefined ? { isAlchemizedPartner } : {}),
    });

  return {
    ...scored,
    externalId: restaurant.externalId,
    name: restaurant.name,
    address: restaurant.address,
    rating: restaurant.rating,
    ...(restaurant.imageUrl ? { imageUrl: restaurant.imageUrl } : {}),
    ...(restaurant.cuisineLabel ? { cuisineLabel: restaurant.cuisineLabel } : {}),
    ...(restaurant.primaryType ? { primaryType: restaurant.primaryType } : {}),
    ...(restaurant.ratingImageUrl ? { ratingImageUrl: restaurant.ratingImageUrl } : {}),
    isPartner,
    ...(isPartner && partner?.internal_restaurant_id ? { partnerRestaurantId: partner.internal_restaurant_id } : {}),
    ...(isPartner && partner?.stripe_connect_account_id ? { stripeConnectAccountId: partner.stripe_connect_account_id } : {}),
    ...(isPartner && partner?.deliverect_location_id ? { deliverectLocationId: partner.deliverect_location_id } : {}),
    alchmScore,
    matchReasons: finalReasons,
    ...(reviewStats ? { dishReviewStats: reviewStats } : {}),
    ...(isFavorite !== undefined ? { isFavorite } : {}),
    commentCount: commentCount ?? 0,
    ...(isAlchemizedPartner !== undefined ? { isAlchemizedPartner } : {}),
  };
}

function distanceOf(r: AlchmScoredRestaurant): number {
  const d = r.business.distance;
  return typeof d === "number" && Number.isFinite(d)
    ? d
    : Number.POSITIVE_INFINITY;
}

/** $ = 1 … $$$$ = 4; "Free" = 0; unknown sorts last. */
function priceRank(r: AlchmScoredRestaurant): number {
  const p = r.business.price;
  if (!p) return 99;
  if (p.toLowerCase() === "free") return 0;
  const m = p.match(/\$+/);
  return m ? m[0].length : 99;
}

function sortRestaurants(
  list: AlchmScoredRestaurant[],
  sort: BestMatchSort,
): AlchmScoredRestaurant[] {
  const out = [...list];
  switch (sort) {
    case "distance":
      // Unknown distances sink to the bottom; ties broken by match score.
      out.sort(
        (a, b) => distanceOf(a) - distanceOf(b) || b.alchmScore - a.alchmScore,
      );
      break;
    case "rating":
      out.sort(
        (a, b) =>
          b.business.rating - a.business.rating ||
          b.alchmScore - a.alchmScore,
      );
      break;
    case "price":
      out.sort(
        (a, b) => priceRank(a) - priceRank(b) || b.alchmScore - a.alchmScore,
      );
      break;
    case "match":
    default:
      // Cosmic match is cuisine-level, so within one cuisine scores tie — break
      // ties by quality (rating) then proximity so the order is meaningful.
      out.sort(
        (a, b) =>
          b.alchmScore - a.alchmScore ||
          b.business.rating - a.business.rating ||
          distanceOf(a) - distanceOf(b),
      );
      break;
  }
  return out;
}

/**
 * Gather raw candidates from the first available provider (Google → Yelp →
 * OpenStreetMap → Foursquare). Unlike `discoverRestaurants`, candidates are returned UNSCORED
 * so the caller can apply uniform cosmic scoring across every provider.
 */
async function gatherBestMatchCandidates(
  input: ResolvedDiscoverInput,
  openNow: boolean,
): Promise<{
  candidates: NormalizedRestaurant[];
  source: RestaurantDiscoverySource;
  notices: string[];
  /** Notice about the quality/completeness of the WINNING result set only —
   *  distinct from `notices`, which records earlier providers that were tried
   *  and superseded. Only this should reach users once results are found;
   *  `notices` is diagnostic and is only surfaced when nothing worked at all. */
  resultNotice?: string;
}> {
  const notices: string[] = [];

  // 0. Tripadvisor (rated) — preferred quality source when a key is configured.
  //    Provides real ratings/reviews/price that OSM lacks.
  const tripadvisor = await tripadvisorNearby(input);
  if (tripadvisor && tripadvisor.length > 0) {
    return { candidates: tripadvisor, source: "tripadvisor", notices };
  }

  // 1. Google Places (broadest coverage).
  const google = await googleNearby(input, openNow);
  if (google.ok && google.restaurants.length > 0) {
    return { candidates: google.restaurants, source: "google", notices };
  }
  if (!google.ok && google.sourceNotice) notices.push(google.sourceNotice);

  // 2. Yelp Fusion (raw businesses, normalized here).
  if (yelpService.isConfigured() && input.cuisine) {
    const { data, error } = await yelpService.searchRestaurants({
      term: input.cuisine,
      latitude: input.latitude,
      longitude: input.longitude,
      radius: input.radiusMeters,
      limit: input.limit,
      sort_by: "best_match",
      open_now: openNow || undefined,
    });
    if (data && data.businesses.length > 0) {
      const candidates = data.businesses
        .filter((b) => !b.is_closed)
        .map(normalizeYelpBusiness);
      if (candidates.length > 0) {
        return { candidates, source: "yelp", notices };
      }
    } else if (error) {
      notices.push(`Yelp: ${error}`);
    }
  }

  // 3. OpenStreetMap Nominatim (keyless, fast live local search).
  const nom = await nominatimNearby(input);
  if (nom && nom.restaurants.length > 0) {
    const resultNotice =
      nom.relaxed && input.cuisine
        ? `No ${input.cuisine} spots tagged in immediate area — showing nearby restaurants ranked by ${input.cuisine} fit.`
        : undefined;
    return {
      candidates: nom.restaurants,
      source: "osm",
      notices,
      ...(resultNotice ? { resultNotice } : {}),
    };
  }

  // 3b. OpenStreetMap / Overpass (keyless — secondary live source).
  const osm = await osmNearby(input);
  if (osm && osm.restaurants.length > 0) {
    const resultNotice =
      osm.relaxed && input.cuisine
        ? `No ${input.cuisine} spots tagged nearby — showing nearby restaurants ranked by ${input.cuisine} fit.`
        : undefined;
    return {
      candidates: osm.restaurants,
      source: "osm",
      notices,
      ...(resultNotice ? { resultNotice } : {}),
    };
  }
  if (osm === null) notices.push("OpenStreetMap was unavailable.");

  // 4. Foursquare (if configured with API key).
  if (process.env.FOURSQUARE_API_KEY?.trim()) {
    const foursquare = await foursquareNearby(input);
    if (foursquare && foursquare.length > 0) {
      return { candidates: foursquare, source: "foursquare", notices };
    }
  }

  // 5. Curated authentic restaurants (high-reliability fallback).
  const curated = curatedNearby(input);
  return {
    candidates: curated,
    source: "curated",
    notices,
    resultNotice: "Curated local restaurants aligned to your location and current sky.",
  };
}

/**
 * Best Match orchestrator. Fetches nearby restaurants for a cuisine, scores
 * EVERY result with the shared cosmic scorer (so Google/Foursquare results
 * rank too — not just Yelp), annotates partners, and returns the list sorted
 * by the requested dimension (default: cosmic match score, descending).
 */
export async function bestMatchRestaurants(
  inputRaw: BestMatchInput,
): Promise<RestaurantSearchResponse> {
  const input: ResolvedDiscoverInput = {
    cuisine: text(inputRaw.cuisine),
    latitude:
      typeof inputRaw.latitude === "number"
        ? inputRaw.latitude
        : inputRaw.lat ?? 0,
    longitude:
      typeof inputRaw.longitude === "number"
        ? inputRaw.longitude
        : inputRaw.lng ?? 0,
    lat: inputRaw.lat ?? 0,
    lng: inputRaw.lng ?? 0,
    radiusMeters: clampRadius(inputRaw.radiusMeters),
    limit: clampLimit(inputRaw.limit),
    ...(inputRaw.userId ? { userId: inputRaw.userId } : {}),
    ...(inputRaw.favoriteIds ? { favoriteIds: inputRaw.favoriteIds } : {}),
  };
  const sort: BestMatchSort = inputRaw.sort ?? "match";
  const openNow = inputRaw.openNow === true;

  const cosmic = buildAstrologicalState();
  const cosmicContext = cosmic?.cosmicContext ?? emptyCosmicContext();

  const { candidates, source, notices, resultNotice } =
    await gatherBestMatchCandidates(input, openNow);

  if (candidates.length === 0) {
    // OpenStreetMap is keyless and always attempted, so an empty result means
    // genuinely nothing nearby (or every provider hard-failed) — not a config gap.
    return {
      restaurants: [],
      cosmicContext,
      source,
      sourceNotice: notices.length > 0 ? notices.join(" ") : undefined,
    };
  }

  const enrichments = await loadPartnersAndReviewStats(
    candidates,
    source,
    inputRaw.userId,
    inputRaw.favoriteIds,
  );

  const restaurants: AlchmScoredRestaurant[] = candidates.map((r) => {
    const business = withDistance(r.business, input.latitude, input.longitude);
    const normalized: NormalizedRestaurant = { ...r, business };
    const { partner, stats, isFavorite, commentCount, isAlchemizedPartner } =
      getEnrichmentForRestaurant(r.externalId, enrichments);

    if (cosmic) {
      try {
        const scored = scoreCuisineAgainstMoment(
          business,
          input.cuisine || (r.cuisineLabel ?? ""),
          cosmic.state,
          cosmic.alchemicalProperties,
          cosmic.diurnal,
        );
        return finalizeScored(
          scored,
          normalized,
          partner,
          stats,
          isFavorite,
          commentCount,
          isAlchemizedPartner,
        );
      } catch {
        // Fall through to unscored annotation on any scoring error.
      }
    }

    const { profile, dominant } = elementProfileForLabel(
      r.cuisineLabel ?? input.cuisine,
    );
    return annotateWithPartner({
      restaurant: normalized,
      partner,
      reviewStats: stats,
      isFavorite,
      commentCount,
      isAlchemizedPartner,
      matchReasons: [
        r.cuisineLabel
          ? `Nearby ${r.cuisineLabel} restaurant`
          : "Nearby restaurant",
      ],
      cuisineElement: profile,
      dominantElement: dominant,
    });
  });

  const sorted = sortRestaurants(restaurants, sort);

  const sourceNotice = !cosmic
    ? "Planetary positions unavailable — results shown without cosmic scoring."
    : resultNotice;

  return { restaurants: sorted, cosmicContext, source, sourceNotice };
}
