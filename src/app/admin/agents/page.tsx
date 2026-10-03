"use client";

/**
 * Admin Agents Page
 *
 * Consolidated boundary telemetry between WTEN and Planetary Agents (ASOL):
 *   1. Service Reachability & Latency (planetaryAgentsApi, agentsUi)
 *   2. Boundary Contract Diagnostic Probes (with 401 Negative Controls)
 *   3. Agent Actions & Bridge Health (credit/debit paths, operational routes, crons, recipe pipeline)
 *   4. ASOL Inbound Delivery Telemetry (KPIs, secrets/signatures, routes, event log)
 *
 * @file src/app/admin/agents/page.tsx
 */

import React, { useState } from "react";
import { AsolAlertBanner } from "@/components/admin/asol/AsolAlertBanner";
import { AsolDeliveryActivity } from "@/components/admin/asol/AsolDeliveryActivity";
import { AsolKpiGrid } from "@/components/admin/asol/AsolKpiGrid";
import { AsolRouteBreakdown } from "@/components/admin/asol/AsolRouteBreakdown";
import { AsolStatusPanels } from "@/components/admin/asol/AsolStatusPanels";
import { fmtAgo, fmtInt } from "@/components/admin/live/format";
import { PageHeader, Pill } from "@/components/admin/live/primitives";
import { useAdminResource } from "@/components/admin/live/useAdminResource";
import { AdminAgentsSchema, type AdminAgentsView } from "@/lib/admin/schemas/agents";

function SectionHeader({
  title,
  description,
}: {
  title: string;
  description: string;
}): React.ReactElement {
  return (
    <div>
      <h2 className="text-base font-bold text-gray-900">{title}</h2>
      <p className="text-xs text-gray-500 mt-0.5">{description}</p>
    </div>
  );
}

function formatLatency(ms: number | null): string {
  if (ms === null || ms === undefined) return "—";
  return `${Math.round(ms)} ms`;
}

