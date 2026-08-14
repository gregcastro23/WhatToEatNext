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
 *   - Cooldown: a (component, current_status) pair that already fired
 *     within ALERT_COOLDOWN_MINUTES (default 60) records the new alert
 *     event to DB but skips Slack + email. Prevents flapping from
 *     spamming operators while preserving the audit trail.
 *
 * Those rules are all about CHANGE, which left a hole: a component that
 * goes INCIDENT and stays there produces exactly one alert, ever. Measured
 * 2026-08-11 in production, `payments` had been INCIDENT for 35 consecutive
 * hourly snapshots on the strength of a single email sent 35 hours earlier.
 * `collectSustainedReminder` closes that — see the block comment above it.
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
  SUSTAINED_COMPONENT,
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

const DEFAULT_COOLDOWN_MINUTES = 60;

function getCooldownMs(): number {
  const raw = process.env.ALERT_COOLDOWN_MINUTES;
  if (!raw) return DEFAULT_COOLDOWN_MINUTES * 60_000;
  const parsed = Number.parseInt(raw, 10);
  if (!Number.isFinite(parsed) || parsed < 0) {
    return DEFAULT_COOLDOWN_MINUTES * 60_000;
  }
  return parsed * 60_000;
}

/**
 * Pure cooldown decision: given the timestamp of the most recent
 * non-suppressed dispatch for the same (component, current_status) pair,
 * decide whether THIS candidate should be suppressed. Exported for tests.
 *
 * Suppression preserves the DB audit trail (the alert event still
 * persists, just with `dispatch.suppressed = true`) but skips Slack +
 * email so flapping doesn't spam operators.
 *
 * A cooldown of 0 disables suppression entirely (every transition alerts).
 */
export function shouldSuppressAlert(args: {
  lastDispatchAt: string | null;
  now: Date;
  cooldownMs: number;
}): { suppressed: boolean; reason?: string } {
  if (args.cooldownMs <= 0) return { suppressed: false };
  if (!args.lastDispatchAt) return { suppressed: false };
  const lastMs = Date.parse(args.lastDispatchAt);
  if (!Number.isFinite(lastMs)) return { suppressed: false };
  const elapsed = args.now.getTime() - lastMs;
  if (elapsed >= args.cooldownMs) return { suppressed: false };
  const remainingMinutes = Math.ceil((args.cooldownMs - elapsed) / 60_000);
  return {
    suppressed: true,
    reason: `Cooldown active — last alert ${args.lastDispatchAt}; ${remainingMinutes}m left of ${Math.round(args.cooldownMs / 60_000)}m window`,
  };
}

async function getLastNonSuppressedDispatchAt(
  component: string,
  currentStatus: FlowStatus,
  cooldownMs: number,
): Promise<string | null> {
  // No need to query when cooldown is disabled.
  if (cooldownMs <= 0) return null;
  try {
    const result = await executeQuery<{ triggered_at: Date }>(
      // Only consider dispatches that ACTUALLY went out — suppressed rows
      // shouldn't extend the cooldown indefinitely (otherwise one alert
      // followed by N suppressed snapshots would never re-fire).
      `SELECT triggered_at FROM alert_events
       WHERE component = $1
         AND current_status = $2
         AND COALESCE((dispatch->>'suppressed')::boolean, false) = false
         AND triggered_at > NOW() - make_interval(secs => $3)
       ORDER BY triggered_at DESC
       LIMIT 1`,
      [component, currentStatus, cooldownMs / 1000],
    );
    const [row] = result.rows;
    if (!row) return null;
    return new Date(row.triggered_at).toISOString();
  } catch (err) {
    // Fail open: a broken cooldown lookup must not drop real alerts.
    _logger.warn("[alertService] cooldown lookup failed:", err);
    return null;
  }
}

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

// ─── Sustained incidents ────────────────────────────────────────────────
//
// Everything above alerts on TRANSITIONS, so silence means either "nothing is
// wrong" or "everything has been wrong for so long that nothing changed". Those
// are indistinguishable to an operator, and the second one is the emergency.
//
// The reminder is one digest per interval covering every component still in
// INCIDENT, rather than one alert per component: when something goes broadly
// red, per-component reminders would multiply the very noise the cooldown
// exists to prevent. It carries its own synthetic component id so it dedups on
// its own clock and never collides with a real component's transition history.

