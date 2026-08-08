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

/**
 * Where the "producer is alive" half came from.
 *
 * `sync-debit-calls` is the real thing: durable, per-request, status-bearing.
 * `agent-feed-events` is the proxy this check launched with, kept as a fallback
 * because request_log_entries only began covering this route when instrumentation
 * shipped, and its retention is 7 days. Switching outright would make the check
 * read zero traffic on a healthy system and silently downgrade itself to IDLE —
 * a regression that looks exactly like success.
 */
export type TrafficSource = "sync-debit-calls" | "agent-feed-events";

export interface DebitPathSignals {
  /** Calls (or agent feed events — see trafficSource) in 24h; the producer-alive half. */
  agentTraffic24h: number;
  /** Which measurement the traffic figure came from. */
  trafficSource?: TrafficSource;
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

  // Name the measurement in the summary. Reading "412 agent events" when the
  // figure is actually sync-debit calls would send the next reader to the wrong
  // table, and the two can legitimately disagree.
  const unit =
    signals.trafficSource === "sync-debit-calls" ? "sync-debit calls" : "agent events";

  if (debits24h <= 0) {
    const age =
      lastDebitAgeMs === null
        ? "never"
        : `${Math.floor(lastDebitAgeMs / (24 * 60 * 60 * 1000))}d ago`;
    return {
      verdict: "INCIDENT",
      summary:
        `${agentTraffic24h} ${unit} in 24h but ZERO debits landed ` +
        `(last debit ${age}) — sync-debit is failing silently`,
    };
  }

  return { verdict: "OK", summary: `${debits24h} debits · ${agentTraffic24h} ${unit} 24h` };
}

/**
 * Reads the two signals. Degrades to `live: false` rather than throwing, so the
 * Planetary Agents flow reports an honest "no source" instead of going green.
 */
export async function fetchDebitPathSignals(): Promise<DebitPathSignals> {
  try {
    const result = await executeQuery<{
      calls_24h: number;
      traffic_24h: number;
      debits_24h: number;
      last_debit_age_ms: number | null;
    }>(
      `SELECT
         (SELECT COUNT(*)::int
            FROM request_log_entries
           WHERE path = '/api/economy/sync-debit'
             AND at > NOW() - INTERVAL '24 hours') AS calls_24h,
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
    // Prefer the real call count; fall back to the feed-event proxy while the
    // request log has nothing for this route. The fallback is not belt-and-
    // braces — request_log_entries began covering sync-debit only when
    // instrumentation shipped and keeps 7 days, so a hard switch would report
    // zero traffic on a perfectly healthy system and quietly go IDLE.
    const calls = row?.calls_24h ?? 0;
    const useCalls = calls > 0;
    return {
      agentTraffic24h: useCalls ? calls : (row?.traffic_24h ?? 0),
      trafficSource: useCalls ? "sync-debit-calls" : "agent-feed-events",
      debits24h: row?.debits_24h ?? 0,
      lastDebitAgeMs: row?.last_debit_age_ms ?? null,
      live: true,
    };
  } catch (err) {
    _logger.warn("[systemStatus] debit-path liveness query failed:", err);
    return {
      agentTraffic24h: 0,
      trafficSource: "agent-feed-events",
      debits24h: 0,
      lastDebitAgeMs: null,
      live: false,
    };
  }
}