function ConnectivitySection({
  connectivity,
  roster,
}: {
  connectivity: AdminAgentsView["connectivity"] | undefined;
  roster: AdminAgentsView["roster"] | undefined;
}): React.ReactElement {
  const probe = connectivity?.contractProbe;

  return (
    <div className="space-y-4">
      <SectionHeader
        title="Connectivity & Boundary Probes"
        description="Live TCP reachability, endpoint pings, and boundary auth diagnostics."
      />

      {/* Roster & Reachability Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Roster */}
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
              {roster ? fmtInt(roster.totalAgents) : "—"}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {roster
                ? `${fmtInt(roster.activeAgents24h)} active in last 24h`
                : "Awaiting database read"}
            </p>
          </div>
          <div className="text-[11px] text-gray-400 mt-3 pt-2 border-t border-gray-100">
            Filtered on users table (is_agent = true)
          </div>
        </div>

        {/* External Services */}
        {connectivity?.services.map((svc) => (
          <div
            key={svc.key}
            className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex flex-col justify-between"
          >
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
                  <span className="text-xs font-normal text-gray-500">
                    HTTP {svc.statusCode}
                  </span>
                )}
              </div>
              <p
                className="text-xs text-gray-400 mt-1 font-mono truncate"
                title={svc.url}
              >
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
        ))}
      </div>

      {/* Contract Probe Card */}
      {probe && (
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
                {probe.checks.negativeControls.passed
                  ? "401 Negative Controls Confirmed"
                  : "401 Controls Incomplete"}
              </Pill>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 pt-2">
            <div className="p-3 bg-gray-50 rounded-lg border border-gray-100 text-xs">
              <div className="font-medium text-gray-700">Agent Roster Auth</div>
              <div className="mt-1 flex items-center gap-1.5">
                <span
                  className={`w-2 h-2 rounded-full ${probe.checks.agentRosterAuth.passed ? "bg-emerald-500" : "bg-rose-500"}`}
                />
                <span className="font-mono text-gray-600">
                  {probe.checks.agentRosterAuth.status}
                </span>
              </div>
            </div>

            <div className="p-3 bg-gray-50 rounded-lg border border-gray-100 text-xs">
              <div className="font-medium text-gray-700">Sync Status Auth</div>
              <div className="mt-1 flex items-center gap-1.5">
                <span
                  className={`w-2 h-2 rounded-full ${probe.checks.syncStatusAuth.passed ? "bg-emerald-500" : "bg-rose-500"}`}
                />
                <span className="font-mono text-gray-600">
                  {probe.checks.syncStatusAuth.status}
                </span>
              </div>
            </div>

            <div className="p-3 bg-gray-50 rounded-lg border border-gray-100 text-xs">
              <div className="font-medium text-gray-700">Vessel Auth</div>
              <div className="mt-1 flex items-center gap-1.5">
                <span
                  className={`w-2 h-2 rounded-full ${probe.checks.vesselAuth.passed ? "bg-emerald-500" : "bg-rose-500"}`}
                />
                <span className="font-mono text-gray-600">
                  {probe.checks.vesselAuth.status}
                </span>
              </div>
            </div>

            <div className="p-3 bg-gray-50 rounded-lg border border-gray-100 text-xs">
              <div className="font-medium text-gray-700">Check Shared Auth</div>
              <div className="mt-1 flex items-center gap-1.5">
                <span
                  className={`w-2 h-2 rounded-full ${probe.checks.checkSharedAuth.passed ? "bg-emerald-500" : "bg-rose-500"}`}
                />
                <span className="font-mono text-gray-600">
                  {probe.checks.checkSharedAuth.status}
                </span>
              </div>
            </div>

            <div className="p-3 bg-gray-50 rounded-lg border border-gray-100 text-xs">
              <div className="font-medium text-gray-700">Negative Controls</div>
              <div className="mt-1 flex items-center gap-1.5">
                <span
                  className={`w-2 h-2 rounded-full ${probe.checks.negativeControls.passed ? "bg-emerald-500" : "bg-rose-500"}`}
                />
                <span className="font-mono text-gray-600">
                  {probe.checks.negativeControls.allRejectedWith401
                    ? "401 On All"
                    : "Partial"}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ActionsSection({
  actions,
}: {
  actions: AdminAgentsView["actions"] | undefined;
}): React.ReactElement {
  if (!actions) return <></>;

  const creditTone =
    actions.creditPath.verdict === "OK"
      ? "ok"
      : actions.creditPath.verdict === "INCIDENT"
        ? "bad"
        : actions.creditPath.verdict === "STALLED"
          ? "warn"
          : "neutral";

  const debitTone =
    actions.debitPath.verdict === "OK"
      ? "ok"
      : actions.debitPath.verdict === "INCIDENT"
        ? "bad"
        : "neutral";

  return (
    <div className="space-y-4">
      <SectionHeader
        title="Agent Actions & Bridge Health"
        description="Sync bridge credit/debit liveness, cron job schedules, operational latency, and cosmic recipe telemetry."
      />

      {/* Path Health & Telemetry Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Credit Path */}
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Credit Bridge Liveness
              </span>
              <Pill tone={creditTone}>{actions.creditPath.verdict}</Pill>
            </div>
            <div className="text-2xl font-bold text-gray-900 mt-2">
              {fmtInt(actions.creditPath.credits24h)} credits
            </div>
            <p className="text-xs text-gray-600 mt-1">{actions.creditPath.summary}</p>
          </div>
          <div className="text-[11px] text-gray-400 mt-3 pt-2 border-t border-gray-100 flex items-center justify-between">
            <span>24h calls: {fmtInt(actions.creditPath.calls24h)}</span>
            <span>7d prior: {fmtInt(actions.creditPath.priorCredits7d)}</span>
          </div>
        </div>

        {/* Debit Path */}
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Debit Bridge Liveness
              </span>
              <Pill tone={debitTone}>{actions.debitPath.verdict}</Pill>
            </div>
            <div className="text-2xl font-bold text-gray-900 mt-2">
              {fmtInt(actions.debitPath.debits24h)} debits
            </div>
            <p className="text-xs text-gray-600 mt-1">{actions.debitPath.summary}</p>
          </div>
          <div className="text-[11px] text-gray-400 mt-3 pt-2 border-t border-gray-100 flex items-center justify-between">
            <span>24h traffic: {fmtInt(actions.debitPath.agentTraffic24h)}</span>
            <span>source: {actions.debitPath.trafficSource ?? "default"}</span>
          </div>
        </div>

        {/* Recipe Pipeline */}
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Cosmic Recipe Pipeline
              </span>
              <Pill tone={actions.recipePipeline.live ? "ok" : "neutral"}>
                {actions.recipePipeline.live ? "Live Pipeline" : "Idle"}
              </Pill>
            </div>
            <div className="text-2xl font-bold text-gray-900 mt-2 flex items-baseline gap-2">
              <span>{fmtInt(actions.recipePipeline.attempts)} attempts</span>
              <span className="text-xs text-gray-500">24h</span>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Repairs: {actions.recipePipeline.repairs} · Retries: {actions.recipePipeline.retries} · Refunds: {actions.recipePipeline.refunds}
            </p>
          </div>
          <div className="text-[11px] text-gray-400 mt-3 pt-2 border-t border-gray-100 flex items-center justify-between">
            <span>Failures (5xx): {actions.recipePipeline.finalFailures}</span>
            <span>Gated by PA & WTEN</span>
          </div>
        </div>
      </div>

      {/* Crons & Operational Actions Table */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Crons List */}
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm space-y-3">
          <h3 className="text-sm font-semibold text-gray-800">Scheduled Agent Crons</h3>
          <p className="text-xs text-gray-500">
            Evaluated via evaluateHeartbeat with standard latching thresholds.
          </p>

          <div className="space-y-3 pt-2">
            {actions.cronHeartbeats.map((cron) => {
              const cronTone =
                cron.state === "ok"
                  ? "ok"
                  : cron.state === "retrying"
                    ? "warn"
                    : cron.state === "never"
                      ? "neutral"
                      : "bad";

              return (
                <div
                  key={cron.name}
                  className="p-3 bg-gray-50 rounded-lg border border-gray-100 flex items-center justify-between"
                >
                  <div>
                    <div className="font-mono text-xs font-semibold text-gray-900">
                      {cron.name}
                    </div>
                    <div className="text-[11px] text-gray-500 mt-0.5">
                      Schedule: <code className="text-gray-700">{cron.schedule}</code> ({cron.expectedIntervalMinutes}m interval)
                    </div>
                    <div className="text-[11px] text-gray-400 mt-0.5">
                      Last run: {cron.lastRun ? fmtAgo(cron.lastRun) : "Never"}
                      {cron.lastStatus && ` · Status: ${cron.lastStatus}`}
                    </div>
                  </div>
                  <Pill tone={cronTone}>{cron.state.toUpperCase()}</Pill>
                </div>
              );
            })}
          </div>
        </div>

        {/* Operational Actions Breakdown */}
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm lg:col-span-2 overflow-x-auto">
          <h3 className="text-sm font-semibold text-gray-800 mb-1">
            24h Agent Actions Breakdown
          </h3>
          <p className="text-xs text-gray-500 mb-3">
            Traffic volume, success rates, and p50/p95 response latencies from request logs.
          </p>

          <table className="min-w-full text-left text-xs divide-y divide-gray-100">
            <thead>
              <tr className="text-gray-400 font-medium">
                <th className="py-2">Action</th>
                <th className="py-2">Path</th>
                <th className="py-2 text-right">24h Calls</th>
                <th className="py-2 text-right">Success</th>
                <th className="py-2 text-right">Fail (4xx)</th>
                <th className="py-2 text-right">Fail (5xx)</th>
                <th className="py-2 text-right">p50 / p95</th>
                <th className="py-2 text-right">Last Seen</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {actions.actionMetrics.map((m) => (
                <tr key={m.path} className="hover:bg-gray-50">
                  <td className="py-2.5 font-medium text-gray-800">{m.label}</td>
                  <td className="py-2.5 font-mono text-[11px] text-gray-500 truncate max-w-[140px]" title={m.path}>
                    {m.path}
                  </td>
                  <td className="py-2.5 text-right font-mono text-gray-900">{fmtInt(m.calls24h)}</td>
                  <td className="py-2.5 text-right font-mono text-emerald-600">{fmtInt(m.successes24h)}</td>
                  <td className="py-2.5 text-right font-mono text-amber-600">{fmtInt(m.failures24h)}</td>
                  <td className="py-2.5 text-right font-mono text-rose-600">{fmtInt(m.serverFailures24h)}</td>
                  <td className="py-2.5 text-right font-mono text-gray-600">
                    {m.p50Ms !== null ? `${m.p50Ms}ms` : "—"} / {m.p95Ms !== null ? `${m.p95Ms}ms` : "—"}
                  </td>
                  <td className="py-2.5 text-right text-[11px] text-gray-400">
                    {m.lastSeenAt ? fmtAgo(m.lastSeenAt) : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default function AdminAgentsPage(): React.ReactElement {
  const { data, error, updatedAt, refresh } = useAdminResource(
    "/api/admin/agents",
    AdminAgentsSchema,
    15_000,
  );
  const [statusFilter, setStatusFilter] = useState<"all" | "failed">("all");

  const inboundData = data?.connectivity.inboundDelivery ?? null;

  return (
    <div className="space-y-8 p-4 md:p-8 max-w-7xl mx-auto">
      <PageHeader
        title="Planetary Agents"
        description="Planetary Agents (ASOL) connectivity, contract probes, delivery telemetry, and agent action health."
        updatedAt={updatedAt}
        error={error}
        onRefresh={refresh}
      />

      {error && !data && (
        <div className="rounded-md bg-rose-50 border border-rose-200 p-4 text-sm text-rose-800">
          <p className="font-semibold">Unable to load Agents telemetry</p>
          <p className="text-xs mt-1 text-rose-600">{error}</p>
        </div>
      )}

      {/* 1. Connectivity & Diagnostic Probes */}
      <ConnectivitySection
        connectivity={data?.connectivity}
        roster={data?.roster}
      />

      {/* 2. Agent Actions & Bridge Health */}
      <ActionsSection actions={data?.actions} />

      {/* 3. Inbound Delivery Telemetry (ASOL) */}
      <div className="space-y-4 pt-4 border-t border-gray-200">
        <SectionHeader
          title="Inbound Webhook Delivery Telemetry"
          description="Real-time delivery telemetry, deduplication shields, and webhook signature verification from ASOL."
        />

        <AsolAlertBanner
          data={inboundData}
          onFilterFailed={() => setStatusFilter("failed")}
        />

        <AsolKpiGrid
          data={inboundData}
          onFilterFailed={() => setStatusFilter("failed")}
        />

        <AsolStatusPanels data={inboundData} />

        <AsolRouteBreakdown data={inboundData} />

        <AsolDeliveryActivity
          events={inboundData?.recentEvents ?? []}
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
        />
      </div>
    </div>
  );
}
