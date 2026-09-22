/**
 * Labels and tones for /admin/jobs. Status is never colour alone — every tone
 * here is paired with a word by the caller.
 *
 * @file src/app/admin/jobs/_components/jobsFormat.ts
 */

import type { Tone } from "@/components/admin/live/primitives";
import type { JobView } from "@/lib/admin/schemas/jobs";

type State = JobView["state"];
type RunStatus = JobView["recent"][number]["status"];

const STATE_TONE: Record<State, Tone> = { ok: "ok", retrying: "warn", late: "bad", failing: "bad", never: "neutral" };

const STATE_LABEL: Record<State, string> = {
  ok: "on schedule",
  retrying: "retrying",
  late: "late",
  failing: "failing",
  never: "no runs",
};

const STATE_HINT: Record<State, string> = {
  ok: "Latest run succeeded and arrived on time.",
  retrying: "Latest run failed, the one before succeeded. Not alerted: the next run clears or escalates it.",
  late: "No run inside the lateness window (two missed runs for sub-daily jobs, one for daily).",
  failing: "Consecutive failed runs (or one, for a daily job). This is what alerts.",
  never: "No run has ever been recorded.",
};

export function stateTone(state: State): Tone {
  return STATE_TONE[state];
}

export function stateLabel(state: State): string {
  return STATE_LABEL[state];
}

export function stateHint(state: State): string {
  return STATE_HINT[state];
}

/** Tick fill for the recent-runs strip (status colours, reserved for status). */
export function runFill(status: RunStatus): string {
  if (status === "success") return "#10b981";
  return status === "timeout" ? "#f59e0b" : "#e11d48";
}

export function headroomTone(used: number | null): Tone {
  if (used === null) return "neutral";
  if (used >= 0.8) return "bad";
  return used >= 0.5 ? "warn" : "ok";
}

export function successRate(job: JobView): number | null {
  const { runs7d, failures7d, timeouts7d } = job.stats;
  return runs7d === 0 ? null : (runs7d - failures7d - timeouts7d) / runs7d;
}

export function pad2(n: number): string {
  return String(n).padStart(2, "0");
}

/** Flatten a run's detail payload into short "key value" pairs for display. */
export function detailPairs(details: Record<string, unknown> | null): string[] {
  if (!details) return [];
  return Object.entries(details).flatMap(([key, value]): string[] => {
    if (typeof value === "number" || typeof value === "boolean" || typeof value === "string") {
      return [`${key} ${String(value)}`];
    }
    if (typeof value === "object" && value !== null && !Array.isArray(value)) {
      return Object.entries(value)
        .filter(([, v]) => typeof v === "number")
        .map(([k, v]) => `${key}.${k} ${String(v)}`);
    }
    return [];
  });
}
