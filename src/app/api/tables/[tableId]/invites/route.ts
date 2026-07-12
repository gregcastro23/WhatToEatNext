/**
 * POST /api/tables/[tableId]/invites
 * Host-only. Issues a bearer-token invite {token, url: /t/<token>}. QR is the
 * same URL client-rendered as a code — not a distinct invite kind.
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
  params: Promise<{ tableId: string }>;
}

const issueInviteSchema = z.object({
  expiresInHours: z.number().int().min(1).max(24 * 30).optional(),
  maxUses: z.number().int().min(1).max(100).optional(),
});

const INVITE_LIMIT = { window: 60_000, max: 10, bucket: "tables-invites" } as const;

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { tableId } = await params;
    const userId = await getUserIdFromRequest(request);
    if (!userId) {
      return NextResponse.json(
        { success: false, message: "Authentication required" },
        { status: 401 },
      );
    }

    const rl = await rateLimit(request, { ...INVITE_LIMIT, identifier: userId });
    if (!rl.allowed) return rl.response!;

    const info = await tableDatabase.getTableHostAndStatus(tableId);
    if (!info) {
      return NextResponse.json({ success: false, message: "Table not found" }, { status: 404 });
    }
    if (info.hostId !== userId) {
      return NextResponse.json(
        { success: false, message: "Only the host can issue invites" },
        { status: 403 },
      );
    }

    let rawBody: unknown = {};
    const rawText = await request.text();
    if (rawText) {
      try {
        rawBody = JSON.parse(rawText);
      } catch {
        return NextResponse.json({ success: false, message: "Invalid JSON" }, { status: 400 });
      }
    }

    const parsed = issueInviteSchema.safeParse(rawBody);
    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          message: "Validation error",
          details: parsed.error.flatten().fieldErrors,
        },
        { status: 400 },
      );
    }

    const invite = await tableDatabase.issueInvite(tableId, userId, parsed.data);
    if (!invite) {
      return NextResponse.json(
        { success: false, message: "Failed to issue invite" },
        { status: 500 },
      );
    }

    return NextResponse.json({ success: true, invite }, { status: 201 });
  } catch (error) {
    console.error("Issue table invite error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 },
    );
  }
}
