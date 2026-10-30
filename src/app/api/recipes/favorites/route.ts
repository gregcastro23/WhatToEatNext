/**
 * Favorite Recipes & Tracked Ingredients API Route
 *
 * GET /api/recipes/favorites
 *   Returns favorited recipes for the user and aggregated top tracked ingredients.
 *
 * POST /api/recipes/favorites
 *   Toggles or saves a favorite recipe along with ingredients and liked ingredient highlights.
 *
 * DELETE /api/recipes/favorites
 *   Removes a recipe from favorites and updates tracked ingredient frequencies.
 *
 * @file src/app/api/recipes/favorites/route.ts
 */

import { NextResponse } from "next/server";
import { getUserIdFromRequest } from "@/lib/auth/validateRequest";
import { executeQuery } from "@/lib/database/connection";
import { _logger } from "@/lib/logger";
import {
  ToggleFavoriteRecipeSchema,
  DeleteFavoriteRecipeSchema,
} from "@/lib/validation/apiSchemas";
import type { NextRequest } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export interface UserFavoriteRecipeRow {
  id: string;
  user_id: string;
  recipe_id: string;
  recipe_name: string;
  cuisine: string | null;
  ingredients: string[];
  liked_ingredients: string[];
  elemental_profile: Record<string, number> | null;
  notes: string | null;
  created_at: string;
}

export interface TrackedIngredientFreq {
  name: string;
  count: number;
}

function resolveUserId(request: NextRequest, authUserId: string | null): string {
  const { searchParams } = new URL(request.url);
  return (
    authUserId ||
    searchParams.get("userId")?.trim() ||
    searchParams.get("guestId")?.trim() ||
    request.headers.get("x-user-id")?.trim() ||
    request.headers.get("x-guest-user-id")?.trim() ||
    "guest_default"
  );
}

async function getAggregatedIngredients(userId: string): Promise<{
  topTrackedIngredients: TrackedIngredientFreq[];
  topLikedIngredients: TrackedIngredientFreq[];
}> {
  try {
    const trackedRes = await executeQuery<{ name: string; count: string | number }>(
      `SELECT unnest(ingredients) AS name, COUNT(*)::int AS count
       FROM user_favorite_recipes
       WHERE user_id = $1
       GROUP BY name
       ORDER BY count DESC, name ASC
       LIMIT 40`,
      [userId],
    );

    const likedRes = await executeQuery<{ name: string; count: string | number }>(
      `SELECT unnest(liked_ingredients) AS name, COUNT(*)::int AS count
       FROM user_favorite_recipes
       WHERE user_id = $1
       GROUP BY name
       ORDER BY count DESC, name ASC
       LIMIT 30`,
      [userId],
    );

    return {
      topTrackedIngredients: (trackedRes.rows || []).map((r) => ({
        name: r.name,
        count: Number(r.count),
      })),
      topLikedIngredients: (likedRes.rows || []).map((r) => ({
        name: r.name,
        count: Number(r.count),
      })),
    };
  } catch (err) {
    _logger.warn("[recipes:favorites] Failed to aggregate ingredients:", err);
    return { topTrackedIngredients: [], topLikedIngredients: [] };
  }
}

