"use client";

import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import React, { useCallback, useEffect, useState } from "react";
import { agentChatUrl } from "@/lib/agents/agentChatUrl";
import { ELEMENT_COLORS } from "@/lib/elementColors";
import { narrateFeedEvent } from "@/lib/feed/eventNarration";

function formatRelativeTime(iso: string): string {
  const then = new Date(iso).getTime();
  const diffSec = Math.max(0, Math.floor((Date.now() - then) / 1000));
  if (diffSec < 60) return `${diffSec}s ago`;
  if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
  if (diffSec < 86_400) return `${Math.floor(diffSec / 3600)}h ago`;
  return `${Math.floor(diffSec / 86_400)}d ago`;
}

interface SignaturePlacement {
  planet?: string;
  sign?: string;
  degree?: number;
}

interface PlanetarySignature {
  planetaryHour?: string;
  planetaryDay?: string;
  dominantPlanet?: string;
  dominantSign?: string;
  dominantElement?: string;
  sacredStat?: string;
  natalPositions?: SignaturePlacement[];
}

function getPlanetarySignature(metadata: any): PlanetarySignature | null {
  const signature = metadata?.planetarySignature;
  return signature && typeof signature === "object" ? signature : null;
}

function formatPlacement(placement: SignaturePlacement): string | null {
  if (!placement.planet) return null;
  const degree = typeof placement.degree === "number" ? `${placement.degree.toFixed(1)}°` : "";
  const sign = placement.sign ? ` ${placement.sign}` : "";
  return `${placement.planet} ${degree}${sign}`.trim();
}

interface FeedEvent {
  id: string;
  eventType: string;
  metadataPayload: any;
  createdAt: string;
  actorIsAgent?: boolean;
  actorName?: string;
  actorSlug?: string;
  actorImage?: string;
}

export function LiveAgentFeed({
  userId,
  initialEvents,
}: {
  userId: string;
  initialEvents: FeedEvent[];
}) {
  const [events, setEvents] = useState<FeedEvent[]>(initialEvents);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(initialEvents.length >= 20); // rough heuristic

  const refreshEvents = useCallback(async () => {
    try {
      const res = await fetch(`/api/users/${userId}/feed?limit=20`);
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setEvents(data.events || []);
          setHasMore(data.events.length >= 20);
        }
      }
    } catch (e) {
      console.error(e);
    }
  }, [userId]);

  const loadMore = async () => {
    if (loadingMore) return;
    setLoadingMore(true);
    try {
      const res = await fetch(`/api/users/${userId}/feed?limit=20&offset=${events.length}`);
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.events.length > 0) {
          setEvents((prev) => [...prev, ...data.events]);
          setHasMore(data.events.length >= 20);
        } else {
          setHasMore(false);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    // Poll every 30 seconds for live updates
    const id = window.setInterval(() => {
      void refreshEvents();
    }, 30_000);
    return () => window.clearInterval(id);
  }, [refreshEvents]);

  if (events.length === 0) {
    return (
      <div className="glass-card-premium rounded-3xl p-10 text-center border-white/8">
        <p className="text-white/40">No recorded actions yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <AnimatePresence>
        {events.map((event) => {
          const signature = event.actorIsAgent ? getPlanetarySignature(event.metadataPayload) : null;
          const natalPlacements =
            signature?.natalPositions?.map(formatPlacement).filter(Boolean).slice(0, 4) || [];
          const narration = narrateFeedEvent(event.eventType, event.metadataPayload);
          
          // Use event-level actorName if available (from API), fallback to static "This user" context
          const displayName = event.actorName || "They";
          
          return (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`glass-card-premium rounded-2xl p-5 transition-all flex items-start gap-4 ${
                event.actorIsAgent
                  ? "border-amber-500/20 hover:border-amber-400/35"
                  : "border-white/8 hover:border-purple-500/20"
              }`}
            >
              <div className="w-10 h-10 rounded-full glass-base flex items-center justify-center text-xl shrink-0 border border-white/5 overflow-hidden">
                {event.actorImage ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={event.actorImage}
                    alt="Avatar"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  narration.icon
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-white/80">
                  <span className="font-bold mr-1">{displayName}</span>
                  {narration.href ? (
                    <Link
                      href={narration.href}
                      className="text-white/80 hover:text-white underline decoration-purple-400/30 underline-offset-2"
                    >
                      {narration.action}
                    </Link>
                  ) : (
                    <span className="text-white/60">{narration.action}</span>
                  )}
                </p>
                <div className="flex items-center gap-3 mt-2">
                  <span className="text-[10px] text-white/30 font-mono">
                    {formatRelativeTime(event.createdAt)}
                  </span>
                  {event.actorIsAgent && event.actorSlug && (
                    <a
                      href={agentChatUrl(event.actorSlug)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[10px] text-amber-300/70 hover:text-amber-200 uppercase tracking-wider font-bold"
                    >
                      Chat with Agent ✦
                    </a>
                  )}
                </div>
                {signature && (
                  <div
                    className={`mt-3 rounded-xl border px-3 py-2 ${
                      ELEMENT_COLORS[signature.dominantElement ?? ""] ??
                      "border-amber-400/15 bg-amber-500/10 text-amber-100/75"
                    }`}
                  >
                    <div className="flex flex-wrap gap-x-3 gap-y-1 text-[10px] font-bold uppercase tracking-wider">
                      {(signature.planetaryHour || signature.dominantPlanet) && (
                        <span>Hour {signature.planetaryHour || signature.dominantPlanet}</span>
                      )}
                      {signature.planetaryDay && <span>Day {signature.planetaryDay}</span>}
                      {signature.sacredStat && <span>{signature.sacredStat}</span>}
                      {signature.dominantElement && <span>{signature.dominantElement}</span>}
                    </div>
                    {natalPlacements.length > 0 && (
                      <p className="mt-1.5 text-xs leading-relaxed opacity-80">
                        Natal signature: {natalPlacements.join(" · ")}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
      {hasMore && (
        <div className="pt-4 flex justify-center">
          <button
            onClick={() => void loadMore()}
            disabled={loadingMore}
            className="px-6 py-2 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 text-white/60 text-xs font-bold uppercase tracking-widest transition-colors disabled:opacity-50"
          >
            {loadingMore ? "Loading..." : "Load More Actions"}
          </button>
        </div>
      )}
    </div>
  );
}
