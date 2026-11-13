/**
 * Wire parser for `GET /api/cuisines/recommend` as `DynamicCuisineRecommender`
 * reads it.
 *
 * Producer: `src/app/api/cuisines/recommend/route.ts` (the success bodies are
 * 2xx; every refusal is non-2xx and the host throws on `!response.ok` before it
 * parses, so a refusal never reaches this parser).
 *   - backend branch (route.ts:236-251): `{ success: true, source: "backend",
 *     personalized: false, dominantElement, secondaryElement, recommendations,
 *     elementDistribution, cuisines, topCuisines, cuisineRecommendations,
 *     recipeCounts, calculatedAt }`. The values come from `parseCuisinesResponse`
 *     (lib/validation/railway.ts:166-200), whose lists are `z.array(z.unknown())`
 *     except `recommendations.cuisines` (strings). The real Railway answer
 *     carries only `cuisine_recommendations` (rich objects), so every other key
 *     is `undefined` and JSON drops it. A no-sky answer sends
 *     `compatibility_reason: null` on each object (the host's `??` handles it).
 *   - local branch (route.ts:254-262, built at :185-201): `{ success: true,
 *     source: "local", dominantElement, secondaryElement, signature,
 *     recommendations: { cuisines, cookingMethods, flavors }, elementDistribution,
 *     personalized, recipeCounts, calculatedAt }`. Cuisines are plain strings.
 *   - `recipeCounts` is always an object of integers (route.ts:58-68).
 *   - failure: `500 { success: false, error }` (route.ts:263-269) and the
 *     rateLimit 429 are non-2xx.
 *
 * Failure contract (inside the host's existing try/catch, which already falls
 * back to its legacy scoring on any throw):
 *   - a body that is not a JSON object, or a `success` that is not a boolean,
 *     THROWS;
 *   - `success: false` parses to an empty result: the host never reads the lists
 *     on that path, so they are not validated;
 *   - only the list the host would SELECT is validated, in the host's old
 *     fallback order (`recommendations.cuisines`, `cuisines`, `topCuisines`,
 *     `cuisineRecommendations`, `recommendations` as an array; the first one that
 *     is an array wins, even when empty). A shadowed list is never read, so it
 *     cannot make the parse reject;
 *   - an entry is a string or an object with a string `name` or `cuisine_id`;
 *     `null` counts as absent for the optional fields (the host reads them with
 *     `??`). A mistyped entry is dropped, but if the list arrived non-empty and
 *     NONE matched, that throws as well. An empty list is a valid empty result;
 *   - `personalized` must be a boolean when present; `recipeCounts` must be an
 *     object when present and keeps only its finite-number values;
 *   - `source` is only logged by the host, so a non-string is simply omitted.
 *
 * Client-safe: imports only `@/lib/api/json`.
 *
 * @file src/components/home/cuisineRecommendParser.ts
 */

import { isJsonRecord } from "@/lib/api/json";

export interface ApiNestedRecipe {
  recipe_id?: string;
  id?: string;
  name?: string;
}

export interface ApiCuisineItem {
  name?: string;
  cuisine_id?: string;
  compatibility_reason?: string;
  nested_recipes?: ApiNestedRecipe[];
}

export type ApiCuisineEntry = string | ApiCuisineItem;

export interface CuisineRecommendResponse {
  success: boolean;
  source?: string;
  personalized: boolean;
  recipeCounts: Record<string, number>;
  /** The list the host selected from the body; `[]` when there was none. */
  cuisines: ApiCuisineEntry[];
}

const NO_ENTRY_MATCHED = "No cuisine in the recommend response matched the expected shape";

/** `undefined` and JSON `null` are absent (the host reads these with `??`). */
function isAbsentOrString(value: unknown): value is string | null | undefined {
  return value === undefined || value === null || typeof value === "string";
}

function parseNestedRecipe(value: unknown): ApiNestedRecipe | undefined {
  if (!isJsonRecord(value)) return undefined;
  const { recipe_id: recipeId, id, name } = value;
  if (!isAbsentOrString(recipeId) || !isAbsentOrString(id) || !isAbsentOrString(name)) {
    return undefined;
  }
  return {
    ...(typeof recipeId === "string" ? { recipe_id: recipeId } : {}),
    ...(typeof id === "string" ? { id } : {}),
    ...(typeof name === "string" ? { name } : {}),
  };
}

