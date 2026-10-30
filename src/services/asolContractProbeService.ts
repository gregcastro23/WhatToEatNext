/**
 * AsolContractProbeService
 *
 * Read-only receiver probe for WTEN endpoints called by ASOL (B5).
 * This does not exercise ASOL delivery, signing, queueing, or retries.
 * Explicitly names WTEN receiver vantage, validated destination, timeout,
 * and three-valued verdict ("healthy" | "degraded" | "unreachable").
 *
 * Security:
 *   - Destination URLs are strictly validated against configured origins; secrets
 *     are never transmitted to request-derived arbitrary origins.
 *   - Unexpected vessel 404s (e.g. route missing or HTML) fail rather than passing.
 *   - Liveness is tested strictly via read-only diagnostic checks; never via synthetic
 *     mutations (sync-credit, sync-debit, or transmutation).
 *
 * @file src/services/asolContractProbeService.ts
 */

import {
  rosterResponseSchema,
  syncStatusResponseSchema,
  vesselResponseSchema,
  checkSharedResponseSchema,
  readReceiverResponse,
  receiverReport,
  unreachableReceiverReport,
  type EndpointProbeResult,
  type NegativeControlsResult,
  type AsolContractProbeReport,
  type ProbeOptions,
} from "./asolReceiverProbeContracts";

export type {
  EndpointProbeResult,
  NegativeControlsResult,
  AsolContractProbeReport,
  ProbeOptions,
  ProbeVerdict,
} from "./asolReceiverProbeContracts";

export class AsolContractProbeService {
  public static readonly VANTAGE = "wten-internal-receiver" as const;
  public static readonly DEFAULT_TIMEOUT_MS = 3_000;

  private readonly defaultBaseUrl: string;

  constructor(
    defaultBaseUrl = process.env.INTERNAL_API_URL ??
      process.env.NEXT_PUBLIC_APP_URL ??
      (process.env.VERCEL_URL
        ? `https://${process.env.VERCEL_URL}`
        : "http://localhost:3000"),
  ) {
    this.defaultBaseUrl = defaultBaseUrl.replace(/\/+$/, "");
  }

  public isAllowedDestination(targetUrl: URL): boolean {
    try {
      const defaultUrl = new URL(this.defaultBaseUrl);
      const loopback = ["localhost", "127.0.0.1", "[::1]"].includes(
        targetUrl.hostname,
      );
      return (
        targetUrl.origin === defaultUrl.origin &&
        !targetUrl.username &&
        !targetUrl.password &&
        (targetUrl.protocol === "https:" ||
          (loopback && targetUrl.protocol === "http:"))
      );
    } catch {
      return false;
    }
  }

  public resolveDestination(options?: ProbeOptions): string {
    const raw = options?.baseUrl ?? this.defaultBaseUrl;
    let url: URL;
    try {
      url = new URL(raw);
    } catch {
      throw new Error("Invalid probe destination URL");
    }

    if (!this.isAllowedDestination(url)) {
      throw new Error(
        `Untrusted probe destination '${url.origin}': secrets will not be sent to arbitrary origin`,
      );
    }

    return url.origin;
  }

  private resolveUrl(path: string, options?: ProbeOptions): string {
    const origin = this.resolveDestination(options);
    return `${origin}${path}`;
  }

  private getTimeoutSignal(options?: ProbeOptions): AbortSignal {
    const ms =
      options?.timeoutMs ?? AsolContractProbeService.DEFAULT_TIMEOUT_MS;
    return AbortSignal.timeout(ms);
  }

  private async probeEndpoint(
    path: string,
    init: RequestInit,
    schemaName: string,
    validateSchema: (json: unknown) => boolean,
    options?: ProbeOptions,
  ): Promise<EndpointProbeResult> {
    try {
      const response = await (options?.fetchFn ?? fetch)(
        this.resolveUrl(path, options),
        {
          ...init,
          signal: this.getTimeoutSignal(options),
          redirect: "error",
        },
      );
      return await readReceiverResponse(response, schemaName, validateSchema);
    } catch (error) {
      return {
        passed: false,
        status: 0,
        message: error instanceof Error ? error.message : String(error),
      };
    }
  }

