"use client";

/**
 * AdvancedMetricsPanel
 *
 * Renders the data exposed by the four new admin endpoints:
 *   GET /api/admin/users/stats         (sign-up + activity rollups, auth events)
 *   GET /api/admin/abuse?window=1h     (suspicious IPs + targeted emails)
 *   GET /api/admin/observability       (in-memory request + slow-query rings)
 *   POST /api/admin/digest?dryRun=true (digest preview)
 *
 * Lives on /admin alongside the existing dashboard. All sections gracefully
 * degrade — a single failed fetch only blanks its own card, not the page.
 */

import React, { useCallback, useEffect, useState } from "react";
import GrantTokensModal, {
  type GrantTarget,
} from "@/app/admin/users/_components/GrantTokensModal";
import { EmptyState } from "@/components/admin/kit/EmptyState";
import { Metric } from "@/components/admin/kit/Metric";
import { combine, fromLiveFlag } from "@/components/admin/kit/provenance";
import { ProvenanceBadge } from "@/components/admin/kit/ProvenanceBadge";

interface UsersStats {
  users: {
    total: number;
    active: number;
    onboarded: number;
    premium: number;
    agents: number;
    signups: { last24h: number; last7d: number };
    activity: { loggedIn24h: number; loggedIn7d: number; loggedIn30d: number };
  };
  sessions: { active: number };
  authEvents: {
    last24h: {
      total: number;
      successes: number;
      failures: number;
      byType: Array<{ type: string; status: string; count: number }>;
    };
    last7d: {
      total: number;
      successes: number;
      failures: number;
      byType: Array<{ type: string; status: string; count: number }>;
    };
  };
  recentLogins: Array<{
    userId: string;
    email: string;
    lastLoginAt: string | null;
    loginCount: number;
  }>;
}

interface Abuse {
  window: string;
  suspiciousIps: Array<{
    ipHash: string;
    failures: number;
    successes: number;
    emailsTargeted: number;
    lastSeen: string;
  }>;
  targetedEmails: Array<{
    email: string | null;
    failures: number;
    distinctIps: number;
    lastSeen: string;
  }>;
}

interface Observability {
  requests: {
    summary: {
      count: number;
      p50LatencyMs: number;
      p95LatencyMs: number;
      p99LatencyMs: number;
      errorRate: number;
      topPaths: Array<{ path: string; count: number }>;
    };
    recentFailures: Array<{
      id: number;
      at: string;
      method: string;
      path: string;
      status: number;
      latencyMs: number;
    }>;
  };
  slowQueries: {
    summary: { count: number; thresholdMs: number; slowestMs: number };
    recent: Array<{ id: number; at: string; ms: number; preview: string; rowCount: number | null }>;
  };
}

