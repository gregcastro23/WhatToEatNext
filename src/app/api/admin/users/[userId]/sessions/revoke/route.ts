/**
 * Admin Session Revocation
 * POST /api/admin/users/[userId]/sessions/revoke — revoke every active
 * device session for a user.
 *
 * Admin-scoped counterpart of the self-service
 * POST /api/auth/sessions/revoke-all: no current-session carve-out — the
 * operator is stamping every one of the target's device rows.
 *
 * What this endpoint does and does not do: it writes `revoked_at` in
 * Postgres, and nothing else. Whether that stamp signs anybody out depends
 * on AUTH_REVOCATION_CHECK (see auth.config.ts:165, auth.ts:585). With the
 * check off — its default, and its state in production — no code path reads
 * `revoked_at` for authorization, so every existing sign-in keeps working.
 * The response therefore reports the flag alongside the row count, and the
 * admin UI words its result from it rather than promising a sign-out.
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
      // `rows.length` — the statement already RETURNs a row per stamped
      // session, so this is measured. `rowCount ?? 0` would print a confident
      // 0 for a count the driver did not supply.
      revoked: result.rows.length,
      // Named for the flag it read, NOT for an outcome: this reports whether
      // the revocation check is switched on, not whether any device was
      // signed out. Byte-identical to the gate at auth.config.ts:165 and
      // auth.ts:585 — if either moves to the edge runtime (where Next can
      // inline process.env at build time) this proxy stops being exact.
      revocationCheck:
        process.env.AUTH_REVOCATION_CHECK === "on" ? "on" : "off",
    });
  } catch (error) {
    console.error("[admin/users/sessions/revoke] failed:", error);
    return NextResponse.json(
      { success: false, message: "Failed to revoke sessions" },
      { status: 500 },
    );
  }
}
