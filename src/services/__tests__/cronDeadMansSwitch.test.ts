/**
 * The dead-man's-switch for scheduled jobs.
 *
 * The failure this guards is not a crash — it is a cron that simply never
 * fires, which emits nothing to alert on. `daily-digest` missed five days in
 * fifteen (Aug 6, 8, 9, 10, 13 of 2026) and nothing noticed, because
 * `getCronHeartbeats()` was read only by the admin dashboard. These tests pin
 * the two things that fix it: the Railway-scheduled job is in the registry at
 * all, and staleness reaches the hourly alert payload.
 */

import {
  evaluateHeartbeat,
  expectedIntervalMinutes,
  lateAfterMinutes,
  type CronRun,
} from "@/services/cronHeartbeatService";

describe("expectedIntervalMinutes — the staleness yardstick", () => {
  it("reads the daily Railway shape as 1440 minutes", () => {
    // The digest's inferred schedule. Any daily shape must land on 1440, which
    // is why an imprecise hour in the registry cannot fabricate a verdict.
    expect(expectedIntervalMinutes("0 9 * * *")).toBe(1440);
    expect(expectedIntervalMinutes("30 3 * * *")).toBe(1440);
  });

  it("reads hourly and every-N shapes", () => {
    expect(expectedIntervalMinutes("0 * * * *")).toBe(60);
    expect(expectedIntervalMinutes("*/5 * * * *")).toBe(5);
  });

  it("falls back to daily on a shape it does not know", () => {
    // Overestimating can only delay a "late" verdict, never invent one.
    expect(expectedIntervalMinutes("garbage")).toBe(1440);
    expect(expectedIntervalMinutes("0 9 * * 1-5")).toBe(1440);
  });
});

describe("evaluateHeartbeat — one bad tick is not an outage", () => {
  const at = (iso: string): number => Date.parse(iso);
  const run = (startedAt: string, status: CronRun["status"] = "success"): CronRun => ({ startedAt, status });

  it("replays 2026-09-22: one lost heartbeat no longer reads as late", () => {
    // prewarm-agent-recipes wrote a row at 19:00:04, lost the 20:00 row to a
    // DB read timeout, and the 21:00 watchdog — firing in the same minute as
    // the job, before its 21:00 row landed — saw a 2h00m gap and emailed
    // "Scheduled jobs degraded". The old rule was `gap > 2 × interval`.
    const latest = run("2026-09-22T19:00:04Z");
    const verdict = (now: string): string =>
      evaluateHeartbeat({ intervalMinutes: 60, latest, previous: null, nowMs: at(now) });
    expect(verdict("2026-09-22T21:00:30Z")).toBe("ok");
    expect(verdict("2026-09-22T21:05:00Z")).toBe("ok");
    // Two consecutive missed runs is the alarm, and still fires.
    expect(verdict("2026-09-22T22:05:00Z")).toBe("late");
  });

  it("sub-daily: one failure is retrying, two in a row are failing", () => {
    const nowMs = at("2026-09-22T21:05:00Z");
    const failed = run("2026-09-22T21:00:00Z", "failure");
    expect(evaluateHeartbeat({ intervalMinutes: 60, latest: failed, previous: run("2026-09-22T20:00:00Z"), nowMs })).toBe("retrying");
    expect(
      evaluateHeartbeat({ intervalMinutes: 60, latest: failed, previous: run("2026-09-22T20:00:00Z", "timeout"), nowMs }),
    ).toBe("failing");
  });

  it("daily: a single failure or a single missed day is the alarm — there is no next tick to wait for", () => {
    const failed = run("2026-09-22T09:00:00Z", "failure");
    expect(
      evaluateHeartbeat({ intervalMinutes: 1440, latest: failed, previous: run("2026-09-21T09:00:00Z"), nowMs: at("2026-09-22T10:00:00Z") }),
    ).toBe("failing");
    // The digest case: ran 09:00 yesterday, skipped today.
    expect(lateAfterMinutes(1440)).toBe(1584);
    expect(
      evaluateHeartbeat({ intervalMinutes: 1440, latest: run("2026-09-21T09:00:00Z"), previous: null, nowMs: at("2026-09-22T11:40:00Z") }),
    ).toBe("late");
  });

  it("a failure followed by silence is late, not retrying forever", () => {
    const failed = run("2026-09-22T12:00:00Z", "failure");
    expect(
      evaluateHeartbeat({ intervalMinutes: 60, latest: failed, previous: run("2026-09-22T11:00:00Z"), nowMs: at("2026-09-22T18:00:00Z") }),
    ).toBe("late");
  });

  it("never without a run", () => {
    expect(evaluateHeartbeat({ intervalMinutes: 60, latest: null, previous: null, nowMs: Date.now() })).toBe("never");
  });
});

