"use client";

/**
 * Live Activity Panel
 *
 * The "what's actually happening on the site right now" hero panel.
 * Polls /api/admin/live-activity every 10s and renders a chronological
 * feed merging signups, sign-ins, onboarding completions, recipe views,
 * food diary entries, token transactions, and agent events.
 *
 * Filter chips on top let the operator zoom in on a single category;
 * counts shown per chip.
 */

import React from "react";
import { useHardenedPolling } from "@/hooks/useHardenedPolling";

type Category =
  | "signup"
  | "auth"
  | "onboarding"
  | "recipe"
  | "economy"
  | "agent"
  | "diary";

type Status = "success" | "failure" | "info";

interface Actor {
  userId: string;
  email: string;
  name: string | null;
  isAgent: boolean;
}

interface ActivityEvent {
  id: string;
  at: string;
  category: Category;
  type: string;
  description: string;
  status: Status;
  actor: Actor | null;
  context?: Record<string, unknown>;
}

interface ActivityPayload {
  generatedAt: string;
  windowHours: number;
  events: ActivityEvent[];
  countsByCategory: Record<Category, number>;
  live: boolean;
}

const CATEGORY_LABEL: Record<Category, string> = {
  signup: "Signups",
  auth: "Auth",
  onboarding: "Onboarding",
  recipe: "Recipe",
  economy: "Economy",
  agent: "Agent",
  diary: "Diary",
};

const CATEGORY_STYLE: Record<Category, { dot: string; chip: string; ring: string }> = {
  signup: {
    dot: "bg-emerald-500",
    chip: "bg-emerald-100 text-emerald-800 border-emerald-200",
    ring: "ring-emerald-300",
  },
  auth: {
    dot: "bg-blue-500",
    chip: "bg-blue-100 text-blue-800 border-blue-200",
    ring: "ring-blue-300",
  },
  onboarding: {
    dot: "bg-purple-500",
    chip: "bg-purple-100 text-purple-800 border-purple-200",
    ring: "ring-purple-300",
  },
  recipe: {
    dot: "bg-orange-500",
    chip: "bg-orange-100 text-orange-800 border-orange-200",
    ring: "ring-orange-300",
  },
  economy: {
    dot: "bg-amber-500",
    chip: "bg-amber-100 text-amber-900 border-amber-200",
    ring: "ring-amber-300",
  },
  agent: {
    dot: "bg-indigo-500",
    chip: "bg-indigo-100 text-indigo-800 border-indigo-200",
    ring: "ring-indigo-300",
  },
  diary: {
    dot: "bg-pink-500",
    chip: "bg-pink-100 text-pink-800 border-pink-200",
    ring: "ring-pink-300",
  },
};

const STATUS_STYLE: Record<Status, { label: string; className: string }> = {
  success: { label: "OK", className: "text-emerald-700" },
  failure: { label: "FAIL", className: "text-rose-700 font-bold" },
  info: { label: "INFO", className: "text-gray-500" },
};

function formatRelative(iso: string): string {
  const ageMs = Date.now() - new Date(iso).getTime();
  if (ageMs < 0) return "just now";
  if (ageMs < 5_000) return "just now";
  if (ageMs < 60_000) return `${Math.round(ageMs / 1000)}s`;
  if (ageMs < 3_600_000) return `${Math.round(ageMs / 60_000)}m`;
  if (ageMs < 86_400_000) return `${Math.round(ageMs / 3_600_000)}h`;
  return `${Math.round(ageMs / 86_400_000)}d`;
}

function shortHandle(actor: Actor | null): string {
  if (!actor) return "system";
  if (actor.name) return actor.name;
  const at = actor.email.indexOf("@");
  return at > 0 ? actor.email.slice(0, at) : actor.email;
}

