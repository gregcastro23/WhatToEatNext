/**
 * Observability Log Prune — cron endpoint
 *
 * Calls `prune_observability_logs(retain_days)` to delete rows older than
 * `retain_days` (default 7) from `request_log_entries` and
 * `slow_query_log_entries`. The pg function is defined in
 * `database/init/39-observability-persistence.sql`.
 *
 * Triggered daily at 03:00 UTC by Vercel cron (see vercel.json). Volume
 * is low right now (low-traffic site, ~hundreds of rows/day), so a single
 * daily sweep is plenty. Revisit if volume grows.
 *
 * Auth: `Authorization: Bearer <CRON_SECRET>` (shared cron auth).
 *
 * @file src/app/api/cron/observability-prune/route.ts
 */

import { NextResponse, type NextRequest } from "next/server";
import { isAuthorizedCron } from "@/app/api/cron/_lib/cronAuth";
import { executeQuery } from "@/lib/database/connection";
import { _logger } from "@/lib/logger";
import { recordCronRun } from "@/services/cronHeartbeatService";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const maxDuration = 30;

const DEFAULT_RETAIN_DAYS = 7;

/**
 * Faucet resonance rows are economy observability, not request logs, and carry
 * their own retention: 180 days covers a full band cycle and lets emission pace
 * be checked against the ~4,380 ESMS/user/year target (ADR-016). Pruned here
 * rather than from a new cron because this sweep already runs daily.
 */
const FAUCET_RESONANCE_RETAIN_DAYS = 180;

/**
 * Separately guarded: this table arrived after the cron did, and a failure to
 * prune analytics must not report the log sweep as failed. Returns 0 rather
 * than throwing so the caller stays a straight line.
 */
/**
 * First-party page views (migration 86). 180 days keeps two full quarters for
 * /admin/traffic comparisons. Same isolation as the faucet prune: a missing
 * table (migration not yet applied) must not fail the log sweep.
 */
const PAGE_VIEWS_RETAIN_DAYS = 180;
const PAGE_VIEWS_BOT_RETAIN_DAYS = 14;
const SYNTHETIC_PROBES_RETAIN_DAYS = 14;
const SYSTEM_METRICS_RETAIN_DAYS = 14;
const HEALTH_SNAPSHOTS_RETAIN_DAYS = 30;
const WEBHOOK_EVENTS_RETAIN_DAYS = 30;
const FEED_EVENTS_RETAIN_DAYS = 60;
const FEED_EVENTS_BATCH_LIMIT = 5000;

interface TelemetryPruneCounts {
  syntheticProbesDeleted: number;
  systemMetricsDeleted: number;
  healthSnapshotsDeleted: number;
  webhookEventsDeleted: number;
}

const ZERO_TELEMETRY_COUNTS: TelemetryPruneCounts = {
  syntheticProbesDeleted: 0,
  systemMetricsDeleted: 0,
  healthSnapshotsDeleted: 0,
  webhookEventsDeleted: 0,
};

async function pruneTelemetryAndWebhooks(): Promise<TelemetryPruneCounts> {
  try {
    const result = await executeQuery<{
      synthetic_probes_deleted: string;
      system_metrics_deleted: string;
      health_snapshots_deleted: string;
      webhook_events_deleted: string;
    }>(
      `SELECT * FROM prune_telemetry_and_webhooks($1, $2, $3, $4)`,
      [
        SYNTHETIC_PROBES_RETAIN_DAYS,
        SYSTEM_METRICS_RETAIN_DAYS,
        HEALTH_SNAPSHOTS_RETAIN_DAYS,
        WEBHOOK_EVENTS_RETAIN_DAYS,
      ],
    );
    const [row] = result.rows;
    const counts: TelemetryPruneCounts = {
      syntheticProbesDeleted: row ? Number(row.synthetic_probes_deleted) : 0,
      systemMetricsDeleted: row ? Number(row.system_metrics_deleted) : 0,
      healthSnapshotsDeleted: row ? Number(row.health_snapshots_deleted) : 0,
      webhookEventsDeleted: row ? Number(row.webhook_events_deleted) : 0,
    };
    _logger.info("[cron/observability-prune] pruned telemetry & webhooks:", {
      ...counts,
      probeRetainDays: SYNTHETIC_PROBES_RETAIN_DAYS,
      metricsRetainDays: SYSTEM_METRICS_RETAIN_DAYS,
      snapshotRetainDays: HEALTH_SNAPSHOTS_RETAIN_DAYS,
      webhookRetainDays: WEBHOOK_EVENTS_RETAIN_DAYS,
    });
    return counts;
  } catch (err) {
    _logger.error("[cron/observability-prune] telemetry & webhook prune failed:", err);
    return { ...ZERO_TELEMETRY_COUNTS };
  }
}

