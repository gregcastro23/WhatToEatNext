/**
 * Restaurant Favorites API Route
 *
 * GET /api/restaurants/favorites
 *   Fetches favorited restaurants and IDs for the current user/guest.
 *
 * POST /api/restaurants/favorites
 *   Toggles or saves a restaurant as a user favorite sanctuary with notes/dishes.
 *
 * DELETE /api/restaurants/favorites
 *   Removes a restaurant from favorites.
 *
 * @file src/app/api/restaurants/favorites/route.ts
 */

import { NextResponse } from "next/server";
import { getUserIdFromRequest } from "@/lib/auth/validateRequest";
import { executeQuery } from "@/lib/database/connection";
import { _logger } from "@/lib/logger";
import {
  ToggleFavoriteRestaurantSchema,
  DeleteFavoriteRestaurantSchema,
} from "@/lib/validation/apiSchemas";
import type { NextRequest } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export interface UserFavoriteRestaurantRow {
  id: string;
  user_id: string;
  restaurant_id: string;
  restaurant_name: string;
  cuisine: string | null;
  source: string | null;
  notes: string | null;
  favorite_dishes: string[];
  created_at: string;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userIdFromAuth = await getUserIdFromRequest(request);
    const userId =
      userIdFromAuth ||
      searchParams.get("userId")?.trim() ||
      searchParams.get("guestId")?.trim() ||
      request.headers.get("x-user-id")?.trim() ||
      request.headers.get("x-guest-user-id")?.trim() ||
      "guest_default";

    const result = await executeQuery<UserFavoriteRestaurantRow>(
      `SELECT id, user_id, restaurant_id, restaurant_name, cuisine, source, notes, favorite_dishes, created_at
       FROM user_favorite_restaurants
       WHERE user_id = $1
       ORDER BY created_at DESC`,
      [userId],
    );

    return NextResponse.json({
      success: true,
      favorites: result.rows,
      favoriteIds: result.rows.map((r) => r.restaurant_id),
    });
  } catch (err) {
    _logger.error("[favorites:GET] Failed to fetch favorites:", err);
    return NextResponse.json(
      { success: false, error: "Failed to fetch favorite restaurants" },
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

    const parseResult = ToggleFavoriteRestaurantSchema.safeParse(raw);
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
    const userId =
      userIdFromAuth ||
      request.headers.get("x-user-id")?.trim() ||
      request.headers.get("x-guest-user-id")?.trim() ||
      "guest_default";

    // 1. If explicit isFavorite === false, delete
    if (data.isFavorite === false) {
      await executeQuery(
        `DELETE FROM user_favorite_restaurants
         WHERE user_id = $1 AND restaurant_id = $2`,
        [userId, data.restaurantId],
      );
      return NextResponse.json({
        success: true,
        isFavorite: false,
        restaurantId: data.restaurantId,
      });
    }

    // 2. If explicit isFavorite === true, upsert
    if (data.isFavorite === true) {
      const result = await executeQuery<UserFavoriteRestaurantRow>(
        `INSERT INTO user_favorite_restaurants (
           user_id, restaurant_id, restaurant_name, cuisine, source, notes, favorite_dishes
         ) VALUES ($1, $2, $3, $4, $5, $6, $7)
         ON CONFLICT (user_id, restaurant_id) DO UPDATE SET
           restaurant_name = EXCLUDED.restaurant_name,
           cuisine = COALESCE(EXCLUDED.cuisine, user_favorite_restaurants.cuisine),
           source = COALESCE(EXCLUDED.source, user_favorite_restaurants.source),
           notes = COALESCE(EXCLUDED.notes, user_favorite_restaurants.notes),
           favorite_dishes = COALESCE(EXCLUDED.favorite_dishes, user_favorite_restaurants.favorite_dishes)
         RETURNING id, user_id, restaurant_id, restaurant_name, cuisine, source, notes, favorite_dishes, created_at`,
        [
          userId,
          data.restaurantId,
          data.restaurantName,
          data.cuisine ?? null,
          data.source ?? null,
          data.notes ?? null,
          data.favoriteDishes ?? [],
        ],
      );
      return NextResponse.json({
        success: true,
        isFavorite: true,
        favorite: result.rows[0],
      });
    }

    // 3. Otherwise, toggle: check if exists
    const existing = await executeQuery<{ id: string }>(
      `SELECT id FROM user_favorite_restaurants WHERE user_id = $1 AND restaurant_id = $2`,
      [userId, data.restaurantId],
    );

    if (existing.rows.length > 0) {
      await executeQuery(
        `DELETE FROM user_favorite_restaurants WHERE user_id = $1 AND restaurant_id = $2`,
        [userId, data.restaurantId],
      );
      return NextResponse.json({
        success: true,
        isFavorite: false,
        restaurantId: data.restaurantId,
      });
    }

    const inserted = await executeQuery<UserFavoriteRestaurantRow>(
      `INSERT INTO user_favorite_restaurants (
         user_id, restaurant_id, restaurant_name, cuisine, source, notes, favorite_dishes
       ) VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id, user_id, restaurant_id, restaurant_name, cuisine, source, notes, favorite_dishes, created_at`,
      [
        userId,
        data.restaurantId,
        data.restaurantName,
        data.cuisine ?? null,
        data.source ?? null,
        data.notes ?? null,
        data.favoriteDishes ?? [],
      ],
    );

    return NextResponse.json({
      success: true,
      isFavorite: true,
      favorite: inserted.rows[0],
    });
  } catch (err) {
    _logger.error("[favorites:POST] Failed to toggle favorite:", err);
    return NextResponse.json(
      { success: false, error: "Failed to toggle favorite restaurant" },
      { status: 500 },
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    let restaurantId: string | null = null;
    const { searchParams } = new URL(request.url);
    const queryRestId = searchParams.get("restaurantId")?.trim();

    if (queryRestId) {
      restaurantId = queryRestId;
    } else {
      const raw = await request.json().catch(() => null);
      if (raw) {
        const parseResult = DeleteFavoriteRestaurantSchema.safeParse(raw);
        if (parseResult.success) {
          ({ restaurantId } = parseResult.data);
        }
      }
    }

    if (!restaurantId) {
      return NextResponse.json(
        { success: false, error: "restaurantId is required" },
        { status: 400 },
      );
    }

    const userIdFromAuth = await getUserIdFromRequest(request);
    const userId =
      userIdFromAuth ||
      request.headers.get("x-user-id")?.trim() ||
      request.headers.get("x-guest-user-id")?.trim() ||
      "guest_default";

    await executeQuery(
      `DELETE FROM user_favorite_restaurants WHERE user_id = $1 AND restaurant_id = $2`,
      [userId, restaurantId],
    );

    return NextResponse.json({
      success: true,
      isFavorite: false,
      restaurantId,
    });
  } catch (err) {
    _logger.error("[favorites:DELETE] Failed to delete favorite:", err);
    return NextResponse.json(
      { success: false, error: "Failed to remove favorite restaurant" },
      { status: 500 },
    );
  }
}
