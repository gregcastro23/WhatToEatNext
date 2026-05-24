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
import { useHardenedPolling } from "@/hooks/useHardenedPolling";

interface FlowMetric {
  label: string;
  value: string;
  raw?: number;
}

interface FlowIssue {
  at: string;
  message: string;
  severity: "warn" | "error";
}

type FlowStatus = "OK" | "DEGRADED" | "INCIDENT" | "UNKNOWN";

interface FlowHealth {
  id: string;
  label: string;
  description: string;
  status: FlowStatus;
  summary: string;
  metrics: FlowMetric[];
  issues: FlowIssue[];
  checkedAt: string;
  live: boolean;
}

interface DependencyHealth {
  id: string;
  label: string;
  status: FlowStatus;
  summary: string;
  latencyMs: number | null;
  checkedAt: string;
}

interface SystemStatusPayload {
  generatedAt: string;
  overall: FlowStatus;
  flows: FlowHealth[];
  dependencies: DependencyHealth[];
}

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
  if (ageMs < 0) return "just now";
  if (ageMs < 60_000) return `${Math.round(ageMs / 1000)}s ago`;
  if (ageMs < 3_600_000) return `${Math.round(ageMs / 60_000)}m ago`;
  if (ageMs < 86_400_000) return `${Math.round(ageMs / 3_600_000)}h ago`;
  return `${Math.round(ageMs / 86_400_000)}d ago`;
}

export default function SystemStatusPanel() {
  const [data, setData] = React.useState<SystemStatusPayload | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [expandedFlow, setExpandedFlow] = React.useState<string | null>(null);

  const poll = React.useCallback(async (): Promise<{ ok: boolean }> => {
    try {
      const res = await fetch("/api/admin/system-status", {
        cache: "no-store",
      });
      if (!res.ok) {
        setError(`Failed to load status (HTTP ${res.status})`);
        return { ok: false };
      }
      const json = (await res.json()) as { success: boolean } & SystemStatusPayload;
      if (json.success) {
        setData(json);
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

  const overallStyle = STATUS_STYLE[data.overall];

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
      {/* Banner */}
      <div
        className={`px-6 py-4 flex items-center justify-between border-b ${overallStyle.border}`}
      >
        <div className="flex items-center gap-3">
          <span
            className={`h-3 w-3 rounded-full ${overallStyle.dot} ${
              data.overall === "OK" ? "animate-pulse" : ""
            }`}
          />
          <div>
            <h2 className="text-lg font-bold text-gray-800">System Status</h2>
            <p className="text-xs text-gray-500">
              {data.flows.length} flows · {data.dependencies.length} dependencies ·
              updated {formatRelative(data.generatedAt)}
            </p>
          </div>
        </div>
        <span
          className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${overallStyle.pill}`}
        >
          {overallStyle.label}
        </span>
      </div>

      {/* Flow grid */}
      <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {data.flows.map((flow) => (
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

      {/* Dependency strip */}
      <div className="px-6 py-4 border-t border-gray-100 bg-gray-50">
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
        expanded ? "ring-2 ring-purple-300 col-span-2" : ""
      }`}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className={`h-2.5 w-2.5 rounded-full ${style.dot}`} />
          <h4 className="text-sm font-bold text-gray-800">{flow.label}</h4>
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
