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

import { useCallback, useEffect, useState } from "react";
import { TOKEN_TYPES, type TokenType } from "@/types/economy";

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

function Kpi({ label, value, hint }: { label: string; value: string | number; hint?: string }) {
  return (
    <div className="bg-white rounded-lg shadow p-5">
      <p className="text-xs uppercase tracking-wide text-gray-500">{label}</p>
      <p className="text-2xl font-bold text-gray-800 mt-1">{value}</p>
      {hint && <p className="text-xs text-gray-400 mt-1">{hint}</p>}
    </div>
  );
}

interface GrantTarget {
  userId: string;
  email: string;
}

interface GrantResultBalances {
  spirit: number;
  essence: number;
  matter: number;
  substance: number;
}

interface GrantResponse {
  success: boolean;
  alreadyClaimed?: boolean;
  balances?: GrantResultBalances;
  message?: string;
}

function GrantTokensModal({
  target,
  onClose,
  onGranted,
}: {
  target: GrantTarget;
  onClose: () => void;
  onGranted: () => void;
}) {
  const [amounts, setAmounts] = useState<Record<TokenType, number>>(() => ({
    Spirit: 5,
    Essence: 5,
    Matter: 5,
    Substance: 5,
  }));
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<GrantResponse | null>(null);

  const totalRequested = TOKEN_TYPES.reduce((sum, t) => sum + (amounts[t] || 0), 0);
  const canSubmit = !loading && !result?.success && totalRequested > 0;

  const submit = async () => {
    if (!canSubmit) return;
    const credits = TOKEN_TYPES
      .filter((t) => amounts[t] > 0)
      .map((tokenType) => ({ tokenType, amount: amounts[tokenType] }));
    if (credits.length === 0) return;

    setLoading(true);
    setResult(null);
    try {
      const res = await fetch(`/api/admin/users/${target.userId}/grant`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          credits,
          idempotencyKey: `admin-ui-grant-${target.userId}-${Date.now()}`,
          description: description.trim() || undefined,
        }),
      });
      const data: GrantResponse = await res.json();
      setResult(data);
      if (data.success) {
        // Surface fresh stats in the panel underneath.
        onGranted();
      }
    } catch {
      setResult({ success: false, message: "Network error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="grant-modal-title"
      onClick={(e) => {
        if (e.target === e.currentTarget && !loading) onClose();
      }}
    >
      <div className="w-full max-w-md bg-white rounded-lg shadow-xl">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 id="grant-modal-title" className="text-base font-semibold text-gray-800">
            Grant tokens
          </h3>
          <p className="text-xs text-gray-600 mt-1 truncate" title={target.email}>
            {target.email}
            <span className="ml-2 font-mono text-gray-400">
              {target.userId.slice(0, 8)}…
            </span>
          </p>
        </div>

        <div className="px-6 py-4 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            {TOKEN_TYPES.map((t) => (
              <label key={t} className="block">
                <span className="block text-xs font-medium text-gray-700 mb-1">{t}</span>
                <input
                  type="number"
                  min={0}
                  max={10000}
                  value={amounts[t]}
                  onChange={(e) => {
                    const next = Number(e.target.value);
                    setAmounts((prev) => ({ ...prev, [t]: Number.isFinite(next) ? next : 0 }));
                  }}
                  disabled={loading || result?.success === true}
                  className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:bg-gray-50 disabled:text-gray-500"
                />
              </label>
            ))}
          </div>

          <label className="block">
            <span className="block text-xs font-medium text-gray-700 mb-1">
              Reason (optional)
            </span>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={loading || result?.success === true}
              maxLength={500}
              rows={2}
              className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:bg-gray-50 disabled:text-gray-500"
              placeholder="e.g. compensation for failed daily claim"
            />
          </label>

          {result && (
            <div
              className={`rounded p-3 text-sm ${
                result.success
                  ? result.alreadyClaimed
                    ? "bg-amber-50 border border-amber-200 text-amber-800"
                    : "bg-green-50 border border-green-200 text-green-800"
                  : "bg-red-50 border border-red-200 text-red-700"
              }`}
            >
              {result.success ? (
                <>
                  <p className="font-medium">
                    {result.alreadyClaimed
                      ? "Already granted with that key — balances unchanged."
                      : "Granted. New balances:"}
                  </p>
                  {result.balances && (
                    <p className="mt-1 font-mono text-xs">
                      S {result.balances.spirit} · E {result.balances.essence} ·{" "}
                      M {result.balances.matter} · Sub {result.balances.substance}
                    </p>
                  )}
                </>
              ) : (
                <p>{result.message ?? "Grant failed"}</p>
              )}
            </div>
          )}
        </div>

        <div className="px-6 py-3 border-t border-gray-200 bg-gray-50 rounded-b-lg flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="px-3 py-1.5 text-sm rounded border border-gray-300 bg-white text-gray-700 hover:bg-gray-100 disabled:opacity-50"
          >
            {result?.success ? "Close" : "Cancel"}
          </button>
          {!result?.success && (
            <button
              type="button"
              onClick={() => void submit()}
              disabled={!canSubmit}
              className="px-3 py-1.5 text-sm rounded bg-purple-600 hover:bg-purple-700 text-white font-medium disabled:opacity-50"
            >
              {loading ? "Granting…" : `Grant ${totalRequested}`}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function AdvancedMetricsPanel() {
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

  return (
    <div className="space-y-6">
      <div className="flex items-baseline justify-between">
        <h2 className="text-xl font-semibold text-gray-800">Advanced metrics</h2>
        <button
          type="button"
          onClick={() => void load()}
          disabled={refreshing}
          className="text-sm text-purple-700 hover:text-purple-900 disabled:opacity-50"
        >
          {refreshing ? "Refreshing…" : "Refresh"}
        </button>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Kpi
          label="Sign-ups (24h / 7d)"
          value={stats ? `${stats.users.signups.last24h} / ${stats.users.signups.last7d}` : "—"}
          hint="New rows in users"
        />
        <Kpi
          label="Logged in (24h)"
          value={stats?.users.activity.loggedIn24h ?? "—"}
          hint={stats ? `7d: ${stats.users.activity.loggedIn7d} · 30d: ${stats.users.activity.loggedIn30d}` : undefined}
        />
        <Kpi
          label="Active sessions"
          value={stats?.sessions.active ?? "—"}
          hint="device_sessions (revoked_at IS NULL)"
        />
        <Kpi
          label="Auth failure rate"
          value={stats ? `${failureRate24h.toFixed(1)}%` : "—"}
          hint={stats ? `${stats.authEvents.last24h.failures}/${stats.authEvents.last24h.total} in 24h` : undefined}
        />
      </div>

      {errors.stats && (
        <div className="bg-red-50 border border-red-200 rounded p-3 text-sm text-red-700">
          Stats endpoint: {errors.stats}
        </div>
      )}

      {/* Auth events table */}
      {stats && (
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-base font-semibold text-gray-800">
              Auth events — last 24h
            </h3>
            <p className="text-xs text-gray-500 mt-1">
              All sign-in / sign-out steps recorded in auth_events
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-2 text-left text-xs font-medium text-gray-500 uppercase">Event</th>
                  <th className="px-6 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-2 text-right text-xs font-medium text-gray-500 uppercase">Count</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {stats.authEvents.last24h.byType.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="px-6 py-6 text-center text-gray-400">
                      No auth events in the last 24h
                    </td>
                  </tr>
                ) : (
                  stats.authEvents.last24h.byType.map((row) => (
                    <tr key={`${row.type}|${row.status}`}>
                      <td className="px-6 py-2 font-mono text-xs text-gray-700">{row.type}</td>
                      <td className="px-6 py-2">
                        <span
                          className={`px-2 py-0.5 rounded text-xs font-medium ${
                            row.status === "failure"
                              ? "bg-red-100 text-red-700"
                              : row.status === "success"
                                ? "bg-green-100 text-green-700"
                                : "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {row.status}
                        </span>
                      </td>
                      <td className="px-6 py-2 text-right font-semibold">{row.count}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
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
                  <td className="px-6 py-2 text-gray-800">{u.email}</td>
                  <td className="px-6 py-2 text-right">{u.loginCount}</td>
                  <td className="px-6 py-2 text-right text-gray-600">
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
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-base font-semibold text-gray-800">
            Suspicious activity — last hour
          </h3>
          <p className="text-xs text-gray-500 mt-1">
            IPs and emails with 5+ failed auth events in 60 minutes
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-0 divide-y md:divide-y-0 md:divide-x divide-gray-100">
          <div>
            <p className="px-6 pt-4 pb-1 text-xs font-medium text-gray-500 uppercase">Suspicious IPs</p>
            {!abuse ? (
              <p className="px-6 py-4 text-sm text-gray-400">{errors.abuse ?? "Loading…"}</p>
            ) : abuse.suspiciousIps.length === 0 ? (
              <p className="px-6 py-4 text-sm text-gray-400">Nothing suspicious in window.</p>
            ) : (
              <ul className="px-6 py-2 space-y-1 text-sm">
                {abuse.suspiciousIps.slice(0, 8).map((ip) => (
                  <li key={ip.ipHash} className="flex justify-between gap-3">
                    <span className="font-mono text-xs text-gray-700">
                      {ip.ipHash.slice(0, 12)}…
                    </span>
                    <span className="text-red-700">
                      {ip.failures} fail · {ip.emailsTargeted} emails
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div>
            <p className="px-6 pt-4 pb-1 text-xs font-medium text-gray-500 uppercase">Targeted emails</p>
            {!abuse ? (
              <p className="px-6 py-4 text-sm text-gray-400">{errors.abuse ?? "Loading…"}</p>
            ) : abuse.targetedEmails.length === 0 ? (
              <p className="px-6 py-4 text-sm text-gray-400">Nothing suspicious in window.</p>
            ) : (
              <ul className="px-6 py-2 space-y-1 text-sm">
                {abuse.targetedEmails.slice(0, 8).map((e, i) => (
                  <li key={`${e.email}-${i}`} className="flex justify-between gap-3">
                    <span className="truncate text-gray-700">{e.email}</span>
                    <span className="text-red-700">
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
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-base font-semibold text-gray-800">
            Observability (this process)
          </h3>
          <p className="text-xs text-gray-500 mt-1">
            In-memory rings — resets on deploy. Durable signal lives in auth_events and Railway logs.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-0 divide-y md:divide-y-0 md:divide-x divide-gray-100">
          <div className="p-6">
            <p className="text-xs font-medium text-gray-500 uppercase mb-2">Slow queries</p>
            {obs ? (
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
            ) : (
              <p className="text-sm text-gray-400">{errors.obs ?? "Loading…"}</p>
            )}
          </div>
          <div className="p-6">
            <p className="text-xs font-medium text-gray-500 uppercase mb-2">Recent request failures</p>
            {obs ? (
              obs.requests.recentFailures.length === 0 ? (
                <p className="text-sm text-gray-400">No 5xx in the ring.</p>
              ) : (
                <ul className="space-y-2 text-xs font-mono max-h-48 overflow-auto">
                  {obs.requests.recentFailures.slice(0, 10).map((r) => (
                    <li key={r.id} className="flex gap-3">
                      <span className="text-red-700 font-bold w-12">{r.status}</span>
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
