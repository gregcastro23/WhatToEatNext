"use client";

/**
 * SearchGapsPanel — Omnibar Phase 7 admin surface.
 *
 * Displays top unfulfilled search queries (0-result searches, PII-scrubbed and
 * aggregated by normalized query) and provides one-click admin resolution to
 * link queries to canonical catalog slugs or trigger cosmic recipe generation.
 */
import Link from "next/link";
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

const PatchGapResponseSchema = z.object({
  success: z.boolean(),
  normalizedQuery: z.string().optional(),
  resolvedEntitySlug: z.string().nullable().optional(),
  generationHref: z.string().nullable().optional(),
  error: z.string().optional(),
});

type GapResolutionAction = "resolve" | "reopen" | "queue_cosmic_recipe";

function SearchGapResolutionCell({
  gap,
  busy,
  onResolve,
}: {
  gap: SearchGapRow;
  busy: boolean;
  onResolve: (normalizedQuery: string, slug: string | null, action: GapResolutionAction) => void;
}): React.JSX.Element {
  const [slugInput, setSlugInput] = React.useState(gap.resolvedEntitySlug ?? "");
  const generationHref = `/recipe-generator?prompt=${encodeURIComponent(gap.sampleRawQuery || gap.normalizedQuery)}&fromGap=${encodeURIComponent(gap.normalizedQuery)}`;

  if (gap.resolvedAt && gap.resolvedEntitySlug) {
    return (
      <div className="flex items-center gap-2 flex-wrap">
        <span className="inline-flex items-center px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 font-mono text-[11px]">
          → {gap.resolvedEntitySlug}
        </span>
        <button type="button" disabled={busy} onClick={() => onResolve(gap.normalizedQuery, null, "reopen")} className="px-2 py-0.5 rounded border border-gray-200 text-[11px] font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-50">
          Reopen
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1.5 flex-wrap">
      <input type="text" value={slugInput} onChange={(e) => setSlugInput(e.target.value)} placeholder="slug (e.g. chickpeas)" aria-label={`Canonical slug for ${gap.normalizedQuery}`} className="w-36 px-2 py-1 border border-gray-300 rounded font-mono text-[11px] text-gray-800" />
      <button type="button" disabled={busy || slugInput.trim().length === 0} onClick={() => onResolve(gap.normalizedQuery, slugInput.trim(), "resolve")} className="px-2.5 py-1 rounded bg-purple-600 hover:bg-purple-700 text-white text-[11px] font-semibold disabled:opacity-40">
        Link Slug
      </button>
      <Link href={generationHref} onClick={() => onResolve(gap.normalizedQuery, null, "queue_cosmic_recipe")} className="px-2 py-1 rounded border border-amber-300 bg-amber-50 hover:bg-amber-100 text-amber-900 text-[11px] font-medium">
        Generate Recipe
      </Link>
    </div>
  );
}

function SearchGapsTable({
  gaps,
  busyQuery,
  onResolve,
}: {
  gaps: readonly SearchGapRow[];
  busyQuery: string | null;
  onResolve: (normalizedQuery: string, slug: string | null, action: "resolve" | "reopen" | "queue_cosmic_recipe") => void;
}): React.JSX.Element {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full text-left text-xs text-gray-700">
        <thead>
          <tr className="border-b border-gray-200 text-[11px] uppercase tracking-wider text-gray-500">
            <th className="py-2 pr-4">Query</th>
            <th className="py-2 pr-4">Sample Input</th>
            <th className="py-2 pr-4">Hits</th>
            <th className="py-2 pr-4">Filters</th>
            <th className="py-2 pr-4">Last Seen</th>
            <th className="py-2">Catalog Resolution</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {gaps.map((gap) => (
            <tr key={gap.id}>
              <td className="py-2 pr-4 font-mono font-semibold text-gray-900">{gap.normalizedQuery}</td>
              <td className="py-2 pr-4 text-gray-600">{gap.sampleRawQuery}</td>
              <td className="py-2 pr-4 tabular-nums font-bold text-purple-700">{gap.hitCount}</td>
              <td className="py-2 pr-4">{gap.topFilters.length > 0 ? gap.topFilters.join(", ") : "—"}</td>
              <td className="py-2 pr-4 text-gray-500 tabular-nums">{new Date(gap.lastSeenAt).toLocaleDateString()}</td>
              <td className="py-2">
                <SearchGapResolutionCell
                  gap={gap}
                  busy={busyQuery === gap.normalizedQuery}
                  onResolve={onResolve}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

async function patchSearchGapRequest(
  normalizedQuery: string,
  slug: string | null,
  action: GapResolutionAction,
): Promise<{ ok: boolean; message: string }> {
  try {
    const res = await fetch("/api/admin/search-gaps", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ normalizedQuery, resolvedEntitySlug: slug, action }),
    });
    const payload = await readJson(res, { parse: PatchGapResponseSchema.parse });
    if (res.ok && payload.success) {
      const msg =
        action === "reopen"
          ? `Reopened "${normalizedQuery}".`
          : `Mapped "${normalizedQuery}" → ${payload.resolvedEntitySlug ?? slug}.`;
      return { ok: true, message: msg };
    }
    return { ok: false, message: payload.error ?? "Failed to update search gap." };
  } catch {
    return { ok: false, message: "Network error updating search gap." };
  }
}

function useSearchGapsData(includeResolved: boolean): {
  data: SearchGapSummary | null;
  error: string | null;
  busyQuery: string | null;
  statusMessage: string | null;
  resolveGap: (normalizedQuery: string, slug: string | null, action: GapResolutionAction) => Promise<void>;
} {
  const [data, setData] = React.useState<SearchGapSummary | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [busyQuery, setBusyQuery] = React.useState<string | null>(null);
  const [statusMessage, setStatusMessage] = React.useState<string | null>(null);

  const poll = React.useCallback(async (): Promise<{ ok: boolean }> => {
    try {
      const res = await fetch(`/api/admin/search-gaps?limit=15&includeResolved=${includeResolved ? "true" : "false"}`, { cache: "no-store" });
      if (!res.ok) {
        setError(`Failed to load search gaps (HTTP ${res.status})`);
        return { ok: false };
      }
      setData(await readJson(res, { parse: SearchGapSummarySchema.parse }));
      setError(null);
      return { ok: true };
    } catch {
      setError("Failed to read search gap telemetry");
      return { ok: false };
    }
  }, [includeResolved]);

  useHardenedPolling(poll, { baseIntervalMs: 120_000 });

  const resolveGap = React.useCallback(
    async (normalizedQuery: string, slug: string | null, action: GapResolutionAction): Promise<void> => {
      setBusyQuery(normalizedQuery);
      setStatusMessage(null);
      const result = await patchSearchGapRequest(normalizedQuery, slug, action);
      setStatusMessage(result.message);
      if (result.ok) await poll();
      setBusyQuery(null);
    },
    [poll],
  );

  return { data, error, busyQuery, statusMessage, resolveGap };
}

export function SearchGapsPanel(): React.JSX.Element {
  const [includeResolved, setIncludeResolved] = React.useState(false);
  const { data, error, busyQuery, statusMessage, resolveGap } = useSearchGapsData(includeResolved);

  if (!data && !error) {
    return <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 text-center"><p className="text-gray-600 text-sm">Loading unfulfilled search queries…</p></div>;
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
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-gray-900">Top Unfulfilled Searches</h3>
            <ProvenanceBadge provenance={provenance} />
          </div>
          <p className="text-sm text-gray-600">Link zero-result Omnibar queries to canonical catalog slugs or trigger cosmic recipe generation.</p>
        </div>
        <label className="inline-flex items-center gap-2 text-xs font-medium text-gray-700 cursor-pointer">
          <input type="checkbox" checked={includeResolved} onChange={(e) => setIncludeResolved(e.target.checked)} className="rounded border-gray-300 text-purple-600 focus:ring-purple-500" />
          Show resolved mappings
        </label>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Metric label="Unresolved queries" value={data.totals.unresolvedQueries} provenance={provenance} />
        <Metric label="Total zero-result hits" value={data.totals.unresolvedHits} provenance={provenance} />
        <Metric label="Resolved gaps" value={data.totals.resolvedQueries} provenance={provenance} />
      </div>
      {statusMessage && <p className="text-xs font-medium text-purple-800 bg-purple-50 border border-purple-200 rounded-lg px-3 py-2">{statusMessage}</p>}
      {data.gaps.length === 0 ? (
        <EmptyState kind="never-used" title="No unfulfilled searches recorded yet" description="Zero-result queries ≥ 3 characters will appear here automatically." />
      ) : (
        <SearchGapsTable gaps={data.gaps} busyQuery={busyQuery} onResolve={(q, s, a) => { resolveGap(q, s, a).catch(() => {}); }} />
      )}
    </div>
  );
}

export default SearchGapsPanel;
