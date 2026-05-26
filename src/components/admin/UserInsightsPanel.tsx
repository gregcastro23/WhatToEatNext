"use client";

/**
 * User Insights Panel
 *
 * Aggregate demographics for the full user roster, surfaced on /admin/users.
 * Combines headline counts, activity buckets, onboarding funnel, tier mix,
 * element / modality / sun-sign distributions, and a 14-day signup sparkline.
 *
 * Polls /api/admin/users/insights every 60s via useHardenedPolling so it
 * pauses on backgrounded tabs and backs off on errors.
 */

import React from "react";
import { useHardenedPolling } from "@/hooks/useHardenedPolling";

interface SignupTrendPoint {
  day: string;
  count: number;
}

interface SignDistribution {
  sign: string;
  count: number;
}

interface UserInsightsPayload {
  generatedAt: string;
  totals: {
    all: number;
    humans: number;
    agents: number;
    active: number;
    admins: number;
  };
  signups: {
    last24h: number;
    last7d: number;
    last30d: number;
    trend: SignupTrendPoint[];
  };
  activity: {
    activeIn24h: number;
    activeIn7d: number;
    activeIn30d: number;
    neverLoggedIn: number;
    dormantOver30d: number;
    activeSessions: number;
  };
  onboarding: {
    completed: number;
    pending: number;
    completionRate: number;
    completedLast7d: number;
    medianMinutesToComplete: number | null;
  };
  tiers: {
    free: number;
    premium: number;
    admin: number;
  };
  elements: {
    fire: number;
    water: number;
    earth: number;
    air: number;
    unknown: number;
  };
  modalities: {
    cardinal: number;
    fixed: number;
    mutable: number;
    unknown: number;
  };
  sunSigns: SignDistribution[];
}

const ELEMENT_TONE: Record<string, string> = {
  fire: "bg-red-500",
  water: "bg-blue-500",
  earth: "bg-green-500",
  air: "bg-yellow-500",
};

const MODALITY_TONE: Record<string, string> = {
  cardinal: "bg-fuchsia-500",
  fixed: "bg-indigo-500",
  mutable: "bg-teal-500",
};

function formatRelative(iso: string): string {
  const ageMs = Date.now() - new Date(iso).getTime();
  if (ageMs < 60_000) return `${Math.round(ageMs / 1000)}s ago`;
  if (ageMs < 3_600_000) return `${Math.round(ageMs / 60_000)}m ago`;
  return `${Math.round(ageMs / 3_600_000)}h ago`;
}

function formatMedianTime(minutes: number | null): string {
  if (minutes === null || !Number.isFinite(minutes)) return "—";
  if (minutes < 60) return `${minutes} min`;
  const hours = minutes / 60;
  if (hours < 24) return `${hours.toFixed(1)} h`;
  return `${(hours / 24).toFixed(1)} d`;
}

function formatPercent(n: number, digits = 0): string {
  return `${(n * 100).toFixed(digits)}%`;
}

