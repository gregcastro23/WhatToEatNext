/**
 * Meal Plan API
 * GET    /api/users/me/meal-plan         → list of current user's scheduled meals
 * POST   /api/users/me/meal-plan         → add entry
 * DELETE /api/users/me/meal-plan?id=xxx  → remove entry
 *
 * Also accepts POST with `{ bulkImport: MealPlanEntry[] }` to merge localStorage
 * entries into the DB on first login (dedupes on recipe+date+mealType).
 */

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import { executeQuery } from "@/lib/database/connection";
import { _logger } from "@/lib/logger";
import { UserMealPlanPostSchema } from "@/lib/validation/apiSchemas";
import type { NextRequest } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

interface MealPlanRow {
  id: string;
  recipe_id: string;
  recipe_name: string | null;
  date: string;
  meal_type: string | null;
  servings: number;
  added_at: string;
}

export interface MealPlanEntryDTO {
  id: string;
  recipeId: string;
  recipeName?: string | undefined;
  date: string;
  mealType?: string | undefined;
  servings?: number | undefined;
  addedAt: number;
}


function rowToDTO(row: MealPlanRow): MealPlanEntryDTO {
  const dateStr =
    typeof row.date === "string"
      ? row.date
      : new Date(row.date).toISOString().slice(0, 10);
  return {
    id: row.id,
    recipeId: row.recipe_id,
    recipeName: row.recipe_name ?? undefined,
    date: dateStr,
    mealType: row.meal_type ?? undefined,
    servings: row.servings,
    addedAt: new Date(row.added_at).getTime(),
  };
}

export async function GET() {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) {
    return NextResponse.json({ authenticated: false, entries: [] });
  }

  try {
    const result = await executeQuery<MealPlanRow>(
      `SELECT id, recipe_id, recipe_name, date::text AS date, meal_type, servings, added_at
       FROM user_meal_plans
       WHERE user_id = $1
       ORDER BY date ASC, added_at ASC`,
      [userId],
    );
    return NextResponse.json({
      authenticated: true,
      entries: result.rows.map(rowToDTO),
    });
  } catch (error) {
    _logger.error("[GET /api/users/me/meal-plan]", error);
    return NextResponse.json(
      { error: "Failed to load meal plan" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let rawBody: unknown;
  try {
    rawBody = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = UserMealPlanPostSchema.safeParse(rawBody);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid request payload", details: parsed.error.flatten().fieldErrors },
      { status: 400 },
    );
  }

  const body = parsed.data;

  // Bulk import path — merges localStorage entries with dedupe.
  if (Array.isArray(body.bulkImport)) {
    try {
      const imported: MealPlanEntryDTO[] = [];
      for (const e of body.bulkImport) {
        if (!e?.recipeId || !e?.date) continue;
        const insert = await executeQuery<MealPlanRow>(
          `INSERT INTO user_meal_plans (user_id, recipe_id, recipe_name, date, meal_type, servings)
           SELECT $1, $2, $3, $4::date, $5, $6
           WHERE NOT EXISTS (
             SELECT 1 FROM user_meal_plans
             WHERE user_id = $1 AND recipe_id = $2 AND date = $4::date
               AND COALESCE(meal_type, '') = COALESCE($5, '')
           )
           RETURNING id, recipe_id, recipe_name, date::text AS date, meal_type, servings, added_at`,
          [
            userId,
            e.recipeId,
            e.recipeName ?? null,
            e.date,
            e.mealType ?? null,
            Math.max(1, Math.min(99, e.servings ?? 1)),
          ],
        );
        if (insert.rows[0]) imported.push(rowToDTO(insert.rows[0]));
      }
      return NextResponse.json({ authenticated: true, imported });
    } catch (error) {
      _logger.error("[POST bulk /api/users/me/meal-plan]", error);
      return NextResponse.json(
        { error: "Bulk import failed" },
        { status: 500 },
      );
    }
  }

  // Single-entry add
  const { recipeId, recipeName, date, mealType, servings } = body;
  if (!recipeId || !date) {
    return NextResponse.json(
      { error: "recipeId and date are required" },
      { status: 400 },
    );
  }
  const cleanServings = Math.max(1, Math.min(99, Number(servings) || 1));

  try {
    const result = await executeQuery<MealPlanRow>(
      `INSERT INTO user_meal_plans (user_id, recipe_id, recipe_name, date, meal_type, servings)
       VALUES ($1, $2, $3, $4::date, $5, $6)
       RETURNING id, recipe_id, recipe_name, date::text AS date, meal_type, servings, added_at`,
      [
        userId,
        recipeId,
        recipeName ?? null,
        date,
        mealType ?? null,
        cleanServings,
      ],
    );
    const [insertedRow] = result.rows;
    if (!insertedRow) {
      return NextResponse.json(
        { authenticated: true, error: "meal plan entry was not persisted" },
        { status: 500 },
      );
    }
    return NextResponse.json({
      authenticated: true,
      entry: rowToDTO(insertedRow),
    });
  } catch (error) {
    _logger.error("[POST /api/users/me/meal-plan]", error);
    return NextResponse.json(
      { error: "Failed to add meal" },
      { status: 500 },
    );
  }
}

export async function DELETE(request: NextRequest) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "id query param required" }, { status: 400 });
  }
  try {
    await executeQuery(
      `DELETE FROM user_meal_plans WHERE id = $1 AND user_id = $2`,
      [id, userId],
    );
    return NextResponse.json({ authenticated: true, removed: id });
  } catch (error) {
    _logger.error("[DELETE /api/users/me/meal-plan]", error);
    return NextResponse.json(
      { error: "Failed to delete meal" },
      { status: 500 },
    );
  }
}
