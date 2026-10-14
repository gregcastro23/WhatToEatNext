/**
 * Admin Agents Service
 *
 * Consolidates WTEN <-> ASOL boundary telemetry:
 *   - Service reachability & latency (Agents API & UI)
 *   - Contract diagnostic probe with negative controls (401 verification)
 *   - Inbound webhook delivery health (asol-sync-event, asol-feed, asol-agent-recipes)
 *   - Agent actions health (credit/debit paths, operational actions, crons, recipe pipeline)
 *   - Agent roster stats
 *
 * @file src/services/admin/adminAgentsService.ts
 */

import { _logger } from "@/lib/logger";
import type { AsolHealthOverview } from "@/services/admin/asolHealthService";
import { getAsolHealthOverview } from "@/services/admin/asolHealthService";
import type { CreditPathHealth, CreditPathSignals } from "@/services/agentCreditPathHealth";
import {
  classifyCreditPath,
  fetchCreditPathSignals,
} from "@/services/agentCreditPathHealth";
import type { DebitPathHealth, DebitPathSignals } from "@/services/agentDebitPathHealth";
import {
  classifyDebitPath,
  fetchDebitPathSignals,
} from "@/services/agentDebitPathHealth";
import {
  getActionMetrics,
  getAgentCronHeartbeats,
  getAgentRosterStats,
  getRecipePipelineOutcomes,
  probeService,
  runContractProbe,
} from "./adminAgentsQueries";
import type {
  AdminAgentsOptions,
  AdminAgentsPayload,
  AgentActionMetric,
  AgentCronHeartbeat,
  ContractProbeSummary,
  RecipePipelineOutcomes,
  ServiceReachability,
} from "./adminAgentsTypes";

export * from "./adminAgentsTypes";
export {
  getActionMetrics,
  getAgentCronHeartbeats,
  getAgentRosterStats,
  getRecipePipelineOutcomes,
  probeService,
  runContractProbe,
};

interface ConnectivityGroupResult {
  services: ServiceReachability[];
  contractProbe: ContractProbeSummary;
  inboundDelivery: AsolHealthOverview | null;
}

interface ActionsGroupResult {
  creditPath: CreditPathHealth & CreditPathSignals;
  debitPath: DebitPathHealth & DebitPathSignals;
  actionMetrics: AgentActionMetric[];
  cronHeartbeats: AgentCronHeartbeat[];
  recipePipeline: RecipePipelineOutcomes;
  live: boolean;
}

async function fetchConnectivityGroup(
  fetchFn: typeof fetch,
  status?: "failed" | "all",
  baseUrl?: string,
): Promise<ConnectivityGroupResult> {
  const [serviceApi, serviceUi, contractProbe, inboundDelivery] = await Promise.all([
    probeService("planetaryAgentsApi", "/health", fetchFn),
    probeService("agentsUi", "", fetchFn),
    runContractProbe(fetchFn, baseUrl),
    getAsolHealthOverview(status ? { status } : undefined).catch((err) => {
      _logger.error("[adminAgentsService] inbound webhook health read failed:", err);
      return null;
    }),
  ]);
  return { services: [serviceApi, serviceUi], contractProbe, inboundDelivery };
}

async function fetchActionsGroup(): Promise<ActionsGroupResult> {
  const [creditSignals, debitSignals, actionMetrics, cronHeartbeats, recipePipeline] =
    await Promise.all([
      fetchCreditPathSignals(),
      fetchDebitPathSignals(),
      getActionMetrics(),
      getAgentCronHeartbeats(),
      getRecipePipelineOutcomes(),
    ]);

  return {
    creditPath: { ...classifyCreditPath(creditSignals), ...creditSignals },
    debitPath: { ...classifyDebitPath(debitSignals), ...debitSignals },
    actionMetrics,
    cronHeartbeats,
    recipePipeline,
    live: creditSignals.live && debitSignals.live && recipePipeline.live && actionMetrics.every((metric) => metric.calls24h !== null),
  };
}

export async function getAdminAgentsOverview(
  options?: AdminAgentsOptions,
): Promise<AdminAgentsPayload> {
  const fetchFn = options?.fetchFn ?? fetch;
  const [roster, connectivity, actions] = await Promise.all([
    getAgentRosterStats(),
    fetchConnectivityGroup(fetchFn, options?.status, options?.baseUrl),
    fetchActionsGroup(),
  ]);

  return {
    generatedAt: new Date().toISOString(),
    live: roster.live && actions.live && connectivity.inboundDelivery !== null,
    roster,
    connectivity,
    actions: {
      creditPath: actions.creditPath,
      debitPath: actions.debitPath,
      actionMetrics: actions.actionMetrics,
      cronHeartbeats: actions.cronHeartbeats,
      recipePipeline: actions.recipePipeline,
    },
  };
}
