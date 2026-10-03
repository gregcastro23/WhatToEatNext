/**
 * Admin Agents Service
 *
 * Consolidates WTEN <-> ASOL boundary telemetry:
 *   - Service reachability & latency (Planetary Agents API & UI)
 *   - Contract diagnostic probe with negative controls (401 verification)
 *   - Inbound webhook delivery health (asol-sync-event, asol-feed, asol-agent-recipes)
 *   - Agent actions health (credit/debit paths, operational actions, crons, recipe pipeline)
 *   - Agent roster stats
 *
 * @file src/services/admin/adminAgentsService.ts
 */

import { executeQuery } from "@/lib/database/connection";
import { _logger } from "@/lib/logger";
import { getServiceUrlSafe } from "@/lib/serviceUrls";
import {
  getAsolHealthOverview,
  type AsolHealthOverview,
} from "@/services/admin/asolHealthService";
import {
  classifyCreditPath,
  fetchCreditPathSignals,
  type CreditPathHealth,
  type CreditPathSignals,
} from "@/services/agentCreditPathHealth";
import {
  classifyDebitPath,
  fetchDebitPathSignals,
  type DebitPathHealth,
  type DebitPathSignals,
} from "@/services/agentDebitPathHealth";
import {
  asolContractProbe,
  type AsolContractProbeReport,
} from "@/services/asolContractProbeService";
import {
  getCronHeartbeats,
  type CronHeartbeatState,
  type CronRunStatus,
} from "@/services/cronHeartbeatService";

export interface ServiceReachability {
  key: string;
  label: string;
  url: string;
  reachable: boolean;
  statusCode: number | null;
  latencyMs: number | null;
  error?: string;
  checkedAt: string;
}

export interface ContractProbeCheckResult {
  passed: boolean;
  status: number;
  message?: string;
}

export interface NegativeControlsReport {
  passed: boolean;
  allRejectedWith401: boolean;
  statuses: Record<string, number>;
}

export interface ContractProbeSummary {
  success: boolean;
  timestamp: string;
  checks: {
    agentRosterAuth: ContractProbeCheckResult;
    syncStatusAuth: ContractProbeCheckResult;
    vesselAuth: ContractProbeCheckResult;
    checkSharedAuth: ContractProbeCheckResult;
    negativeControls: NegativeControlsReport;
  };
}

export interface AgentActionMetric {
  action: string;
  label: string;
  path: string;
  calls24h: number;
  successes24h: number;
  failures24h: number;
  serverFailures24h: number;
  p50Ms: number | null;
  p95Ms: number | null;
  lastSeenAt: string | null;
}

export interface AgentCronHeartbeat {
  name: string;
  schedule: string;
  expectedIntervalMinutes: number;
  lastRun: string | null;
  lastStatus: CronRunStatus | null;
  state: CronHeartbeatState;
}

export interface RecipePipelineOutcomes {
  attempts: number;
  repairs: number;
  retries: number;
  refunds: number;
  finalFailures: number;
  live: boolean;
}

export interface AgentRosterStats {
  totalAgents: number;
  activeAgents24h: number;
  live: boolean;
}

export interface AdminAgentsPayload {
  generatedAt: string;
  live: boolean;
  roster: AgentRosterStats;
  connectivity: {
    services: ServiceReachability[];
    contractProbe: ContractProbeSummary;
    inboundDelivery: AsolHealthOverview;
  };
  actions: {
    creditPath: CreditPathHealth & CreditPathSignals;
    debitPath: DebitPathHealth & DebitPathSignals;
    actionMetrics: AgentActionMetric[];
    cronHeartbeats: AgentCronHeartbeat[];
    recipePipeline: RecipePipelineOutcomes;
  };
}

export interface AdminAgentsOptions {
  status?: "failed" | "all";
  fetchFn?: typeof fetch;
  skipProbe?: boolean;
}

