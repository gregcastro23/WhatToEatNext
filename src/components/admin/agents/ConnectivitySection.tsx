"use client";

/**
 * Connectivity & Boundary Diagnostics Section for Admin Agents
 *
 * @file src/components/admin/agents/ConnectivitySection.tsx
 */

import React, { useState } from "react";
import { z } from "zod";
import { fmtAgo, fmtInt } from "@/components/admin/live/format";
import { Pill } from "@/components/admin/live/primitives";
import type { AdminAgentsView } from "@/lib/admin/schemas/agents";
import { readJson } from "@/lib/api/json";

const PlanetarySyncResponseSchema = z
  .object({
    success: z.boolean().optional(),
    affectedCount: z.number().optional(),
    failures: z.array(z.string()).optional(),
    message: z.string().optional(),
  })
  .passthrough();

function formatLatency(ms: number | null): string {
  if (ms === null) return "—";
  return `${Math.round(ms)} ms`;
}

function RosterCard({ roster }: { roster: AdminAgentsView["roster"] | undefined }): React.ReactElement {
  const [syncing, setSyncing] = useState(false);
  const [targetId, setTargetId] = useState("");
  const [syncResult, setSyncResult] = useState<{
    ok: boolean;
    summary: string;
    failures: string[];
  } | null>(null);

  const runSync = async (action: "sync-all" | "sync-one"): Promise<void> => {
    setSyncing(true);
    setSyncResult(null);
    try {
      const body =
        action === "sync-one"
          ? { action: "sync-one" as const, agentEmail: targetId.trim() }
          : { action: "sync-all" as const };
      const res = await fetch("/api/admin/planetary-sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const payload = await readJson(res, {
        parse: (raw) => PlanetarySyncResponseSchema.parse(raw),
      });
      const affected = payload.affectedCount ?? 0;
      const failures = payload.failures ?? [];
      setSyncResult({
        ok: Boolean(payload.success),
        summary:
          payload.message ??
          `Synced ${affected} agent(s)${failures.length > 0 ? ` · ${failures.length} failure(s)` : ""}`,
        failures,
      });
    } catch {
      setSyncResult({
        ok: false,
        summary: "Network error calling /api/admin/planetary-sync",
        failures: [],
      });
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex flex-col justify-between gap-3">
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

      <div className="pt-2 border-t border-gray-100 space-y-2">
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => {
              runSync("sync-all").catch(() => {});
            }}
            disabled={syncing}
            className="px-2.5 py-1 rounded bg-purple-600 hover:bg-purple-700 text-white text-xs font-medium disabled:opacity-50"
          >
            {syncing ? "Syncing…" : "Sync All to PA"}
          </button>
          <input
            type="text"
            value={targetId}
            onChange={(e) => setTargetId(e.target.value)}
            placeholder="agent email or id"
            className="flex-1 min-w-0 px-2 py-1 border border-gray-200 rounded text-xs font-mono"
          />
          {targetId.trim() && (
            <button
              type="button"
              onClick={() => {
                runSync("sync-one").catch(() => {});
              }}
              disabled={syncing}
              className="px-2 py-1 rounded border border-purple-200 bg-purple-50 hover:bg-purple-100 text-purple-800 text-xs font-medium disabled:opacity-50"
            >
              Sync One
            </button>
          )}
        </div>
        {syncResult && (
          <div className="text-[11px] space-y-0.5">
            <p className={syncResult.ok ? "text-emerald-700 font-medium" : "text-amber-700 font-medium"}>
              {syncResult.summary}
            </p>
            {syncResult.failures.slice(0, 2).map((f, i) => (
              <p key={i} className="text-rose-600 font-mono truncate" title={f}>
                {f}
              </p>
            ))}
          </div>
        )}
        <div className="text-[11px] text-gray-400">
          Filtered on users table (is_agent = true)
        </div>
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

type Probe = NonNullable<AdminAgentsView["connectivity"]["contractProbe"]>;

function ProbeHeader({ probe }: { probe: Probe }): React.ReactElement {
  const label = probe.verdict === "healthy" ? "Receiver Healthy" : probe.verdict === "degraded" ? "Receiver Degraded" : "Receiver Unreachable";
  const tone = probe.verdict === "healthy" ? "ok" : probe.verdict === "degraded" ? "warn" : "bad";
  return (
    <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
      <div>
        <h3 className="text-sm font-semibold text-gray-800">WTEN Receiver Diagnostics</h3>
        <p className="text-xs text-gray-500">Checks WTEN receiver responses and unauthenticated rejection. ASOL delivery, signing, queues, and retries are untested.</p>
      </div>
      <div className="flex items-center gap-2">
        <Pill tone={tone}>{label}</Pill>
        <Pill tone={probe.checks.negativeControls.passed ? "ok" : "warn"}>
          {probe.checks.negativeControls.passed ? "401 Negative Controls Confirmed" : "401 Controls Incomplete"}
        </Pill>
      </div>
    </div>
  );
}

function ProbeEvidence({ probe }: { probe: Probe }): React.ReactElement {
  return (<>
    <p className="text-xs text-gray-500 mb-3 break-all">
      Vantage: {probe.vantage} · Destination: {probe.destination} · Timeout: {probe.timeoutMs} ms
    </p>
    {Object.entries(probe.checks).map(([key, check]) =>
      "message" in check && check.message ? <p key={key} className="text-xs text-amber-800 mb-1">{check.message}</p> : null,
    )}
  </>);
}

function ProbeChecks({ probe }: { probe: Probe }): React.ReactElement {
  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-3 pt-2">
      <ProbeCheckItem label="Agent Roster Auth" {...probe.checks.agentRosterAuth} />
      <ProbeCheckItem label="Sync Status Auth" {...probe.checks.syncStatusAuth} />
      <ProbeCheckItem label="Vessel Auth" {...probe.checks.vesselAuth} />
      <ProbeCheckItem label="Check Shared Auth" {...probe.checks.checkSharedAuth} />
      <ProbeCheckItem label="Negative Controls" passed={probe.checks.negativeControls.passed}
        status={probe.checks.negativeControls.allRejectedWith401 ? "401 On All" : "Partial"} />
    </div>
  );
}

export function ContractProbeCard({ probe }: { probe: Probe }): React.ReactElement {
  return (
    <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
      <ProbeHeader probe={probe} />
      <ProbeEvidence probe={probe} />
      <ProbeChecks probe={probe} />
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
