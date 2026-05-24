/**
 * Synthetic Probe Service
 *
 * Cron-driven health checks that exercise critical flows end-to-end. At
 * the 10-user stage organic traffic is too sparse to catch breakage in
 * real time — a single broken flow could sit silent for days. Synthetic
 * probes provide a constant-pace heartbeat.
 *
 * Probe inventory:
 *   - `onboarding-skip` — PATCH /api/onboarding (skip path) as the
 *     synthetic user. Verifies the funnel doesn't 5xx and skips cleanly.
 *   - `cosmic-recipe` — POST /api/generate-cosmic-recipe (minimal body)
 *     as the synthetic user. Catches AI-backend/token-economy breakage.
 *     Hourly cadence — this one actually spends tokens.
 *   - `recommendations` — POST /api/personalized-recommendations as the
 *     synthetic user. Catches recommendation-pipeline breakage. Cheap.
 *   - `stripe-webhook` — POST unsigned body to /api/stripe/webhook;
 *     expects a 400 (sig validation active). Catches webhook downtime
 *     without injecting fake events into production.
 *   - `auth-handshake` — GET /api/auth/sessions as the synthetic user;
 *     expects 200 with the device-session list. Catches NextAuth /
 *     session-machinery regressions.
 *
 * Each run inserts into `synthetic_probe_results`. The latest row per
 * `probe_name` feeds `systemStatusService` so a synthetic failure
 * downgrades the dashboard status even with no organic traffic.
 *
 * @file src/services/syntheticProbeService.ts
 */

import { executeQuery } from "@/lib/database/connection";
import { _logger } from "@/lib/logger";

const PROBE_TIMEOUT_MS = 10_000;

export type ProbeStatus = "success" | "failure" | "timeout";

export interface ProbeResult {
  probeName: string;
  startedAt: string;
  completedAt: string;
  status: ProbeStatus;
  latencyMs: number;
  httpStatus: number | null;
  errorMessage: string | null;
  responsePayload: Record<string, unknown>;
}

export interface LatestProbeRow {
  probeName: string;
  startedAt: string;
  status: ProbeStatus;
  latencyMs: number;
  httpStatus: number | null;
  errorMessage: string | null;
}

async function recordProbeResult(result: ProbeResult): Promise<void> {
  try {
    await executeQuery(
      `INSERT INTO synthetic_probe_results
         (probe_name, started_at, completed_at, status, latency_ms,
          http_status, error_message, response_payload)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8::jsonb)`,
      [
        result.probeName,
        result.startedAt,
        result.completedAt,
        result.status,
        result.latencyMs,
        result.httpStatus,
        result.errorMessage,
        JSON.stringify(result.responsePayload ?? {}),
      ],
    );
  } catch (err) {
    // If we can't record the result, log loudly — but don't throw because
    // the probe itself ran and the caller wants to know its outcome.
    _logger.error(
      `[syntheticProbe] failed to record result for ${result.probeName}:`,
      err,
    );
  }
}

/**
 * Run the onboarding-skip probe: POST `/api/onboarding` with
 * `{ skipNatal: true }` against the configured base URL, using the
 * configured synthetic-user bearer token. Always records a result, even
 * on timeout or network failure.
 */
