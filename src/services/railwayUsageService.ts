/**
 * Railway resource-usage reader.
 *
 * Powers the admin dashboard's "Resource Usage · MTD" panel with REAL metered
 * usage from Railway's GraphQL API — month-to-date actual (`usage`) and the
 * projected month-end estimate (`estimatedUsage`) per resource measurement.
 *
 * This deliberately reports metered *quantities* (vCPU·hr, GB·hr, GB egress),
 * NOT dollars: Railway's API exposes usage measurements but no authoritative
 * cost figure, so dollarizing would require hardcoding per-unit prices — the
 * same fabrication the old "Cost Burndown" panel was removed for (PR #553).
 *
 * Fails OPEN, and says WHY. `readRailwayResourceUsage` returns one of three
 * outcomes: `ok`, `no-token` (RAILWAY_API_TOKEN unset), or `failed` (token set,
 * the call did not succeed, with a one-line reason). The panel shows a
 * different honest state for each — it never invents numbers, and it never says
 * "set the token" when the token is set. Every failure is logged with
 * `_logger.error` (`warn` is silent in production); the token is never logged.
 *
 * Setup: create a Railway **account or team** API token (Bearer-authed) and set
 * it as RAILWAY_API_TOKEN. RAILWAY_PROJECT_ID defaults to the alchm.kitchen
 * production project but can be overridden.
 */

import { readJson } from "@/lib/api/json";
import { _logger } from "@/lib/logger";
import { RailwayGraphQLResponseSchema } from "@/lib/validation/serviceResponseSchemas";

const RAILWAY_GRAPHQL_ENDPOINT = "https://backboard.railway.com/graphql/v2";
const DEFAULT_PROJECT_ID = "29768485-d0da-48ab-aedf-5cbc142e0f3f"; // alchm.kitchen prod
const REQUEST_TIMEOUT_MS = 6000;
/** Bound on the failure reason that goes into a log line and the panel payload. */
const MAX_REASON_LENGTH = 200;

/** The measurements we surface, in display order, with friendly labels + units. */
const MEASUREMENTS: Array<{
  measurement: string;
  resource: string;
  unit: string;
}> = [
  { measurement: "CPU_USAGE", resource: "CPU", unit: "vCPU·hr" },
  { measurement: "MEMORY_USAGE_GB", resource: "Memory", unit: "GB·hr" },
  { measurement: "DISK_USAGE_GB", resource: "Disk", unit: "GB·hr" },
  { measurement: "NETWORK_TX_GB", resource: "Egress", unit: "GB" },
];

export interface ResourceUsageItem {
  /** Friendly resource name, e.g. "Memory". */
  resource: string;
  /** Raw Railway measurement enum, e.g. "MEMORY_USAGE_GB". */
  measurement: string;
  /** Unit label for the values. */
  unit: string;
  /** Month-to-date actual metered usage. */
  mtdValue: number;
  /** Projected month-end usage (Railway estimate). */
  projectedValue: number;
  /** mtdValue / projectedValue, clamped to 0..1 (month progress in usage terms). */
  pct: number;
}

export interface RailwayResourceUsage {
  items: ResourceUsageItem[];
  provider: "Railway";
  periodLabel: string;
}

/** What one read of Railway's usage API came to. `reason` never contains the token. */
export type RailwayUsageOutcome =
  | { status: "ok"; usage: RailwayResourceUsage }
  | { status: "no-token" }
  | { status: "failed"; reason: string };

type GraphqlResult<T> = { ok: true; rows: T[] } | { ok: false; reason: string };

interface UsageRow {
  measurement: string;
  value: number;
}
interface EstimatedRow {
  measurement: string;
  estimatedValue: number;
}

function monthWindow(): { start: string; end: string; label: string } {
  const now = new Date();
  const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
  const label = `${start.toLocaleString("en-US", { month: "short", timeZone: "UTC" })} ${start.getUTCFullYear()} MTD`;
  return { start: start.toISOString(), end: now.toISOString(), label };
}

/**
 * Fetch real Railway resource usage for the current month. Never throws and
 * never fabricates: no token → `no-token`; any failure of the primary (MTD)
 * query → `failed` with its reason; the projected estimate is best-effort.
 */
