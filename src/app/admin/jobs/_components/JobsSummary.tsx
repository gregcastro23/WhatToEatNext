"use client";

/**
 * Headline numbers and the minute-of-hour pile-up chart on /admin/jobs.
 *
 * @file src/app/admin/jobs/_components/JobsSummary.tsx
 */

import React from "react";
import { ColumnChart } from "@/components/admin/live/charts";
import { fmtInt } from "@/components/admin/live/format";
import { Basis, Panel, Stat, StatGrid } from "@/components/admin/live/primitives";
import type { JobsView } from "@/lib/admin/schemas/jobs";
import { pad2 } from "./jobsFormat";

function sumKnown(values: ReadonlyArray<number | null>): number | null {
  const known = values.filter((v): v is number => v !== null);
  return known.length === 0 ? null : known.reduce((a, b) => a + b, 0);
}

function MissedStat({ data }: { data: JobsView }): React.JSX.Element {
  const missed = sumKnown(data.jobs.map((j) => j.missed24h));
  const owed = sumKnown(data.jobs.map((j) => j.expected24h));
  return (
    <Stat
      label="Missed runs · 24h"
      value={missed === null ? null : fmtInt(missed)}
      sub={owed === null ? "no parseable schedules" : `of ${fmtInt(owed)} owed — no row recorded`}
      tone={missed === null ? "neutral" : missed > 0 ? "bad" : "ok"}
    />
  );
}

function FailedStat({ data }: { data: JobsView }): React.JSX.Element {
  const runs = data.jobs.reduce((a, j) => a + j.stats.runs7d, 0);
  const bad = data.jobs.reduce((a, j) => a + j.stats.failures7d + j.stats.timeouts7d, 0);
  return (
    <Stat
      label="Failed runs · 7d"
      value={fmtInt(bad)}
      sub={`of ${fmtInt(runs)} recorded runs`}
      tone={bad === 0 ? "ok" : bad / Math.max(runs, 1) > 0.05 ? "bad" : "warn"}
    />
  );
}

function AlertStat({ data }: { data: JobsView }): React.JSX.Element {
  if (!data.alertsLive) return <Stat label={`Alert emails · ${data.alertWindowDays}d`} value={null} sub="alert history unreadable" />;
  const emailed = data.alerts.reduce((a, r) => a + r.emailed, 0);
  const suppressed = data.alerts.reduce((a, r) => a + r.suppressed, 0);
  return (
    <Stat
      label={`Alert emails · ${data.alertWindowDays}d`}
      value={fmtInt(emailed)}
      sub={`${fmtInt(suppressed)} held back by cooldown`}
      tone={emailed > 20 ? "warn" : "neutral"}
    />
  );
}

function UnreadableKpis({ data }: { data: JobsView }): React.JSX.Element {
  const why = "run history unreadable";
  return (
    <StatGrid>
      <Stat label="Scheduled" value={null} sub={why} />
      <Stat label="On schedule" value={null} sub={why} />
      <Stat label="Missed runs · 24h" value={null} sub={why} />
      <Stat label="Failed runs · 7d" value={null} sub={why} />
      <Stat label="Near time limit" value={null} sub={why} />
      <AlertStat data={data} />
    </StatGrid>
  );
}

export function JobsKpis({ data }: { data: JobsView }): React.JSX.Element {
  if (!data.live) return <UnreadableKpis data={data} />;
  const { jobs } = data;
  const healthy = jobs.filter((j) => j.state === "ok").length;
  const nearLimit = jobs.filter((j) => j.headroomUsed !== null && j.headroomUsed >= 0.8);
  const probes = jobs.filter((j) => j.kind === "probe").length;
  return (
    <StatGrid>
      <Stat label="Scheduled" value={fmtInt(jobs.length)} sub={`${jobs.length - probes} jobs · ${probes} probes`} />
      <Stat
        label="On schedule"
        value={`${healthy}/${jobs.length}`}
        sub={healthy === jobs.length ? "every job healthy" : `${jobs.length - healthy} need a look`}
        tone={healthy === jobs.length ? "ok" : "warn"}
      />
      <MissedStat data={data} />
      <FailedStat data={data} />
      <Stat
        label="Near time limit"
        value={fmtInt(nearLimit.length)}
        sub={nearLimit.length > 0 ? nearLimit.map((j) => j.name).join(", ") : "every p95 under 80% of limit"}
        tone={nearLimit.length > 0 ? "bad" : "ok"}
      />
      <AlertStat data={data} />
    </StatGrid>
  );
}

export function MinuteLoadPanel({ data }: { data: JobsView }): React.JSX.Element {
  const columns = data.minuteLoad.map((m) => ({
    key: String(m.minute),
    label: `:${pad2(m.minute)}`,
    value: m.jobs.length,
    ...(m.jobs.length > 0 ? { detail: m.jobs.join(", ") } : {}),
  }));
  const peak = Math.max(0, ...data.minuteLoad.map((m) => m.jobs.length));
  return (
    <Panel title="When jobs fire" subtitle={`Hourly-or-faster jobs per minute of the hour (UTC) · peak ${peak} at once`}>
      <ColumnChart columns={columns} format={(n): string => `${n} job${n === 1 ? "" : "s"}`} ariaLabel="Scheduled jobs per minute of the hour" height={110} />
      <Basis>
        From vercel.json. Jobs that fire in the same minute compete for the same database pool. Until 2026-09-22, nine
        started together at :00, and in a sample from 20:00–21:45 UTC that day, every database read timeout fell on a minute
        when crons fire. Daily jobs are listed in the table and are not counted here.
      </Basis>
    </Panel>
  );
}
