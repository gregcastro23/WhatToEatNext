"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import React from "react";
import { useHardenedPolling } from "@/hooks/useHardenedPolling";

type Status = "success" | "failure" | "info";
type Category =
  | "signup"
  | "auth"
  | "onboarding"
  | "recipe"
  | "economy"
  | "agent"
  | "diary"
  | "subscription";

interface TimelineEvent {
  id: string;
  at: string;
  category: Category;
  type: string;
  description: string;
  status: Status;
  metadata?: Record<string, unknown>;
}

interface UserIdentity {
  id: string;
  email: string;
  name: string | null;
  roles: string[];
  isActive: boolean;
  isAgent: boolean;
  isAdmin: boolean;
  createdAt: string;
  lastLoginAt: string | null;
  loginCount: number;
  dominantElement: string | null;
  bio: string | null;
  monicaConstant: number | null;
  hasCompletedOnboarding: boolean;
  onboardingCompletedAt: string | null;
  activeSessions: number;
}

interface Balances {
  spirit: number;
  essence: number;
  matter: number;
  substance: number;
  total: number;
}

interface Subscription {
  tier: string;
  status: string;
  currentPeriodEnd: string | null;
}

interface LifetimeStats {
  signIns: number;
  signInFailures: number;
  recipesViewed: number;
  recipesCooked: number;
  diaryEntries: number;
  tokensEarned: number;
  tokensSpent: number;
  agentEvents: number;
}

interface UserTimelinePayload {
  identity: UserIdentity;
  balances: Balances;
  subscription: Subscription | null;
  stats: LifetimeStats;
  events: TimelineEvent[];
  live: boolean;
  generatedAt: string;
}

const CATEGORY_STYLE: Record<Category, { dot: string; chip: string }> = {
  signup: { dot: "bg-emerald-500", chip: "bg-emerald-100 text-emerald-800 border-emerald-200" },
  auth: { dot: "bg-blue-500", chip: "bg-blue-100 text-blue-800 border-blue-200" },
  onboarding: { dot: "bg-purple-500", chip: "bg-purple-100 text-purple-800 border-purple-200" },
  recipe: { dot: "bg-orange-500", chip: "bg-orange-100 text-orange-800 border-orange-200" },
  economy: { dot: "bg-amber-500", chip: "bg-amber-100 text-amber-900 border-amber-200" },
  agent: { dot: "bg-indigo-500", chip: "bg-indigo-100 text-indigo-800 border-indigo-200" },
  diary: { dot: "bg-pink-500", chip: "bg-pink-100 text-pink-800 border-pink-200" },
  subscription: { dot: "bg-teal-500", chip: "bg-teal-100 text-teal-800 border-teal-200" },
};

function formatRelative(iso: string): string {
  const ageMs = Date.now() - new Date(iso).getTime();
  if (ageMs < 60_000) return `${Math.round(ageMs / 1000)}s ago`;
  if (ageMs < 3_600_000) return `${Math.round(ageMs / 60_000)}m ago`;
  if (ageMs < 86_400_000) return `${Math.round(ageMs / 3_600_000)}h ago`;
  return `${Math.round(ageMs / 86_400_000)}d ago`;
}