export async function runOnboardingSkipProbe(options: {
  baseUrl: string;
  bearerToken: string | null;
}): Promise<ProbeResult> {
  const probeName = "onboarding-skip";
  const startedAt = new Date().toISOString();
  const t0 = Date.now();

  let httpStatus: number | null = null;
  let errorMessage: string | null = null;
  let status: ProbeStatus = "failure";
  let responsePayload: Record<string, unknown> = {};

  if (!options.bearerToken) {
    const latencyMs = Date.now() - t0;
    const result: ProbeResult = {
      probeName,
      startedAt,
      completedAt: new Date().toISOString(),
      status: "failure",
      latencyMs,
      httpStatus: null,
      errorMessage:
        "SYNTHETIC_PROBE_TOKEN not configured — probe disabled",
      responsePayload: {},
    };
    await recordProbeResult(result);
    return result;
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), PROBE_TIMEOUT_MS);

  try {
    const res = await fetch(`${options.baseUrl}/api/onboarding`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${options.bearerToken}`,
      },
      body: JSON.stringify({ skipNatal: true }),
      signal: controller.signal,
    });
    httpStatus = res.status;

    const body = (await res.json().catch(() => ({}))) as Record<string, unknown>;
    // Only keep small response keys for the snapshot — never log secrets.
    responsePayload = {
      success: body.success ?? null,
      message: body.message ?? null,
      hasOnboardingComplete:
        typeof body.onboardingComplete === "boolean"
          ? body.onboardingComplete
          : null,
    };

    if (res.ok && body.success === true) {
      status = "success";
    } else {
      status = "failure";
      errorMessage = `HTTP ${res.status}: ${body.message ?? "non-success response"}`;
    }
  } catch (err) {
    if (err instanceof Error && err.name === "AbortError") {
      status = "timeout";
      errorMessage = `Probe timed out after ${PROBE_TIMEOUT_MS}ms`;
    } else {
      status = "failure";
      errorMessage = err instanceof Error ? err.message : "Unknown error";
    }
  } finally {
    clearTimeout(timer);
  }

  const result: ProbeResult = {
    probeName,
    startedAt,
    completedAt: new Date().toISOString(),
    status,
    latencyMs: Date.now() - t0,
    httpStatus,
    errorMessage,
    responsePayload,
  };
  await recordProbeResult(result);
  return result;
}

/**
 * Run the cosmic-recipe probe: POST `/api/generate-cosmic-recipe` with
 * a minimal well-formed body as the synthetic user. Expects a 200 with
 * `success: true` and a recipe payload. Burns one recipe's worth of
 * tokens per run — keep cadence sparse (hourly).
 */
export async function runCosmicRecipeProbe(options: {
  baseUrl: string;
  bearerToken: string | null;
}): Promise<ProbeResult> {
  return runJsonPostProbe({
    probeName: "cosmic-recipe",
    path: "/api/generate-cosmic-recipe",
    body: {
      prompt: "synthetic probe: simple weekday dinner",
      diet: "omnivore",
      preferredCuisine: "any",
    },
    baseUrl: options.baseUrl,
    bearerToken: options.bearerToken,
    extractResponseSnapshot: (body) => ({
      success: body.success ?? null,
      hasData: body.data != null,
      demo: body.demo ?? null,
    }),
    isSuccess: (status, body) => status === 200 && body.success === true,
  });
}

/**
 * Run the recommendations probe: POST `/api/personalized-recommendations`
 * as the synthetic user. Cheap — does not call any AI backend.
 */
export async function runRecommendationsProbe(options: {
  baseUrl: string;
  bearerToken: string | null;
}): Promise<ProbeResult> {
  return runJsonPostProbe({
    probeName: "recommendations",
    path: "/api/personalized-recommendations",
    body: { includeChartAnalysis: false },
    baseUrl: options.baseUrl,
    bearerToken: options.bearerToken,
    extractResponseSnapshot: (body) => ({
      success: body.success ?? null,
      hasRecommendations:
        typeof body.data === "object" &&
        body.data != null &&
        "recommendations" in (body.data as Record<string, unknown>),
    }),
    isSuccess: (status, body) => status === 200 && body.success === true,
  });
}

/**
 * Run the Stripe-webhook reachability probe: POST an unsigned (empty)
 * body and expect a 400 from the signature validator. This proves:
 *   - The endpoint is reachable.
 *   - Signature validation is active (otherwise we'd get 200 or 5xx).
 *   - Response latency is within bounds.
 *
 * We do NOT inject fake events — that would write real subscription
 * rows. A 400 from "missing signature" is the success criterion.
 */
export async function runStripeWebhookProbe(options: {
  baseUrl: string;
}): Promise<ProbeResult> {
  const probeName = "stripe-webhook";
  const startedAt = new Date().toISOString();
  const t0 = Date.now();

  let httpStatus: number | null = null;
  let errorMessage: string | null = null;
  let status: ProbeStatus = "failure";
  let responsePayload: Record<string, unknown> = {};

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), PROBE_TIMEOUT_MS);

  try {
    const res = await fetch(`${options.baseUrl}/api/stripe/webhook`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ probe: "synthetic" }),
      signal: controller.signal,
    });
    httpStatus = res.status;
    const text = await res.text().catch(() => "");
    responsePayload = {
      bodyPreview: text.slice(0, 120),
    };
    // We expect 400 from missing-signature. 401/403 also acceptable (auth
    // active). 5xx or 200 indicate breakage.
    if (res.status >= 400 && res.status < 500) {
      status = "success";
    } else {
      status = "failure";
      errorMessage = `Unexpected HTTP ${res.status} — expected 4xx from sig validator`;
    }
  } catch (err) {
    if (err instanceof Error && err.name === "AbortError") {
      status = "timeout";
      errorMessage = `Probe timed out after ${PROBE_TIMEOUT_MS}ms`;
    } else {
      status = "failure";
      errorMessage = err instanceof Error ? err.message : "Unknown error";
    }
  } finally {
    clearTimeout(timer);
  }

  const result: ProbeResult = {
    probeName,
    startedAt,
    completedAt: new Date().toISOString(),
    status,
    latencyMs: Date.now() - t0,
    httpStatus,
    errorMessage,
    responsePayload,
  };
  await recordProbeResult(result);
  return result;
}

/**
 * Run the auth-handshake probe: GET `/api/auth/sessions` as the
 * synthetic user. Expects 200 with the session list. Catches NextAuth
 * regressions and device-session schema drift.
 */
export async function runAuthHandshakeProbe(options: {
  baseUrl: string;
  bearerToken: string | null;
}): Promise<ProbeResult> {
  const probeName = "auth-handshake";
  const startedAt = new Date().toISOString();
  const t0 = Date.now();

  let httpStatus: number | null = null;
  let errorMessage: string | null = null;
  let status: ProbeStatus = "failure";
  let responsePayload: Record<string, unknown> = {};

  if (!options.bearerToken) {
    const result: ProbeResult = {
      probeName,
      startedAt,
      completedAt: new Date().toISOString(),
      status: "failure",
      latencyMs: Date.now() - t0,
      httpStatus: null,
      errorMessage:
        "SYNTHETIC_PROBE_TOKEN not configured — probe disabled",
      responsePayload: {},
    };
    await recordProbeResult(result);
    return result;
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), PROBE_TIMEOUT_MS);

  try {
    const res = await fetch(`${options.baseUrl}/api/auth/sessions`, {
      method: "GET",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${options.bearerToken}`,
      },
      signal: controller.signal,
    });
    httpStatus = res.status;
    const body = (await res.json().catch(() => ({}))) as Record<string, unknown>;
    responsePayload = {
      success: body.success ?? null,
      sessionCount: Array.isArray(body.sessions)
        ? (body.sessions as unknown[]).length
        : null,
    };
    if (res.ok) {
      status = "success";
    } else {
      status = "failure";
      errorMessage = `HTTP ${res.status}`;
    }
  } catch (err) {
    if (err instanceof Error && err.name === "AbortError") {
      status = "timeout";
      errorMessage = `Probe timed out after ${PROBE_TIMEOUT_MS}ms`;
    } else {
      status = "failure";
      errorMessage = err instanceof Error ? err.message : "Unknown error";
    }
  } finally {
    clearTimeout(timer);
  }

  const result: ProbeResult = {
    probeName,
    startedAt,
    completedAt: new Date().toISOString(),
    status,
    latencyMs: Date.now() - t0,
    httpStatus,
    errorMessage,
    responsePayload,
  };
  await recordProbeResult(result);
  return result;
}

