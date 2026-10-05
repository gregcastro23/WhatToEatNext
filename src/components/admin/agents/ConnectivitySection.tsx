"use client";

/**
 * Connectivity & Boundary Diagnostics Section for Admin Agents
 *
 * @file src/components/admin/agents/ConnectivitySection.tsx
 */

import React from "react";
import { fmtAgo, fmtInt } from "@/components/admin/live/format";
import { Pill } from "@/components/admin/live/primitives";
import type { AdminAgentsView } from "@/lib/admin/schemas/agents";

function formatLatency(ms: number | null): string {
  if (ms === null) return "—";
  return `${Math.round(ms)} ms`;
}

function RosterCard({ roster }: { roster: AdminAgentsView["roster"] | undefined }): React.ReactElement {
  return (
    <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
            Agent Population
          </span>
          <Pill tone={roster?.live ? "ok" : "neutral"}>
            {roster?.live ? "Live DB" : "Offline"}
          </Pill>
        </div>
        <div className="text-3xl font-extrabold text-gray-900 mt-2">
          {roster?.live ? fmtInt(roster.totalAgents) : "—"}
        </div>
        <p className="text-xs text-gray-500 mt-1">
          {roster?.live ? `${fmtInt(roster.activeAgents24h)} active in last 24h` : "Awaiting database read"}
        </p>
      </div>
      <div className="text-[11px] text-gray-400 mt-3 pt-2 border-t border-gray-100">
        Filtered on users table (is_agent = true)
      </div>
    </div>
  );
}

function ServiceCard({ svc }: { svc: AdminAgentsView["connectivity"]["services"][number] }): React.ReactElement {
  return (
    <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
            {svc.label}
          </span>
          <Pill tone={svc.reachable ? "ok" : "bad"}>
            {svc.reachable ? "Reachable" : "Unreachable"}
          </Pill>
        </div>
        <div className="text-2xl font-bold text-gray-900 mt-2 flex items-baseline gap-2">
          <span>{formatLatency(svc.latencyMs)}</span>
          {svc.statusCode !== null && (
            <span className="text-xs font-normal text-gray-500">HTTP {svc.statusCode}</span>
          )}
        </div>
        <p className="text-xs text-gray-400 mt-1 font-mono truncate" title={svc.url}>
          {svc.url}
        </p>
      </div>
      <div className="text-[11px] text-gray-500 mt-3 pt-2 border-t border-gray-100 flex items-center justify-between">
        <span>Pinged {fmtAgo(svc.checkedAt)}</span>
        {svc.error && (
          <span className="text-rose-600 truncate max-w-[150px]" title={svc.error}>
            {svc.error}
          </span>
        )}
      </div>
    </div>
  );
}

function ProbeCheckItem({ label, passed, status }: { label: string; passed: boolean; status: number | string }): React.ReactElement {
  return (
    <div className="p-3 bg-gray-50 rounded-lg border border-gray-100 text-xs">
      <div className="font-medium text-gray-700">{label}</div>
      <div className="mt-1 flex items-center gap-1.5">
        <span className={`w-2 h-2 rounded-full ${passed ? "bg-emerald-500" : "bg-rose-500"}`} />
        <span className="font-mono text-gray-600">{status}</span>
      </div>
    </div>
  );
}

function ContractProbeCard({ probe }: { probe: NonNullable<AdminAgentsView["connectivity"]["contractProbe"]> }): React.ReactElement {
  return (
    <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
        <div>
          <h3 className="text-sm font-semibold text-gray-800">
            Boundary Contract Diagnostics & Negative Controls
          </h3>
          <p className="text-xs text-gray-500">
            Validates authorized endpoints and verifies 401 rejection on unauthenticated calls.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Pill tone={probe.success ? "ok" : "bad"}>
            {probe.success ? "All Contracts Verified" : "Contract Violation"}
          </Pill>
          <Pill tone={probe.checks.negativeControls.passed ? "ok" : "warn"}>
            {probe.checks.negativeControls.passed ? "401 Negative Controls Confirmed" : "401 Controls Incomplete"}
          </Pill>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 pt-2">
        <ProbeCheckItem label="Agent Roster Auth" passed={probe.checks.agentRosterAuth.passed} status={probe.checks.agentRosterAuth.status} />
        <ProbeCheckItem label="Sync Status Auth" passed={probe.checks.syncStatusAuth.passed} status={probe.checks.syncStatusAuth.status} />
        <ProbeCheckItem label="Vessel Auth" passed={probe.checks.vesselAuth.passed} status={probe.checks.vesselAuth.status} />
        <ProbeCheckItem label="Check Shared Auth" passed={probe.checks.checkSharedAuth.passed} status={probe.checks.checkSharedAuth.status} />
        <ProbeCheckItem
          label="Negative Controls"
          passed={probe.checks.negativeControls.passed}
          status={probe.checks.negativeControls.allRejectedWith401 ? "401 On All" : "Partial"}
        />
      </div>
    </div>
  );
}

export function ConnectivitySection({
  connectivity,
  roster,
}: {
  connectivity: AdminAgentsView["connectivity"] | undefined;
  roster: AdminAgentsView["roster"] | undefined;
}): React.ReactElement {
  const probe = connectivity?.contractProbe;

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-base font-bold text-gray-900">Connectivity & Boundary Probes</h2>
        <p className="text-xs text-gray-500 mt-0.5">
          Live TCP reachability, endpoint pings, and boundary auth diagnostics.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <RosterCard roster={roster} />
        {connectivity?.services.map((svc) => (
          <ServiceCard key={svc.key} svc={svc} />
        ))}
      </div>

      {probe && <ContractProbeCard probe={probe} />}
    </div>
  );
}
