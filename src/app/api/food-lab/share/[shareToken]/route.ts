/**
 * Public Food Lab Share API
 * GET /api/food-lab/share/[shareToken] - Return a publicly shared lab entry (no auth required)
 */

import { NextResponse } from "next/server";
import { rowToEntry } from "../../route";
import type { NextRequest } from "next/server";

let _dbMod: typeof import("@/lib/database") | null = null;
async function getDbModule() {
  if (!_dbMod && typeof window === "undefined" && process.env.DATABASE_URL) {
    try { _dbMod = await import("@/lib/database"); } catch { /* unavailable */ }
  }
  return _dbMod;
}

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ shareToken: string }> },
) {
  const { shareToken } = await params;

  const db = await getDbModule();
  if (!db) {
    return NextResponse.json({ success: false, message: "Entry not found" }, { status: 404 });
  }

  try {
    const result = await db.executeQuery(
      `SELECT * FROM food_lab_entries WHERE share_token = $1 AND is_public = TRUE`,
      [shareToken],
    );
    if (result.rows.length === 0) {
      return NextResponse.json({ success: false, message: "Shared entry not found" }, { status: 404 });
    }
    const entry = rowToEntry(result.rows[0]);
    // Strip user-identifying info for public view
    return NextResponse.json({
      success: true,
      entry: {
        id: entry.id,
        dishName: entry.dishName,
        description: entry.description,
        notes: entry.notes,
        recipeName: entry.recipeName,
        cuisineType: entry.cuisineType,
        cookingMethod: entry.cookingMethod,
        cookedAt: entry.cookedAt,
        photos: entry.photos,
        elementalTags: entry.elementalTags,
        alchemicalTags: entry.alchemicalTags,
        rating: entry.rating,
        tags: entry.tags,
        shareToken: entry.shareToken,
      },
    });
  } catch {
    return NextResponse.json({ success: false, message: "Entry not found" }, { status: 404 });
  }
}
