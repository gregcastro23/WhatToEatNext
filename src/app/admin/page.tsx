"use client";

import Link from "next/link";
import React, { useState } from "react";
import AdvancedMetricsPanel from "@/components/admin/AdvancedMetricsPanel";
import ApiRouteHealthPanel from "@/components/admin/ApiRouteHealthPanel";
import CosmicOperationsPanel from "@/components/admin/CosmicOperationsPanel";
import FaucetResonancePanel from "@/components/admin/FaucetResonancePanel";
import LaunchReadinessPanel from "@/components/admin/LaunchReadinessPanel";
import { useAdminResource } from "@/components/admin/live/useAdminResource";
import LiveActivityPanel from "@/components/admin/LiveActivityPanel";
import PulseStrip from "@/components/admin/PulseStrip";
import ReliabilityPanel from "@/components/admin/ReliabilityPanel";
import SearchGapsPanel from "@/components/admin/SearchGapsPanel";
import SystemStatusPanel from "@/components/admin/SystemStatusPanel";
import TodaysHighlightsPanel from "@/components/admin/TodaysHighlightsPanel";
import { OverviewPulseResponseSchema, type OverviewPulseView } from "@/lib/admin/schemas/overviewPulse";

type DeepDiveTab = "audience" | "reliability" | "economy" | "consoles" | "all";

