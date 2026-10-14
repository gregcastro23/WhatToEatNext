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
const rosterResponseSchema = z
  .object({
    schemaVersion: z.literal(1),
    count: z.number().int().nonnegative(),
    agents: z.array(
      z.object({ id: z.string().min(1), email: z.string().min(1) }),
    ),
  })
  .refine((value) => value.count === value.agents.length);

const syncStatusResponseSchema = z.object({
  ok: z.literal(true),
  idempotencyKey: z.string(),
  applied: z.boolean(),
});

const vesselResponseSchema = z.object({
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

const checkSharedResponseSchema = z.object({
  success: z.literal(true),
  sharedEmails: z.array(z.string()),
});

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
    url: string,
    init: RequestInit,
    schemaName: string,
    validateSchema: (json: unknown) => boolean,
    fetchFn?: typeof fetch,
    options?: ProbeOptions,
  ): Promise<EndpointProbeResult> {
    try {
      const res = await (fetchFn ?? fetch)(url, {
        ...init,
        signal: this.getTimeoutSignal(options),
        redirect: "error",
      });
      if (res.status === 200) {
        const valid = validateSchema(await res.json());
        return {
          passed: valid,
          status: 200,
          ...(valid
            ? {}
            : { message: `Invalid ${schemaName} schema response` }),
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
    let url: string;
    try {
      url = this.resolveUrl("/api/internal/agent-roster", options);
    } catch (err) {
      return {
        passed: false,
        status: 0,
        message: err instanceof Error ? err.message : String(err),
      };
    }

    return this.probeEndpoint(
      url,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${secret}`,
          Accept: "application/json",
        },
      },
      "roster",
      (json) => rosterResponseSchema.safeParse(json).success,
      options?.fetchFn,
      options,
    );
  }

  public async probeSyncStatus(
    secret: string,
    idempotencyKey = "probe-test-key",
    options?: ProbeOptions,
  ): Promise<EndpointProbeResult> {
    let url: string;
    try {
      const path = `/api/economy/sync-status?idempotencyKey=${encodeURIComponent(idempotencyKey)}`;
      url = this.resolveUrl(path, options);
    } catch (err) {
      return {
        passed: false,
        status: 0,
        message: err instanceof Error ? err.message : String(err),
      };
    }

    return this.probeEndpoint(
      url,
      {
        method: "GET",
        headers: { "X-Sync-Secret": secret, Accept: "application/json" },
      },
      "sync-status",
      (json) => {
        const parsed = syncStatusResponseSchema.safeParse(json);
        return parsed.success && parsed.data.idempotencyKey === idempotencyKey;
      },
      options?.fetchFn,
      options,
    );
  }

  public async probeVessel(
    secret: string,
    email = "probe@alchm.kitchen",
    options?: ProbeOptions,
  ): Promise<EndpointProbeResult> {
    const fetchImpl = options?.fetchFn ?? fetch;
    let url: string;
    try {
      url = this.resolveUrl(
        `/api/economy/vessel?email=${encodeURIComponent(email)}`,
        options,
      );
    } catch (err) {
      return {
        passed: false,
        status: 0,
        message: err instanceof Error ? err.message : String(err),
      };
    }

    try {
      const res = await fetchImpl(url, {
        method: "GET",
        headers: { "X-Sync-Secret": secret, Accept: "application/json" },
        signal: this.getTimeoutSignal(options),
        redirect: "error",
      });

      if (res.status === 200) {
        const valid = vesselResponseSchema.safeParse(await res.json()).success;
        return {
          passed: valid,
          status: 200,
          ...(valid ? {} : { message: "Invalid vessel schema response" }),
        };
      }

      // A recognized missing user proves route/auth handling, not a readable vessel.
      // Keep the overall probe degraded until a configured fixture ledger is read.
      if (res.status === 404) {
        try {
          const isUserNotFound = userNotFoundSchema.safeParse(
            await res.json(),
          ).success;
          if (isUserNotFound) {
            return {
              passed: false,
              status: 404,
              message:
                "Authenticated, but probe user is missing; vessel ledger unverified",
            };
          }
        } catch {
          // not json
        }
        return {
          passed: false,
          status: 404,
          message:
            "Unexpected vessel 404: route missing or invalid error payload",
        };
      }

      return {
        passed: false,
        status: res.status,
        message: `Expected a readable vessel (200), got ${res.status}`,
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
    let url: string;
    try {
      url = this.resolveUrl("/api/internal/users/check-shared", options);
    } catch (err) {
      return {
        passed: false,
        status: 0,
        message: err instanceof Error ? err.message : String(err),
      };
    }

    return this.probeEndpoint(
      url,
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
      options,
    );
  }

  public async runNegativeControls(
    options?: ProbeOptions,
  ): Promise<NegativeControlsResult> {
    const fetchImpl = options?.fetchFn ?? fetch;
    const statuses: Record<string, number> = {};
    const signal = this.getTimeoutSignal(options);

    try {
      const rosterUrl = this.resolveUrl("/api/internal/agent-roster", options);
      const syncUrl = this.resolveUrl(
        "/api/economy/sync-status?idempotencyKey=unauthed",
        options,
      );
      const vesselUrl = this.resolveUrl(
        "/api/economy/vessel?email=unauthed@alchm.kitchen",
        options,
      );
      const sharedUrl = this.resolveUrl(
        "/api/internal/users/check-shared",
        options,
      );

      const [resRoster, resSync, resVessel, resShared] = await Promise.all([
        fetchImpl(rosterUrl, { method: "GET", signal, redirect: "error" }),
        fetchImpl(syncUrl, { method: "GET", signal, redirect: "error" }),
        fetchImpl(vesselUrl, { method: "GET", signal, redirect: "error" }),
        fetchImpl(sharedUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ emails: ["unauthed@alchm.kitchen"] }),
          signal,
          redirect: "error",
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

  public async executeProbe(
    options?: ProbeOptions,
  ): Promise<AsolContractProbeReport> {
    let destError: Error | null = null;
    let resolvedOrigin = "unknown";
    try {
      resolvedOrigin = this.resolveDestination(options);
    } catch (err) {
      destError = err instanceof Error ? err : new Error(String(err));
    }

    if (destError !== null) {
      return {
        success: false,
        verdict: "unreachable",
        vantage: AsolContractProbeService.VANTAGE,
        destination: "untrusted",
        timeoutMs:
          options?.timeoutMs ?? AsolContractProbeService.DEFAULT_TIMEOUT_MS,
        timestamp: new Date().toISOString(),
        checks: {
          agentRosterAuth: {
            passed: false,
            status: 0,
            message: destError.message,
          },
          syncStatusAuth: {
            passed: false,
            status: 0,
            message: destError.message,
          },
          vesselAuth: { passed: false, status: 0, message: destError.message },
          checkSharedAuth: {
            passed: false,
            status: 0,
            message: destError.message,
          },
          negativeControls: {
            passed: false,
            allRejectedWith401: false,
            statuses: {},
          },
        },
      };
    }

    const destination = resolvedOrigin;

    const timeoutMs =
      options?.timeoutMs ?? AsolContractProbeService.DEFAULT_TIMEOUT_MS;
    const internalSecret =
      options?.internalSecret ?? process.env.INTERNAL_API_SECRET ?? "";
    const syncSecret =
      options?.syncSecret ?? process.env.ALCHM_KITCHEN_SYNC_SECRET ?? "";

    const [roster, sync, vessel, shared, negative] = await Promise.all([
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

    const allChecks = [roster, sync, vessel, shared];
    const allUnreachable = allChecks.every((c) => c.status === 0);
    const allPassed = allChecks.every((c) => c.passed) && negative.passed;

    const verdict: ProbeVerdict = allPassed
      ? "healthy"
      : allUnreachable
        ? "unreachable"
        : "degraded";

    return {
      success: verdict === "healthy",
      verdict,
      vantage: AsolContractProbeService.VANTAGE,
      destination,
      timeoutMs,
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
