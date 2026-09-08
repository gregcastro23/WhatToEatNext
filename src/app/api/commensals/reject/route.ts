/**
 * Reject Commensal Request API Route
 * PUT /api/commensals/reject - Reject/delete a commensal request
 */

import { NextResponse } from "next/server";
import { getUserIdFromRequest } from "@/lib/auth/validateRequest";
import { _logger } from "@/lib/logger";
import { CommensalRejectRequestSchema } from "@/lib/validation/apiSchemas";
import { commensalDatabase } from "@/services/commensalDatabaseService";
import type { NextRequest } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function PUT(request: NextRequest) {
  try {
    const userId = await getUserIdFromRequest(request);
    if (!userId) {
      return NextResponse.json({ success: false, message: "Authentication required" }, { status: 401 });
    }

    let rawBody: unknown;
    try {
      rawBody = await request.json();
    } catch {
      return NextResponse.json({ success: false, message: "Invalid JSON in request body" }, { status: 400 });
    }

    const parsed = CommensalRejectRequestSchema.safeParse(rawBody);
    if (!parsed.success) {
      return NextResponse.json({ success: false, message: "commensalshipId is required" }, { status: 400 });
    }

    const { commensalshipId } = parsed.data;
    const deleted = await commensalDatabase.deleteCommensalship(commensalshipId, userId);

    if (!deleted) {
      return NextResponse.json(
        { success: false, message: "Could not reject request. You may not be a party to this commensalship." },
        { status: 400 },
      );
    }

    return NextResponse.json({ success: true, message: "Commensal request rejected" });
  } catch (error) {
    _logger.error("Reject commensal error:", error);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}
