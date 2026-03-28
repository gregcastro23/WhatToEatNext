/**
 * Shared Recommendation Sessions API
 *
 * Premium users can create shareable recommendation sessions
 * with invited members who can view shared results.
 *
 * @file src/app/api/sessions/route.ts
 */

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import { subscriptionService } from "@/services/subscriptionService";

let dbModule: typeof import("@/lib/database") | null = null;
const getDb = async () => {
  if (!dbModule && typeof window === "undefined" && process.env.DATABASE_URL) {
    try {
      dbModule = await import("@/lib/database");
    } catch {
      return null;
    }
  }
  return dbModule;
};

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Premium check
  const isAdmin = session.user.role === "admin";
  if (!isAdmin) {
    const sub = await subscriptionService.getOrCreateSubscription(session.user.id);
    if (sub.tier !== "premium") {
      return NextResponse.json(
        { upgrade_required: true, message: "Shared sessions require Premium." },
        { status: 403 },
      );
    }
  }

  try {
    const body = await request.json();
    const { name, memberIds, strategy = "consensus" } = body;

    if (!memberIds || !Array.isArray(memberIds) || memberIds.length < 1) {
      return NextResponse.json(
        { error: "At least 1 member ID is required" },
        { status: 400 },
      );
    }

    const sessionId = `sess_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    const db = await getDb();

    if (db) {
      try {
        await db.executeQuery(
          `INSERT INTO recommendation_sessions
            (id, creator_id, name, member_ids, strategy, status, expires_at)
           VALUES ($1, $2, $3, $4, $5, 'active', NOW() + INTERVAL '7 days')`,
          [
            sessionId,
            session.user.id,
            name || "Group Session",
            JSON.stringify(memberIds),
            strategy,
          ],
        );
      } catch (dbError) {
        console.warn("[api/sessions] DB insert failed, returning in-memory session:", dbError);
      }
    }

    return NextResponse.json({
      success: true,
      session: {
        id: sessionId,
        creatorId: session.user.id,
        name: name || "Group Session",
        memberIds,
        strategy,
        status: "active",
        createdAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("[api/sessions] Error:", error);
    return NextResponse.json(
      { error: "Failed to create session" },
      { status: 500 },
    );
  }
}

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get("id");

    const db = await getDb();
    if (!db) {
      return NextResponse.json({ sessions: [] });
    }

    if (sessionId) {
      // Get specific session
      const result = await db.executeQuery(
        `SELECT id, creator_id as "creatorId", name, member_ids as "memberIds",
                strategy, results, status, created_at as "createdAt", expires_at as "expiresAt"
         FROM recommendation_sessions
         WHERE id = $1 AND (creator_id = $2 OR member_ids::text LIKE '%' || $2 || '%')`,
        [sessionId, session.user.id],
      );
      if (result.rows.length === 0) {
        return NextResponse.json({ error: "Session not found" }, { status: 404 });
      }
      return NextResponse.json({ success: true, session: result.rows[0] });
    }

    // List user's sessions
    const result = await db.executeQuery(
      `SELECT id, creator_id as "creatorId", name, member_ids as "memberIds",
              strategy, status, created_at as "createdAt", expires_at as "expiresAt"
       FROM recommendation_sessions
       WHERE creator_id = $1 AND status = 'active' AND expires_at > NOW()
       ORDER BY created_at DESC
       LIMIT 20`,
      [session.user.id],
    );

    return NextResponse.json({ success: true, sessions: result.rows });
  } catch (error) {
    console.error("[api/sessions] Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch sessions" },
      { status: 500 },
    );
  }
}
