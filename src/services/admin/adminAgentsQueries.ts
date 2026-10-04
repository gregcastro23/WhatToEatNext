/**
 * Database and probe queries for Admin Agents Dashboard
 *
 * @file src/services/admin/adminAgentsQueries.ts
 */

import { getRecipePipelineTelemetryStats } from "@/lib/cooking/recipePipelineTelemetry";
import { executeQuery } from "@/lib/database/connection";
import { _logger } from "@/lib/logger";
import { getServiceUrlSafe } from "@/lib/serviceUrls";
import {
  asolContractProbe,
  type AsolContractProbeReport,
} from "@/services/asolContractProbeService";
import { getCronHeartbeats } from "@/services/cronHeartbeatService";
import {
  MONITORED_AGENT_ACTIONS,
  type AgentActionMetric,
  type AgentCronHeartbeat,
  type AgentRosterStats,
  type ContractProbeSummary,
  type RecipePipelineOutcomes,
  type ServiceReachability,
} from "./adminAgentsTypes";

export async function probeService(
  key: "planetaryAgentsApi" | "agentsUi",
  subPath: string,
  fetchFn: typeof fetch = fetch,
): Promise<ServiceReachability> {
  const url = getServiceUrlSafe(key);
  const fullUrl = subPath ? `${url}${subPath}` : url;
  const label = key === "planetaryAgentsApi" ? "Alchemy Agents API" : "Alchemy Agents UI";
  const start = Date.now();

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 3_000);
    const headers: Record<string, string> = { Accept: "application/json" };
    if (process.env.INTERNAL_API_SECRET) {
      headers.Authorization = `Bearer ${process.env.INTERNAL_API_SECRET}`;
    }

    const res = await fetchFn(fullUrl, {
      method: "GET",
      headers,
      signal: controller.signal,
    });
    clearTimeout(timer);

    return {
      key,
      label,
      url: fullUrl,
      reachable: res.status < 500,
      statusCode: res.status,
      latencyMs: Date.now() - start,
      checkedAt: new Date().toISOString(),
    };
  } catch (err) {
    _logger.error(`[adminAgentsService] ${key} probe failed:`, err);
    return {
      key,
      label,
      url: fullUrl,
      reachable: false,
      statusCode: null,
      latencyMs: null,
      error: err instanceof Error ? err.message : String(err),
      checkedAt: new Date().toISOString(),
    };
  }
}

export async function getAgentRosterStats(): Promise<AgentRosterStats> {
  try {
    const result = await executeQuery<{
      total_agents: number;
      active_agents: number;
    }>(
      `SELECT
         COUNT(*)::int AS total_agents,
         COUNT(*) FILTER (WHERE last_login > NOW() - INTERVAL '24 hours')::int AS active_agents
       FROM users
       WHERE is_agent = true`,
    );
    const [row] = result.rows;
    return {
      totalAgents: Number(row?.total_agents ?? 0),
      activeAgents24h: Number(row?.active_agents ?? 0),
      live: true,
    };
  } catch (err) {
    _logger.error("[adminAgentsService] agent roster query failed:", err);
    return { totalAgents: 0, activeAgents24h: 0, live: false };
  }
}

interface ActionMetricRow {
  path: string;
  total: number;
  successes: number;
  failures: number;
  server_failures: number;
  p50_ms: number | null;
  p95_ms: number | null;
  last_seen: Date | string | null;
}

export async function getActionMetrics(): Promise<AgentActionMetric[]> {
  const paths = MONITORED_AGENT_ACTIONS.map((a) => a.path);
  const metricsMap = new Map<string, ActionMetricRow>();

  try {
    const result = await executeQuery<ActionMetricRow>(
      `SELECT
         path,
         COUNT(*)::int AS total,
         COUNT(*) FILTER (WHERE status >= 200 AND status < 400)::int AS successes,
         COUNT(*) FILTER (WHERE status >= 400)::int AS failures,
         COUNT(*) FILTER (WHERE status >= 500)::int AS server_failures,
         (PERCENTILE_CONT(0.50) WITHIN GROUP (ORDER BY latency_ms))::int AS p50_ms,
         (PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY latency_ms))::int AS p95_ms,
         MAX(at) AS last_seen
       FROM request_log_entries
       WHERE at > NOW() - INTERVAL '24 hours'
         AND path = ANY($1::text[])
       GROUP BY path`,
      [paths],
    );

    for (const r of result.rows) {
      metricsMap.set(r.path, r);
    }
  } catch (err) {
    _logger.error("[adminAgentsService] action metrics query failed:", err);
  }

  return MONITORED_AGENT_ACTIONS.map((def) => {
    const data = metricsMap.get(def.path);
    return {
      action: def.action,
      label: def.label,
      path: def.path,
      calls24h: Number(data?.total ?? 0),
      successes24h: Number(data?.successes ?? 0),
      failures24h: Number(data?.failures ?? 0),
      serverFailures24h: Number(data?.server_failures ?? 0),
      p50Ms: data?.p50_ms !== null && data?.p50_ms !== undefined ? Number(data.p50_ms) : null,
      p95Ms: data?.p95_ms !== null && data?.p95_ms !== undefined ? Number(data.p95_ms) : null,
      lastSeenAt: data?.last_seen ? new Date(data.last_seen).toISOString() : null,
    };
  });
}