export default function LiveActivityPanel() {
  const [data, setData] = React.useState<ActivityPayload | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [filter, setFilter] = React.useState<Category | "all">("all");

  const poll = React.useCallback(async (): Promise<{ ok: boolean }> => {
    try {
      const res = await fetch("/api/admin/live-activity", {
        cache: "no-store",
      });
      if (!res.ok) {
        setError(`Failed to load activity (HTTP ${res.status})`);
        return { ok: false };
      }
      const json = (await res.json()) as { success: boolean } & ActivityPayload;
      if (json.success) {
        setData(json);
        setError(null);
        return { ok: true };
      }
      setError("Activity payload malformed");
      return { ok: false };
    } catch (_err) {
      setError("Failed to reach admin API");
      return { ok: false };
    }
  }, []);

  // 30s cadence — this is an admin page one operator looks at; no need
  // for ticker-style refresh. Manual `Retry` covers the "I want it now" case.
  useHardenedPolling(poll, { baseIntervalMs: 30_000 });

  const filteredEvents = React.useMemo(() => {
    if (!data) return [];
    if (filter === "all") return data.events;
    return data.events.filter((e) => e.category === filter);
  }, [data, filter]);

  if (!data && !error) {
    return (
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-8 text-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-600 mx-auto mb-3" />
        <p className="text-gray-600 text-sm">Loading live activity…</p>
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="bg-white rounded-xl shadow-lg border border-rose-200 p-6">
        <p className="text-rose-700 font-medium">{error}</p>
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

  const totalEvents = data.events.length;
  const categories: Category[] = [
    "signup",
    "auth",
    "onboarding",
    "recipe",
    "economy",
    "agent",
    "diary",
  ];

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
      {/* Header */}
      <div className="px-4 sm:px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span
            className={`h-2.5 w-2.5 rounded-full ${
              data.live ? "bg-emerald-500 animate-pulse" : "bg-amber-500"
            }`}
          />
          <div>
            <h2 className="text-lg font-bold text-gray-800">Live Activity</h2>
            <p className="text-xs text-gray-500">
              {totalEvents} events in last {data.windowHours}h ·{" "}
              {data.live ? "all sources live" : "some sources degraded"}
            </p>
          </div>
        </div>
        <span className="text-[10px] font-mono text-gray-400">
          updated {formatRelative(data.generatedAt)} ago
        </span>
      </div>

      {/* Filter chips */}
      <div className="px-4 sm:px-6 py-3 border-b border-gray-100 bg-white flex flex-wrap gap-2 overflow-x-auto no-scrollbar">
        <FilterChip
          label="All"
          count={totalEvents}
          active={filter === "all"}
          onClick={() => setFilter("all")}
        />
        {categories.map((cat) => {
          const count = data.countsByCategory[cat] ?? 0;
          if (count === 0 && filter !== cat) return null;
          return (
            <FilterChip
              key={cat}
              label={CATEGORY_LABEL[cat]}
              count={count}
              active={filter === cat}
              category={cat}
              onClick={() => setFilter(filter === cat ? "all" : cat)}
            />
          );
        })}
      </div>

      {/* Stream */}
      <div className="max-h-[480px] overflow-y-auto">
        {filteredEvents.length === 0 ? (
          <div className="p-10 text-center">
            <p className="text-gray-500 text-sm">
              {totalEvents === 0
                ? `Quiet — no activity in the last ${data.windowHours}h. The next signup or sign-in will appear here.`
                : `No ${filter === "all" ? "" : `${CATEGORY_LABEL[filter]} `}events to show.`}
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-gray-100">
            {filteredEvents.map((event) => (
              <EventRow key={event.id} event={event} />
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function FilterChip({
  label,
  count,
  active,
  category,
  onClick,
}: {
  label: string;
  count: number;
  active: boolean;
  category?: Category;
  onClick: () => void;
}) {
  const style = category ? CATEGORY_STYLE[category] : null;
  const inactiveClass =
    "bg-gray-100 text-gray-700 hover:bg-gray-200 border-gray-200";
  const activeClass = style
    ? `${style.chip} ring-2 ${style.ring}`
    : "bg-gray-800 text-white border-gray-800 ring-2 ring-gray-400";
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-3 py-1 rounded-full text-xs font-medium border transition-all ${
        active ? activeClass : inactiveClass
      }`}
    >
      {category && (
        <span className={`inline-block h-1.5 w-1.5 rounded-full ${CATEGORY_STYLE[category].dot} mr-1.5 align-middle`} />
      )}
      {label}{" "}
      <span className="font-mono opacity-70">{count}</span>
    </button>
  );
}

function EventRow({ event }: { event: ActivityEvent }) {
  const catStyle = CATEGORY_STYLE[event.category];
  const statusStyle = STATUS_STYLE[event.status];
  const actor = event.actor;
  return (
    <li className="px-4 sm:px-6 py-3 hover:bg-gray-50">
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 mt-1.5">
          <span className={`block h-2 w-2 rounded-full ${catStyle.dot}`} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-2 flex-wrap">
            <span
              className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider border ${catStyle.chip}`}
            >
              {CATEGORY_LABEL[event.category]}
            </span>
            {actor ? (
              <span className="flex items-baseline gap-1">
                <span className="text-sm font-medium text-gray-900">
                  {shortHandle(actor)}
                </span>
                {actor.isAgent && (
                  <span className="px-1 py-0.5 rounded text-[8px] font-bold bg-purple-100 text-purple-700">
                    AGENT
                  </span>
                )}
              </span>
            ) : (
              <span className="text-sm text-gray-500 italic">system</span>
            )}
            <span className="text-sm text-gray-700">{event.description}</span>
            {event.status !== "success" && (
              <span className={`text-[10px] font-mono ${statusStyle.className}`}>
                {statusStyle.label}
              </span>
            )}
          </div>
          {actor?.email && (
            <p className="text-[10px] text-gray-400 font-mono mt-0.5 truncate">
              {actor.email} · {event.type}
            </p>
          )}
        </div>
        <span
          className="flex-shrink-0 text-[10px] text-gray-400 font-mono"
          title={new Date(event.at).toLocaleString()}
        >
          {formatRelative(event.at)} ago
        </span>
      </div>
    </li>
  );
}
