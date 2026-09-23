"use client";

/**
 * Which components emailed the operator, how often, and what the cooldown
 * held back — /admin/jobs.
 *
 * @file src/app/admin/jobs/_components/AlertNoise.tsx
 */

import React from "react";
import { fmtAgo, fmtInt } from "@/components/admin/live/format";
import { Absent, Basis, Panel, Pill } from "@/components/admin/live/primitives";
import type { JobsView } from "@/lib/admin/schemas/jobs";

type AlertRow = JobsView["alerts"][number];

/** A component that both worsened and recovered 3+ times in the window is flapping. */
function isFlapping(row: AlertRow): boolean {
  return row.worsened >= 3 && row.recovered >= 3;
}

function AlertRowView({ row }: { row: AlertRow }): React.JSX.Element {
  return (
    <tr className="border-t border-gray-100 align-top text-xs text-gray-800">
      <td className="py-2 pr-3">
        <span className="font-mono font-semibold text-gray-900">{row.component}</span>
        {isFlapping(row) && (
          <span className="ml-2">
            <Pill tone="warn" title="Worsened and recovered at least 3 times each — likely a threshold, not an outage">flapping</Pill>
          </span>
        )}
      </td>
      <td className="py-2 pr-3 font-mono font-semibold text-gray-900">{fmtInt(row.emailed)}</td>
      <td className="py-2 pr-3 font-mono text-gray-600">{fmtInt(row.suppressed)}</td>
      <td className="py-2 pr-3 font-mono text-gray-600">
        {fmtInt(row.worsened)} ↓ · {fmtInt(row.recovered)} ↑
      </td>
      <td className="py-2 min-w-0">
        <p className="text-gray-800 truncate max-w-[360px]" title={row.lastTitle ?? ""}>{row.lastTitle ?? "—"}</p>
        <p className="text-[11px] text-gray-500">{fmtAgo(row.lastAt)}</p>
      </td>
    </tr>
  );
}

export function AlertNoise({ data }: { data: JobsView }): React.JSX.Element {
  const title = `Alert noise · ${data.alertWindowDays}d`;
  if (!data.alertsLive) return <Panel title={title}><Absent>alert_events unreadable</Absent></Panel>;
  if (data.alerts.length === 0) return <Panel title={title}><Absent>No alerts fired in the last {data.alertWindowDays} days.</Absent></Panel>;
  return (
    <Panel title={title} subtitle="Every status transition, by component — busiest first">
      <div className="overflow-x-auto -mx-4 sm:-mx-5 px-4 sm:px-5">
        <table className="w-full text-left">
          <thead>
            <tr className="text-[10px] uppercase tracking-wider text-gray-500">
              <th className="pb-2 pr-3 font-semibold">Component</th>
              <th className="pb-2 pr-3 font-semibold">Emailed</th>
              <th className="pb-2 pr-3 font-semibold">Held back</th>
              <th className="pb-2 pr-3 font-semibold" title="Transitions to DEGRADED/INCIDENT ↓ and back to OK ↑">Down · up</th>
              <th className="pb-2 font-semibold">Latest</th>
            </tr>
          </thead>
          <tbody>
            {data.alerts.map((row) => (
              <AlertRowView key={row.component} row={row} />
            ))}
          </tbody>
        </table>
      </div>
      <Basis>
        From alert_events. &ldquo;Emailed&rdquo; counts rows whose email sink reported success; &ldquo;held back&rdquo; counts
        transitions the cooldown (60 minutes unless ALERT_COOLDOWN_MINUTES is set) recorded without sending. &ldquo;system&rdquo; is the overall roll-up and fires
        alongside the component that moved it.
      </Basis>
    </Panel>
  );
}
