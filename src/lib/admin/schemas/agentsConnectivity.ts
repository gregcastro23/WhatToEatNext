/** Receiver diagnostics consumed by the agent connectivity panel. */
import { z } from "zod";

export const ServiceReachabilitySchema = z.object({
  key: z.string(),
  label: z.string(),
  url: z.string(),
  reachable: z.boolean(),
  statusCode: z.number().nullable(),
  latencyMs: z.number().nullable(),
  error: z.string().exactOptional(),
  checkedAt: z.string(),
});

export const ContractProbeCheckSchema = z.object({
  passed: z.boolean(), status: z.number(), message: z.string().exactOptional(),
});

export const NegativeControlsSchema = z.object({
  passed: z.boolean(),
  allRejectedWith401: z.boolean(),
  statuses: z.record(z.string(), z.number()),
});

export const ContractProbeSummarySchema = z.object({
  success: z.boolean(),
  verdict: z.enum(["healthy", "degraded", "unreachable"]),
  vantage: z.literal("wten-internal-receiver"),
  destination: z.string(),
  timeoutMs: z.number().positive(),
  timestamp: z.string(),
  checks: z.object({
    agentRosterAuth: ContractProbeCheckSchema,
    syncStatusAuth: ContractProbeCheckSchema,
    vesselAuth: ContractProbeCheckSchema,
    checkSharedAuth: ContractProbeCheckSchema,
    negativeControls: NegativeControlsSchema,
  }),
});

