/**
 * Single Food Lab Entry API
 * GET    /api/food-lab/[entryId]
 * PUT    /api/food-lab/[entryId]
 * DELETE /api/food-lab/[entryId]
 */

import { NextResponse } from "next/server";
import { validateRequest, getUserIdFromRequest } from "@/lib/auth/validateRequest";
import { rowToEntry, getUserEntries, saveUserEntries, generateShareToken } from "../route";
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

/** GET /api/food-lab/[entryId] */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ entryId: string }> },
) {
  const { entryId } = await params;
  const userId = await getUserIdFromRequest(request);
  if (!userId) {
    return NextResponse.json({ success: false, message: "Authentication required" }, { status: 401 });
  }

  const db = await getDbModule();

  if (db) {
    try {
      const result = await db.executeQuery(
        `SELECT * FROM food_lab_entries WHERE id = $1 AND user_id = $2`,
        [entryId, userId],
      );
      if (result.rows.length === 0) {
        return NextResponse.json({ success: false, message: "Entry not found" }, { status: 404 });
      }
      return NextResponse.json({ success: true, entry: rowToEntry(result.rows[0]) });
    } catch { /* fall through */ }
  }

  const entries = getUserEntries(userId);
  const entry = entries.find((e) => e.id === entryId);
  if (!entry) {
    return NextResponse.json({ success: false, message: "Entry not found" }, { status: 404 });
  }
  return NextResponse.json({ success: true, entry });
}

/** PUT /api/food-lab/[entryId] */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ entryId: string }> },
) {
  const { entryId } = await params;
  const authResult = await validateRequest(request);
  if ("error" in authResult) return authResult.error;

  const userId = authResult.user.userId;
  const body = await request.json();
  const now = new Date().toISOString();

  const {
    dishName,
    description,
    notes,
    recipeName,
    cuisineType,
    cookingMethod,
    cookedAt,
    photos,
    elementalTags,
    alchemicalTags,
    planetaryContext,
    rating,
    tags,
    isPublic,
  } = body;

  const db = await getDbModule();
  if (db) {
    try {
      const existing = await db.executeQuery(
        `SELECT is_public, share_token FROM food_lab_entries WHERE id = $1 AND user_id = $2`,
        [entryId, userId],
      );
      if (existing.rows.length === 0) {
        return NextResponse.json({ success: false, message: "Entry not found" }, { status: 404 });
      }

      const wasPublic = existing.rows[0].is_public;
      const existingToken = existing.rows[0].share_token;
      let shareToken = existingToken;
      if (isPublic && !existingToken) shareToken = generateShareToken();
      if (!isPublic) shareToken = null;

      await db.executeQuery(
        `UPDATE food_lab_entries SET
          dish_name = COALESCE($3, dish_name),
          description = COALESCE($4, description),
          notes = COALESCE($5, notes),
          recipe_name = COALESCE($6, recipe_name),
          cuisine_type = COALESCE($7, cuisine_type),
          cooking_method = COALESCE($8, cooking_method),
          cooked_at = COALESCE($9, cooked_at),
          photos = COALESCE($10, photos),
          elemental_tags = COALESCE($11, elemental_tags),
          alchemical_tags = COALESCE($12, alchemical_tags),
          planetary_context = COALESCE($13, planetary_context),
          rating = COALESCE($14, rating),
          tags = COALESCE($15, tags),
          is_public = COALESCE($16, is_public),
          share_token = $17,
          updated_at = $18
         WHERE id = $1 AND user_id = $2`,
        [
          entryId, userId,
          dishName ?? null, description ?? null, notes ?? null,
          recipeName ?? null, cuisineType ?? null, cookingMethod ?? null,
          cookedAt ?? null,
          photos ? JSON.stringify(photos) : null,
          elementalTags ? JSON.stringify(elementalTags) : null,
          alchemicalTags ? JSON.stringify(alchemicalTags) : null,
          planetaryContext ? JSON.stringify(planetaryContext) : null,
          rating ?? null,
          tags ?? null,
          isPublic ?? wasPublic,
          shareToken,
          now,
        ],
      );

      const updated = await db.executeQuery(
        `SELECT * FROM food_lab_entries WHERE id = $1`,
        [entryId],
      );
      return NextResponse.json({ success: true, entry: rowToEntry(updated.rows[0]) });
    } catch { /* fall through */ }
  }

  {
    // In-memory fallback
    const entries = getUserEntries(userId);
    const idx = entries.findIndex((e) => e.id === entryId);
    if (idx === -1) {
      return NextResponse.json({ success: false, message: "Entry not found" }, { status: 404 });
    }
    const updated = {
      ...entries[idx],
      ...(dishName !== undefined && { dishName }),
      ...(description !== undefined && { description }),
      ...(notes !== undefined && { notes }),
      ...(recipeName !== undefined && { recipeName }),
      ...(cuisineType !== undefined && { cuisineType }),
      ...(cookingMethod !== undefined && { cookingMethod }),
      ...(cookedAt !== undefined && { cookedAt }),
      ...(photos !== undefined && { photos }),
      ...(elementalTags !== undefined && { elementalTags }),
      ...(alchemicalTags !== undefined && { alchemicalTags }),
      ...(planetaryContext !== undefined && { planetaryContext }),
      ...(rating !== undefined && { rating }),
      ...(tags !== undefined && { tags }),
      ...(isPublic !== undefined && {
        isPublic,
        shareToken: isPublic ? (entries[idx].shareToken || generateShareToken()) : undefined,
      }),
      updatedAt: now,
    };
    entries[idx] = updated;
    saveUserEntries(userId, entries);
    return NextResponse.json({ success: true, entry: updated });
  }
}



/** DELETE /api/food-lab/[entryId] */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ entryId: string }> },
) {
  const { entryId } = await params;
  const authResult = await validateRequest(request);
  if ("error" in authResult) return authResult.error;

  const userId = authResult.user.userId;

  const db = await getDbModule();
  if (db) {
    try {
      const result = await db.executeQuery(
        `DELETE FROM food_lab_entries WHERE id = $1 AND user_id = $2 RETURNING id`,
        [entryId, userId],
      );
      if (result.rows.length === 0) {
        return NextResponse.json({ success: false, message: "Entry not found" }, { status: 404 });
      }
      return NextResponse.json({ success: true });
    } catch { /* fall through */ }
  }

  const entries = getUserEntries(userId);
  const filtered = entries.filter((e) => e.id !== entryId);
  if (filtered.length === entries.length) {
    return NextResponse.json({ success: false, message: "Entry not found" }, { status: 404 });
  }
  saveUserEntries(userId, filtered);
  return NextResponse.json({ success: true });
}
