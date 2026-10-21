"use client";

/**
 * System Status Panel
 *
 * Operator-grade health surface for /admin. Polls /api/admin/system-status
 * every 15s with visibility-aware error backoff. Renders:
 *
 *   1. Overall status banner (worst across all flows + dependencies)
 *   2. Grid of flow tiles — auth, onboarding, recipes, AI, economy,
 *      payments, agents, database. Each tile shows status pill, summary,
 *      key metrics, and recent issues (expandable).
 *   3. External dependency strip (PA, Stripe, Google OAuth)
 *
 * Color semantics:
 *   - emerald · OK         healthy, live
 *   - amber   · DEGRADED   working but elevated errors/latency
 *   - rose    · INCIDENT   broken — operator should act
 *   - gray    · UNKNOWN    source unavailable, can't say
 */

import React from "react";
import { EmptyState } from "@/components/admin/kit/EmptyState";
import { combine, fromLiveFlag } from "@/components/admin/kit/provenance";
import { ProvenanceBadge } from "@/components/admin/kit/ProvenanceBadge";
import { useHardenedPolling } from "@/hooks/useHardenedPolling";
import { SystemStatusResponseSchema, type SystemStatusView } from "@/lib/admin/schemas/systemStatus";

type SystemStatusPayload = SystemStatusView;
type FlowStatus = SystemStatusView["overall"];
type FlowHealth = SystemStatusView["flows"][number];
type DependencyHealth = SystemStatusView["dependencies"][number];

const STATUS_STYLE: Record<
  FlowStatus,
  { dot: string; pill: string; border: string; label: string }
> = {
  OK: {
    dot: "bg-emerald-500",
    pill: "bg-emerald-100 text-emerald-800 border-emerald-200",
    border: "border-emerald-200",
    label: "OK",
  },
  DEGRADED: {
    dot: "bg-amber-500",
    pill: "bg-amber-100 text-amber-900 border-amber-200",
    border: "border-amber-200",
    label: "DEGRADED",
  },
  INCIDENT: {
    dot: "bg-rose-500",
    pill: "bg-rose-100 text-rose-900 border-rose-300",
    border: "border-rose-300",
    label: "INCIDENT",
  },
  UNKNOWN: {
    dot: "bg-gray-400",
    pill: "bg-gray-100 text-gray-700 border-gray-200",
    border: "border-gray-200",
    label: "UNKNOWN",
  },
};

function formatRelative(iso: string): string {
  const ageMs = Date.now() - new Date(iso).getTime();
  if (ageMs < 5_000) return "just now";
  if (ageMs < 60_000) return `${Math.round(ageMs / 1000)}s ago`;
  if (ageMs < 3_600_000) return `${Math.round(ageMs / 60_000)}m ago`;
  if (ageMs < 86_400_000) return `${Math.round(ageMs / 3_600_000)}h ago`;
  return `${Math.round(ageMs / 86_400_000)}d ago`;
}

const CORE_FLOW_IDS = new Set(["auth", "database", "recommendations", "onboarding"]);

