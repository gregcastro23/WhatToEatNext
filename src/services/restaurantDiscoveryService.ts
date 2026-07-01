/**
 * Restaurant Discovery Service — orchestrates Google → Yelp → Foursquare with
 * cosmic scoring and partner annotation. Used by both `/api/restaurants/discover`
 * and `/api/restaurants/search` so the "Order It" flow degrades gracefully when
 * any single provider is unconfigured or unavailable.
 *
 * @file src/services/restaurantDiscoveryService.ts
 */

import { getCuisineProfile } from "@/data/cuisineFlavorProfiles";
import { executeQuery } from "@/lib/database/connection";
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
import { getLunarPhaseFromDate } from "@/utils/lunarPhaseUtils";
import {
  aggregateEnhancedZodiacElementals,
  calculateAlchemicalFromPlanets,
} from "@/utils/planetaryAlchemyMapping";
import { getTimeFactors } from "@/utils/time";

// ─── Shared types ──────────────────────────────────────────────────────────

export interface DiscoverInput {
  cuisine: string;
  latitude: number;
  longitude: number;
  radiusMeters?: number;
  limit?: number;
}

interface PartnerRow {
  internal_restaurant_id: string;
  external_id: string;
  external_provider: string;
  stripe_connect_account_id: string | null;
  deliverect_location_id: string | null;
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
  return entries[0][0];
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
    if (typeof data?.sign === "string" && data.sign.length > 0) {
      positionMap[planet] = capitalizeSign(data.sign);
    }
  }

  const diurnal = isCurrentSkyDiurnal(now);
  const domElements: ElementalProperties = aggregateEnhancedZodiacElementals(
    positionMap,
    diurnal,
  );
  const dominantElement: Element = dominantElementOf(domElements);
  const alchemicalProperties: AlchemicalProperties = calculateAlchemicalFromPlanets(
    positionMap,
    diurnal,
  );
  const lunarPhase = getLunarPhaseFromDate(now);
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

interface GooglePlaceRaw {
  id?: string;
  displayName?: { text?: string };
  formattedAddress?: string;
  rating?: number;
  userRatingCount?: number;
  priceLevel?: string;
  photos?: Array<{ name?: string }>;
  primaryType?: string;
  primaryTypeDisplayName?: { text?: string };
  types?: string[];
  location?: { latitude?: number; longitude?: number };
}

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

async function googleNearby(
  input: Required<DiscoverInput>,
  openNow = false,
): Promise<
  | { ok: true; restaurants: NormalizedRestaurant[]; sourceNotice?: string }
  | { ok: false; notConfigured: boolean; sourceNotice?: string }
> {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
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
      return {
        ok: false,
        notConfigured: false,
        sourceNotice: `Google Places returned ${response.status}: ${body.slice(0, 160)}`,
      };
    }

    const data = (await response.json()) as { places?: GooglePlaceRaw[] };
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

  return {
    externalId: place.fsq_id,
    name: place.name,
    address: place.location?.formatted_address ?? "",
    rating: business.rating,
    business,
    cuisineLabel: place.categories?.[0]?.name,
  };
}

async function foursquareNearby(
  input: Required<DiscoverInput>,
): Promise<NormalizedRestaurant[] | null> {
  const apiKey = process.env.FOURSQUARE_API_KEY;
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
      signal: AbortSignal.timeout(13000),
    });
    if (!response.ok) return null;
    const data = (await response.json()) as {
      elements?: OverpassElement[];
      remark?: string;
    };
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

  const business: YelpBusiness = {
    id: externalId,
    name,
    url: website || googleMapsUrl(name, address || `${lat},${lon}`),
    phone: tags.phone || tags["contact:phone"] || "",
    rating: 0, // OSM has no ratings
    review_count: 0,
    categories: cuisineLabel
      ? [{ alias: tags.cuisine.split(";")[0], title: cuisineLabel }]
      : [{ alias: "restaurant", title: "Restaurant" }],
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

  return { externalId, name, address, rating: 0, business, cuisineLabel };
}

