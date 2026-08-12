/**
 * ESMS Restaurant Settlement Reconciliation — cron endpoint
 *
 * Cross-checks the off-chain ESMS ledger against Stripe transfers so token
 * debits and restaurant payouts can't silently drift. It surfaces:
 *
 *   - stuck: orders whose ESMS was debited but the Stripe transfer was never
 *     confirmed (status=settlement_pending / transfer_status=retry_required).
 *     Each is probed against Stripe to classify it as `retryable` (a transfer
 *     actually exists — mark paid via the admin retry action) or `refundable`
 *     (no transfer — safe to refund the ESMS).
 *   - paidWithoutTransfer: orders marked paid_with_esms but missing a
 *     stripe_transfer_id (record drift).
 *   - orphanDebits: restaurant_order token debits with no order-intent row.
 *   - daily token totals redeemed vs refunded (sanity signal).
 *
 * Findings are logged for operators; the JSON summary is returned for the
 * caller / admin dashboards. Resolution happens via the authenticated
 * operator endpoint at /api/admin/restaurants/settlement.
 *
 * Auth: `Authorization: Bearer <CRON_SECRET>` (shared cron auth).
 *
 * @file src/app/api/cron/esms-reconciliation/route.ts
 */

import { NextResponse, type NextRequest } from "next/server";
import { isAuthorizedCron } from "@/app/api/cron/_lib/cronAuth";
import { executeQuery } from "@/lib/database/connection";
import { _logger } from "@/lib/logger";
import { getStripe } from "@/lib/stripe/stripe";
import { recordCronRun } from "@/services/cronHeartbeatService";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const maxDuration = 60;

// Cap the per-run Stripe probes so a backlog can't blow the function budget.
const MAX_STRIPE_PROBES = 50;

interface StuckOrder {
  id: string;
  status: string;
  payment_status: string | null;
  transfer_status: string | null;
  stripe_transfer_id: string | null;
  created_at: string;
}

/**
 * Persist the run's findings to alert_events so they outlive the JSON
 * response — getRecentAlerts reads that table for the IncidentsPanel. A
 * clean run records an info row (OK→OK audit trail); record drift records
 * warn (OK→DEGRADED). Same column conventions as alertService's
 * persistAlertEvent; the dispatch column keeps its '{}' default because no
 * Slack/email sink ran for this row.
 */
