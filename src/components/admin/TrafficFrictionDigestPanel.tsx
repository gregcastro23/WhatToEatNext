"use client";

/**
 * AI Daily Traffic & Friction Digest Executive Card for /admin.
 *
 * Synthesizes top routes, rage/dead-click & CWV friction alerts,
 * `fast_start_cta` A/B variant lift, and open user feedback into a compact
 * operator brief with honest Admin Kit provenance and manual re-synthesis.
 *
 * @file src/components/admin/TrafficFrictionDigestPanel.tsx
 */

import React from "react";
import { EmptyState } from "@/components/admin/kit/EmptyState";
import type { Provenance } from "@/components/admin/kit/provenance";
import { ProvenanceBadge } from "@/components/admin/kit/ProvenanceBadge";
import { DigestEvidenceDisclosures } from "@/components/admin/TrafficFrictionDigestDisclosures";
import {
  DIGEST_SEVERITY_META,
  DigestFindingsAndActions,
  DigestKpiStrip,
} from "@/components/admin/TrafficFrictionDigestSections";
import { useHardenedPolling } from "@/hooks/useHardenedPolling";
import {
  TrafficDigestResponseSchema,
  type TrafficDigestView,
} from "@/lib/admin/schemas/trafficDigest";
import { readJson } from "@/lib/api/json";
import type { TrafficDigestRange } from "@/services/admin/trafficDigestTypes";

const RANGES: readonly TrafficDigestRange[] = ["24h", "7d"];

interface UseTrafficDigestResult {
  data: TrafficDigestView | null;
  error: string | null;
  refreshing: boolean;
  announcement: string | null;
  fetchDigest: (targetRange: TrafficDigestRange, forceRefresh: boolean) => Promise<{ ok: boolean }>;
  handleResynthesize: () => Promise<void>;
}

function computeDigestProvenance(data: TrafficDigestView): Provenance {
  const { liveSources, totalSources, degradedSources } = data.facts;
  if (liveSources === 0) {
    return { state: "no-source", detail: `Degraded sources: ${degradedSources.join(", ")}` };
  }
  if (liveSources < totalSources) {
    return {
      state: "partial",
      ok: liveSources,
      total: totalSources,
      detail: `Degraded sources: ${degradedSources.join(", ")}`,
    };
  }
  return { state: "live", detail: "All 7 traffic/friction readers live" };
}

function useTrafficDigest(range: TrafficDigestRange): UseTrafficDigestResult {
  const [data, setData] = React.useState<TrafficDigestView | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [refreshing, setRefreshing] = React.useState(false);
  const [announcement, setAnnouncement] = React.useState<string | null>(null);

  const fetchDigest = React.useCallback(
    async (targetRange: TrafficDigestRange, forceRefresh: boolean): Promise<{ ok: boolean }> => {
      const qs = forceRefresh ? `range=${targetRange}&refresh=1` : `range=${targetRange}`;
      try {
        const res = await fetch(`/api/admin/traffic-digest?${qs}`, { cache: "no-store" });
        if (!res.ok) { setError(`HTTP ${res.status}`); return { ok: false }; }
        const parsed = await readJson(res, { parse: TrafficDigestResponseSchema.parse });
        setData(parsed);
        setError(null);
        return { ok: true };
      } catch {
        setError("offline");
        return { ok: false };
      }
    },
    [],
  );

  const poll = React.useCallback(() => fetchDigest(range, false), [fetchDigest, range]);
  const { refreshNow } = useHardenedPolling(poll, { baseIntervalMs: 300_000 });

  const initialRender = React.useRef(true);
  React.useEffect(() => {
    if (initialRender.current) { initialRender.current = false; return; }
    setData(null);
    refreshNow();
  }, [range, refreshNow]);

  const handleResynthesize = React.useCallback(async (): Promise<void> => {
    setRefreshing(true);
    try {
      const res = await fetchDigest(range, true);
      if (res.ok) setAnnouncement(`Daily traffic and friction digest updated for ${range} window.`);
    } finally {
      setRefreshing(false);
    }
  }, [fetchDigest, range]);

  return { data, error, refreshing, announcement, fetchDigest, handleResynthesize };
}

function DigestControls({
  range,
  refreshing,
  onSelectRange,
  onResynthesize,
}: {
  range: TrafficDigestRange;
  refreshing: boolean;
  onSelectRange: (next: TrafficDigestRange) => void;
  onResynthesize: () => void;
}): React.JSX.Element {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <div role="group" aria-label="Digest time window" className="inline-flex rounded-lg border border-gray-300 bg-white p-0.5">
        {RANGES.map((opt) => (
          <button
            key={opt}
            type="button"
            aria-pressed={range === opt}
            onClick={() => onSelectRange(opt)}
            className={`px-2.5 py-1 min-h-[28px] text-xs font-semibold rounded-md transition-colors ${range === opt ? "bg-gray-900 text-white" : "text-gray-600 hover:bg-gray-100"}`}
          >
            {opt}
          </button>
        ))}
      </div>
      <button
        type="button"
        disabled={refreshing}
        onClick={onResynthesize}
        className="px-3 py-1 min-h-[28px] rounded-lg border border-indigo-300 bg-indigo-50 hover:bg-indigo-100 text-indigo-900 text-xs font-semibold disabled:opacity-50 transition-colors"
      >
        {refreshing ? "Synthesizing…" : "Re-synthesize"}
      </button>
    </div>
  );
}

