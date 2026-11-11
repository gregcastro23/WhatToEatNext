/**
 * Wire parser for the restaurant-discovery payload.
 *
 * `GET /api/restaurants/discover`, `GET /api/restaurants/best-match` and
 * `POST /api/restaurants/search` all answer with a `RestaurantSearchResponse`
 * (`@/types/yelp`). Four client components used to assert that type onto the
 * body with `(await res.json()) as RestaurantSearchResponse`; they now share
 * this one parser through `readJson(res, { parse })`.
 *
 * Failure behaviour: the four callers run the parse inside their existing
 * `try { … } catch (err) { setStatus({ kind: "error", message: err.message }) }`,
 * so a body that does not match throws a plain `Error` with a readable message
 * and lands in that same error state, exactly as a non-JSON body already did.
 *
 * Two bodies are tolerated on purpose, because the callers already handle them
 * before they read anything else:
 *   - a body carrying a non-empty `error` string (the callers branch on
 *     `data.error` first and never read rows, `cosmicContext` or `source`), and
 *   - a body whose `restaurants` is absent or null (the callers' own
 *     `!data.restaurants` guard shows their "empty" state).
 *
 * Optional fields accept `null` as "not provided". Fields the TS type declares
 * without `| undefined` use `z.exactOptional`, so the parsed value is
 * assignable to `RestaurantSearchResponse` under `exactOptionalPropertyTypes`
 * with no assertion.
 *
 * This module is imported by "use client" components: it imports only zod,
 * `@/lib/api/json` (isJsonRecord) and types.
 *
 * @file src/components/RestaurantDiscovery/restaurantSearchParser.ts
 */

import { z } from "zod";
import { isJsonRecord } from "@/lib/api/json";
import type {
  CosmicContext,
  RestaurantDiscoverySource,
  RestaurantSearchResponse,
} from "@/types/yelp";

// Absent and `null` both mean "not provided"; the output is `T | undefined`.
const optionalString = z.string().nullish().transform((v) => v ?? undefined);
const optionalNumber = z.number().nullish().transform((v) => v ?? undefined);
const optionalBoolean = z.boolean().nullish().transform((v) => v ?? undefined);

/**
 * Keyed by the union itself, so the build fails if `RestaurantDiscoverySource`
 * gains a provider that is not listed here (the parser would otherwise reject
 * that provider's results as "malformed"), or if a stale one is left behind.
 */
const KNOWN_SOURCES: Record<RestaurantDiscoverySource, true> = {
  olo: true,
  yelp: true,
  foursquare: true,
  google: true,
  osm: true,
  tripadvisor: true,
  curated: true,
};

const SourceSchema = z.custom<RestaurantDiscoverySource>(
  (v) => typeof v === "string" && Object.keys(KNOWN_SOURCES).includes(v),
);

const CosmicContextSchema = z.looseObject({
  currentZodiac: z.string(),
  planetaryHour: z.string(),
  dominantElement: z.string(),
});

const BusinessSchema = z.looseObject({
  id: z.string(),
  name: z.string(),
  url: z.string(),
  phone: z.string(),
  rating: z.number(),
  review_count: z.number(),
  price: optionalString,
  distance: optionalNumber,
  categories: z.array(z.looseObject({ alias: z.string(), title: z.string() })),
  location: z.looseObject({
    address1: z.string(),
    city: z.string(),
    state: z.string(),
    zip_code: z.string(),
    display_address: z.array(z.string()),
  }),
  coordinates: z.looseObject({ latitude: z.number(), longitude: z.number() }),
  image_url: optionalString,
  is_closed: z.boolean(),
});

const RestaurantSchema = z.looseObject({
  externalId: optionalString,
  name: optionalString,
  address: optionalString,
  rating: optionalNumber,
  imageUrl: optionalString,
  business: BusinessSchema,
  alchmScore: z.number(),
  elementalMatch: z.number(),
  planetaryAlignment: z.number(),
  thermodynamicAffinity: z.number(),
  dominantElement: z.enum(["Fire", "Water", "Earth", "Air"]),
  matchReasons: z.array(z.string()),
  cuisineElement: z.looseObject({
    Fire: z.number(),
    Water: z.number(),
    Earth: z.number(),
    Air: z.number(),
  }),
  isPartner: optionalBoolean,
  partnerRestaurantId: optionalString,
  partnerOnboardingStatus: optionalString,
  stripeConnectAccountId: optionalString,
  deliverectLocationId: optionalString,
  cuisineLabel: optionalString,
  primaryType: optionalString,
  ratingImageUrl: optionalString,
  dishReviewStats: z.exactOptional(
    z.looseObject({
      averageRating: z.number(),
      reviewCount: z.number(),
      topDish: z.exactOptional(z.string()),
    }),
  ),
  isFavorite: z.exactOptional(z.boolean()),
  commentCount: z.exactOptional(z.number()),
  isAlchemizedPartner: z.exactOptional(z.boolean()),
});

const SearchResponseSchema = z.looseObject({
  restaurants: z.array(RestaurantSchema).nullish().transform((v) => v ?? []),
  cosmicContext: CosmicContextSchema,
  source: SourceSchema.nullish().transform((v) => v ?? undefined),
  sourceNotice: optionalString,
  error: optionalString,
});

function emptyCosmicContext(): CosmicContext {
  return { currentZodiac: "", planetaryHour: "", dominantElement: "" };
}

/**
 * `parse` for `readJson`: a validated `RestaurantSearchResponse`, or a thrown
 * `Error` the caller's existing catch turns into its error state.
 */
export function parseRestaurantSearchResponse(
  value: unknown,
): RestaurantSearchResponse {
  if (isJsonRecord(value)) {
    const { error } = value;
    if (typeof error === "string" && error !== "") {
      // Callers branch on `error` before reading anything else.
      return { restaurants: [], cosmicContext: emptyCosmicContext(), error };
    }
  }
  const result = SearchResponseSchema.safeParse(value);
  if (!result.success) {
    const where = result.error.issues[0]?.path.map(String).join(".") ?? "";
    throw new Error(
      where
        ? `Restaurant results were malformed (at ${where}).`
        : "Restaurant results were malformed.",
    );
  }
  return result.data;
}
