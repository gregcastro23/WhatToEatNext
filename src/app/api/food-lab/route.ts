/**
 * Food Lab Book API
 * GET  /api/food-lab - List entries for the authenticated user
 * POST /api/food-lab - Create a new lab book entry
 */

import { NextResponse } from "next/server";
import { validateRequest, getUserIdFromRequest } from "@/lib/auth/validateRequest";
import { rowToEntry, getUserEntries, saveUserEntries, generateShareToken, type FoodLabEntry } from "./shared";
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

/** GET /api/food-lab */
export async function GET(request: NextRequest) {
  const userId = await getUserIdFromRequest(request);
  if (!userId) {
    return NextResponse.json({ success: false, message: "Authentication required" }, { status: 401 });
  }

  const db = await getDbModule();
  if (db) {
    try {
      const result = await db.executeQuery(
        `SELECT * FROM food_lab_entries WHERE user_id = $1 ORDER BY cooked_at DESC`,
        [userId],
      );
      const entries = result.rows.map(rowToEntry);
      return NextResponse.json({ success: true, entries, count: entries.length });
    } catch { /* fall through */ }
  }

  const entries = getUserEntries(userId);
  return NextResponse.json({ success: true, entries, count: entries.length });
}

/** POST /api/food-lab */
export async function POST(request: NextRequest) {
  const authResult = await validateRequest(request);
  if ("error" in authResult) return authResult.error;

  const userId = authResult.user.userId;
  const body = await request.json();

  const {
    dishName,
    description,
    notes,
    recipeName,
    cuisineType,
    cookingMethod,
    cookedAt,
    photos = [],
    elementalTags = {},
    alchemicalTags = {},
    planetaryContext = {},
    rating,
    tags = [],
    isPublic = false,
  } = body;

  if (!dishName) {
    return NextResponse.json({ success: false, message: "dishName is required" }, { status: 400 });
  }

  const id = `lab_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const now = new Date().toISOString();
  const shareToken = isPublic ? generateShareToken() : undefined;

  const entry: FoodLabEntry = {
    id,
    userId,
    dishName,
    description,
    notes,
    recipeName,
    cuisineType,
    cookingMethod,
    cookedAt: cookedAt ?? now,
    photos,
    elementalTags,
    alchemicalTags,
    planetaryContext,
    rating,
    tags,
    isPublic,
    shareToken,
    createdAt: now,
    updatedAt: now,
  };

  const db = await getDbModule();
  if (db) {
    try {
      await db.executeQuery(
        `INSERT INTO food_lab_entries
          (id, user_id, dish_name, description, notes, recipe_name, cuisine_type,
           cooking_method, cooked_at, photos, elemental_tags, alchemical_tags,
           planetary_context, rating, tags, is_public, share_token, created_at, updated_at)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19)`,
        [
          id, userId, dishName, description ?? null, notes ?? null,
          recipeName ?? null, cuisineType ?? null, cookingMethod ?? null,
          entry.cookedAt, JSON.stringify(photos), JSON.stringify(elementalTags),
          JSON.stringify(alchemicalTags), JSON.stringify(planetaryContext),
          rating ?? null, tags, isPublic, shareToken ?? null, now, now,
        ],
      );
      return NextResponse.json({ success: true, entry }, { status: 201 });
    } catch { /* fall through */ }
  }

  // In-memory fallback
  const existing = getUserEntries(userId);
  saveUserEntries(userId, [entry, ...existing]);
  return NextResponse.json({ success: true, entry }, { status: 201 });
}

// Re-export helpers for backward compatibility with sibling imports if any still point to ../route
export { rowToEntry, getUserEntries, saveUserEntries, generateShareToken };
