/**
 * Provenance of the MCP network summary: where the numbers came from, and when
 * Planetary Agents (PA) was not used, why.
 *
 * `/admin/mcp` reads through the WTEN proxy `/api/admin/mcp-summary`, which used to
 * answer from WTEN's own `mcp_invocations` / `feed_events` whenever PA could not be
 * read, and return that as `live: true` with nothing saying so. The page then
 * printed "Planetary Agents status healthy" over WTEN-local data, while the Control
 * Plane (which calls PA directly) said "PA telemetry unavailable": two panels, one
 * of them mislabelling its source. `source` and `fallbackReason` make the source
 * explicit, and `logMcpFallback` makes the reason visible in production logs.
 *
 * WHY PA FAILS from the server is NOT known; this only records which step failed.
 *
 * @file src/services/mcpFallback.ts
 */

import { _logger } from "@/lib/logger";

/** Where a summary's numbers came from. Absent on older payloads, which read as PA. */
export type McpSource = "pa" | "wten-local";

/** The step at which Planetary Agents was not used. `http_<status>` carries the status. */
export type McpFallbackReason =
  | "no_internal_secret"
  | "timeout"
  | "unreachable"
  | "malformed_response"
  | "pa_not_live"
  | "pa_reported_no_calls"
  | `http_${number}`;

export function reasonFromStatus(status: number): McpFallbackReason {
  return `http_${status}`;
}

/**
 * The error's `name`, read structurally. `instanceof Error` is false for an error
 * created in another realm (a `DOMException` from `AbortSignal.timeout`, or a
 * `SyntaxError` from `Response.json()`, under Jest's sandbox), and it would have
 * filed a timeout as "unreachable".
 */
function errorName(error: unknown): string {
  if (typeof error === "object" && error !== null && "name" in error && typeof error.name === "string") {
    return error.name;
  }
  return "";
}

/** Classify a thrown error from the PA call: a timeout, an unreadable body, or the network. */
export function reasonFromError(error: unknown): McpFallbackReason {
  const name = errorName(error);
  if (name === "TimeoutError" || name === "AbortError") return "timeout";
  if (name === "SyntaxError" || name === "ZodError") return "malformed_response";
  return "unreachable";
}

/** The reason as a clause for an operator, e.g. "it answered HTTP 401". */
export function describeFallbackReason(reason: string | undefined): string {
  switch (reason) {
    case undefined:
      return "the reason was not recorded";
    case "no_internal_secret":
      return "WTEN has no INTERNAL_API_SECRET to call it with";
    case "timeout":
      return "the call timed out";
    case "unreachable":
      return "the call failed at the network level";
    case "malformed_response":
      return "it answered with a body WTEN could not read";
    case "pa_not_live":
      return "it reported itself not live";
    case "pa_reported_no_calls":
      return "it reported no MCP calls in this window";
    default: {
      const status = /^http_(\d+)$/.exec(reason)?.[1];
      return status ? `it answered HTTP ${status}` : reason;
    }
  }
}

/** One log line per scope and reason per window: the page polls, so an outage must not flood the log. */
const LOG_WINDOW_MS = 10 * 60_000;
const lastLoggedAt = new Map<string, number>();

/**
 * Log, once per {@link LOG_WINDOW_MS}, that PA was not used and why. Uses
 * `_logger.error` because `warn` is silent in production. `pa_reported_no_calls`
 * is an idle PA, not a failure, and is never logged.
 */
export function logMcpFallback(scope: string, reason: McpFallbackReason, nowMs: number = Date.now()): void {
  if (reason === "pa_reported_no_calls") return;
  const key = `${scope}:${reason}`;
  const last = lastLoggedAt.get(key);
  if (last !== undefined && nowMs - last < LOG_WINDOW_MS) return;
  lastLoggedAt.set(key, nowMs);
  _logger.error(`[${scope}] Planetary Agents MCP summary not used: ${reason} (${describeFallbackReason(reason)})`);
}

/** Test seam: forget what has been logged. */
export function resetMcpFallbackLog(): void {
  lastLoggedAt.clear();
}
