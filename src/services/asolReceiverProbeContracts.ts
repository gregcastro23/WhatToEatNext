/** Contracts and report assembly for read-only WTEN receiver diagnostics. */
import { z } from "zod";

export type ProbeVerdict = "healthy" | "degraded" | "unreachable";

export interface EndpointProbeResult {
  passed: boolean;
  status: number;
  message?: string;
}

export interface NegativeControlsResult {
  passed: boolean;
  allRejectedWith401: boolean;
  statuses: Record<string, number>;
}

export interface AsolContractProbeReport {
  success: boolean;
  verdict: ProbeVerdict;
  vantage: "wten-internal-receiver";
  destination: string;
  timeoutMs: number;
  timestamp: string;
  checks: {
    agentRosterAuth: EndpointProbeResult;
    syncStatusAuth: EndpointProbeResult;
    vesselAuth: EndpointProbeResult;
    checkSharedAuth: EndpointProbeResult;
    negativeControls: NegativeControlsResult;
  };
}

export interface ProbeOptions {
  baseUrl?: string;
  internalSecret?: string;
  syncSecret?: string;
  timeoutMs?: number;
  fetchFn?: typeof fetch;
}

// Validate the receiver fields used to establish each diagnostic claim.
export const rosterResponseSchema = z
  .object({
    schemaVersion: z.literal(1),
    count: z.number().int().nonnegative(),
    agents: z.array(
      z.object({ id: z.string().min(1), email: z.string().min(1) }),
    ),
  })
  .refine((value) => value.count === value.agents.length);

export const syncStatusResponseSchema = z.object({
  ok: z.literal(true),
  idempotencyKey: z.string(),
  applied: z.boolean(),
});

export const vesselResponseSchema = z.object({
  success: z.literal(true),
  version: z.literal(1),
  balances: z.object({
    spirit: z.number().finite(),
    essence: z.number().finite(),
    matter: z.number().finite(),
    substance: z.number().finite(),
  }),
});

const userNotFoundSchema = z.object({
  success: z.literal(false),
  error: z.literal("user_not_found"),
});

export const checkSharedResponseSchema = z.object({
  success: z.literal(true),
  sharedEmails: z.array(z.string()),
});

export async function readReceiverResponse(
  response: Response,
  schemaName: string,
  validate: (json: unknown) => boolean,
): Promise<EndpointProbeResult> {
  if (response.status === 200) {
    let valid = false;
    try {
      valid = validate(await response.json());
    } catch {
      /* Unreadable 2xx stays HTTP 200. */
    }
    return {
      passed: valid,
      status: 200,
      ...(valid ? {} : { message: `Invalid ${schemaName} schema response` }),
    };
  }
  if (schemaName === "vessel" && response.status === 404) {
    let recognized = false;
    try {
      recognized = userNotFoundSchema.safeParse(await response.json()).success;
    } catch {
      /* Generic missing route. */
    }
    return {
      passed: false,
      status: 404,
      message: recognized
        ? "Authenticated, but probe user is missing; vessel ledger unverified"
        : "Unexpected vessel 404: route missing or invalid error payload",
    };
  }
  return {
    passed: false,
    status: response.status,
    message: `Expected 200, got ${response.status}`,
  };
}

export function receiverReport(
  destination: string,
  timeoutMs: number,
  checks: AsolContractProbeReport["checks"],
): AsolContractProbeReport {
  const endpoints = [
    checks.agentRosterAuth,
    checks.syncStatusAuth,
    checks.vesselAuth,
    checks.checkSharedAuth,
  ];
  const allPassed =
    endpoints.every((check) => check.passed) && checks.negativeControls.passed;
  const verdict: ProbeVerdict = allPassed
    ? "healthy"
    : endpoints.every((check) => check.status === 0)
      ? "unreachable"
      : "degraded";
  return {
    success: verdict === "healthy",
    verdict,
    vantage: "wten-internal-receiver",
    destination,
    timeoutMs,
    timestamp: new Date().toISOString(),
    checks,
  };
}

export function unreachableReceiverReport(
  message: string,
  timeoutMs: number,
): AsolContractProbeReport {
  const endpoint = { passed: false, status: 0, message };
  return receiverReport("untrusted", timeoutMs, {
    agentRosterAuth: endpoint,
    syncStatusAuth: endpoint,
    vesselAuth: endpoint,
    checkSharedAuth: endpoint,
    negativeControls: {
      passed: false,
      allRejectedWith401: false,
      statuses: {},
    },
  });
}
