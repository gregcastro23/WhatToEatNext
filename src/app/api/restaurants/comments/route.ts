/**
 * Restaurant & Menu Item Comments API Route
 *
 * GET /api/restaurants/comments?restaurantId=...&menuItemId=...
 *   Fetches comments for a restaurant or a specific menu item.
 *
 * POST /api/restaurants/comments
 *   Submits a comment/tip for a restaurant or specific dish/menu item.
 *
 * @file src/app/api/restaurants/comments/route.ts
 */

import { NextResponse } from "next/server";
import { getUserIdFromRequest } from "@/lib/auth/validateRequest";
import { executeQuery } from "@/lib/database/connection";
import { _logger } from "@/lib/logger";
import { CreateRestaurantCommentSchema } from "@/lib/validation/apiSchemas";
import type { NextRequest } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export interface RestaurantCommentRow {
  id: string;
  restaurant_id: string;
  menu_item_id: string | null;
  dish_name: string | null;
  user_id: string | null;
  user_display_name: string;
  comment: string;
  helpful_count: number;
  elemental_note: string | null;
  liked_ingredients: string[];
  dish_features: string[];
  texture_notes: string[];
  elemental_resonance: string | null;
  created_at: string;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const restaurantId = searchParams.get("restaurantId")?.trim();
    const menuItemId = searchParams.get("menuItemId")?.trim() || null;
    const dishName = searchParams.get("dishName")?.trim() || null;

    if (!restaurantId) {
      return NextResponse.json(
        { success: false, error: "restaurantId query parameter is required" },
        { status: 400 },
      );
    }

    let query: string;
    let params: unknown[];

    if (menuItemId) {
      query = `
        SELECT id, restaurant_id, menu_item_id, dish_name, user_id, user_display_name,
               comment, helpful_count, elemental_note, liked_ingredients, dish_features,
               texture_notes, elemental_resonance, created_at
        FROM restaurant_comments
        WHERE restaurant_id = $1 AND menu_item_id = $2
        ORDER BY created_at DESC
        LIMIT 50`;
      params = [restaurantId, menuItemId];
    } else if (dishName) {
      query = `
        SELECT id, restaurant_id, menu_item_id, dish_name, user_id, user_display_name,
               comment, helpful_count, elemental_note, liked_ingredients, dish_features,
               texture_notes, elemental_resonance, created_at
        FROM restaurant_comments
        WHERE restaurant_id = $1 AND (dish_name ILIKE $2 OR menu_item_id ILIKE $2)
        ORDER BY created_at DESC
        LIMIT 50`;
      params = [restaurantId, `%${dishName}%`];
    } else {
      query = `
        SELECT id, restaurant_id, menu_item_id, dish_name, user_id, user_display_name,
               comment, helpful_count, elemental_note, liked_ingredients, dish_features,
               texture_notes, elemental_resonance, created_at
        FROM restaurant_comments
        WHERE restaurant_id = $1
        ORDER BY created_at DESC
        LIMIT 50`;
      params = [restaurantId];
    }

    const result = await executeQuery<RestaurantCommentRow>(query, params);

    return NextResponse.json({
      success: true,
      comments: result.rows,
      count: result.rows.length,
    });
  } catch (err) {
    _logger.error("[comments:GET] Failed to fetch comments:", err);
    return NextResponse.json(
      { success: false, error: "Failed to fetch comments" },
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

    const parseResult = CreateRestaurantCommentSchema.safeParse(raw);
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
      null;

    const displayName =
      data.userDisplayName?.trim() ||
      (userId ? `Alchemist #${userId.slice(0, 6)}` : "Guest Alchemist");

    const result = await executeQuery<RestaurantCommentRow>(
      `INSERT INTO restaurant_comments (
         restaurant_id, menu_item_id, dish_name, user_id, user_display_name,
         comment, elemental_note, liked_ingredients, dish_features, texture_notes,
         elemental_resonance
       ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
       RETURNING id, restaurant_id, menu_item_id, dish_name, user_id, user_display_name,
                 comment, helpful_count, elemental_note, liked_ingredients, dish_features,
                 texture_notes, elemental_resonance, created_at`,
      [
        data.restaurantId,
        data.menuItemId ?? null,
        data.dishName ?? null,
        userId,
        displayName,
        data.comment.trim(),
        data.elementalNote?.trim() ?? null,
        data.likedIngredients ?? [],
        data.dishFeatures ?? [],
        data.textureNotes ?? [],
        data.elementalResonance?.trim() ?? null,
      ],
    );

    return NextResponse.json(
      {
        success: true,
        comment: result.rows[0],
      },
      { status: 201 },
    );
  } catch (err) {
    _logger.error("[comments:POST] Failed to post comment:", err);
    return NextResponse.json(
      { success: false, error: "Failed to create comment" },
      { status: 500 },
    );
  }
}
