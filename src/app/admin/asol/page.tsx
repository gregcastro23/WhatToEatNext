"use client";

import React, { useCallback, useEffect, useState } from "react";
import type { AsolHealthOverview } from "@/services/admin/asolHealthService";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isAsolHealthOverview(value: unknown): value is AsolHealthOverview {
  if (!isRecord(value)) return false;
  return (
    typeof value.generatedAt === "string" &&
    typeof value.totalReceived === "number" &&
    typeof value.totalProcessed === "number" &&
    typeof value.totalInFlight === "number" &&
    typeof value.totalFailed === "number" &&
    typeof value.totalDuplicates === "number" &&
    Array.isArray(value.sources) &&
    Array.isArray(value.recentEvents) &&
    isRecord(value.feedStatus)
  );
}

function formatRelative(iso: string | null): string {
  if (!iso) return "never";
  const ageMs = Date.now() - new Date(iso).getTime();
  if (ageMs < 0) return "just now";
  if (ageMs < 60_000) return `${Math.round(ageMs / 1000)}s ago`;
  if (ageMs < 3_600_000) return `${Math.round(ageMs / 60_000)}m ago`;
  if (ageMs < 86_400_000) return `${Math.round(ageMs / 3_600_000)}h ago`;
  return `${Math.round(ageMs / 86_400_000)}d ago`;
}

function formatLatency(ms: number | null): string {
  if (ms === null || ms <= 0) return "—";
  if (ms < 1000) return `${Math.round(ms)}ms`;
  return `${(ms / 1000).toFixed(2)}s`;
}

function getStatusBadge(status: string) {
  switch (status.toLowerCase()) {
    case "processed":
      return "bg-emerald-100 text-emerald-800 border-emerald-300";
    case "processing":
      return "bg-amber-100 text-amber-800 border-amber-300 animate-pulse";
    case "failed":
      return "bg-rose-100 text-rose-800 border-rose-300";
    case "duplicate":
      return "bg-blue-100 text-blue-800 border-blue-300";
    default:
      return "bg-gray-100 text-gray-800 border-gray-300";
  }
}

