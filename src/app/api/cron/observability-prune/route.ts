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

    await recordCronRun("observability-prune", { status: "success", startedAt });
    return NextResponse.json({
      success: true,
      retainDays,
      requestLogDeleted,
      slowQueryLogDeleted,
      mcpInvocationsDeleted,
      faucetResonanceDeleted,
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
