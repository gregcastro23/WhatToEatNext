/**
 * Agent daily Cosmic Yield.
 *
 * The token economy's "Cosmic Yield" is otherwise opt-in: humans must POST
 * /api/economy/claim-daily, and historical agents only ever earned when the
 * Planetary Agents backend pushed `agents_yield` via /api/economy/sync-credit
 * — a pipeline that has been silent since 2026-06-03, leaving the ledger / Live
 * Network economy surfaces looking dead to new visitors.
 *
 * This service lets a daily cron mint each active, chart-bearing agent's own
 * personalized yield, so the economy feed stays alive and demonstrates the
 * token loop. It reuses the exact same yield engine as human claims
 * (DailyYieldService.claimDailyYield with site="agents" → source_type
 * "agents_yield"), so the economics and idempotency are identical: the daily
 * claim is keyed per (site, agent, day) and a re-run is a no-op.
 *
 * Additive: no formula or human-claim path is changed.
 *
 * @file src/services/agentDailyYield.ts
 */

import { executeQuery } from "@/lib/database";
import { _logger } from "@/lib/logger";
import { dailyYieldService } from "@/services/DailyYieldService";

interface AgentYieldRow {
  id: string;
  email: string | null;
  name: string | null;
  natal_positions: unknown;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function asArray(value: unknown): unknown[] {
  let candidate = value;
  if (typeof candidate === "string") {
    try {
      candidate = JSON.parse(candidate);
    } catch {
      return [];
    }
  }
  return Array.isArray(candidate) ? candidate : [];
}

/**
 * Convert a stored `natal_positions` value (array of `{ planet, sign }`, or a
 * JSON string of one) into the planet → sign map the yield engine expects.
 * Malformed entries are skipped; non-arrays yield `{}`.
 */
export function planetSignsFromNatal(natalPositions: unknown): Record<string, string> {
  const signs: Record<string, string> = {};
  for (const entry of asArray(natalPositions)) {
    if (!isRecord(entry)) continue;
    const planet = typeof entry.planet === "string" ? entry.planet : undefined;
    const sign = typeof entry.sign === "string" ? entry.sign : undefined;
    if (planet && sign) signs[planet] = sign;
  }
  return signs;
}

export interface AgentYieldResult {
  attempted: number;
  credited: number;
  alreadyClaimed: number;
  skipped: number;
  failed: number;
  tokensMinted: number;
}

/**
 * Mint today's Cosmic Yield for the most-recently-active chart-bearing agents.
 *
 * Selects active agents that have a real natal chart (so the yield is
 * personalized, not a uniform fallback), ordered by their latest feed activity
 * so the visibly-active demonstrators earn. Each claim is idempotent per day, so
 * the cron can run repeatedly and back-fill without double-crediting.
 */
export async function runAgentDailyYield(limit = 30): Promise<AgentYieldResult> {
  const result: AgentYieldResult = {
    attempted: 0,
    credited: 0,
    alreadyClaimed: 0,
    skipped: 0,
    failed: 0,
    tokensMinted: 0,
  };

  let rows: AgentYieldRow[] = [];
  try {
    const query = await executeQuery<AgentYieldRow>(
      `SELECT u.id, u.email, up.name, up.natal_positions
         FROM users u
         JOIN user_profiles up ON up.user_id = u.id
         LEFT JOIN LATERAL (
           SELECT max(fe.created_at) AS last_seen
             FROM feed_events fe
            WHERE fe.actor_id = u.id
         ) act ON true
        WHERE COALESCE(u.is_agent, false) = true
          AND COALESCE(u.is_active, true) = true
          AND up.natal_positions IS NOT NULL
          AND up.natal_positions::text NOT IN ('[]', 'null', '{}')
        ORDER BY act.last_seen DESC NULLS LAST
        LIMIT $1`,
      [limit],
    );
    rows = query.rows;
  } catch (error) {
    _logger.error("[agent-yield] agent query failed:", error);
    return result;
  }

  result.attempted = rows.length;
  for (const row of rows) {
    const signs = planetSignsFromNatal(row.natal_positions);
    if (Object.keys(signs).length === 0) {
      result.skipped += 1; // no usable chart → skip rather than mint a uniform yield
      continue;
    }
    try {
      const yieldResult = await dailyYieldService.claimDailyYield(row.id, signs, false, "agents");
      if (yieldResult) {
        result.credited += 1;
        result.tokensMinted += yieldResult.totalTokens;
      } else {
        result.alreadyClaimed += 1;
      }
    } catch (error) {
      result.failed += 1;
      _logger.warn(`[agent-yield] claim failed for ${row.email ?? row.id}:`, error);
    }
  }

  return result;
}
