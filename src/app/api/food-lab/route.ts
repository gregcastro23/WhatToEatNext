/**
 * Food Lab Book API
 * GET  /api/food-lab - List entries for the authenticated user
 * POST /api/food-lab - Create a new lab book entry
 */

import { NextResponse } from "next/server";
import { validateRequest, getUserIdFromRequest } from "@/lib/auth/validateRequest";
import { reportQuestEventBestEffort } from "@/services/questEventReporter";
import { logger } from "@/utils/logger";
import { rowToEntry, getUserEntries, saveUserEntries, generateShareToken, type FoodLabEntry } from "./shared";
import type { NextRequest } from "next/server";

let _dbMod: typeof import("@/lib/database") | null = null;
async function getDbModule() {
  if (!_dbMod && typeof window === "undefined" && process.env.DATABASE_URL) {
    try { _dbMod = await import("@/lib/database"); } catch { /* unavailable */ }
  }
  return _dbMod;
}

/**
 * Classify a DB error so we know whether the in-memory fallback is honest.
 *
 * - "unavailable": the DB isn't reachable (connection refused, timeout, DNS).
 *   The row was never offered to Postgres. Falling back to in-memory is fine
 *   — we just lose persistence for this dev or transient-outage window.
 * - "rejected": the DB IS reachable and answered with an error (constraint
 *   violation, syntax error, permission denied). The row is bad. Falling back
 *   would lie to the user — return 5xx instead so the client knows.
 */
function classifyDbError(err: unknown): "unavailable" | "rejected" {
  const code =
    err instanceof Error && "code" in err
      ? String((err as { code?: unknown }).code ?? "")
      : "";
  const networkCodes = new Set([
    "ECONNREFUSED",
    "ECONNRESET",
    "ETIMEDOUT",
    "ENOTFOUND",
    "EHOSTUNREACH",
    "ENETUNREACH",
    "EAI_AGAIN",
  ]);
  if (networkCodes.has(code)) return "unavailable";
  // AggregateError from pg-pool wraps per-attempt connection failures.
  if (err instanceof AggregateError) return "unavailable";
  // Postgres SQLSTATE codes are 5-char alphanumerics. If we got one, the DB
  // accepted the query and rejected the data — that's a real failure.
  if (/^[A-Z0-9]{5}$/.test(code)) return "rejected";
  // Unknown shape — be conservative and treat as rejected so we don't silently
  // pretend a write succeeded.
  return "rejected";
}

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/** GET /api/food-lab */
export async function GET(request: NextRequest) {
  const userId = await getUserIdFromRequest(request);
  if (!userId) {
    return NextResponse.json({ success: false, message: "Authentication required" }, { status: 401 });
  }

  // Bound the read. The default is a generous safety ceiling (not a small page)
  // so clients expecting "all entries" aren't silently truncated; callers can
  // request a smaller window via ?limit / ?offset.
  const { searchParams } = new URL(request.url);
  const limit = Math.min(
    Math.max(parseInt(searchParams.get("limit") || "500", 10) || 500, 1),
    1000,
  );
  const offset = Math.max(parseInt(searchParams.get("offset") || "0", 10) || 0, 0);

  const db = await getDbModule();
  if (db) {
    try {
      const result = await db.executeQuery(
        `SELECT * FROM food_lab_entries WHERE user_id = $1 ORDER BY cooked_at DESC LIMIT $2 OFFSET $3`,
        [userId, limit, offset],
      );
      const entries = result.rows.map(rowToEntry);
      return NextResponse.json({ success: true, entries, count: entries.length });
    } catch (err) {
      // Reads are safe to fall back from — worst case the user sees a stale
      // in-memory view. But still log so an operator can see persistent
      // outages instead of silently degraded reads.
      logger.warn(
        `[food-lab] GET DB read failed (${classifyDbError(err)}); serving in-memory fallback for user ${userId}`,
        err,
      );
    }
  }

  const entries = getUserEntries(userId).slice(offset, offset + limit);
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
      await reportQuestEventBestEffort(userId, "cook_recipe");
      if (photos.length > 0) {
        await reportQuestEventBestEffort(userId, "upload_food_photo");
      }
      return NextResponse.json({ success: true, entry }, { status: 201 });
    } catch (err) {
      const kind = classifyDbError(err);
      if (kind === "rejected") {
        // The DB answered "no" — the row is bad. Don't pretend success by
        // falling back to RAM; the user's data would be lost on restart and
        // they'd never know.
        logger.error(
          `[food-lab] POST DB rejected entry for user ${userId}`,
          err,
        );
        return NextResponse.json(
          {
            success: false,
            message: "Failed to save lab entry",
          },
          { status: 500 },
        );
      }
      // DB unreachable — fall back to in-memory but log so it's visible.
      logger.warn(
        `[food-lab] POST DB unavailable (${kind}); writing to in-memory fallback for user ${userId}`,
        err,
      );
    }
  }

  // In-memory fallback (DB module unavailable or transient outage).
  const existing = getUserEntries(userId);
  saveUserEntries(userId, [entry, ...existing]);
  await reportQuestEventBestEffort(userId, "cook_recipe");
  if (photos.length > 0) {
    await reportQuestEventBestEffort(userId, "upload_food_photo");
  }
  return NextResponse.json({ success: true, entry }, { status: 201 });
}

// Backward compatibility exports removed to comply with Next.js App Router typing rules
