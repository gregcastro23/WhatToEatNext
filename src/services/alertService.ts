/**
 * Alert Service
 *
 * Detects system-status transitions and dispatches alerts to operator
 * sinks. Each dispatch is recorded in `alert_events` (the source of
 * truth) and an in-memory ring (the fast read path for the admin
 * dashboard's recent-alerts panel).
 *
 * Transition rules — keep the noise floor low:
 *
 *   - Same-level transitions don't alert (OK -> OK, INCIDENT -> INCIDENT).
 *   - UNKNOWN transitions don't alert in either direction — they reflect
 *     monitoring loss, not system health. We can't claim healthy if we
 *     can't see, but we shouldn't page on instrumentation gaps either.
 *   - Recoveries (DEGRADED/INCIDENT -> OK) DO alert as `info` severity
 *     so an operator knows the green is "real" without staring at the
 *     dashboard.
 *   - Worsenings (OK -> DEGRADED, OK -> INCIDENT, DEGRADED -> INCIDENT)
 *     alert as `warn` or `error` based on terminal status.
 *
 * Each sink (DB, Slack, email) dispatches independently with try/catch
 * — a broken webhook URL doesn't block the email and vice versa.
 *
 * @file src/services/alertService.ts
 */

import { ADMIN_EMAILS } from "@/lib/auth/adminEmails";
import { executeQuery } from "@/lib/database/connection";
import { _logger } from "@/lib/logger";
import { renderAlertEmail } from "@/lib/notifications/alertEmail";
import { sendSlackAlert } from "@/lib/notifications/slackNotifier";
import {
  recordAlert,
  type AlertDispatchSummary,
  type AlertLogEntry,
  type AlertSeverity,
} from "@/lib/observability/alertLog";
import emailService from "@/services/emailService";
import type {
  DependencyHealth,
  FlowHealth,
  FlowStatus,
  SystemStatusPayload,
} from "@/services/systemStatusService";

export interface AlertCandidate {
  component: string;
  componentLabel: string;
  previous: FlowStatus;
  current: FlowStatus;
  severity: AlertSeverity;
  title: string;
  message: string;
}

export interface DispatchedAlert extends AlertCandidate {
  id: number;
  triggeredAt: string;
  dispatch: AlertDispatchSummary;
}

const SEVERITY_BY_TERMINAL: Record<FlowStatus, AlertSeverity> = {
  OK: "info",
  DEGRADED: "warn",
  INCIDENT: "error",
  UNKNOWN: "info",
};

/**
 * Decide whether a (previous, current) pair warrants an alert and, if
 * so, return the candidate. Pure — exported for unit tests.
 */
export function classifyTransition(
  component: string,
  componentLabel: string,
  previous: FlowStatus,
  current: FlowStatus,
  summary: string,
): AlertCandidate | null {
  if (previous === current) return null;
  // UNKNOWN swaps reflect monitoring loss, not health.
  if (previous === "UNKNOWN" || current === "UNKNOWN") return null;

  const severity = SEVERITY_BY_TERMINAL[current];
  const direction =
    current === "OK"
      ? "recovered"
      : worsened(previous, current)
        ? "worsened"
        : "changed";

  const title =
    direction === "recovered"
      ? `${componentLabel} recovered`
      : direction === "worsened"
        ? `${componentLabel} ${current === "INCIDENT" ? "incident" : "degraded"}`
        : `${componentLabel} status changed`;

  return {
    component,
    componentLabel,
    previous,
    current,
    severity,
    title,
    message: summary,
  };
}

function worsened(previous: FlowStatus, current: FlowStatus): boolean {
  const rank: Record<FlowStatus, number> = {
    OK: 0,
    UNKNOWN: 1,
    DEGRADED: 2,
    INCIDENT: 3,
  };
  return rank[current] > rank[previous];
}

/**
 * Compare a previous system-status payload to a new one and return the
 * set of alert candidates worth dispatching. Pure — exported for tests.
 */
export function diffPayloadsForAlerts(
  previous: SystemStatusPayload,
  current: SystemStatusPayload,
): AlertCandidate[] {
  const candidates: AlertCandidate[] = [];

  // Aggregate transition first — surfaces a single banner alert for the
  // operator instead of N per-flow alerts when something goes broadly red.
  const aggregate = classifyTransition(
    "system",
    "System overall",
    previous.overall,
    current.overall,
    `System overall ${previous.overall} → ${current.overall}.`,
  );
  if (aggregate) candidates.push(aggregate);

  const prevFlowsById = new Map<string, FlowHealth>(
    previous.flows.map((f) => [f.id, f]),
  );
  for (const flow of current.flows) {
    const prev = prevFlowsById.get(flow.id);
    if (!prev) continue;
    const t = classifyTransition(
      flow.id,
      flow.label,
      prev.status,
      flow.status,
      flow.summary,
    );
    if (t) candidates.push(t);
  }

  const prevDepsById = new Map<string, DependencyHealth>(
    previous.dependencies.map((d) => [d.id, d]),
  );
  for (const dep of current.dependencies) {
    const prev = prevDepsById.get(dep.id);
    if (!prev) continue;
    const t = classifyTransition(
      dep.id,
      dep.label,
      prev.status,
      dep.status,
      dep.summary,
    );
    if (t) candidates.push(t);
  }

  return candidates;
}