export default function AdvancedMetricsPanel(): React.JSX.Element {
  const [stats, setStats] = useState<UsersStats | null>(null);
  const [abuse, setAbuse] = useState<Abuse | null>(null);
  const [obs, setObs] = useState<Observability | null>(null);
  const [errors, setErrors] = useState<{ stats?: string; abuse?: string; obs?: string }>({});
  const [refreshing, setRefreshing] = useState(false);
  const [digestState, setDigestState] = useState<{ loading: boolean; message: string | null }>({
    loading: false,
    message: null,
  });
  const [grantTarget, setGrantTarget] = useState<GrantTarget | null>(null);

  const load = useCallback(async () => {
    setRefreshing(true);
    const [statsRes, abuseRes, obsRes] = await Promise.allSettled([
      fetch("/api/admin/users/stats", { cache: "no-store" }).then((r) => r.json()),
      fetch("/api/admin/abuse?window=1h", { cache: "no-store" }).then((r) => r.json()),
      fetch("/api/admin/observability", { cache: "no-store" }).then((r) => r.json()),
    ]);
    const nextErrors: typeof errors = {};
    if (statsRes.status === "fulfilled" && statsRes.value?.success) {
      setStats(statsRes.value);
    } else {
      nextErrors.stats = statsRes.status === "fulfilled" ? statsRes.value?.message : "Failed to load";
    }
    if (abuseRes.status === "fulfilled" && abuseRes.value?.success) {
      setAbuse(abuseRes.value);
    } else {
      nextErrors.abuse = abuseRes.status === "fulfilled" ? abuseRes.value?.message : "Failed to load";
    }
    if (obsRes.status === "fulfilled" && obsRes.value?.success) {
      setObs(obsRes.value);
    } else {
      nextErrors.obs = obsRes.status === "fulfilled" ? obsRes.value?.message : "Failed to load";
    }
    setErrors(nextErrors);
    setRefreshing(false);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const sendDigestPreview = async () => {
    setDigestState({ loading: true, message: null });
    try {
      const res = await fetch("/api/admin/digest?dryRun=true", { method: "POST" });
      const data = await res.json();
      if (data.success) {
        setDigestState({ loading: false, message: "Preview generated (dry run — no email sent)." });
      } else {
        setDigestState({ loading: false, message: data.message || "Failed to generate preview" });
      }
    } catch {
      setDigestState({ loading: false, message: "Network error generating preview" });
    }
  };

  const failureRate24h = stats?.authEvents.last24h.total
    ? (stats.authEvents.last24h.failures / stats.authEvents.last24h.total) * 100
    : 0;

  const overallProv = combine([
    fromLiveFlag(stats !== null),
    fromLiveFlag(abuse !== null),
    fromLiveFlag(obs !== null),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2.5">
          <h2 className="text-xl font-semibold text-gray-800">Advanced Metrics</h2>
          <ProvenanceBadge provenance={overallProv} />
        </div>
        <button
          type="button"
          onClick={() => void load()}
          disabled={refreshing}
          className="text-sm text-purple-700 hover:text-purple-900 font-semibold disabled:opacity-50"
        >
          {refreshing ? "Refreshing…" : "Refresh"}
        </button>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-4">
          <Metric
            label="Sign-ups (24h / 7d)"
            value={stats ? `${stats.users.signups.last24h} / ${stats.users.signups.last7d}` : null}
            provenance={fromLiveFlag(stats !== null)}
            caption="New rows in users"
            size="md"
          />
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <Metric
            label="Logged in (24h)"
            value={stats?.users.activity.loggedIn24h ?? null}
            provenance={fromLiveFlag(stats !== null)}
            caption={stats ? `7d: ${stats.users.activity.loggedIn7d} · 30d: ${stats.users.activity.loggedIn30d}` : undefined}
            size="md"
          />
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <Metric
            label="Active sessions"
            value={stats?.sessions.active ?? null}
            provenance={fromLiveFlag(stats !== null)}
            caption="device_sessions"
            size="md"
          />
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <Metric
            label="Auth failure rate"
            value={stats ? failureRate24h : null}
            provenance={fromLiveFlag(stats !== null)}
            format={(v) => `${Number(v).toFixed(1)}%`}
            higherIsBetter={false}
            caption={stats ? `${stats.authEvents.last24h.failures}/${stats.authEvents.last24h.total} in 24h` : undefined}
            size="md"
          />
        </div>
      </div>

      {errors.stats && (
        <EmptyState
          kind="cannot-read"
          title="Stats endpoint error"
          description={errors.stats}
        />
      )}

      {/* Auth events table */}
      {stats && (
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <div>
              <h3 className="text-base font-semibold text-gray-800">
                Auth events — last 24h
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">
                All sign-in / sign-out steps recorded in auth_events
              </p>
            </div>
            <ProvenanceBadge provenance={fromLiveFlag(true)} compact />
          </div>
          <div className="overflow-x-auto">
            {stats.authEvents.last24h.byType.length === 0 ? (
              <div className="p-6">
                <EmptyState
                  kind="all-clear"
                  title="No auth events in last 24h"
                  description="No sign-in or sign-out events were recorded in the window."
                />
              </div>
            ) : (
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-2 text-left text-xs font-medium text-gray-500 uppercase">Event</th>
                    <th className="px-6 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-2 text-right text-xs font-medium text-gray-500 uppercase">Count</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {stats.authEvents.last24h.byType.map((row) => (
                    <tr key={`${row.type}|${row.status}`}>
                      <td className="px-6 py-2 font-mono text-xs text-gray-700">{row.type}</td>
                      <td className="px-6 py-2">
                        <span
                          className={`px-2 py-0.5 rounded text-xs font-medium ${
                            row.status === "failure"
                              ? "bg-rose-100 text-rose-700"
                              : row.status === "success"
                                ? "bg-emerald-100 text-emerald-700"
                                : "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {row.status}
                        </span>
                      </td>
                      <td className="px-6 py-2 text-right font-semibold">{row.count}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* Recent logins */}
      {stats && stats.recentLogins.length > 0 && (
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-base font-semibold text-gray-800">Recent logins</h3>
          </div>
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-2 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                <th className="px-6 py-2 text-right text-xs font-medium text-gray-500 uppercase">Logins</th>
                <th className="px-6 py-2 text-right text-xs font-medium text-gray-500 uppercase">Last login</th>
                <th className="px-6 py-2 text-right text-xs font-medium text-gray-500 uppercase">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {stats.recentLogins.map((u) => (
                <tr key={u.userId}>
                  <td className="px-6 py-2 text-gray-800 font-mono text-xs">{u.email}</td>
                  <td className="px-6 py-2 text-right font-mono text-xs">{u.loginCount}</td>
                  <td className="px-6 py-2 text-right text-gray-600 font-mono text-xs">
                    {u.lastLoginAt ? new Date(u.lastLoginAt).toLocaleString() : "—"}
                  </td>
                  <td className="px-6 py-2 text-right">
                    <button
                      type="button"
                      onClick={() => setGrantTarget({ userId: u.userId, email: u.email })}
                      className="text-xs font-medium text-purple-700 hover:text-purple-900"
                    >
                      Grant tokens
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Abuse / brute-force */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h3 className="text-base font-semibold text-gray-800">
              Suspicious activity — last hour
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              IPs and emails with 5+ failed auth events in 60 minutes
            </p>
          </div>
          <ProvenanceBadge provenance={fromLiveFlag(abuse !== null)} compact />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-0 divide-y md:divide-y-0 md:divide-x divide-gray-100">
          <div className="p-4">
            <p className="px-2 pt-1 pb-2 text-xs font-medium text-gray-500 uppercase">Suspicious IPs</p>
            {!abuse ? (
              <p className="px-2 py-4 text-sm text-gray-400">{errors.abuse ?? "Loading…"}</p>
            ) : abuse.suspiciousIps.length === 0 ? (
              <EmptyState
                kind="all-clear"
                title="No suspicious IPs"
                description="No IPs exceeded the failure threshold in the last 60 minutes."
              />
            ) : (
              <ul className="space-y-1 text-sm">
                {abuse.suspiciousIps.slice(0, 8).map((ip) => (
                  <li key={ip.ipHash} className="flex justify-between gap-3 p-2 bg-gray-50 rounded">
                    <span className="font-mono text-xs text-gray-700">
                      {ip.ipHash.slice(0, 12)}…
                    </span>
                    <span className="text-rose-700 font-semibold text-xs">
                      {ip.failures} fail · {ip.emailsTargeted} emails
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div className="p-4">
            <p className="px-2 pt-1 pb-2 text-xs font-medium text-gray-500 uppercase">Targeted emails</p>
            {!abuse ? (
              <p className="px-2 py-4 text-sm text-gray-400">{errors.abuse ?? "Loading…"}</p>
            ) : abuse.targetedEmails.length === 0 ? (
              <EmptyState
                kind="all-clear"
                title="No targeted emails"
                description="No email addresses experienced targeted failures in the window."
              />
            ) : (
              <ul className="space-y-1 text-sm">
                {abuse.targetedEmails.slice(0, 8).map((e, i) => (
                  <li key={`${e.email}-${i}`} className="flex justify-between gap-3 p-2 bg-gray-50 rounded">
                    <span className="truncate text-gray-700 font-mono text-xs">{e.email}</span>
                    <span className="text-rose-700 font-semibold text-xs">
                      {e.failures} fail · {e.distinctIps} IPs
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>

      {/* Observability — slow queries + recent failures */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h3 className="text-base font-semibold text-gray-800">
              Observability (this process)
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              In-memory rings — resets on deploy. Durable signal lives in auth_events and Railway logs.
            </p>
          </div>
          <ProvenanceBadge provenance={fromLiveFlag(obs !== null)} compact />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-0 divide-y md:divide-y-0 md:divide-x divide-gray-100">
          <div className="p-6">
            <p className="text-xs font-medium text-gray-500 uppercase mb-2">Slow queries</p>
            {obs ? (
              obs.slowQueries.recent.length === 0 ? (
                <EmptyState
                  kind="all-clear"
                  title="No slow queries"
                  description={`No DB queries exceeded ${obs.slowQueries.summary.thresholdMs}ms in the ring.`}
                />
              ) : (
                <>
                  <p className="text-sm text-gray-700 mb-3">
                    {obs.slowQueries.summary.count} above {obs.slowQueries.summary.thresholdMs}ms in last 5 min ·
                    slowest {obs.slowQueries.summary.slowestMs}ms
                  </p>
                  <ul className="space-y-2 text-xs font-mono max-h-48 overflow-auto">
                    {obs.slowQueries.recent.slice(0, 10).map((q) => (
                      <li key={q.id} className="flex gap-3">
                        <span className="text-amber-700 font-bold whitespace-nowrap">{q.ms}ms</span>
                        <span className="text-gray-600 truncate">{q.preview}</span>
                      </li>
                    ))}
                  </ul>
                </>
              )
            ) : (
              <p className="text-sm text-gray-400">{errors.obs ?? "Loading…"}</p>
            )}
          </div>
          <div className="p-6">
            <p className="text-xs font-medium text-gray-500 uppercase mb-2">Recent request failures</p>
            {obs ? (
              obs.requests.recentFailures.length === 0 ? (
                <EmptyState
                  kind="all-clear"
                  title="No 5xx failures"
                  description="The in-memory failure buffer is clean."
                />
              ) : (
                <ul className="space-y-2 text-xs font-mono max-h-48 overflow-auto">
                  {obs.requests.recentFailures.slice(0, 10).map((r) => (
                    <li key={r.id} className="flex gap-3">
                      <span className="text-rose-700 font-bold w-12">{r.status}</span>
                      <span className="text-gray-700 w-12">{r.method}</span>
                      <span className="text-gray-600 truncate">{r.path}</span>
                    </li>
                  ))}
                </ul>
              )
            ) : (
              <p className="text-sm text-gray-400">{errors.obs ?? "Loading…"}</p>
            )}
          </div>
        </div>
      </div>

      {/* Digest */}
      <div className="bg-white rounded-lg shadow p-6 flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h3 className="text-base font-semibold text-gray-800">Daily auth digest</h3>
          <p className="text-xs text-gray-500 mt-1">
            POST /api/admin/digest emails AUTH_ADMIN_EMAIL. Wire it to a Railway cron at 09:00 UTC.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {digestState.message && (
            <span className="text-xs text-gray-600">{digestState.message}</span>
          )}
          <button
            type="button"
            onClick={() => {
              void sendDigestPreview();
            }}
            disabled={digestState.loading}
            className="px-3 py-2 rounded bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium disabled:opacity-50"
          >
            {digestState.loading ? "Building…" : "Preview digest (no send)"}
          </button>
        </div>
      </div>

      {grantTarget && (
        <GrantTokensModal
          target={grantTarget}
          onClose={() => setGrantTarget(null)}
          onGranted={() => {
            void load();
          }}
        />
      )}
    </div>
  );
}