function getElementColor(element: string | null) {
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

export default function AdminUserDeepDivePage() {
  const params = useParams<{ userId: string }>();
  const userId = params?.userId;
  const [data, setData] = React.useState<UserTimelinePayload | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [notFound, setNotFound] = React.useState(false);

  const poll = React.useCallback(async (): Promise<{ ok: boolean }> => {
    if (!userId) return { ok: false };
    try {
      const res = await fetch(`/api/admin/users/${userId}/timeline`, {
        cache: "no-store",
      });
      if (res.status === 404) {
        setNotFound(true);
        return { ok: false };
      }
      if (!res.ok) {
        setError(`Failed to load (HTTP ${res.status})`);
        return { ok: false };
      }
      const json = (await res.json()) as { success: boolean } & UserTimelinePayload;
      if (json.success) {
        setData(json);
        setError(null);
        return { ok: true };
      }
      setError("Payload malformed");
      return { ok: false };
    } catch (_err) {
      setError("Failed to reach admin API");
      return { ok: false };
    }
  }, [userId]);

  useHardenedPolling(poll, { baseIntervalMs: 60_000 });

  if (notFound) {
    return (
      <div className="bg-white rounded-xl shadow-lg border border-rose-200 p-8 text-center">
        <h1 className="text-xl font-bold text-rose-700 mb-2">User not found</h1>
        <p className="text-gray-600 mb-4">No user exists with id <code className="font-mono">{userId}</code>.</p>
        <Link href="/admin/users" className="inline-block px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700">
          ← Back to users
        </Link>
      </div>
    );
  }

  if (!data && !error) {
    return (
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-8 text-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-600 mx-auto mb-3" />
        <p className="text-gray-600 text-sm">Loading user timeline…</p>
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="bg-white rounded-xl shadow-lg border border-rose-200 p-6">
        <p className="text-rose-700">{error}</p>
        <button
          type="button"
          onClick={() => void poll()}
          className="mt-3 px-4 py-1.5 bg-rose-600 text-white rounded text-sm hover:bg-rose-700"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!data) return null;

  const { identity, balances, subscription, stats, events } = data;

  return (
    <div className="space-y-6">
      {/* Header / back link */}
      <div className="flex items-center justify-between">
        <Link
          href="/admin/users"
          className="text-sm text-purple-600 hover:text-purple-800 font-medium"
        >
          ← All users
        </Link>
        <span className="text-[10px] text-gray-400 font-mono">
          updated {formatRelative(data.generatedAt)}
        </span>
      </div>

      {/* Identity card */}
      <div
        className={`bg-white rounded-xl shadow-lg border overflow-hidden ${
          identity.isAgent ? "border-purple-200" : "border-gray-100"
        }`}
      >
        <div
          className={`px-4 sm:px-6 py-5 flex items-start gap-4 ${
            identity.isAgent
              ? "bg-gradient-to-r from-indigo-50 via-purple-50 to-white"
              : "bg-gradient-to-r from-gray-50 to-white"
          }`}
        >
          <span
            className={`flex h-12 w-12 sm:h-14 sm:w-14 flex-shrink-0 items-center justify-center rounded-full text-white text-xl font-bold ${
              identity.isAgent
                ? "bg-gradient-to-br from-purple-500 to-indigo-600"
                : "bg-gradient-to-br from-orange-400 to-pink-500"
            }`}
          >
            {identity.isAgent ? "⚹" : (identity.name?.[0] || identity.email[0] || "?").toUpperCase()}
          </span>
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900 truncate">
                {identity.name || "No name"}
              </h1>
              {identity.isAgent && (
                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-purple-100 text-purple-800">
                  Agent
                </span>
              )}
              {identity.isAdmin && (
                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-800">
                  Admin
                </span>
              )}
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${
                  identity.isActive
                    ? "bg-green-100 text-green-800"
                    : "bg-red-100 text-red-800"
                }`}
              >
                {identity.isActive ? "Active" : "Inactive"}
              </span>
            </div>
            <p className="text-sm font-mono text-gray-600 break-all">{identity.email}</p>
            {identity.bio && (
              <p className="text-sm text-gray-700 mt-2 italic">{identity.bio}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4">
          <DetailTile label="Joined" value={new Date(identity.createdAt).toLocaleDateString()} sub={formatRelative(identity.createdAt)} />
          <DetailTile
            label="Last login"
            value={identity.lastLoginAt ? formatRelative(identity.lastLoginAt) : "Never"}
            sub={identity.lastLoginAt ? new Date(identity.lastLoginAt).toLocaleString() : undefined}
          />
          <DetailTile
            label="Active sessions"
            value={identity.activeSessions.toString()}
            sub={identity.activeSessions === 0 ? "no active devices" : undefined}
            valueClass="font-mono"
          />
          <DetailTile
            label="Onboarding"
            value={identity.hasCompletedOnboarding ? "Complete" : "Pending"}
            sub={identity.onboardingCompletedAt ? formatRelative(identity.onboardingCompletedAt) : undefined}
            valueClass={identity.hasCompletedOnboarding ? "text-emerald-700" : "text-amber-700"}
          />
        </div>
      </div>

      {/* Element + balances + subscription */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-4 sm:p-5">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-3">
            Element
          </h2>
          {identity.dominantElement ? (
            <span className={`inline-block px-3 py-1.5 rounded-full text-sm font-semibold ${getElementColor(identity.dominantElement)}`}>
              {identity.dominantElement}
            </span>
          ) : (
            <p className="text-sm text-gray-400">Not determined</p>
          )}
          {identity.monicaConstant !== null && (
            <p className="text-xs text-gray-500 font-mono mt-3">
              Monica constant: <span className="text-purple-700 font-semibold">{identity.monicaConstant.toFixed(4)}</span>
            </p>
          )}
        </div>

        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-4 sm:p-5">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-3">
            Token balances
          </h2>
          <div className="grid grid-cols-2 gap-2">
            <BalanceChip label="Spirit" value={balances.spirit} color="amber" />
            <BalanceChip label="Essence" value={balances.essence} color="blue" />
            <BalanceChip label="Matter" value={balances.matter} color="green" />
            <BalanceChip label="Substance" value={balances.substance} color="rose" />
          </div>
          <p className="text-xs text-gray-500 font-mono mt-3">
            Total: <span className="text-gray-900 font-semibold">{balances.total.toFixed(2)}</span>
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-4 sm:p-5">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-3">
            Subscription
          </h2>
          {subscription ? (
            <>
              <div className="flex items-center gap-2 mb-2">
                <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wider ${
                  subscription.tier === "premium"
                    ? "bg-purple-100 text-purple-800"
                    : "bg-gray-100 text-gray-800"
                }`}>
                  {subscription.tier}
                </span>
                <span className={`text-xs font-mono ${
                  subscription.status === "active" ? "text-emerald-700" : "text-amber-700"
                }`}>
                  {subscription.status}
                </span>
              </div>
              {subscription.currentPeriodEnd && (
                <p className="text-xs text-gray-500 font-mono">
                  renews {new Date(subscription.currentPeriodEnd).toLocaleDateString()}
                </p>
              )}
            </>
          ) : (
            <p className="text-sm text-gray-400">Free tier</p>
          )}
        </div>
      </div>

      {/* Lifetime stats */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="px-4 sm:px-6 py-3 border-b border-gray-100 bg-gray-50">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-500">
            Lifetime stats
          </h2>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8">
          <StatTile label="Sign-ins" value={stats.signIns} />
          <StatTile label="Failures" value={stats.signInFailures} status={stats.signInFailures > 0 ? "warn" : "ok"} />
          <StatTile label="Recipes viewed" value={stats.recipesViewed} />
          <StatTile label="Recipes cooked" value={stats.recipesCooked} />
          <StatTile label="Diary entries" value={stats.diaryEntries} />
          <StatTile label="Tokens earned" value={stats.tokensEarned} mono />
          <StatTile label="Tokens spent" value={stats.tokensSpent} mono />
          <StatTile label="Agent events" value={stats.agentEvents} />
        </div>
      </div>

      {/* Timeline */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="px-4 sm:px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-800">Activity timeline</h2>
          <span className="text-[10px] font-mono text-gray-400">
            {events.length} most recent events
          </span>
        </div>
        {events.length === 0 ? (
          <p className="p-10 text-center text-sm text-gray-500 italic">
            No activity recorded for this user.
          </p>
        ) : (
          <ul className="divide-y divide-gray-100 max-h-[600px] overflow-y-auto">
            {events.map((event) => (
              <EventRow key={event.id} event={event} />
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function DetailTile({
  label,
  value,
  sub,
  valueClass,
}: {
  label: string;
  value: string;
  sub?: string;
  valueClass?: string;
}) {
  return (
    <div className="p-3 sm:p-4 border-r border-b border-gray-100 last:border-r-0 even:border-r-0 md:even:border-r md:last:border-r-0">
      <div className="text-[10px] font-semibold uppercase tracking-wider text-gray-500">
        {label}
      </div>
      <div className={`text-base font-semibold text-gray-900 mt-1 ${valueClass ?? ""}`}>
        {value}
      </div>
      {sub && <div className="text-[10px] text-gray-500 mt-0.5">{sub}</div>}
    </div>
  );
}

function BalanceChip({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: "amber" | "blue" | "green" | "rose";
}) {
  const colorClass = {
    amber: "bg-amber-50 text-amber-900 border-amber-200",
    blue: "bg-blue-50 text-blue-900 border-blue-200",
    green: "bg-green-50 text-green-900 border-green-200",
    rose: "bg-rose-50 text-rose-900 border-rose-200",
  }[color];
  return (
    <div className={`p-2 rounded border ${colorClass}`}>
      <div className="text-[9px] font-semibold uppercase tracking-wider opacity-80">{label}</div>
      <div className="text-sm font-mono font-bold">{value.toFixed(2)}</div>
    </div>
  );
}

function StatTile({
  label,
  value,
  status = "ok",
  mono,
}: {
  label: string;
  value: number;
  status?: "ok" | "warn";
  mono?: boolean;
}) {
  const valueClass = status === "warn" ? "text-amber-700" : "text-gray-900";
  return (
    <div className="p-3 sm:p-4 border-r border-b border-gray-100 last:border-r-0">
      <div className="text-[10px] font-semibold uppercase tracking-wider text-gray-500">
        {label}
      </div>
      <div className={`text-lg font-bold mt-1 ${valueClass} ${mono ? "font-mono" : ""}`}>
        {mono && value !== Math.floor(value) ? value.toFixed(2) : value}
      </div>
    </div>
  );
}

function EventRow({ event }: { event: TimelineEvent }) {
  const style = CATEGORY_STYLE[event.category];
  return (
    <li className="px-4 sm:px-6 py-3 hover:bg-gray-50">
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 mt-1.5">
          <span className={`block h-2 w-2 rounded-full ${style.dot}`} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-2 flex-wrap">
            <span
              className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider border ${style.chip}`}
            >
              {event.category}
            </span>
            <span className="text-sm text-gray-800">{event.description}</span>
            {event.status === "failure" && (
              <span className="text-[10px] font-mono text-rose-700 font-bold">FAIL</span>
            )}
          </div>
          <p className="text-[10px] text-gray-400 font-mono mt-0.5">{event.type}</p>
        </div>
        <span
          className="flex-shrink-0 text-[10px] text-gray-400 font-mono"
          title={new Date(event.at).toLocaleString()}
        >
          {formatRelative(event.at)}
        </span>
      </div>
    </li>
  );
}
