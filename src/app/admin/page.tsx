"use client";

import Link from "next/link";
import React, { useEffect, useState } from "react";
import AdvancedMetricsPanel from "@/components/admin/AdvancedMetricsPanel";

interface DashboardStats {
  totalUsers: number;
  activeUsers: number;
  newUsersToday: number;
  completedOnboarding: number;
}

interface RecentUser {
  id: string;
  email: string;
  name: string;
  createdAt: string;
  dominantElement: string | null;
  isActive: boolean;
}

interface PaIntegration {
  endpoints: {
    alchmNextApp: string;
    paUi: string;
    paBackend: string;
    wtenLegacyBackend: string;
  };
  health: string;
  agentCount: number;
  lastFeedEmit: {
    eventType: string;
    agentEmail: string;
    responseCode: number;
    timestamp: string;
  } | null;
  meta: {
    mockedFields: string[];
    mockedTelemetry: Record<string, string>;
  };
}

/**
 * Admin Dashboard - Overview of system statistics & integration observability
 */
export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentUsers, setRecentUsers] = useState<RecentUser[]>([]);
  const [paIntegration, setPaIntegration] = useState<PaIntegration | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Sync state management
  const [syncing, setSyncing] = useState(false);
  const [syncEmail, setSyncEmail] = useState("");
  const [syncResult, setSyncResult] = useState<{
    success: boolean;
    statusCode: number;
    affectedCount: number;
    failures: string[];
    action: "SYNC ALL" | "SYNC ONE";
    timestamp: string;
  } | null>(null);

  useEffect(() => {
    void fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/admin/dashboard");
      if (!response.ok) throw new Error(`Server error (${response.status})`);
      const data = await response.json();

      if (data.success) {
        setStats(data.stats);
        setRecentUsers(data.recentUsers);
        setPaIntegration(data.paIntegration || null);
      } else {
        setError(data.message || "Failed to load dashboard");
      }
    } catch (_err) {
      setError("Failed to connect to server");
    } finally {
      setLoading(false);
    }
  };

  const handleSyncAll = async () => {
    try {
      setSyncing(true);
      setSyncResult(null);
      const res = await fetch("/api/admin/planetary-sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "sync-all" }),
      });
      const data = await res.json();
      setSyncResult({
        success: data.success,
        statusCode: data.statusCode || res.status,
        affectedCount: data.affectedCount || 0,
        failures: data.failures || [],
        action: "SYNC ALL",
        timestamp: data.timestamp || new Date().toISOString(),
      });
      // Refresh stats after sync
      await fetchDashboardData();
    } catch (err) {
      setSyncResult({
        success: false,
        statusCode: 500,
        affectedCount: 0,
        failures: [err instanceof Error ? err.message : "Sync connection failed."],
        action: "SYNC ALL",
        timestamp: new Date().toISOString(),
      });
    } finally {
      setSyncing(false);
    }
  };

  const handleSyncOne = async () => {
    if (!syncEmail.trim()) {
      setSyncResult({
        success: false,
        statusCode: 400,
        affectedCount: 0,
        failures: ["Please provide a valid agent email or ID to synchronize."],
        action: "SYNC ONE",
        timestamp: new Date().toISOString(),
      });
      return;
    }
    try {
      setSyncing(true);
      setSyncResult(null);
      const res = await fetch("/api/admin/planetary-sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          action: "sync-one",
          agentEmail: syncEmail.trim()
        }),
      });
      const data = await res.json();
      setSyncResult({
        success: data.success,
        statusCode: data.statusCode || res.status,
        affectedCount: data.affectedCount || 0,
        failures: data.failures || [],
        action: "SYNC ONE",
        timestamp: data.timestamp || new Date().toISOString(),
      });
      // Refresh stats after sync
      await fetchDashboardData();
    } catch (err) {
      setSyncResult({
        success: false,
        statusCode: 500,
        affectedCount: 0,
        failures: [err instanceof Error ? err.message : "Sync connection failed."],
        action: "SYNC ONE",
        timestamp: new Date().toISOString(),
      });
    } finally {
      setSyncing(false);
    }
  };

  const getElementColor = (element: string | null) => {
    switch (element?.toLowerCase()) {
      case "fire":
        return "text-red-600 bg-red-100";
      case "water":
        return "text-blue-600 bg-blue-100";
      case "earth":
        return "text-green-600 bg-green-100";
      case "air":
        return "text-yellow-600 bg-yellow-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  const getHealthBadge = (health: string | undefined) => {
    switch (health?.toLowerCase()) {
      case "healthy":
      case "online":
      case "ok":
        return (
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold text-emerald-800 bg-emerald-100">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            Online
          </span>
        );
      case "unhealthy":
        return (
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold text-amber-800 bg-amber-100">
            <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
            Degraded
          </span>
        );
      default:
        return (
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold text-rose-800 bg-rose-100">
            <span className="h-2 w-2 rounded-full bg-rose-500 animate-ping" />
            Offline
          </span>
        );
    }
  };

  if (loading && !stats) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <p className="text-red-700">{error}</p>
        <button
          onClick={() => { void fetchDashboardData(); }}
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
        <p className="text-gray-600 mt-1">
          Welcome to the alchm.kitchen admin panel
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 uppercase tracking-wide">
                Total Users
              </p>
              <p className="text-3xl font-bold text-gray-800 mt-1">
                {stats?.totalUsers || 0}
              </p>
            </div>
            <div className="bg-purple-100 p-3 rounded-full">
              <span className="text-2xl">👥</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 uppercase tracking-wide">
                Active Users
              </p>
              <p className="text-3xl font-bold text-green-600 mt-1">
                {stats?.activeUsers || 0}
              </p>
            </div>
            <div className="bg-green-100 p-3 rounded-full">
              <span className="text-2xl">✅</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 uppercase tracking-wide">
                New Today
              </p>
              <p className="text-3xl font-bold text-blue-600 mt-1">
                {stats?.newUsersToday || 0}
              </p>
            </div>
            <div className="bg-blue-100 p-3 rounded-full">
              <span className="text-2xl">🆕</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 uppercase tracking-wide">
                Onboarded
              </p>
              <p className="text-3xl font-bold text-orange-600 mt-1">
                {stats?.completedOnboarding || 0}
              </p>
            </div>
            <div className="bg-orange-100 p-3 rounded-full">
              <span className="text-2xl">🎯</span>
            </div>
          </div>
        </div>
      </div>

      {/* Advanced metrics (auth events, abuse, observability, digest) */}
      <div className="mb-8">
        <AdvancedMetricsPanel />
      </div>

      {/* Grid: Planetary Agents Integration card */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        
        {/* Planetary Agents Card */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden flex flex-col justify-between">
          <div className="bg-gradient-to-r from-indigo-900 via-purple-900 to-violet-900 px-6 py-4 flex justify-between items-center text-white">
            <div>
              <h2 className="text-lg font-bold">Planetary Agents Integration</h2>
              <p className="text-xs text-indigo-200">Cross-project command & control center</p>
            </div>
            {getHealthBadge(paIntegration?.health)}
          </div>

          <div className="p-6 space-y-6 flex-1">
            
            {/* Endpoints Registry */}
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-3">
                Canonical Endpoint Registry
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <a
                  href="https://alchm.kitchen"
                  target="_blank"
                  rel="noreferrer"
                  className="p-3 bg-gray-50 hover:bg-indigo-50 border border-gray-100 rounded-lg transition-colors group"
                >
                  <p className="text-xs text-gray-500 group-hover:text-indigo-600 font-medium">alchm Next App</p>
                  <p className="text-sm font-semibold text-gray-700 truncate">https://alchm.kitchen</p>
                </a>
                <a
                  href="https://agents.alchm.kitchen"
                  target="_blank"
                  rel="noreferrer"
                  className="p-3 bg-gray-50 hover:bg-indigo-50 border border-gray-100 rounded-lg transition-colors group"
                >
                  <p className="text-xs text-gray-500 group-hover:text-indigo-600 font-medium">Planetary Agents UI</p>
                  <p className="text-sm font-semibold text-gray-700 truncate">https://agents.alchm.kitchen</p>
                </a>
                <a
                  href="https://api.agents.alchm.kitchen"
                  target="_blank"
                  rel="noreferrer"
                  className="p-3 bg-gray-50 hover:bg-indigo-50 border border-gray-100 rounded-lg transition-colors group"
                >
                  <p className="text-xs text-gray-500 group-hover:text-indigo-600 font-medium">PA Backend API</p>
                  <p className="text-sm font-semibold text-gray-700 truncate">https://api.agents.alchm.kitchen</p>
                </a>
                <a
                  href="https://whattoeatnext-production.up.railway.app"
                  target="_blank"
                  rel="noreferrer"
                  className="p-3 bg-gray-50 hover:bg-indigo-50 border border-gray-100 rounded-lg transition-colors group"
                >
                  <p className="text-xs text-gray-500 group-hover:text-indigo-600 font-medium">WTEN Legacy Backend</p>
                  <p className="text-sm font-semibold text-gray-700 truncate">whattoeatnext-production.up.railway.app</p>
                </a>
              </div>
            </div>

            {/* Sync Controls */}
            <div className="border-t border-gray-100 pt-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                <div>
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                    Planetary Agent Synchronizer
                  </h3>
                  <p className="text-xs text-gray-500">PA Backend Registered Agents: <span className="font-semibold text-gray-800">{paIntegration?.agentCount ?? 0}</span></p>
                </div>
                <button
                  onClick={() => { void handleSyncAll(); }}
                  disabled={syncing}
                  className="px-4 py-2 bg-indigo-600 text-white text-xs font-bold rounded-lg hover:bg-indigo-700 active:scale-95 disabled:bg-gray-300 disabled:scale-100 transition"
                >
                  {syncing ? "SYNCING..." : "SYNC ALL AGENTS"}
                </button>
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Enter agent email or ID (e.g., galileo@agentic.alchm.kitchen)"
                  value={syncEmail}
                  onChange={(e) => setSyncEmail(e.target.value)}
                  disabled={syncing}
                  className="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-indigo-400 disabled:bg-gray-100 text-gray-800"
                />
                <button
                  onClick={() => { void handleSyncOne(); }}
                  disabled={syncing}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-lg active:scale-95 disabled:bg-gray-300 disabled:scale-100 transition"
                >
                  SYNC ONE
                </button>
              </div>

              {/* Sync Results Observability Log */}
              {syncResult && (
                <div className={`mt-4 p-4 rounded-lg text-xs font-mono space-y-2 border ${
                  syncResult.success 
                    ? "bg-emerald-50 border-emerald-200 text-emerald-950" 
                    : "bg-rose-50 border-rose-200 text-rose-950"
                }`}>
                  <div className="flex justify-between font-bold border-b border-gray-200 pb-1.5">
                    <span>⚡ LOG: {syncResult.action}</span>
                    <span className={syncResult.success ? "text-emerald-700" : "text-rose-700"}>
                      {syncResult.success ? "SUCCESS" : "FAILED"} (HTTP {syncResult.statusCode})
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 pt-1 text-gray-700">
                    <p>Affected Records: <span className="font-semibold">{syncResult.affectedCount}</span></p>
                    <p className="text-right">Time: {new Date(syncResult.timestamp).toLocaleTimeString()}</p>
                  </div>
                  {syncResult.failures.length > 0 && (
                    <div className="pt-2">
                      <p className="font-bold text-rose-700 mb-1">Failures List:</p>
                      <ul className="list-disc list-inside space-y-1 text-rose-800">
                        {syncResult.failures.map((fail, i) => (
                          <li key={i}>{fail}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Last Feed Emit Webhook Telemetry */}
            <div className="border-t border-gray-100 pt-5">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-3">
                Agent Webhook Observability (POST /api/feed)
              </h3>
              {paIntegration?.lastFeedEmit ? (
                <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg font-mono text-xs space-y-2 text-gray-700">
                  <div className="flex justify-between border-b border-gray-200 pb-1">
                    <span className="font-semibold text-gray-900">Event: {paIntegration.lastFeedEmit.eventType}</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      paIntegration.lastFeedEmit.responseCode === 200 
                        ? "bg-emerald-100 text-emerald-800" 
                        : "bg-rose-100 text-rose-800"
                    }`}>
                      HTTP {paIntegration.lastFeedEmit.responseCode}
                    </span>
                  </div>
                  <p>Agent: <span className="font-semibold text-gray-900">{paIntegration.lastFeedEmit.agentEmail}</span></p>
                  <p>Received: <span className="font-semibold text-gray-900">
                    {new Date(paIntegration.lastFeedEmit.timestamp).toLocaleString()}
                  </span></p>
                </div>
              ) : (
                <div className="p-4 bg-gray-50 border border-dashed border-gray-200 rounded-lg text-center text-xs text-gray-400">
                  ⚡ Webhook listening. No feed emit events received yet.
                </div>
              )}
            </div>

          </div>

          {/* Simulated / Seeded Telemetry Panel */}
          <div className="bg-yellow-50/75 border-t border-yellow-100 p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-amber-700 bg-amber-100 px-2.5 py-0.5 rounded-full">
                Simulated Telemetry
              </span>
              <span className="text-[10px] text-amber-500 font-mono">meta.mockedFields</span>
            </div>
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="p-2 bg-white/50 border border-yellow-100/50 rounded-lg">
                <p className="text-[10px] text-amber-600 font-medium uppercase">Agent Harmony</p>
                <p className="text-sm font-bold text-amber-900 mt-0.5">
                  {paIntegration?.meta?.mockedTelemetry?.agentHarmony ?? "94.2%"}
                </p>
              </div>
              <div className="p-2 bg-white/50 border border-yellow-100/50 rounded-lg">
                <p className="text-[10px] text-amber-600 font-medium uppercase">Transmutation</p>
                <p className="text-sm font-bold text-amber-900 mt-0.5">
                  {paIntegration?.meta?.mockedTelemetry?.transmutationRate ?? "3.42 kg/h"}
                </p>
              </div>
              <div className="p-2 bg-white/50 border border-yellow-100/50 rounded-lg">
                <p className="text-[10px] text-amber-600 font-medium uppercase">Spiritual Entropy</p>
                <p className="text-sm font-bold text-amber-900 mt-0.5">
                  {paIntegration?.meta?.mockedTelemetry?.spiritualEntropy ?? "0.11"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Users Card */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden flex flex-col">
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
            <div>
              <h2 className="text-lg font-bold text-gray-800">Recent Users</h2>
              <p className="text-xs text-gray-500">Latest user sign-ups and charts</p>
            </div>
            <Link
              href="/admin/users"
              className="text-xs font-bold text-purple-600 hover:text-purple-800"
            >
              VIEW ALL →
            </Link>
          </div>
          <div className="overflow-x-auto flex-1">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Element
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Joined
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {recentUsers.length === 0 ? (
                  <tr>
                    <td
                      colSpan={4}
                      className="px-6 py-8 text-center text-gray-500"
                    >
                      No users yet
                    </td>
                  </tr>
                ) : (
                  recentUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-medium text-gray-800">
                            {user.name || "No name"}
                          </p>
                          <p className="text-sm text-gray-500">{user.email}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {user.dominantElement ? (
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getElementColor(
                              user.dominantElement,
                            )}`}
                          >
                            {user.dominantElement}
                          </span>
                        ) : (
                          <span className="text-gray-400 text-sm">—</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            user.isActive
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {user.isActive ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
