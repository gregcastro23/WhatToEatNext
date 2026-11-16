"use client";

/**
 * /admin/traffic — who is on alchm.kitchen, where they came from, what they
 * read, and their step-by-step session journey. First-party page views
 * (GET /api/admin/traffic), polled every 10s.
 *
 * Supports deep-linking from /admin LiveActivityPanel via `?session=<sid>` or
 * `?ref=<tag>` to auto-expand a specific visitor's journey drawer.
 *
 * @file src/app/admin/traffic/page.tsx
 */

import React, { useCallback, useEffect, useState } from "react";
import { ErrorBlock, LoadingBlock, PageHeader } from "@/components/admin/live/primitives";
import { useAdminResource } from "@/components/admin/live/useAdminResource";
import { TrafficSummarySchema, type TrafficSummaryView } from "@/lib/admin/schemas/traffic";
import { RecentVisits, type DiagnosticPreset } from "./_components/RecentVisits";
import {
  ActivationStickinessStrip,
  ConversionFunnelsSection,
  InteractionTallyPanel,
  LiveNow,
  RouteFlowMatrixPanel,
  TopLists,
  TrafficBasis,
  TrafficChart,
  TrafficKpis,
  TrafficStatusNotice,
} from "./_components/TrafficSections";

type Range = TrafficSummaryView["range"];
const RANGES: Range[] = ["24h", "7d", "30d"];
const SAVED_REFS_KEY = "alchm:recent-ref-tags";

function readSavedRefTags(): string[] {
  try {
    const raw = window.localStorage.getItem(SAVED_REFS_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed)
      ? parsed.filter((x): x is string => typeof x === "string" && x.length > 0).slice(0, 10)
      : [];
  } catch {
    return [];
  }
}

function saveRefTag(tag: string): string[] {
  try {
    const existing = readSavedRefTags().filter((t) => t !== tag);
    const next = [tag, ...existing].slice(0, 10);
    window.localStorage.setItem(SAVED_REFS_KEY, JSON.stringify(next));
    return next;
  } catch {
    return [tag];
  }
}

function RangePicker({ value, onChange }: { value: Range; onChange: (r: Range) => void }): React.JSX.Element {
  return (
    <div className="inline-flex rounded-lg border border-gray-300 bg-white p-0.5" role="group" aria-label="Time range">
      {RANGES.map((r) => (
        <button
          key={r}
          type="button"
          aria-pressed={value === r}
          onClick={(): void => onChange(r)}
          className={`px-3 py-1 text-xs font-semibold rounded-md ${value === r ? "bg-gray-800 text-white" : "text-gray-600 hover:bg-gray-100"}`}
        >
          {r}
        </button>
      ))}
    </div>
  );
}

const SHARE_LINK_PATHS = [
  { value: "/", label: "/ (Home)" },
  { value: "/menu-planner", label: "/menu-planner" },
  { value: "/kitchen-lab", label: "/kitchen-lab" },
  { value: "/celestial-lab", label: "/celestial-lab" },
  { value: "/recipes", label: "/recipes" },
  { value: "/quantities", label: "/quantities" },
  { value: "/commensal", label: "/commensal" },
  { value: "/restaurants", label: "/restaurants" },
  { value: "/food-tracking", label: "/food-tracking" },
];

