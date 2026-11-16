"use client";

/**
 * Sections of /admin/traffic. Each takes the validated TrafficSummaryView.
 *
 * @file src/app/admin/traffic/_components/TrafficSections.tsx
 */

import React, { useMemo, useState } from "react";
import { BarList, ColumnChart } from "@/components/admin/live/charts";
import { fmtAgo, fmtDelta, fmtInt, fmtPct } from "@/components/admin/live/format";
import { Absent, Basis, Panel, Pill, Stat, StatGrid, type Tone } from "@/components/admin/live/primitives";
import type { TrafficSummaryView } from "@/lib/admin/schemas/traffic";
import { classifyInteractionTag, type InteractionTone } from "@/lib/analytics/interactionClassify";

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

function fmtDwell(ms: number): string {
  if (!ms || ms < 1_000) return "—";
  const sec = Math.round(ms / 1_000);
  if (sec < 60) return `${sec}s`;
  const min = Math.floor(sec / 60);
  const rem = sec % 60;
  return rem > 0 ? `${min}m ${rem}s` : `${min}m`;
}

export function ConversionFunnelsSection({ data }: { data: View }): React.JSX.Element | null {
  const funnel = data.plannerFunnel;
  const lab = data.labEngagement ?? [];
  const hasFunnel = Boolean(funnel?.stages.some((s) => s.sessions > 0));
  const hasLab = lab.length > 0;

  if (!hasFunnel && !hasLab) return null;

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
      <div className="xl:col-span-2">
        <Panel
          title="Menu Planner → Cart conversion funnel"
          subtitle="sequential session milestones & side-by-side cohort conversion comparison"
        >
          {!hasFunnel || !funnel ? (
            <p className="text-xs text-gray-500">No Menu Planner sessions recorded in this range yet.</p>
          ) : (
            <div className="space-y-4">
              <div className="space-y-2">
                {funnel.stages.map((st, idx) => {
                  const prev = idx > 0 ? funnel.stages[idx - 1] : null;
                  const dropOff =
                    prev && prev.sessions > 0
                      ? Math.max(0, 1 - st.sessions / prev.sessions)
                      : 0;
                  return (
                    <div key={st.stage} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-medium text-gray-800">{st.stage}</span>
                        <span className="font-mono text-gray-700">
                          <strong>{fmtInt(st.sessions)}</strong> sessions ({fmtPct(st.rate)})
                          {idx > 0 && dropOff > 0 && (
                            <span className="ml-2 text-[11px] text-amber-700">
                              −{Math.round(dropOff * 100)}% drop
                            </span>
                          )}
                        </span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-gray-100 overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            idx === funnel.stages.length - 1 ? "bg-emerald-500" : "bg-indigo-600"
                          }`}
                          style={{ width: `${Math.max(st.sessions > 0 ? 4 : 0, Math.round(st.rate * 100))}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              {funnel.cohorts.length > 0 && (
                <div className="overflow-x-auto border-t border-gray-100 pt-3">
                  <table className="w-full text-xs">
                    <thead className="bg-gray-50 text-[10px] uppercase tracking-wider text-gray-500">
                      <tr>
                        {["Cohort", "Landed", "Generated", "Refined", "Cart / Export", "Conversion"].map((h) => (
                          <th key={h} scope="col" className="px-2.5 py-1.5 text-left font-semibold">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 font-mono">
                      {funnel.cohorts.map((c) => (
                        <tr key={c.label}>
                          <td className="px-2.5 py-1.5 font-sans font-medium text-gray-800">{c.label}</td>
                          <td className="px-2.5 py-1.5 text-gray-700">{fmtInt(c.landed)}</td>
                          <td className="px-2.5 py-1.5 text-gray-700">{fmtInt(c.generated)}</td>
                          <td className="px-2.5 py-1.5 text-gray-700">{fmtInt(c.refined)}</td>
                          <td className="px-2.5 py-1.5 text-gray-700">{fmtInt(c.converted)}</td>
                          <td className="px-2.5 py-1.5 font-semibold text-emerald-700">{fmtPct(c.conversionRate)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </Panel>
      </div>

      <Panel
        title="Kitchen & Celestial Lab matrix"
        subtitle="most-used lab tabs (tab:*) & solver runs (patch:solve:*) with median dwell"
      >
        {!hasLab ? (
          <p className="text-xs text-gray-500">No lab tab or solver interactions in this range yet.</p>
        ) : (
          <div className="overflow-x-auto -mx-4 sm:-mx-5">
            <table className="w-full text-xs">
              <thead className="bg-gray-50 text-[10px] uppercase tracking-wider text-gray-500">
                <tr>
                  {["Interaction", "Kind", "Sessions", "Median Dwell"].map((h) => (
                    <th key={h} scope="col" className="px-3 py-2 text-left font-semibold">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 font-mono">
                {lab.map((row) => (
                  <tr key={row.tag}>
                    <td className="px-3 py-2 text-gray-900 truncate max-w-[160px]" title={row.tag}>
                      {row.tag}
                    </td>
                    <td className="px-3 py-2">
                      <span
                        className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                          row.kind === "solver"
                            ? "bg-amber-100 text-amber-900"
                            : "bg-indigo-50 text-indigo-800"
                        }`}
                      >
                        {row.kind}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-gray-800">{fmtInt(row.sessions)}</td>
                    <td className="px-3 py-2 text-emerald-700">{fmtDwell(row.medianDwellMs)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Panel>
    </div>
  );
}

function VariantCohortGrid({ variants }: { variants: NonNullable<View["activationStickiness"]>["variants"] }): React.JSX.Element | null {
  if (!variants || variants.length === 0) return null;
  return (
    <div className="rounded-xl border border-indigo-200 bg-white px-4 py-3 shadow-sm">
      <div className="text-xs font-semibold text-gray-800 mb-2">Active UI Experiment Variants</div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
        {variants.map((v) => {
          const liftBadge = v.liftVsControlPct != null ? `${v.liftVsControlPct > 0 ? "+" : ""}${v.liftVsControlPct.toFixed(1)}% lift` : "Control / Baseline";
          const confTone = v.confidenceLabel === "Statistically Significant (95%+)" ? "bg-emerald-100 text-emerald-800" : v.confidenceLabel === "Trending" ? "bg-sky-100 text-sky-800" : "bg-gray-200 text-gray-700";
          return (
            <div key={v.variant} className="rounded-lg border border-gray-200 bg-gray-50/70 px-3 py-2 text-xs">
              <div className="font-mono font-semibold text-indigo-800 truncate" title={v.variant}>{v.variant}</div>
              <div className="mt-1 flex flex-wrap items-center gap-2 font-mono text-[11px] text-gray-600">
                <span>{fmtInt(v.sessions)}s</span>
                <span className="text-emerald-700 font-semibold">{fmtPct(v.activationRatePct)} act</span>
                <span className={v.frustratedSessions > 0 ? "text-amber-700 font-semibold" : "text-gray-500"}>{fmtPct(v.frustrationRatePct)} fric</span>
              </div>
              {(v.liftVsControlPct != null || v.confidenceLabel) && (
                <div className="mt-1.5 flex flex-wrap items-center gap-1.5 font-mono text-[10px]">
                  <span className="font-semibold text-gray-800">{liftBadge}</span>
                  {v.confidenceLabel && <span className={`px-1.5 py-0.5 rounded font-semibold ${confTone}`}>{v.confidenceLabel}</span>}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function ActivationStickinessStrip({
  summary,
  data,
}: {
  summary?: View["activationStickiness"] | null;
  data?: View;
}): React.JSX.Element | null {
  const s = summary ?? data?.activationStickiness;
  if (!s) return null;

  const ttfaLabel = s.avgTimeToFirstActionMs !== null ? ` · TTFA ${fmtDwell(s.avgTimeToFirstActionMs)}` : "";
  return (
    <div className="space-y-3">
      <StatGrid>
        <Stat label="Activation Rate" value={fmtPct(s.activationRatePct)} sub={`${fmtInt(s.activatedSessions)} core value sessions${ttfaLabel}`} tone={s.activationRatePct >= 0.3 ? "ok" : "neutral"} />
        <Stat label="Returning Visitors" value={fmtPct(s.returningRatePct)} sub={`${fmtInt(s.returningVisitors)} returning / ${fmtInt(s.totalVisitors)} (${fmtInt(s.newVisitors)} new)`} tone={s.returningRatePct >= 0.2 ? "ok" : "neutral"} />
        <Stat label="DAU / WAU Stickiness" value={fmtPct(s.stickinessRatioPct)} sub={`${fmtInt(s.dauCount)} DAU · ${fmtInt(s.wauCount)} WAU`} tone={s.stickinessRatioPct >= 0.25 ? "ok" : "neutral"} />
        <Stat label="Frustrated Sessions" value={fmtPct(s.frustrationRatePct)} sub={`${fmtInt(s.frustratedSessions)} rage/dead/quick-back/error`} tone={s.frustratedSessions > 0 ? "warn" : "ok"} />
      </StatGrid>
      <VariantCohortGrid variants={s.variants} />
    </div>
  );
}

export function RouteFlowMatrixPanel({
  rows,
  onSelectPath,
  onSelectFriction,
}: {
  rows: View["routeFlowMatrix"] | null | undefined;
  onSelectPath: (path: string) => void;
  onSelectFriction: (path: string) => void;
}): React.JSX.Element {
  if (!rows || rows.length === 0) {
    return (
      <Panel
        title="Route pathfinder & exit matrix"
        subtitle="per-route entry rates, exit drop-offs, bounce rates, friction hits, and top subsequent destinations"
        right={<Pill tone="neutral">0 routes</Pill>}
      >
        <p className="text-xs text-gray-500">No route transitions recorded in this window yet.</p>
      </Panel>
    );
  }

  return (
    <Panel
      title="Route pathfinder & exit matrix"
      subtitle="per-route entry rates, exit drop-offs, single-page bounce rates, friction hits & top next routes"
      right={<Pill tone="info">{rows.length} top routes</Pill>}
    >
      <div className="overflow-x-auto -mx-4 sm:-mx-5">
        <table className="w-full text-xs">
          <thead className="bg-gray-50 text-[10px] uppercase tracking-wider text-gray-500">
            <tr>
              {[
                "Route",
                "Views / Sessions",
                "Entry Rate",
                "Exit Rate",
                "Bounce Rate",
                "Avg Dwell",
                "Friction Hits",
                "Top Next Routes (Pathfinder)",
              ].map((h) => (
                <th key={h} scope="col" className="px-3 py-2 text-left font-semibold">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {rows.map((r) => (
              <tr key={r.path} className="hover:bg-gray-50 align-top">
                <td className="px-3 py-2 font-mono max-w-[200px] truncate" title={r.path}>
                  <button
                    type="button"
                    onClick={() => onSelectPath(r.path)}
                    className="font-semibold text-indigo-700 hover:underline text-left"
                  >
                    {r.path}
                  </button>
                </td>
                <td className="px-3 py-2 font-mono text-gray-700 whitespace-nowrap">
                  {fmtInt(r.totalViews)} · {fmtInt(r.uniqueSessions)}s
                </td>
                <td className="px-3 py-2 font-mono text-gray-700 whitespace-nowrap">
                  {fmtPct(r.entryRatePct)}{" "}
                  <span className="text-[10px] text-gray-400">({fmtInt(r.entryCount)})</span>
                </td>
                <td className="px-3 py-2 font-mono text-gray-700 whitespace-nowrap">
                  {fmtPct(r.exitRatePct)}{" "}
                  <span className="text-[10px] text-gray-400">({fmtInt(r.exitCount)})</span>
                </td>
                <td className="px-3 py-2 font-mono whitespace-nowrap">
                  <span className={r.singlePageBounceRatePct >= 0.6 ? "text-amber-700 font-semibold" : "text-gray-700"}>
                    {fmtPct(r.singlePageBounceRatePct)}
                  </span>
                </td>
                <td className="px-3 py-2 font-mono text-gray-700 whitespace-nowrap">
                  {fmtDwell(r.avgDwellMs)}
                </td>
                <td className="px-3 py-2 whitespace-nowrap">
                  {r.frictionCount > 0 ? (
                    <button
                      type="button"
                      onClick={() => onSelectFriction(r.path)}
                      className="px-2 py-0.5 rounded bg-amber-100 hover:bg-amber-200 text-amber-900 font-mono text-[11px] font-semibold transition-colors"
                      title="Click to inspect frustrated sessions on this route"
                    >
                      🔥 {fmtInt(r.frictionCount)}
                    </button>
                  ) : (
                    <span className="font-mono text-gray-400">0</span>
                  )}
                </td>
                <td className="px-3 py-2">
                  {r.topNextPaths.length === 0 ? (
                    <span className="text-gray-400 text-[11px]">Exit / single-step</span>
                  ) : (
                    <div className="flex flex-wrap items-center gap-1">
                      {r.topNextPaths.map((hop) => (
                        <button
                          key={hop.path}
                          type="button"
                          onClick={() => onSelectPath(hop.path)}
                          className="px-1.5 py-0.5 rounded bg-slate-100 hover:bg-indigo-50 text-slate-800 hover:text-indigo-700 font-mono text-[10px] transition-colors"
                        >
                          → {hop.path} ({fmtInt(hop.count)})
                        </button>
                      ))}
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Panel>
  );
}

const INTERACTION_TONE_STYLE: Record<InteractionTone, string> = {
  conversion: "bg-emerald-50 border-emerald-200 text-emerald-800",
  friction: "bg-amber-50 border-amber-200 text-amber-800",
  error: "bg-rose-50 border-rose-200 text-rose-800 font-semibold",
  feature: "bg-indigo-50 border-indigo-200 text-indigo-800",
};

function fmtDwellCompact(ms: number): string {
  if (ms < 1_000) return "—";
  const sec = Math.round(ms / 1_000);
  if (sec < 60) return `${sec}s`;
  const min = Math.floor(sec / 60);
  const rem = sec % 60;
  return rem > 0 ? `${min}m ${rem}s` : `${min}m`;
}

type TallySortKey = "totalCount" | "uniqueSessions" | "avgDwellMs" | "lastSeenAt";

function parseTallySortKey(val: string): TallySortKey {
  if (val === "uniqueSessions" || val === "avgDwellMs" || val === "lastSeenAt") {
    return val;
  }
  return "totalCount";
}

export function InteractionTallyPanel({
  tallies,
  activeInteraction = "",
  onSelectInteraction,
}: {
  tallies: View["interactionTallies"] | null | undefined;
  activeInteraction?: string;
  onSelectInteraction: (tag: string) => void;
}): React.JSX.Element {
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [sortBy, setSortBy] = useState<TallySortKey>("totalCount");

  const rows = useMemo(() => tallies?.rows ?? [], [tallies]);
  const categories = useMemo(() => tallies?.categories ?? [], [tallies]);

  const filteredRows = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const filtered = rows.filter((r) => {
      if (categoryFilter !== "all" && r.category !== categoryFilter) return false;
      if (!q) return true;
      return (
        r.tag.toLowerCase().includes(q) ||
        r.category.toLowerCase().includes(q) ||
        r.topPath.toLowerCase().includes(q)
      );
    });
    return [...filtered].sort((a, b) => {
      if (sortBy === "uniqueSessions") {
        return b.uniqueSessions - a.uniqueSessions || b.totalCount - a.totalCount;
      }
      if (sortBy === "avgDwellMs") {
        return b.avgDwellMs - a.avgDwellMs || b.totalCount - a.totalCount;
      }
      if (sortBy === "lastSeenAt") {
        return a.lastSeenAt < b.lastSeenAt ? 1 : a.lastSeenAt > b.lastSeenAt ? -1 : 0;
      }
      return b.totalCount - a.totalCount || b.uniqueSessions - a.uniqueSessions;
    });
  }, [rows, categoryFilter, searchQuery, sortBy]);

  if (!tallies || rows.length === 0) {
    return (
      <Panel
        title="Site-wide interaction tally"
        subtitle="every explicit feature funnel action, tab switch, search, link click, and error recorded across public views"
        right={<Pill tone="neutral">0 interactions</Pill>}
      >
        <p className="text-xs text-gray-500">No interactions recorded in this window yet.</p>
      </Panel>
    );
  }

  return (
    <Panel
      title="Site-wide interaction tally"
      subtitle="tallied across every public page view in this window — click any row to inspect the exact views and sessions"
      right={
        <div className="flex flex-wrap items-center gap-2">
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Filter interaction or path…"
            aria-label="Filter interactions"
            className="px-2.5 py-1 text-xs rounded-md border border-gray-300 bg-white text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
          <select
            aria-label="Sort interactions"
            value={sortBy}
            onChange={(e) => setSortBy(parseTallySortKey(e.target.value))}
            className="px-2 py-1 text-xs rounded-md border border-gray-300 bg-white text-gray-700 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          >
            <option value="totalCount">Sort: Total hits</option>
            <option value="uniqueSessions">Sort: Unique sessions</option>
            <option value="avgDwellMs">Sort: Avg dwell</option>
            <option value="lastSeenAt">Sort: Last seen</option>
          </select>
          <Pill tone="info">
            {fmtInt(tallies.totalInteractions)} hits · {fmtInt(tallies.totalSessionsWithInteractions)} sessions
          </Pill>
        </div>
      }
    >
      {categories.length > 0 && (
        <div className="mb-3 pb-3 border-b border-gray-100 flex flex-wrap items-center gap-1.5" role="group" aria-label="Interaction categories">
          <button
            type="button"
            onClick={() => setCategoryFilter("all")}
            className={`px-2.5 py-1 rounded-full text-[11px] font-medium border transition-colors ${
              categoryFilter === "all"
                ? "bg-gray-900 text-white border-gray-900"
                : "bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100"
            }`}
          >
            All <span className="font-mono opacity-75">{fmtInt(tallies.totalInteractions)}</span>
          </button>
          {categories.map((c) => {
            const active = categoryFilter === c.category;
            return (
              <button
                key={c.category}
                type="button"
                onClick={() => setCategoryFilter(active ? "all" : c.category)}
                className={`px-2.5 py-1 rounded-full text-[11px] font-medium border transition-colors ${
                  active
                    ? "bg-indigo-700 text-white border-indigo-700"
                    : "bg-indigo-50/60 text-indigo-900 border-indigo-200 hover:bg-indigo-100"
                }`}
              >
                <span className="font-mono">{c.category}</span>{" "}
                <span className="font-mono opacity-80">
                  {fmtInt(c.totalCount)} ({fmtPct(c.sessionReachPct)})
                </span>
              </button>
            );
          })}
        </div>
      )}

      {filteredRows.length === 0 ? (
        <p className="text-xs text-gray-500 py-3">No interactions match this category/search filter.</p>
      ) : (
        <div className="overflow-x-auto -mx-4 sm:-mx-5">
          <table className="w-full text-xs">
            <thead className="bg-gray-50 text-[10px] uppercase tracking-wider text-gray-500">
              <tr>
                {[
                  "Interaction",
                  "Category",
                  "Total Hits",
                  "Unique Views",
                  "Sessions (Reach)",
                  "Top Page",
                  "Avg Dwell",
                  "Last Seen",
                  "",
                ].map((h) => (
                  <th key={h} scope="col" className="px-3 py-2 text-left font-semibold">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredRows.map((r) => {
                const selected = activeInteraction.toLowerCase() === r.tag.toLowerCase();
                const classified = classifyInteractionTag(r.tag);
                return (
                  <tr
                    key={r.tag}
                    className={selected ? "bg-indigo-50/70" : "hover:bg-gray-50"}
                  >
                    <td className="px-3 py-2">
                      <span
                        className={`inline-block px-2 py-0.5 rounded border font-mono text-[11px] ${
                          INTERACTION_TONE_STYLE[classified.tone]
                        }`}
                      >
                        {r.tag}
                      </span>
                    </td>
                    <td className="px-3 py-2 font-mono text-[11px] text-gray-600">{r.category}</td>
                    <td className="px-3 py-2 font-mono font-semibold text-gray-900">{fmtInt(r.totalCount)}</td>
                    <td className="px-3 py-2 font-mono text-gray-700">{fmtInt(r.uniqueViews)}</td>
                    <td className="px-3 py-2 font-mono text-gray-700">
                      <span>{fmtInt(r.uniqueSessions)}</span>{" "}
                      <span className="text-[10px] text-gray-500">({fmtPct(r.sessionReachPct)})</span>
                    </td>
                    <td className="px-3 py-2 font-mono text-[11px] text-gray-700 max-w-[180px] truncate" title={r.topPath}>
                      {r.topPath}
                    </td>
                    <td className="px-3 py-2 font-mono text-gray-600">{fmtDwellCompact(r.avgDwellMs)}</td>
                    <td className="px-3 py-2 whitespace-nowrap text-gray-500">{fmtAgo(r.lastSeenAt)}</td>
                    <td className="px-3 py-2 text-right whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => onSelectInteraction(selected ? "" : r.tag)}
                        className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-colors ${
                          selected
                            ? "bg-indigo-700 text-white"
                            : "bg-indigo-100 text-indigo-800 hover:bg-indigo-200"
                        }`}
                      >
                        {selected ? "Active ✓" : "Filter Views →"}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </Panel>
  );
}

function cohortCellClass(ratio: number): string {
  if (ratio >= 0.4) return "bg-emerald-200/80 text-emerald-950 font-semibold";
  if (ratio >= 0.2) return "bg-emerald-100 text-emerald-900 font-semibold";
  if (ratio > 0) return "bg-teal-50 text-teal-900";
  return "text-gray-400";
}

export function RetentionCohortPanel({
  cohorts,
}: {
  cohorts?: View["retentionCohorts"];
}): React.JSX.Element {
  if (!cohorts || cohorts.length === 0) {
    return (
      <Panel
        title="Visitor retention cohorts"
        subtitle="first-seen cohort day activation and D1 / D3 / D7 return rates"
        right={<Pill tone="neutral">0 cohorts</Pill>}
      >
        <p className="text-xs text-gray-500">Not enough multi-day human cohort history yet.</p>
      </Panel>
    );
  }
  return (
    <Panel
      title="Visitor retention cohorts"
      subtitle="first-seen human cohorts · Day-0 activation and multi-day return rates"
      right={<Pill tone="ok">{cohorts.length} cohorts</Pill>}
    >
      <div className="overflow-x-auto">
        <table className="min-w-full text-xs">
          <thead>
            <tr className="border-b border-gray-200 text-left text-[10px] font-semibold uppercase tracking-wider text-gray-500">
              <th className="px-3 py-2">Cohort</th>
              <th className="px-3 py-2">New Humans</th>
              <th className="px-3 py-2">Day-0 Activated</th>
              <th className="px-3 py-2">D1 Return</th>
              <th className="px-3 py-2">D3 Return</th>
              <th className="px-3 py-2">D7 Return</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {cohorts.map((row) => (
              <tr key={row.cohortStart} className="hover:bg-gray-50/70 font-mono">
                <td className="px-3 py-2 font-semibold text-gray-900">{row.cohortLabel}</td>
                <td className="px-3 py-2 text-gray-800">{fmtInt(row.newVisitors)}</td>
                <td className={`px-3 py-2 rounded-sm ${cohortCellClass(row.activatedFirstDayPct)}`}>{fmtPct(row.activatedFirstDayPct)}</td>
                <td className={`px-3 py-2 rounded-sm ${cohortCellClass(row.d1ReturnPct)}`}>{fmtPct(row.d1ReturnPct)}</td>
                <td className={`px-3 py-2 rounded-sm ${cohortCellClass(row.d3ReturnPct)}`}>{fmtPct(row.d3ReturnPct)}</td>
                <td className={`px-3 py-2 rounded-sm ${cohortCellClass(row.d7ReturnPct)}`}>{fmtPct(row.d7ReturnPct)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Panel>
  );
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
