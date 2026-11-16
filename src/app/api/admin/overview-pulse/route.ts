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
import { memoize } from "@/lib/cache/memoryCache";
import { getAdminPulse } from "@/services/admin/adminPulseService";
import { readFrictionAlerts, readInteractionTallies } from "@/services/admin/trafficReaders";
import { getLiveActivity } from "@/services/liveActivityService";
import { getSystemStatus } from "@/services/systemStatusService";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request: NextRequest): Promise<NextResponse> {
  const authResult = await validateAdminRequest(request);
  if ("error" in authResult) return authResult.error;

  const [pulseRes, activityRes, statusRes, frictionRes, talliesRes] = await Promise.allSettled([
    memoize("admin:pulse", 15_000, () => getAdminPulse()),
    memoize("admin:live-activity", 5_000, () => getLiveActivity()),
    memoize("admin:system-status", 15_000, () => getSystemStatus()),
    memoize("admin:friction-alerts", 10_000, () => readFrictionAlerts()),
    memoize("admin:interaction-tallies:24h", 15_000, () => readInteractionTallies("24 hours")),
  ]);

  return NextResponse.json({
    success: true,
    generatedAt: new Date().toISOString(),
    pulse: pulseRes.status === "fulfilled" ? pulseRes.value : null,
    liveActivity: activityRes.status === "fulfilled" ? activityRes.value : null,
    systemStatus:
      statusRes.status === "fulfilled"
        ? { success: true, ...statusRes.value }
        : null,
    frictionAlerts: frictionRes.status === "fulfilled" ? frictionRes.value : null,
    interactionTallies: talliesRes.status === "fulfilled" ? talliesRes.value : null,
  });
}