export default function AsolHealthPage() {
  const [data, setData] = useState<AsolHealthOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [sourceFilter, setSourceFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/asol");
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }
      const json = await res.json();
      if (isAsolHealthOverview(json)) {
        setData(json);
        setError(null);
      } else {
        throw new Error("Invalid response format");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load ASOL telemetry");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchData();
    if (!autoRefresh) return;
    const interval = setInterval(() => {
      void fetchData();
    }, 15_000);
    return () => clearInterval(interval);
  }, [fetchData, autoRefresh]);

  const filteredEvents = (data?.recentEvents ?? []).filter((e) => {
    if (sourceFilter !== "all" && e.source !== sourceFilter) return false;
    if (statusFilter !== "all" && e.status.toLowerCase() !== statusFilter) return false;
    return true;
  });

  const successRate =
    data && data.totalReceived > 0
      ? Math.round((data.totalProcessed / data.totalReceived) * 100)
      : null;

  return (
    <div className="space-y-6 p-4 md:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-200 pb-5">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
              Planetary Agents (ASOL) Delivery Health
            </h1>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 border border-purple-200">
              Contract v1
            </span>
          </div>
          <p className="text-sm text-gray-500 mt-1">
            Real-time delivery telemetry, idempotency deduplication shields, and cross-app integration health.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 text-xs text-gray-600 cursor-pointer">
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
              className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
            />
            Auto-refresh (15s)
          </label>
          <button
            onClick={() => void fetchData()}
            disabled={loading}
            className="px-3 py-1.5 text-xs font-medium bg-white text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 transition shadow-sm"
          >
            {loading ? "Refreshing..." : "Refresh"}
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-md bg-rose-50 border border-rose-200 p-4 text-sm text-rose-800">
          <p className="font-semibold">Unable to load ASOL telemetry</p>
          <p className="text-xs mt-1 text-rose-600">{error}</p>
        </div>
      )}

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
            Total Inbound
          </p>
          <p className="text-2xl font-bold text-gray-900 mt-1">
            {data ? data.totalReceived.toLocaleString() : "—"}
          </p>
          <p className="text-xs text-gray-400 mt-1">
            {data ? `${data.totalProcessed} completed` : "—"}
          </p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
            Success Rate
          </p>
          <p className="text-2xl font-bold text-emerald-600 mt-1">
            {successRate !== null ? `${successRate}%` : "—"}
          </p>
          <p className="text-xs text-gray-400 mt-1">Processed deliveries</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
            Duplicates Blocked
          </p>
          <p className="text-2xl font-bold text-blue-600 mt-1">
            {data ? data.totalDuplicates.toLocaleString() : "—"}
          </p>
          <p className="text-xs text-gray-400 mt-1">Idempotency shields</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
            In-Flight
          </p>
          <p className="text-2xl font-bold text-amber-600 mt-1">
            {data ? data.totalInFlight.toLocaleString() : "—"}
          </p>
          <p className="text-xs text-gray-400 mt-1">Active processing locks</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
            Failed
          </p>
          <p className="text-2xl font-bold text-rose-600 mt-1">
            {data ? data.totalFailed.toLocaleString() : "—"}
          </p>
          <p className="text-xs text-gray-400 mt-1">Delivery errors</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
            P95 Latency
          </p>
          <p className="text-2xl font-bold text-purple-600 mt-1">
            {data ? formatLatency(data.overallP95LatencyMs) : "—"}
          </p>
          <p className="text-xs text-gray-400 mt-1">Across all endpoints</p>
        </div>
      </div>

      {/* Integration Configuration & Live Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Security & Secrets */}
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
          <h2 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <span>🛡️</span> Integration Security & Auth Status
          </h2>
          <div className="space-y-3 text-sm">
            <div className="flex items-center justify-between py-1.5 border-b border-gray-100">
              <span className="text-gray-600">INTERNAL_API_SECRET</span>
              <span
                className={`px-2 py-0.5 rounded text-xs font-medium border ${
                  data?.feedStatus.internalSecretConfigured
                    ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                    : "bg-rose-50 text-rose-700 border-rose-200"
                }`}
              >
                {data?.feedStatus.internalSecretConfigured ? "CONFIGURED" : "MISSING"}
              </span>
            </div>

            <div className="flex items-center justify-between py-1.5 border-b border-gray-100">
              <span className="text-gray-600">ALCHM_KITCHEN_SYNC_SECRET</span>
              <span
                className={`px-2 py-0.5 rounded text-xs font-medium border ${
                  data?.feedStatus.syncSecretConfigured
                    ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                    : "bg-rose-50 text-rose-700 border-rose-200"
                }`}
              >
                {data?.feedStatus.syncSecretConfigured ? "CONFIGURED" : "MISSING"}
              </span>
            </div>

            <div className="flex items-center justify-between py-1.5">
              <span className="text-gray-600">ASOL_WEBHOOK_SIGNATURES</span>
              <span
                className={`px-2 py-0.5 rounded text-xs font-medium border ${
                  data?.feedStatus.signatureMode === "required"
                    ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                    : data?.feedStatus.signatureMode === "shadow"
                      ? "bg-amber-50 text-amber-700 border-amber-200"
                      : "bg-gray-100 text-gray-700 border-gray-200"
                }`}
              >
                {data?.feedStatus.signatureMode.toUpperCase() ?? "OFF"}
              </span>
            </div>
          </div>
        </div>

        {/* Live Feed Emitter Telemetry */}
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
          <h2 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <span>📡</span> Live Feed Emitter Status
          </h2>
          {data?.feedStatus.lastEmit ? (
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between py-1.5 border-b border-gray-100">
                <span className="text-gray-600">Last Event Type</span>
                <span className="font-mono text-xs text-gray-900 bg-gray-100 px-2 py-0.5 rounded">
                  {data.feedStatus.lastEmit.eventType}
                </span>
              </div>
              <div className="flex items-center justify-between py-1.5 border-b border-gray-100">
                <span className="text-gray-600">Agent Email</span>
                <span className="font-mono text-xs text-gray-900 truncate max-w-[200px]">
                  {data.feedStatus.lastEmit.agentEmail}
                </span>
              </div>
              <div className="flex items-center justify-between py-1.5">
                <span className="text-gray-600">Response Code / Time</span>
                <div className="flex items-center gap-2">
                  <span
                    className={`px-2 py-0.5 rounded text-xs font-bold border ${
                      data.feedStatus.lastEmit.responseCode === 200
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                        : "bg-rose-50 text-rose-700 border-rose-200"
                    }`}
                  >
                    HTTP {data.feedStatus.lastEmit.responseCode}
                  </span>
                  <span className="text-xs text-gray-400">
                    {formatRelative(data.feedStatus.lastEmit.timestamp)}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-sm text-gray-500 py-6 text-center">
              No recent in-memory feed emit recorded in this instance lifecycle.
            </div>
          )}
        </div>
      </div>

      {/* Per-Source Breakdown Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-200 bg-gray-50">
          <h2 className="text-sm font-semibold text-gray-900">
            Route Health Breakdown
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
              <tr>
                <th className="px-5 py-3 text-left">Inbound Route Source</th>
                <th className="px-4 py-3 text-right">Received</th>
                <th className="px-4 py-3 text-right">Processed</th>
                <th className="px-4 py-3 text-right">In-Flight</th>
                <th className="px-4 py-3 text-right">Failed</th>
                <th className="px-4 py-3 text-right">Duplicates</th>
                <th className="px-4 py-3 text-right">P95 Latency</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {data?.sources.map((s) => (
                <tr key={s.source} className="hover:bg-gray-50 transition">
                  <td className="px-5 py-3 font-mono text-xs font-semibold text-gray-900">
                    {s.source}
                  </td>
                  <td className="px-4 py-3 text-right text-gray-700">
                    {s.received.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-right text-emerald-600 font-medium">
                    {s.processed.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-right text-amber-600 font-medium">
                    {s.inFlight.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-right text-rose-600 font-medium">
                    {s.failed.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-right text-blue-600 font-medium">
                    {s.duplicates.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-right text-purple-600 font-medium">
                    {formatLatency(s.p95LatencyMs)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent Delivery Activity Log */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-200 bg-gray-50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h2 className="text-sm font-semibold text-gray-900">
            Recent Inbound Deliveries ({filteredEvents.length})
          </h2>

          <div className="flex flex-wrap items-center gap-2">
            <select
              value={sourceFilter}
              onChange={(e) => setSourceFilter(e.target.value)}
              className="text-xs border-gray-300 rounded-md py-1 bg-white shadow-sm"
            >
              <option value="all">All Sources</option>
              <option value="asol-sync-event">asol-sync-event</option>
              <option value="asol-feed">asol-feed</option>
              <option value="asol-agent-recipes">asol-agent-recipes</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="text-xs border-gray-300 rounded-md py-1 bg-white shadow-sm"
            >
              <option value="all">All Statuses</option>
              <option value="processed">Processed</option>
              <option value="processing">Processing</option>
              <option value="failed">Failed</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 text-xs">
            <thead className="bg-gray-50 text-gray-500 uppercase tracking-wider">
              <tr>
                <th className="px-4 py-2.5 text-left">Time</th>
                <th className="px-4 py-2.5 text-left">Source</th>
                <th className="px-4 py-2.5 text-left">Event ID</th>
                <th className="px-4 py-2.5 text-left">Type</th>
                <th className="px-4 py-2.5 text-left">Status</th>
                <th className="px-4 py-2.5 text-right">Dups</th>
                <th className="px-4 py-2.5 text-right">Latency</th>
                <th className="px-4 py-2.5 text-left">Error</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 font-mono">
              {filteredEvents.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-gray-400 font-sans">
                    No matching webhook deliveries found.
                  </td>
                </tr>
              ) : (
                filteredEvents.map((evt) => (
                  <tr key={evt.id} className="hover:bg-gray-50 transition">
                    <td className="px-4 py-2 text-gray-500 whitespace-nowrap">
                      {formatRelative(evt.receivedAt)}
                    </td>
                    <td className="px-4 py-2 text-gray-900 font-semibold whitespace-nowrap">
                      {evt.source}
                    </td>
                    <td className="px-4 py-2 text-gray-600 truncate max-w-[140px]" title={evt.eventId}>
                      {evt.eventId}
                    </td>
                    <td className="px-4 py-2 text-gray-600 whitespace-nowrap">
                      {evt.eventType}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold border ${getStatusBadge(
                          evt.status,
                        )}`}
                      >
                        {evt.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-4 py-2 text-right text-gray-600">
                      {evt.duplicates > 0 ? evt.duplicates : "—"}
                    </td>
                    <td className="px-4 py-2 text-right text-gray-600">
                      {formatLatency(evt.latencyMs)}
                    </td>
                    <td className="px-4 py-2 text-rose-600 truncate max-w-[200px]" title={evt.lastError ?? ""}>
                      {evt.lastError ?? "—"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
