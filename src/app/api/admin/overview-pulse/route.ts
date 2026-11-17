/**
 * Admin Overview Multiplexed Pulse
 * GET /api/admin/overview-pulse
 *
 * Combines the three above-the-fold /admin payloads (PulseStrip,
 * LiveActivityPanel, SystemStatusPanel) plus threshold-based friction alerts
 * into a single request so the operator overview runs 1 polling loop instead
 * of 4 separate intervals.
 *
 * @requires Authentication - Admin role required
 * @file src/app/api/admin/overview-pulse/route.ts
 */

import { NextResponse, type NextRequest } from "next/server";
import { validateAdminRequest } from "@/lib/auth/validateRequest";
import { buildOverviewPulsePayload } from "@/services/admin/overviewPulseService";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request: NextRequest): Promise<NextResponse> {
  const authResult = await validateAdminRequest(request);
  if ("error" in authResult) return authResult.error;
  return NextResponse.json(await buildOverviewPulsePayload(1));
}
