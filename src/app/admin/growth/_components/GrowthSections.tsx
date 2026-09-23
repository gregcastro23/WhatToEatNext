"use client";

/**
 * Sections of /admin/growth. Humans only — agents are excluded upstream.
 *
 * @file src/app/admin/growth/_components/GrowthSections.tsx
 */

import React from "react";
import { ColumnChart, sequentialFill } from "@/components/admin/live/charts";
import { fmtInt, fmtPct } from "@/components/admin/live/format";
import { Basis, Panel, Pill, Stat, StatGrid } from "@/components/admin/live/primitives";
import type { GrowthView } from "@/lib/admin/schemas/growth";

export function GrowthKpis({ data }: { data: GrowthView }): React.JSX.Element {
  const { engagement, population, series } = data;
  const signups7d = series.slice(-7).reduce((s, d) => s + d.signups, 0);
  const signups30d = series.reduce((s, d) => s + d.signups, 0);
  return (
    <StatGrid>
      <Stat label="Human accounts" value={fmtInt(population.humans)} sub={`${fmtInt(population.agents)} agent accounts excluded`} tone="info" />
      <Stat label="Signups · 7d" value={fmtInt(signups7d)} sub={`${fmtInt(signups30d)} in 30 days`} tone={signups7d > 0 ? "ok" : "neutral"} />
      <Stat label="Daily active" value={fmtInt(engagement.dau)} sub="humans active in last 24h" />
      <Stat label="Weekly active" value={fmtInt(engagement.wau)} sub="humans active in last 7d" />
      <Stat label="Monthly active" value={fmtInt(engagement.mau)} sub="humans active in last 30d" />
      <Stat label="Stickiness" value={engagement.stickiness === null ? null : fmtPct(engagement.stickiness)} sub={engagement.stickiness === null ? "no monthly actives" : "DAU ÷ MAU"} />
    </StatGrid>
  );
}

function dayLabel(day: string): string {
  const [, m, d] = day.split("-");
  return `${m ?? ""}/${d ?? ""}`;
}

export function GrowthCharts({ data }: { data: GrowthView }): React.JSX.Element {
  const signups = data.series.map((d) => ({ key: d.day, label: dayLabel(d.day), value: d.signups }));
  const active = data.series.map((d) => ({ key: d.day, label: dayLabel(d.day), value: d.active }));
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <Panel title="Human signups per day" subtitle="last 30 days, America/New_York">
        <ColumnChart columns={signups} format={fmtInt} ariaLabel="Human signups per day" />
      </Panel>
      <Panel title="Active humans per day" subtitle="distinct humans with any recorded activity">
        <ColumnChart columns={active} format={fmtInt} ariaLabel="Active humans per day" />
      </Panel>
    </div>
  );
}

export function Funnel({ data }: { data: GrowthView }): React.JSX.Element {
  const top = data.funnel[0]?.count ?? 0;
  return (
    <Panel title="Activation funnel" subtitle="all human accounts; each step as a share of signups">
      <ol className="space-y-2">
        {data.funnel.map((step, i) => {
          const prev = i === 0 ? step.count : (data.funnel[i - 1]?.count ?? 0);
          const share = top > 0 ? step.count / top : 0;
          return (
            <li key={step.step} className="text-xs">
              <div className="flex items-baseline justify-between gap-2">
                <span className="font-semibold text-gray-800">{step.step}</span>
                <span className="font-mono text-gray-700">
                  {fmtInt(step.count)} · {top > 0 ? fmtPct(share) : "—"}
                  {i > 0 && prev > 0 && <span className="text-gray-400"> ({fmtPct(step.count / prev)} of previous)</span>}
                </span>
              </div>
              <div className="mt-1 h-2 rounded bg-gray-100">
                <div className="h-2 rounded" style={{ width: `${share * 100}%`, background: sequentialFill(0.85) }} />
              </div>
              <p className="mt-0.5 text-[10px] text-gray-500">{step.detail}</p>
            </li>
          );
        })}
      </ol>
    </Panel>
  );
}

function CohortCell({ value }: { value: number | null }): React.JSX.Element {
  if (value === null) return <td className="px-1 py-1 text-center text-gray-300">·</td>;
  return (
    <td className="px-1 py-1 text-center font-mono" style={{ background: sequentialFill(value), color: value > 0.55 ? "#ffffff" : "#1f2937" }}>
      {fmtPct(value)}
    </td>
  );
}

export function Cohorts({ data }: { data: GrowthView }): React.JSX.Element {
  const weeks = data.cohorts[0]?.retained.length ?? 0;
  return (
    <Panel title="Weekly retention" subtitle="share of each signup-week cohort active N weeks later (week 0 = signup week)">
      {data.cohorts.length === 0 ? (
        <p className="text-xs text-gray-500">No human signups in the last {weeks || 8} weeks.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="text-[11px] border-separate" style={{ borderSpacing: 2 }}>
            <thead>
              <tr className="text-gray-500">
                <th scope="col" className="px-2 text-left font-semibold">Cohort</th>
                <th scope="col" className="px-2 text-right font-semibold">Size</th>
                {Array.from({ length: weeks }, (_, k) => <th key={k} scope="col" className="px-1 font-semibold">W{k}</th>)}
              </tr>
            </thead>
            <tbody>
              {data.cohorts.map((c) => (
                <tr key={c.week}>
                  <th scope="row" className="px-2 text-left font-mono font-normal text-gray-700">{c.week}</th>
                  <td className="px-2 text-right font-mono text-gray-700">{c.size}</td>
                  {c.retained.map((v, k) => <CohortCell key={k} value={v} />)}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Panel>
  );
}

export function GrowthBasis({ data }: { data: GrowthView }): React.JSX.Element {
  return (
    <Basis>
      Humans = accounts whose email is not on the agent domain (<code>@agentic.alchm.kitchen</code>); the <code>is_agent</code>{" "}
      flag is not trusted. &ldquo;Active&rdquo; = any of: {data.activitySources.join(", ")}.
      {!data.live && (
        <span className="ml-1">
          <Pill tone="warn">Partial</Pill> {data.errors.join("; ")}
        </span>
      )}
    </Basis>
  );
}