const DEFAULT_REMINDER_HOURS = 24;

/** Re-alert interval in ms. `ALERT_REMINDER_HOURS=0` disables reminders. */
export function getReminderIntervalMs(): number {
  const raw = process.env.ALERT_REMINDER_HOURS;
  if (!raw) return DEFAULT_REMINDER_HOURS * 3_600_000;
  const parsed = Number(raw);
  if (!Number.isFinite(parsed) || parsed < 0) {
    return DEFAULT_REMINDER_HOURS * 3_600_000;
  }
  return parsed * 3_600_000;
}

export interface SustainedIncident {
  component: string;
  componentLabel: string;
  summary: string;
  /** When the component last entered INCIDENT; null when unrecorded. */
  since: string | null;
}

/**
 * Every flow and dependency currently in INCIDENT. Pure — exported for tests.
 *
 * `overall` is deliberately excluded: it is derived from these, so including it
 * would report the same outage twice in one digest.
 */
export function selectIncidentComponents(
  payload: SystemStatusPayload,
): Array<{ component: string; componentLabel: string; summary: string }> {
  const out: Array<{
    component: string;
    componentLabel: string;
    summary: string;
  }> = [];
  for (const flow of payload.flows) {
    if (flow.status === "INCIDENT") {
      out.push({
        component: flow.id,
        componentLabel: flow.label,
        summary: flow.summary,
      });
    }
  }
  for (const dep of payload.dependencies) {
    if (dep.status === "INCIDENT") {
      out.push({
        component: dep.id,
        componentLabel: dep.label,
        summary: dep.summary,
      });
    }
  }
  return out;
}

function formatDuration(fromIso: string | null, now: Date): string {
  if (!fromIso) return "duration unrecorded";
  const ms = now.getTime() - Date.parse(fromIso);
  if (!Number.isFinite(ms) || ms < 0) return "duration unrecorded";
  const hours = Math.floor(ms / 3_600_000);
  if (hours < 48) return `${hours}h`;
  return `${Math.floor(hours / 24)}d ${hours % 24}h`;
}

/**
 * Build the digest for incidents that have outlasted one reminder interval.
 * Pure — exported for tests.
 *
 * The age filter is what keeps a reminder from arriving alongside the very
 * transition alert that announced the incident: something that broke ten
 * minutes ago is news, not a reminder. An incident with no recorded start is
 * INCLUDED — a component that is red with no transition on file is one whose
 * outage predates our records, which is precisely the case this exists for.
 */
export function buildSustainedReminder(
  incidents: SustainedIncident[],
  now: Date,
  reminderMs: number,
): AlertCandidate | null {
  if (reminderMs <= 0) return null;
  const due = incidents.filter((i) => {
    if (!i.since) return true;
    const started = Date.parse(i.since);
    if (!Number.isFinite(started)) return true;
    return now.getTime() - started >= reminderMs;
  });
  if (due.length === 0) return null;

  const lines = due.map(
    (i) => `• ${i.componentLabel} (${formatDuration(i.since, now)}) — ${i.summary}`,
  );
  const hours = Math.round(reminderMs / 3_600_000);
  return {
    component: SUSTAINED_COMPONENT,
    componentLabel: "Sustained incident",
    // Honest about the shape of the event: nothing changed, and that is the
    // point. It also keeps these rows out of getIncidentStartTimes, so a
    // reminder can never reset the clock it is measuring.
    previous: "INCIDENT",
    current: "INCIDENT",
    severity: "error",
    title:
      due.length === 1
        ? `${due[0].componentLabel} still down (${formatDuration(due[0].since, now)})`
        : `${due.length} components still down`,
    message:
      `Still in INCIDENT with no change since the last alert. ` +
      `Repeats every ${hours}h until resolved.\n\n${lines.join("\n")}`,
  };
}

