/**
 * Admin Session Revocation
 * POST /api/admin/users/[userId]/sessions/revoke — revoke every active
 * device session for a user.
 *
 * Admin-scoped counterpart of the self-service
 * POST /api/auth/sessions/revoke-all: no current-session carve-out — the
 * operator is signing the target out everywhere. The Redis denylist is
 * populated lazily by the middleware on each revoked device's next
 * request; this endpoint only writes to Postgres.
 *
 * @requires Authentication - Admin role required
 */

import { NextResponse, type NextRequest } from "next/server";
import { validateAdminRequest } from "@/lib/auth/validateRequest";
import { executeQuery } from "@/lib/database";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

interface RouteParams {
  params: Promise<{ userId: string }>;
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  const authResult = await validateAdminRequest(request);
  if ("error" in authResult) {
    return authResult.error;
  }

  const { userId } = await params;
  if (!userId || !/^[0-9a-f-]{8,}$/i.test(userId)) {
    return NextResponse.json(
      { success: false, message: "Invalid userId" },
      { status: 400 },
    );
  }

  try {
    // device_sessions.user_id is TEXT (database/init/33), so no uuid cast.
    const result = await executeQuery(
      `UPDATE device_sessions
          SET revoked_at = NOW()
        WHERE user_id = $1
          AND revoked_at IS NULL
        RETURNING id`,
      [userId],
    );
    return NextResponse.json({
      success: true,
      revoked: result.rowCount ?? 0,
    });
  } catch (error) {
    console.error("[admin/users/sessions/revoke] failed:", error);
    return NextResponse.json(
      { success: false, message: "Failed to revoke sessions" },
      { status: 500 },
    );
  }
}