/**
 * Dispatch a single alert candidate to all enabled sinks. Logs the
 * outcome to `alert_events` + in-memory ring. Returns the dispatched
 * record (with per-sink outcomes) so callers can summarize.
 */
export async function dispatchAlert(
  candidate: AlertCandidate,
  options: { snapshotId?: number | null } = {},
): Promise<DispatchedAlert> {
  const triggeredAt = new Date().toISOString();

  const [slackResult, emailResult] = await Promise.all([
    sendSlackAlert({
      title: candidate.title,
      message: candidate.message,
      component: candidate.componentLabel,
      previous: candidate.previous,
      current: candidate.current,
      severity: candidate.severity,
    }).catch((err) => ({
      ok: false,
      error: err instanceof Error ? err.message : "unknown",
    })),
    sendAlertEmail(candidate).catch((err) => ({
      ok: false,
      error: err instanceof Error ? err.message : "unknown",
    })),
  ]);

  const dispatch: AlertDispatchSummary = {
    slack: slackResult,
    email: emailResult,
  };

  const dbId = await persistAlertEvent({
    triggeredAt,
    candidate,
    dispatch,
    snapshotId: options.snapshotId ?? null,
  });

  const ringEntry: AlertLogEntry = recordAlert({
    component: candidate.component,
    previous: candidate.previous,
    current: candidate.current,
    severity: candidate.severity,
    title: candidate.title,
    message: candidate.message,
    dispatch,
  });

  return {
    ...candidate,
    id: dbId ?? ringEntry.id,
    triggeredAt,
    dispatch,
  };
}

async function sendAlertEmail(
  candidate: AlertCandidate,
): Promise<{ ok: boolean; error?: string }> {
  emailService.ensureInitialized();
  if (!emailService.isConfigured()) {
    return { ok: false, error: "Email service not configured" };
  }
  const recipients = ADMIN_EMAILS.filter(
    (e): e is string => typeof e === "string" && e.length > 0,
  );
  if (recipients.length === 0) {
    return { ok: false, error: "No admin recipients" };
  }
  const { subject, html, text } = renderAlertEmail({
    title: candidate.title,
    message: candidate.message,
    component: candidate.componentLabel,
    previous: candidate.previous,
    current: candidate.current,
    severity: candidate.severity,
  });
  const results = await Promise.all(
    recipients.map((to) =>
      emailService.sendEmail({ to, subject, html, text }).catch((err) => {
        _logger.warn(`[alertService] email to ${to} threw:`, err);
        return false;
      }),
    ),
  );
  const anyOk = results.some((ok) => ok);
  if (!anyOk) return { ok: false, error: "All recipients failed" };
  return { ok: true };
}

async function persistAlertEvent(args: {
  triggeredAt: string;
  candidate: AlertCandidate;
  dispatch: AlertDispatchSummary;
  snapshotId: number | null;
}): Promise<number | null> {
  try {
    const result = await executeQuery<{ id: number }>(
      `INSERT INTO alert_events
         (triggered_at, component, previous_status, current_status,
          severity, title, message, snapshot_id, dispatch)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9::jsonb)
       RETURNING id`,
      [
        args.triggeredAt,
        args.candidate.component,
        args.candidate.previous,
        args.candidate.current,
        args.candidate.severity,
        args.candidate.title,
        args.candidate.message,
        args.snapshotId,
        JSON.stringify(args.dispatch),
      ],
    );
    return result.rows[0]?.id ?? null;
  } catch (err) {
    _logger.error("[alertService] failed to persist alert_event:", err);
    return null;
  }
}

/**
 * Top-level helper used by the snapshot cron: compute transitions
 * between two payloads and dispatch each. Returns the dispatched alerts
 * in the order they were emitted.
 */
export async function dispatchTransitions(
  previous: SystemStatusPayload | null,
  current: SystemStatusPayload,
  options: { snapshotId?: number | null } = {},
): Promise<DispatchedAlert[]> {
  if (!previous) return [];
  const candidates = diffPayloadsForAlerts(previous, current);
  const dispatched: DispatchedAlert[] = [];
  for (const c of candidates) {
    dispatched.push(await dispatchAlert(c, options));
  }
  return dispatched;
}

/**
 * Pull persisted alerts from DB and replace the in-memory ring. Called
 * once on first read after cold start (admin endpoint hydration).
 */
export async function hydrateAlertRingFromDb(): Promise<number> {
  try {
    const result = await executeQuery<{
      id: number;
      triggered_at: Date;
      component: string;
      previous_status: FlowStatus;
      current_status: FlowStatus;
      severity: AlertSeverity;
      title: string;
      message: string;
      dispatch: AlertDispatchSummary;
    }>(
      `SELECT id, triggered_at, component, previous_status, current_status,
              severity, title, message, dispatch
       FROM alert_events
       ORDER BY triggered_at ASC
       LIMIT 100`,
    );
    const { hydrateAlertRing } = await import("@/lib/observability/alertLog");
    hydrateAlertRing(
      result.rows.map((r) => ({
        id: r.id,
        at: new Date(r.triggered_at).toISOString(),
        component: r.component,
        previous: r.previous_status,
        current: r.current_status,
        severity: r.severity,
        title: r.title,
        message: r.message,
        dispatch: r.dispatch ?? {},
      })),
    );
    return result.rows.length;
  } catch (err) {
    _logger.warn("[alertService] hydration failed:", err);
    return 0;
  }
}
