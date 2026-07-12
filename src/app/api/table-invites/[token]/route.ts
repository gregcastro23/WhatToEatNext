/**
 * GET /api/table-invites/[token]
 * PUBLIC, no auth — the invite landing page (/t/[token]) reads this while
 * logged out. Card-level preview only; never the member list.
 */

import { NextResponse } from "next/server";
import { rateLimit } from "@/lib/rateLimit";
import { tableDatabase } from "@/services/tableDatabaseService";
import type { NextRequest } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

interface RouteParams {
  params: Promise<{ token: string }>;
}

const PREVIEW_LIMIT = { window: 60_000, max: 30, bucket: "table-invite-preview" } as const;

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const rl = await rateLimit(request, PREVIEW_LIMIT);
    if (!rl.allowed) return rl.response!;

    const { token } = await params;
    const preview = await tableDatabase.getInvitePreview(token);
    if (!preview) {
      return NextResponse.json({ success: false, message: "Invite not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, preview });
  } catch (error) {
    console.error("Table invite preview error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 },
    );
  }
}