/** `undefined` when the list is not an array, or arrived non-empty with no usable row. */
function parseNestedRecipes(value: unknown): ApiNestedRecipe[] | undefined {
  if (!Array.isArray(value)) return undefined;
  const list: readonly unknown[] = value;
  const rows: ApiNestedRecipe[] = [];
  for (const item of list) {
    const row = parseNestedRecipe(item);
    if (row) rows.push(row);
  }
  return list.length > 0 && rows.length === 0 ? undefined : rows;
}

/** An object entry, or `undefined` when a field the host reads has the wrong type. */
function parseCuisineItem(value: unknown): ApiCuisineItem | undefined {
  if (!isJsonRecord(value)) return undefined;
  const {
    name,
    cuisine_id: cuisineId,
    compatibility_reason: reason,
    nested_recipes: nested,
  } = value;
  if (!isAbsentOrString(name) || !isAbsentOrString(cuisineId) || !isAbsentOrString(reason)) {
    return undefined;
  }
  // The host matches on `name ?? cuisine_id`, so an entry with neither names nothing.
  if (typeof name !== "string" && typeof cuisineId !== "string") return undefined;
  const hasNested = nested !== undefined && nested !== null;
  const nestedRecipes = hasNested ? parseNestedRecipes(nested) : undefined;
  if (hasNested && nestedRecipes === undefined) return undefined;
  return {
    ...(typeof name === "string" ? { name } : {}),
    ...(typeof cuisineId === "string" ? { cuisine_id: cuisineId } : {}),
    ...(typeof reason === "string" ? { compatibility_reason: reason } : {}),
    ...(nestedRecipes !== undefined ? { nested_recipes: nestedRecipes } : {}),
  };
}

function parseEntry(value: unknown): ApiCuisineEntry | undefined {
  return typeof value === "string" ? value : parseCuisineItem(value);
}

/** The first array in the host's old fallback chain, or `[]` when none is an array. */
function selectCandidateList(body: Record<string, unknown>): readonly unknown[] {
  const { recommendations: recs, cuisines, topCuisines, cuisineRecommendations } = body;
  const candidates: unknown[] = [
    isJsonRecord(recs) ? recs.cuisines : undefined,
    cuisines,
    topCuisines,
    cuisineRecommendations,
    recs,
  ];
  for (const candidate of candidates) {
    if (Array.isArray(candidate)) {
      const list: readonly unknown[] = candidate;
      return list;
    }
  }
  return [];
}

function parseEntries(list: readonly unknown[]): ApiCuisineEntry[] {
  const entries: ApiCuisineEntry[] = [];
  for (const item of list) {
    const entry = parseEntry(item);
    if (entry !== undefined) entries.push(entry);
  }
  if (list.length > 0 && entries.length === 0) {
    throw new TypeError(NO_ENTRY_MATCHED);
  }
  return entries;
}

function parseRecipeCounts(value: unknown): Record<string, number> {
  if (value === undefined || value === null) return {};
  if (!isJsonRecord(value)) {
    throw new TypeError("Cuisine recommend response had a mistyped recipeCounts");
  }
  const counts = Object.entries(value).filter(
    (entry): entry is [string, number] =>
      typeof entry[1] === "number" && Number.isFinite(entry[1]),
  );
  return Object.fromEntries(counts);
}

function parsePersonalized(value: unknown): boolean {
  if (value === undefined) return false;
  if (typeof value !== "boolean") {
    throw new TypeError("Cuisine recommend response had a non-boolean personalized");
  }
  return value;
}

/** `parse` for `readJson`. See the header for what is validated and what throws. */
export function parseCuisineRecommendResponse(value: unknown): CuisineRecommendResponse {
  if (!isJsonRecord(value)) {
    throw new TypeError("Cuisine recommend response was not a JSON object");
  }
  const { success, source } = value;
  if (typeof success !== "boolean") {
    throw new TypeError("Cuisine recommend response had no boolean success");
  }
  const sourceField = typeof source === "string" ? { source } : {};
  if (!success) {
    return { success, personalized: false, recipeCounts: {}, cuisines: [], ...sourceField };
  }
  return {
    success,
    personalized: parsePersonalized(value.personalized),
    recipeCounts: parseRecipeCounts(value.recipeCounts),
    cuisines: parseEntries(selectCandidateList(value)),
    ...sourceField,
  };
}
