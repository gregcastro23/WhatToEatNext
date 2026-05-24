"use client";

/**
 * Onboarding Funnel Panel
 *
 * Dedicated visibility into the new-user onboarding flow — designed for
 * the question "is sign-up working RIGHT NOW?". Renders:
 *
 *   - Headline + status banner (OK/DEGRADED/INCIDENT/UNKNOWN)
 *   - 24h funnel: signed up → birth data → natal chart → onboarded, with
 *     drop-off percentages between stages
 *   - Stuck users list (signed up > 1h ago, not completed)
 *   - Live API health for /api/onboarding (success rate, p95, recent errors)
 *   - Most-recent completed onboardings (sanity check of happy path)
 *
 * Polls /api/admin/onboarding-health every 30s with visibility-aware backoff.
 */

import React from "react";
import { useHardenedPolling } from "@/hooks/useHardenedPolling";

type OverallStatus = "OK" | "DEGRADED" | "INCIDENT" | "UNKNOWN";

interface FunnelStage {
  id: string;
  label: string;
  count: number;
  dropOff: number;
}

interface StuckUser {
  userId: string;
  email: string;
  name: string | null;
  createdAt: string;
  ageHours: number;
  missing: string;
}

interface RecentSuccess {
  userId: string;
  email: string;
  name: string | null;
  completedAt: string;
  fullOnboarding: boolean;
  dominantElement: string | null;
}

interface ApiHealth {
  observed: boolean;
  count: number;
  successRate: number;
  errors4xx: number;
  errors5xx: number;
  p50LatencyMs: number;
  p95LatencyMs: number;
  recentErrors: Array<{
    at: string;
    method: string;
    path: string;
    status: number;
    latencyMs: number;
  }>;
}

interface OnboardingHealthPayload {
  generatedAt: string;
  overall: OverallStatus;
  headline: string;
  funnel: FunnelStage[];
  stuckUsers: StuckUser[];
  recentSuccesses: RecentSuccess[];
  apiHealth: ApiHealth;
  skipRate: number;
  live: boolean;
}

const STATUS_STYLE: Record<
  OverallStatus,
  { banner: string; dot: string; label: string; pill: string }
> = {
  OK: {
    banner: "bg-gradient-to-r from-emerald-50 to-emerald-100 border-emerald-200",
    dot: "bg-emerald-500 animate-pulse",
    label: "OK",
    pill: "bg-emerald-200 text-emerald-900",
  },
  DEGRADED: {
    banner: "bg-gradient-to-r from-amber-50 to-amber-100 border-amber-200",
    dot: "bg-amber-500 animate-pulse",
    label: "DEGRADED",
    pill: "bg-amber-200 text-amber-900",
  },
  INCIDENT: {
    banner: "bg-gradient-to-r from-rose-50 to-rose-100 border-rose-300",
    dot: "bg-rose-500 animate-ping",
    label: "INCIDENT",
    pill: "bg-rose-200 text-rose-900",
  },
  UNKNOWN: {
    banner: "bg-gradient-to-r from-gray-50 to-gray-100 border-gray-200",
    dot: "bg-gray-400",
    label: "UNKNOWN",
    pill: "bg-gray-200 text-gray-800",
  },
};

function formatRelative(iso: string): string {
  const ageMs = Date.now() - new Date(iso).getTime();
  if (ageMs < 0) return "just now";
  if (ageMs < 60_000) return `${Math.round(ageMs / 1000)}s ago`;
  if (ageMs < 3_600_000) return `${Math.round(ageMs / 60_000)}m ago`;
  if (ageMs < 86_400_000) return `${Math.round(ageMs / 3_600_000)}h ago`;
  return `${Math.round(ageMs / 86_400_000)}d ago`;
}

function elementColor(element: string | null): string {
  switch (element?.toLowerCase()) {
    case "fire":
      return "text-red-700 bg-red-100";
    case "water":
      return "text-blue-700 bg-blue-100";
    case "earth":
      return "text-green-700 bg-green-100";
    case "air":
      return "text-yellow-700 bg-yellow-100";
    default:
      return "text-gray-600 bg-gray-100";
  }
}

