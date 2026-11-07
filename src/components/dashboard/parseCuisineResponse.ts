/**
 * Parses GET /api/cuisines/recommend responses for the profile dashboard and
 * for the home hero's "TONIGHT: X" badge.
 *
 * The route has two response shapes, depending on which engine served it:
 * - Railway backend: rich cuisine objects under `cuisineRecommendations` (and
 *   no `recommendations` key at all), ranked by elemental match with the current
 *   sky, best first, each carrying its `astrological_score`. With no sky to rank
 *   by, every score is null and the order is merely alphabetical.
 * - Local engine: plain cuisine names under `recommendations.cuisines`: the
 *   dominant element's first three cuisines, then the secondary element's first
 *   two, in a hand-written order and with no per-cuisine score.
 * The rich list wins when a body carries both. `cuisines` and `topCuisines`,
 * which the route also forwards, are not read.
 */

export interface CuisineRecommendation {
  cuisine_id: string;
  name: string;
  /** The backend's match with the current sky; null when it had no sky to rank by.
   *  Absent for the local engine's names, which carry no score. */
  astrological_score?: number | null;
  description?: string;
  elemental_properties?: Record<string, number>;
  flavor_profile?: Record<string, number>;
  nested_recipes?: Array<{
    recipe_id: string;
    name: string;
    description: string;
    prep_time: string;
    cook_time: string;
    difficulty: string;
    meal_type: string;
  }>;
}

function asNonEmptyNumberRecord(value: unknown): Record<string, number> | undefined {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return undefined;
  const entries = Object.entries(value as Record<string, unknown>).filter(
    ([, v]) => typeof v === 'number'
  );
  return entries.length > 0 ? (Object.fromEntries(entries) as Record<string, number>) : undefined;
}

export function parseCuisineResponse(payload: unknown): CuisineRecommendation[] {
  if (!payload || typeof payload !== 'object') return [];
  const data = payload as Record<string, unknown>;

  if (Array.isArray(data.cuisineRecommendations)) {
    const rich = data.cuisineRecommendations
      .filter(
        (c): c is Record<string, unknown> =>
          !!c && typeof c === 'object' && typeof (c as Record<string, unknown>).name === 'string'
      )
      .map((c): CuisineRecommendation => {
        const item: CuisineRecommendation = {
          cuisine_id:
            typeof c.cuisine_id === 'string' ? c.cuisine_id : (c.name as string).toLowerCase(),
          name: c.name as string,
        };
        item.astrological_score =
          typeof c.astrological_score === 'number' ? c.astrological_score : null;
        if (typeof c.description === 'string') item.description = c.description;
        const elem = asNonEmptyNumberRecord(c.elemental_properties);
        if (elem) item.elemental_properties = elem;
        const flav = asNonEmptyNumberRecord(c.flavor_profile);
        if (flav) item.flavor_profile = flav;
        if (Array.isArray(c.nested_recipes)) {
          item.nested_recipes = c.nested_recipes as NonNullable<CuisineRecommendation['nested_recipes']>;
        }
        return item;
      });
    if (rich.length > 0) return rich;
  }

  const recs = data.recommendations;
  if (recs && typeof recs === 'object' && Array.isArray((recs as Record<string, unknown>).cuisines)) {
    return ((recs as Record<string, unknown>).cuisines as unknown[])
      .filter((n): n is string => typeof n === 'string')
      .map((name) => ({ cuisine_id: name.toLowerCase(), name }));
  }

  return [];
}