describe("the registry covers externally-scheduled jobs", () => {
  it("includes daily-digest, which is scheduled on Railway and can never appear in vercel.json", async () => {
    // Reading the registry goes through getCronHeartbeats, which needs the DB;
    // assert instead on the module's exported registry behaviour via a DB stub.
    jest.resetModules();
    const rows: Array<{ probe_name: string }> = [];
    jest.doMock("@/lib/database/connection", () => ({
      executeQuery: jest.fn(async () => ({ rows })),
    }));

    const mod = await import("@/services/cronHeartbeatService");
    const data = await mod.getCronHeartbeats();

    const names = data.entries.map((e) => e.name);
    expect(names).toContain("daily-digest");
    // And the Vercel-scheduled jobs are still there — the merge must add, not
    // replace.
    expect(names).toContain("system-health-snapshot");

    const digest = data.entries.find((e) => e.name === "daily-digest");
    expect(digest?.expectedIntervalMinutes).toBe(1440);
    // No rows at all → "never", not a false "ok".
    expect(digest?.state).toBe("never");
  });
});

describe("scheduled-job staleness becomes an alertable status", () => {
  const entry = (name: string, state: string) => ({
    name,
    schedule: "0 9 * * *",
    expectedIntervalMinutes: 1440,
    lastRun: null,
    lastStatus: null,
    state,
  });

  /** Run the probe with a stubbed heartbeat reader. */
  async function probeWith(data: { entries: unknown[]; live: boolean }) {
    jest.resetModules();
    const getCronHeartbeats = jest.fn(async () => data);
    jest.doMock("@/services/cronHeartbeatService", () => ({
      getCronHeartbeats,
      recordCronRun: jest.fn(),
      expectedIntervalMinutes: jest.fn(() => 1440),
    }));
    const mod = await import("@/services/systemStatusService");
    const result = await mod.probeScheduledJobsDependency();
    // Guard against an inert mock: if the probe never read the heartbeats,
    // every assertion below would be measuring nothing.
    expect(getCronHeartbeats).toHaveBeenCalledTimes(1);
    return result;
  }

  it("OK when every job is on schedule", async () => {
    const dep = await probeWith({
      entries: [entry("daily-digest", "ok"), entry("chain-reconcile", "ok")],
      live: true,
    });
    expect(dep.status).toBe("OK");
    expect(dep.summary).toBe("2 jobs on schedule");
  });

  it("DEGRADED and NAMES the job when one goes late — the digest case", async () => {
    const dep = await probeWith({
      entries: [entry("daily-digest", "late"), entry("chain-reconcile", "ok")],
      live: true,
    });
    expect(dep.status).toBe("DEGRADED");
    // Naming it is the point: "something is late" costs an operator the same
    // search that made this invisible for five days.
    expect(dep.summary).toContain("daily-digest");
  });

  it("OK — not DEGRADED — while a job is only retrying, and still names it", async () => {
    const dep = await probeWith({
      entries: [entry("prewarm-agent-recipes", "retrying"), entry("chain-reconcile", "ok")],
      live: true,
    });
    expect(dep.status).toBe("OK");
    expect(dep.summary).toContain("retrying: prewarm-agent-recipes");
  });

  it("DEGRADED on a failing job, and never escalates to INCIDENT", async () => {
    const dep = await probeWith({
      entries: [entry("daily-digest", "failing")],
      live: true,
    });
    expect(dep.status).toBe("DEGRADED");
    expect(dep.status).not.toBe("INCIDENT");
  });

  it("UNKNOWN — not OK — for a job that has never once run", async () => {
    // The exact shape of a cron that is dead on arrival. Reporting OK here
    // would be the original bug with extra steps.
    const dep = await probeWith({
      entries: [entry("daily-digest", "never")],
      live: true,
    });
    expect(dep.status).toBe("UNKNOWN");
    expect(dep.summary).toContain("daily-digest");
  });

  it("UNKNOWN when the heartbeat table is unreadable, not a false OK", async () => {
    const dep = await probeWith({ entries: [], live: false });
    expect(dep.status).toBe("UNKNOWN");
    expect(dep.summary).toContain("unreadable");
  });

  it("is listed as a dependency, which is what makes it alertable at all", async () => {
    // dispatchTransitions only diffs what appears in SystemStatusPayload. If
    // this probe is not in `dependencies`, the staleness math above is correct
    // and still never pages anyone.
    const { readFileSync } = await import("node:fs");
    const src = readFileSync(
      require.resolve("@/services/systemStatusService"),
      "utf8",
    );
    expect(src).toMatch(
      /dependencies:\s*DependencyHealth\[\][\s\S]{0,1200}probeScheduledJobsDependency/,
    );
  });
});