/**
 * Query OpenStreetMap for nearby restaurants matching the cuisine. When no
 * cuisine-tagged matches exist nearby, relaxes to all nearby restaurants so the
 * finder still returns real results (`relaxed: true`). Returns null only on a
 * hard provider failure (network/both mirrors down).
 */
async function osmNearby(
  input: Required<DiscoverInput>,
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
  const cuisineLabel = d.cuisine[0];
  const business: YelpBusiness = {
    id: `ta_${d.locationId}`,
    name: d.name,
    url: d.webUrl || "https://www.tripadvisor.com/",
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
    cuisineLabel,
    ratingImageUrl: d.ratingImageUrl,
  };
}

/**
 * Tripadvisor candidates: cuisine search → hydrate top N with rating/price/
 * reviews. Returns null when unconfigured or nothing usable (caller falls
 * through to Google/OSM). Never throws.
 */
async function tripadvisorNearby(
  input: Required<DiscoverInput>,
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
              deliverect_location_id
       FROM restaurants
       WHERE external_provider = $1
         AND external_id = ANY($2)`,
      [provider, externalIds],
    );
    return new Map(result.rows.map((row) => [row.external_id, row]));
  } catch (err) {
    console.warn(
      `[restaurant-discovery] Partner lookup failed for ${provider}:`,
      err instanceof Error ? err.message : err,
    );
    return new Map();
  }
}

interface AnnotateOptions {
  restaurant: NormalizedRestaurant;
  partner: PartnerRow | undefined;
  matchReasons: string[];
  cuisineElement: AlchmScoredRestaurant["cuisineElement"];
  dominantElement: AlchmScoredRestaurant["dominantElement"];
  scores?: {
    alchmScore?: number;
    elementalMatch?: number;
    planetaryAlignment?: number;
    monicaCompatibility?: number;
  };
}

function annotateWithPartner(opts: AnnotateOptions): AlchmScoredRestaurant {
  const { restaurant, partner, matchReasons, cuisineElement, dominantElement } =
    opts;
  const scores = opts.scores ?? {};
  const isPartner = Boolean(partner?.stripe_connect_account_id);

  const partnerReasons = isPartner
    ? ["Partner restaurant with in-app menu ordering", ...matchReasons]
    : matchReasons;

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
    alchmScore: scores.alchmScore ?? 0,
    elementalMatch: scores.elementalMatch ?? 0,
    planetaryAlignment: scores.planetaryAlignment ?? 0,
    monicaCompatibility: scores.monicaCompatibility ?? 0,
    dominantElement,
    matchReasons: partnerReasons,
    cuisineElement,
    cuisineLabel: restaurant.cuisineLabel,
    primaryType: restaurant.primaryType,
    ratingImageUrl: restaurant.ratingImageUrl,
  };
}

// ─── Yelp scored discovery ────────────────────────────────────────────────

async function yelpScored(
  input: Required<DiscoverInput>,
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
  const input: Required<DiscoverInput> = {
    cuisine: text(inputRaw.cuisine),
    latitude: inputRaw.latitude,
    longitude: inputRaw.longitude,
    radiusMeters: clampRadius(inputRaw.radiusMeters),
    limit: clampLimit(inputRaw.limit),
  };

  const cosmic = buildAstrologicalState();
  const cosmicContext = cosmic?.cosmicContext ?? emptyCosmicContext();

  const notices: string[] = [];

  // 0. Tripadvisor (rated) — preferred quality source when configured.
  const tripadvisor = await tripadvisorNearby(input);
  if (tripadvisor && tripadvisor.length > 0) {
    const partners = await loadPartners(
      tripadvisor.map((r) => r.externalId),
      "tripadvisor",
    );
    const restaurants = tripadvisor.map((r) => {
      const business = withDistance(r.business, input.latitude, input.longitude);
      const normalized: NormalizedRestaurant = { ...r, business };
      const partner = partners.get(r.externalId);
      if (cosmic) {
        try {
          const scored = scoreCuisineAgainstMoment(
            business,
            input.cuisine || r.cuisineLabel || "",
            cosmic.state,
            cosmic.alchemicalProperties,
            cosmic.diurnal,
          );
          return finalizeScored(scored, normalized, partner);
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
    const partners = await loadPartners(
      google.restaurants.map((r) => r.externalId),
      "google",
    );
    const restaurants = google.restaurants.map((r) => {
      const { profile, dominant } = elementProfileForLabel(
        r.cuisineLabel ?? input.cuisine,
      );
      return annotateWithPartner({
        restaurant: r,
        partner: partners.get(r.externalId),
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
      // Yelp results already have scoring; annotate with partners if any.
      const partners = await loadPartners(
        yelp.map((r) => r.business.id),
        "yelp",
      );

      const restaurants = yelp.map((entry) => {
        const partner = partners.get(entry.business.id);
        const isPartner = Boolean(partner?.stripe_connect_account_id);
        if (!isPartner) return entry;
        return {
          ...entry,
          isPartner: true,
          partnerRestaurantId: partner?.internal_restaurant_id,
          stripeConnectAccountId: partner?.stripe_connect_account_id ?? undefined,
          deliverectLocationId: partner?.deliverect_location_id ?? undefined,
          matchReasons: [
            "Partner restaurant with in-app menu ordering",
            ...entry.matchReasons,
          ],
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

  // 2b. OpenStreetMap / Overpass (keyless) — scored when cosmic state exists.
  const osm = await osmNearby(input);
  if (osm && osm.restaurants.length > 0) {
    const partners = await loadPartners(
      osm.restaurants.map((r) => r.externalId),
      "osm",
    );
    const restaurants = osm.restaurants.map((r) => {
      const business = withDistance(r.business, input.latitude, input.longitude);
      const normalized: NormalizedRestaurant = { ...r, business };
      const partner = partners.get(r.externalId);
      if (cosmic) {
        try {
          const scored = scoreCuisineAgainstMoment(
            business,
            input.cuisine || r.cuisineLabel || "",
            cosmic.state,
            cosmic.alchemicalProperties,
            cosmic.diurnal,
          );
          return finalizeScored(scored, normalized, partner);
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
  const foursquare = await foursquareNearby(input);
  if (foursquare && foursquare.length > 0) {
    const partners = await loadPartners(
      foursquare.map((r) => r.externalId),
      "foursquare",
    );
    const restaurants = foursquare.map((r) => {
      const { profile, dominant } = elementProfileForLabel(
        r.cuisineLabel ?? input.cuisine,
      );
      return annotateWithPartner({
        restaurant: r,
        partner: partners.get(r.externalId),
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

  // 4. Nothing usable — report what's missing.
  const noProviderConfigured =
    google.ok === false &&
    google.notConfigured === true &&
    !yelpService.isConfigured() &&
    !process.env.FOURSQUARE_API_KEY;

  if (noProviderConfigured) {
    return {
      restaurants: [],
      cosmicContext,
      source: "google",
      error: "Restaurant discovery is not configured.",
    };
  }

  return {
    restaurants: [],
    cosmicContext,
    source: "google",
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

/** Great-circle distance in meters between two lat/lng points. */
function haversineMeters(
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
  const lat = business.coordinates?.latitude ?? 0;
  const lng = business.coordinates?.longitude ?? 0;
  if (!lat && !lng) return business; // unknown coordinates (e.g. {0,0})
  return { ...business, distance: haversineMeters(centerLat, centerLng, lat, lng) };
}

/** Normalize a native Yelp business into the shared NormalizedRestaurant shape. */
function normalizeYelpBusiness(b: YelpBusiness): NormalizedRestaurant {
  return {
    externalId: b.id,
    name: b.name,
    address:
      b.location?.display_address?.join(", ") || b.location?.address1 || "",
    rating: b.rating,
    imageUrl: b.image_url,
    business: b,
    cuisineLabel: b.categories?.[0]?.title,
  };
}

/** Merge a cosmic-scored result with its normalized display fields + partner annotation. */
function finalizeScored(
  scored: AlchmScoredRestaurant,
  restaurant: NormalizedRestaurant,
  partner: PartnerRow | undefined,
): AlchmScoredRestaurant {
  const isPartner = Boolean(partner?.stripe_connect_account_id);
  const matchReasons = isPartner
    ? ["Partner restaurant with in-app menu ordering", ...scored.matchReasons]
    : scored.matchReasons;

  return {
    ...scored,
    externalId: restaurant.externalId,
    name: restaurant.name,
    address: restaurant.address,
    rating: restaurant.rating,
    imageUrl: restaurant.imageUrl,
    cuisineLabel: restaurant.cuisineLabel,
    primaryType: restaurant.primaryType,
    ratingImageUrl: restaurant.ratingImageUrl,
    isPartner,
    partnerRestaurantId: isPartner ? partner?.internal_restaurant_id : undefined,
    stripeConnectAccountId: isPartner
      ? partner?.stripe_connect_account_id ?? undefined
      : undefined,
    deliverectLocationId: isPartner
      ? partner?.deliverect_location_id ?? undefined
      : undefined,
    matchReasons,
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
          (b.business.rating ?? 0) - (a.business.rating ?? 0) ||
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
          (b.business.rating ?? 0) - (a.business.rating ?? 0) ||
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
  input: Required<DiscoverInput>,
  openNow: boolean,
): Promise<{
  candidates: NormalizedRestaurant[];
  source: RestaurantDiscoverySource;
  notices: string[];
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

  // 3. OpenStreetMap / Overpass (keyless — the always-available live source).
  const osm = await osmNearby(input);
  if (osm && osm.restaurants.length > 0) {
    if (osm.relaxed && input.cuisine) {
      notices.push(
        `No ${input.cuisine} spots tagged nearby — showing nearby restaurants ranked by ${input.cuisine} fit.`,
      );
    }
    return { candidates: osm.restaurants, source: "osm", notices };
  }
  if (osm === null) notices.push("OpenStreetMap was unavailable.");

  // 4. Foursquare (final fallback).
  const foursquare = await foursquareNearby(input);
  if (foursquare && foursquare.length > 0) {
    return { candidates: foursquare, source: "foursquare", notices };
  }

  return { candidates: [], source: "osm", notices };
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
  const input: Required<DiscoverInput> = {
    cuisine: text(inputRaw.cuisine),
    latitude: inputRaw.latitude,
    longitude: inputRaw.longitude,
    radiusMeters: clampRadius(inputRaw.radiusMeters),
    limit: clampLimit(inputRaw.limit),
  };
  const sort: BestMatchSort = inputRaw.sort ?? "match";
  const openNow = inputRaw.openNow === true;

  const cosmic = buildAstrologicalState();
  const cosmicContext = cosmic?.cosmicContext ?? emptyCosmicContext();

  const { candidates, source, notices } = await gatherBestMatchCandidates(
    input,
    openNow,
  );

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

  const partners = await loadPartners(
    candidates.map((r) => r.externalId),
    source,
  );

  const restaurants: AlchmScoredRestaurant[] = candidates.map((r) => {
    const business = withDistance(r.business, input.latitude, input.longitude);
    const normalized: NormalizedRestaurant = { ...r, business };
    const partner = partners.get(r.externalId);

    if (cosmic) {
      try {
        const scored = scoreCuisineAgainstMoment(
          business,
          input.cuisine || r.cuisineLabel || "",
          cosmic.state,
          cosmic.alchemicalProperties,
          cosmic.diurnal,
        );
        return finalizeScored(scored, normalized, partner);
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
    : notices.length > 0
      ? notices.join(" ")
      : undefined;

  return { restaurants: sorted, cosmicContext, source, sourceNotice };
}
