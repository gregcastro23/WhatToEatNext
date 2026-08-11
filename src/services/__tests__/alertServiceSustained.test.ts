/**
 * Sustained-incident re-alerting.
 *
 * Every rule in alertService keys off CHANGE, which meant a component that went
 * INCIDENT and stayed there alerted exactly once, ever. Measured in production
 * on 2026-08-11: `payments` had been INCIDENT for 35 consecutive hourly
 * snapshots on the strength of one email sent 35 hours earlier.
 *
 * The two properties that matter pull against each other, so both are pinned
 * here: a long outage must keep announcing itself, and it must not turn the
 * hourly cron into an hourly mailing list.
 */

const mockExecuteQuery = jest.fn();
jest.mock("@/lib/database/connection", () => ({
  executeQuery: (...args: unknown[]) => mockExecuteQuery(...args),
}));

import {
  buildSustainedReminder,
  collectSustainedReminder,
  getReminderIntervalMs,
  selectIncidentComponents,
  type SustainedIncident,
} from "@/services/alertService";
import { SUSTAINED_COMPONENT } from "@/lib/observability/alertLog";
import type {
  DependencyHealth,
  FlowHealth,
  FlowStatus,
  SystemStatusPayload,
} from "@/services/systemStatusService";

const NOW = new Date("2026-08-11T18:00:00.000Z");
const HOUR = 3_600_000;

function makeFlow(id: string, status: FlowStatus): FlowHealth {
  return {
    id,
    label: `${id} label`,
    description: `${id} flow`,
    status,
    summary: `${id} is ${status}`,
    metrics: [],
    issues: [],
    checkedAt: NOW.toISOString(),
    live: true,
  };
}

function makeDep(id: string, status: FlowStatus): DependencyHealth {
  return {
    id,
    label: `${id} label`,
    status,
    summary: `${id} is ${status}`,
    latencyMs: 50,
    checkedAt: NOW.toISOString(),
  };
}

function makePayload(
  overall: FlowStatus,
  flows: FlowHealth[],
  deps: DependencyHealth[] = [],
): SystemStatusPayload {
  return {
    generatedAt: NOW.toISOString(),
    overall,
    flows,
    dependencies: deps,
  };
}

function hoursAgo(h: number): string {
  return new Date(NOW.getTime() - h * HOUR).toISOString();
}

describe("selectIncidentComponents", () => {
  it("picks up INCIDENT flows and dependencies, and nothing else", () => {
    const payload = makePayload(
      "INCIDENT",
      [
        makeFlow("payments", "INCIDENT"),
        makeFlow("economy", "DEGRADED"),
        makeFlow("auth", "OK"),
        makeFlow("mcp", "UNKNOWN"),
      ],
      [makeDep("stripe", "INCIDENT"), makeDep("planetary-agents", "OK")],
    );
    expect(selectIncidentComponents(payload).map((c) => c.component)).toEqual([
      "payments",
      "stripe",
    ]);
  });

  it("does not report `overall` as its own component", () => {
    // It is derived from the flows below it, so including it would announce
    // the same outage twice in one digest.
    const payload = makePayload("INCIDENT", [makeFlow("payments", "INCIDENT")]);
    expect(selectIncidentComponents(payload)).toHaveLength(1);
  });
});

describe("buildSustainedReminder", () => {
  const reminderMs = 24 * HOUR;

  const incident = (
    component: string,
    since: string | null,
  ): SustainedIncident => ({
    component,
    componentLabel: `${component} label`,
    summary: `${component} is broken`,
    since,
  });

  it("reminds about an incident older than one interval", () => {
    const c = buildSustainedReminder([incident("payments", hoursAgo(35))], NOW, reminderMs);
    expect(c).not.toBeNull();
    expect(c!.component).toBe(SUSTAINED_COMPONENT);
    expect(c!.severity).toBe("error");
    expect(c!.title).toMatch(/still down/);
    expect(c!.message).toMatch(/35h/);
  });

  it("stays silent about an incident that only just started", () => {
    // Otherwise the reminder arrives in the same cron cycle as the transition
    // alert that announced it — two emails for one event.
    expect(
      buildSustainedReminder([incident("economy", hoursAgo(1))], NOW, reminderMs),
    ).toBeNull();
  });

  it("reminds about an incident with no recorded start", () => {
    // A component that is red with no transition on file is one whose outage
    // predates the alert history — precisely the case this exists for.
    const c = buildSustainedReminder([incident("payments", null)], NOW, reminderMs);
    expect(c).not.toBeNull();
    expect(c!.message).toMatch(/duration unrecorded/);
  });

  it("digests many components into ONE alert", () => {
    const c = buildSustainedReminder(
      [
        incident("payments", hoursAgo(35)),
        incident("economy", hoursAgo(50)),
        incident("mcp", hoursAgo(200)),
      ],
      NOW,
      reminderMs,
    );
    expect(c!.title).toBe("3 components still down");
    // One alert, every component named — when something goes broadly red,
    // per-component reminders would multiply the noise the cooldown prevents.
    for (const name of ["payments label", "economy label", "mcp label"]) {
      expect(c!.message).toContain(name);
    }
  });

  it("drops only the components that are too young, keeping the rest", () => {
    const c = buildSustainedReminder(
      [incident("payments", hoursAgo(35)), incident("economy", hoursAgo(2))],
      NOW,
      reminderMs,
    );
    expect(c!.title).toMatch(/payments label still down/);
    expect(c!.message).not.toContain("economy label");
  });

  it("declares INCIDENT → INCIDENT, so its own rows never reset the clock", () => {
    // getIncidentStartTimes filters on `previous_status <> 'INCIDENT'`. If a
    // reminder recorded a transition INTO incident, every reminder would reset
    // the age it is measuring and the digest would never mature again.
    const c = buildSustainedReminder([incident("payments", hoursAgo(35))], NOW, reminderMs);
    expect(c!.previous).toBe("INCIDENT");
    expect(c!.current).toBe("INCIDENT");
  });

  it("formats a multi-day outage in days, not three-digit hours", () => {
    const c = buildSustainedReminder([incident("payments", hoursAgo(85 * 24 + 3))], NOW, reminderMs);
    expect(c!.title).toMatch(/85d 3h/);
  });

  it("returns nothing when reminders are disabled", () => {
    expect(
      buildSustainedReminder([incident("payments", hoursAgo(500))], NOW, 0),
    ).toBeNull();
  });

  it("returns nothing when nothing is in incident", () => {
    expect(buildSustainedReminder([], NOW, reminderMs)).toBeNull();
  });
});

