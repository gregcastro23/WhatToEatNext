/**
 * POST /api/table-invites/[token]/redeem
 * Requires auth (sign-in happens on the landing page first). Atomic consume
 * via tableDatabaseService.redeemInvite — membership is checked first (no-op
 * success, no use spent), otherwise a guarded use_count increment (0 rows =
 * expired/exhausted/revoked -> 410).
 */

import { NextResponse } from "next/server";
import { z } from "zod";
import { getUserIdFromRequest } from "@/lib/auth/validateRequest";
import { rateLimit } from "@/lib/rateLimit";
import { tableDatabase } from "@/services/tableDatabaseService";
import type { NextRequest } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

interface RouteParams {
  params: Promise<{ token: string }>;
}

const redeemSchema = z.object({
  via: z.enum(["link", "qr"]).optional(),
});

const REDEEM_LIMIT = { window: 60_000, max: 20, bucket: "table-invite-redeem" } as const;

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { token } = await params;
    const userId = await getUserIdFromRequest(request);
    if (!userId) {
      return NextResponse.json(
        { success: false, message: "Authentication required" },
        { status: 401 },
      );
    }

    const rl = await rateLimit(request, { ...REDEEM_LIMIT, identifier: userId });
    if (!rl.allowed) return rl.response!;

    let rawBody: unknown = {};
    const rawText = await request.text();
    if (rawText) {
      try {
        rawBody = JSON.parse(rawText);
      } catch {
        return NextResponse.json({ success: false, message: "Invalid JSON" }, { status: 400 });
      }
    }

    const parsed = redeemSchema.safeParse(rawBody);
    if (!parsed.success) {
      return NextResponse.json({ success: false, message: "Invalid request" }, { status: 400 });
    }

    const result = await tableDatabase.redeemInvite(token, userId, parsed.data.via ?? "link");
    if (!result.ok) {
      if (result.reason === "invalid") {
        return NextResponse.json(
          { success: false, message: "This invite link is not valid" },
          { status: 404 },
        );
      }
      return NextResponse.json(
        { success: false, message: "This invite link has expired or reached its use limit" },
        { status: 410 },
      );
    }

    return NextResponse.json({
      success: true,
      tableId: result.tableId,
      alreadyMember: result.alreadyMember,
    });
  } catch (error) {
    console.error("Redeem table invite error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 },
    );
  }
}
