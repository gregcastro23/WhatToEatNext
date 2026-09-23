"use client";

/**
 * Sections of /admin/traffic. Each takes the validated TrafficSummaryView.
 *
 * @file src/app/admin/traffic/_components/TrafficSections.tsx
 */

import React from "react";
import { BarList, ColumnChart } from "@/components/admin/live/charts";
import { fmtDelta, fmtInt, fmtPct } from "@/components/admin/live/format";
import { Absent, Basis, Panel, Pill, Stat, StatGrid, type Tone } from "@/components/admin/live/primitives";
import type { TrafficSummaryView } from "@/lib/admin/schemas/traffic";

type View = TrafficSummaryView;

export function TrafficStatusNotice({ data }: { data: View }): React.JSX.Element | null {
  if (data.status === "live") return null;
  const missing = data.status === "missing-table";
  return (
    <Absent>
      <Pill tone={missing ? "warn" : "bad"}>{missing ? "Not yet recording" : "Read failed"}</Pill>
      <p className="mt-2">{data.detail ?? "No detail"}</p>
      {missing && (
        <p className="mt-1">
          The beacon is already deployed; visits start appearing here as soon as the backend deploy applies migration 86.
        </p>
      )}
    </Absent>
  );
}

function deltaSub(current: number, previous: number, rangeLabel: string): string {
  const delta = fmtDelta(current, previous);
  return delta ? `${delta} vs previous ${rangeLabel}` : `previous ${rangeLabel}: ${fmtInt(previous)}`;
}

function deltaTone(current: number, previous: number): Tone {
  if (current > previous) return "ok";
  return current < previous ? "warn" : "neutral";
}

export function TrafficKpis({ data }: { data: View }): React.JSX.Element {
  const { totals, previous, range } = data;
  const multiDay = range !== "24h";
  return (
    <StatGrid>
      <Stat label="On site now" value={fmtInt(data.activeNow.visitors)} sub="visitors in the last 5 min" tone={data.activeNow.visitors > 0 ? "ok" : "neutral"} />
      <Stat label="Page views" value={fmtInt(totals.pageviews)} sub={deltaSub(totals.pageviews, previous.pageviews, range)} tone={deltaTone(totals.pageviews, previous.pageviews)} />
      <Stat label={multiDay ? "Visitor-days" : "Unique visitors"} value={fmtInt(totals.visitors)} sub={deltaSub(totals.visitors, previous.visitors, range)} tone={deltaTone(totals.visitors, previous.visitors)} />
      <Stat label="Sessions" value={fmtInt(totals.sessions)} sub={totals.pagesPerSession === null ? "no sessions" : `${totals.pagesPerSession.toFixed(1)} pages / session`} />
      <Stat label="Bounce rate" value={totals.bounceRate === null ? null : fmtPct(totals.bounceRate)} sub={totals.bounceRate === null ? "no sessions in range" : "single-page sessions"} />
      <Stat label="Signed-in visitors" value={fmtInt(totals.signedInUsers)} sub={`${fmtInt(data.bots)} bot hits filtered`} />
    </StatGrid>
  );
}

function bucketLabel(key: string, unit: View["bucketUnit"]): string {
  if (unit === "hour") return `${key.slice(11, 13)}:00`;
  const [, month, day] = key.split("-");
  return `${month ?? ""}/${day ?? ""}`;
}

export function TrafficChart({ data }: { data: View }): React.JSX.Element {
  const columns = data.series.map((b) => ({ key: b.key, label: bucketLabel(b.key, data.bucketUnit), value: b.pageviews }));
  return (
    <Panel title="Page views over time" subtitle={`per ${data.bucketUnit}, America/New_York`}>
      <ColumnChart columns={columns} format={fmtInt} ariaLabel={`Page views per ${data.bucketUnit}`} />
    </Panel>
  );
}

export function LiveNow({ data }: { data: View }): React.JSX.Element {
  const rows = data.activeNow.pages.map((p) => ({ label: p.label, value: p.count }));
  return (
    <Panel title="Right now" subtitle="pages open in the last 5 minutes" right={<Pill tone={rows.length > 0 ? "ok" : "neutral"}>{fmtInt(data.activeNow.visitors)} active</Pill>}>
      <BarList rows={rows} format={fmtInt} empty="Nobody on the site in the last 5 minutes." />
    </Panel>
  );
}

function countRows(rows: View["topPages"]): Array<{ label: string; value: number; hint: string }> {
  return rows.map((r) => ({
    label: r.label,
    value: r.count,
    hint: r.visitors === undefined ? r.label : `${r.label} — ${r.count} views, ${r.visitors} visitors`,
  }));
}

export function TopLists({ data }: { data: View }): React.JSX.Element {
  const lists: Array<{ title: string; rows: View["topPages"]; empty: string }> = [
    { title: "Top pages", rows: data.topPages, empty: "No page views in range." },
    { title: "Landing pages", rows: data.entryPages, empty: "No sessions in range." },
    { title: "Referrers", rows: data.referrers, empty: "No page views in range." },
    { title: "Countries", rows: data.countries, empty: "No page views in range." },
    { title: "Devices", rows: data.devices, empty: "No page views in range." },
    { title: "Browsers", rows: data.browsers, empty: "No page views in range." },
    { title: "Operating systems", rows: data.operatingSystems, empty: "No page views in range." },
    { title: "Campaigns (utm_source)", rows: data.utmSources, empty: "No tagged campaign traffic." },
  ];
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
      {lists.map((l) => (
        <Panel key={l.title} title={l.title}>
          <BarList rows={countRows(l.rows)} format={fmtInt} empty={l.empty} />
        </Panel>
      ))}
    </div>
  );
}

export function TrafficBasis({ data }: { data: View }): React.JSX.Element {
  return (
    <Basis>
      Source: first-party <code>page_views</code> ({fmtInt(data.totalPageviewsAllTime)} human views recorded
      {data.trackingSince ? ` since ${new Date(data.trackingSince).toLocaleDateString()}` : ""}). No cookies and no raw IPs are
      stored; a visitor is a daily-rotating hash, so over 7d/30d the count is visitor-days. Bots and /admin are excluded.
    </Basis>
  );
}
