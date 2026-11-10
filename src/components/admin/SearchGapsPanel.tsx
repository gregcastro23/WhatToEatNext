"use client";

/**
 * SearchGapsPanel — Omnibar Phase 7 admin surface.
 *
 * Displays top unfulfilled search queries (0-result searches, PII-scrubbed and
 * aggregated by normalized query) so content authors can see what recipes,
 * ingredients, or techniques users are looking for.
 */
import React from "react";
import { z } from "zod";
import { EmptyState } from "@/components/admin/kit/EmptyState";
import { Metric } from "@/components/admin/kit/Metric";
import { fromLiveFlag } from "@/components/admin/kit/provenance";
import { ProvenanceBadge } from "@/components/admin/kit/ProvenanceBadge";
import { useHardenedPolling } from "@/hooks/useHardenedPolling";
import { readJson } from "@/lib/api/json";

const SearchGapRowSchema = z.object({
  id: z.string(),
  normalizedQuery: z.string(),
  sampleRawQuery: z.string(),
  hitCount: z.number().int().nonnegative(),
  firstSeenAt: z.string(),
  lastSeenAt: z.string(),
  topFilters: z.array(z.string()),
  resolvedAt: z.string().nullable(),
  resolvedEntitySlug: z.string().nullable(),
});

type SearchGapRow = z.infer<typeof SearchGapRowSchema>;

const SearchGapSummarySchema = z.object({
  success: z.literal(true),
  generatedAt: z.string(),
  totals: z.object({
    unresolvedQueries: z.number().int().nonnegative(),
    unresolvedHits: z.number().int().nonnegative(),
    resolvedQueries: z.number().int().nonnegative(),
  }),
  gaps: z.array(SearchGapRowSchema),
});

type SearchGapSummary = z.infer<typeof SearchGapSummarySchema>;

function SearchGapsTable({ gaps }: { gaps: readonly SearchGapRow[] }): React.JSX.Element {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full text-left text-xs text-gray-700">
        <thead>
          <tr className="border-b border-gray-200 text-[11px] uppercase tracking-wider text-gray-500">
            <th className="py-2 pr-4">Query</th>
            <th className="py-2 pr-4">Sample Input</th>
            <th className="py-2 pr-4">Hits</th>
            <th className="py-2 pr-4">Filters</th>
            <th className="py-2">Last Seen</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {gaps.map((gap) => (
            <tr key={gap.id}>
              <td className="py-2 pr-4 font-mono font-semibold text-gray-900">
                {gap.normalizedQuery}
              </td>
              <td className="py-2 pr-4 text-gray-600">{gap.sampleRawQuery}</td>
              <td className="py-2 pr-4 tabular-nums font-bold text-purple-700">{gap.hitCount}</td>
              <td className="py-2 pr-4">
                {gap.topFilters.length > 0 ? gap.topFilters.join(", ") : "—"}
              </td>
              <td className="py-2 text-gray-500 tabular-nums">
                {new Date(gap.lastSeenAt).toLocaleDateString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function useSearchGapsData(): { data: SearchGapSummary | null; error: string | null } {
  const [data, setData] = React.useState<SearchGapSummary | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const poll = React.useCallback(async (): Promise<{ ok: boolean }> => {
    try {
      const res = await fetch("/api/admin/search-gaps?limit=15", { cache: "no-store" });
      if (!res.ok) {
        setError(`Failed to load search gaps (HTTP ${res.status})`);
        return { ok: false };
      }
      const parsed = await readJson(res, { parse: SearchGapSummarySchema.parse });
      setData(parsed);
      setError(null);
      return { ok: true };
    } catch {
      setError("Failed to read search gap telemetry");
      return { ok: false };
    }
  }, []);
  useHardenedPolling(poll, { baseIntervalMs: 120_000 });
  return { data, error };
}

export function SearchGapsPanel(): React.JSX.Element {
  const { data, error } = useSearchGapsData();
  if (!data && !error) {
    return (
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 text-center">
        <p className="text-gray-600 text-sm">Loading unfulfilled search queries…</p>
      </div>
    );
  }
  if (error && !data) {
    return (
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
        <h3 className="font-bold text-gray-900 mb-2">Top Unfulfilled Searches (Omnibar Phase 7)</h3>
        <EmptyState kind="cannot-read" title="Search gaps unavailable" description={error} />
      </div>
    );
  }
  if (!data) return <div />;
  const provenance = fromLiveFlag(true, { detail: "search_zero_result_gaps (anonymous, PII-scrubbed)" });

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 space-y-5">
      <div>
        <div className="flex items-center gap-2">
          <h3 className="font-bold text-gray-900">Top Unfulfilled Searches</h3>
          <ProvenanceBadge provenance={provenance} />
        </div>
        <p className="text-sm text-gray-600">
          Anonymous, PII-scrubbed queries that returned zero Omnibar results — prioritized by hit count for catalog expansion.
        </p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Metric label="Unresolved queries" value={data.totals.unresolvedQueries} provenance={provenance} />
        <Metric label="Total zero-result hits" value={data.totals.unresolvedHits} provenance={provenance} />
        <Metric label="Resolved gaps" value={data.totals.resolvedQueries} provenance={provenance} />
      </div>
      {data.gaps.length === 0 ? (
        <EmptyState
          kind="never-used"
          title="No unfulfilled searches recorded yet"
          description="Zero-result queries ≥ 3 characters will appear here automatically."
        />
      ) : (
        <SearchGapsTable gaps={data.gaps} />
      )}
    </div>
  );
}

export default SearchGapsPanel;