function DigestHeader({
  data,
  controls,
}: {
  data: TrafficDigestView;
  controls: React.JSX.Element;
}): React.JSX.Element {
  const provenance = computeDigestProvenance(data);
  const sevMeta = DIGEST_SEVERITY_META[data.narrative.severity];
  return (
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div className="space-y-1">
        <div className="flex flex-wrap items-center gap-2">
          <h2 id="traffic-digest-heading" className="text-lg font-bold text-gray-900">
            AI Daily Traffic &amp; Friction Digest
          </h2>
          <ProvenanceBadge provenance={provenance} />
          <span className={`px-2 py-0.5 rounded border font-mono text-[10px] font-bold uppercase ${sevMeta.badgeClass}`}>
            {sevMeta.label}
          </span>
          <span className="px-2 py-0.5 rounded border border-indigo-200 bg-indigo-50 text-indigo-800 font-mono text-[10px] font-semibold">
            {data.synthesisMode === "ai" ? `AI · ${data.model ?? "gpt-4o-mini"}` : "RULE-BASED"}
          </span>
        </div>
        {data.fallbackReason && (
          <p className="text-[11px] font-mono text-gray-500">Synthesis mode note: {data.fallbackReason}</p>
        )}
      </div>
      {controls}
    </div>
  );
}

function DigestLoadingCard({ range }: { range: TrafficDigestRange }): React.JSX.Element {
  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 space-y-3">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-lg font-bold text-gray-800">AI Daily Traffic &amp; Friction Digest</h2>
        <span className="text-xs font-mono text-gray-500">{range}</span>
      </div>
      <progress aria-label="Loading daily traffic and friction digest" className="w-full h-2 rounded overflow-hidden" />
    </div>
  );
}

function DigestErrorCard({ error, onRetry }: { error: string; onRetry: () => void }): React.JSX.Element {
  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
      <EmptyState
        kind="cannot-read"
        title="Could not load AI Traffic & Friction Digest"
        description={`Digest unavailable (${error}).`}
        action={
          <button
            type="button"
            onClick={onRetry}
            className="px-3 py-1.5 min-h-[28px] bg-rose-600 text-white font-bold rounded text-xs hover:bg-rose-700 transition"
          >
            Retry
          </button>
        }
      />
    </div>
  );
}

export default function TrafficFrictionDigestPanel(): React.JSX.Element {
  const [range, setRange] = React.useState<TrafficDigestRange>("24h");
  const { data, error, refreshing, announcement, fetchDigest, handleResynthesize } = useTrafficDigest(range);

  if (!data && !error) return <DigestLoadingCard range={range} />;
  if (error && !data) {
    return <DigestErrorCard error={error} onRetry={() => { fetchDigest(range, true).catch(() => {}); }} />;
  }
  if (!data) return <div />;

  const sevMeta = DIGEST_SEVERITY_META[data.narrative.severity];
  const controls = (
    <DigestControls
      range={range}
      refreshing={refreshing}
      onSelectRange={setRange}
      onResynthesize={() => { handleResynthesize().catch(() => {}); }}
    />
  );

  return (
    <article aria-labelledby="traffic-digest-heading" className="bg-white rounded-xl shadow-lg border border-gray-100 p-5 sm:p-6 space-y-4">
      <div role="status" aria-live="polite" className="sr-only">{announcement ?? ""}</div>
      <DigestHeader data={data} controls={controls} />
      {refreshing && <progress aria-label="Re-synthesizing daily traffic and friction digest" className="w-full h-1.5 rounded overflow-hidden" />}
      {error && (
        <div role="alert" className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-800">
          Latest refresh failed ({error}); displaying last confirmed digest from {new Date(data.generatedAt).toLocaleTimeString()}.
        </div>
      )}
      <div className={`rounded-xl border p-4 space-y-1 ${sevMeta.boxClass}`}>
        <p className="text-sm sm:text-base font-bold text-gray-900">{data.narrative.headline}</p>
        <p className="text-xs sm:text-sm text-gray-700 leading-relaxed">{data.narrative.executiveSummary}</p>
        <p className="text-[11px] font-mono text-gray-500 pt-1">
          Window: {data.range} · Sources: {data.facts.liveSources}/{data.facts.totalSources} · Generated {new Date(data.generatedAt).toLocaleString()}
        </p>
      </div>
      <DigestKpiStrip facts={data.facts} />
      <DigestFindingsAndActions narrative={data.narrative} />
      <DigestEvidenceDisclosures facts={data.facts} />
    </article>
  );
}
