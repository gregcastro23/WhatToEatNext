import { z } from "zod";

/** True when year-month-day is a date that exists: February has no 30th, 2023 no 29th. */
function isCalendarDate({ year, month, day }: { year: number; month: number; day: number }): boolean {
  const date = new Date(0);
  // setUTCFullYear, not Date.UTC: Date.UTC reads the years 0 to 99 as 1900 to 1999.
  date.setUTCFullYear(year, month - 1, day);
  return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day;
}

/**
 * Body of POST /api/astrological/recipe-recommendations-by-chart.
 *
 * These are the fields `fetchAstrologicalRecipes` sends (`RecipeRecommendationBirthData` in
 * src/services/astrologizeApi.ts) and the required fields of `RecipeRecommendationRequest` in
 * backend/alchm_kitchen/main.py, which the proxy forwards them to. The route used to validate
 * `BirthDataSchema` instead (an ISO `dateTime` the client never sends), so every request the
 * client could make was rejected with a 400 before it reached the backend.
 *
 * The ranges are those of CHART_RANGES in backend/utils/by_chart_recommendations.py, which the
 * backend enforces too (it is reachable without this proxy); the route's test reads that table.
 * The year bound is the ephemeris's: with no data files it computes years 1 to 3000.
 *
 * The backend's two optional fields are deliberately not accepted here: zod drops unknown keys,
 * so a browser cannot pass `secondary_chart_ids` through to a backend that looks saved charts up
 * by id without asking whose they are.
 */
export const RecipeRecommendationRequestSchema = z
  .object({
    year: z.number().int().min(1).max(3000),
    month: z.number().int().min(1).max(12),
    day: z.number().int().min(1).max(31),
    hour: z.number().int().min(0).max(23),
    minute: z.number().int().min(0).max(59),
    latitude: z.number().min(-90).max(90),
    longitude: z.number().min(-180).max(180),
  })
  .refine(isCalendarDate, { message: "not a calendar date", path: ["day"] });

export type RecipeRecommendationRequest = z.infer<typeof RecipeRecommendationRequestSchema>;