export default function UserInsightsPanel() {
  const [data, setData] = React.useState<UserInsightsPayload | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  const poll = React.useCallback(async (): Promise<{ ok: boolean }> => {
    try {
      const res = await fetch("/api/admin/users/insights", { cache: "no-store" });
      if (!res.ok) {
        setError(`HTTP ${res.status}`);
        return { ok: false };
      }
      const json = (await res.json()) as { success: boolean } & UserInsightsPayload;
      if (json.success) {
        setData(json);
        setError(null);
        return { ok: true };
      }
      setError("Insights unavailable");
      return { ok: false };
    } catch (_err) {
      setError("Network error");
      return { ok: false };
    }
  }, []);

  useHardenedPolling(poll, { baseIntervalMs: 60_000 });

  if (!data && !error) {
    return (
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="h-4 w-40 bg-gray-100 rounded animate-pulse mb-3" />
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-20 bg-gray-100 rounded animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 text-sm text-red-700">
        {error ?? "Insights unavailable"}
      </div>
    );
  }

  const { totals, signups, activity, onboarding, tiers, elements, modalities, sunSigns } = data;

  const headlineTiles = [
    {
      label: "Total users",
      value: totals.all,
      sub: `${totals.humans} humans · ${totals.agents} agents`,
    },
    {
      label: "Onboarded",
      value: onboarding.completed,
      sub: `${formatPercent(onboarding.completionRate)} of all users`,
    },
    {
      label: "Active in 24h",
      value: activity.activeIn24h,
      sub: `${activity.activeSessions} live sessions`,
    },
    {
      label: "Premium",
      value: tiers.premium,
      sub: `${tiers.free} free · ${tiers.admin} admin`,
    },
    {
      label: "New today",
      value: signups.last24h,
      sub: `${signups.last7d} this week`,
    },
  ];

  const elementsTotal = elements.fire + elements.water + elements.earth + elements.air + elements.unknown;
  const modalitiesTotal =
    modalities.cardinal + modalities.fixed + modalities.mutable + modalities.unknown;
  const maxSunSign = sunSigns.reduce((m, s) => Math.max(m, s.count), 0);
  const maxTrend = signups.trend.reduce((m, p) => Math.max(m, p.count), 0);

  return (
    <div className="bg-white rounded-lg shadow p-4 sm:p-6 mb-6">
      <div className="flex items-baseline justify-between mb-4 flex-wrap gap-2">
        <div>
          <h2 className="text-lg font-semibold text-gray-800">User Insights</h2>
          <p className="text-xs text-gray-500">
            Aggregate demographics across the full roster · refreshed every 60s
          </p>
        </div>
        <span className="text-xs text-gray-400">
          Updated {formatRelative(data.generatedAt)}
        </span>
      </div>

      {error && (
        <div className="mb-4 px-3 py-2 rounded bg-yellow-50 text-yellow-800 text-xs">
          Last refresh failed ({error}) — showing previous snapshot.
        </div>
      )}

      {/* Headline tiles */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-6">
        {headlineTiles.map((tile) => (
          <div
            key={tile.label}
            className="rounded-lg border border-gray-100 bg-gray-50 px-3 py-3"
          >
            <p className="text-[11px] uppercase tracking-wider text-gray-500">
              {tile.label}
            </p>
            <p className="mt-1 text-2xl font-bold text-gray-800 font-mono">
              {tile.value}
            </p>
            <p className="mt-0.5 text-xs text-gray-500">{tile.sub}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Activity buckets */}
        <Section title="Activity" hint="Time since last login">
          <BarRow label="Active 24h" value={activity.activeIn24h} total={totals.all} tone="bg-emerald-500" />
          <BarRow label="Active 7d" value={activity.activeIn7d} total={totals.all} tone="bg-emerald-400" />
          <BarRow label="Active 30d" value={activity.activeIn30d} total={totals.all} tone="bg-emerald-300" />
          <BarRow label="Dormant > 30d" value={activity.dormantOver30d} total={totals.all} tone="bg-amber-400" />
          <BarRow label="Never logged in" value={activity.neverLoggedIn} total={totals.all} tone="bg-gray-300" />
        </Section>

        {/* Onboarding funnel */}
        <Section title="Onboarding" hint="Birth data + natal chart saved">
          <BarRow
            label="Complete"
            value={onboarding.completed}
            total={onboarding.completed + onboarding.pending}
            tone="bg-blue-500"
          />
          <BarRow
            label="Pending"
            value={onboarding.pending}
            total={onboarding.completed + onboarding.pending}
            tone="bg-yellow-400"
          />
          <div className="mt-3 grid grid-cols-2 gap-3 text-xs">
            <Stat
              label="Completion rate"
              value={formatPercent(onboarding.completionRate, 1)}
            />
            <Stat
              label="Last 7 days"
              value={`+${onboarding.completedLast7d}`}
            />
            <Stat
              label="Median time"
              value={formatMedianTime(onboarding.medianMinutesToComplete)}
              hint="Signup → onboarded"
            />
            <Stat label="Premium / total" value={`${tiers.premium} / ${totals.all}`} />
          </div>
        </Section>

        {/* Elements */}
        <Section
          title="Dominant Elements"
          hint={`${elementsTotal} onboarded humans`}
        >
          {elementsTotal === 0 ? (
            <p className="text-xs text-gray-400">No onboarded users yet.</p>
          ) : (
            <>
              {(["fire", "water", "earth", "air"] as const).map((el) => (
                <BarRow
                  key={el}
                  label={el.charAt(0).toUpperCase() + el.slice(1)}
                  value={elements[el]}
                  total={elementsTotal}
                  tone={ELEMENT_TONE[el]}
                />
              ))}
              {elements.unknown > 0 && (
                <BarRow
                  label="Unknown"
                  value={elements.unknown}
                  total={elementsTotal}
                  tone="bg-gray-300"
                />
              )}
            </>
          )}
        </Section>

        {/* Modalities */}
        <Section
          title="Dominant Modalities"
          hint={`${modalitiesTotal} onboarded humans`}
        >
          {modalitiesTotal === 0 ? (
            <p className="text-xs text-gray-400">No modality data yet.</p>
          ) : (
            <>
              {(["cardinal", "fixed", "mutable"] as const).map((m) => (
                <BarRow
                  key={m}
                  label={m.charAt(0).toUpperCase() + m.slice(1)}
                  value={modalities[m]}
                  total={modalitiesTotal}
                  tone={MODALITY_TONE[m]}
                />
              ))}
              {modalities.unknown > 0 && (
                <BarRow
                  label="Unknown"
                  value={modalities.unknown}
                  total={modalitiesTotal}
                  tone="bg-gray-300"
                />
              )}
            </>
          )}
        </Section>

        {/* Sun signs */}
        <Section title="Sun Sign Distribution" hint="12 zodiac signs">
          <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
            {sunSigns.map((s) => (
              <div key={s.sign} className="flex items-center gap-2">
                <span className="w-20 text-xs text-gray-600">{s.sign}</span>
                <div className="flex-1 h-2 bg-gray-100 rounded overflow-hidden">
                  <div
                    className="h-full bg-purple-500"
                    style={{
                      width:
                        maxSunSign > 0
                          ? `${Math.max(2, (s.count / maxSunSign) * 100)}%`
                          : "0%",
                    }}
                  />
                </div>
                <span className="w-6 text-right text-xs font-mono text-gray-700">
                  {s.count}
                </span>
              </div>
            ))}
          </div>
        </Section>

        {/* Signups sparkline */}
        <Section
          title="Signups (14 days)"
          hint={`${signups.last24h} today · ${signups.last7d} this week · ${signups.last30d} this month`}
        >
          <div className="flex items-end gap-1 h-20">
            {signups.trend.map((p) => {
              const heightPct =
                maxTrend > 0 ? Math.max(4, (p.count / maxTrend) * 100) : 4;
              const isToday =
                p.day === new Date().toISOString().slice(0, 10);
              return (
                <div
                  key={p.day}
                  className="flex-1 flex flex-col items-center group"
                  title={`${p.day}: ${p.count} signup${p.count === 1 ? "" : "s"}`}
                >
                  <div
                    className={`w-full rounded-t ${
                      isToday ? "bg-purple-600" : "bg-purple-300"
                    } transition-all group-hover:bg-purple-500`}
                    style={{ height: `${heightPct}%` }}
                  />
                </div>
              );
            })}
          </div>
          <div className="mt-1 flex justify-between text-[10px] text-gray-400 font-mono">
            <span>{signups.trend[0]?.day.slice(5)}</span>
            <span>{signups.trend[signups.trend.length - 1]?.day.slice(5)}</span>
          </div>
        </Section>
      </div>
    </div>
  );
}

function Section({
  title,
  hint,
  children,
}: {
  title: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-lg border border-gray-100 bg-white p-4">
      <div className="flex items-baseline justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-700">{title}</h3>
        {hint && <span className="text-[11px] text-gray-400">{hint}</span>}
      </div>
      <div className="space-y-1.5">{children}</div>
    </div>
  );
}

function BarRow({
  label,
  value,
  total,
  tone,
}: {
  label: string;
  value: number;
  total: number;
  tone: string;
}) {
  const pct = total > 0 ? (value / total) * 100 : 0;
  return (
    <div className="flex items-center gap-2">
      <span className="w-28 text-xs text-gray-600 truncate">{label}</span>
      <div className="flex-1 h-2 bg-gray-100 rounded overflow-hidden">
        <div
          className={`h-full ${tone}`}
          style={{ width: total > 0 ? `${Math.max(2, pct)}%` : "0%" }}
        />
      </div>
      <span className="w-12 text-right text-xs font-mono text-gray-700">{value}</span>
    </div>
  );
}

function Stat({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <div className="rounded border border-gray-100 px-2 py-1.5 bg-gray-50">
      <p className="text-[10px] uppercase tracking-wider text-gray-500">{label}</p>
      <p className="text-sm font-semibold text-gray-800 font-mono">{value}</p>
      {hint && <p className="text-[10px] text-gray-400">{hint}</p>}
    </div>
  );
}
