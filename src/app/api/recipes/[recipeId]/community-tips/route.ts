/**
 * Community Tips API
 * GET /api/recipes/[recipeId]/community-tips
 *
 * Returns top user-submitted reviews (rating ≥ 4, non-empty review),
 * joined with user display data, ordered by rating DESC, limited to 10.
 */

import { NextResponse } from "next/server";
import { executeQuery } from "@/lib/database/connection";
import type { NextRequest } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

interface TipRow {
  author_name: string | null;
  author_email: string | null;
  rating: number;
  review: string;
  updated_at: string;
}

export interface CommunityTip {
  author: string;
  rating: number;
  tip: string;
  postedAt: string;
}

function displayName(row: TipRow): string {
  if (row.author_name && row.author_name.trim()) return row.author_name.trim();
  if (row.author_email) {
    const local = row.author_email.split("@")[0];
    return local.charAt(0).toUpperCase() + local.slice(1);
  }
  return "Anonymous cook";
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ recipeId: string }> },
) {
  const { recipeId } = await params;

  try {
    const result = await executeQuery<TipRow>(
      `SELECT u.name AS author_name, u.email AS author_email,
              uri.rating, uri.review, uri.updated_at
       FROM user_recipe_interactions uri
       JOIN users u ON u.id = uri.user_id
       WHERE uri.recipe_id = $1
         AND uri.rating >= 4
         AND uri.review IS NOT NULL
         AND length(uri.review) > 0
       ORDER BY uri.rating DESC, uri.updated_at DESC
       LIMIT 10`,
      [recipeId],
    );

    const tips: CommunityTip[] = result.rows.map((row) => ({
      author: displayName(row),
      rating: row.rating,
      tip: row.review,
      postedAt: row.updated_at,
    }));

    return NextResponse.json({ tips });
  } catch (error) {
    console.error("[GET /api/recipes/:id/community-tips]", error);
    return NextResponse.json({ tips: [] as CommunityTip[] });
  }
}
