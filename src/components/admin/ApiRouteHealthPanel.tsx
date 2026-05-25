"use client";

/**
 * API Route Health Panel
 *
 * Reads the in-memory request log via the existing /api/admin/observability
 * endpoint and groups requests by path. Surfaces the top N endpoints by
 * traffic with per-route error-rate + p95 latency badges — so operators
 * can spot a single route degrading without having to dig through logs.
 *
 * No new API needed — the observability endpoint already returns
 * `summary.topPaths` and `recent` (used to compute per-path stats here).
 */

import React from "react";
import { useHardenedPolling } from "@/hooks/useHardenedPolling";

interface RequestEntry {
  id: number;
  at: string;
  method: string;
  path: string;
  status: number;
  latencyMs: number;
}

interface ObservabilitySummary {
  count: number;
  p50LatencyMs: number;
  p95LatencyMs: number;
  p99LatencyMs: number;
  errorRate: number;
  topPaths: Array<{ path: string; count: number }>;
}

interface ObservabilityResponse {
  success: boolean;
  requests: {
    summary: ObservabilitySummary;
    recent: RequestEntry[];
    recentFailures: RequestEntry[];
  };
  slowQueries: {
    summary: unknown;
    recent: Array<{ ms: number; preview: string }>;
  };
}

interface PerPathRow {
  path: string;
  count: number;
  errors4xx: number;
  errors5xx: number;
  successRate: number;
  p95LatencyMs: number;
}

function quantile(values: number[], q: number): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  return sorted[Math.min(sorted.length - 1, Math.floor(sorted.length * q))];
}

function rowsFromObservability(payload: ObservabilityResponse): PerPathRow[] {
  // The /admin/observability endpoint returns `requests.recent` (up to 100
  // requests). Group locally for per-route stats — cheap, no extra fetch.
  const byPath = new Map<string, RequestEntry[]>();
  for (const r of payload.requests.recent) {
    const list = byPath.get(r.path);
    if (list) list.push(r);
    else byPath.set(r.path, [r]);
  }
  const rows: PerPathRow[] = [];
  for (const [path, entries] of byPath.entries()) {
    const errors4xx = entries.filter((r) => r.status >= 400 && r.status < 500).length;
    const errors5xx = entries.filter((r) => r.status >= 500).length;
    const latencies = entries.map((r) => r.latencyMs);
    rows.push({
      path,
      count: entries.length,
      errors4xx,
      errors5xx,
      successRate: 1 - (errors4xx + errors5xx) / entries.length,
      p95LatencyMs: quantile(latencies, 0.95),
    });
  }
  return rows.sort((a, b) => b.count - a.count);
}

function rowStyle(row: PerPathRow) {
  if (row.errors5xx > 0) {
    return { dot: "bg-rose-500", row: "bg-rose-50" };
  }
  if (row.errors4xx > row.count * 0.3) {
    return { dot: "bg-amber-500", row: "bg-amber-50" };
  }
  if (row.p95LatencyMs > 2000) {
    return { dot: "bg-amber-500", row: "" };
  }
  return { dot: "bg-emerald-500", row: "" };
}

