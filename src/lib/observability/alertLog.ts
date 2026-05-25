/**
 * In-memory alert log
 *
 * Bounded ring of the most recent operator alerts. Persisted writes live
 * in `alert_events` (durable); this ring backs the admin "recent alerts"
 * panel without paying a DB round-trip on every poll.
 *
 * Process restarts wipe the ring — that's fine because the admin panel
 * hydrates the table from the DB on first read after cold start.
 *
 * @file src/lib/observability/alertLog.ts
 */

import type { FlowStatus } from "@/services/systemStatusService";

export type AlertSeverity = "info" | "warn" | "error";

export interface AlertLogEntry {
  id: number;
  at: string;
  component: string;
  previous: FlowStatus;
  current: FlowStatus;
  severity: AlertSeverity;
  title: string;
  message: string;
  dispatch: AlertDispatchSummary;
}

export interface AlertDispatchSummary {
  slack?: { ok: boolean; error?: string };
  email?: { ok: boolean; error?: string };
  // Set when alertService skipped Slack/email because this (component,
  // current_status) pair was already dispatched within the cooldown window.
  // The DB row + ring entry are still recorded so the audit trail catches
  // flapping; the sinks just don't fire.
  suppressed?: boolean;
  suppressionReason?: string;
}

const RING_SIZE = 100;
const ring: AlertLogEntry[] = [];
let nextId = 1;

export interface RecordAlertOptions {
  component: string;
  previous: FlowStatus;
  current: FlowStatus;
  severity: AlertSeverity;
  title: string;
  message: string;
  dispatch?: AlertDispatchSummary;
}

export function recordAlert(opts: RecordAlertOptions): AlertLogEntry {
  const entry: AlertLogEntry = {
    id: nextId++,
    at: new Date().toISOString(),
    component: opts.component,
    previous: opts.previous,
    current: opts.current,
    severity: opts.severity,
    title: opts.title,
    message: opts.message,
    dispatch: opts.dispatch ?? {},
  };
  ring.push(entry);
  if (ring.length > RING_SIZE) ring.shift();
  return entry;
}

export function getRecentAlerts(limit: number = 50): AlertLogEntry[] {
  const n = Math.min(Math.max(limit, 1), RING_SIZE);
  return ring.slice().reverse().slice(0, n);
}

/**
 * Replace the in-memory ring with rows pulled from DB on cold start.
 * Caller is responsible for ordering by `at` ASC so the latest entry
 * ends at the tail of the ring (matches insertion order).
 */
export function hydrateAlertRing(entries: AlertLogEntry[]): void {
  ring.length = 0;
  for (const e of entries.slice(-RING_SIZE)) ring.push(e);
  if (entries.length > 0) {
    nextId = Math.max(nextId, ...entries.map((e) => e.id)) + 1;
  }
}
