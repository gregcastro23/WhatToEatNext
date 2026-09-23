/**
 * DELETE /api/auth/sessions/[id] — revoke a single device session.
 *
 * Marks the matching `device_sessions` row as revoked. The row remains
 * for audit/history; the next time that device's JWT refreshes, the
 * revocation will be visible to any consumer that joins against this table.
 *
 * Refuses to revoke the requester's own current session — sign-out lives
 * elsewhere (the "SIGN OUT EVERYWHERE" button uses next-auth's signOut).
 *
 * @file src/app/api/auth/sessions/[id]/route.ts
 */

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import { REVOKE_SESSION_BY_ID_SQL } from "@/lib/auth/authQueries";
import { assertAllowedOrigin } from "@/lib/auth/originCheck";

export const dynamic = "force-dynamic";

interface Params {
  params: Promise<{ id: string }>;
}

async function revokeSessionById(id: string, userId: string): Promise<NextResponse> {
  try {
    const { executeQuery } = await import("@/lib/database");
    const result = await executeQuery(
      REVOKE_SESSION_BY_ID_SQL,
      [id, userId],
    );
    if (result.rowCount === 0) {
      return NextResponse.json(
        { error: "Session not found" },
        { status: 404 },
      );
    }
    return NextResponse.json({ revoked: id });
  } catch (err) {
    return NextResponse.json(
      {
        error: "Failed to revoke session",
        detail: process.env.NODE_ENV === "development" ? String(err) : undefined,
      },
      { status: 500 },
    );
  }
}

export async function DELETE(request: Request, { params }: Params) {
  const originError = assertAllowedOrigin(request);
  if (originError) {
    return originError;
  }

  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  if (!id) {
    return NextResponse.json({ error: "Missing session id" }, { status: 400 });
  }

  // Refuse to revoke the current session through this route. The id comes
  // from auth(), not a second cookie decode — see GET /api/auth/sessions.
  if (session.user.sessionId === id) {
    return NextResponse.json(
      { error: "Use signOut to end the current session." },
      { status: 400 },
    );
  }

  return revokeSessionById(id, session.user.id);
}
