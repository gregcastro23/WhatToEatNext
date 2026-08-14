/**
 * Credit-path liveness for the PA→WTEN sync bridge.
 *
 * WHY THIS EXISTS
 * ---------------
 * `/api/economy/sync-credit` is the ONLY bridge by which Planetary Agents
 * credits land in this ledger (daily yield pushes, Sky Drops). Its sibling,
 * sync-debit, returned HTTP 500 on 100% of calls for twelve weeks and nothing
 * noticed — every dashboard stayed green because no check asked whether a path
 * that *should* be writing still *was*. This module is the same conjunction
 * check (see agentDebitPathHealth) pointed at the opposite direction.
 *
 * Two failure shapes must both be caught:
 *   1. Traffic-with-zero-rows — PA is calling but nothing lands (the route is
 *      failing silently; the historic 12-week incident). → INCIDENT.
 *   2. Zero-traffic-when-previously-active — the route is fine but PA stopped
 *      pushing. Unlike sync-debit at launch, this bridge HAS an established
 *      cadence (daily yield lands every UTC day), so silence after activity is
 *      a real signal here, not sporadic-path noise. → STALLED.
 *
 * WHY THE LEDGER HALF FILTERS ON description, NOT source_type
 * -----------------------------------------------------------
 * Bridge credits land as source_type 'agents_yield' (the default) — but so do
 * the in-repo cron's rows (DailyYieldService). Counting by source_type would
 * let the cron keep the counter warm while the bridge 500s, masking exactly
 * the incident this check exists to catch. The route is the sole writer of
 * `description = 'Sync: <source>'` (sync-credit/route.ts §5), so that prefix
 * is the discriminator for rows the BRIDGE landed.
 */

import { executeQuery } from "@/lib/database/connection";
import { _logger } from "@/lib/logger";

/**
 * OK = bridge credits landing · IDLE = no traffic, none before either ·
 * STALLED = no traffic but the bridge was active in the prior 7d ·
 * INCIDENT = traffic without credits.
 */
export type CreditPathVerdict =
  | "OK"
  | "IDLE"
  | "STALLED"
  | "INCIDENT"
  | "UNKNOWN";

export interface CreditPathSignals {
  /** sync-credit calls in 24h (request_log_entries) — the producer-alive half. */
  calls24h: number;
  /** Bridge-written ledger rows in 24h — evidence credits are landing. */
  credits24h: number;
  /**
   * Age of the most recent bridge credit, ms. Bounded to the last 7 days so
   * the lookup rides idx_token_txn_created; null = none inside that window.
   */
  lastCreditAgeMs: number | null;
  /** Calls in the prior window (7d → 24h ago) — request-log retention is 7d. */
  priorCalls7d: number;
  /** Bridge credits in the prior window (7d → 24h ago). */
  priorCredits7d: number;
  /** False when the query failed — never fabricate a verdict from missing data. */
  live: boolean;
}

export interface CreditPathHealth {
  verdict: CreditPathVerdict;
  summary: string;
}

/**
 * Pure classifier. Kept free of database imports so it can be tested directly.
 */
export function classifyCreditPath(
  signals: CreditPathSignals,
): CreditPathHealth {
  const { calls24h, credits24h, lastCreditAgeMs, priorCalls7d, priorCredits7d, live } =
    signals;

  if (!live) {
    return {
      verdict: "UNKNOWN",
      summary: "No source — credit-path query failed",
    };
  }

  // Credits landing is the ground truth. Calls can read 0 while rows land
  // (request-log gaps); the economy is still healthy, so say OK.
  if (credits24h > 0) {
    return {
      verdict: "OK",
      summary: `${credits24h} credits · ${calls24h} sync-credit calls 24h`,
    };
  }

  if (calls24h > 0) {
    const age =
      lastCreditAgeMs === null
        ? "none in 7d"
        : `${Math.floor(lastCreditAgeMs / (24 * 60 * 60 * 1000))}d ago`;
    return {
      verdict: "INCIDENT",
      summary:
        `${calls24h} sync-credit calls in 24h but ZERO credits landed ` +
        `(last credit ${age}) — sync-credit is failing silently`,
    };
  }

  // No traffic today, but the bridge was alive in the prior 7 days — the
  // producer stopped calling. Daily yield makes this a cadence break, not
  // ordinary quiet.
  if (priorCalls7d > 0 || priorCredits7d > 0) {
    return {
      verdict: "STALLED",
      summary:
        "No sync-credit traffic in 24h but the bridge was active in the prior 7d — PA may have stopped pushing",
    };
  }

  return {
    verdict: "IDLE",
    summary: "No sync-credit traffic in 7d — no credits expected",
  };
}

/**
 * Reads the signals. Degrades to `live: false` rather than throwing, so the
 * Planetary Agents flow reports an honest "no source" instead of going green.
 */
export async function fetchCreditPathSignals(): Promise<CreditPathSignals> {
  try {
    const result = await executeQuery<{
      calls_24h: number;
      credits_24h: number;
      last_credit_age_ms: number | null;
      prior_calls_7d: number;
      prior_credits_7d: number;
    }>(
      `SELECT
         (SELECT COUNT(*)::int
            FROM request_log_entries
           WHERE path = '/api/economy/sync-credit'
             AND at > NOW() - INTERVAL '24 hours') AS calls_24h,
         (SELECT COUNT(*)::int
            FROM request_log_entries
           WHERE path = '/api/economy/sync-credit'
             AND at <= NOW() - INTERVAL '24 hours'
             AND at > NOW() - INTERVAL '7 days') AS prior_calls_7d,
         (SELECT COUNT(*)::int
            FROM token_transactions
           WHERE description LIKE 'Sync: %'
             AND created_at > NOW() - INTERVAL '24 hours') AS credits_24h,
         (SELECT COUNT(*)::int
            FROM token_transactions
           WHERE description LIKE 'Sync: %'
             AND created_at <= NOW() - INTERVAL '24 hours'
             AND created_at > NOW() - INTERVAL '7 days') AS prior_credits_7d,
         (SELECT (EXTRACT(EPOCH FROM (NOW() - MAX(created_at))) * 1000)::float8
            FROM token_transactions
           WHERE description LIKE 'Sync: %'
             AND created_at > NOW() - INTERVAL '7 days') AS last_credit_age_ms`,
    );
    const [row] = result.rows;
    return {
      calls24h: row?.calls_24h ?? 0,
      credits24h: row?.credits_24h ?? 0,
      lastCreditAgeMs: row?.last_credit_age_ms ?? null,
      priorCalls7d: row?.prior_calls_7d ?? 0,
      priorCredits7d: row?.prior_credits_7d ?? 0,
      live: true,
    };
  } catch (err) {
    _logger.warn("[systemStatus] credit-path liveness query failed:", err);
    return {
      calls24h: 0,
      credits24h: 0,
      lastCreditAgeMs: null,
      priorCalls7d: 0,
      priorCredits7d: 0,
      live: false,
    };
  }
}
