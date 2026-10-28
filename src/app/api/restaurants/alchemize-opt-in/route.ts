/**
 * Restaurant Recipe Alchemization Opt-In API Route
 *
 * GET /api/restaurants/alchemize-opt-in?restaurantId=...
 *   Checks if a restaurant is opted in to recipe alchemization or has pending nominations.
 *
 * POST /api/restaurants/alchemize-opt-in
 *   Submits an owner/chef opt-in or diner nomination to have signature dishes alchemized.
 *
 * @file src/app/api/restaurants/alchemize-opt-in/route.ts
 */

import { NextResponse } from "next/server";
import { executeQuery } from "@/lib/database/connection";
import { _logger } from "@/lib/logger";
import { RestaurantAlchemizeOptInSchema } from "@/lib/validation/apiSchemas";
import type { NextRequest } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export interface RestaurantAlchemizeOptInRow {
  id: string;
  restaurant_id: string;
  restaurant_name: string;
  contact_email: string;
  role: "owner" | "chef" | "diner_nomination";
  signature_dishes_to_alchemize: string[];
  recipe_notes: string | null;
  status: "pending" | "approved" | "alchemized";
  created_at: string;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const restaurantId = searchParams.get("restaurantId")?.trim();

    if (!restaurantId) {
      return NextResponse.json(
        { success: false, error: "restaurantId query parameter is required" },
        { status: 400 },
      );
    }

    // Check if the restaurant table has alchemize_opt_in = TRUE
    const restCheck = await executeQuery<{ alchemize_opt_in: boolean | null }>(
      `SELECT alchemize_opt_in FROM restaurants WHERE id = $1 OR external_id = $1 LIMIT 1`,
      [restaurantId],
    );
    const isAlchemizedPartner = Boolean(restCheck.rows[0]?.alchemize_opt_in);

    const optInsResult = await executeQuery<RestaurantAlchemizeOptInRow>(
      `SELECT id, restaurant_id, restaurant_name, contact_email, role,
              signature_dishes_to_alchemize, recipe_notes, status, created_at
       FROM restaurant_alchemize_opt_ins
       WHERE restaurant_id = $1
       ORDER BY created_at DESC`,
      [restaurantId],
    );

    return NextResponse.json({
      success: true,
      restaurantId,
      isAlchemizedPartner,
      hasOptedIn: isAlchemizedPartner || optInsResult.rows.some((r) => r.status === "approved" || r.status === "alchemized"),
      optIns: optInsResult.rows,
    });
  } catch (err) {
    _logger.error("[alchemize-opt-in:GET] Failed to check status:", err);
    return NextResponse.json(
      { success: false, error: "Failed to retrieve alchemize opt-in status" },
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

    const parseResult = RestaurantAlchemizeOptInSchema.safeParse(raw);
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

    const result = await executeQuery<RestaurantAlchemizeOptInRow>(
      `INSERT INTO restaurant_alchemize_opt_ins (
         restaurant_id, restaurant_name, contact_email, role,
         signature_dishes_to_alchemize, recipe_notes, status
       ) VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id, restaurant_id, restaurant_name, contact_email, role,
                 signature_dishes_to_alchemize, recipe_notes, status, created_at`,
      [
        data.restaurantId,
        data.restaurantName,
        data.contactEmail,
        data.role,
        data.signatureDishesToAlchemize ?? [],
        data.recipeNotes?.trim() ?? null,
        data.role === "owner" || data.role === "chef" ? "approved" : "pending",
      ],
    );

    // If owner or chef opted in, automatically flag partner in restaurants table if present
    if (data.role === "owner" || data.role === "chef") {
      await executeQuery(
        `UPDATE restaurants SET alchemize_opt_in = TRUE WHERE id = $1 OR external_id = $1`,
        [data.restaurantId],
      );
    }

    return NextResponse.json(
      {
        success: true,
        message:
          data.role === "diner_nomination"
            ? `Thank you! Nomination for ${data.restaurantName} received.`
            : `Welcome! ${data.restaurantName} is now registered for recipe alchemization.`,
        optIn: result.rows[0],
      },
      { status: 201 },
    );
  } catch (err) {
    _logger.error("[alchemize-opt-in:POST] Failed to save opt-in:", err);
    return NextResponse.json(
      { success: false, error: "Failed to submit recipe alchemization opt-in" },
      { status: 500 },
    );
  }
}
