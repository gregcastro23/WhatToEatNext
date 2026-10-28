/**
 * Restaurant Menu Alchemy API Route
 *
 * GET /api/restaurants/alchemize-menu?restaurantId=...
 *   Retrieves the alchemized menu, elemental breakdown, and ingredient taxonomy
 *   for a restaurant from database cache or falls back to on-demand alchemy.
 *
 * POST /api/restaurants/alchemize-menu
 *   Reads an online menu from a restaurant website URL or plain text,
 *   extracts dishes, deconstructs ingredients, and computes elemental signatures.
 *
 * @file src/app/api/restaurants/alchemize-menu/route.ts
 */

import { NextResponse } from "next/server";
import { _logger } from "@/lib/logger";
import { AlchemizeRestaurantMenuSchema } from "@/lib/validation/apiSchemas";
import { getOrAlchemizeRestaurantMenu } from "@/services/restaurantMenuAlchemyService";
import type { NextRequest } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const restaurantId = searchParams.get("restaurantId")?.trim();
    const url = searchParams.get("url")?.trim() || undefined;

    if (!restaurantId) {
      return NextResponse.json(
        { success: false, error: "restaurantId query parameter is required" },
        { status: 400 },
      );
    }

    const menu = await getOrAlchemizeRestaurantMenu({
      restaurantId,
      url,
      forceRefresh: searchParams.get("refresh") === "true",
    });

    return NextResponse.json({
      success: true,
      menu,
    });
  } catch (err) {
    _logger.error("[api/restaurants/alchemize-menu] GET failed:", err);
    return NextResponse.json(
      { success: false, error: "Failed to retrieve alchemized menu" },
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

    const parseResult = AlchemizeRestaurantMenuSchema.safeParse(raw);
    if (!parseResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Validation error",
          details: parseResult.error.flatten().fieldErrors,
        },
        { status: 400 },
      );
    }

    const { restaurantId, restaurantName, url, menuText, refresh } = parseResult.data;

    const menu = await getOrAlchemizeRestaurantMenu({
      restaurantId,
      restaurantName,
      url,
      menuText,
      forceRefresh: refresh === true,
    });

    return NextResponse.json(
      {
        success: true,
        menu,
      },
      { status: 200 },
    );
  } catch (err) {
    _logger.error("[api/restaurants/alchemize-menu] POST failed:", err);
    return NextResponse.json(
      { success: false, error: "Failed to alchemize restaurant menu" },
      { status: 500 },
    );
  }
}
