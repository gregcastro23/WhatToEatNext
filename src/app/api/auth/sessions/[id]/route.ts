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

export const dynamic = "force-dynamic";

interface Params {
  params: Promise<{ id: string }>;
}

export async function DELETE(request: Request, { params }: Params) {
  const session = await auth();
  const user = session?.user as { id?: string } | undefined;
  if (!user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  if (!id) {
    return NextResponse.json({ error: "Missing session id" }, { status: 400 });
  }

  // Refuse to revoke the current session through this route.
  try {
    const { getToken } = await import("next-auth/jwt");
    const token = await getToken({
      req: request,
      secret: process.env.AUTH_SECRET,
    });
    const currentJti = token?.deviceSessionId ?? token?.sessionId;
    if (currentJti === id) {
      return NextResponse.json(
        { error: "Use signOut to end the current session." },
        { status: 400 },
      );
    }
  } catch {
    /* if we can't read the token, fall through — DB ownership check still gates */
  }

  try {
    const { executeQuery } = await import("@/lib/database");
    const result = await executeQuery(
      `UPDATE device_sessions
          SET revoked_at = NOW()
        WHERE id = $1 AND user_id = $2 AND revoked_at IS NULL
        RETURNING id`,
      [id, user.id],
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