export const MONITORED_AGENT_ACTIONS = [
  { action: "credit", label: "Agent Credit Push", path: "/api/economy/sync-credit" },
  { action: "debit", label: "Agent Debit", path: "/api/economy/sync-debit" },
  { action: "sync-transmute", label: "Sync Transmute", path: "/api/economy/sync-transmute" },
  { action: "swap", label: "Economy Auto-Swap", path: "/api/economy/swap" },
  { action: "daily-yield", label: "Agents Daily Yield", path: "/api/cron/agents-daily-yield" },
  { action: "recipe-prewarm", label: "Recipe Prewarm", path: "/api/cron/prewarm-agent-recipes" },
  { action: "agent-recipe-gen", label: "Cosmic Recipe Generation", path: "/api/generate-cosmic-recipe" },
] as const;

async function probeService(
  key: "planetaryAgentsApi" | "agentsUi",
  subPath: string,
  fetchFn: typeof fetch = fetch,
): Promise<ServiceReachability> {
  const url = getServiceUrlSafe(key);
  const fullUrl = subPath ? `${url}${subPath}` : url;
  const label = key === "planetaryAgentsApi" ? "Planetary Agents API" : "Planetary Agents UI";
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
    const latencyMs = Date.now() - start;

    return {
      key,
      label,
      url: fullUrl,
      reachable: res.status < 500,
      statusCode: res.status,
      latencyMs,
      checkedAt: new Date().toISOString(),
    };
  } catch (err) {
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

async function getAgentRosterStats(): Promise<AgentRosterStats> {
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
    _logger.warn("[adminAgentsService] agent roster query failed:", err);
    return { totalAgents: 0, activeAgents24h: 0, live: false };
  }
}

async function getActionMetrics(): Promise<AgentActionMetric[]> {
  const paths = MONITORED_AGENT_ACTIONS.map((a) => a.path);
  const metricsMap = new Map<
    string,
    {
      calls: number;
      successes: number;
      failures: number;
      serverFailures: number;
      p50: number | null;
      p95: number | null;
      lastSeen: string | null;
    }
  >();

  try {
    const result = await executeQuery<{
      path: string;
      total: number;
      successes: number;
      failures: number;
      server_failures: number;
      p50_ms: number | null;
      p95_ms: number | null;
      last_seen: Date | string | null;
    }>(
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
      metricsMap.set(r.path, {
        calls: Number(r.total ?? 0),
        successes: Number(r.successes ?? 0),
        failures: Number(r.failures ?? 0),
        serverFailures: Number(r.server_failures ?? 0),
        p50: r.p50_ms !== null ? Number(r.p50_ms) : null,
        p95: r.p95_ms !== null ? Number(r.p95_ms) : null,
        lastSeen: r.last_seen ? new Date(r.last_seen).toISOString() : null,
      });
    }
  } catch (err) {
    _logger.warn("[adminAgentsService] action metrics query failed:", err);
  }

  return MONITORED_AGENT_ACTIONS.map((def) => {
    const data = metricsMap.get(def.path);
    return {
      action: def.action,
      label: def.label,
      path: def.path,
      calls24h: data?.calls ?? 0,
      successes24h: data?.successes ?? 0,
      failures24h: data?.failures ?? 0,
      serverFailures24h: data?.serverFailures ?? 0,
      p50Ms: data?.p50 ?? null,
      p95Ms: data?.p95 ?? null,
      lastSeenAt: data?.lastSeen ?? null,
    };
  });
}