export async function GET(request: NextRequest) {
  try {
    const userIdFromAuth = await getUserIdFromRequest(request);
    const userId = resolveUserId(request, userIdFromAuth);

    const result = await executeQuery<UserFavoriteRecipeRow>(
      `SELECT id, user_id, recipe_id, recipe_name, cuisine, ingredients, liked_ingredients, elemental_profile, notes, created_at
       FROM user_favorite_recipes
       WHERE user_id = $1
       ORDER BY created_at DESC`,
      [userId],
    );

    const { topTrackedIngredients, topLikedIngredients } = await getAggregatedIngredients(userId);

    return NextResponse.json({
      success: true,
      favorites: result.rows || [],
      favoriteIds: (result.rows || []).map((r) => r.recipe_id),
      topTrackedIngredients,
      topLikedIngredients,
    });
  } catch (err) {
    _logger.error("[recipes:favorites:GET] Failed to fetch favorites:", err);
    return NextResponse.json(
      { success: false, error: "Failed to fetch favorite recipes" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const raw = await request.json().catch(() => null);
    if (!raw) {
      return NextResponse.json(
        { success: false, error: "Invalid JSON body" },
        { status: 400 },
      );
    }

    const parseResult = ToggleFavoriteRecipeSchema.safeParse(raw);
    if (!parseResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Validation failed",
          details: parseResult.error.flatten(),
        },
        { status: 400 },
      );
    }

    const {data} = parseResult;
    const userIdFromAuth = await getUserIdFromRequest(request);
    const userId = resolveUserId(request, userIdFromAuth);

    // 1. If explicit isFavorite === false, delete
    if (data.isFavorite === false) {
      await executeQuery(
        `DELETE FROM user_favorite_recipes
         WHERE user_id = $1 AND recipe_id = $2`,
        [userId, data.recipeId],
      );
      const { topTrackedIngredients, topLikedIngredients } = await getAggregatedIngredients(userId);
      return NextResponse.json({
        success: true,
        isFavorite: false,
        recipeId: data.recipeId,
        topTrackedIngredients,
        topLikedIngredients,
      });
    }

    // 2. If explicit isFavorite === true, upsert
    if (data.isFavorite === true) {
      const result = await executeQuery<UserFavoriteRecipeRow>(
        `INSERT INTO user_favorite_recipes (
           user_id, recipe_id, recipe_name, cuisine, ingredients, liked_ingredients, elemental_profile, notes
         ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         ON CONFLICT (user_id, recipe_id) DO UPDATE SET
           recipe_name = EXCLUDED.recipe_name,
           cuisine = COALESCE(EXCLUDED.cuisine, user_favorite_recipes.cuisine),
           ingredients = CASE WHEN cardinality(EXCLUDED.ingredients) > 0 THEN EXCLUDED.ingredients ELSE user_favorite_recipes.ingredients END,
           liked_ingredients = COALESCE(EXCLUDED.liked_ingredients, user_favorite_recipes.liked_ingredients),
           elemental_profile = COALESCE(EXCLUDED.elemental_profile, user_favorite_recipes.elemental_profile),
           notes = COALESCE(EXCLUDED.notes, user_favorite_recipes.notes)
         RETURNING id, user_id, recipe_id, recipe_name, cuisine, ingredients, liked_ingredients, elemental_profile, notes, created_at`,
        [
          userId,
          data.recipeId,
          data.recipeName,
          data.cuisine ?? null,
          data.ingredients ?? [],
          data.likedIngredients ?? [],
          data.elementalProfile ? JSON.stringify(data.elementalProfile) : null,
          data.notes ?? null,
        ],
      );

      const { topTrackedIngredients, topLikedIngredients } = await getAggregatedIngredients(userId);
      return NextResponse.json({
        success: true,
        isFavorite: true,
        favorite: result.rows?.[0] || null,
        topTrackedIngredients,
        topLikedIngredients,
      });
    }

    // 3. Otherwise, toggle: check if exists
    const existing = await executeQuery<{ id: string }>(
      `SELECT id FROM user_favorite_recipes WHERE user_id = $1 AND recipe_id = $2`,
      [userId, data.recipeId],
    );

    if (existing.rows && existing.rows.length > 0) {
      await executeQuery(
        `DELETE FROM user_favorite_recipes WHERE user_id = $1 AND recipe_id = $2`,
        [userId, data.recipeId],
      );
      const { topTrackedIngredients, topLikedIngredients } = await getAggregatedIngredients(userId);
      return NextResponse.json({
        success: true,
        isFavorite: false,
        recipeId: data.recipeId,
        topTrackedIngredients,
        topLikedIngredients,
      });
    }

    const inserted = await executeQuery<UserFavoriteRecipeRow>(
      `INSERT INTO user_favorite_recipes (
         user_id, recipe_id, recipe_name, cuisine, ingredients, liked_ingredients, elemental_profile, notes
       ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING id, user_id, recipe_id, recipe_name, cuisine, ingredients, liked_ingredients, elemental_profile, notes, created_at`,
      [
        userId,
        data.recipeId,
        data.recipeName,
        data.cuisine ?? null,
        data.ingredients ?? [],
        data.likedIngredients ?? [],
        data.elementalProfile ? JSON.stringify(data.elementalProfile) : null,
        data.notes ?? null,
      ],
    );

    const { topTrackedIngredients, topLikedIngredients } = await getAggregatedIngredients(userId);
    return NextResponse.json({
      success: true,
      isFavorite: true,
      favorite: inserted.rows?.[0] || null,
      topTrackedIngredients,
      topLikedIngredients,
    });
  } catch (err) {
    _logger.error("[recipes:favorites:POST] Failed to toggle favorite:", err);
    return NextResponse.json(
      { success: false, error: "Failed to toggle favorite recipe" },
      { status: 500 },
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    let recipeId: string | null = null;
    const { searchParams } = new URL(request.url);
    const queryId = searchParams.get("recipeId")?.trim();

    if (queryId) {
      recipeId = queryId;
    } else {
      const raw = await request.json().catch(() => null);
      if (raw) {
        const parsed = DeleteFavoriteRecipeSchema.safeParse(raw);
        if (parsed.success) {
          ({ recipeId } = parsed.data);
        }
      }
    }

    if (!recipeId) {
      return NextResponse.json(
        { success: false, error: "recipeId is required" },
        { status: 400 },
      );
    }

    const userIdFromAuth = await getUserIdFromRequest(request);
    const userId = resolveUserId(request, userIdFromAuth);

    await executeQuery(
      `DELETE FROM user_favorite_recipes
       WHERE user_id = $1 AND recipe_id = $2`,
      [userId, recipeId],
    );

    const { topTrackedIngredients, topLikedIngredients } = await getAggregatedIngredients(userId);

    return NextResponse.json({
      success: true,
      isFavorite: false,
      recipeId,
      topTrackedIngredients,
      topLikedIngredients,
    });
  } catch (err) {
    _logger.error("[recipes:favorites:DELETE] Failed to delete favorite:", err);
    return NextResponse.json(
      { success: false, error: "Failed to delete favorite recipe" },
      { status: 500 },
    );
  }
}