export default function ApiRouteHealthPanel() {
  const [rows, setRows] = React.useState<PerPathRow[]>([]);
  const [summary, setSummary] = React.useState<ObservabilitySummary | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  const poll = React.useCallback(async (): Promise<{ ok: boolean }> => {
    try {
      const res = await fetch("/api/admin/observability", { cache: "no-store" });
      if (!res.ok) {
        setError(`HTTP ${res.status}`);
        return { ok: false };
      }
      const json = (await res.json()) as ObservabilityResponse;
      if (!json.success || !json.requests) {
        setError("Observability payload malformed");
        return { ok: false };
      }
      setRows(rowsFromObservability(json));
      setSummary(json.requests.summary);
      setError(null);
      return { ok: true };
    } catch (_err) {
      setError("Failed to reach admin API");
      return { ok: false };
    }
  }, []);

  useHardenedPolling(poll, { baseIntervalMs: 30_000 });

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
      <div className="px-4 sm:px-6 py-4 border-b border-gray-100 bg-gray-50 flex flex-wrap justify-between items-center gap-3">
        <div>
          <h2 className="text-lg font-bold text-gray-800">API Route Health</h2>
          <p className="text-xs text-gray-500">
            Per-endpoint metrics from in-memory request log · 5 min window
          </p>
        </div>
        {summary && (
          <div className="flex gap-4 text-xs">
            <Stat label="Reqs" value={`${summary.count}`} />
            <Stat label="p50" value={`${summary.p50LatencyMs}ms`} />
            <Stat label="p95" value={`${summary.p95LatencyMs}ms`} />
            <Stat
              label="Err%"
              value={`${(summary.errorRate * 100).toFixed(1)}%`}
              status={summary.errorRate > 0.05 ? "error" : "ok"}
            />
          </div>
        )}
      </div>
      {error ? (
        <div className="p-6">
          <p className="text-rose-700 text-sm">{error}</p>
          <button
            type="button"
            onClick={() => {
              void poll();
            }}
            className="mt-2 px-3 py-1 text-xs bg-rose-600 text-white rounded hover:bg-rose-700"
          >
            Retry
          </button>
        </div>
      ) : rows.length === 0 ? (
        <p className="p-6 text-sm text-gray-500 italic">
          No requests observed in the last 5 minutes.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr className="text-[10px] uppercase tracking-wider text-gray-500">
                <th className="text-left px-6 py-2">Endpoint</th>
                <th className="text-right px-3 py-2">Reqs</th>
                <th className="text-right px-3 py-2">Success</th>
                <th className="text-right px-3 py-2">4xx</th>
                <th className="text-right px-3 py-2">5xx</th>
                <th className="text-right px-6 py-2">p95</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {rows.slice(0, 12).map((row) => {
                const style = rowStyle(row);
                return (
                  <tr key={row.path} className={`hover:bg-gray-50 ${style.row}`}>
                    <td className="px-6 py-2 font-mono text-xs text-gray-700 flex items-center gap-2">
                      <span className={`h-1.5 w-1.5 rounded-full ${style.dot}`} />
                      <span className="truncate max-w-md">{row.path}</span>
                    </td>
                    <td className="px-3 py-2 text-right font-mono text-xs">
                      {row.count}
                    </td>
                    <td
                      className={`px-3 py-2 text-right font-mono text-xs ${
                        row.successRate >= 0.95
                          ? "text-emerald-700"
                          : row.successRate >= 0.8
                            ? "text-amber-700"
                            : "text-rose-700"
                      }`}
                    >
                      {(row.successRate * 100).toFixed(0)}%
                    </td>
                    <td
                      className={`px-3 py-2 text-right font-mono text-xs ${
                        row.errors4xx > 0 ? "text-amber-700" : "text-gray-400"
                      }`}
                    >
                      {row.errors4xx}
                    </td>
                    <td
                      className={`px-3 py-2 text-right font-mono text-xs ${
                        row.errors5xx > 0 ? "text-rose-700 font-bold" : "text-gray-400"
                      }`}
                    >
                      {row.errors5xx}
                    </td>
                    <td
                      className={`px-6 py-2 text-right font-mono text-xs ${
                        row.p95LatencyMs > 2000
                          ? "text-amber-700"
                          : row.p95LatencyMs > 500
                            ? "text-gray-700"
                            : "text-emerald-700"
                      }`}
                    >
                      {row.p95LatencyMs}ms
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function Stat({
  label,
  value,
  status = "ok",
}: {
  label: string;
  value: string;
  status?: "ok" | "error";
}) {
  return (
    <div className="text-center">
      <div className="text-[9px] uppercase tracking-wider text-gray-500 font-semibold">
        {label}
      </div>
      <div
        className={`font-mono font-bold ${
          status === "error" ? "text-rose-700" : "text-gray-900"
        }`}
      >
        {value}
      </div>
    </div>
  );
}
