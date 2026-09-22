"use client";

/**
 * One row per scheduled job / probe on /admin/jobs: state, runs owed vs
 * recorded, 7-day success, p95 against the function limit, the last 24 runs,
 * and the latest run's error and details.
 *
 * @file src/app/admin/jobs/_components/JobsTable.tsx
 */

import React from "react";
import { fmtAgo, fmtDuration, fmtInt, fmtPct } from "@/components/admin/live/format";
import { Absent, Basis, Panel, Pill } from "@/components/admin/live/primitives";
import type { JobsView, JobView } from "@/lib/admin/schemas/jobs";
import { detailPairs, headroomTone, runFill, stateHint, stateLabel, stateTone, successRate } from "./jobsFormat";

function RunStrip({ job }: { job: JobView }): React.JSX.Element {
  const runs = [...job.recent].reverse();
  const bad = runs.filter((r) => r.status !== "success").length;
  if (runs.length === 0) return <span className="text-[11px] text-gray-400">no runs</span>;
  return (
    <span className="inline-flex items-end gap-[2px]" aria-label={`last ${runs.length} runs: ${runs.length - bad} ok, ${bad} not ok`}>
      {runs.map((r) => (
        <span
          key={r.startedAt}
          title={`${r.status} · ${fmtAgo(r.startedAt)} · ${fmtDuration(r.latencyMs)}`}
          className="block w-[5px] h-[14px] rounded-[1px]"
          style={{ background: runFill(r.status) }}
        />
      ))}
    </span>
  );
}

function Headroom({ job }: { job: JobView }): React.JSX.Element {
  const used = job.headroomUsed;
  const tone = headroomTone(used);
  const width = used === null ? 0 : Math.min(100, used * 100);
  const fill = tone === "bad" ? "#e11d48" : tone === "warn" ? "#f59e0b" : "#2a78d6";
  return (
    <div className="min-w-[120px]" title={`p95 of 7-day runs against the ${job.functionLimitSeconds}s function limit`}>
      <div className="h-1.5 rounded bg-gray-100 overflow-hidden">
        <div className="h-full rounded" style={{ width: `${width}%`, background: fill }} />
      </div>
      <p className="mt-0.5 font-mono text-[11px] text-gray-600">
        {fmtDuration(job.stats.p95Ms)} / {job.functionLimitSeconds}s
      </p>
    </div>
  );
}

function Missed({ job }: { job: JobView }): React.JSX.Element {
  if (job.missed24h === null || job.expected24h === null) return <span className="text-gray-400">—</span>;
  return (
    <span className={job.missed24h > 0 ? "font-semibold text-rose-700" : "text-gray-700"}>
      {fmtInt(job.missed24h)}
      <span className="text-gray-400"> / {fmtInt(job.expected24h)}</span>
    </span>
  );
}

function LastRun({ job }: { job: JobView }): React.JSX.Element {
  const pairs = detailPairs(job.kind === "cron" ? job.stats.lastDetails : null);
  return (
    <div className="min-w-0 max-w-[340px] text-[11px]">
      <p className="text-gray-700">{fmtAgo(job.stats.lastRunAt)}</p>
      {pairs.length > 0 && <p className="font-mono text-gray-500 truncate" title={pairs.join(" · ")}>{pairs.join(" · ")}</p>}
      {job.stats.lastError && (
        <p className="text-rose-700 truncate" title={job.stats.lastError}>
          {job.stats.lastErrorAt ? `${fmtAgo(job.stats.lastErrorAt)}: ` : ""}
          {job.stats.lastError}
        </p>
      )}
    </div>
  );
}

function JobRowView({ job }: { job: JobView }): React.JSX.Element {
  const rate = successRate(job);
  return (
    <tr className="border-t border-gray-100 align-top text-gray-800">
      <td className="py-2 pr-3">
        <p className="font-mono text-xs font-semibold text-gray-900">{job.name}</p>
        <p className="text-[11px] text-gray-500">
          {job.kind} · {job.scheduleLabel}
          {job.host === "railway" ? " · Railway" : ""}
        </p>
      </td>
      <td className="py-2 pr-3">
        <Pill tone={stateTone(job.state)} title={stateHint(job.state)}>{stateLabel(job.state)}</Pill>
      </td>
      <td className="py-2 pr-3 font-mono text-xs"><Missed job={job} /></td>
      <td className="py-2 pr-3 font-mono text-xs text-gray-700" title={`${job.stats.runs7d} runs · ${job.stats.failures7d} failed · ${job.stats.timeouts7d} timed out`}>
        {rate === null ? "—" : fmtPct(rate, 1)}
      </td>
      <td className="py-2 pr-3"><Headroom job={job} /></td>
      <td className="py-2 pr-3"><RunStrip job={job} /></td>
      <td className="py-2"><LastRun job={job} /></td>
    </tr>
  );
}

const STATE_ORDER: ReadonlyArray<JobView["state"]> = ["failing", "late", "retrying", "never", "ok"];

/** Worst first: state, then missed runs, then how close p95 runs to the limit. */
function severity(a: JobView, b: JobView): number {
  const byState = STATE_ORDER.indexOf(a.state) - STATE_ORDER.indexOf(b.state);
  if (byState !== 0) return byState;
  const byMissed = (b.missed24h ?? 0) - (a.missed24h ?? 0);
  return byMissed !== 0 ? byMissed : (b.headroomUsed ?? 0) - (a.headroomUsed ?? 0);
}

export function JobsTable({ data }: { data: JobsView }): React.JSX.Element {
  if (!data.live) {
    return (
      <Panel title="Jobs & probes">
        <Absent>Run history unreadable: {data.errors.length > 0 ? data.errors.join("; ") : "unknown error"}</Absent>
      </Panel>
    );
  }
  const rows = [...data.jobs].sort(severity);
  return (
    <Panel title="Jobs & probes" subtitle="Worst first — by state, then missed runs, then time-limit headroom · state is the same verdict the hourly alert cron uses">
      <div className="overflow-x-auto -mx-4 sm:-mx-5 px-4 sm:px-5">
        <table className="w-full text-left">
          <thead>
            <tr className="text-[10px] uppercase tracking-wider text-gray-500">
              <th className="pb-2 pr-3 font-semibold">Job</th>
              <th className="pb-2 pr-3 font-semibold">State</th>
              <th className="pb-2 pr-3 font-semibold" title="Runs the schedule owed in the last 24h that left no row">Missed 24h</th>
              <th className="pb-2 pr-3 font-semibold">Success 7d</th>
              <th className="pb-2 pr-3 font-semibold">p95 / limit</th>
              <th className="pb-2 pr-3 font-semibold">Last 24 runs</th>
              <th className="pb-2 font-semibold">Last run</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((job) => (
              <JobRowView key={job.name} job={job} />
            ))}
          </tbody>
        </table>
      </div>
      <Basis>
        Every run is a row in synthetic_probe_results (jobs record as cron:&lt;name&gt;; probes under their probe name). A run
        Vercel kills at its time limit leaves no row, so it appears only as a missed run. A sub-daily cron job alerts after two
        consecutive failed or missed runs, a daily one after one; probes alert through the flow they exercise on the Overview
        status board. Strip colours: green ok, red failed, amber timed out.
      </Basis>
    </Panel>
  );
}
