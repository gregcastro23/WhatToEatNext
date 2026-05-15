/**
 * User Interactions Service
 *
 * Server-side replacement for the in-memory user-learning singleton. Records
 * interaction events to `user_interactions` and derives the Taste Graph that
 * powers /profile/[userId] and the broader personalization engine.
 *
 * Why: the legacy client singleton (src/lib/personalization/user-learning.ts)
 * lives in process memory and evaporates on reload, so the Taste Graph would
 * be empty for every user on first paint. This service makes the graph
 * durable, cross-device, and editable via `taste_corrections`.
 */

import { executeQuery } from "@/lib/database";

export type InteractionType =
  | "recipe_view"
  | "recipe_save"
  | "recipe_cook"
  | "ingredient_select"
  | "cooking_method"
  | "planetary_query"
  | "food_diary_entry"
  | "food_rating";

export interface RecordInteractionInput {
  userId: string;
  type: InteractionType;
  payload: Record<string, unknown>;
  context?: Record<string, unknown>;
  weight?: number;
}

interface InteractionRow {
  id: string;
  user_id: string;
  interaction_type: InteractionType;
  payload: Record<string, unknown>;
  context: Record<string, unknown>;
  weight: string; // numeric arrives as string
  created_at: string;
}

interface ElementalAffinity {
  Fire: number;
  Water: number;
  Earth: number;
  Air: number;
}

export interface TasteGraph {
  cuisines: Array<{ name: string; score: number }>;
  cookingMethods: Array<{ name: string; score: number }>;
  favoriteIngredients: string[];
  dislikedIngredients: string[];
  elementalAffinities: ElementalAffinity;
  planetaryPreferences: Array<{ planet: string; score: number }>;
  mealTimePatterns: Array<{ mealTime: string; count: number }>;
  complexityPreference: "simple" | "moderate" | "complex";
  // 0-1; saturates after ~100 interactions
  confidence: number;
  totalInteractions: number;
  lastActivity: string | null;
  corrections: TasteCorrections;
}

export type TasteVerdict = "love" | "block";

export interface TasteCorrections {
  cuisines?: Record<string, TasteVerdict>;
  ingredients?: Record<string, TasteVerdict>;
  methods?: Record<string, TasteVerdict>;
  planets?: Record<string, TasteVerdict>;
}

const EMPTY_ELEMENTAL: ElementalAffinity = {
  Fire: 0.25,
  Water: 0.25,
  Earth: 0.25,
  Air: 0.25,
};

export async function recordInteraction(
  input: RecordInteractionInput,
): Promise<void> {
  await executeQuery(
    `INSERT INTO user_interactions (user_id, interaction_type, payload, context, weight)
     VALUES ($1, $2, $3::jsonb, $4::jsonb, $5)`,
    [
      input.userId,
      input.type,
      JSON.stringify(input.payload ?? {}),
      JSON.stringify(input.context ?? {}),
      input.weight ?? 1,
    ],
  );
}

async function fetchInteractions(
  userId: string,
  limit = 1000,
): Promise<InteractionRow[]> {
  const result = await executeQuery<InteractionRow>(
    `SELECT id, user_id, interaction_type, payload, context, weight::text, created_at
       FROM user_interactions
      WHERE user_id = $1
      ORDER BY created_at DESC
      LIMIT $2`,
    [userId, limit],
  );
  return result.rows;
}

async function fetchCorrections(userId: string): Promise<TasteCorrections> {
  const result = await executeQuery<{ taste_corrections: unknown }>(
    `SELECT taste_corrections FROM user_profiles WHERE user_id = $1 LIMIT 1`,
    [userId],
  );
  const raw = result.rows[0]?.taste_corrections;
  if (!raw) return {};
  if (typeof raw === "string") {
    try {
      return JSON.parse(raw) as TasteCorrections;
    } catch {
      return {};
    }
  }
  return raw as TasteCorrections;
}

function payloadWeight(row: InteractionRow): number {
  const explicit = parseFloat(row.weight);
  if (Number.isFinite(explicit) && explicit !== 1) return explicit;
  const fromPayload = (row.payload as { weight?: number })?.weight;
  return typeof fromPayload === "number" && Number.isFinite(fromPayload)
    ? fromPayload
    : 1;
}

function topScored<T extends string>(
  scores: Record<T, number>,
  count: number,
): Array<{ name: T; score: number }> {
  return (Object.entries(scores) as Array<[T, number]>)
    .filter(([, s]) => s > 0)
    .sort(([, a], [, b]) => b - a)
    .slice(0, count)
    .map(([name, score]) => ({ name, score }));
}