export async function readRailwayResourceUsage(): Promise<RailwayUsageOutcome> {
  const token = process.env.RAILWAY_API_TOKEN;
  if (!token) return { status: "no-token" };

  const projectId = process.env.RAILWAY_PROJECT_ID ?? DEFAULT_PROJECT_ID;
  const measurements = MEASUREMENTS.map((m) => m.measurement);
  const { start, end, label } = monthWindow();

  // Railway rejects `usage` + `estimatedUsage` combined in one query
  // ("Not Authorized" on the second resolver), so issue them as two parallel
  // requests. MTD (`usage`) is the primary signal — without it we have no real
  // data; the projected estimate is best-effort (projectedValue stays 0 if it
  // fails), so a hiccup on one never blanks the whole panel.
  const [mtdRows, projectedRows] = await Promise.all([
    railwayGraphql<UsageRow>(
      token,
      `query ($m: [MetricMeasurement!]!, $p: String!, $s: DateTime!, $e: DateTime!) {
        usage(measurements: $m, projectId: $p, startDate: $s, endDate: $e) { measurement value }
      }`,
      { m: measurements, p: projectId, s: start, e: end },
      "usage",
    ),
    railwayGraphql<EstimatedRow>(
      token,
      `query ($m: [MetricMeasurement!]!, $p: String!) {
        estimatedUsage(measurements: $m, projectId: $p) { measurement estimatedValue }
      }`,
      { m: measurements, p: projectId },
      "estimatedUsage",
    ),
  ]);

  if (!mtdRows.ok) return { status: "failed", reason: mtdRows.reason }; // no real MTD data → honest failure

  const mtdByMeasurement = new Map(
    mtdRows.rows.map((r) => [r.measurement, Number(r.value) || 0]),
  );
  const projectedByMeasurement = new Map(
    (projectedRows.ok ? projectedRows.rows : []).map((r) => [
      r.measurement,
      Number(r.estimatedValue) || 0,
    ]),
  );

  const items: ResourceUsageItem[] = MEASUREMENTS.map(
    ({ measurement, resource, unit }) => {
      const mtdValue = mtdByMeasurement.get(measurement) ?? 0;
      const projectedValue = projectedByMeasurement.get(measurement) ?? 0;
      const pct =
        projectedValue > 0
          ? Math.min(1, Math.max(0, mtdValue / projectedValue))
          : 0;
      return { resource, measurement, unit, mtdValue, projectedValue, pct };
    },
  );

  return { status: "ok", usage: { items, provider: "Railway", periodLabel: label } };
}

/** The token must never reach a log line or a payload, whatever Railway echoes back. */
function withoutToken(text: string, token: string): string {
  return text.split(token).join("[redacted]");
}

function failureReason(error: unknown): string {
  if (error instanceof Error && error.name === "AbortError") return `timed out after ${REQUEST_TIMEOUT_MS / 1000}s`;
  return error instanceof Error ? `${error.name}: ${error.message}` : "unknown error";
}

/**
 * Issue one Railway GraphQL query and return the named field's rows, or the
 * reason it failed (HTTP error, GraphQL error, timeout, bad payload). Each call
 * is independently fault-isolated so the two usage queries don't take each
 * other down. A failure is logged here, once, as one `_logger.error` line:
 * the HTTP status or first GraphQL error message, and which field.
 */
async function railwayGraphql<T>(
  token: string,
  query: string,
  variables: Record<string, unknown>,
  field: string,
): Promise<GraphqlResult<T>> {
  const fail = (detail: string): GraphqlResult<T> => {
    // One line, token-free, bounded: a schema error can be a multi-line JSON dump.
    const reason = withoutToken(`${detail} on ${field}`, token).replace(/\s+/g, " ").slice(0, MAX_REASON_LENGTH);
    _logger.error(`[railwayUsage] ${reason}`);
    return { ok: false, reason };
  };
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    const resp = await fetch(RAILWAY_GRAPHQL_ENDPOINT, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query, variables }),
      signal: controller.signal,
    });
    if (!resp.ok) return fail(`HTTP ${resp.status}`);
    const json = await readJson(resp, {
      parse: RailwayGraphQLResponseSchema.parse,
    });
    const rows = json.data?.[field] as T[] | undefined;
    if (json.errors?.length || !rows) return fail(json.errors?.[0]?.message ?? "no data");
    return { ok: true, rows };
  } catch (error) {
    return fail(failureReason(error));
  } finally {
    clearTimeout(timer);
  }
}