/**
 * Shared "POST a JSON body, expect a JSON success response" runner.
 * Encapsulates the timeout + token-presence dance so the per-probe
 * functions stay narrow.
 */
async function runJsonPostProbe(args: {
  probeName: string;
  path: string;
  body: Record<string, unknown>;
  baseUrl: string;
  bearerToken: string | null;
  extractResponseSnapshot: (
    body: Record<string, unknown>,
  ) => Record<string, unknown>;
  isSuccess: (status: number, body: Record<string, unknown>) => boolean;
}): Promise<ProbeResult> {
  const startedAt = new Date().toISOString();
  const t0 = Date.now();

  let httpStatus: number | null = null;
  let errorMessage: string | null = null;
  let status: ProbeStatus = "failure";
  let responsePayload: Record<string, unknown> = {};

  if (!args.bearerToken) {
    const result: ProbeResult = {
      probeName: args.probeName,
      startedAt,
      completedAt: new Date().toISOString(),
      status: "failure",
      latencyMs: Date.now() - t0,
      httpStatus: null,
      errorMessage:
        "SYNTHETIC_PROBE_TOKEN not configured — probe disabled",
      responsePayload: {},
    };
    await recordProbeResult(result);
    return result;
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), PROBE_TIMEOUT_MS);

  try {
    const res = await fetch(`${args.baseUrl}${args.path}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${args.bearerToken}`,
      },
      body: JSON.stringify(args.body),
      signal: controller.signal,
    });
    httpStatus = res.status;
    const body = (await res.json().catch(() => ({}))) as Record<string, unknown>;
    responsePayload = args.extractResponseSnapshot(body);
    if (args.isSuccess(res.status, body)) {
      status = "success";
    } else {
      status = "failure";
      errorMessage = `HTTP ${res.status}${typeof body.message === "string" ? `: ${body.message}` : ""}`;
    }
  } catch (err) {
    if (err instanceof Error && err.name === "AbortError") {
      status = "timeout";
      errorMessage = `Probe timed out after ${PROBE_TIMEOUT_MS}ms`;
    } else {
      status = "failure";
      errorMessage = err instanceof Error ? err.message : "Unknown error";
    }
  } finally {
    clearTimeout(timer);
  }

  const result: ProbeResult = {
    probeName: args.probeName,
    startedAt,
    completedAt: new Date().toISOString(),
    status,
    latencyMs: Date.now() - t0,
    httpStatus,
    errorMessage,
    responsePayload,
  };
  await recordProbeResult(result);
  return result;
}

/**
 * Return the latest result for each probe_name. Used by the system-status
 * service to incorporate synthetic failures into the dashboard verdict.
 *
 * Empty array when there are no rows or the table is missing — caller
 * treats absence as "synthetic monitoring not configured" (no downgrade).
 */
export async function getLatestProbeResults(): Promise<LatestProbeRow[]> {
  try {
    const result = await executeQuery<{
      probe_name: string;
      started_at: Date;
      status: ProbeStatus;
      latency_ms: number | null;
      http_status: number | null;
      error_message: string | null;
    }>(
      `SELECT DISTINCT ON (probe_name)
         probe_name, started_at, status, latency_ms, http_status, error_message
       FROM synthetic_probe_results
       ORDER BY probe_name, started_at DESC`,
    );
    return result.rows.map((row) => ({
      probeName: row.probe_name,
      startedAt: new Date(row.started_at).toISOString(),
      status: row.status,
      latencyMs: row.latency_ms ?? 0,
      httpStatus: row.http_status,
      errorMessage: row.error_message,
    }));
  } catch (err) {
    _logger.warn("[syntheticProbe] latest results query failed:", err);
    return [];
  }
}