function FrictionAlertBanners({
  alerts,
}: {
  alerts: OverviewPulseView["frictionAlerts"] | undefined;
}): React.JSX.Element | null {
  if (!alerts) return null;
  const hasReviewers = alerts.activeReviewers.length > 0;
  const hasErrors = alerts.errorSessions60m > 0;
  const hasZeroSearch = alerts.topZeroResultQuery !== null && alerts.topZeroResultQuery.sessions > 0;

  if (!hasReviewers && !hasErrors && !hasZeroSearch) return null;

  return (
    <div className="space-y-2" role="region" aria-label="Live friction and reviewer alerts">
      {alerts.activeReviewers.map((rev) => (
        <div
          key={rev.sessionKey}
          className="rounded-xl border border-purple-300 bg-gradient-to-r from-purple-50 via-teal-50 to-white px-4 py-3 flex flex-wrap items-center justify-between gap-3 shadow-sm"
        >
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="inline-block h-2.5 w-2.5 rounded-full bg-emerald-500 animate-ping" />
            <span className="px-2 py-0.5 rounded bg-purple-700 text-white font-mono text-[10px] font-bold">
              ★ ACTIVE REVIEWER
            </span>
            <span className="font-mono font-semibold text-purple-900">
              ref:{rev.refTag}
            </span>
            <span className="text-gray-600">
              is browsing <code className="font-mono font-semibold text-gray-900">{rev.path}</code>
            </span>
            <span className="font-mono text-[11px] text-gray-400">
              (#{rev.visitorHash.slice(0, 6)})
            </span>
          </div>
          <Link
            href={`/admin/traffic?session=${encodeURIComponent(rev.sessionKey)}`}
            className="px-3 py-1 rounded-lg bg-purple-700 hover:bg-purple-800 text-white text-xs font-semibold transition-colors"
          >
            Watch Live Journey →
          </Link>
        </div>
      ))}

      {hasErrors && (
        <div
          className={`rounded-xl border px-4 py-3 flex flex-wrap items-center justify-between gap-3 shadow-sm ${
            alerts.errorBurstTriggered
              ? "border-rose-300 bg-rose-50 text-rose-900"
              : "border-amber-300 bg-amber-50 text-amber-900"
          }`}
        >
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="font-bold uppercase tracking-wider font-mono text-[10px] px-2 py-0.5 rounded bg-rose-600 text-white">
              {alerts.errorBurstTriggered ? "🚨 Client Error Burst" : "⚠️ Client Error Detected"}
            </span>
            <span>
              <strong>{alerts.errorSessions60m}</strong> visitor{" "}
              {alerts.errorSessions60m === 1 ? "session" : "sessions"} hit{" "}
              <code className="font-mono font-semibold">{alerts.topErrorTag ?? "error:*"}</code> in the last 60 minutes.
            </span>
          </div>
          <Link
            href="/admin/traffic?preset=error"
            className="px-3 py-1 rounded-lg bg-rose-700 hover:bg-rose-800 text-white text-xs font-semibold transition-colors"
          >
            Inspect Error Sessions →
          </Link>
        </div>
      )}

      {hasZeroSearch && alerts.topZeroResultQuery && (
        <div className="rounded-xl border border-amber-200 bg-amber-50/70 px-4 py-2.5 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2 text-xs text-amber-900">
            <span className="font-mono font-bold text-[10px] uppercase px-2 py-0.5 rounded bg-amber-200 text-amber-900">
              🔍 Zero-Result Spike (24h)
            </span>
            <span>
              Top unfulfilled query:{" "}
              <code className="font-mono font-semibold">&ldquo;{alerts.topZeroResultQuery.slug}&rdquo;</code> (
              {alerts.topZeroResultQuery.sessions}{" "}
              {alerts.topZeroResultQuery.sessions === 1 ? "session" : "sessions"})
            </span>
          </div>
          <Link
            href={`/admin/traffic?interaction=${encodeURIComponent(`search:zero_results:${alerts.topZeroResultQuery.slug}`)}&view=views`}
            className="text-xs font-semibold text-amber-900 hover:underline font-mono"
          >
            View Affected Sessions →
          </Link>
        </div>
      )}
    </div>
  );
}

const DEEP_DIVE_TABS: ReadonlyArray<{ id: DeepDiveTab; label: string; badge: string }> = [
  { id: "audience", label: "Today & Search Gaps", badge: "2 panels" },
  { id: "reliability", label: "API & Reliability", badge: "3 panels" },
  { id: "economy", label: "Launch, Faucet & Cosmic", badge: "3 panels" },
  { id: "consoles", label: "Dedicated Consoles", badge: "7 routes" },
  { id: "all", label: "Expand All", badge: "full" },
];

const CONSOLE_LINKS = [
  {
    href: "/admin/traffic",
    icon: "📈",
    title: "Traffic & Visitor Journeys",
    description: "Real-time visitor sessions, page-by-page trails, dwell time, and ?ref= link tracking.",
    accent: "hover:border-teal-300 text-teal-600 group-hover:text-teal-600",
  },
  {
    href: "/admin/onboarding",
    icon: "🧭",
    title: "User Onboarding Journey",
    description: "24h funnel drop-offs, stuck users, and step completion telemetry.",
    accent: "hover:border-purple-300 text-purple-600 group-hover:text-purple-600",
  },
  {
    href: "/admin/jobs",
    icon: "⏱️",
    title: "Jobs, Crons & Probes",
    description: "Synthetic probe timings, cron heartbeats, ledger reconciliation, and alert logs.",
    accent: "hover:border-indigo-300 text-indigo-600 group-hover:text-indigo-600",
  },
  {
    href: "/admin/agents",
    icon: "🪐",
    title: "Planetary Agents & ASOL",
    description: "Signed webhook ingestion, agent credit/debit balances, and boundary contracts.",
    accent: "hover:border-violet-300 text-violet-600 group-hover:text-violet-600",
  },
  {
    href: "/admin/mcp",
    icon: "🔌",
    title: "MCP Telemetry Mesh",
    description: "Cross-server MCP tool latency, persona invocations, and token quota burn.",
    accent: "hover:border-emerald-300 text-emerald-600 group-hover:text-emerald-600",
  },
  {
    href: "/admin/settlements",
    icon: "💳",
    title: "Restaurant Settlements",
    description: "Resolve unconfirmed ESMS-to-fiat restaurant transfers with idempotent retry or refund.",
    accent: "hover:border-amber-300 text-amber-600 group-hover:text-amber-600",
  },
  {
    href: "/admin/settings",
    icon: "⚙️",
    title: "Runtime, Email & Seeding",
    description: "SpacetimeDB probes, slow-query threshold tuning, test emails, and ERA5 environmental seeding.",
    accent: "hover:border-slate-300 text-slate-600 group-hover:text-slate-600",
  },
] as const;

/**
 * Admin Dashboard — Streamlined, human-first operator console.
 *
 * Above the fold:
 *   1. PulseStrip (live KPIs across traffic, growth, revenue, code, chain, agents)
 *   2. LiveActivityPanel (defaults to Humans Only, with inline visitor journeys)
 *   3. SystemStatusPanel (core user path vs. async service health)
 *
 * Below the fold:
 *   Lazy-mounted deep-dive tabs so secondary panels only poll when inspected.
 */
export default function AdminDashboardPage(): React.JSX.Element {
  const [activeTab, setActiveTab] = useState<DeepDiveTab>("audience");
  const { data: overviewData, error: overviewError } = useAdminResource(
    "/api/admin/overview-pulse",
    OverviewPulseResponseSchema,
    30_000,
  );

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Overview</h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1">
            Human-first operational command center — live visitors, session journeys, and core system health.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href="/admin/traffic"
            className="inline-flex items-center gap-1.5 rounded-lg bg-teal-600 px-3.5 py-2 text-xs font-semibold text-white shadow-sm hover:bg-teal-700 transition-colors"
          >
            <span>📈</span>
            <span>Visitor Journeys</span>
          </Link>
          <Link
            href="/admin/users"
            className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-3.5 py-2 text-xs font-semibold text-gray-700 shadow-sm hover:bg-gray-50 transition-colors"
          >
            <span>👥</span>
            <span>Users</span>
          </Link>
          <Link
            href="/admin/dashboard"
            className="inline-flex items-center gap-1.5 rounded-lg bg-purple-600 px-3.5 py-2 text-xs font-semibold text-white shadow-sm hover:bg-purple-700 transition-colors"
          >
            <span>🔭</span>
            <span>Control Plane ✦</span>
          </Link>
          <Link
            href="/admin/settings"
            className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-3.5 py-2 text-xs font-semibold text-gray-700 shadow-sm hover:bg-gray-50 transition-colors"
          >
            <span>⚙️</span>
            <span>Runtime & Diagnostics</span>
          </Link>
        </div>
      </div>

      {/* Automated Friction & Active Reviewer Alerts */}
      <FrictionAlertBanners alerts={overviewData?.frictionAlerts} />

      {/* Tier 1: Live headline pulse per domain (multiplexed via /api/admin/overview-pulse) */}
      <PulseStrip
        externalData={overviewData?.pulse ?? null}
        externalError={overviewError}
      />

      {/* Tier 2: Live human activity & visitor stream */}
      <LiveActivityPanel
        externalData={overviewData?.liveActivity ?? null}
        externalError={overviewError}
      />

      {/* Tier 3: Core User Path vs. Async System Status */}
      <SystemStatusPanel
        externalData={overviewData?.systemStatus ?? null}
        externalError={overviewError}
      />

      {/* Tier 4: On-Demand Deep-Dive Subsystems (only mounts & polls the selected tab) */}
      <section aria-label="Deep-dive subsystems" className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-200 pb-3">
          <div>
            <h2 className="text-sm font-bold uppercase tracking-wider text-gray-700">
              Deep-Dive Telemetry & Subsystems
            </h2>
            <p className="text-xs text-gray-500">
              Panels mount on demand to keep background polling lean and responsive.
            </p>
          </div>
          <div className="flex flex-wrap gap-1.5" role="tablist" aria-label="Subsystem tabs">
            {DEEP_DIVE_TABS.map((tab) => {
              const selected = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  role="tab"
                  aria-selected={selected}
                  onClick={() => setActiveTab(tab.id)}
                  className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                    selected
                      ? "bg-gray-900 text-white shadow-sm"
                      : "bg-white text-gray-700 border border-gray-200 hover:bg-gray-50"
                  }`}
                >
                  <span>{tab.label}</span>
                  <span
                    className={`rounded-full px-1.5 py-0.5 font-mono text-[10px] ${
                      selected ? "bg-white/20 text-white" : "bg-gray-100 text-gray-500"
                    }`}
                  >
                    {tab.badge}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {(activeTab === "audience" || activeTab === "all") && (
          <div className="space-y-6">
            {overviewData?.frictionAlerts?.topZeroResultQuery && (
              <div className="rounded-xl border border-amber-200 bg-white p-4 flex flex-wrap items-center justify-between gap-3 shadow-sm">
                <div className="text-xs text-gray-700">
                  <span className="font-semibold text-gray-900">
                    Emerging Zero-Result Search (24h):
                  </span>{" "}
                  <code className="font-mono text-amber-800 bg-amber-50 px-1.5 py-0.5 rounded">
                    {overviewData.frictionAlerts.topZeroResultQuery.slug}
                  </code>{" "}
                  across{" "}
                  <strong>{overviewData.frictionAlerts.topZeroResultQuery.sessions}</strong>{" "}
                  visitor session(s).
                </div>
                <Link
                  href={`/admin/traffic?interaction=${encodeURIComponent(`search:zero_results:${overviewData.frictionAlerts.topZeroResultQuery.slug}`)}&view=views`}
                  className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold transition-colors"
                >
                  View Affected Sessions →
                </Link>
              </div>
            )}
            {overviewData?.interactionTallies && overviewData.interactionTallies.rows.length > 0 && (
              <div className="rounded-xl border border-indigo-200 bg-white p-4 shadow-sm space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <div className="text-sm font-semibold text-gray-900">
                      Top Site Interactions (24h)
                    </div>
                    <div className="text-xs text-gray-500">
                      {overviewData.interactionTallies.totalInteractions} total hits across{" "}
                      {overviewData.interactionTallies.totalSessionsWithInteractions} active session(s) — click any tag to inspect views
                    </div>
                  </div>
                  <Link
                    href="/admin/traffic?view=views"
                    className="text-xs font-semibold text-indigo-700 hover:underline"
                  >
                    Open Full Interaction Tally →
                  </Link>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                  {overviewData.interactionTallies.rows.slice(0, 6).map((row) => (
                    <Link
                      key={row.tag}
                      href={`/admin/traffic?interaction=${encodeURIComponent(row.tag)}&view=views`}
                      className="flex items-center justify-between gap-2 rounded-lg border border-gray-200 bg-gray-50/70 hover:bg-indigo-50/60 hover:border-indigo-200 px-3 py-2 transition-colors"
                    >
                      <div className="min-w-0">
                        <div className="font-mono text-xs font-semibold text-gray-900 truncate" title={row.tag}>
                          {row.tag}
                        </div>
                        <div className="text-[11px] text-gray-500 truncate">
                          {row.topPath} · {row.uniqueSessions} sessions
                        </div>
                      </div>
                      <span className="shrink-0 font-mono text-xs font-bold text-indigo-700 bg-indigo-100 px-2 py-0.5 rounded">
                        {row.totalCount}
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            )}
            <TodaysHighlightsPanel />
            <SearchGapsPanel />
          </div>
        )}

        {(activeTab === "reliability" || activeTab === "all") && (
          <div className="space-y-6">
            <ReliabilityPanel />
            <ApiRouteHealthPanel />
            <AdvancedMetricsPanel />
          </div>
        )}

        {(activeTab === "economy" || activeTab === "all") && (
          <div className="space-y-6">
            <LaunchReadinessPanel variant="compact" />
            <FaucetResonancePanel />
            <CosmicOperationsPanel />
          </div>
        )}

        {(activeTab === "consoles" || activeTab === "all") && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {CONSOLE_LINKS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`p-5 bg-white rounded-xl shadow-lg border border-gray-100 hover:shadow-xl transition-all group ${item.accent}`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xl">{item.icon}</span>
                  <span className="text-xs font-bold group-hover:translate-x-0.5 transition-transform">
                    EXPLORE →
                  </span>
                </div>
                <h3 className="font-bold text-gray-800 transition-colors">
                  {item.title}
                </h3>
                <p className="text-xs text-gray-500 mt-1">
                  {item.description}
                </p>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
