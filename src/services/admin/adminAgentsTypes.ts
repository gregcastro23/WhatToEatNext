/**
 * Admin Agents Types and Configuration Constants
 *
 * @file src/services/admin/adminAgentsTypes.ts
 */

import type { AsolHealthOverview } from "@/services/admin/asolHealthService";
import type { CreditPathHealth, CreditPathSignals } from "@/services/agentCreditPathHealth";
import type { DebitPathHealth, DebitPathSignals } from "@/services/agentDebitPathHealth";
import type { CronHeartbeatState, CronRunStatus } from "@/services/cronHeartbeatService";

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
  baseUrl?: string;
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