describe("getReminderIntervalMs", () => {
  const saved = process.env.ALERT_REMINDER_HOURS;
  afterEach(() => {
    if (saved === undefined) delete process.env.ALERT_REMINDER_HOURS;
    else process.env.ALERT_REMINDER_HOURS = saved;
  });

  it("defaults to 24h", () => {
    delete process.env.ALERT_REMINDER_HOURS;
    expect(getReminderIntervalMs()).toBe(24 * HOUR);
  });

  it("honours an explicit value", () => {
    process.env.ALERT_REMINDER_HOURS = "6";
    expect(getReminderIntervalMs()).toBe(6 * HOUR);
  });

  it("treats 0 as 'disabled' rather than as 'remind constantly'", () => {
    process.env.ALERT_REMINDER_HOURS = "0";
    expect(getReminderIntervalMs()).toBe(0);
  });

  it("falls back to the default on garbage rather than to NaN", () => {
    process.env.ALERT_REMINDER_HOURS = "sometimes";
    expect(getReminderIntervalMs()).toBe(24 * HOUR);
  });
});

describe("collectSustainedReminder — the dedup gate", () => {
  beforeEach(() => {
    mockExecuteQuery.mockReset();
    delete process.env.ALERT_REMINDER_HOURS;
  });

  const payload = makePayload("INCIDENT", [
    makeFlow("payments", "INCIDENT"),
    makeFlow("auth", "OK"),
  ]);

  /** First query = incident start times; second = last reminder dispatch. */
  function stubQueries(starts: unknown[], lastReminder: unknown[]) {
    mockExecuteQuery
      .mockResolvedValueOnce({ rows: starts })
      .mockResolvedValueOnce({ rows: lastReminder });
  }

  it("emits a reminder when none has gone out within the interval", async () => {
    stubQueries(
      [{ component: "payments", triggered_at: new Date(hoursAgo(35)) }],
      [],
    );
    const c = await collectSustainedReminder(payload, NOW);
    expect(c).not.toBeNull();
    expect(c!.component).toBe(SUSTAINED_COMPONENT);
  });

  it("suppresses a second reminder inside the same interval", async () => {
    // The load-bearing half. The cron runs hourly; without this a 35-hour
    // outage would produce 35 emails instead of one per day.
    stubQueries(
      [{ component: "payments", triggered_at: new Date(hoursAgo(35)) }],
      [{ triggered_at: new Date(hoursAgo(3)) }],
    );
    expect(await collectSustainedReminder(payload, NOW)).toBeNull();
  });

  it("does no DB work at all when nothing is in incident", async () => {
    const healthy = makePayload("OK", [makeFlow("payments", "OK")]);
    expect(await collectSustainedReminder(healthy, NOW)).toBeNull();
    expect(mockExecuteQuery).not.toHaveBeenCalled();
  });

  it("does no DB work when reminders are disabled", async () => {
    process.env.ALERT_REMINDER_HOURS = "0";
    expect(await collectSustainedReminder(payload, NOW)).toBeNull();
    expect(mockExecuteQuery).not.toHaveBeenCalled();
  });

  it("still reminds when the start-time lookup fails", async () => {
    // Fail open: an unknown start date should make an incident eligible, not
    // invisible. A monitoring failure must not silence an outage.
    mockExecuteQuery
      .mockRejectedValueOnce(new Error("connection terminated"))
      .mockResolvedValueOnce({ rows: [] });
    const c = await collectSustainedReminder(payload, NOW);
    expect(c).not.toBeNull();
    expect(c!.message).toMatch(/duration unrecorded/);
  });

  it("asks for start times only for components that are actually red", async () => {
    stubQueries([], []);
    await collectSustainedReminder(payload, NOW);
    const [, params] = mockExecuteQuery.mock.calls[0] as [string, unknown[]];
    expect(params[0]).toEqual(["payments"]);
  });
});
