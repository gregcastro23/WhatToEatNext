/**
 * System Health Snapshot — cron endpoint
 *
 * Triggered hourly by Vercel cron (see vercel.json). Resolves the
 * current SystemStatusPayload, writes it to `system_health_snapshots`,
 * and dispatches operator alerts for any status transition since the
 * previous snapshot.
 *
 * Auth: `Authorization: Bearer <CRON_SECRET>` (Vercel cron header).
 *
 * Required env vars:
 *   - CRON_SECRET — protects this endpoint
 *   - ALERT_SLACK_WEBHOOK_URL — optional; alerts skip Slack when unset
 *   - RESEND_API_KEY or SMTP_* — optional; alerts skip email when unset
 *   - AUTH_ADMIN_EMAIL — recipient list for alert emails
 *
 * @file src/app/api/cron/system-health-snapshot/route.ts
 */

import { NextResponse, type NextRequest } from "next/server";
import { _logger } from "@/lib/logger";
import { dispatchTransitions } from "@/services/alertService";
import {
  getLatestSnapshot,
  writeSnapshot,
} from "@/services/healthSnapshotService";
import { getSystemStatus } from "@/services/systemStatusService";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const maxDuration = 60;

function isAuthorized(request: NextRequest): boolean {
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) return false;
  const header = request.headers.get("authorization") ?? "";
  if (header.length !== `Bearer ${cronSecret}`.length) return false;
  return header === `Bearer ${cronSecret}`;
}

export async function GET(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json(
      { success: false, message: "Unauthorized" },
      { status: 401 },
    );
  }

  try {
    const previous = await getLatestSnapshot();
    const current = await getSystemStatus();
    const snapshotId = await writeSnapshot(current);
    const alerts = await dispatchTransitions(previous?.payload ?? null, current, {
      snapshotId,
    });

    return NextResponse.json({
      success: true,
      snapshotId,
      overall: current.overall,
      previousOverall: previous?.overall ?? null,
      alertsDispatched: alerts.length,
      alerts: alerts.map((a) => ({
        id: a.id,
        component: a.component,
        previous: a.previous,
        current: a.current,
        severity: a.severity,
        slack: a.dispatch.slack?.ok ?? null,
        email: a.dispatch.email?.ok ?? null,
      })),
    });
  } catch (err) {
    _logger.error("[cron/system-health-snapshot] failed:", err);
    return NextResponse.json(
      {
        success: false,
        message: err instanceof Error ? err.message : "unknown",
      },
      { status: 500 },
    );
  }
}
