"use client";

import Link from "next/link";
import React, { useState, useEffect, useCallback } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { getMcpNetworkSummary, type McpNetworkSummary, type McpVerdict } from "@/services/mcpNetworkService";

const VERDICT_STYLE: Record<
  McpVerdict,
  { bg: string; text: string; dot: string; label: string; border: string }
> = {
  OK: {
    bg: "bg-emerald-50",
    text: "text-emerald-800",
    dot: "bg-emerald-500",
    label: "OK",
    border: "border-emerald-200",
  },
  DEGRADED: {
    bg: "bg-amber-50",
    text: "text-amber-800",
    dot: "bg-amber-500",
    label: "DEGRADED",
    border: "border-amber-200",
  },
  INCIDENT: {
    bg: "bg-rose-50",
    text: "text-rose-800",
    dot: "bg-rose-500",
    label: "INCIDENT",
    border: "border-rose-200",
  },
  UNKNOWN: {
    bg: "bg-gray-50",
    text: "text-gray-800",
    dot: "bg-gray-500",
    label: "UNKNOWN",
    border: "border-gray-200",
  },
};

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

export default function McpAdminPage() {
  const [windowMinutes, setWindowMinutes] = useState<number>(60);
  const [summary, setSummary] = useState<McpNetworkSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [secondsSinceRefreshed, setSecondsSinceRefreshed] = useState(0);
  const [activeTab, setActiveTab] = useState<"network" | "personas" | "quotas">("network");

  const refreshData = useCallback(async (showLoading = false) => {
    if (showLoading) setLoading(true);
    try {
      const data = await getMcpNetworkSummary(windowMinutes);
      setSummary(data);
      setSecondsSinceRefreshed(0);
    } catch (err) {
      console.error("Failed to load telemetry summary", err);
    } finally {
      setLoading(false);
    }
  }, [windowMinutes]);

  // Initial load and window change trigger
  useEffect(() => {
    void refreshData(true);
  }, [refreshData]);

  // Polling re-fetch every 30s
  useEffect(() => {
    const timer = setInterval(() => {
      void refreshData(false);
    }, 30_000);

    return () => clearInterval(timer);
  }, [refreshData]);

  // Elapsed seconds timer since last refresh
  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsSinceRefreshed((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  if (loading && !summary) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4" />
          <p className="text-gray-600 font-medium">Loading telemetry summary…</p>
        </div>
      </div>
    );
  }

  const currentSummary = summary!;
  const verdictStyle = VERDICT_STYLE[currentSummary.verdict];
  const isStale = !currentSummary.live;

  return (
    <div className="relative space-y-6 sm:space-y-8 max-w-7xl mx-auto">
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-sm text-gray-500 font-medium">
            <Link href="/admin" className="hover:text-purple-600 transition">Admin Overview</Link>
            <span>/</span>
            <span className="text-gray-800">MCP Network</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight mt-1">
            Planetary Agents MCP Network
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Observability portal for the cross-server Model Context Protocol (MCP) telemetry
          </p>
        </div>

        {/* Refresh & Controls */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 bg-white border border-gray-200 px-3 py-1.5 rounded-lg shadow-sm text-xs font-semibold text-gray-700">
            <span className="text-gray-400">Window:</span>
            <select
              value={windowMinutes}
              onChange={(e) => setWindowMinutes(parseInt(e.target.value, 10))}
              className="bg-transparent border-none focus:ring-0 p-0 text-xs font-bold text-purple-700 cursor-pointer"
            >
              <option value={15}>15 Minutes</option>
              <option value={60}>1 Hour</option>
              <option value={240}>4 Hours</option>
              <option value={1440}>24 Hours</option>
            </select>
          </div>

          <button
            onClick={() => { void refreshData(true); }}
            disabled={loading}
            className="flex items-center justify-center h-8 px-4 bg-purple-600 hover:bg-purple-700 active:scale-95 text-white text-xs font-bold rounded-lg shadow-sm transition disabled:bg-gray-300 disabled:scale-100"
          >
            {loading ? "REFRESHING..." : "REFRESH NOW"}
          </button>
        </div>
      </div>

      {/* Live / Stale Banner Indicator */}
      <div className={`flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 border rounded-xl shadow-sm ${
        isStale ? "bg-amber-50/60 border-amber-200" : "bg-white border-gray-100"
      }`}>
        <div className="flex items-center gap-3">
          <span className={`h-3 w-3 rounded-full ${verdictStyle.dot} ${
            currentSummary.verdict === "OK" ? "animate-pulse" : ""
          }`} />
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-gray-800 text-sm">MCP System Verdict</span>
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold border uppercase tracking-wider ${verdictStyle.bg} ${verdictStyle.text} ${verdictStyle.border}`}>
                {verdictStyle.label}
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-0.5">
              {isStale 
                ? "Showing cached/stale telemetry. Planetary Agents server is currently unreachable."
                : `Planetary Agents status healthy · aggregated at ${new Date(currentSummary.generatedAt).toLocaleTimeString()}`
              }
            </p>
          </div>
        </div>

        <div className="text-right text-xs font-medium text-gray-500 font-mono">
          Last refreshed {secondsSinceRefreshed}s ago
        </div>
      </div>

      {/* Backdrop Stale Overlay when live: false */}
      <div className="relative">
        {isStale && (
          <div className="absolute inset-0 bg-gray-50/50 backdrop-blur-[2px] z-10 rounded-2xl flex items-center justify-center p-6 border border-amber-200/50">
            <div className="bg-white/95 border border-amber-200 shadow-xl rounded-xl p-6 max-w-md text-center">
              <span className="text-3xl">⚠️</span>
              <h3 className="text-base font-bold text-gray-800 mt-2">PA Telemetry Stale</h3>
              <p className="text-xs text-gray-600 mt-1.5 leading-relaxed">
                WTEN is unable to establish contact with the Planetary Agents telemetry service. 
                Below is the last successfully cached operational snapshot (~30s TTL).
              </p>
              <button
                onClick={() => { void refreshData(true); }}
                className="mt-4 px-4 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold transition shadow"
              >
                Attempt Reconnect
              </button>
            </div>
          </div>
        )}

        {/* Main Tabs and Content */}
        <div className={`${isStale ? "opacity-40" : ""}`}>
          <Tabs className="space-y-6">
            <TabsList className="bg-gray-100 p-1 rounded-xl inline-flex w-full sm:w-auto shadow-inner border border-gray-200/50">
              <TabsTrigger
                onClick={() => setActiveTab("network")}
                className={`flex-1 sm:flex-none px-6 py-2 text-xs font-bold rounded-lg transition duration-200 ${
                  activeTab === "network"
                    ? "bg-white text-purple-950 shadow-sm"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-50/50"
                }`}
              >
                🔌 Network
              </TabsTrigger>
              <TabsTrigger
                onClick={() => setActiveTab("personas")}
                className={`flex-1 sm:flex-none px-6 py-2 text-xs font-bold rounded-lg transition duration-200 ${
                  activeTab === "personas"
                    ? "bg-white text-purple-950 shadow-sm"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-50/50"
                }`}
              >
                👥 Personas
              </TabsTrigger>
              <TabsTrigger
                onClick={() => setActiveTab("quotas")}
                className={`flex-1 sm:flex-none px-6 py-2 text-xs font-bold rounded-lg transition duration-200 ${
                  activeTab === "quotas"
                    ? "bg-white text-purple-950 shadow-sm"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-50/50"
                }`}
              >
                🛡️ Quotas & Probes
              </TabsTrigger>
            </TabsList>

            {/* TAB 1: NETWORK */}
            {activeTab === "network" && (
              <TabsContent className="space-y-6 animate-fadeIn">
                {/* 4 Stat Cards */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <StatCard
                    title="Total Tool Calls"
                    value={currentSummary.totals.calls.toLocaleString()}
                    description={`In last ${currentSummary.windowMinutes} minutes`}
                    colorClass="border-purple-100 bg-white"
                  />
                  <StatCard
                    title="Success Rate"
                    value={`${((1 - currentSummary.totals.errorRate) * 100).toFixed(1)}%`}
                    description={`${currentSummary.totals.success} / ${currentSummary.totals.calls} calls`}
                    colorClass={currentSummary.totals.errorRate > 0.05 ? "border-rose-100 bg-rose-50/10 text-rose-700" : "border-emerald-100 bg-white"}
                  />
                  <StatCard
                    title="p95 Latency"
                    value={formatLatency(currentSummary.totals.p95LatencyMs)}
                    description={`p50: ${formatLatency(currentSummary.totals.p50LatencyMs)} · p99: ${formatLatency(currentSummary.totals.p99LatencyMs)}`}
                    colorClass="border-blue-100 bg-white"
                  />
                  <StatCard
                    title="Server Verdict"
                    value={currentSummary.verdict}
                    description="Synthetic & live heuristics"
                    colorClass={`${verdictStyle.border} bg-white`}
                    customValue={
                      <div className="flex items-center gap-2 mt-2">
                        <span className={`h-2.5 w-2.5 rounded-full ${verdictStyle.dot}`} />
                        <span className={`text-xl font-black ${verdictStyle.text}`}>{currentSummary.verdict}</span>
                      </div>
                    }
                  />
                </div>

                {/* ByTool Breakdown Table */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                  <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/60">
                    <h2 className="text-base font-bold text-gray-800">Tool Utilization & Performance</h2>
                    <p className="text-xs text-gray-500 mt-0.5">Calls, failures, and roundtrip latency for each exposed tool</p>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead className="bg-gray-50/80 text-[10px] uppercase font-bold tracking-wider text-gray-400 border-b border-gray-100">
                        <tr>
                          <th className="px-6 py-3">Tool Name</th>
                          <th className="px-6 py-3 text-right">Invocations</th>
                          <th className="px-6 py-3 text-right">Failures</th>
                          <th className="px-6 py-3 text-right">Failure Rate</th>
                          <th className="px-6 py-3 text-right">p95 Latency</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 text-sm">
                        {currentSummary.byTool.length === 0 ? (
                          <tr>
                            <td colSpan={5} className="px-6 py-12 text-center text-gray-400">
                              No tool invocations recorded in the last {windowMinutes} minutes.
                            </td>
                          </tr>
                        ) : (
                          currentSummary.byTool.map((row, i) => {
                            const failRate = row.calls > 0 ? row.failures / row.calls : 0;
                            return (
                              <tr key={`${row.tool}-${i}`} className="hover:bg-gray-50/50 transition">
                                <td className="px-6 py-4 font-semibold text-gray-900 font-mono text-xs">{row.tool}</td>
                                <td className="px-6 py-4 text-right font-mono font-medium text-gray-800">{row.calls}</td>
                                <td className="px-6 py-4 text-right font-mono text-gray-800">{row.failures}</td>
                                <td className="px-6 py-4 text-right font-mono">
                                  <span className={failRate > 0.05 ? "text-rose-600 font-bold" : "text-gray-500"}>
                                    {(failRate * 100).toFixed(1)}%
                                  </span>
                                </td>
                                <td className="px-6 py-4 text-right font-mono font-semibold text-purple-700">
                                  {formatLatency(row.p95LatencyMs)}
                                </td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </TabsContent>
            )}

            {/* TAB 2: PERSONAS */}
            {activeTab === "personas" && (
              <TabsContent className="space-y-6 animate-fadeIn">
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                  <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/60">
                    <h2 className="text-base font-bold text-gray-800">Planetary Persona Invocations</h2>
                    <p className="text-xs text-gray-500 mt-0.5">Top active agents and their underlying Model Tier mixture proportions</p>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead className="bg-gray-50/80 text-[10px] uppercase font-bold tracking-wider text-gray-400 border-b border-gray-100">
                        <tr>
                          <th className="px-6 py-3">Agent ID</th>
                          <th className="px-6 py-3 text-right">Invocations</th>
                          <th className="px-6 py-3 px-12">Model Tier Mixture Split</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 text-sm">
                        {currentSummary.byAgent.length === 0 ? (
                          <tr>
                            <td colSpan={3} className="px-6 py-12 text-center text-gray-400">
                              No agent persona telemetry recorded in the last {windowMinutes} minutes.
                            </td>
                          </tr>
                        ) : (
                          currentSummary.byAgent.slice(0, 10).map((row, i) => (
                            <tr key={`${row.agentId}-${i}`} className="hover:bg-gray-50/50 transition">
                              <td className="px-6 py-4 font-bold text-gray-900 flex items-center gap-2">
                                <span className="text-purple-600">✦</span>
                                {row.agentId}
                              </td>
                              <td className="px-6 py-4 text-right font-mono font-medium text-gray-800">{row.calls}</td>
                              <td className="px-6 py-4 px-12">
                                <StackedBar modelMix={row.modelTierMix} totalCalls={row.calls} />
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </TabsContent>
            )}

            {/* TAB 3: QUOTAS & PROBES */}
            {activeTab === "quotas" && (
              <TabsContent className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fadeIn">
                {/* Callers / API Keys (Left) */}
                <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                  <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/60">
                    <h2 className="text-base font-bold text-gray-800">Top Network Callers</h2>
                    <p className="text-xs text-gray-500 mt-0.5">Top API keys, apps, or bridge callers dispatching requests</p>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-gray-50/80 text-[10px] uppercase font-bold tracking-wider text-gray-400 border-b border-gray-100">
                        <tr>
                          <th className="px-6 py-3">Caller Identity</th>
                          <th className="px-6 py-3 text-right">Invocations</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {currentSummary.byCaller.length === 0 ? (
                          <tr>
                            <td colSpan={2} className="px-6 py-12 text-center text-gray-400">
                              No caller traffic observed in the last {windowMinutes} minutes.
                            </td>
                          </tr>
                        ) : (
                          currentSummary.byCaller.slice(0, 10).map((row, i) => (
                            <tr key={`${row.caller}-${i}`} className="hover:bg-gray-50/50 transition">
                              <td className="px-6 py-4 font-mono text-xs font-semibold text-gray-700">{row.caller}</td>
                              <td className="px-6 py-4 text-right font-mono font-bold text-purple-700">{row.calls}</td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Synthetic Probe Card (Right) */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col justify-between space-y-6">
                  <div>
                    <div className="flex items-center gap-1 bg-purple-50 text-purple-800 px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider w-fit mb-4">
                      ⏱️ Heartbeat Monitor
                    </div>
                    <h2 className="text-base font-bold text-gray-900">Synthetic MCP Probe</h2>
                    <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                      Planetary Agents schedules automatic synthetic end-to-end probes. 
                      This acts as a continuous liveness test of the entire tool orchestration layer.
                    </p>
                  </div>

                  <div className="space-y-4 pt-4 border-t border-gray-100">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-gray-500 font-semibold uppercase tracking-wider text-[10px]">Probe Verdict</span>
                      <span className={`px-2.5 py-0.5 rounded text-[10px] font-black uppercase tracking-wider border ${
                        VERDICT_STYLE[currentSummary.syntheticProbe.verdict].bg
                      } ${
                        VERDICT_STYLE[currentSummary.syntheticProbe.verdict].text
                      } ${
                        VERDICT_STYLE[currentSummary.syntheticProbe.verdict].border
                      }`}>
                        {currentSummary.syntheticProbe.verdict}
                      </span>
                    </div>

                    <div className="flex justify-between items-center text-xs">
                      <span className="text-gray-500 font-semibold uppercase tracking-wider text-[10px]">Last Checked</span>
                      <span className="font-mono font-medium text-gray-800">{formatRelative(currentSummary.syntheticProbe.lastCalledAt)}</span>
                    </div>

                    <div className="flex justify-between items-center text-xs">
                      <span className="text-gray-500 font-semibold uppercase tracking-wider text-[10px]">Last Status</span>
                      <span className={`font-bold ${
                        currentSummary.syntheticProbe.lastSuccess === true 
                          ? "text-emerald-600" 
                          : currentSummary.syntheticProbe.lastSuccess === false 
                            ? "text-rose-600" 
                            : "text-gray-400"
                      }`}>
                        {currentSummary.syntheticProbe.lastSuccess === true 
                          ? "SUCCESS" 
                          : currentSummary.syntheticProbe.lastSuccess === false 
                            ? "FAILURE" 
                            : "NO DATA"
                        }
                      </span>
                    </div>

                    <div className="flex justify-between items-center text-xs">
                      <span className="text-gray-500 font-semibold uppercase tracking-wider text-[10px]">Consecutive Failures</span>
                      <span className={`font-mono font-bold ${
                        currentSummary.syntheticProbe.consecutiveFailures > 0 ? "text-rose-600 font-extrabold animate-pulse" : "text-gray-800"
                      }`}>
                        {currentSummary.syntheticProbe.consecutiveFailures}
                      </span>
                    </div>
                  </div>

                  <div className="bg-gray-50 border border-gray-100 rounded-lg p-3 text-center">
                    <p className="text-[10px] text-gray-500 font-medium">
                      Probes run at a 15-minute cron interval to ensure continuous system health reporting.
                    </p>
                  </div>
                </div>
              </TabsContent>
            )}
          </Tabs>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  title,
  value,
  description,
  colorClass,
  customValue,
}: {
  title: string;
  value: string;
  description: string;
  colorClass: string;
  customValue?: React.ReactNode;
}) {
  return (
    <div className={`p-5 rounded-xl border shadow-sm flex flex-col justify-between h-28 ${colorClass}`}>
      <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">{title}</span>
      {customValue ? (
        customValue
      ) : (
        <span className="text-2xl font-black text-gray-900 tracking-tight leading-none mt-1">{value}</span>
      )}
      <span className="text-[10px] text-gray-500 mt-1 truncate">{description}</span>
    </div>
  );
}

function StackedBar({
  modelMix,
  totalCalls,
}: {
  modelMix: Record<string, number>;
  totalCalls: number;
}) {
  const tiers = [
    { key: "free", label: "Free", color: "bg-emerald-500" },
    { key: "cheap_fast", label: "Cheap Fast", color: "bg-cyan-500" },
    { key: "cheap", label: "Cheap", color: "bg-cyan-500" },
    { key: "primary", label: "Primary", color: "bg-purple-500" },
    { key: "reflective", label: "Reflective", color: "bg-amber-500" },
  ];

  // Consolidate "cheap" and "cheap_fast" into cheap segment
  const normalizedMix: Record<string, number> = {};
  for (const [key, value] of Object.entries(modelMix)) {
    if (key === "cheap" || key === "cheap_fast") {
      normalizedMix.cheap = (normalizedMix.cheap || 0) + value;
    } else {
      normalizedMix[key] = value;
    }
  }

  const activeTiers = tiers
    .filter((t) => t.key !== "cheap_fast") // consolidation
    .map((t) => {
      const count = normalizedMix[t.key] || 0;
      const pct = totalCalls > 0 ? (count / totalCalls) * 100 : 0;
      return { ...t, count, pct };
    })
    .filter((t) => t.count > 0);

  if (activeTiers.length === 0) {
    return (
      <div className="w-full bg-gray-100 h-6 rounded-lg text-center text-[10px] font-semibold text-gray-400 flex items-center justify-center border border-dashed border-gray-200">
        No Model Breakdown Available
      </div>
    );
  }

  return (
    <div className="space-y-1.5 min-w-[200px]">
      <div className="w-full bg-gray-100 h-6 rounded-lg overflow-hidden flex shadow-inner border border-gray-200/50">
        {activeTiers.map((t) => (
          <div
            key={t.key}
            className={`${t.color} h-full transition-all duration-300 hover:brightness-95 cursor-pointer relative group`}
            style={{ width: `${t.pct}%` }}
            title={`${t.label}: ${t.count} calls (${t.pct.toFixed(1)}%)`}
          />
        ))}
      </div>
      <div className="flex flex-wrap gap-x-3 gap-y-1 text-[9px] font-mono text-gray-500 font-bold uppercase">
        {activeTiers.map((t) => (
          <span key={t.key} className="flex items-center gap-1">
            <span className={`h-1.5 w-1.5 rounded-full ${t.color}`} />
            {t.label}: {t.count} ({t.pct.toFixed(0)}%)
          </span>
        ))}
      </div>
    </div>
  );
}
