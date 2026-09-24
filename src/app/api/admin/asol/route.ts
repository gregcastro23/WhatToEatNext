/**
 * Admin ASOL Delivery Health API
 * GET /api/admin/asol
 *
 * Telemetry and delivery stats for Planetary Agents (ASOL) inbound integrations.
 *
 * @requires Authentication - Admin role required
 */

import { NextResponse, type NextRequest } from "next/server";
import { validateAdminRequest } from "@/lib/auth/validateRequest";
import { _logger } from "@/lib/logger";
import { getAsolHealthOverview } from "@/services/admin/asolHealthService";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request: NextRequest): Promise<NextResponse> {
  const authResult = await validateAdminRequest(request);
  if ("error" in authResult) return authResult.error;

  try {
    const { searchParams } = new URL(request.url);
    const statusParam = searchParams.get("status");
    const status = statusParam === "failed" ? "failed" : "all";
    const payload = await getAsolHealthOverview({ status });
    return NextResponse.json({ success: true, ...payload });
  } catch (error) {
    _logger.error("[GET /api/admin/asol] Error loading health:", error);
    return NextResponse.json(
      { success: false, error: "Failed to load ASOL delivery health" },
      { status: 500 },
    );
  }
}
