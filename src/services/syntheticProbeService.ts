/**
 * Synthetic Probe Service
 *
 * Cron-driven health checks that exercise critical flows end-to-end. At
 * the 10-user stage organic traffic is too sparse to catch breakage in
 * real time — a single broken onboarding flow could sit silent for days.
 * Synthetic probes provide a constant-pace heartbeat.
 *
 * Currently:
 *   - `onboarding-skip` — exercises POST /api/onboarding the skip path
 *     against a dedicated synthetic test user. Records latency, HTTP
 *     status, and a snapshot of the response.
 *
 * Each run inserts into `synthetic_probe_results`. The latest row per
 * `probe_name` feeds `systemStatusService.probeOnboarding()` so a
 * synthetic failure downgrades the dashboard status even with no
 * organic traffic.
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
