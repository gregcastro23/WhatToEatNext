/**
 * Restaurant menu proxy.
 *
 * Resolves a local restaurant to its Olo restaurant id, fetches the current
 * menu through the Olo adapter, and returns a frontend-friendly menu shape.
 *
 * @file src/app/api/restaurants/[restaurantId]/menu/route.ts
 */

import { NextResponse } from "next/server";
import { executeQuery } from "@/lib/database/connection";
import { oloService } from "@/services/oloService";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

interface RestaurantMenuParams {
  params: Promise<{ restaurantId: string }>;
}

interface RestaurantMenuRow {
  id: string;
  name: string;
  olo_restaurant_id: string | null;
  menu_sync_enabled: boolean;
}

async function getRestaurant(
  restaurantId: string,
): Promise<RestaurantMenuRow | null> {
  const result = await executeQuery<RestaurantMenuRow>(
    `SELECT id, name, olo_restaurant_id, menu_sync_enabled
     FROM restaurants
     WHERE id = $1 OR olo_restaurant_id = $1
     LIMIT 1`,
    [restaurantId],
  );

  return result.rows[0] ?? null;
}

export async function GET(
  _request: Request,
  { params }: RestaurantMenuParams,
) {
  try {
    const { restaurantId } = await params;
    const restaurant = await getRestaurant(restaurantId);

    if (!restaurant) {
      return NextResponse.json(
        { success: false, error: "Restaurant not found" },
        { status: 404 },
      );
    }

    if (!restaurant.olo_restaurant_id) {
      return NextResponse.json(
        {
          success: false,
          error: "Restaurant is not linked to Olo",
          restaurant: {
            id: restaurant.id,
            name: restaurant.name,
          },
        },
        { status: 409 },
      );
    }

    if (!oloService.isConfigured()) {
      return NextResponse.json(
        {
          success: false,
          error: "Olo integration is not configured",
          restaurant: {
            id: restaurant.id,
            name: restaurant.name,
            oloRestaurantId: restaurant.olo_restaurant_id,
          },
        },
        { status: 501 },
      );
    }

    const menu = await oloService.getMenu(restaurant.olo_restaurant_id);
    if (!menu) {
      return NextResponse.json(
        { success: false, error: "Unable to fetch Olo menu" },
        { status: 502 },
      );
    }

    await executeQuery(
      `UPDATE restaurants
       SET last_menu_sync = NOW(),
           menu_sync_enabled = true,
           updated_at = NOW()
       WHERE id = $1`,
      [restaurant.id],
    ).catch((error) => {
      console.warn(
        "[api/restaurants/menu] Failed to record menu sync:",
        error instanceof Error ? error.message : error,
      );
    });

    return NextResponse.json({
      success: true,
      restaurant: {
        id: restaurant.id,
        name: restaurant.name,
        oloRestaurantId: restaurant.olo_restaurant_id,
      },
      menu,
    });
  } catch (err) {
    console.error("[api/restaurants/menu] Failed to load menu:", err);
    return NextResponse.json(
      { success: false, error: "Unable to load menu right now" },
      { status: 500 },
    );
  }
}
