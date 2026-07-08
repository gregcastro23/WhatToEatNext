/**
 * User Recipe Interaction API
 * GET    /api/users/me/recipes/[recipeId] → current user's interaction + aggregate madeCount
 * POST   /api/users/me/recipes/[recipeId] → upsert madeIt / rating / review
 * DELETE /api/users/me/recipes/[recipeId] → clear the user's entry
 */

import { NextResponse } from "next/server";
import { getUserIdFromRequest } from "@/lib/auth/validateRequest";
import { executeQuery } from "@/lib/database/connection";
import { practiceRewardService } from "@/services/practiceRewardService";
import { reportQuestEventBestEffort } from "@/services/questEventReporter";
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
  request: NextRequest,
  { params }: { params: Promise<{ recipeId: string }> },
) {
  const { recipeId } = await params;
  const userId = await getUserIdFromRequest(request);

  try {
    let resolvedId = recipeId;
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(recipeId);
    if (!isUuid) {
      // Import dynamically to avoid circular dependencies if any
      const { LocalRecipeService } = await import("@/services/LocalRecipeService");
      const recipe = await LocalRecipeService.getRecipeById(recipeId);
      if (!recipe?.id) {
        return NextResponse.json({
          authenticated: !!userId,
          madeIt: false,
          rating: 0,
          review: "",
          madeCount: 0,
        });
      }
      resolvedId = String(recipe.id);
    }

    const madeCount = await getAggregateMadeCount(resolvedId);

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
      [userId, resolvedId],
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
  const userId = await getUserIdFromRequest(request);
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
    // Mirror GET's slug→UUID resolution so the same recipe can't produce two
    // interaction rows (and two cook rewards) under its slug and its id.
    let resolvedId = recipeId;
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(recipeId);
    if (!isUuid) {
      const { LocalRecipeService } = await import("@/services/LocalRecipeService");
      const recipe = await LocalRecipeService.getRecipeById(recipeId);
      if (recipe?.id) resolvedId = String(recipe.id);
    }
    // Capture the PRIOR made_it in the same statement: the false→true
    // transition is what counts as "cooked it" for the invisible reward
    // (toggling off and back on can't re-pay — the practice ledger dedupes
    // per day on top of this).
    const upsert = await executeQuery<{ prior_made_it: boolean | null }>(
      `WITH prior AS (
         SELECT made_it FROM user_recipe_interactions
         WHERE user_id = $1 AND recipe_id = $2
       )
       INSERT INTO user_recipe_interactions (user_id, recipe_id, made_it, rating, review)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (user_id, recipe_id) DO UPDATE SET
         made_it = EXCLUDED.made_it,
         rating = EXCLUDED.rating,
         review = EXCLUDED.review,
         updated_at = CURRENT_TIMESTAMP
       RETURNING (SELECT made_it FROM prior) AS prior_made_it`,
      [userId, resolvedId, madeIt, rating || null, review || null],
    );

    // Invisible practice: a genuine new "I made this" quietly earns Matter.
    // Best-effort — the interaction save never fails because of the reward.
    let reward: { tokenType: string; amount: number; hint: string } | null = null;
    const priorMadeIt = upsert.rows[0]?.prior_made_it === true;
    if (madeIt && !priorMadeIt) {
      void reportQuestEventBestEffort(userId, "cook_recipe");
      const result = await practiceRewardService.recognize(userId, "cooked_recipe", resolvedId);
      if (result.rewarded && result.tokenType && result.amount && result.hint) {
        reward = { tokenType: result.tokenType, amount: result.amount, hint: result.hint };
      }
    }

    const madeCount = await getAggregateMadeCount(resolvedId);
    return NextResponse.json({
      authenticated: true,
      madeIt,
      rating,
      review,
      madeCount,
      reward,
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
  request: NextRequest,
  { params }: { params: Promise<{ recipeId: string }> },
) {
  const { recipeId } = await params;
  const userId = await getUserIdFromRequest(request);
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
