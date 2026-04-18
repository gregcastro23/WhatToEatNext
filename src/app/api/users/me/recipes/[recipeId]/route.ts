/**
 * User Recipe Interaction API
 * GET    /api/users/me/recipes/[recipeId] → current user's interaction + aggregate madeCount
 * POST   /api/users/me/recipes/[recipeId] → upsert madeIt / rating / review
 * DELETE /api/users/me/recipes/[recipeId] → clear the user's entry
 */

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import { executeQuery } from "@/lib/database/connection";
import type { NextRequest } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

interface InteractionRow {
  made_it: boolean;
  rating: number | null;
  review: string | null;
}

interface CountRow {
  count: number;
}

async function getAggregateMadeCount(recipeId: string): Promise<number> {
  const result = await executeQuery<CountRow>(
    `SELECT COUNT(*)::int AS count FROM user_recipe_interactions
     WHERE recipe_id = $1 AND made_it = true`,
    [recipeId],
  );
  return result.rows[0]?.count ?? 0;
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ recipeId: string }> },
) {
  const { recipeId } = await params;
  const session = await auth();
  const userId = session?.user?.id;

  try {
    const madeCount = await getAggregateMadeCount(recipeId);

    if (!userId) {
      return NextResponse.json({
        authenticated: false,
        madeIt: false,
        rating: 0,
        review: "",
        madeCount,
      });
    }

    const result = await executeQuery<InteractionRow>(
      `SELECT made_it, rating, review
       FROM user_recipe_interactions
       WHERE user_id = $1 AND recipe_id = $2`,
      [userId, recipeId],
    );
    const row = result.rows[0];

    return NextResponse.json({
      authenticated: true,
      madeIt: row?.made_it ?? false,
      rating: row?.rating ?? 0,
      review: row?.review ?? "",
      madeCount,
    });
  } catch (error) {
    console.error("[GET /api/users/me/recipes/:id]", error);
    return NextResponse.json(
      { error: "Failed to load interaction" },
      { status: 500 },
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ recipeId: string }> },
) {
  const { recipeId } = await params;
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { madeIt?: boolean; rating?: number; review?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const madeIt = typeof body.madeIt === "boolean" ? body.madeIt : false;
  const ratingRaw = typeof body.rating === "number" ? Math.round(body.rating) : 0;
  const rating = Math.max(0, Math.min(5, ratingRaw));
  const review =
    typeof body.review === "string" ? body.review.slice(0, 500) : "";

  try {
    await executeQuery(
      `INSERT INTO user_recipe_interactions (user_id, recipe_id, made_it, rating, review)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (user_id, recipe_id) DO UPDATE SET
         made_it = EXCLUDED.made_it,
         rating = EXCLUDED.rating,
         review = EXCLUDED.review,
         updated_at = CURRENT_TIMESTAMP`,
      [userId, recipeId, madeIt, rating || null, review || null],
    );

    const madeCount = await getAggregateMadeCount(recipeId);
    return NextResponse.json({
      authenticated: true,
      madeIt,
      rating,
      review,
      madeCount,
    });
  } catch (error) {
    console.error("[POST /api/users/me/recipes/:id]", error);
    return NextResponse.json(
      { error: "Failed to save interaction" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ recipeId: string }> },
) {
  const { recipeId } = await params;
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await executeQuery(
      `DELETE FROM user_recipe_interactions
       WHERE user_id = $1 AND recipe_id = $2`,
      [userId, recipeId],
    );
    const madeCount = await getAggregateMadeCount(recipeId);
    return NextResponse.json({ authenticated: true, madeCount });
  } catch (error) {
    console.error("[DELETE /api/users/me/recipes/:id]", error);
    return NextResponse.json(
      { error: "Failed to delete interaction" },
      { status: 500 },
    );
  }
}
