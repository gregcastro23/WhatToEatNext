/**
 * Server-side assembler for the multiplexed admin overview pulse payload.
 * Shared by GET /api/admin/overview-pulse and GET /api/admin/stream (SSE).
 *
 * @file src/services/admin/overviewPulseService.ts
 */

import { OverviewPulseSchema, type OverviewPulseView } from "@/lib/admin/schemas/overviewPulse";
import { memoize } from "@/lib/cache/memoryCache";
import { getAdminPulse } from "@/services/admin/adminPulseService";
import { readFrictionAlerts, readInteractionTallies } from "@/services/admin/trafficReaders";
import { getLiveActivity } from "@/services/liveActivityService";
import { getSystemStatus } from "@/services/systemStatusService";

export async function buildOverviewPulsePayload(ttlScale = 1): Promise<OverviewPulseView> {
  const scale = Math.max(0.5, ttlScale);
  const [pulseRes, activityRes, statusRes, frictionRes, talliesRes] = await Promise.allSettled([
    memoize("admin:pulse", Math.round(30_000 * scale), () => getAdminPulse()),
    memoize("admin:live-activity", Math.round(10_000 * scale), () => getLiveActivity()),
    memoize("admin:system-status", Math.round(30_000 * scale), () => getSystemStatus()),
    memoize("admin:friction-alerts", Math.round(30_000 * scale), () => readFrictionAlerts()),
    memoize("admin:interaction-tallies:24h", Math.round(60_000 * scale), () =>
      readInteractionTallies("24 hours"),
    ),
  ]);

  return OverviewPulseSchema.parse({
    success: true,
    generatedAt: new Date().toISOString(),
    pulse: pulseRes.status === "fulfilled" ? pulseRes.value : null,
    liveActivity: activityRes.status === "fulfilled" ? activityRes.value : null,
    systemStatus:
      statusRes.status === "fulfilled" ? { success: true, ...statusRes.value } : null,
    frictionAlerts: frictionRes.status === "fulfilled" ? frictionRes.value : null,
    interactionTallies: talliesRes.status === "fulfilled" ? talliesRes.value : null,
  });
}