export default function SystemStatusPanel(): React.JSX.Element | null {
  const [data, setData] = React.useState<SystemStatusPayload | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [expandedFlow, setExpandedFlow] = React.useState<string | null>(null);
  const [snoozeUntil, setSnoozeUntil] = React.useState<number | null>(null);

  React.useEffect(() => {
    try {
      const stored = localStorage.getItem("admin_incident_snooze_until");
      if (stored) {
        const until = parseInt(stored, 10);
        if (until > Date.now()) {
          setSnoozeUntil(until);
        } else {
          localStorage.removeItem("admin_incident_snooze_until");
        }
      }
    } catch {
      // localStorage may fail in restricted/iframe environments
    }
  }, []);

  const handleToggleSnooze = () => {
    try {
      if (snoozeUntil && snoozeUntil > Date.now()) {
        localStorage.removeItem("admin_incident_snooze_until");
        setSnoozeUntil(null);
      } else {
        const nextUntil = Date.now() + 60 * 60 * 1000; // 1 hour
        localStorage.setItem("admin_incident_snooze_until", nextUntil.toString());
        setSnoozeUntil(nextUntil);
      }
    } catch {
      // ignore
    }
  };

  const isSnoozed = Boolean(snoozeUntil && snoozeUntil > Date.now());
  const snoozeMinutesLeft = snoozeUntil
    ? Math.max(1, Math.round((snoozeUntil - Date.now()) / 60000))
    : 0;

  const poll = React.useCallback(async (): Promise<{ ok: boolean }> => {
    try {
      const res = await fetch("/api/admin/system-status", {
        cache: "no-store",
      });
      if (!res.ok) {
        setError(`Failed to load status (HTTP ${res.status})`);
        return { ok: false };
      }
      const parsed = SystemStatusResponseSchema.safeParse(await res.json());
      if (parsed.success) {
        setData(parsed.data);
        setError(null);
        return { ok: true };
      }
      setError("Status payload malformed");
      return { ok: false };
    } catch (_err) {
      setError("Failed to reach admin API");
      return { ok: false };
    }
  }, []);

  // 60s cadence. At a 10-user product, status changes slowly enough that
  // tighter polling just wastes DB cycles. Operator can click Retry to
  // force a refresh after a deploy.
  useHardenedPolling(poll, { baseIntervalMs: 60_000 });

  if (!data && !error) {
    return (
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-8 text-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-600 mx-auto mb-3" />
        <p className="text-gray-600 text-sm">Loading system status…</p>
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
        <EmptyState
          kind="cannot-read"
          title="Could not load system status"
          description={error}
          action={
            <button
              type="button"
              onClick={() => {
                void poll();
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

  const isIncident = data.overall === "INCIDENT";
  const displayStatus = isSnoozed && isIncident ? "DEGRADED" : data.overall;
  const overallStyle = STATUS_STYLE[displayStatus];
  const overallProv = combine(data.flows.map((f) => fromLiveFlag(f.live)));

  const coreFlows = data.flows.filter((f) => CORE_FLOW_IDS.has(f.id));
  const asyncFlows = data.flows.filter((f) => !CORE_FLOW_IDS.has(f.id));

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
      {/* Banner */}
      <div
        className={`px-4 sm:px-6 py-4 flex items-center justify-between gap-3 border-b ${overallStyle.border}`}
      >
        <div className="flex items-center gap-3">
          <span
            className={`h-3 w-3 rounded-full ${overallStyle.dot} ${
              data.overall === "OK" ? "animate-pulse" : ""
            }`}
          />
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-gray-800">System Status</h2>
              <ProvenanceBadge provenance={overallProv} />
            </div>
            <p className="text-xs text-gray-500 mt-0.5">
              {data.flows.length} flows · {data.dependencies.length} dependencies ·
              updated {formatRelative(data.generatedAt)}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap justify-end">
          {data.coreOverall && (
            <span
              title="Core customer paths: auth, database, recommendations, onboarding"
              className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${STATUS_STYLE[data.coreOverall].pill}`}
            >
              Core: {data.coreOverall}
            </span>
          )}
          {data.asyncOverall && (
            <span
              title="Async background services: agents, economy, crons, probes"
              className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${STATUS_STYLE[data.asyncOverall].pill}`}
            >
              Async: {data.asyncOverall}
            </span>
          )}
          {isSnoozed ? (
            <button
              type="button"
              onClick={handleToggleSnooze}
              className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-900 border border-amber-300 hover:bg-amber-200 transition"
              title="Click to clear incident snooze"
            >
              Snoozed ({snoozeMinutesLeft}m) ✕
            </button>
          ) : (
            isIncident && (
              <button
                type="button"
                onClick={handleToggleSnooze}
                className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-50 text-rose-800 border border-rose-300 hover:bg-rose-100 transition"
                title="Acknowledge incident and snooze alerts for 1 hour"
              >
                Snooze Incident (1h)
              </button>
            )
          )}
          <span
            className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${overallStyle.pill}`}
          >
            {isSnoozed && isIncident ? "SNOOZED" : overallStyle.label}
          </span>
        </div>
      </div>

      {/* Core User Path */}
      <div className="px-4 sm:px-6 pt-5 pb-2">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500">
            Core User Path (Customer Facing)
          </h3>
          {data.coreOverall && (
            <span
              className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${STATUS_STYLE[data.coreOverall].pill}`}
            >
              {data.coreOverall}
            </span>
          )}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {coreFlows.map((flow) => (
            <FlowTile
              key={flow.id}
              flow={flow}
              expanded={expandedFlow === flow.id}
              onToggle={() =>
                setExpandedFlow((curr) => (curr === flow.id ? null : flow.id))
              }
            />
          ))}
        </div>
      </div>

      {/* Async & Background Services */}
      <div className="px-4 sm:px-6 pt-5 pb-5 border-t border-gray-100">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500">
            Async & Background Services
          </h3>
          {data.asyncOverall && (
            <span
              className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${STATUS_STYLE[data.asyncOverall].pill}`}
            >
              {data.asyncOverall}
            </span>
          )}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {asyncFlows.map((flow) => (
            <FlowTile
              key={flow.id}
              flow={flow}
              expanded={expandedFlow === flow.id}
              onToggle={() =>
                setExpandedFlow((curr) => (curr === flow.id ? null : flow.id))
              }
            />
          ))}
        </div>
      </div>

      {/* Dependency strip */}
      <div className="px-4 sm:px-6 py-4 border-t border-gray-100 bg-gray-50">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-3">
          External Dependencies
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {data.dependencies.map((dep) => (
            <DependencyTile key={dep.id} dep={dep} />
          ))}
        </div>
      </div>
    </div>
  );
}

function FlowTile({
  flow,
  expanded,
  onToggle,
}: {
  flow: FlowHealth;
  expanded: boolean;
  onToggle: () => void;
}) {
  const style = STATUS_STYLE[flow.status];
  return (
    <button
      type="button"
      onClick={onToggle}
      className={`text-left p-4 rounded-lg border-2 transition-all hover:shadow-md ${style.border} ${
        expanded ? "ring-2 ring-purple-300 sm:col-span-2" : ""
      }`}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className={`h-2.5 w-2.5 rounded-full ${style.dot}`} />
          <h4 className="text-sm font-bold text-gray-800">{flow.label}</h4>
          <ProvenanceBadge provenance={fromLiveFlag(flow.live)} compact />
        </div>
        <span
          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${style.pill}`}
        >
          {style.label}
        </span>
      </div>
      <p className="text-xs text-gray-600 mb-3 line-clamp-2">{flow.summary}</p>
      <div className="grid grid-cols-2 gap-2">
        {flow.metrics.slice(0, expanded ? flow.metrics.length : 2).map((m) => (
          <div key={m.label} className="text-xs">
            <div className="text-gray-500 uppercase tracking-wide text-[9px] font-semibold">
              {m.label}
            </div>
            <div className="text-gray-800 font-mono font-semibold">
              {m.value}
            </div>
          </div>
        ))}
      </div>
      {expanded && (
        <>
          <p className="text-xs text-gray-500 mt-3 italic">{flow.description}</p>
          {flow.issues.length > 0 ? (
            <div className="mt-3">
              <div className="text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-1.5">
                Recent issues
              </div>
              <ul className="space-y-1.5">
                {flow.issues.map((issue, i) => (
                  <li
                    key={`${issue.at}-${i}`}
                    className={`text-xs p-2 rounded font-mono ${
                      issue.severity === "error"
                        ? "bg-rose-50 text-rose-900"
                        : "bg-amber-50 text-amber-900"
                    }`}
                  >
                    <span className="text-gray-500 mr-2">
                      {formatRelative(issue.at)}
                    </span>
                    {issue.message}
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <p className="text-xs text-emerald-700 mt-3 font-medium">
              No recent issues.
            </p>
          )}
          <p className="text-[10px] text-gray-400 mt-3 font-mono">
            checked {formatRelative(flow.checkedAt)}
            {!flow.live && " · degraded source"}
          </p>
        </>
      )}
    </button>
  );
}

function DependencyTile({ dep }: { dep: DependencyHealth }) {
  const style = STATUS_STYLE[dep.status];
  return (
    <div className={`p-3 rounded-lg border ${style.border} bg-white`}>
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-2">
          <span className={`h-2 w-2 rounded-full ${style.dot}`} />
          <span className="text-sm font-semibold text-gray-800">{dep.label}</span>
        </div>
        <span
          className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider border ${style.pill}`}
        >
          {style.label}
        </span>
      </div>
      <p className="text-xs text-gray-600">{dep.summary}</p>
      {dep.latencyMs !== null && (
        <p className="text-[10px] text-gray-500 font-mono mt-1">
          {Math.round(dep.latencyMs)}ms · {formatRelative(dep.checkedAt)}
        </p>
      )}
    </div>
  );
}