  public async probeAgentRoster(
    secret: string,
    options?: ProbeOptions,
  ): Promise<EndpointProbeResult> {
    return this.probeEndpoint(
      "/api/internal/agent-roster",
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${secret}`,
          Accept: "application/json",
        },
      },
      "roster",
      (json) => rosterResponseSchema.safeParse(json).success,
      options,
    );
  }

  public async probeSyncStatus(
    secret: string,
    idempotencyKey = "probe-test-key",
    options?: ProbeOptions,
  ): Promise<EndpointProbeResult> {
    return this.probeEndpoint(
      `/api/economy/sync-status?idempotencyKey=${encodeURIComponent(idempotencyKey)}`,
      {
        method: "GET",
        headers: { "X-Sync-Secret": secret, Accept: "application/json" },
      },
      "sync-status",
      (json) => {
        const parsed = syncStatusResponseSchema.safeParse(json);
        return parsed.success && parsed.data.idempotencyKey === idempotencyKey;
      },
      options,
    );
  }

  public async probeVessel(
    secret: string,
    email = "probe@alchm.kitchen",
    options?: ProbeOptions,
  ): Promise<EndpointProbeResult> {
    return this.probeEndpoint(
      `/api/economy/vessel?email=${encodeURIComponent(email)}`,
      {
        method: "GET",
        headers: { "X-Sync-Secret": secret, Accept: "application/json" },
      },
      "vessel",
      (json) => vesselResponseSchema.safeParse(json).success,
      options,
    );
  }

  public async probeCheckShared(
    secret: string,
    emails: string[] = ["probe@alchm.kitchen"],
    options?: ProbeOptions,
  ): Promise<EndpointProbeResult> {
    return this.probeEndpoint(
      "/api/internal/users/check-shared",
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
      options,
    );
  }

  public async runNegativeControls(
    options?: ProbeOptions,
  ): Promise<NegativeControlsResult> {
    try {
      const fetchImpl = options?.fetchFn ?? fetch;
      const signal = this.getTimeoutSignal(options);
      const endpoints = [
        { key: "agent-roster", path: "/api/internal/agent-roster" },
        {
          key: "sync-status",
          path: "/api/economy/sync-status?idempotencyKey=unauthed",
        },
        {
          key: "vessel",
          path: "/api/economy/vessel?email=unauthed@alchm.kitchen",
        },
        { key: "check-shared", path: "/api/internal/users/check-shared" },
      ];
      const entries = await Promise.all(
        endpoints.map(async ({ key, path }): Promise<[string, number]> => {
          const init: RequestInit = {
            method: "GET",
            signal,
            redirect: "error",
          };
          if (key === "check-shared") {
            init.method = "POST";
            init.headers = { "Content-Type": "application/json" };
            init.body = JSON.stringify({ emails: ["unauthed@alchm.kitchen"] });
          }
          return [
            key,
            (await fetchImpl(this.resolveUrl(path, options), init)).status,
          ];
        }),
      );
      const statuses = Object.fromEntries(entries);
      const allRejectedWith401 = entries.every(([, status]) => status === 401);
      return { passed: allRejectedWith401, allRejectedWith401, statuses };
    } catch {
      return { passed: false, allRejectedWith401: false, statuses: {} };
    }
  }

  public async executeProbe(
    options?: ProbeOptions,
  ): Promise<AsolContractProbeReport> {
    const timeoutMs =
      options?.timeoutMs ?? AsolContractProbeService.DEFAULT_TIMEOUT_MS;
    let destination: string;
    try {
      destination = this.resolveDestination(options);
    } catch (error) {
      return unreachableReceiverReport(
        error instanceof Error ? error.message : String(error),
        timeoutMs,
      );
    }
    const internalSecret =
      options?.internalSecret ?? process.env.INTERNAL_API_SECRET ?? "";
    const syncSecret =
      options?.syncSecret ?? process.env.ALCHM_KITCHEN_SYNC_SECRET ?? "";
    const [
      agentRosterAuth,
      syncStatusAuth,
      vesselAuth,
      checkSharedAuth,
      negativeControls,
    ] = await Promise.all([
      this.probeAgentRoster(internalSecret, options),
      this.probeSyncStatus(syncSecret, "probe-test-key", options),
      this.probeVessel(
        syncSecret,
        process.env.ASOL_RECEIVER_PROBE_EMAIL ?? "probe@alchm.kitchen",
        options,
      ),
      this.probeCheckShared(syncSecret, ["probe@alchm.kitchen"], options),
      this.runNegativeControls(options),
    ]);
    return receiverReport(destination, timeoutMs, {
      agentRosterAuth,
      syncStatusAuth,
      vesselAuth,
      checkSharedAuth,
      negativeControls,
    });
  }
}

export const asolContractProbe = new AsolContractProbeService();
