"use client";

import React, { useState } from "react";
import { z } from "zod";
import { Metric } from "@/components/admin/kit/Metric";
import { fromLiveFlag } from "@/components/admin/kit/provenance";
import { ProvenanceBadge } from "@/components/admin/kit/ProvenanceBadge";
import { readJson } from "@/lib/api/json";

export const SpacetimeDiagnosticsSchema = z
  .object({
    NEXT_PUBLIC_SPACETIME_URI: z.string().nullable(),
    NEXT_PUBLIC_SPACETIME_MODULE: z.string().nullable(),
    flags: z.object({
      NEXT_PUBLIC_SPACETIME_LIVE_CULINARY: z.string().nullable(),
      NEXT_PUBLIC_SPACETIME_LIVE_PLANNER: z.string().nullable(),
      NEXT_PUBLIC_SPACETIME_LIVE_COMMENSAL: z.string().nullable(),
      NEXT_PUBLIC_SPACETIME_LIVE_CART: z.string().nullable(),
      NEXT_PUBLIC_SPACETIME_LIVE_FEED: z.string().nullable(),
    }),
    timestamp: z.string(),
    nodeEnv: z.string().nullable(),
  })
  .passthrough();

export type SpacetimeDiagnostics = z.infer<typeof SpacetimeDiagnosticsSchema>;

export interface SlowQueryThresholdInfo {
  thresholdMs: number;
  bounds: { minMs: number; maxMs: number };
}

export const SlowQueryThresholdResponseSchema = z
  .object({
    success: z.boolean().optional(),
    thresholdMs: z.number().optional(),
    previousMs: z.number().optional(),
    bounds: z.object({ minMs: z.number(), maxMs: z.number() }).optional(),
    message: z.string().optional(),
  })
  .passthrough();

function SpacetimeMetricsGrid({
  spacetime,
  spacetimeLive,
  thresholdInfo,
}: {
  spacetime: SpacetimeDiagnostics | null;
  spacetimeLive: boolean;
  thresholdInfo: SlowQueryThresholdInfo | null;
}): React.JSX.Element {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <div className="p-4 rounded-lg bg-gray-50 border border-gray-100">
        <Metric label="Node Environment" value={spacetime?.nodeEnv ?? null} provenance={fromLiveFlag(spacetimeLive)} size="sm" />
      </div>
      <div className="p-4 rounded-lg bg-gray-50 border border-gray-100">
        <Metric label="SpacetimeDB URI" value={spacetime ? (spacetime.NEXT_PUBLIC_SPACETIME_URI ?? "Not set") : null} provenance={fromLiveFlag(spacetimeLive)} size="sm" />
      </div>
      <div className="p-4 rounded-lg bg-gray-50 border border-gray-100">
        <Metric label="SpacetimeDB Module" value={spacetime ? (spacetime.NEXT_PUBLIC_SPACETIME_MODULE ?? "Not set") : null} provenance={fromLiveFlag(spacetimeLive)} size="sm" />
      </div>
      <div className="p-4 rounded-lg bg-gray-50 border border-gray-100">
        <Metric
          label="Slow-Query Ring Threshold"
          value={thresholdInfo ? `${thresholdInfo.thresholdMs} ms` : null}
          provenance={fromLiveFlag(thresholdInfo !== null)}
          caption={thresholdInfo ? `Bounds: ${thresholdInfo.bounds.minMs}–${thresholdInfo.bounds.maxMs} ms` : undefined}
          size="sm"
        />
      </div>
    </div>
  );
}

