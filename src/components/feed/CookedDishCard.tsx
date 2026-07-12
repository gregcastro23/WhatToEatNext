"use client";

/**
 * Cooked-it dish card — how a shared Work appears in the commons.
 *
 * Identity (PR 4): when the event actor is REVEALED (the identity resolver
 * says so), the real name + avatar head the card and the chart-persona
 * demotes to the signature line. When concealed (per-post anonymous / legacy
 * default), the original pure-persona rendering is unchanged. Sparking POSTs
 * /api/feed/react — the server anchors both invisible rewards to the reaction
 * row (reactor's feed_reaction, poster's work_resonated); reacted state is
 * remembered locally so the button renders lit without a per-user bootstrap
 * call.
 */

import Link from "next/link";
import { useCallback, useEffect, useState, type JSX } from "react";
import { revealPracticeReward } from "@/lib/economy/practiceClient";

interface CookedCardMeta {
  recipeName?: string;
  recipeId?: string;
  rating?: number;
  persona?: string;
  signature?: string | null;
  transitLine?: string;
  photoUrl?: string | null;
  tableKey?: string | null;
}

interface CookedDishCardProps {
  eventId: string;
  createdAtLabel: string;
  meta: CookedCardMeta;
  initialCount: number;
  /** Real identity — pass ONLY when the feed event's actor is revealed. */
  actorId?: string;
  actorName?: string;
  actorImage?: string;
}

const REACTED_CACHE_KEY = "alchm:feed:sparked";

function sparkedCache(): Set<string> {
  try {
    const raw = window.localStorage.getItem(REACTED_CACHE_KEY);
    return new Set(raw ? (JSON.parse(raw) as string[]) : []);
  } catch {
    return new Set();
  }
}

function rememberSpark(eventId: string): void {
  try {
    const cache = sparkedCache();
    cache.add(eventId);
    window.localStorage.setItem(REACTED_CACHE_KEY, JSON.stringify([...cache].slice(-500)));
  } catch {
    /* private mode */
  }
}

export function CookedDishCard({
  eventId,
  createdAtLabel,
  meta,
  initialCount,
  actorId,
  actorName,
  actorImage,
}: CookedDishCardProps): JSX.Element {
  const [count, setCount] = useState(initialCount);
  const [sparked, setSparked] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setSparked(sparkedCache().has(eventId));
  }, [eventId]);

  const spark = useCallback(async () => {
    if (sparked || busy) return;
    setBusy(true);
    try {
      const res = await fetch("/api/feed/react", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ eventId }),
      });
      const json = (await res.json()) as {
        success?: boolean;
        count?: number;
        reward?: { tokenType: string; amount: number; hint: string } | null;
      };
      if (json.success) {
        setSparked(true);
        rememberSpark(eventId);
        if (typeof json.count === "number") setCount(json.count);
        if (json.reward) revealPracticeReward(json.reward);
      }
    } catch {
      /* invisible — a missed spark is not an error */
    } finally {
      setBusy(false);
    }
  }, [eventId, sparked, busy]);

  const dish = meta.recipeName || "a dish";
  const recipeHref = meta.recipeId ? `/recipes/${encodeURIComponent(meta.recipeId)}` : null;

  // Revealed = real identity heads the card; persona joins the transit line.
  const revealed = Boolean(actorId && actorName);
  const personaLine = [meta.persona, meta.transitLine || "made under today's sky"]
    .filter(Boolean)
    .join(" · ");

  return (
    <div className="glass-card-premium rounded-2xl overflow-hidden border-white/8 hover:border-purple-500/20 transition-all">
      {meta.photoUrl && (
        /* eslint-disable-next-line @next/next/no-img-element */
        <img
          src={meta.photoUrl}
          alt={dish}
          loading="lazy"
          className="w-full max-h-72 object-cover border-b border-white/5"
        />
      )}
      <div className="p-5">
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div className="min-w-0">
            <p className="text-sm text-white/85">
              {revealed ? (
                <Link
                  href={`/profile/${actorId}`}
                  className="inline-flex items-center gap-2 align-middle font-bold text-white underline-offset-2 hover:underline hover:text-purple-200 mr-1"
                >
                  {actorImage && (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={actorImage}
                      alt=""
                      className="w-5 h-5 rounded-full object-cover border border-white/10"
                    />
                  )}
                  {actorName}
                </Link>
              ) : (
                <span className="font-bold text-purple-200">{meta.persona || "An alchemist of the kitchen"}</span>
              )}{" "}
              made{" "}
              {recipeHref ? (
                <Link href={recipeHref} className="font-semibold text-white underline decoration-purple-400/30 underline-offset-2 hover:text-purple-100">
                  {dish}
                </Link>
              ) : (
                <span className="font-semibold text-white">{dish}</span>
              )}
              {typeof meta.rating === "number" && meta.rating > 0 && (
                <span className="text-amber-300/90"> · {"★".repeat(Math.min(5, meta.rating))}</span>
              )}
            </p>
            <p className="text-[11px] text-white/40 mt-1 italic">
              {revealed ? personaLine : meta.transitLine || "made under today's sky"}
            </p>
          </div>
          {meta.signature && (
            <span className="shrink-0 text-[9px] font-black uppercase tracking-[0.14em] text-cyan-300/90 border border-cyan-500/25 rounded-full px-2.5 py-1">
              {meta.signature}
            </span>
          )}
        </div>

        <div className="flex items-center justify-between gap-3 mt-3">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => void spark()}
              disabled={busy}
              aria-pressed={sparked}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-semibold transition-all ${
                sparked
                  ? "border-amber-400/50 bg-amber-500/15 text-amber-200"
                  : "border-white/10 bg-white/[0.03] text-white/50 hover:text-amber-200 hover:border-amber-500/40"
              }`}
            >
              <span aria-hidden>✦</span>
              {count > 0 ? count : "Spark"}
            </button>
            {meta.tableKey && (
              <span className="text-[9px] font-mono uppercase tracking-widest text-purple-300/70">
                {meta.tableKey.startsWith("full-moon") ? "🌕 Full Moon Feast" : "🌑 New Moon Table"}
              </span>
            )}
          </div>
          <span className="text-[10px] text-white/30 font-mono">{createdAtLabel}</span>
        </div>
      </div>
    </div>
  );
}
