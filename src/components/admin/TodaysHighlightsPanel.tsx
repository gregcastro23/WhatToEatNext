"use client";

/**
 * Today's Highlights Panel
 *
 * Compact tile grid for the top of /admin. Each tile shows a single
 * 24h count + delta vs the prior 24h. Designed so the operator can
 * glance once and see whether anything meaningful happened today.
 *
 * Polls /api/admin/todays-highlights every 60s. At the early stage
 * (few users) every delta matters, so even +1 / -1 changes render with
 * a colored chip.
 */

import React from "react";
import { useHardenedPolling } from "@/hooks/useHardenedPolling";

interface HighlightMetric {
  id: string;
  label: string;
  today: number;
  yesterday: number | null;
  delta: number | null;
  hint?: string;
  live: boolean;
  goodWhenIncreasing: boolean;
}

interface TodaysHighlightsPayload {
  generatedAt: string;
  metrics: HighlightMetric[];
  live: boolean;
}

function formatRelative(iso: string): string {
  const ageMs = Date.now() - new Date(iso).getTime();
  if (ageMs < 60_000) return `${Math.round(ageMs / 1000)}s ago`;
  if (ageMs < 3_600_000) return `${Math.round(ageMs / 60_000)}m ago`;
  return `${Math.round(ageMs / 3_600_000)}h ago`;
}

/**
 * Resolve the delta tone:
 *   - "neutral" → no change or no comparison data
 *   - "good"    → moved in the desired direction
 *   - "bad"     → moved against the desired direction
 */
function deltaTone(metric: HighlightMetric): "neutral" | "good" | "bad" {
  if (metric.delta === null || metric.delta === 0) return "neutral";
  const increased = metric.delta > 0;
  if (metric.goodWhenIncreasing) {
    return increased ? "good" : "bad";
  }
  return increased ? "bad" : "good";
}

function deltaText(delta: number | null): string {
  if (delta === null) return "—";
  if (delta === 0) return "no change";
  const sign = delta > 0 ? "+" : "";
  return `${sign}${delta} vs yesterday`;
}

export default function TodaysHighlightsPanel() {
  const [data, setData] = React.useState<TodaysHighlightsPayload | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  const poll = React.useCallback(async (): Promise<{ ok: boolean }> => {
    try {
      const res = await fetch("/api/admin/todays-highlights", {
        cache: "no-store",
      });
      if (!res.ok) {
        setError(`HTTP ${res.status}`);
        return { ok: false };
      }
      const json = (await res.json()) as { success: boolean } & TodaysHighlightsPayload;
      if (json.success) {
        setData(json);
        setError(null);
        return { ok: true };
      }
      setError("payload malformed");
      return { ok: false };
    } catch (_err) {
      setError("offline");
      return { ok: false };
    }
  }, []);

  // 5 min cadence. Day-over-day counts barely move minute-to-minute;
  // refresh page or click Retry for an immediate snapshot.
  useHardenedPolling(poll, { baseIntervalMs: 300_000 });

  if (!data && !error) {
    return (
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-2" />
        <p className="text-gray-500 text-xs">Loading today&apos;s highlights…</p>
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="bg-white rounded-xl shadow-lg border border-rose-200 p-4">
        <p className="text-rose-700 text-sm">Highlights failed: {error}</p>
        <button
          type="button"
          onClick={() => void poll()}
          className="mt-2 px-3 py-1 bg-rose-600 text-white rounded text-xs hover:bg-rose-700"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
      <div className="px-4 sm:px-6 py-3 border-b border-gray-100 flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-lg font-bold text-gray-800">Today</h2>
        <span className="text-[10px] text-gray-400 font-mono">
          24h vs prior 24h · updated {formatRelative(data.generatedAt)}
        </span>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-8">
        {data.metrics.map((metric) => (
          <MetricTile key={metric.id} metric={metric} />
        ))}
      </div>
    </div>
  );
}

function MetricTile({ metric }: { metric: HighlightMetric }) {
  const tone = deltaTone(metric);
  const deltaClass =
    tone === "good"
      ? "text-emerald-700"
      : tone === "bad"
        ? "text-rose-700"
        : "text-gray-400";
  return (
    <div
      className="p-4 border-r border-b border-gray-100 last:border-r-0 hover:bg-gray-50"
      title={metric.hint}
    >
      <div className="text-[10px] font-semibold uppercase tracking-wider text-gray-500">
        {metric.label}
      </div>
      <div className="text-3xl font-bold text-gray-900 font-mono mt-1 leading-none">
        {metric.live ? metric.today : "—"}
      </div>
      <div className={`text-[10px] font-mono mt-1 ${deltaClass}`}>
        {metric.live ? deltaText(metric.delta) : "source offline"}
      </div>
    </div>
  );
}