/**
 * When each component last ENTERED incident, from the transition history.
 *
 * `previous_status <> 'INCIDENT'` is load-bearing twice: it skips the
 * INCIDENT→INCIDENT reminder rows this service writes (which would otherwise
 * reset each component's clock every interval), and it picks the start of the
 * current run rather than any point inside it.
 */
async function getIncidentStartTimes(
  components: string[],
): Promise<Map<string, string>> {
  const starts = new Map<string, string>();
  if (components.length === 0) return starts;
  try {
    const result = await executeQuery<{ component: string; triggered_at: Date }>(
      `SELECT DISTINCT ON (component) component, triggered_at
         FROM alert_events
        WHERE current_status = 'INCIDENT'
          AND previous_status <> 'INCIDENT'
          AND component = ANY($1::text[])
        ORDER BY component, triggered_at DESC`,
      [components],
    );
    for (const row of result.rows) {
      starts.set(row.component, new Date(row.triggered_at).toISOString());
    }
  } catch (err) {
    // Fail open: an unknown start date makes an incident eligible rather than
    // invisible, which is the safer direction for an outage reminder.
    _logger.warn("[alertService] incident-start lookup failed:", err);
  }
  return starts;
}

/**
 * The reminder due this cycle, or null. Applies the dedup gate: a reminder
 * that already went out within the interval suppresses the next one.
 */
export async function collectSustainedReminder(
  current: SystemStatusPayload,
  now: Date = new Date(),
): Promise<AlertCandidate | null> {
  const reminderMs = getReminderIntervalMs();
  if (reminderMs <= 0) return null;

  const bad = selectIncidentComponents(current);
  if (bad.length === 0) return null;

  const starts = await getIncidentStartTimes(bad.map((b) => b.component));
  const incidents: SustainedIncident[] = bad.map((b) => ({
    ...b,
    since: starts.get(b.component) ?? null,
  }));

  const candidate = buildSustainedReminder(incidents, now, reminderMs);
  if (!candidate) return null;

  // Dedup on the digest's own component, so one reminder per interval no matter
  // how many components are red or how often the cron runs.
  const lastReminderAt = await getLastNonSuppressedDispatchAt(
    SUSTAINED_COMPONENT,
    "INCIDENT",
    reminderMs,
  );
  if (lastReminderAt) return null;

  return candidate;
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

  const cooldownMs = getCooldownMs();
  const lastDispatchAt = await getLastNonSuppressedDispatchAt(
    candidate.component,
    candidate.current,
    cooldownMs,
  );
  const cooldown = shouldSuppressAlert({
    lastDispatchAt,
    now: new Date(triggeredAt),
    cooldownMs,
  });

  let dispatch: AlertDispatchSummary;
  if (cooldown.suppressed) {
    dispatch = {
      slack: { ok: false, error: "Suppressed by cooldown" },
      email: { ok: false, error: "Suppressed by cooldown" },
      suppressed: true,
      suppressionReason: cooldown.reason,
    };
  } else {
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
    dispatch = {
      slack: slackResult,
      email: emailResult,
    };
  }

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
 * between two payloads and dispatch each, then the sustained-incident
 * reminder if one is due. Returns the dispatched alerts in the order they
 * were emitted.
 *
 * Transitions run FIRST so this cycle's own OK→INCIDENT rows are already on
 * `alert_events` when the reminder reads incident start times — otherwise a
 * brand-new incident would look undated and be reminded about immediately.
 *
 * A missing `previous` skips transitions (there is nothing to diff against)
 * but NOT the reminder: the first snapshot after a cold start is exactly when
 * a long-running outage most needs to be re-announced.
 */
export async function dispatchTransitions(
  previous: SystemStatusPayload | null,
  current: SystemStatusPayload,
  options: { snapshotId?: number | null } = {},
): Promise<DispatchedAlert[]> {
  const dispatched: DispatchedAlert[] = [];

  if (previous) {
    for (const c of diffPayloadsForAlerts(previous, current)) {
      dispatched.push(await dispatchAlert(c, options));
    }
  }

  const reminder = await collectSustainedReminder(current);
  if (reminder) {
    dispatched.push(await dispatchAlert(reminder, options));
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
