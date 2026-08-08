/**
 * Debit-path liveness for the Planetary Agents flow.
 *
 * WHY THIS EXISTS
 * ---------------
 * `/api/economy/sync-debit` returned HTTP 500 on 100% of calls for twelve weeks
 * (2026-05-15 → 2026-08-07, ~1,349 calls/day) and nothing noticed. The
 * `agents_operation` ledger simply stopped — 317 rows, then silence, forever —
 * while every dashboard stayed green, because no check asked whether a path
 * that *should* be writing still *was*.
 *
 * WHY LEDGER SILENCE ALONE IS NOT THE SIGNAL
 * ------------------------------------------
 * Silence cannot distinguish "the path is broken" from "nobody called it".
 * Alarming on silence alone flags every naturally-sporadic path; alarming only
 * on paths with an established cadence misses exactly this bug, because
 * sync-debit launched on 05-14 and broke on 05-15 — it never lived long enough
 * to establish one. Both variants were tried against the real history: the
 * first flagged 9 of 13 sources, the second flagged nothing at all.
 *
 * The discriminator is the CONJUNCTION: agent traffic arriving (the producer is
 * alive and calling) while zero debits land (nothing is succeeding). Neither
 * half is meaningful alone.
 *
 * Back-tested over 2026-05-10 → 2026-08-08 in 3-day steps: fires from
 * 2026-05-22 — seven days after the regression, not eighty-four — stays silent
 * on all three genuinely-idle days, and returns OK on live post-fix data.
 */

import { executeQuery } from "@/lib/database/connection";
import { _logger } from "@/lib/logger";

/** OK = debits landing · IDLE = no traffic, nothing expected · INCIDENT = traffic without debits. */
export type DebitPathVerdict = "OK" | "IDLE" | "INCIDENT" | "UNKNOWN";

export interface DebitPathSignals {
  /** Agent-authored feed events in the last 24h — evidence the producer is alive. */
  agentTraffic24h: number;
  /** `agents_operation` ledger rows in the last 24h — evidence debits are landing. */
  debits24h: number;
  /** Age of the most recent debit, ms. Null when the ledger has never been written. */
  lastDebitAgeMs: number | null;
  /** False when the query failed — never fabricate a verdict from missing data. */
  live: boolean;
}

export interface DebitPathHealth {
  verdict: DebitPathVerdict;
  summary: string;
}

/**
 * Pure classifier. Kept free of database imports so it can be tested directly.
 */
export function classifyDebitPath(signals: DebitPathSignals): DebitPathHealth {
  const { agentTraffic24h, debits24h, lastDebitAgeMs, live } = signals;

  if (!live) {
    return { verdict: "UNKNOWN", summary: "No source — debit-path query failed" };
  }

  // No producer traffic means no debit is owed. Silence here is not evidence of
  // breakage, and treating it as such is what makes staleness alarms useless.
  if (agentTraffic24h <= 0) {
    return { verdict: "IDLE", summary: "No agent traffic in 24h — no debits expected" };
  }

  if (debits24h <= 0) {
    const age =
      lastDebitAgeMs === null
        ? "never"
        : `${Math.floor(lastDebitAgeMs / (24 * 60 * 60 * 1000))}d ago`;
    return {
      verdict: "INCIDENT",
      summary:
        `${agentTraffic24h} agent events in 24h but ZERO debits landed ` +
        `(last debit ${age}) — sync-debit is failing silently`,
    };
  }

  return { verdict: "OK", summary: `${debits24h} debits · ${agentTraffic24h} agent events 24h` };
}

/**
 * Reads the two signals. Degrades to `live: false` rather than throwing, so the
 * Planetary Agents flow reports an honest "no source" instead of going green.
 */
export async function fetchDebitPathSignals(): Promise<DebitPathSignals> {
  try {
    const result = await executeQuery<{
      traffic_24h: number;
      debits_24h: number;
      last_debit_age_ms: number | null;
    }>(
      `SELECT
         (SELECT COUNT(*)::int
            FROM feed_events f
            JOIN users u ON f.actor_id = u.id
           WHERE u.is_agent = true
             AND f.created_at > NOW() - INTERVAL '24 hours') AS traffic_24h,
         (SELECT COUNT(*)::int
            FROM token_transactions
           WHERE source_type = 'agents_operation'
             AND created_at > NOW() - INTERVAL '24 hours') AS debits_24h,
         (SELECT (EXTRACT(EPOCH FROM (NOW() - MAX(created_at))) * 1000)::float8
            FROM token_transactions
           WHERE source_type = 'agents_operation') AS last_debit_age_ms`,
    );
    const row = result.rows[0];
    return {
      agentTraffic24h: row?.traffic_24h ?? 0,
      debits24h: row?.debits_24h ?? 0,
      lastDebitAgeMs: row?.last_debit_age_ms ?? null,
      live: true,
    };
  } catch (err) {
    _logger.warn("[systemStatus] debit-path liveness query failed:", err);
    return { agentTraffic24h: 0, debits24h: 0, lastDebitAgeMs: null, live: false };
  }
}