async function pruneFeedEvents(): Promise<number> {
  try {
    const result = await executeQuery<{ feed_events_deleted: string }>(
      `SELECT * FROM prune_feed_events($1, $2)`,
      [FEED_EVENTS_RETAIN_DAYS, FEED_EVENTS_BATCH_LIMIT],
    );
    const deleted = Number(result.rows[0]?.feed_events_deleted ?? 0);
    _logger.info("[cron/observability-prune] pruned feed_events rows:", {
      deleted,
      retainDays: FEED_EVENTS_RETAIN_DAYS,
      batchLimit: FEED_EVENTS_BATCH_LIMIT,
    });
    return deleted;
  } catch (err) {
    _logger.error("[cron/observability-prune] feed_events prune failed:", err);
    return 0;
  }
}

async function prunePageViews(): Promise<number> {
  try {
    let result: { rows: Array<{ page_views_deleted: string }> };
    try {
      result = await executeQuery<{ page_views_deleted: string }>(
        `SELECT * FROM prune_page_views($1, $2)`,
        [PAGE_VIEWS_RETAIN_DAYS, PAGE_VIEWS_BOT_RETAIN_DAYS],
      );
    } catch (err) {
      const pgCode = typeof err === "object" && err !== null && "code" in err ? String(err.code) : "";
      if (pgCode !== "42883") throw err;
      result = await executeQuery<{ page_views_deleted: string }>(
        `SELECT * FROM prune_page_views($1)`,
        [PAGE_VIEWS_RETAIN_DAYS],
      );
    }
    const deleted = Number(result.rows[0]?.page_views_deleted ?? 0);
    _logger.info("[cron/observability-prune] pruned page_views rows:", {
      deleted,
      humanRetainDays: PAGE_VIEWS_RETAIN_DAYS,
      botRetainDays: PAGE_VIEWS_BOT_RETAIN_DAYS,
    });
    return deleted;
  } catch (err) {
    _logger.error("[cron/observability-prune] page views prune failed:", err);
    return 0;
  }
}

async function pruneFaucetResonance(): Promise<number> {
  try {
    const result = await executeQuery<{ faucet_resonance_deleted: string }>(
      `SELECT * FROM prune_faucet_claim_resonance($1)`,
      [FAUCET_RESONANCE_RETAIN_DAYS],
    );
    return Number(result.rows[0]?.faucet_resonance_deleted ?? 0);
  } catch (err) {
    _logger.error("[cron/observability-prune] faucet resonance prune failed:", err);
    return 0;
  }
}

export async function GET(request: NextRequest) {
  if (!isAuthorizedCron(request)) {
    return NextResponse.json(
      { success: false, message: "Unauthorized" },
      { status: 401 },
    );
  }

  // Allow ?retain=N for manual one-off runs (e.g. emergency cleanup).
  const url = new URL(request.url);
  const retainParam = url.searchParams.get("retain");
  let retainDays = DEFAULT_RETAIN_DAYS;
  if (retainParam) {
    const parsed = Number.parseInt(retainParam, 10);
    if (Number.isFinite(parsed) && parsed >= 1 && parsed <= 365) {
      retainDays = parsed;
    }
  }

  const startedAt = new Date();
  try {
    const result = await executeQuery<{
      request_log_deleted: string;
      slow_query_log_deleted: string;
      mcp_invocations_deleted: string | null;
    }>(`SELECT * FROM prune_observability_logs($1)`, [retainDays]);

    // pg returns BIGINT as string — coerce for the JSON response.
    const [row] = result.rows;
    const requestLogDeleted = row ? Number(row.request_log_deleted) : 0;
    const slowQueryLogDeleted = row ? Number(row.slow_query_log_deleted) : 0;
    // mcp_invocations_deleted only present after migration 46 has applied;
    // tolerate older function signatures so a partial-migration deploy
    // doesn't take down the prune cron.
    const mcpInvocationsDeleted = row?.mcp_invocations_deleted != null
      ? Number(row.mcp_invocations_deleted)
      : 0;

    const faucetResonanceDeleted = await pruneFaucetResonance();
    const pageViewsDeleted = await prunePageViews();
    const telemetryCounts = await pruneTelemetryAndWebhooks();
    const feedEventsDeleted = await pruneFeedEvents();

    await recordCronRun("observability-prune", { status: "success", startedAt });
    return NextResponse.json({
      success: true,
      retainDays,
      requestLogDeleted,
      slowQueryLogDeleted,
      mcpInvocationsDeleted,
      faucetResonanceDeleted,
      pageViewsDeleted,
      ...telemetryCounts,
      feedEventsDeleted,
    });
  } catch (err) {
    _logger.error("[cron/observability-prune] failed:", err);
    await recordCronRun("observability-prune", {
      status: "failure",
      startedAt,
      error: err instanceof Error ? err.message : "unknown",
    });
    return NextResponse.json(
      {
        success: false,
        message: err instanceof Error ? err.message : "unknown",
      },
      { status: 500 },
    );
  }
}
