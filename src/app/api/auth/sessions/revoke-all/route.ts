/**
 * POST /api/auth/sessions/revoke-all — revoke every active device session
 * for the authenticated user EXCEPT the requester's current session.
 *
 * Use case: "Sign out everywhere else" UX (e.g. after a password reset on
 * a connected account, after suspecting a compromise, etc.). The current
 * device keeps its session so the user isn't immediately logged out of the
 * UI that triggered the action; they can call NextAuth's signOut() if
 * they want to drop the current session too.
 *
 * The Redis denylist is populated lazily by the middleware on the next
 * request from each revoked device — this endpoint only writes to
 * Postgres.
 *
 * @file src/app/api/auth/sessions/revoke-all/route.ts
 */

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";

export const dynamic = "force-dynamic";

export async function POST() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // The requester's own session, preserved below. It comes from auth(), not a
  // second cookie decode — see GET /api/auth/sessions.
  const currentJti = session.user.sessionId;

  try {
    const { executeQuery } = await import("@/lib/database");
    // Revoke every row for this user that isn't already revoked, except
    // the current session. The unique index on (user_id, jti) makes the
    // WHERE clause cheap.
    const result = await executeQuery(
      `UPDATE device_sessions
          SET revoked_at = NOW()
        WHERE user_id = $1
          AND revoked_at IS NULL
          AND ($2::text IS NULL OR id <> $2)
        RETURNING id`,
      [session.user.id, currentJti ?? null],
    );
    return NextResponse.json({
      revoked: result.rowCount ?? 0,
      preservedCurrent: !!currentJti,
    });
  } catch (err) {
    return NextResponse.json(
      {
        error: "Failed to revoke sessions",
        detail: process.env.NODE_ENV === "development" ? String(err) : undefined,
      },
      { status: 500 },
    );
  }
}
