/**
 * Machine-Consumable Recipe Catalog Export API
 * GET /api/recipes/export
 *
 * Provides immutable, versioned, digest-verified snapshots of the recipe catalog.
 * Supports multi-page retrieval pinned to a single immutable snapshot.
 *
 * If a snapshot session expires or is missing during multi-page export,
 * the API explicitly returns 410 SNAPSHOT_EXPIRED so the client restarts cleanly
 * rather than stitching partial or mixed catalog states.
 *
 * @file src/app/api/recipes/export/route.ts
 */

import { NextResponse } from "next/server";
import { bearerMatches } from "@/lib/hooks/secureCompare";
import { _logger } from "@/lib/logger";
import { recipeCatalogExportService } from "@/services/recipeCatalogExportService";
import type { NextRequest } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function isAuthorized(authHeader: string | null): boolean {
  // If INTERNAL_API_SECRET is set, internal callers can authenticate with Bearer token.
  // Catalog read export is accessible to internal integration agents.
  if (!process.env.INTERNAL_API_SECRET) return true;
  if (!authHeader) return false;
  return bearerMatches(authHeader, process.env.INTERNAL_API_SECRET);
}

function parseLimit(limitStr: string | null): number {
  if (!limitStr) return 100;
  const parsed = parseInt(limitStr, 10);
  return !Number.isNaN(parsed) && parsed > 0 ? Math.min(parsed, 250) : 100;
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  if (!isAuthorized(request.headers.get("Authorization"))) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const snapshotId = searchParams.get("snapshotId") ?? undefined;
  const cursor = searchParams.get("cursor");
  const limit = parseLimit(searchParams.get("limit"));

  try {
    const page = await recipeCatalogExportService.getExportPage({
      ...(snapshotId ? { snapshotId } : {}),
      cursor,
      limit,
    });

    return NextResponse.json({
      success: true,
      ...page,
    });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "SNAPSHOT_EXPIRED" || error.message === "SNAPSHOT_NOT_FOUND") {
        return NextResponse.json(
          {
            success: false,
            error: "SNAPSHOT_EXPIRED",
            message: "The requested snapshot session has expired or is not found. Restart export from beginning.",
          },
          { status: 410 },
        );
      }
    }

    _logger.error("[GET /api/recipes/export]", error);
    return NextResponse.json(
      {
        success: false,
        error: "Export service temporarily unavailable",
        degraded: true,
      },
      { status: 503 },
    );
  }
}
