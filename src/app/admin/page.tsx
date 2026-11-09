"use client";

import Link from "next/link";
import React from "react";
import AdvancedMetricsPanel from "@/components/admin/AdvancedMetricsPanel";
import ApiRouteHealthPanel from "@/components/admin/ApiRouteHealthPanel";
import FaucetResonancePanel from "@/components/admin/FaucetResonancePanel";
import LaunchReadinessPanel from "@/components/admin/LaunchReadinessPanel";
import LiveActivityPanel from "@/components/admin/LiveActivityPanel";
import PulseStrip from "@/components/admin/PulseStrip";
import ReliabilityPanel from "@/components/admin/ReliabilityPanel";
import SystemStatusPanel from "@/components/admin/SystemStatusPanel";
import TodaysHighlightsPanel from "@/components/admin/TodaysHighlightsPanel";

/**
 * Admin Dashboard - Lean operator overview of system state & high-level health
 */
export default function AdminDashboardPage(): React.JSX.Element {
  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Overview</h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1">
            Live operational state of alchm.kitchen — real-time source signals with Core vs. Async separation.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
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

      {/* Pulse — one live headline per source (traffic, growth, Stripe, code
          health, chain), each linking to its detail page. Polls every 30s. */}
      <PulseStrip />

      {/* Launch readiness — settlement backlog + presence-only config for every
          revenue / on-chain subsystem. Polls every 2 min. */}
      <LaunchReadinessPanel variant="compact" />

      {/* Today's headline counts — 24h vs prior 24h. Polls every 60s. */}
      <TodaysHighlightsPanel />

      {/* Live activity feed — merged stream of signups, sign-ins, onboardings,
          recipe views, food diary entries, token movements, and agent events.
          Polls every 10s. */}
      <LiveActivityPanel />

      {/* System Status — per-flow health partitioned by Core User Path vs.
          Async & Background Services, with incident snooze controls. Polls every 60s. */}
      <SystemStatusPanel />

      {/* Reliability over time — durable health history, per-probe failure
          rates, and deduplicated alert delivery. Polls every 60s. */}
      <ReliabilityPanel />

      {/* Per-route API health — top endpoints by traffic with error +
          latency badges. */}
      <ApiRouteHealthPanel />

      {/* Untethered faucet watch — band occupancy and emission pace. */}
      <FaucetResonancePanel />

      {/* Advanced Metrics — auth rollups, suspicious IP/email brute-force radar,
          in-process slow query ring & threshold tuning, and digest triggers. */}
      <AdvancedMetricsPanel />

      {/* Deep-Dive Operations Subsystems */}
      <div>
        <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-500 mb-3">
          Dedicated Operations Consoles
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            href="/admin/onboarding"
            className="p-5 bg-white rounded-xl shadow-lg border border-gray-100 hover:border-purple-300 hover:shadow-xl transition-all group"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xl">🧭</span>
              <span className="text-xs font-bold text-purple-600 group-hover:translate-x-0.5 transition-transform">
                EXPLORE →
              </span>
            </div>
            <h3 className="font-bold text-gray-800 group-hover:text-purple-600 transition-colors">
              User Onboarding Journey
            </h3>
            <p className="text-xs text-gray-500 mt-1">
              24h funnel drop-offs, stuck users, and step completion telemetry.
            </p>
          </Link>

          <Link
            href="/admin/jobs"
            className="p-5 bg-white rounded-xl shadow-lg border border-gray-100 hover:border-indigo-300 hover:shadow-xl transition-all group"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xl">⏱️</span>
              <span className="text-xs font-bold text-indigo-600 group-hover:translate-x-0.5 transition-transform">
                EXPLORE →
              </span>
            </div>
            <h3 className="font-bold text-gray-800 group-hover:text-indigo-600 transition-colors">
              Jobs, Crons & Probes
            </h3>
            <p className="text-xs text-gray-500 mt-1">
              Synthetic probe timings, cron heartbeats, ledger reconciliation, and alert logs.
            </p>
          </Link>

          <Link
            href="/admin/agents"
            className="p-5 bg-white rounded-xl shadow-lg border border-gray-100 hover:border-violet-300 hover:shadow-xl transition-all group"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xl">🪐</span>
              <span className="text-xs font-bold text-violet-600 group-hover:translate-x-0.5 transition-transform">
                EXPLORE →
              </span>
            </div>
            <h3 className="font-bold text-gray-800 group-hover:text-violet-600 transition-colors">
              Planetary Agents & ASOL
            </h3>
            <p className="text-xs text-gray-500 mt-1">
              Signed webhook ingestion, agent credit/debit balances, and boundary contracts.
            </p>
          </Link>

          <Link
            href="/admin/mcp"
            className="p-5 bg-white rounded-xl shadow-lg border border-gray-100 hover:border-emerald-300 hover:shadow-xl transition-all group"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xl">🔌</span>
              <span className="text-xs font-bold text-emerald-600 group-hover:translate-x-0.5 transition-transform">
                EXPLORE →
              </span>
            </div>
            <h3 className="font-bold text-gray-800 group-hover:text-emerald-600 transition-colors">
              MCP Telemetry Mesh
            </h3>
            <p className="text-xs text-gray-500 mt-1">
              Cross-server MCP tool latency, persona invocations, and token quota burn.
            </p>
          </Link>

          <Link
            href="/admin/settlements"
            className="p-5 bg-white rounded-xl shadow-lg border border-gray-100 hover:border-amber-300 hover:shadow-xl transition-all group"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xl">💳</span>
              <span className="text-xs font-bold text-amber-600 group-hover:translate-x-0.5 transition-transform">
                EXPLORE →
              </span>
            </div>
            <h3 className="font-bold text-gray-800 group-hover:text-amber-600 transition-colors">
              Restaurant Settlements
            </h3>
            <p className="text-xs text-gray-500 mt-1">
              Resolve unconfirmed ESMS-to-fiat restaurant transfers with idempotent retry or refund.
            </p>
          </Link>

          <Link
            href="/admin/settings"
            className="p-5 bg-white rounded-xl shadow-lg border border-gray-100 hover:border-slate-300 hover:shadow-xl transition-all group"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xl">⚙️</span>
              <span className="text-xs font-bold text-slate-600 group-hover:translate-x-0.5 transition-transform">
                EXPLORE →
              </span>
            </div>
            <h3 className="font-bold text-gray-800 group-hover:text-slate-600 transition-colors">
              Runtime, Email & Seeding
            </h3>
            <p className="text-xs text-gray-500 mt-1">
              SpacetimeDB probes, slow-query threshold tuning, test emails, and ERA5 environmental seeding.
            </p>
          </Link>
        </div>
      </div>
    </div>
  );
}