export default function OnboardingFunnelPanel() {
  const [data, setData] = React.useState<OnboardingHealthPayload | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  const poll = React.useCallback(async (): Promise<{ ok: boolean }> => {
    try {
      const res = await fetch("/api/admin/onboarding-health", {
        cache: "no-store",
      });
      if (!res.ok) {
        setError(`Failed to load onboarding health (HTTP ${res.status})`);
        return { ok: false };
      }
      const json = (await res.json()) as { success: boolean } & OnboardingHealthPayload;
      if (json.success) {
        setData(json);
        setError(null);
        return { ok: true };
      }
      setError("Onboarding payload malformed");
      return { ok: false };
    } catch (_err) {
      setError("Failed to reach admin API");
      return { ok: false };
    }
  }, []);

  // 2 min cadence — onboarding funnel shifts on the timescale of new
  // signups, not seconds. Stuck-user count needs minutes to develop.
  useHardenedPolling(poll, { baseIntervalMs: 120_000 });

  if (!data && !error) {
    return (
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-8 text-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-600 mx-auto mb-3" />
        <p className="text-gray-600 text-sm">Loading onboarding health…</p>
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="bg-white rounded-xl shadow-lg border border-rose-200 p-6">
        <p className="text-rose-700 font-medium">{error}</p>
        <button
          type="button"
          onClick={() => {
            void poll();
          }}
          className="mt-3 px-4 py-1.5 bg-rose-600 text-white rounded text-sm hover:bg-rose-700"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!data) return null;

  const style = STATUS_STYLE[data.overall];
  const maxFunnelCount = Math.max(1, ...data.funnel.map((s) => s.count));

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
      {/* Banner */}
      <div
        className={`px-4 sm:px-6 py-4 border-b ${style.banner} flex items-center justify-between gap-3`}
      >
        <div className="flex items-center gap-3">
          <span className={`h-3 w-3 rounded-full ${style.dot}`} />
          <div>
            <h2 className="text-lg font-bold text-gray-800">
              New-User Onboarding
            </h2>
            <p className="text-sm text-gray-700">{data.headline}</p>
          </div>
        </div>
        <span
          className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${style.pill}`}
        >
          {style.label}
        </span>
      </div>

      <div className="p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-6">
        {/* Funnel */}
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-3">
            24h Funnel
          </h3>
          <div className="space-y-2">
            {data.funnel.map((stage, idx) => {
              const widthPct = (stage.count / maxFunnelCount) * 100;
              const isLast = idx === data.funnel.length - 1;
              return (
                <div key={stage.id}>
                  <div className="flex items-baseline justify-between mb-1">
                    <span className="text-sm font-medium text-gray-700">
                      {stage.label}
                    </span>
                    <div className="flex items-baseline gap-2">
                      {idx > 0 && stage.dropOff > 0 && (
                        <span className="text-[10px] font-mono text-amber-700">
                          −{(stage.dropOff * 100).toFixed(0)}%
                        </span>
                      )}
                      <span className="text-sm font-bold font-mono text-gray-900">
                        {stage.count}
                      </span>
                    </div>
                  </div>
                  <div className="relative h-3 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        isLast
                          ? "bg-gradient-to-r from-emerald-400 to-emerald-500"
                          : "bg-gradient-to-r from-purple-400 to-purple-500"
                      }`}
                      style={{ width: `${Math.max(widthPct, stage.count > 0 ? 4 : 0)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
          {data.skipRate > 0 && (
            <p className="mt-4 text-xs text-gray-500">
              <span className="font-semibold">{(data.skipRate * 100).toFixed(0)}%</span>{" "}
              of completions used &ldquo;skip natal&rdquo; (no birth data submitted).
            </p>
          )}
        </div>

        {/* API health */}
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-3">
            /api/onboarding · 1h
          </h3>
          {data.apiHealth.observed ? (
            <>
              <div className="grid grid-cols-2 gap-3 mb-3">
                <Stat label="Requests" value={`${data.apiHealth.count}`} />
                <Stat
                  label="Success rate"
                  value={`${(data.apiHealth.successRate * 100).toFixed(1)}%`}
                  status={
                    data.apiHealth.successRate >= 0.95
                      ? "ok"
                      : data.apiHealth.successRate >= 0.8
                        ? "warn"
                        : "error"
                  }
                />
                <Stat label="p50 latency" value={`${data.apiHealth.p50LatencyMs}ms`} />
                <Stat
                  label="p95 latency"
                  value={`${data.apiHealth.p95LatencyMs}ms`}
                  status={data.apiHealth.p95LatencyMs > 5000 ? "warn" : "ok"}
                />
                <Stat
                  label="4xx errors"
                  value={`${data.apiHealth.errors4xx}`}
                  status={data.apiHealth.errors4xx > 0 ? "warn" : "ok"}
                />
                <Stat
                  label="5xx errors"
                  value={`${data.apiHealth.errors5xx}`}
                  status={data.apiHealth.errors5xx > 0 ? "error" : "ok"}
                />
              </div>
              {data.apiHealth.recentErrors.length > 0 && (
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-1.5">
                    Recent errors
                  </div>
                  <ul className="space-y-1">
                    {data.apiHealth.recentErrors.map((err, i) => (
                      <li
                        key={`${err.at}-${i}`}
                        className={`text-xs p-2 rounded font-mono ${
                          err.status >= 500
                            ? "bg-rose-50 text-rose-900"
                            : "bg-amber-50 text-amber-900"
                        }`}
                      >
                        <span className="text-gray-500 mr-2">
                          {formatRelative(err.at)}
                        </span>
                        {err.method} {err.path} →{" "}
                        <span className="font-bold">{err.status}</span>{" "}
                        <span className="text-gray-500">({err.latencyMs}ms)</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </>
          ) : (
            <p className="text-sm text-gray-500 italic">
              No /api/onboarding traffic in the last hour.
            </p>
          )}
        </div>
      </div>

      {/* Stuck users — only when present */}
      {data.stuckUsers.length > 0 && (
        <div className="px-4 sm:px-6 py-5 border-t border-gray-100 bg-amber-50">
          <h3 className="text-xs font-bold uppercase tracking-wider text-amber-900 mb-3 flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
            Stuck users ({data.stuckUsers.length})
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-[10px] uppercase tracking-wider text-amber-900">
                  <th className="text-left px-2 py-1">User</th>
                  <th className="text-left px-2 py-1">Age</th>
                  <th className="text-left px-2 py-1">Missing</th>
                </tr>
              </thead>
              <tbody>
                {data.stuckUsers.slice(0, 10).map((user) => (
                  <tr
                    key={user.userId}
                    className="hover:bg-amber-100 border-t border-amber-200"
                  >
                    <td className="px-2 py-1.5">
                      <div className="font-medium text-gray-800">
                        {user.name || "No name"}
                      </div>
                      <div className="text-xs text-gray-600 font-mono">
                        {user.email}
                      </div>
                    </td>
                    <td className="px-2 py-1.5 text-xs font-mono text-amber-900">
                      {user.ageHours}h
                    </td>
                    <td className="px-2 py-1.5">
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-amber-200 text-amber-900">
                        {user.missing}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Recent successes */}
      <div className="px-4 sm:px-6 py-5 border-t border-gray-100">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-3">
          Recent successful onboardings
        </h3>
        {data.recentSuccesses.length === 0 ? (
          <p className="text-sm text-gray-500 italic">No completed onboardings yet.</p>
        ) : (
          <ul className="space-y-2">
            {data.recentSuccesses.slice(0, 5).map((user) => (
              <li
                key={user.userId}
                className="flex items-center justify-between text-sm border-b border-gray-100 pb-2 last:border-b-0"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 text-sm font-bold">
                    ✓
                  </span>
                  <div className="min-w-0">
                    <div className="font-medium text-gray-800 truncate">
                      {user.name || "No name"}
                    </div>
                    <div className="text-xs text-gray-500 font-mono truncate">
                      {user.email}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  {user.dominantElement && (
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${elementColor(
                        user.dominantElement,
                      )}`}
                    >
                      {user.dominantElement}
                    </span>
                  )}
                  {!user.fullOnboarding && (
                    <span className="text-[10px] text-gray-400 italic">skipped natal</span>
                  )}
                  <span className="text-xs text-gray-500 font-mono">
                    {formatRelative(user.completedAt)}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
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
  status?: "ok" | "warn" | "error";
}) {
  const valueClass =
    status === "error"
      ? "text-rose-700"
      : status === "warn"
        ? "text-amber-700"
        : "text-gray-900";
  return (
    <div>
      <div className="text-[10px] font-semibold uppercase tracking-wide text-gray-500">
        {label}
      </div>
      <div className={`font-mono font-bold text-sm ${valueClass}`}>{value}</div>
    </div>
  );
}
