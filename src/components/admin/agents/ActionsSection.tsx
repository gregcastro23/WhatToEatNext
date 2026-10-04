"use client";

/**
 * Agent Actions & Bridge Telemetry Section for Admin Agents
 *
 * @file src/components/admin/agents/ActionsSection.tsx
 */

import React from "react";
import { fmtAgo, fmtInt } from "@/components/admin/live/format";
import { Pill } from "@/components/admin/live/primitives";
import type { AdminAgentsView } from "@/lib/admin/schemas/agents";

function CreditPathCard({
  creditPath,
}: {
  creditPath: AdminAgentsView["actions"]["creditPath"];
}): React.ReactElement {
  const tone =
    creditPath.verdict === "OK"
      ? "ok"
      : creditPath.verdict === "INCIDENT"
        ? "bad"
        : creditPath.verdict === "STALLED"
          ? "warn"
          : "neutral";

  return (
    <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
            Credit Bridge Liveness
          </span>
          <Pill tone={tone}>{creditPath.verdict}</Pill>
        </div>
        <div className="text-2xl font-bold text-gray-900 mt-2">
          {fmtInt(creditPath.credits24h)} credits
        </div>
        <p className="text-xs text-gray-600 mt-1">{creditPath.summary}</p>
      </div>
      <div className="text-[11px] text-gray-400 mt-3 pt-2 border-t border-gray-100 flex items-center justify-between">
        <span>24h calls: {fmtInt(creditPath.calls24h)}</span>
        <span>7d prior: {fmtInt(creditPath.priorCredits7d)}</span>
      </div>
    </div>
  );
}

function DebitPathCard({
  debitPath,
}: {
  debitPath: AdminAgentsView["actions"]["debitPath"];
}): React.ReactElement {
  const tone =
    debitPath.verdict === "OK"
      ? "ok"
      : debitPath.verdict === "INCIDENT"
        ? "bad"
        : "neutral";

  return (
    <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
            Debit Bridge Liveness
          </span>
          <Pill tone={tone}>{debitPath.verdict}</Pill>
        </div>
        <div className="text-2xl font-bold text-gray-900 mt-2">
          {fmtInt(debitPath.debits24h)} debits
        </div>
        <p className="text-xs text-gray-600 mt-1">{debitPath.summary}</p>
      </div>
      <div className="text-[11px] text-gray-400 mt-3 pt-2 border-t border-gray-100 flex items-center justify-between">
        <span>24h traffic: {fmtInt(debitPath.agentTraffic24h)}</span>
        <span>source: {debitPath.trafficSource ?? "default"}</span>
      </div>
    </div>
  );
}

function RecipePipelineCard({
  pipeline,
}: {
  pipeline: AdminAgentsView["actions"]["recipePipeline"];
}): React.ReactElement {
  return (
    <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
            Cosmic Recipe Pipeline
          </span>
          <Pill tone={pipeline.live ? "ok" : "neutral"}>
            {pipeline.live ? "Live Pipeline" : "Idle"}
          </Pill>
        </div>
        <div className="text-2xl font-bold text-gray-900 mt-2 flex items-baseline gap-2">
          <span>{fmtInt(pipeline.attempts)} attempts</span>
          <span className="text-xs text-gray-500">24h</span>
        </div>
        <p className="text-xs text-gray-500 mt-1">
          Repairs: {pipeline.repairs} · Retries: {pipeline.retries} · Refunds: {pipeline.refunds}
        </p>
      </div>
      <div className="text-[11px] text-gray-400 mt-3 pt-2 border-t border-gray-100 flex items-center justify-between">
        <span>Failures (5xx): {pipeline.finalFailures}</span>
        <span>Gated by ASOL & WTEN</span>
      </div>
    </div>
  );
}

function CronList({
  cronHeartbeats,
}: {
  cronHeartbeats: AdminAgentsView["actions"]["cronHeartbeats"];
}): React.ReactElement {
  return (
    <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm space-y-3">
      <h3 className="text-sm font-semibold text-gray-800">Scheduled Agent Crons</h3>
      <p className="text-xs text-gray-500">
        Evaluated via evaluateHeartbeat with standard latching thresholds.
      </p>

      <div className="space-y-3 pt-2">
        {cronHeartbeats.map((cron) => {
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
  );
}

function ActionRow({ m }: { m: AdminAgentsView["actions"]["actionMetrics"][number] }): React.ReactElement {
  return (
    <tr className="hover:bg-gray-50">
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
  );
}

function ActionMetricsTable({
  actionMetrics,
}: {
  actionMetrics: AdminAgentsView["actions"]["actionMetrics"];
}): React.ReactElement {
  return (
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
          {actionMetrics.map((m) => (
            <ActionRow key={m.path} m={m} />
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function ActionsSection({
  actions,
}: {
  actions: AdminAgentsView["actions"] | undefined;
}): React.ReactElement {
  if (!actions) return <></>;

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-base font-bold text-gray-900">Agent Actions & Bridge Health</h2>
        <p className="text-xs text-gray-500 mt-0.5">
          Sync bridge credit/debit liveness, cron job schedules, operational latency, and cosmic recipe telemetry.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <CreditPathCard creditPath={actions.creditPath} />
        <DebitPathCard debitPath={actions.debitPath} />
        <RecipePipelineCard pipeline={actions.recipePipeline} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <CronList cronHeartbeats={actions.cronHeartbeats} />
        <ActionMetricsTable actionMetrics={actions.actionMetrics} />
      </div>
    </div>
  );
}