function ShareLinkGenerator({ onTagSaved }: { onTagSaved: (tags: string[]) => void }): React.JSX.Element {
  const [targetPath, setTargetPath] = useState("/");
  const [refTag, setRefTag] = useState("");
  const [copied, setCopied] = useState(false);

  const sanitizedTag = refTag.trim().toLowerCase().replace(/[^a-z0-9:_./-]+/g, "-").replace(/^-+|-+$/g, "");
  const cleanPath = targetPath.startsWith("/") ? targetPath : `/${targetPath}`;
  const origin = typeof window !== "undefined" ? window.location.origin : "https://alchm.kitchen";
  const shareUrl = sanitizedTag ? `${origin}${cleanPath}?ref=${sanitizedTag}` : `${origin}${cleanPath}`;

  const copyLink = (): void => {
    if (sanitizedTag) onTagSaved(saveRefTag(sanitizedTag));
    if (typeof navigator !== "undefined" && "clipboard" in navigator) {
      navigator.clipboard.writeText(shareUrl).then(() => {
        setCopied(true);
        window.setTimeout(() => setCopied(false), 2000);
      }).catch(() => undefined);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 px-4 py-3 flex flex-wrap items-center justify-between gap-3 shadow-sm">
      <div className="flex items-center gap-2 text-xs text-gray-700">
        <span className="font-semibold text-gray-900">🔗 Tracked Share Link</span>
        <span className="text-gray-500 hidden sm:inline">
          Tag a link with <code>?ref=</code> to spotlight a specific reviewer&apos;s session in Visitor Journeys:
        </span>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <select value={targetPath} onChange={(e) => setTargetPath(e.target.value)} aria-label="Target page" className="px-2.5 py-1 text-xs rounded-md border border-gray-300 bg-gray-50 font-mono text-gray-800">
          {SHARE_LINK_PATHS.map((p) => (
            <option key={p.value} value={p.value}>{p.label}</option>
          ))}
        </select>
        <input type="text" value={refTag} onChange={(e) => setRefTag(e.target.value)} placeholder="ref tag (e.g. alex-feedback)" aria-label="Referral tag" className="px-2.5 py-1 text-xs rounded-md border border-gray-300 font-mono text-gray-800 w-44" />
        <button type="button" onClick={copyLink} className="px-3 py-1 rounded-md bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold transition-colors">
          {copied ? "✓ Copied!" : "Copy Link"}
        </button>
      </div>
    </div>
  );
}

interface TrafficBodyProps {
  data: TrafficSummaryView;
  savedRefTags: string[];
  onTagSaved: (tags: string[]) => void;
  initialSessionKey: string | null;
  initialRefFilter: string;
  initialPreset: DiagnosticPreset;
  viewMode: "sessions" | "raw";
  onViewModeChange: (mode: "sessions" | "raw") => void;
  activeInteraction: string;
  onSelectInteraction: (tag: string) => void;
  onSelectTallyInteraction: (tag: string) => void;
  onSelectRoutePath: (path: string) => void;
  onSelectRouteFriction: (path: string) => void;
}

function TrafficBody(p: TrafficBodyProps): React.JSX.Element {
  const { data } = p;
  return (
    <>
      <TrafficStatusNotice data={data} />
      <ShareLinkGenerator onTagSaved={p.onTagSaved} />
      <TrafficKpis data={data} />
      <ActivationStickinessStrip summary={data.activationStickiness ?? null} />
      <ConversionFunnelsSection data={data} />
      <RouteFlowMatrixPanel rows={data.routeFlowMatrix} onSelectPath={p.onSelectRoutePath} onSelectFriction={p.onSelectRouteFriction} />
      <RecentVisits
        visits={data.recent}
        savedRefTags={p.savedRefTags}
        initialSessionKey={p.initialSessionKey}
        initialRefFilter={p.initialRefFilter}
        initialPreset={p.initialPreset}
        initialViewMode={p.viewMode}
        initialInteractionFilter={p.activeInteraction}
        onViewModeChange={p.onViewModeChange}
        onSelectInteraction={p.onSelectInteraction}
        {...(data.sessions !== undefined ? { sessions: data.sessions } : {})}
        {...(data.refRollups !== undefined ? { refRollups: data.refRollups } : {})}
      />
      <InteractionTallyPanel tallies={data.interactionTallies} activeInteraction={p.activeInteraction} onSelectInteraction={p.onSelectTallyInteraction} />
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <div className="xl:col-span-2"><TrafficChart data={data} /></div>
        <LiveNow data={data} />
      </div>
      <TopLists data={data} />
      <TrafficBasis data={data} />
    </>
  );
}

function Pending({ error, onRetry }: { error: string | null; onRetry: () => void }): React.JSX.Element {
  return error ? <ErrorBlock message={error} onRetry={onRetry} /> : <LoadingBlock label="Loading traffic…" />;
}

const VALID_PRESETS: readonly DiagnosticPreset[] = ["all", "live", "engaged", "stuck", "friction", "error", "feedback", "ref", "returning"];

function normalizePresetParam(raw: string | null): DiagnosticPreset | null {
  if (!raw) return null;
  const trimmed = raw.trim().toLowerCase();
  if (trimmed === "open_feedback") return "feedback";
  if (trimmed === "frustrated") return "friction";
  return VALID_PRESETS.find((p) => p === trimmed) ?? null;
}

function parseTrafficQuery(search: string): {
  windowParam: Range | undefined;
  sessionParam: string | null;
  refParam: string;
  interactionParam: string;
  presetParam: DiagnosticPreset;
  viewMode: "sessions" | "raw";
} {
  const queryStr = search.includes("?") ? search.slice(search.indexOf("?")) : search;
  const params = new URLSearchParams(queryStr);
  const rawWindow = params.get("window") ?? params.get("range");
  const viewParam = params.get("view");
  return {
    windowParam: RANGES.find((r) => r === rawWindow),
    sessionParam: params.get("session"),
    refParam: params.get("ref") ?? params.get("q") ?? "",
    interactionParam: params.get("interaction") ?? "",
    presetParam: normalizePresetParam(params.get("preset") ?? params.get("filter")) ?? "all",
    viewMode: viewParam === "views" || viewParam === "raw" ? "raw" : "sessions",
  };
}

function useTrafficUrlListeners(
  applySearchParams: (search: string) => void,
  onSavedTagsLoaded: (tags: string[]) => void,
): void {
  useEffect(() => {
    onSavedTagsLoaded(readSavedRefTags());
    applySearchParams(window.location.search);
    const onPopState = (): void => applySearchParams(window.location.search);
    const onTrafficNav = (event: Event): void => {
      if (!(event instanceof CustomEvent) || typeof event.detail !== "string") return;
      if (event.detail.startsWith("/admin/traffic")) {
        const idx = event.detail.indexOf("?");
        applySearchParams(idx >= 0 ? event.detail.slice(idx) : "");
      }
    };
    window.addEventListener("popstate", onPopState);
    window.addEventListener("alchm:traffic-nav", onTrafficNav);
    return (): void => {
      window.removeEventListener("popstate", onPopState);
      window.removeEventListener("alchm:traffic-nav", onTrafficNav);
    };
  }, [applySearchParams, onSavedTagsLoaded]);
}

export default function TrafficPage(): React.JSX.Element {
  const [range, setRange] = useState<Range>("24h");
  const [savedRefTags, setSavedRefTags] = useState<string[]>([]);
  const [initialSessionKey, setInitialSessionKey] = useState<string | null>(null);
  const [initialRefFilter, setInitialRefFilter] = useState<string>("");
  const [initialPreset, setInitialPreset] = useState<DiagnosticPreset>("all");
  const [viewMode, setViewMode] = useState<"sessions" | "raw">("sessions");
  const [activeInteraction, setActiveInteraction] = useState<string>("");

  const applySearchParams = useCallback((search: string): void => {
    const parsed = parseTrafficQuery(search);
    if (parsed.windowParam) setRange(parsed.windowParam);
    setInitialSessionKey(parsed.sessionParam);
    setInitialRefFilter(parsed.refParam);
    setActiveInteraction(parsed.interactionParam);
    setInitialPreset(parsed.presetParam);
    setViewMode(parsed.viewMode);
  }, []);

  useTrafficUrlListeners(applySearchParams, setSavedRefTags);
  const { data, error, updatedAt, refresh } = useAdminResource(`/api/admin/traffic?range=${range}`, TrafficSummarySchema, 10_000);
  return (
    <div className="space-y-6">
      <PageHeader
        title="Traffic & Visitor Journeys"
        description="Every human visit to alchm.kitchen as it happens: who is on the site now, where they came from, their page-by-page trail, and how long they stayed."
        updatedAt={updatedAt}
        error={error}
        onRefresh={refresh}
        controls={<RangePicker value={range} onChange={setRange} />}
      />
      {data ? (
        <TrafficBody
          data={data} savedRefTags={savedRefTags} onTagSaved={setSavedRefTags}
          initialSessionKey={initialSessionKey} initialRefFilter={initialRefFilter} initialPreset={initialPreset}
          viewMode={viewMode} onViewModeChange={setViewMode} activeInteraction={activeInteraction}
          onSelectInteraction={setActiveInteraction}
          onSelectTallyInteraction={(tag): void => { setActiveInteraction(tag); if (tag) setViewMode("raw"); }}
          onSelectRoutePath={(path): void => setInitialRefFilter((prev) => (prev === path ? "" : path))}
          onSelectRouteFriction={(path): void => { setInitialRefFilter(path); setInitialPreset("friction"); }}
        />
      ) : (
        <Pending error={error} onRetry={refresh} />
      )}
    </div>
  );
}
