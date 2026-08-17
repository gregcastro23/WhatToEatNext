/**
 * Health Snapshot Service
 *
 * Captures hourly point-in-time snapshots of the full system-status
 * payload to `system_health_snapshots`. The snapshot is the source of
 * truth for:
 *
 *   - Week-over-week drift detection (compare last-week vs this-week
 *     incident rate per flow).
 *   - Transition-based alerting — alertService reads the previous
 *     snapshot, compares it to the new one, and fires alerts on
 *     OK -> DEGRADED -> INCIDENT changes.
 *   - Operator history view ("what did the dashboard say at 03:00 last
 *     Tuesday?") without keeping a tab open.
 *
 * Cron writes one row per hour; reads pick the most recent N. The full
 * payload is preserved in JSONB so drilling into per-flow state is just
 * a JSON path query — no schema migration needed when we add new flows.
 *
 * @file src/services/healthSnapshotService.ts
 */

import { executeQuery } from "@/lib/database/connection";
import { _logger } from "@/lib/logger";
import type {
  FlowStatus,
  SystemStatusPayload,
} from "@/services/systemStatusService";

export interface SnapshotRow {
  id: number;
  capturedAt: string;
  overall: FlowStatus;
  flowCount: number;
  dependencyCount: number;
  payload: SystemStatusPayload;
}

/**
 * Write one snapshot of the system-status payload. Returns the inserted
 * row id (used by alertService to link emitted alerts back to their
 * triggering snapshot).
 */
export async function writeSnapshot(
  payload: SystemStatusPayload,
): Promise<number | null> {
  try {
    const result = await executeQuery<{ id: number }>(
      `INSERT INTO system_health_snapshots
         (captured_at, overall, flow_count, dependency_count, payload)
       VALUES ($1, $2, $3, $4, $5::jsonb)
       RETURNING id`,
      [
        payload.generatedAt,
        payload.overall,
        payload.flows.length,
        payload.dependencies.length,
        JSON.stringify(payload),
      ],
    );
    return result.rows[0]?.id ?? null;
  } catch (err) {
    _logger.error("[healthSnapshot] failed to write snapshot:", err);
    return null;
  }
}

/**
 * Most recent snapshot or null when the table is empty. Used by
 * alertService to compute a transition against the new payload.
 */
export async function getLatestSnapshot(): Promise<SnapshotRow | null> {
  try {
    const result = await executeQuery<{
      id: number;
      captured_at: Date;
      overall: FlowStatus;
      flow_count: number;
      dependency_count: number;
      payload: SystemStatusPayload;
    }>(
      `SELECT id, captured_at, overall, flow_count, dependency_count, payload
       FROM system_health_snapshots
       ORDER BY captured_at DESC
       LIMIT 1`,
    );
    const [row] = result.rows;
    if (!row) return null;
    return {
      id: row.id,
      capturedAt: new Date(row.captured_at).toISOString(),
      overall: row.overall,
      flowCount: row.flow_count,
      dependencyCount: row.dependency_count,
      payload: row.payload,
    };
  } catch (err) {
    _logger.warn("[healthSnapshot] latest snapshot query failed:", err);
    return null;
  }
}

/**
 * Compact view of recent snapshots — overall status + timestamp only.
 * Used for the admin sparkline / drift indicator without paying the cost
 * of pulling the full payload JSON for each row.
 */
export interface RecentSnapshotPoint {
  capturedAt: string;
  overall: FlowStatus;
}

export async function getRecentSnapshotOverall(
  limit = 168, // one week at hourly cadence
  windowHours?: number,
): Promise<RecentSnapshotPoint[]> {
  try {
    // `limit` alone reaches arbitrarily far back when the cron has gaps, which
    // makes an "uptime over the last week" figure silently cover more than a
    // week. Callers that need a true window pass `windowHours` and get rows
    // bounded by time as well as by count.
    const boundedHours =
      windowHours === undefined
        ? null
        : Math.max(1, Math.min(Math.floor(windowHours), 720));

    const result = await executeQuery<{
      captured_at: Date;
      overall: FlowStatus;
    }>(
      boundedHours === null
        ? `SELECT captured_at, overall
           FROM system_health_snapshots
           ORDER BY captured_at DESC
           LIMIT $1`
        : `SELECT captured_at, overall
           FROM system_health_snapshots
           WHERE captured_at > now() - make_interval(hours => $2)
           ORDER BY captured_at DESC
           LIMIT $1`,
      boundedHours === null
        ? [Math.max(1, Math.min(limit, 720))]
        : [Math.max(1, Math.min(limit, 720)), boundedHours],
    );
    return result.rows.map((row) => ({
      capturedAt: new Date(row.captured_at).toISOString(),
      overall: row.overall,
    }));
  } catch (err) {
    _logger.warn("[healthSnapshot] recent snapshots query failed:", err);
    return [];
  }
}
