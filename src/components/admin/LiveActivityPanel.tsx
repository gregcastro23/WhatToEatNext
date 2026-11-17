"use client";

/**
 * Live Activity Panel
 *
 * The "what's actually happening on the site right now" hero panel.
 * Polls /api/admin/live-activity every 30s and renders a chronological
 * feed merging site visits, signups, sign-ins, onboarding completions,
 * recipe views, food diary entries, token transactions, and agent events.
 *
 * Defaults to "Humans" audience mode so automated planetary-agent noise
 * never buries real human visitors, and renders rich inline journey trails
 * for visit sessions.
 */

import Link from "next/link";
import React from "react";
import { EmptyState } from "@/components/admin/kit/EmptyState";
import { fromLiveFlag } from "@/components/admin/kit/provenance";
import { ProvenanceBadge } from "@/components/admin/kit/ProvenanceBadge";
import { useHardenedPolling } from "@/hooks/useHardenedPolling";
import { readJson } from "@/lib/api/json";
import {
  LiveActivityResponseSchema,
  type LiveActivityPayload as ActivityPayload,
  type LiveActivityEvent as ActivityEvent,
} from "@/lib/validation/adminResponseSchemas";
import type {
  ActivityCategory as Category,
  ActivityStatus as Status,
  ActivityActor as Actor,
} from "@/services/liveActivityService";

type AudienceFilter = "humans" | "all" | "agents";

const CATEGORY_LABEL: Record<Category, string> = {
  visit: "Visits",
  signup: "Signups",
  auth: "Auth",
  onboarding: "Onboarding",
  recipe: "Recipe",
  diary: "Diary",
  economy: "Economy",
  agent: "Agent",
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
  visit: {
    dot: "bg-teal-500",
    chip: "bg-teal-100 text-teal-800 border-teal-200",
    ring: "ring-teal-300",
  },
};

const STATUS_STYLE: Record<Status, { label: string; className: string }> = {
  success: { label: "OK", className: "text-emerald-700" },
  failure: { label: "FAIL", className: "text-rose-700 font-bold" },
  info: { label: "INFO", className: "text-gray-500" },
};

function formatRelative(iso: string): string {
  const ageMs = Date.now() - new Date(iso).getTime();
  if (ageMs < 5_000) return "just now";
  if (ageMs < 60_000) return `${Math.round(ageMs / 1000)}s ago`;
  if (ageMs < 3_600_000) return `${Math.round(ageMs / 60_000)}m ago`;
  if (ageMs < 86_400_000) return `${Math.round(ageMs / 3_600_000)}h ago`;
  return `${Math.round(ageMs / 86_400_000)}d ago`;
}

function fmtDuration(ms: unknown): string | null {
  if (typeof ms !== "number" || !Number.isFinite(ms) || ms < 1_000) return null;
  const sec = Math.round(ms / 1_000);
  if (sec < 60) return `${sec}s`;
  const min = Math.floor(sec / 60);
  const rem = sec % 60;
  return rem > 0 ? `${min}m ${rem}s` : `${min}m`;
}

function isHumanEvent(e: ActivityEvent): boolean {
  if (e.category === "visit") return true;
  if (e.category === "agent") return false;
  return e.actor?.isAgent !== true;
}

function shortHandle(actor: Actor | null, event: ActivityEvent): string {
  if (!actor) {
    if (event.category === "visit") {
      const sv = event.context?.shortVisitor;
      return typeof sv === "string" && sv.length > 0 ? `Visitor #${sv}` : "Visitor";
    }
    return "system";
  }
  if (actor.name) return actor.name;
  const at = actor.email.indexOf("@");
  return at > 0 ? actor.email.slice(0, at) : actor.email;
}

export type AdminStreamConnectionState = "live_stream" | "polling_fallback" | "paused";

const STREAM_PILL_STYLE: Record<AdminStreamConnectionState, { cls: string; label: string }> = {
  live_stream: { cls: "bg-emerald-50 text-emerald-800 border-emerald-200", label: "● Live SSE (12s)" },
  polling_fallback: { cls: "bg-amber-50 text-amber-800 border-amber-200", label: "↻ Polling (15s)" },
  paused: { cls: "bg-slate-100 text-slate-600 border-slate-200", label: "⏸ Paused (Tab Hidden)" },
};

