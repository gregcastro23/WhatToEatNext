/**
 * Wire parsers for the two fetches in `EnhancedCookingMethodRecommender`. They
 * replace `(await res.json()) as CurrentMomentPayload` and
 * `… as { success?; recipes?: AlignedRecipe[] }`.
 *
 * The shapes are what `GET /api/alchm-quantities` (already validated server-side
 * by `AlchmQuantitiesApiResponseSchema`) and `GET /api/recommendations/recipes`
 * really send. The server schema file is not imported: it drags the whole API
 * schema catalog into a "use client" bundle.
 *
 * @file src/components/recommendations/momentParsers.ts
 */

import { z } from "zod";
import { isJsonRecord, parseJsonRecord } from "@/lib/api/json";

const EsmsSchema = z.object({
  Spirit: z.number(),
  Essence: z.number(),
  Matter: z.number(),
  Substance: z.number(),
});

const CurrentMomentSchema = z.object({
  success: z.literal(true),
  timestamp: z.string(),
  quantities: EsmsSchema,
  dominantElement: z.string(),
  heat: z.number(),
  entropy: z.number(),
  reactivity: z.number(),
  energy: z.number(),
  kalchm: z.number(),
  monica: z.number(),
  circuit: z.object({
    charge: z.number(),
    potentialDifference: z.number(),
    currentFlow: z.number(),
    power: z.number(),
    inertia: z.number(),
    forceMagnitude: z.number(),
    forceClassification: z.enum(["accelerating", "decelerating", "balanced"]),
    thermalDirection: z.enum(["heating", "cooling", "stable"]),
    elementalBalance: z.object({
      Fire: z.number(),
      Water: z.number(),
      Earth: z.number(),
      Air: z.number(),
    }),
  }),
});

/** The current-moment fields the recommender reads (`historicalContext` was declared but never read). */
export type CurrentMomentPayload = z.infer<typeof CurrentMomentSchema>;

/**
 * `parse` for `readJson` on `/api/alchm-quantities`.
 *
 * Returns `null` for a body whose `success` is falsy (the old `if (data.success)`
 * was a no-op for those). A `success: true` body that does not match THROWS into
 * the caller's existing catch, which sets the "error" moment status — instead of
 * storing a partial payload that `currentMoment.circuit.…` would crash on at render.
 */
export function parseCurrentMoment(value: unknown): CurrentMomentPayload | null {
  const body = parseJsonRecord(value);
  if (!body.success) return null;
  return CurrentMomentSchema.parse(body);
}

export interface AlignedRecipe {
  id: string;
  name: string;
  matchScore: number;
  cuisine?: string;
  elementalProperties?: Record<string, number>;
}

function parseElementalProperties(raw: unknown): Record<string, number> | undefined {
  if (!isJsonRecord(raw)) return undefined;
  const props: Record<string, number> = {};
  for (const [element, amount] of Object.entries(raw)) {
    if (typeof amount === "number" && Number.isFinite(amount)) props[element] = amount;
  }
  return props;
}

function parseAlignedRecipe(raw: unknown): AlignedRecipe | null {
  if (!isJsonRecord(raw)) return null;
  const { id, name, matchScore, cuisine, elementalProperties } = raw;
  if (typeof id !== "string" || typeof name !== "string") return null;
  if (typeof matchScore !== "number" || !Number.isFinite(matchScore)) return null;
  const props = parseElementalProperties(elementalProperties);
  return {
    id,
    name,
    matchScore,
    // The route sends `cuisine: null` when unknown; the UI reads `?? "Global"`.
    ...(typeof cuisine === "string" ? { cuisine } : {}),
    ...(props ? { elementalProperties: props } : {}),
  };
}

/**
 * `parse` for `readJson` on `/api/recommendations/recipes`.
 *
 * Returns `null` unless `success` is truthy and `recipes` is an array (the old
 * `data.success && Array.isArray(data.recipes)` guard). Rows without a string
 * `id`/`name` or a finite `matchScore` are dropped — the route omits `id`/`name`
 * when a catalog recipe lacks them, and the UI keys and titles the card on them.
 */
export function parseAlignedRecipes(value: unknown): AlignedRecipe[] | null {
  const { success, recipes } = parseJsonRecord(value);
  if (!success || !Array.isArray(recipes)) return null;
  const rows: readonly unknown[] = recipes;
  const parsed: AlignedRecipe[] = [];
  for (const row of rows) {
    const recipe = parseAlignedRecipe(row);
    if (recipe) parsed.push(recipe);
  }
  return parsed;
}
