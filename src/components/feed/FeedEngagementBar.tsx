"use client";

/**
 * FeedEngagementBar — the reactions + comments affordance under any feed card.
 *
 * Wraps the Tables kit ReactionBar (all five kinds: spark + the four elements)
 * and a comment toggle. The kit speaks capitalized kinds ("spark" | "Fire" |
 * "Water" | "Earth" | "Air") while the DB stores lowercase ('spark','fire',…),
 * so this component owns the mapping at the wiring layer.
 *
 * Reactions are per-kind toggles: a tap POSTs /api/feed/react (which INSERTs or
 * DELETEs the viewer's row). Counts update optimistically and are reconciled
 * from the authoritative server response. A localStorage cache (v2) remembers
 * the viewer's kinds per event so bars render lit before the bootstrap endpoint
 * answers; it migrates the legacy `alchm:feed:sparked` set as `spark` entries.
 */

import { MessageCircle } from "lucide-react";
import { useCallback, useEffect, useState, type JSX } from "react";
import { LabelXS, ReactionBar, type ReactionKind } from "@/components/tables/ui";
import { revealPracticeReward } from "@/lib/economy/practiceClient";

// ── lowercase (DB) ⇄ kit kind mapping ───────────────────────────────────────
const DB_TO_KIT: Record<string, ReactionKind> = {
  spark: "spark",
  fire: "Fire",
  water: "Water",
  earth: "Earth",
  air: "Air",
};
const KIT_TO_DB: Record<ReactionKind, string> = {
  spark: "spark",
  Fire: "fire",
  Water: "water",
  Earth: "earth",
  Air: "air",
};

// ── localStorage cache (v2) ─────────────────────────────────────────────────
const CACHE_KEY = "alchm:feed:reactions:v2";
const LEGACY_SPARK_KEY = "alchm:feed:sparked";

type ReactionCache = Record<string, string[]>; // eventId → lowercase kinds

function readCache(): ReactionCache {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(CACHE_KEY);
    if (raw) return (JSON.parse(raw) as ReactionCache) || {};
    // One-time migration of the legacy spark-only set → v2 per-kind cache.
    const legacyRaw = window.localStorage.getItem(LEGACY_SPARK_KEY);
    if (legacyRaw) {
      const ids = JSON.parse(legacyRaw) as string[];
      const migrated: ReactionCache = {};
      for (const id of ids) migrated[id] = ["spark"];
      window.localStorage.setItem(CACHE_KEY, JSON.stringify(migrated));
      return migrated;
    }
  } catch {
    /* private mode / malformed — treat as empty */
  }
  return {};
}

function writeCacheEntry(eventId: string, kinds: string[]): void {
  if (typeof window === "undefined") return;
  try {
    const cache = readCache();
    if (kinds.length > 0) cache[eventId] = kinds;
    else delete cache[eventId];
    // Bound the cache so it can't grow without limit across a long session.
    const entries = Object.entries(cache).slice(-500);
    window.localStorage.setItem(CACHE_KEY, JSON.stringify(Object.fromEntries(entries)));
  } catch {
    /* private mode */
  }
}

interface ReactResponse {
  success?: boolean;
  counts?: Record<string, number>;
  viewerKinds?: string[];
  reward?: { tokenType: string; amount: number; hint: string } | null;
}

export interface FeedEngagementBarProps {
  eventId: string;
  /** Per-kind counts from the feed payload (lowercase keys). */
  initialCounts?: Record<string, number>;
  /** The viewer's current kinds (lowercase), from the bootstrap endpoint. */
  viewerKinds?: string[];
  commentCount?: number;
  onToggleComments?: () => void;
  commentsOpen?: boolean;
  className?: string;
}

export function FeedEngagementBar({
  eventId,
  initialCounts = {},
  viewerKinds,
  commentCount = 0,
  onToggleComments,
  commentsOpen = false,
  className = "",
}: FeedEngagementBarProps): JSX.Element {
  const [counts, setCounts] = useState<Record<string, number>>(initialCounts);
  const [active, setActive] = useState<Set<string>>(new Set());
  const [busy, setBusy] = useState<Set<string>>(new Set());

  // Seed active kinds: prefer the server-provided bootstrap, else the local cache.
  const viewerKindsKey = viewerKinds ? viewerKinds.join(",") : undefined;
  useEffect(() => {
    if (viewerKinds !== undefined) {
      setActive(new Set(viewerKinds));
    } else {
      setActive(new Set(readCache()[eventId] ?? []));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eventId, viewerKindsKey]);

  // Track incoming count refreshes (viewer-independent) from the shared feed.
  useEffect(() => {
    setCounts(initialCounts);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eventId]);

  const kitCounts: Partial<Record<ReactionKind, number>> = {};
  for (const [db, n] of Object.entries(counts)) {
    const kit = DB_TO_KIT[db];
    if (kit) kitCounts[kit] = n;
  }
  const kitActive: ReactionKind[] = [...active]
    .map((db) => DB_TO_KIT[db])
    .filter((k): k is ReactionKind => Boolean(k));

  const onReact = useCallback(
    async (kitKind: ReactionKind) => {
      const dbKind = KIT_TO_DB[kitKind];
      if (busy.has(dbKind)) return;

      const wasActive = active.has(dbKind);
      // Optimistic toggle.
      const nextActive = new Set(active);
      const nextCounts = { ...counts };
      if (wasActive) {
        nextActive.delete(dbKind);
        nextCounts[dbKind] = Math.max(0, (nextCounts[dbKind] ?? 1) - 1);
      } else {
        nextActive.add(dbKind);
        nextCounts[dbKind] = (nextCounts[dbKind] ?? 0) + 1;
      }
      setActive(nextActive);
      setCounts(nextCounts);
      setBusy((b) => new Set(b).add(dbKind));

      try {
        const res = await fetch("/api/feed/react", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ eventId, kind: dbKind }),
        });
        const json = (await res.json()) as ReactResponse;
        if (json.success) {
          // Server is authoritative — reconcile counts + viewer kinds.
          if (json.counts) setCounts(json.counts);
          const serverKinds = json.viewerKinds ?? [...nextActive];
          setActive(new Set(serverKinds));
          writeCacheEntry(eventId, serverKinds);
          if (json.reward) revealPracticeReward(json.reward);
        } else {
          // Revert on a non-success (e.g. self-reaction 400).
          setActive(active);
          setCounts(counts);
        }
      } catch {
        // Network hiccup — revert; a missed reaction is not an error.
        setActive(active);
        setCounts(counts);
      } finally {
        setBusy((b) => {
          const next = new Set(b);
          next.delete(dbKind);
          return next;
        });
      }
    },
    [active, busy, counts, eventId],
  );

  return (
    <div className={`flex items-center justify-between gap-3 ${className}`}>
      <ReactionBar counts={kitCounts} active={kitActive} onReact={(k) => void onReact(k)} />
      {onToggleComments && (
        <button
          type="button"
          onClick={onToggleComments}
          aria-pressed={commentsOpen}
          aria-label={`${commentsOpen ? "Hide" : "Show"} comments${commentCount ? ` (${commentCount})` : ""}`}
          className={`flex items-center gap-1.5 rounded-full p-1 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-alchm-violet ${
            commentsOpen ? "text-alchm-violet-bright" : "text-alchm-fg-mute hover:text-alchm-violet-bright"
          }`}
        >
          <MessageCircle size={16} aria-hidden />
          <LabelXS>{commentCount > 0 ? commentCount : ""}</LabelXS>
        </button>
      )}
    </div>
  );
}

export default FeedEngagementBar;