export function AdminStreamStatusPill({ state }: { state: AdminStreamConnectionState }): React.JSX.Element {
  const cfg = STREAM_PILL_STYLE[state];
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full border font-mono text-[11px] font-semibold ${cfg.cls}`}>
      {cfg.label}
    </span>
  );
}

export default function LiveActivityPanel({
  externalData,
  externalError,
  newEventIds,
}: {
  externalData?: ActivityPayload | null;
  externalError?: string | null;
  newEventIds?: ReadonlySet<string>;
} = {}): React.JSX.Element | null {
  const standalone = externalData === undefined;
  const [polledData, setPolledData] = React.useState<ActivityPayload | null>(null);
  const [polledError, setPolledError] = React.useState<string | null>(null);
  const data = standalone ? polledData : externalData;
  const error = standalone ? polledError : (externalError ?? null);
  const [filter, setFilter] = React.useState<Category | "all">("all");
  const [audience, setAudience] = React.useState<AudienceFilter>("humans");

  const poll = React.useCallback(async (): Promise<{ ok: boolean }> => {
    try {
      const res = await fetch("/api/admin/live-activity", {
        cache: "no-store",
      });
      if (!res.ok) {
        setPolledError(`Failed to load activity (HTTP ${res.status})`);
        return { ok: false };
      }
      const json = await readJson(res, {
        parse: (raw) => LiveActivityResponseSchema.parse(raw),
      });
      if (json.success) {
        setPolledData(json);
        setPolledError(null);
        return { ok: true };
      }
      setPolledError("Activity payload malformed");
      return { ok: false };
    } catch (_err) {
      setPolledError("Failed to reach admin API");
      return { ok: false };
    }
  }, []);

  useHardenedPolling(poll, { baseIntervalMs: 30_000, enabled: standalone });

  const audienceEvents = React.useMemo(() => {
    if (!data) return [];
    if (audience === "all") return data.events;
    if (audience === "humans") return data.events.filter(isHumanEvent);
    return data.events.filter((e) => !isHumanEvent(e));
  }, [data, audience]);

  const countsForAudience = React.useMemo(() => {
    const counts: Record<Category, number> = {
      visit: 0,
      signup: 0,
      auth: 0,
      onboarding: 0,
      recipe: 0,
      diary: 0,
      economy: 0,
      agent: 0,
    };
    for (const e of audienceEvents) {
      counts[e.category] += 1;
    }
    return counts;
  }, [audienceEvents]);

  const filteredEvents = React.useMemo(() => {
    if (filter === "all") return audienceEvents;
    return audienceEvents.filter((e) => e.category === filter);
  }, [audienceEvents, filter]);

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
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
        <EmptyState
          kind="cannot-read"
          title="Could not load live activity"
          description={error}
          action={
            <button
              type="button"
              onClick={() => {
                poll().catch(() => undefined);
              }}
              className="px-3 py-1.5 bg-rose-600 text-white font-bold rounded text-xs hover:bg-rose-700 transition"
            >
              Retry
            </button>
          }
        />
      </div>
    );
  }

  if (!data) return null;

  const totalEvents = data.events.length;
  const humanCount = data.events.filter(isHumanEvent).length;
  const agentCount = totalEvents - humanCount;
  const categories: Category[] = [
    "visit",
    "signup",
    "auth",
    "onboarding",
    "recipe",
    "diary",
    "economy",
    "agent",
  ];

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
      {/* Header */}
      <div className="px-4 sm:px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-lg font-bold text-gray-800">Live Activity</h2>
            <ProvenanceBadge provenance={fromLiveFlag(data.live)} />
          </div>
          <p className="text-xs text-gray-500 mt-0.5">
            {humanCount} human · {agentCount} agent events in last {data.windowHours}h ·{" "}
            {data.live ? "all sources live" : "some sources degraded"}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex rounded-lg border border-gray-200 bg-gray-100 p-0.5" role="group" aria-label="Audience filter">
            {(
              [
                { id: "humans", label: `Humans (${humanCount})` },
                { id: "all", label: `All (${totalEvents})` },
                { id: "agents", label: `Agents (${agentCount})` },
              ] as const
            ).map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => {
                  setAudience(opt.id);
                  if (opt.id === "humans" && filter === "agent") setFilter("all");
                }}
                className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-colors ${
                  audience === opt.id
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
          <Link
            href="/admin/traffic"
            className="px-2.5 py-1 rounded-md border border-teal-200 bg-teal-50 text-teal-800 hover:bg-teal-100 text-xs font-semibold transition-colors"
          >
            Visitor Journeys →
          </Link>
          <span className="text-[10px] font-mono text-gray-400">
            updated {formatRelative(data.generatedAt)}
          </span>
        </div>
      </div>

      {/* Filter chips */}
      <div className="px-4 sm:px-6 py-3 border-b border-gray-100 bg-white flex flex-wrap gap-2 overflow-x-auto no-scrollbar">
        <FilterChip
          label="All"
          count={audienceEvents.length}
          active={filter === "all"}
          onClick={() => setFilter("all")}
        />
        {categories.map((cat) => {
          const count = countsForAudience[cat];
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
          <div className="p-6">
            <EmptyState
              kind={totalEvents === 0 ? "never-used" : "all-clear"}
              title={
                totalEvents === 0
                  ? "No activity in window"
                  : audience === "humans" && humanCount === 0
                    ? "No human activity in window"
                    : `No ${filter === "all" ? "" : `${CATEGORY_LABEL[filter]} `}events`
              }
              description={
                totalEvents === 0
                  ? `Quiet — no activity in the last ${data.windowHours}h. The next visit, signup, or sign-in will appear here.`
                  : audience === "humans" && humanCount === 0
                    ? `No human visits or actions in the last ${data.windowHours}h (${agentCount} background agent events hidden).`
                    : `No ${filter === "all" ? "" : `${CATEGORY_LABEL[filter]} `}events found in this filter.`
              }
              action={
                audience === "humans" && humanCount === 0 && agentCount > 0 ? (
                  <button
                    type="button"
                    onClick={() => setAudience("all")}
                    className="px-3 py-1.5 bg-gray-800 text-white font-semibold rounded text-xs hover:bg-gray-700 transition"
                  >
                    Show {agentCount} Agent Events
                  </button>
                ) : undefined
              }
            />
          </div>
        ) : (
          <ul className="divide-y divide-gray-100">
            {filteredEvents.map((event) => (
              <EventRow key={event.id} event={event} isNew={newEventIds?.has(event.id) ?? false} />
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
}): React.JSX.Element {
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

function visitSessionHref(event: ActivityEvent): string {
  const sessionKey =
    typeof event.context?.sessionKey === "string"
      ? event.context.sessionKey
      : event.id.startsWith("visit:")
        ? event.id.slice("visit:".length)
        : "";
  return sessionKey
    ? `/admin/traffic?session=${encodeURIComponent(sessionKey)}`
    : "/admin/traffic";
}

function ActorBadge({ event }: { event: ActivityEvent }): React.JSX.Element {
  const { actor } = event;
  const label = shortHandle(actor, event);
  if (!actor) {
    if (event.category === "visit") {
      return (
        <Link
          href={visitSessionHref(event)}
          title="Open and expand this visitor's session journey in /admin/traffic"
          className="px-1.5 py-0.5 rounded bg-slate-100 hover:bg-teal-50 text-slate-800 hover:text-teal-800 font-mono text-xs font-semibold transition-colors"
        >
          {label}
        </Link>
      );
    }
    return <span className="text-sm text-gray-500 italic">system</span>;
  }
  return (
    <span className="flex items-baseline gap-1">
      {actor.userId ? (
        <Link href={`/admin/users/${actor.userId}`} className="text-sm font-medium text-indigo-700 hover:underline">
          {label}
        </Link>
      ) : (
        <span className="text-sm font-medium text-gray-900">{label}</span>
      )}
      {actor.isAgent && (
        <span className="px-1 py-0.5 rounded text-[8px] font-bold bg-purple-100 text-purple-700">
          AGENT
        </span>
      )}
    </span>
  );
}

function VisitContextStrip({ event }: { event: ActivityEvent }): React.JSX.Element | null {
  const { context } = event;
  if (!context) return null;
  const paths = Array.isArray(context.paths) ? context.paths.filter((p): p is string => typeof p === "string") : [];
  const device = typeof context.device === "string" ? context.device : null;
  const duration = fmtDuration(context.durationMs);
  const refTag = typeof context.refTag === "string" ? context.refTag : null;
  const href = visitSessionHref(event);

  if (paths.length === 0 && !device && !duration && !refTag) return null;

  return (
    <div className="mt-1.5 flex flex-wrap items-center gap-1.5 text-[11px]">
      {paths.slice(0, 5).map((p, idx) => (
        <React.Fragment key={`${p}-${idx}`}>
          {idx > 0 && <span className="text-gray-400">→</span>}
          <Link
            href={href}
            title="Click to inspect this visitor's full journey"
            className="px-1.5 py-0.5 rounded bg-gray-100 hover:bg-teal-50 font-mono text-gray-800 hover:text-teal-800 transition-colors"
          >
            {p}
          </Link>
        </React.Fragment>
      ))}
      {paths.length > 5 && (
        <span className="font-mono text-gray-500">+{paths.length - 5} more</span>
      )}
      {duration && (
        <span className="px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 font-mono font-semibold">
          ⏱ {duration}
        </span>
      )}
      {refTag && (
        <>
          <span className="px-1.5 py-0.5 rounded bg-amber-100 border border-amber-300 text-amber-900 font-mono text-[10px] font-bold">
            ★ ACTIVE REVIEWER
          </span>
          <Link
            href={`/admin/traffic?ref=${encodeURIComponent(refTag)}`}
            className="px-1.5 py-0.5 rounded bg-purple-100 hover:bg-purple-200 text-purple-800 font-mono font-semibold transition-colors"
          >
            ref:{refTag}
          </Link>
        </>
      )}
      {device && (
        <span className="text-gray-400 font-mono">· {device}</span>
      )}
      <Link
        href={href}
        className="ml-auto text-[10px] font-semibold text-teal-700 hover:underline font-mono"
      >
        Open Journey →
      </Link>
    </div>
  );
}

function EventRow({ event, isNew = false }: { event: ActivityEvent; isNew?: boolean }): React.JSX.Element {
  const catStyle = CATEGORY_STYLE[event.category];
  const statusStyle = STATUS_STYLE[event.status];
  const isTrackedReviewer =
    event.category === "visit" && typeof event.context?.refTag === "string" && event.context.refTag.length > 0;
  const rowBg = isNew
    ? "bg-emerald-50/70 ring-1 ring-inset ring-emerald-200 transition-colors duration-700"
    : isTrackedReviewer
      ? "bg-purple-50/40 hover:bg-purple-50/70"
      : "hover:bg-gray-50";
  return (
    <li className={`px-4 sm:px-6 py-3 ${rowBg}`}>
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 mt-1.5">
          <span className={`block h-2 w-2 rounded-full ${catStyle.dot}`} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-2 flex-wrap">
            {isNew && (
              <span className="px-1.5 py-0.5 rounded bg-emerald-600 text-white font-mono text-[9px] font-bold">
                NEW
              </span>
            )}
            <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider border ${catStyle.chip}`}>
              {CATEGORY_LABEL[event.category]}
            </span>
            <ActorBadge event={event} />
            <span className="text-sm text-gray-700">{event.description}</span>
            {event.status !== "success" && event.status !== "info" && (
              <span className={`text-[10px] font-mono ${statusStyle.className}`}>
                {statusStyle.label}
              </span>
            )}
          </div>
          {event.category === "visit" && <VisitContextStrip event={event} />}
          {event.actor?.email && (
            <p className="text-[10px] text-gray-400 font-mono mt-0.5 truncate">
              {event.actor.email} · {event.type}
            </p>
          )}
        </div>
        <span className="flex-shrink-0 text-[10px] text-gray-400 font-mono" title={new Date(event.at).toLocaleString()}>
          {formatRelative(event.at)}
        </span>
      </div>
    </li>
  );
}