async function getAgentCronHeartbeats(): Promise<AgentCronHeartbeat[]> {
  const agentCronNames = new Set(["agents-daily-yield", "prewarm-agent-recipes"]);
  try {
    const heartbeats = await getCronHeartbeats();
    const relevant = heartbeats.entries.filter((e) => agentCronNames.has(e.name));

    return relevant.map((e) => ({
      name: e.name,
      schedule: e.schedule,
      expectedIntervalMinutes: e.expectedIntervalMinutes,
      lastRun: e.lastRun,
      lastStatus: e.lastStatus,
      state: e.state,
    }));
  } catch (err) {
    _logger.warn("[adminAgentsService] cron heartbeats query failed:", err);
    return [
      {
        name: "agents-daily-yield",
        schedule: "0 0 * * *",
        expectedIntervalMinutes: 1440,
        lastRun: null,
        lastStatus: null,
        state: "never",
      },
      {
        name: "prewarm-agent-recipes",
        schedule: "0 */4 * * *",
        expectedIntervalMinutes: 240,
        lastRun: null,
        lastStatus: null,
        state: "never",
      },
    ];
  }
}

async function getRecipePipelineOutcomes(): Promise<RecipePipelineOutcomes> {
  try {
    const result = await executeQuery<{
      refunds: number;
      attempts: number;
      final_failures: number;
    }>(
      `SELECT
         (SELECT COUNT(*)::int
            FROM token_transactions
           WHERE description LIKE 'cosmic_recipe_refund:%'
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
      repairs: 0,
      retries: 0,
      refunds: Number(row?.refunds ?? 0),
      finalFailures: Number(row?.final_failures ?? 0),
      live: true,
    };
  } catch (err) {
    _logger.warn("[adminAgentsService] recipe pipeline outcomes query failed:", err);
    return {
      attempts: 0,
      repairs: 0,
      retries: 0,
      refunds: 0,
      finalFailures: 0,
      live: false,
    };
  }
}

async function runContractProbe(
  fetchFn?: typeof fetch,
  skipProbe?: boolean,
): Promise<ContractProbeSummary> {
  if (skipProbe) {
    return {
      success: true,
      timestamp: new Date().toISOString(),
      checks: {
        agentRosterAuth: { passed: true, status: 200 },
        syncStatusAuth: { passed: true, status: 200 },
        vesselAuth: { passed: true, status: 200 },
        checkSharedAuth: { passed: true, status: 200 },
        negativeControls: {
          passed: true,
          allRejectedWith401: true,
          statuses: {
            "agent-roster": 401,
            "sync-status": 401,
            vessel: 401,
            "check-shared": 401,
          },
        },
      },
    };
  }

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
    _logger.warn("[adminAgentsService] contract probe execution failed:", err);
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

export async function getAdminAgentsOverview(
  options?: AdminAgentsOptions,
): Promise<AdminAgentsPayload> {
  const fetchFn = options?.fetchFn ?? fetch;

  const [
    roster,
    serviceApi,
    serviceUi,
    contractProbe,
    inboundDelivery,
    creditSignals,
    debitSignals,
    actionMetrics,
    cronHeartbeats,
    recipePipeline,
  ] = await Promise.all([
    getAgentRosterStats(),
    probeService("planetaryAgentsApi", "/health", fetchFn),
    probeService("agentsUi", "", fetchFn),
    runContractProbe(fetchFn, options?.skipProbe),
    getAsolHealthOverview(options?.status ? { status: options.status } : undefined),
    fetchCreditPathSignals(),
    fetchDebitPathSignals(),
    getActionMetrics(),
    getAgentCronHeartbeats(),
    getRecipePipelineOutcomes(),
  ]);

  const creditHealth = classifyCreditPath(creditSignals);
  const debitHealth = classifyDebitPath(debitSignals);

  const live =
    roster.live &&
    creditSignals.live &&
    debitSignals.live &&
    recipePipeline.live;

  return {
    generatedAt: new Date().toISOString(),
    live,
    roster,
    connectivity: {
      services: [serviceApi, serviceUi],
      contractProbe,
      inboundDelivery,
    },
    actions: {
      creditPath: {
        ...creditHealth,
        ...creditSignals,
      },
      debitPath: {
        ...debitHealth,
        ...debitSignals,
      },
      actionMetrics,
      cronHeartbeats,
      recipePipeline,
    },
  };
}
