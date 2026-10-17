/**
 * Recipe Commentary and Reflection History API
 * GET /api/recipes/[recipeId]/history
 *
 * Provides append-only, keyset-paginated recipe commentary history.
 * Supports authorType filtering ('agent', 'human', 'all'), source filtering,
 * and two-way block filtering before limits.
 *
 * Keeps agent proposal reflections separate from human cooking interactions.
 * Distinguishes healthy empty results from service outages.
 *
 * @file src/app/api/recipes/[recipeId]/history/route.ts
 */

import { NextResponse } from "next/server";
import { recipeReflectionsService } from "@/services/recipeReflectionsService";
import { _logger } from "@/lib/logger";
import { auth } from "@/lib/auth/auth";
import type { NextRequest } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ recipeId: string }> },
) {
  const { recipeId } = await params;

  if (!recipeId || typeof recipeId !== "string" || !recipeId.trim()) {
    return NextResponse.json(
      { success: false, error: "recipeId parameter is required" },
      { status: 400 },
    );
  }

  const { searchParams } = new URL(request.url);
  const cursor = searchParams.get("cursor");
  const limitStr = searchParams.get("limit");
  const authorTypeStr = searchParams.get("authorType")?.toLowerCase();
  const source = searchParams.get("source") ?? undefined;

  let limit = 20;
  if (limitStr) {
    const parsed = parseInt(limitStr, 10);
    if (!Number.isNaN(parsed) && parsed > 0) {
      limit = Math.min(parsed, 50);
    }
  }

  let authorType: "all" | "agent" | "human" = "all";
  if (authorTypeStr === "agent" || authorTypeStr === "human") {
    authorType = authorTypeStr;
  }

  // Optional authenticated viewer for two-way block enforcement
  let viewerId: string | null = null;
  try {
    const session = await auth();
    viewerId = session?.user?.id ?? null;
  } catch {
    viewerId = null;
  }

  try {
    const page = await recipeReflectionsService.listReflections({
      recipeId: recipeId.trim(),
      viewerId,
      limit,
      cursor,
      authorType,
      source,
    });

    return NextResponse.json({
      success: true,
      recipeId: recipeId.trim(),
      items: page.items,
      nextCursor: page.nextCursor,
      hasMore: page.hasMore,
      totalCount: page.totalCount,
    });
  } catch (error) {
    _logger.error("[GET /api/recipes/:id/history]", error);
    return NextResponse.json(
      {
        success: false,
        error: "Recipe reflections history service temporarily unavailable",
        degraded: true,
      },
      { status: 503 },
    );
  }
}