function applyVerdicts<T extends { name: string; score: number }>(
  entries: T[],
  verdicts: Record<string, TasteVerdict> | undefined,
): T[] {
  if (!verdicts) return entries;
  const filtered = entries.filter((e) => verdicts[e.name] !== "block");
  // Loved entries that aren't in the implicit list get pinned at the top
  const loved = Object.entries(verdicts)
    .filter(([name, v]) => v === "love" && !filtered.find((e) => e.name === name))
    .map(([name]) => ({ name, score: 1 } as unknown as T));
  return [...loved, ...filtered];
}

function applyIngredientVerdicts(
  favorites: string[],
  dislikes: string[],
  verdicts: Record<string, TasteVerdict> | undefined,
): { favorites: string[]; dislikes: string[] } {
  if (!verdicts) return { favorites, dislikes };
  const lovedSet = new Set(
    Object.entries(verdicts)
      .filter(([, v]) => v === "love")
      .map(([k]) => k),
  );
  const blockedSet = new Set(
    Object.entries(verdicts)
      .filter(([, v]) => v === "block")
      .map(([k]) => k),
  );
  const nextFavorites = Array.from(
    new Set([...lovedSet, ...favorites.filter((f) => !blockedSet.has(f))]),
  );
  const nextDislikes = Array.from(
    new Set([...blockedSet, ...dislikes.filter((d) => !lovedSet.has(d))]),
  );
  return { favorites: nextFavorites, dislikes: nextDislikes };
}

