/**
 * Food Lab Book API
 * GET  /api/food-lab - List entries for the authenticated user
 * POST /api/food-lab - Create a new lab book entry
 */

import { NextResponse } from "next/server";
import { validateRequest, getUserIdFromRequest } from "@/lib/auth/validateRequest";
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

export interface FoodLabEntry {
  id: string;
  userId: string;
  dishName: string;
  description?: string;
  notes?: string;
  recipeName?: string;
  cuisineType?: string;
  cookingMethod?: string;
  cookedAt: string;
  photos: Array<{ dataUrl: string; caption?: string; uploadedAt: string }>;
  elementalTags: Record<string, number>;
  alchemicalTags: Record<string, number>;
  planetaryContext: Record<string, unknown>;
  rating?: number;
  tags: string[];
  isPublic: boolean;
  shareToken?: string;
  createdAt: string;
  updatedAt: string;
}

/** In-memory fallback when DB is unavailable */
const memStore = new Map<string, FoodLabEntry[]>(); // userId -> entries

function getUserEntries(userId: string): FoodLabEntry[] {
  return memStore.get(userId) ?? [];
}

function saveUserEntries(userId: string, entries: FoodLabEntry[]) {
  memStore.set(userId, entries);
}

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

function generateShareToken(): string {
  return `${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 10)}`;
}

function rowToEntry(row: Record<string, unknown>): FoodLabEntry {
  return {
    id: row.id as string,
    userId: row.user_id as string,
    dishName: row.dish_name as string,
    description: row.description as string | undefined,
    notes: row.notes as string | undefined,
    recipeName: row.recipe_name as string | undefined,
    cuisineType: row.cuisine_type as string | undefined,
    cookingMethod: row.cooking_method as string | undefined,
    cookedAt: (row.cooked_at as Date).toISOString(),
    photos: (typeof row.photos === "string" ? JSON.parse(row.photos) : row.photos) as FoodLabEntry["photos"],
    elementalTags: (typeof row.elemental_tags === "string" ? JSON.parse(row.elemental_tags) : row.elemental_tags) as Record<string, number>,
    alchemicalTags: (typeof row.alchemical_tags === "string" ? JSON.parse(row.alchemical_tags) : row.alchemical_tags) as Record<string, number>,
    planetaryContext: (typeof row.planetary_context === "string" ? JSON.parse(row.planetary_context) : row.planetary_context) as Record<string, unknown>,
    rating: row.rating as number | undefined,
    tags: (row.tags as string[]) ?? [],
    isPublic: row.is_public as boolean,
    shareToken: row.share_token as string | undefined,
    createdAt: (row.created_at as Date).toISOString(),
    updatedAt: (row.updated_at as Date).toISOString(),
  };
}

// Export helper for sibling routes
export { rowToEntry, memStore, getUserEntries, saveUserEntries, generateShareToken };
