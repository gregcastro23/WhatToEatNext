/**
 * Railway Backend Zod Schemas
 *
 * These schemas validate responses from the Railway Python backend
 * (https://whattoeatnext-production.up.railway.app). They are the
 * single source of truth for what the frontend expects from the backend.
 *
 * If the Railway backend changes a field shape, the parse() call will
 * throw immediately — surfacing the regression at the API boundary
 * instead of silently corrupting downstream alchemical calculations.
 */

import { z } from "zod";

// ─── Individual planet position data ────────────────────────────────────────
// The backend may return any combination of these longitude field names
// depending on the endpoint version, so all are optional and we pick the
// first truthy one in formatRailwayResponse.

export const RailwayPlanetDataSchema = z
  .object({
    exactLongitude: z.number().optional(),
    longitude: z.number().optional(),
    eclipticLongitude: z.number().optional(),
    sign: z.string().optional(),
    degree: z.number().optional(),
    isRetrograde: z.boolean().optional(),
    retrograde: z.boolean().optional(),
  })
  .passthrough(); // allow extra backend fields without stripping them

export type RailwayPlanetData = z.infer<typeof RailwayPlanetDataSchema>;

// ─── Full /api/planetary/positions response ──────────────────────────────────
// The backend wraps positions under one of several keys; the route handler
// normalises them all via `positionsData = railwayData.planetary_positions ??
// railwayData.positions ?? railwayData`.

export const RailwayPositionsResponseSchema = z
  .object({
    planetary_positions: z.record(z.string(), RailwayPlanetDataSchema).optional(),
    positions: z.record(z.string(), RailwayPlanetDataSchema).optional(),
  })
  .passthrough();

export type RailwayPositionsResponse = z.infer<typeof RailwayPositionsResponseSchema>;

// ─── POST request body (/api/astrologize) ───────────────────────────────────

export const PlanetaryRequestSchema = z.object({
  year: z.number().int().min(1800).max(2300),
  month: z.number().int().min(1).max(12),
  /** Frontend sends "date", backend sends "day" — both accepted */
  date: z.number().int().min(1).max(31).optional(),
  day: z.number().int().min(1).max(31).optional(),
  hour: z.number().int().min(0).max(23).default(0),
  minute: z.number().int().min(0).max(59).default(0),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  zodiacSystem: z.enum(["tropical", "sidereal"]).default("tropical"),
});

export type PlanetaryRequest = z.infer<typeof PlanetaryRequestSchema>;

// ─── Helper: parse and log Railway response (/api/astrologize) ───────────────
// Returns the validated response on success, null on failure so callers can
// fall back to the local astronomy-engine without crashing.

export function parseRailwayResponse(raw: unknown): RailwayPositionsResponse | null {
  const result = RailwayPositionsResponseSchema.safeParse(raw);
  if (!result.success) {
    console.warn(
      "[astrologize] Railway response failed schema validation — falling back to local engine.",
      result.error.flatten().fieldErrors,
    );
    return null;
  }
  return result.data;
}

// ─── GET query params (/api/alchemize) ───────────────────────────────────────

export const AlchemizeQuerySchema = z.object({
  /** ISO-8601 date string; defaults to current time if omitted or invalid */
  date: z
    .string()
    .optional()
    .transform((val) => {
      if (!val) return new Date();
      const d = new Date(val);
      return Number.isNaN(d.getTime()) ? new Date() : d;
    }),
  /** Use full enhanced (sect + dignity + aspects) calculation; default true */
  enhanced: z
    .string()
    .optional()
    .transform((val) => val !== "false"),
});

export type AlchemizeQuery = z.infer<typeof AlchemizeQuerySchema>;

// ─── GET query params (/api/cuisines/recommend) ──────────────────────────────

const ZODIAC_SIGNS = [
  "aries", "taurus", "gemini", "cancer", "leo", "virgo",
  "libra", "scorpio", "sagittarius", "capricorn", "aquarius", "pisces",
] as const;

const SEASONS = ["spring", "summer", "fall", "winter"] as const;

const MEAL_TYPES = [
  "breakfast", "lunch", "dinner", "snack", "brunch", "dessert",
] as const;

export const CuisinesQuerySchema = z.object({
  zodiacSign: z
    .enum(ZODIAC_SIGNS)
    .optional()
    .catch(undefined), // unknown sign → ignore rather than 400
  season: z
    .enum(SEASONS)
    .optional()
    .catch(undefined),
  mealType: z
    .enum(MEAL_TYPES)
    .optional()
    .catch(undefined),
});

export type CuisinesQuery = z.infer<typeof CuisinesQuerySchema>;

// ─── Railway /cuisines/recommend response ────────────────────────────────────
// Validates the fields the frontend actively uses; allows extra fields through
// so future backend additions don't break the route.

export const RailwayCuisinesResponseSchema = z
  .object({
    dominantElement: z.string().optional(),
    secondaryElement: z.string().optional(),
    recommendations: z
      .object({
        cuisines: z.array(z.string()).optional(),
        cookingMethods: z.array(z.string()).optional(),
        flavors: z.array(z.string()).optional(),
      })
      .passthrough()
      .optional(),
    elementDistribution: z.record(z.string(), z.number()).optional(),
    // The backend may include scored cuisine lists
    cuisines: z.array(z.unknown()).optional(),
    topCuisines: z.array(z.unknown()).optional(),
  })
  .passthrough();

export type RailwayCuisinesResponse = z.infer<typeof RailwayCuisinesResponseSchema>;

// ─── Helper: parse and log Railway cuisines response ─────────────────────────

export function parseCuisinesResponse(raw: unknown): RailwayCuisinesResponse | null {
  const result = RailwayCuisinesResponseSchema.safeParse(raw);
  if (!result.success) {
    console.warn(
      "[cuisines] Railway response failed schema validation — falling back to local engine.",
      result.error.flatten().fieldErrors,
    );
    return null;
  }
  return result.data;
}