export async function computeTasteGraph(userId: string): Promise<TasteGraph> {
  const [rows, corrections] = await Promise.all([
    fetchInteractions(userId),
    fetchCorrections(userId),
  ]);

  if (rows.length === 0) {
    return {
      cuisines: [],
      cookingMethods: [],
      favoriteIngredients: [],
      dislikedIngredients: [],
      elementalAffinities: { ...EMPTY_ELEMENTAL },
      planetaryPreferences: [],
      mealTimePatterns: [],
      complexityPreference: "moderate",
      confidence: 0,
      totalInteractions: 0,
      lastActivity: null,
      corrections,
    };
  }

  const cuisineScores: Record<string, number> = {};
  const methodScores: Record<string, number> = {};
  const ingredientScores: Record<string, number> = {};
  const planetaryScores: Record<string, number> = {};
  const mealTimeCounts: Record<string, number> = {};
  const complexityScores: Record<"simple" | "moderate" | "complex", number> = {
    simple: 0,
    moderate: 0,
    complex: 0,
  };
  const elemental: ElementalAffinity = { Fire: 0, Water: 0, Earth: 0, Air: 0 };
  let elementalWeight = 0;

  for (const row of rows) {
    const w = payloadWeight(row);
    const payload = row.payload;

    switch (row.interaction_type) {
      case "recipe_view":
      case "recipe_save":
      case "recipe_cook": {
        const cuisine = typeof payload.cuisine === "string" ? payload.cuisine : null;
        if (cuisine) cuisineScores[cuisine] = (cuisineScores[cuisine] ?? 0) + w;

        const method =
          typeof payload.cookingMethod === "string" ? payload.cookingMethod : null;
        if (method) methodScores[method] = (methodScores[method] ?? 0) + w;

        const ingredients = Array.isArray(payload.ingredients)
          ? (payload.ingredients as string[])
          : null;
        if (ingredients) {
          for (const ing of ingredients) {
            if (typeof ing === "string")
              ingredientScores[ing] = (ingredientScores[ing] ?? 0) + w * 0.5;
          }
        }

        const balance = payload.elementalBalance as Partial<ElementalAffinity> | undefined;
        if (balance) {
          for (const k of ["Fire", "Water", "Earth", "Air"] as const) {
            const v = balance[k];
            if (typeof v === "number") elemental[k] += v * w;
          }
          elementalWeight += w;
        }

        const complexity = payload.complexity;
        if (complexity === "simple" || complexity === "moderate" || complexity === "complex") {
          complexityScores[complexity] += w;
        }
        break;
      }

      case "ingredient_select": {
        const selected = Array.isArray(payload.selected) ? (payload.selected as string[]) : [];
        const rejected = Array.isArray(payload.rejected) ? (payload.rejected as string[]) : [];
        for (const ing of selected)
          if (typeof ing === "string")
            ingredientScores[ing] = (ingredientScores[ing] ?? 0) + w;
        for (const ing of rejected)
          if (typeof ing === "string")
            ingredientScores[ing] = (ingredientScores[ing] ?? 0) - w;
        break;
      }

      case "cooking_method": {
        const method = typeof payload.method === "string" ? payload.method : null;
        if (method) methodScores[method] = (methodScores[method] ?? 0) + w;
        break;
      }

      case "planetary_query": {
        const planet = typeof payload.planet === "string" ? payload.planet : null;
        const engagement =
          typeof payload.engagement === "number" ? payload.engagement : 0.5;
        if (planet)
          planetaryScores[planet] = (planetaryScores[planet] ?? 0) + engagement * w;
        break;
      }

      case "food_diary_entry": {
        const food = typeof payload.foodName === "string" ? payload.foodName : null;
        const mealType = typeof payload.mealType === "string" ? payload.mealType : null;
        if (food) ingredientScores[food] = (ingredientScores[food] ?? 0) + w * 0.75;
        if (mealType) mealTimeCounts[mealType] = (mealTimeCounts[mealType] ?? 0) + 1;
        break;
      }

      case "food_rating": {
        const food = typeof payload.foodName === "string" ? payload.foodName : null;
        const rating = typeof payload.rating === "number" ? payload.rating : null;
        if (food && rating !== null) {
          const ratingWeight = rating >= 4 ? 3 : rating >= 3 ? 1 : rating <= 2 ? -2 : 0;
          ingredientScores[food] = (ingredientScores[food] ?? 0) + ratingWeight * w;
        }
        break;
      }
    }
  }

  if (elementalWeight > 0) {
    for (const k of ["Fire", "Water", "Earth", "Air"] as const) {
      elemental[k] = elemental[k] / elementalWeight;
    }
  } else {
    Object.assign(elemental, EMPTY_ELEMENTAL);
  }

  const favorites = Object.entries(ingredientScores)
    .filter(([, s]) => s >= 2)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 12)
    .map(([k]) => k);

  const dislikes = Object.entries(ingredientScores)
    .filter(([, s]) => s <= -2)
    .sort(([, a], [, b]) => a - b)
    .slice(0, 8)
    .map(([k]) => k);

  const complexity = (Object.entries(complexityScores).sort(
    ([, a], [, b]) => b - a,
  )[0]?.[0] ?? "moderate") as "simple" | "moderate" | "complex";

  const cuisines = applyVerdicts(topScored(cuisineScores, 5), corrections.cuisines);
  const cookingMethods = applyVerdicts(
    topScored(methodScores, 5),
    corrections.methods,
  );
  const { favorites: mergedFav, dislikes: mergedDis } = applyIngredientVerdicts(
    favorites,
    dislikes,
    corrections.ingredients,
  );
  const planetaryPreferences = applyVerdicts(
    topScored(planetaryScores, 6).map((p) => ({ name: p.name, score: p.score })),
    corrections.planets,
  ).map((p) => ({ planet: p.name, score: p.score }));

  const mealTimePatterns = Object.entries(mealTimeCounts)
    .sort(([, a], [, b]) => b - a)
    .map(([mealTime, count]) => ({ mealTime, count }));

  return {
    cuisines: cuisines.map((c) => ({ name: c.name, score: c.score })),
    cookingMethods: cookingMethods.map((m) => ({ name: m.name, score: m.score })),
    favoriteIngredients: mergedFav,
    dislikedIngredients: mergedDis,
    elementalAffinities: elemental,
    planetaryPreferences,
    mealTimePatterns,
    complexityPreference: complexity,
    confidence: Math.min(rows.length / 100, 1),
    totalInteractions: rows.length,
    lastActivity: rows[0]?.created_at ?? null,
    corrections,
  };
}

export async function updateTasteCorrections(
  userId: string,
  patch: TasteCorrections,
): Promise<TasteCorrections> {
  const existing = await fetchCorrections(userId);
  const merged: TasteCorrections = {
    cuisines: { ...(existing.cuisines ?? {}), ...(patch.cuisines ?? {}) },
    ingredients: { ...(existing.ingredients ?? {}), ...(patch.ingredients ?? {}) },
    methods: { ...(existing.methods ?? {}), ...(patch.methods ?? {}) },
    planets: { ...(existing.planets ?? {}), ...(patch.planets ?? {}) },
  };
  // Strip empty buckets
  for (const k of Object.keys(merged) as Array<keyof TasteCorrections>) {
    if (Object.keys(merged[k] ?? {}).length === 0) delete merged[k];
  }
  await executeQuery(
    `UPDATE user_profiles
        SET taste_corrections = $2::jsonb,
            updated_at = NOW()
      WHERE user_id = $1`,
    [userId, JSON.stringify(merged)],
  );
  return merged;
}
