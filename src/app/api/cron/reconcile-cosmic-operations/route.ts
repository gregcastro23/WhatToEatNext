/**
 * Automated Stale Cosmic Operations Reconciler — cron & worker endpoint.
 *
 * Sweeps expired open rows (`expires_at < NOW()`) in
 * `cosmic_generation_operations`, refunds verified ledger debits via
 * `FOR UPDATE SKIP LOCKED`, records a heartbeat row in
 * `synthetic_probe_results` (`cron:reconcile-cosmic-operations`), and emits an
 * `alert_events` warning only when unprovable debits remain parked in
 * `refund_pending`.
 *
 * Auth: `Authorization: Bearer <CRON_SECRET>`
 */
import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { isAuthorizedCron } from "@/app/api/cron/_lib/cronAuth";
import {
  reconcileExpiredCosmicOperations,
  recordAutomatedCosmicReconcileRun,
  type ReconcileCosmicOperationsResult,
} from "@/lib/cooking/cosmicOperationReconciler";
import { executeQuery } from "@/lib/database/connection";
import { _logger } from "@/lib/logger";
import { recordCronRun } from "@/services/cronHeartbeatService";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const maxDuration = 60;

const CronSweepBodySchema = z.object({
  limit: z.number().int().min(1).max(100).optional(),
  dryRun: z.boolean().optional(),
});

async function persistPendingRefundAlert(params: {
  scanned: number;
  refundedCount: number;
  failedCount: number;
  pendingKeys: string[];
}): Promise<void> {
  if (params.pendingKeys.length === 0) return;
  const title = `Cosmic generation reconciler: ${params.pendingKeys.length} operation(s) parked in refund_pending`;
  const message =
    `scanned=${params.scanned}, refunded=${params.refundedCount}, failed=${params.failedCount}, ` +
    `refundPending=${params.pendingKeys.join(",")}. Inspect via /admin CosmicOperationsPanel.`;
  try {
    await executeQuery(
      `INSERT INTO alert_events
         (component, previous_status, current_status, severity, title, message)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      ["reconcile-cosmic-operations", "OK", "DEGRADED", "warn", title, message],
    );
  } catch (err) {
    _logger.warn("[cron/reconcile-cosmic-operations] failed to persist alert:", err);
  }
}

function summarizeOutcomes(result: ReconcileCosmicOperationsResult): {
  refundedCount: number;
  failedCount: number;
  pendingKeys: string[];
} {
  let refundedCount = 0;
  let failedCount = 0;
  const pendingKeys: string[] = [];
  for (const item of result.outcomes) {
    if (item.nextStatus === "refunded") refundedCount += 1;
    else if (item.nextStatus === "failed") failedCount += 1;
    else pendingKeys.push(item.operationKey);
  }
  return { refundedCount, failedCount, pendingKeys };
}

async function handleCronFailure(startedAt: Date, err: unknown): Promise<Response> {
  const message = err instanceof Error ? err.message : "unknown";
  _logger.error("[cron/reconcile-cosmic-operations] failed:", err);
  recordAutomatedCosmicReconcileRun({
    startedAt: startedAt.toISOString(),
    status: "failure",
    scanned: 0,
    refundedCount: 0,
    failedCount: 0,
    pendingCount: 0,
  });
  await recordCronRun("reconcile-cosmic-operations", {
    status: "failure",
    startedAt,
    error: message,
  });
  return NextResponse.json({ success: false, message }, { status: 500 });
}

async function runReconciliationCron(options?: {
  limit?: number;
  dryRun?: boolean;
}): Promise<Response> {
  const startedAt = new Date();
  try {
    const result = await reconcileExpiredCosmicOperations(options);
    const { refundedCount, failedCount, pendingKeys } = summarizeOutcomes(result);
    const details = {
      dryRun: result.dryRun,
      scanned: result.scanned,
      refundedCount,
      failedCount,
      pendingCount: pendingKeys.length,
    };
    recordAutomatedCosmicReconcileRun({
      startedAt: startedAt.toISOString(),
      status: "success",
      scanned: result.scanned,
      refundedCount,
      failedCount,
      pendingCount: pendingKeys.length,
    });
    await persistPendingRefundAlert({
      scanned: result.scanned,
      refundedCount,
      failedCount,
      pendingKeys,
    });
    await recordCronRun("reconcile-cosmic-operations", {
      status: "success",
      startedAt,
      details,
    });
    return NextResponse.json({
      success: true,
      ...details,
      outcomes: result.outcomes,
    });
  } catch (err) {
    return handleCronFailure(startedAt, err);
  }
}

export async function GET(request: NextRequest): Promise<Response> {
  if (!isAuthorizedCron(request)) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }
  return runReconciliationCron();
}

export async function POST(request: NextRequest): Promise<Response> {
  if (!isAuthorizedCron(request)) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }
  const rawBody: unknown = await request.json().catch(() => ({}));
  const parsed = CronSweepBodySchema.safeParse(rawBody);
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, message: "Invalid request body" },
      { status: 400 },
    );
  }
  return runReconciliationCron({
    ...(parsed.data.limit !== undefined ? { limit: parsed.data.limit } : {}),
    ...(parsed.data.dryRun !== undefined ? { dryRun: parsed.data.dryRun } : {}),
  });
}
