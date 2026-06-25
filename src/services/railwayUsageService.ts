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
 * Fails OPEN. With no RAILWAY_API_TOKEN configured (or on any error/timeout),
 * `fetchRailwayResourceUsage` returns null and the panel shows its honest
 * "not connected" state — it never invents numbers.
 *
 * Setup: create a Railway **account or team** API token (Bearer-authed) and set
 * it as RAILWAY_API_TOKEN. RAILWAY_PROJECT_ID defaults to the alchm.kitchen
 * production project but can be overridden.
 */

import { _logger } from "@/lib/logger";

const RAILWAY_GRAPHQL_ENDPOINT = "https://backboard.railway.com/graphql/v2";
const DEFAULT_PROJECT_ID = "29768485-d0da-48ab-aedf-5cbc142e0f3f"; // alchm.kitchen prod
const REQUEST_TIMEOUT_MS = 6000;

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
 * Fetch real Railway resource usage for the current month. Returns null when
 * the API token is unconfigured or any error occurs (callers show the honest
 * "not connected" state instead of fabricating).
 */
export async function fetchRailwayResourceUsage(): Promise<RailwayResourceUsage | null> {
  const token = process.env.RAILWAY_API_TOKEN;
  if (!token) return null;

  const projectId = process.env.RAILWAY_PROJECT_ID || DEFAULT_PROJECT_ID;
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

  if (mtdRows === null) return null; // no real MTD data → honest no-source

  const mtdByMeasurement = new Map(
    mtdRows.map((r) => [r.measurement, Number(r.value) || 0]),
  );
  const projectedByMeasurement = new Map(
    (projectedRows ?? []).map((r) => [
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

  return { items, provider: "Railway", periodLabel: label };
}

/**
 * Issue one Railway GraphQL query and return the named field's rows, or null on
 * any failure (HTTP error, GraphQL error, timeout). Each call is independently
 * fault-isolated so the two usage queries don't take each other down.
 */
async function railwayGraphql<T>(
  token: string,
  query: string,
  variables: Record<string, unknown>,
  field: string,
): Promise<T[] | null> {
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
    if (!resp.ok) {
      _logger.warn(`[railwayUsage] HTTP ${resp.status} on ${field}`);
      return null;
    }
    const json = (await resp.json()) as {
      data?: Record<string, T[] | undefined>;
      errors?: Array<{ message: string }>;
    };
    const rows = json.data?.[field];
    if (json.errors?.length || !rows) {
      _logger.warn(
        `[railwayUsage] ${field} error: ${json.errors?.[0]?.message ?? "no data"}`,
      );
      return null;
    }
    return rows;
  } catch (error) {
    _logger.warn(`[railwayUsage] ${field} fetch failed:`, error);
    return null;
  } finally {
    clearTimeout(timer);
  }
}
