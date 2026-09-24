/**
 * AsolContractProbeService
 *
 * Synthetic contract probe verifying the WTEN <-> ASOL boundary contracts.
 * Tests authorized calls and negative controls (unauthorized requests return 401).
 *
 * @file src/services/asolContractProbeService.ts
 */

import { z } from "zod";

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
  fetchFn?: typeof fetch;
}

const rosterResponseSchema = z.object({
  agents: z.array(z.unknown()),
  total: z.number().optional(),
});

const syncStatusResponseSchema = z.object({
  ok: z.boolean(),
  idempotencyKey: z.string().optional(),
  applied: z.boolean().optional(),
});

const checkSharedResponseSchema = z.object({
  success: z.boolean(),
  sharedEmails: z.array(z.string()).optional(),
});

export class AsolContractProbeService {
  private readonly defaultBaseUrl: string;

  constructor(defaultBaseUrl = "http://localhost:3000") {
    this.defaultBaseUrl = defaultBaseUrl.replace(/\/+$/, "");
  }

  private resolveUrl(path: string, options?: ProbeOptions): string {
    const base = (options?.baseUrl ?? this.defaultBaseUrl).replace(/\/+$/, "");
    return `${base}${path}`;
  }

  private async probeEndpoint(
    url: string,
    init: RequestInit,
    schemaName: string,
    validateSchema: (json: unknown) => boolean,
    fetchFn?: typeof fetch,
  ): Promise<EndpointProbeResult> {
    try {
      const res = await (fetchFn ?? fetch)(url, init);
      if (res.status === 200) {
        const valid = validateSchema(await res.json());
        return {
          passed: valid,
          status: 200,
          ...(valid ? {} : { message: `Invalid ${schemaName} schema response` }),
        };
      }
      return {
        passed: false,
        status: res.status,
        message: `Expected 200, got ${res.status}`,
      };
    } catch (err) {
      return {
        passed: false,
        status: 0,
        message: err instanceof Error ? err.message : String(err),
      };
    }
  }

  public async probeAgentRoster(
    secret: string,
    options?: ProbeOptions,
  ): Promise<EndpointProbeResult> {
    return this.probeEndpoint(
      this.resolveUrl("/api/internal/agent-roster", options),
      {
        method: "GET",
        headers: { Authorization: `Bearer ${secret}`, Accept: "application/json" },
      },
      "roster",
      (json) => rosterResponseSchema.safeParse(json).success,
      options?.fetchFn,
    );
  }

  public async probeSyncStatus(
    secret: string,
    idempotencyKey = "probe-test-key",
    options?: ProbeOptions,
  ): Promise<EndpointProbeResult> {
    const path = `/api/economy/sync-status?idempotencyKey=${encodeURIComponent(idempotencyKey)}`;
    return this.probeEndpoint(
      this.resolveUrl(path, options),
      {
        method: "GET",
        headers: { "X-Sync-Secret": secret, Accept: "application/json" },
      },
      "sync-status",
      (json) => syncStatusResponseSchema.safeParse(json).success,
      options?.fetchFn,
    );
  }

  public async probeVessel(
    secret: string,
    email = "probe@alchm.kitchen",
    options?: ProbeOptions,
  ): Promise<EndpointProbeResult> {
    const fetchImpl = options?.fetchFn ?? fetch;
    const url = this.resolveUrl(`/api/economy/vessel?email=${encodeURIComponent(email)}`, options);
    try {
      const res = await fetchImpl(url, {
        method: "GET",
        headers: { "X-Sync-Secret": secret, Accept: "application/json" },
      });
      const passed = res.status === 200 || res.status === 404;
      return {
        passed,
        status: res.status,
        ...(passed ? {} : { message: `Expected 200 or 404 with valid auth, got ${res.status}` }),
      };
    } catch (err) {
      return {
        passed: false,
        status: 0,
        message: err instanceof Error ? err.message : String(err),
      };
    }
  }

  public async probeCheckShared(
    secret: string,
    emails: string[] = ["probe@alchm.kitchen"],
    options?: ProbeOptions,
  ): Promise<EndpointProbeResult> {
    return this.probeEndpoint(
      this.resolveUrl("/api/internal/users/check-shared", options),
      {
        method: "POST",
        headers: {
          "X-Sync-Secret": secret,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ emails }),
      },
      "check-shared",
      (json) => checkSharedResponseSchema.safeParse(json).success,
      options?.fetchFn,
    );
  }

  public async runNegativeControls(options?: ProbeOptions): Promise<NegativeControlsResult> {
    const fetchImpl = options?.fetchFn ?? fetch;
    const statuses: Record<string, number> = {};
    try {
      const [resRoster, resSync, resVessel, resShared] = await Promise.all([
        fetchImpl(this.resolveUrl("/api/internal/agent-roster", options), { method: "GET" }),
        fetchImpl(
          this.resolveUrl("/api/economy/sync-status?idempotencyKey=unauthed", options),
          { method: "GET" },
        ),
        fetchImpl(
          this.resolveUrl("/api/economy/vessel?email=unauthed@alchm.kitchen", options),
          { method: "GET" },
        ),
        fetchImpl(this.resolveUrl("/api/internal/users/check-shared", options), {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ emails: ["unauthed@alchm.kitchen"] }),
        }),
      ]);

      statuses["agent-roster"] = resRoster.status;
      statuses["sync-status"] = resSync.status;
      statuses["vessel"] = resVessel.status;
      statuses["check-shared"] = resShared.status;

      const allRejectedWith401 =
        resRoster.status === 401 &&
        resSync.status === 401 &&
        resVessel.status === 401 &&
        resShared.status === 401;

      return { passed: allRejectedWith401, allRejectedWith401, statuses };
    } catch {
      return { passed: false, allRejectedWith401: false, statuses };
    }
  }

  public async executeProbe(options?: ProbeOptions): Promise<AsolContractProbeReport> {
    const internalSecret = options?.internalSecret ?? process.env.INTERNAL_API_SECRET ?? "";
    const syncSecret = options?.syncSecret ?? process.env.ALCHM_KITCHEN_SYNC_SECRET ?? "";

    const [roster, sync, vessel, shared, negative] = await Promise.all([
      this.probeAgentRoster(internalSecret, options),
      this.probeSyncStatus(syncSecret, "probe-test-key", options),
      this.probeVessel(syncSecret, "probe@alchm.kitchen", options),
      this.probeCheckShared(syncSecret, ["probe@alchm.kitchen"], options),
      this.runNegativeControls(options),
    ]);

    const success =
      roster.passed && sync.passed && vessel.passed && shared.passed && negative.passed;

    return {
      success,
      timestamp: new Date().toISOString(),
      checks: {
        agentRosterAuth: roster,
        syncStatusAuth: sync,
        vesselAuth: vessel,
        checkSharedAuth: shared,
        negativeControls: negative,
      },
    };
  }
}

export const asolContractProbe = new AsolContractProbeService();
