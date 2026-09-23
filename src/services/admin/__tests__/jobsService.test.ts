/**
 * @jest-environment node
 *
 * /admin/jobs assembles registry + run history + alert history. It must count
 * missed runs from the schedule (a killed run leaves no row), judge state with
 * the alerting verdict, and report an unreadable table as absent — never as a
 * fleet of zero-run jobs.
 */

jest.mock("@/services/admin/jobs/jobsReaders", () => ({
  readRunStats: jest.fn(),
  readRecentRuns: jest.fn(),
  readAlertNoise: jest.fn(),
}));

import { readAlertNoise, readRecentRuns, readRunStats } from "@/services/admin/jobs/jobsReaders";
import { getJobsOverview } from "@/services/admin/jobs/jobsService";
import type { JobRun, JobRunStats } from "@/services/admin/jobs/jobsTypes";

const mockStats = jest.mocked(readRunStats);
const mockRecent = jest.mocked(readRecentRuns);
const mockAlerts = jest.mocked(readAlertNoise);

const NOW = Date.UTC(2026, 8, 22, 21, 30, 0);

function stats(overrides: Partial<JobRunStats>): JobRunStats {
  return {
    runs7d: 160,
    failures7d: 0,
    timeouts7d: 0,
    runs24h: 24,
    p50Ms: 20_000,
    p95Ms: 30_000,
    maxMs: 40_000,
    lastRunAt: "2026-09-22T21:00:04Z",
    lastStatus: "success",
    lastError: null,
    lastErrorAt: null,
    lastDetails: null,
    ...overrides,
  };
}

const ok = (startedAt: string): JobRun => ({ startedAt, status: "success", latencyMs: 20_000 });

beforeEach(() => {
  jest.useFakeTimers().setSystemTime(NOW);
  mockStats.mockReset();
  mockRecent.mockReset();
  mockAlerts.mockReset().mockResolvedValue([]);
});

afterEach(() => {
  jest.useRealTimers();
});

describe("getJobsOverview", () => {
  it("counts runs the schedule owed but never recorded, and headroom against the limit", async () => {
    mockStats.mockResolvedValue(
      new Map([["cron:prewarm-agent-recipes", stats({ runs24h: 20, p95Ms: 54_000 })]]),
    );
    mockRecent.mockResolvedValue(new Map([["cron:prewarm-agent-recipes", [ok("2026-09-22T21:00:04Z")]]]));

    const payload = await getJobsOverview();
    const prewarm = payload.jobs.find((j) => j.name === "prewarm-agent-recipes");

    expect(payload.live).toBe(true);
    // Hourly at :00 → 24 fires in (21:30 yesterday, 21:28 today]; 20 rows exist.
    expect(prewarm?.expected24h).toBe(24);
    expect(prewarm?.missed24h).toBe(4);
    expect(prewarm?.headroomUsed).toBeCloseTo(0.9);
    expect(prewarm?.state).toBe("ok");
  });

  it("judges state with the alerting verdict — one failure is retrying, not failing", async () => {
    mockStats.mockResolvedValue(new Map());
    mockRecent.mockResolvedValue(
      new Map([
        [
          "cron:chain-reconcile",
          [{ startedAt: "2026-09-22T20:45:00Z", status: "failure", latencyMs: 9_000 }, ok("2026-09-22T19:45:00Z")],
        ],
      ]),
    );
    const payload = await getJobsOverview();
    expect(payload.jobs.find((j) => j.name === "chain-reconcile")?.state).toBe("retrying");
  });

  it("reports an unreadable run table as absent, not as jobs with zero runs", async () => {
    mockStats.mockRejectedValue(new Error("Query read timeout"));
    mockRecent.mockResolvedValue(new Map());

    const payload = await getJobsOverview();

    expect(payload.live).toBe(false);
    expect(payload.jobs).toEqual([]);
    expect(payload.errors.join(" ")).toContain("Query read timeout");
    // The schedule map needs no database and still renders.
    expect(payload.minuteLoad).toHaveLength(60);
  });

  it("keeps alert history independent of run history", async () => {
    mockStats.mockResolvedValue(new Map());
    mockRecent.mockResolvedValue(new Map());
    mockAlerts.mockReset().mockRejectedValue(new Error("alert_events missing"));

    const payload = await getJobsOverview();

    expect(payload.live).toBe(true);
    expect(payload.alertsLive).toBe(false);
    expect(payload.alerts).toEqual([]);
  });
});
