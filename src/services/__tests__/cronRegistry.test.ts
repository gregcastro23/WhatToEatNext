/**
 * The scheduled-job registry must match the code it describes: the routes it
 * names exist, their time limits are the ones the routes export, every probe
 * records under a name the probe service actually writes, and no two
 * hourly-or-faster jobs fire in the same minute.
 */

import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { parseSchedule } from "@/lib/cron/cronSchedule";
import { listScheduledJobs } from "@/services/cronRegistry";

const ROOT = process.cwd();

function routeSource(name: string): string {
  return readFileSync(join(ROOT, "src/app/api/cron", name, "route.ts"), "utf8");
}

describe("cronRegistry", () => {
  const vercelJobs = listScheduledJobs().filter((job) => job.host === "vercel");

  it("reads every cron in vercel.json", () => {
    const raw: unknown = JSON.parse(readFileSync(join(ROOT, "vercel.json"), "utf8"));
    const count = typeof raw === "object" && raw !== null && "crons" in raw && Array.isArray(raw.crons) ? raw.crons.length : -1;
    expect(vercelJobs).toHaveLength(count);
    expect(count).toBeGreaterThan(10);
  });

  it("names only routes that exist", () => {
    for (const job of vercelJobs) {
      expect(existsSync(join(ROOT, "src/app/api/cron", job.name, "route.ts"))).toBe(true);
    }
  });

  it("pins each function limit to the route's exported maxDuration", () => {
    for (const job of vercelJobs) {
      const match = /export const maxDuration = (\d+)/.exec(routeSource(job.name));
      expect({ job: job.name, limit: job.functionLimitSeconds }).toEqual({
        job: job.name,
        limit: match ? Number(match[1]) : 60,
      });
    }
  });

  it("maps every probe to a probe name the probe service writes", () => {
    const probeService = readFileSync(join(ROOT, "src/services/syntheticProbeService.ts"), "utf8");
    const probes = vercelJobs.filter((job) => job.kind === "probe");
    expect(probes.length).toBeGreaterThanOrEqual(7);
    for (const job of probes) {
      expect(probeService).toContain(`"${job.recordKey}"`);
    }
  });

  it("keeps crons that are not probes on cron:<name> heartbeats", () => {
    for (const job of listScheduledJobs().filter((j) => j.kind === "cron")) {
      expect(job.recordKey).toBe(`cron:${job.name}`);
    }
  });

  it("never schedules two hourly-or-faster jobs in the same minute", () => {
    // Until 2026-09-22 nine jobs fired together at :00 and shared one DB pool.
    // A new cron picks a free minute; /admin/jobs charts the map.
    const byMinute = new Map<number, string[]>();
    for (const job of vercelJobs) {
      const parsed = parseSchedule(job.schedule);
      if (parsed?.hours.length !== 24) continue;
      for (const m of parsed.minutes) byMinute.set(m, [...(byMinute.get(m) ?? []), job.name]);
    }
    const collisions = [...byMinute.entries()].filter(([, names]) => names.length > 1);
    expect(collisions).toEqual([]);
  });
});