function SpacetimeFlagsGrid({ flags }: { flags: SpacetimeDiagnostics["flags"] }): React.JSX.Element {
  return (
    <div>
      <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2.5">
        SpacetimeDB Live Sync Feature Flags
      </h3>
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
        {Object.entries(flags).map(([flag, val]) => (
          <div key={flag} className="p-2.5 rounded-lg border border-gray-200 bg-white flex flex-col justify-between gap-1">
            <span className="font-mono text-[11px] text-gray-600 break-all">{flag.replace("NEXT_PUBLIC_SPACETIME_LIVE_", "")}</span>
            <span className={`inline-flex self-start px-2 py-0.5 rounded text-xs font-semibold ${val === "true" || val === "1" ? "bg-emerald-100 text-emerald-800" : "bg-gray-100 text-gray-600"}`}>
              {val ?? "unset"}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

async function submitThresholdUpdate(
  ms: number,
  thresholdInfo: SlowQueryThresholdInfo | null,
  onThresholdUpdated: (info: SlowQueryThresholdInfo) => void,
): Promise<{ ok: boolean; message: string }> {
  try {
    const res = await fetch("/api/admin/observability/slow-query-threshold", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ms }),
    });
    const payload = await readJson(res, { parse: (raw) => SlowQueryThresholdResponseSchema.parse(raw) });
    if (res.ok && payload.success && typeof payload.thresholdMs === "number") {
      const newMs = payload.thresholdMs;
      onThresholdUpdated(thresholdInfo ? { ...thresholdInfo, thresholdMs: newMs } : { thresholdMs: newMs, bounds: { minMs: 5, maxMs: 60_000 } });
      return { ok: true, message: `Updated threshold to ${payload.thresholdMs}ms.` };
    }
    return { ok: false, message: payload.message ?? "Failed to update slow-query threshold." };
  } catch {
    return { ok: false, message: "Network error updating threshold." };
  }
}

function ThresholdTuningForm({
  thresholdInfo,
  onThresholdUpdated,
}: {
  thresholdInfo: SlowQueryThresholdInfo | null;
  onThresholdUpdated: (info: SlowQueryThresholdInfo) => void;
}): React.JSX.Element {
  const [thresholdInput, setThresholdInput] = useState(thresholdInfo ? String(thresholdInfo.thresholdMs) : "");
  const [thresholdStatus, setThresholdStatus] = useState<string | null>(null);
  const [thresholdBusy, setThresholdBusy] = useState(false);

  const handleUpdate = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    const ms = Number(thresholdInput);
    if (!Number.isFinite(ms) || ms < 5 || ms > 60_000) {
      setThresholdStatus("Enter a threshold between 5 and 60000 ms.");
      return;
    }
    setThresholdBusy(true);
    const res = await submitThresholdUpdate(Math.round(ms), thresholdInfo, onThresholdUpdated);
    setThresholdStatus(res.message);
    setThresholdBusy(false);
  };

  return (
    <form onSubmit={(e) => { handleUpdate(e).catch(() => {}); }} className="pt-4 border-t border-gray-100 flex items-center justify-between flex-wrap gap-3">
      <div>
        <h3 className="text-sm font-semibold text-gray-800">Tune In-Process Slow-Query Ring Threshold</h3>
        <p className="text-xs text-gray-500">Adjusts capture sensitivity immediately without redeploying.</p>
      </div>
      <div className="flex items-center gap-2 flex-wrap">
        <input
          type="number"
          min={thresholdInfo?.bounds.minMs ?? 5}
          max={thresholdInfo?.bounds.maxMs ?? 60000}
          value={thresholdInput}
          onChange={(e) => setThresholdInput(e.target.value)}
          placeholder="200"
          className="w-28 px-3 py-1.5 border border-gray-300 rounded-lg font-mono text-sm text-gray-800"
        />
        <button type="submit" disabled={thresholdBusy} className="px-4 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium disabled:opacity-50">
          {thresholdBusy ? "Applying…" : "Update Threshold"}
        </button>
        {thresholdStatus && <span className="text-xs text-gray-700 font-medium">{thresholdStatus}</span>}
      </div>
    </form>
  );
}

export function SpacetimeDiagnosticsPanel({
  spacetime,
  spacetimeLive,
  thresholdInfo,
  onThresholdUpdated,
}: {
  spacetime: SpacetimeDiagnostics | null;
  spacetimeLive: boolean;
  thresholdInfo: SlowQueryThresholdInfo | null;
  onThresholdUpdated: (info: SlowQueryThresholdInfo) => void;
}): React.JSX.Element {
  return (
    <div className="bg-white rounded-xl shadow border border-gray-100 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between flex-wrap gap-2">
        <div>
          <h2 className="text-lg font-semibold text-gray-800">SpacetimeDB &amp; Runtime Diagnostics</h2>
          <p className="text-xs text-gray-500 mt-0.5">Live process inspection via /api/admin/diagnostics/spacetime</p>
        </div>
        <ProvenanceBadge provenance={fromLiveFlag(spacetimeLive)} compact />
      </div>
      <div className="p-6 space-y-6">
        <SpacetimeMetricsGrid spacetime={spacetime} spacetimeLive={spacetimeLive} thresholdInfo={thresholdInfo} />
        {spacetime && <SpacetimeFlagsGrid flags={spacetime.flags} />}
        <ThresholdTuningForm thresholdInfo={thresholdInfo} onThresholdUpdated={onThresholdUpdated} />
      </div>
    </div>
  );
}
