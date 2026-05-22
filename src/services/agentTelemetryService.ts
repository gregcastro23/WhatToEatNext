/**
 * Agent Network Telemetry Service
 *
 * Computes the live metaphysical telemetry surfaced on the admin Planetary
 * Agents panel. Replaces the seeded `meta.mockedTelemetry` fixture with real
 * sources:
 *
 *   - transmutationRate  agent feed_events recorded in the last hour (DB)
 *   - spiritualEntropy   normalized Shannon entropy of the trailing-24h
 *                        event-type mix (DB) — 0 = a single ordered stream,
 *                        1 = activity spread evenly across every event type
 *   - agentHarmony       elemental balance of the live sky (ephemeris) —
 *                        1 = Fire/Water/Earth/Air are perfectly even
 *
 * Each metric degrades independently: a failed source yields `live: false`
 * with a neutral value so the dashboard never hard-fails.
 */

import { executeQuery } from "@/lib/database/connection";
import { _logger } from "@/lib/logger";
import { aggregateZodiacElementals } from "@/utils/planetaryAlchemyMapping";
import { getCurrentPlanetaryPositionsServer } from "@/utils/serverPlanetaryCalculations";

export interface TelemetryMetric {
  /** Display-formatted value, e.g. "62.4%", "12 /hr", "0.43". */
  value: string;
  /** Raw numeric value behind the formatted string. */
  raw: number;
  /** true when computed from a real source; false when degraded to fallback. */
  live: boolean;
  /** Which real source feeds this metric. */
  source: "database" | "ephemeris";
}

export interface AgentNetworkTelemetry {
  agentHarmony: TelemetryMetric;
  transmutationRate: TelemetryMetric;
  spiritualEntropy: TelemetryMetric;
  generatedAt: string;
  /** true only when every metric resolved from its live source. */
  allLive: boolean;
}

/**
 * Normalized Shannon entropy (Pielou evenness) of a set of category counts.
 * Returns 0..1: 0 when one category dominates, 1 when counts are uniform.
 */
function normalizedShannonEntropy(counts: number[]): number {
  const positive = counts.filter((c) => c > 0);
  const total = positive.reduce((sum, c) => sum + c, 0);
  if (total === 0 || positive.length < 2) return 0;

  let entropy = 0;
  for (const count of positive) {
    const p = count / total;
    entropy -= p * Math.log(p);
  }
  return entropy / Math.log(positive.length);
}

/**
 * DB-backed metrics: agent feed-event rate and event-type entropy.
 * A single grouped query covers both the trailing hour and the trailing day.
 */
async function getFeedActivityTelemetry(): Promise<{
  transmutationRate: number;
  spiritualEntropy: number;
  live: boolean;
}> {
  try {
    const result = await executeQuery(
      `SELECT
         f.event_type,
         COUNT(*)::int AS total,
         COUNT(*) FILTER (WHERE f.created_at > NOW() - INTERVAL '1 hour')::int AS last_hour
       FROM feed_events f
       JOIN users u ON f.actor_id = u.id
       WHERE u.is_agent = true
         AND f.created_at > NOW() - INTERVAL '24 hours'
       GROUP BY f.event_type`,
    );

    const rows = result.rows as Array<{ total: number; last_hour: number }>;
    const transmutationRate = rows.reduce((sum, r) => sum + (r.last_hour || 0), 0);
    const spiritualEntropy = normalizedShannonEntropy(rows.map((r) => r.total || 0));

    return { transmutationRate, spiritualEntropy, live: true };
  } catch (error) {
    _logger.error("[agentTelemetry] feed activity aggregation failed:", error);
    return { transmutationRate: 0, spiritualEntropy: 0, live: false };
  }
}

/**
 * Ephemeris-backed metric: elemental balance of the current sky. Harmony is
 * 1 minus the normalized L1 deviation from a perfectly even Fire/Water/Earth/Air
 * split (max possible L1 deviation from uniform is 1.5).
 */
async function getAgentHarmony(): Promise<{ raw: number; live: boolean }> {
  try {
    const positions = await getCurrentPlanetaryPositionsServer();

    const signByPlanet: Record<string, string> = {};
    for (const [planet, position] of Object.entries(positions)) {
      const sign = position?.sign;
      if (typeof sign === "string" && sign.length > 0) {
        // serverPlanetaryCalculations emits lowercase signs; ZODIAC_ELEMENTS
        // is keyed by capitalized sign names.
        signByPlanet[planet] =
          sign.charAt(0).toUpperCase() + sign.slice(1).toLowerCase();
      }
    }

    if (Object.keys(signByPlanet).length === 0) {
      return { raw: 0.5, live: false };
    }

    const elements = aggregateZodiacElementals(signByPlanet);
    const values = [elements.Fire, elements.Water, elements.Earth, elements.Air];
    const deviation = values.reduce((sum, v) => sum + Math.abs(v - 0.25), 0);
    const harmony = Math.max(0, Math.min(1, 1 - deviation / 1.5));

    return { raw: harmony, live: true };
  } catch (error) {
    _logger.error("[agentTelemetry] agent harmony ephemeris calc failed:", error);
    return { raw: 0.5, live: false };
  }
}

/**
 * Resolve the full live telemetry block for the admin Planetary Agents panel.
 * Never rejects — failed sources surface as degraded (`live: false`) metrics.
 */
export async function getAgentNetworkTelemetry(): Promise<AgentNetworkTelemetry> {
  const [feed, harmony] = await Promise.all([
    getFeedActivityTelemetry(),
    getAgentHarmony(),
  ]);

  const agentHarmony: TelemetryMetric = {
    value: `${(harmony.raw * 100).toFixed(1)}%`,
    raw: harmony.raw,
    live: harmony.live,
    source: "ephemeris",
  };
  const transmutationRate: TelemetryMetric = {
    value: `${feed.transmutationRate} /hr`,
    raw: feed.transmutationRate,
    live: feed.live,
    source: "database",
  };
  const spiritualEntropy: TelemetryMetric = {
    value: feed.spiritualEntropy.toFixed(2),
    raw: feed.spiritualEntropy,
    live: feed.live,
    source: "database",
  };

  return {
    agentHarmony,
    transmutationRate,
    spiritualEntropy,
    generatedAt: new Date().toISOString(),
    allLive: agentHarmony.live && transmutationRate.live && spiritualEntropy.live,
  };
}
