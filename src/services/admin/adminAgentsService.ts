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

import { getWebhookSignatureModeInfo } from "@/lib/hooks/standardWebhooks";
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

import { _logger } from "@/lib/logger";

interface ConnectivityGroupResult {
  services: ServiceReachability[];
  contractProbe: ContractProbeSummary;
  inboundDelivery: AsolHealthOverview;
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
      return {
        generatedAt: new Date().toISOString(),
        totalReceived: 0,
        totalProcessed: 0,
        totalInFlight: 0,
        totalLiveInFlight: 0,
        totalStaleLocks: 0,
        totalFailed: 0,
        totalDuplicates: 0,
        overallP95LatencyMs: null,
        sources: [],
        recentEvents: [],
        feedStatus: {
          lastEmit: null,
          signatureMode: "unknown",
          signatureModeInfo: getWebhookSignatureModeInfo(),
          internalSecretConfigured: Boolean(process.env.INTERNAL_API_SECRET),
          syncSecretConfigured: Boolean(process.env.ASOL_SYNC_SECRET),
          hookSecretConfigured: Boolean(process.env.SVIX_SECRET),
        },
      };
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
    live: creditSignals.live && debitSignals.live && recipePipeline.live,
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
    live: roster.live && actions.live,
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
