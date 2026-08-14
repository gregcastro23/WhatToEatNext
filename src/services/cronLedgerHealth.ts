/**
 * Liveness for ledger sources written by a SCHEDULED job.
 *
 * WHY ONLY ONE SOURCE IS COVERED HERE
 * -----------------------------------
 * `token_transactions` has 13 `source_type` values. Most cannot be watched
 * honestly, and pretending otherwise is how a monitor becomes noise:
 *
 *   agents_operation   already covered — agentDebitPathHealth
 *   agents_yield       COVERED HERE — daily cron with a DECLARED schedule
 *   initial_grant,
 *   signup_grant       producer is human signups: 14 in six months, and 0 in
 *                      some months. Silence is indistinguishable from "nobody
 *                      signed up", so no threshold can be meaningful.
 *   premium_purchase   one paying user; same sparsity problem
 *   daily_yield,
 *   practice_reward    user-action driven with no independent liveness signal
 *   admin              manual by definition
 *   quest_reward       dormant by design — there is no quest UI
 *   onchain_claim,
 *   transit_attunement testnet / feature-flagged, dormant
 *   test,
 *   planetary_agents_test  fixtures
 *
 * A source qualifies only when something OTHER than the ledger itself says a
 * write was owed. For a cron that is its declared schedule — known a priori
 * from vercel.json, not inferred from the table's own history. That distinction
 * matters: inferring cadence from history is precisely the design that flagged
 * 9 of 13 sources when this approach was first tried.
 *
 * WHY A BATCH, NOT A TIMESTAMP
 * ----------------------------
 * `agents_yield` has TWO writers: the daily cron (`30 0 * * *`, one large batch)
 * and scattered ad-hoc writes. Measured over 21 days, the ad-hoc writes land
 * 8-20 times a day at 1-2 agents each — so "hours since the last yield row"
 * NEVER goes stale, and a staleness check could not detect a dead cron at all.
 *
 * The batch is what must be observed. Back-test over 21 days: the largest
 * single-minute batch was 29-30 agents every single day (56 once), while ad-hoc
 * writes never exceeded 2. A threshold of 10 sits in that gap with a wide
 * margin and needs no calibration.
 */

import { executeQuery } from "@/lib/database/connection";
import { _logger } from "@/lib/logger";

export type CronLedgerVerdict = "OK" | "IDLE" | "INCIDENT" | "UNKNOWN";

export interface CronLedgerSignals {
  /** Largest number of distinct users credited within one minute in 24h. */
  biggestBatch24h: number;
  /** Users who could have been credited. Zero means nothing was owed. */
  eligibleProducers: number;
  /** False when the query failed — never fabricate a verdict from missing data. */
  live: boolean;
}

export interface CronLedgerHealth {
  verdict: CronLedgerVerdict;
  summary: string;
}

/**
 * Minimum distinct users in one minute to count as a cron batch.
 *
 * Measured: healthy runs credit 29-30 agents; the ad-hoc writer never exceeds
 * 2. Anywhere in between works — this is a gap, not a tuned edge.
 */
export const MIN_CRON_BATCH = 10;

/** Pure classifier, free of database imports so it can be tested directly. */
export function classifyCronLedgerPath(signals: CronLedgerSignals): CronLedgerHealth {
  const { biggestBatch24h, eligibleProducers, live } = signals;

  if (!live) {
    return { verdict: "UNKNOWN", summary: "No source — yield-path query failed" };
  }
  if (eligibleProducers <= 0) {
    return { verdict: "IDLE", summary: "No agents eligible for yield — none expected" };
  }
  if (biggestBatch24h < MIN_CRON_BATCH) {
    return {
      verdict: "INCIDENT",
      summary:
        `${eligibleProducers} agents eligible but the largest yield batch in 24h ` +
        `credited only ${biggestBatch24h} — the daily yield cron has not run`,
    };
  }
  return {
    verdict: "OK",
    summary: `daily yield batch credited ${biggestBatch24h} agents · ${eligibleProducers} eligible`,
  };
}

/**
 * Reads the batch signal. Degrades to `live: false` rather than throwing.
 */
export async function fetchCronLedgerSignals(): Promise<CronLedgerSignals> {
  try {
    const result = await executeQuery<{
      biggest_batch: number;
      eligible: number;
    }>(
      `SELECT
         COALESCE((
           SELECT MAX(agents) FROM (
             SELECT COUNT(DISTINCT user_id)::int AS agents
               FROM token_transactions
              WHERE source_type = 'agents_yield'
                AND created_at > NOW() - INTERVAL '24 hours'
              GROUP BY date_trunc('minute', created_at)
           ) runs
         ), 0)::int AS biggest_batch,
         (SELECT COUNT(DISTINCT user_id)::int
            FROM token_transactions
           WHERE source_type = 'agents_yield'
             AND created_at > NOW() - INTERVAL '7 days') AS eligible`,
    );
    const [row] = result.rows;
    return {
      biggestBatch24h: row?.biggest_batch ?? 0,
      eligibleProducers: row?.eligible ?? 0,
      live: true,
    };
  } catch (err) {
    _logger.warn("[systemStatus] cron-ledger liveness query failed:", err);
    return { biggestBatch24h: 0, eligibleProducers: 0, live: false };
  }
}