export async function getAgentCronHeartbeats(): Promise<AgentCronHeartbeat[]> {
  const agentCronNames = new Set(["agents-daily-yield", "prewarm-agent-recipes"]);
  try {
    const heartbeats = await getCronHeartbeats();
    if (heartbeats.live) {
      const relevant = heartbeats.entries.filter((e) => agentCronNames.has(e.name));
      return relevant.map((e) => ({
        name: e.name,
        schedule: e.schedule,
        expectedIntervalMinutes: e.expectedIntervalMinutes,
        lastRun: e.lastRun,
        lastStatus: e.lastStatus,
        state: e.state,
      }));
    }
    // Query marked not live
    _logger.error("[adminAgentsService] cron heartbeats unreadable (live: false)");
  } catch (err) {
    _logger.error("[adminAgentsService] cron heartbeats query failed:", err);
  }

  return [
    {
      name: "agents-daily-yield",
      schedule: "30 0 * * *",
      expectedIntervalMinutes: 1440,
      lastRun: null,
      lastStatus: null,
      state: "failing",
    },
    {
      name: "prewarm-agent-recipes",
      schedule: "0 * * * *",
      expectedIntervalMinutes: 60,
      lastRun: null,
      lastStatus: null,
      state: "failing",
    },
  ];
}

export async function getRecipePipelineOutcomes(): Promise<RecipePipelineOutcomes> {
  const telemetry = getRecipePipelineTelemetryStats();
  try {
    const result = await executeQuery<{
      refunds: number;
      attempts: number;
      final_failures: number;
    }>(
      `SELECT
         (SELECT COUNT(*)::int
            FROM token_transactions
           WHERE (transaction_type = 'cosmic_recipe_refund'
               OR idempotency_key LIKE 'cosmic_recipe_refund:%'
               OR description LIKE 'Refund - cosmic recipe%')
             AND created_at > NOW() - INTERVAL '24 hours') AS refunds,
         (SELECT COUNT(*)::int
            FROM request_log_entries
           WHERE path = '/api/generate-cosmic-recipe'
             AND at > NOW() - INTERVAL '24 hours') AS attempts,
         (SELECT COUNT(*)::int
            FROM request_log_entries
           WHERE path = '/api/generate-cosmic-recipe'
             AND status >= 500
             AND at > NOW() - INTERVAL '24 hours') AS final_failures`,
    );
    const [row] = result.rows;
    return {
      attempts: Number(row?.attempts ?? 0),
      repairs: telemetry.repairs,
      retries: telemetry.retries,
      refunds: Number(row?.refunds ?? 0),
      finalFailures: Number(row?.final_failures ?? 0),
      live: true,
    };
  } catch (err) {
    _logger.error("[adminAgentsService] recipe pipeline outcomes query failed:", err);
    return {
      attempts: telemetry.attempts,
      repairs: telemetry.repairs,
      retries: telemetry.retries,
      refunds: telemetry.refunds,
      finalFailures: telemetry.finalFailures,
      live: false,
    };
  }
}

export async function runContractProbe(
  fetchFn?: typeof fetch,
): Promise<ContractProbeSummary> {
  try {
    const report: AsolContractProbeReport = await asolContractProbe.executeProbe(
      fetchFn ? { fetchFn } : undefined,
    );
    return {
      success: report.success,
      timestamp: report.timestamp,
      checks: {
        agentRosterAuth: report.checks.agentRosterAuth,
        syncStatusAuth: report.checks.syncStatusAuth,
        vesselAuth: report.checks.vesselAuth,
        checkSharedAuth: report.checks.checkSharedAuth,
        negativeControls: report.checks.negativeControls,
      },
    };
  } catch (err) {
    _logger.error("[adminAgentsService] contract probe execution failed:", err);
    return {
      success: false,
      timestamp: new Date().toISOString(),
      checks: {
        agentRosterAuth: { passed: false, status: 0, message: "Probe execution failed" },
        syncStatusAuth: { passed: false, status: 0, message: "Probe execution failed" },
        vesselAuth: { passed: false, status: 0, message: "Probe execution failed" },
        checkSharedAuth: { passed: false, status: 0, message: "Probe execution failed" },
        negativeControls: { passed: false, allRejectedWith401: false, statuses: {} },
      },
    };
  }
}
