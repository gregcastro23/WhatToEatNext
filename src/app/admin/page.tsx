"use client";

import Link from "next/link";
import React from "react";
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
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Overview</h1>
        <p className="text-sm sm:text-base text-gray-600 mt-1">
          Live operational state of alchm.kitchen — real-time source signals with Core vs. Async separation.
        </p>
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
      <div className="mb-8">
        <ReliabilityPanel />
      </div>

      {/* Per-route API health — top endpoints by traffic with error +
          latency badges. */}
      <ApiRouteHealthPanel />

      {/* Untethered faucet watch — band occupancy and emission pace. */}
      <div className="mb-8">
        <FaucetResonancePanel />
      </div>

      {/* Deep-Dive Operations Subsystems */}
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
      </div>
    </div>
  );
}
