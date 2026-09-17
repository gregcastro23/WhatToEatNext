/**
 * Parses GET /api/cuisines/recommend responses for the profile dashboard.
 *
 * The route has two response shapes depending on which engine served it:
 * - Railway backend branch: rich cuisine objects under `cuisineRecommendations`
 * - Local fallback branch: plain cuisine names under `recommendations.cuisines`
 */

export interface CuisineRecommendation {
  cuisine_id: string;
  name: string;
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
