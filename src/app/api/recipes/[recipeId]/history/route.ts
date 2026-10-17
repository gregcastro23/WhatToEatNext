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
import { auth } from "@/lib/auth/auth";
import { _logger } from "@/lib/logger";
import { recipeReflectionsService } from "@/services/recipeReflectionsService";
import type { NextRequest } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function parseHistoryQuery(url: string): {
  cursor: string | null;
  limit: number;
  authorType: "all" | "agent" | "human";
  source?: string;
} {
  const { searchParams } = new URL(url);
  const cursor = searchParams.get("cursor");
  const limitStr = searchParams.get("limit");
  const authorTypeStr = searchParams.get("authorType")?.toLowerCase();
  const source = searchParams.get("source") ?? undefined;
  const parsed = limitStr ? parseInt(limitStr, 10) : NaN;
  const limit = !Number.isNaN(parsed) && parsed > 0 ? Math.min(parsed, 50) : 20;
  const authorType = authorTypeStr === "agent" || authorTypeStr === "human" ? authorTypeStr : "all";
  return { cursor, limit, authorType, ...(source ? { source } : {}) };
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ recipeId: string }> },
): Promise<NextResponse> {
  const { recipeId } = await params;

  if (!recipeId || typeof recipeId !== "string" || !recipeId.trim()) {
    return NextResponse.json(
      { success: false, error: "recipeId parameter is required" },
      { status: 400 },
    );
  }

  const { cursor, limit, authorType, source } = parseHistoryQuery(request.url);

  // Optional authenticated viewer for two-way block enforcement
  let viewerId: string | null;
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
      ...(source ? { source } : {}),
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