async function persistReconciliationSummary(summary: {
  stuckCount: number;
  retryable: string[];
  refundable: string[];
  probeErrors: number;
  paidWithoutTransfer: string[];
  orphanDebits: string[];
  tokensRedeemedToday: number;
  tokensRefundedToday: number;
}): Promise<void> {
  const drifted =
    summary.orphanDebits.length > 0 || summary.paidWithoutTransfer.length > 0;
  const title = drifted
    ? `ESMS settlement drift: ${summary.orphanDebits.length} orphan debit(s), ${summary.paidWithoutTransfer.length} paid-without-transfer`
    : "ESMS settlement reconciliation clean";
  const message =
    `stuck=${summary.stuckCount} (retryable=${summary.retryable.length}, ` +
    `refundable=${summary.refundable.length}, probeErrors=${summary.probeErrors}); ` +
    `paidWithoutTransfer=${summary.paidWithoutTransfer.length}; ` +
    `orphanDebits=${summary.orphanDebits.length}; ` +
    `tokens today: redeemed=${summary.tokensRedeemedToday}, refunded=${summary.tokensRefundedToday}. ` +
    "Resolve via /admin/settlements.";
  try {
    await executeQuery(
      `INSERT INTO alert_events
         (component, previous_status, current_status, severity, title, message)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [
        "esms-reconciliation",
        "OK",
        drifted ? "DEGRADED" : "OK",
        drifted ? "warn" : "info",
        title,
        message,
      ],
    );
  } catch (err) {
    _logger.warn(
      "[cron/esms-reconciliation] failed to persist summary alert:",
      err,
    );
  }
}

export async function GET(request: NextRequest) {
  if (!isAuthorizedCron(request)) {
    return NextResponse.json(
      { success: false, message: "Unauthorized" },
      { status: 401 },
    );
  }

  const startedAt = new Date();
  try {
    const [stuckRes, paidNoTransferRes, orphanRes, redeemedRes, refundedRes] =
      await Promise.all([
        executeQuery<StuckOrder>(
          `SELECT id, status, payment_status, transfer_status,
                  stripe_transfer_id, created_at
           FROM restaurant_order_intents
           WHERE status = 'settlement_pending'
              OR transfer_status = 'retry_required'
           ORDER BY created_at DESC
           LIMIT 200`,
        ),
        executeQuery<{ id: string }>(
          `SELECT id FROM restaurant_order_intents
           WHERE payment_status = 'paid_with_esms'
             AND stripe_transfer_id IS NULL
           LIMIT 200`,
        ),
        executeQuery<{ source_id: string }>(
          `SELECT DISTINCT tt.source_id
           FROM token_transactions tt
           LEFT JOIN restaurant_order_intents r ON r.id = tt.source_id
           WHERE tt.source_type = 'restaurant_order'
             AND tt.amount < 0
             AND tt.created_at >= now() - interval '7 days'
             AND r.id IS NULL
           LIMIT 200`,
        ),
        executeQuery<{ total: string }>(
          `SELECT COALESCE(SUM(-amount), 0) AS total
           FROM token_transactions
           WHERE source_type = 'restaurant_order'
             AND amount < 0
             AND created_at >= date_trunc('day', now())`,
        ),
        executeQuery<{ total: string }>(
          `SELECT COALESCE(SUM(amount), 0) AS total
           FROM token_transactions
           WHERE source_type = 'restaurant_refund'
             AND amount > 0
             AND created_at >= date_trunc('day', now())`,
        ),
      ]);

    const stuck = stuckRes.rows;
    const stripe = getStripe();

    // Probe Stripe (bounded) to classify each stuck order.
    const probeTargets = stuck.slice(0, MAX_STRIPE_PROBES);
    const retryable: string[] = [];
    const refundable: string[] = [];
    let probeErrors = 0;

    for (const order of probeTargets) {
      try {
        const transfers = await stripe.transfers.list({
          transfer_group: `restaurant_order_${order.id}`,
          limit: 1,
        });
        if (transfers.data.length > 0) {
          retryable.push(order.id);
        } else {
          refundable.push(order.id);
        }
      } catch (error) {
        probeErrors += 1;
        _logger.warn(
          `[cron/esms-reconciliation] Stripe probe failed for ${order.id}:`,
          error instanceof Error ? error.message : error,
        );
      }
    }

    const summary = {
      stuckCount: stuck.length,
      probed: probeTargets.length,
      unprobed: Math.max(stuck.length - probeTargets.length, 0),
      retryable,
      refundable,
      probeErrors,
      paidWithoutTransfer: paidNoTransferRes.rows.map((r) => r.id),
      orphanDebits: orphanRes.rows.map((r) => r.source_id),
      tokensRedeemedToday: Number(redeemedRes.rows[0]?.total) || 0,
      tokensRefundedToday: Number(refundedRes.rows[0]?.total) || 0,
    };

    const driftDetected =
      summary.stuckCount > 0 ||
      summary.paidWithoutTransfer.length > 0 ||
      summary.orphanDebits.length > 0;

    if (driftDetected) {
      _logger.warn(
        "[cron/esms-reconciliation] settlement drift detected",
        summary,
      );
    }

    await persistReconciliationSummary(summary);
    await recordCronRun("esms-reconciliation", {
      status: "success",
      startedAt,
    });
    return NextResponse.json({ success: true, driftDetected, ...summary });
  } catch (err) {
    _logger.error("[cron/esms-reconciliation] failed:", err);
    await recordCronRun("esms-reconciliation", {
      status: "failure",
      startedAt,
      error: err instanceof Error ? err.message : "unknown",
    });
    return NextResponse.json(
      { success: false, message: err instanceof Error ? err.message : "unknown" },
      { status: 500 },
    );
  }
}
