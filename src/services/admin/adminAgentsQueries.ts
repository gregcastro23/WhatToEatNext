/**
 * Database and probe queries for Admin Agents Dashboard
 *
 * @file src/services/admin/adminAgentsQueries.ts
 */

import { getRecipePipelineTelemetryStats } from "@/lib/cooking/recipePipelineTelemetry";
import { executeQuery } from "@/lib/database/connection";
import { isolateDiagnosticQuery } from "@/lib/database/queryIsolation";
import { _logger } from "@/lib/logger";
import { getServiceUrlSafe } from "@/lib/serviceUrls";
import {
  asolContractProbe,
  type AsolContractProbeReport,
} from "@/services/asolContractProbeService";
import { getCronHeartbeats } from "@/services/cronHeartbeatService";
import {
  AGENT_ACTION_METRICS_SQL,
  AGENT_ROSTER_STATS_SQL,
  RECIPE_PIPELINE_OUTCOMES_SQL,
} from "./adminAgentSql";
import {
  MONITORED_AGENT_ACTIONS,
  type AgentActionMetric,
  type AgentCronHeartbeat,
  type AgentRosterStats,
  type ContractProbeSummary,
  type RecipePipelineOutcomes,
  type ServiceReachability,
} from "./adminAgentsTypes";
import type { PoolClient } from "pg";

export async function probeService(
  key: "planetaryAgentsApi" | "agentsUi",
  subPath: string,
  fetchFn: typeof fetch = fetch,
): Promise<ServiceReachability> {
  const url = getServiceUrlSafe(key);
  const prodFallback =
    key === "planetaryAgentsApi"
      ? "https://api.agents.alchm.kitchen"
      : "https://agents.alchm.kitchen";
  const candidateBases = [url];
  if (
    (url.includes("localhost") || url.includes("127.0.0.1")) &&
    !candidateBases.includes(prodFallback)
  ) {
    candidateBases.push(prodFallback);
  }

  const label = key === "planetaryAgentsApi" ? "Alchemy Agents API" : "Alchemy Agents UI";
  const headers: Record<string, string> = { Accept: "application/json" };
  if (process.env.INTERNAL_API_SECRET) {
    headers.Authorization = `Bearer ${process.env.INTERNAL_API_SECRET}`;
  }

  let lastError: unknown = null;
  let lastFullUrl = subPath ? `${url}${subPath}` : url;

  for (const base of candidateBases) {
    const fullUrl = subPath ? `${base}${subPath}` : base;
    lastFullUrl = fullUrl;
    const start = Date.now();
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 3_000);
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
      lastError = err;
    }
  }

  _logger.error(`[adminAgentsService] ${key} probe failed:`, lastError);
  return {
    key,
    label,
    url: lastFullUrl,
    reachable: false,
    statusCode: null,
    latencyMs: null,
    error: lastError instanceof Error ? lastError.message : String(lastError),
    checkedAt: new Date().toISOString(),
  };
}

export async function getAgentRosterStats(options?: { client?: PoolClient }): Promise<AgentRosterStats> {
  const client = options?.client;
  try {
    const result = await executeQuery<{
      total_agents: number;
      active_agents: number;
    }>(AGENT_ROSTER_STATS_SQL, [], client ? { client } : {});
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

function formatActionMetric(
  def: (typeof MONITORED_AGENT_ACTIONS)[number],
  data?: ActionMetricRow,
  queryFailed?: boolean,
): AgentActionMetric {
  if (queryFailed) {
    return {
      action: def.action,
      label: def.label,
      path: def.path,
      calls24h: null,
      successes24h: null,
      failures24h: null,
      serverFailures24h: null,
      p50Ms: null,
      p95Ms: null,
      lastSeenAt: null,
    };
  }
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
}

export async function getActionMetrics(options?: { client?: PoolClient }): Promise<AgentActionMetric[]> {
  const paths = MONITORED_AGENT_ACTIONS.map((a) => a.path);
  const metricsMap = new Map<string, ActionMetricRow>();
  const client = options?.client;
  let queryFailed = false;

  try {
    const result = await isolateDiagnosticQuery(
      "agent_action_metrics",
      () =>
        executeQuery<ActionMetricRow>(
          AGENT_ACTION_METRICS_SQL,
          [paths],
          client ? { client } : {},
        ),
      null,
      client,
    );

    if (result === null) {
      queryFailed = true;
    } else {
      for (const r of result.rows) {
        metricsMap.set(r.path, r);
      }
    }
  } catch (err) {
    queryFailed = true;
    _logger.error("[adminAgentsService] action metrics query failed:", err);
  }

  return MONITORED_AGENT_ACTIONS.map((def) =>
    formatActionMetric(def, metricsMap.get(def.path), queryFailed),
  );
}

export async function getAgentCronHeartbeats(): Promise<AgentCronHeartbeat[]> {
  const agentCronNames = new Set(["agents-daily-yield", "prewarm-agent-recipes"]);
  try {
    const heartbeats = await getCronHeartbeats();
    if (heartbeats.live) {
      return heartbeats.entries
        .filter((e) => agentCronNames.has(e.name))
        .map((e) => ({
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
    { name: "agents-daily-yield", schedule: "30 0 * * *", expectedIntervalMinutes: 1440, lastRun: null, lastStatus: null, state: "never" },
    { name: "prewarm-agent-recipes", schedule: "0 * * * *", expectedIntervalMinutes: 60, lastRun: null, lastStatus: null, state: "never" },
  ];
}

export async function getRecipePipelineOutcomes(
  options?: { client?: PoolClient },
): Promise<RecipePipelineOutcomes> {
  const telemetry = getRecipePipelineTelemetryStats();
  const fallback = (live: boolean): RecipePipelineOutcomes => ({
    attempts: telemetry.attempts,
    repairs: telemetry.repairs,
    retries: telemetry.retries,
    refunds: telemetry.refunds,
    finalFailures: telemetry.finalFailures,
    live,
  });

  try {
    const result = await isolateDiagnosticQuery(
      "recipe_pipeline_outcomes",
      () =>
        executeQuery<{
          refunds: number;
          attempts: number;
          final_failures: number;
        }>(RECIPE_PIPELINE_OUTCOMES_SQL, [], options?.client ? { client: options.client } : {}),
      null,
      options?.client,
    );

    const [row] = result?.rows ?? [];
    if (!row) return fallback(false);

    return {
      attempts: Number(row.attempts),
      repairs: telemetry.repairs,
      retries: telemetry.retries,
      refunds: Number(row.refunds),
      finalFailures: Number(row.final_failures),
      live: true,
    };
  } catch (err) {
    _logger.error("[adminAgentsService] recipe pipeline outcomes query failed:", err);
    return fallback(false);
  }
}

export async function runContractProbe(
  fetchFn?: typeof fetch,
  baseUrl?: string,
): Promise<ContractProbeSummary> {
  try {
    const report: AsolContractProbeReport = await asolContractProbe.executeProbe({
      ...(fetchFn ? { fetchFn } : {}),
      ...(baseUrl ? { baseUrl } : {}),
    });
    return {
      success: report.success,
      verdict: report.verdict,
      vantage: report.vantage,
      destination: report.destination,
      timeoutMs: report.timeoutMs,
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
      verdict: "unreachable",
      vantage: "wten-internal-receiver",
      destination: "unknown",
      timeoutMs: 3000,
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
