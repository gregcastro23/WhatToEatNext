"use client";

import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { HistoricalAgentFeedCard } from "@/components/feed/HistoricalAgentFeedItems";
import { narrateFeedEvent } from "@/lib/feed/eventNarration";
import type { HistoricalAgentFeedItem } from "@/lib/feed/historicalAgentFeed";
import { fetchHistoricalAgentFeed } from "@/lib/feed/historicalAgentFeedSource";

type FeedMetadata = Record<string, unknown>;

interface FeedEvent {
  id: string;
  actorId?: string;
  userId?: string;
  actorName?: string;
  actorImage?: string;
  actorSlug?: string;
  user?: string;
  actorIsAgent?: boolean;
  isAgent?: boolean;
  eventType?: string;
  action?: string;
  metadataPayload?: FeedMetadata;
  createdAt?: string;
}

interface FeedResponse {
  success?: boolean;
  events?: FeedEvent[];
  message?: string;
}

const LOADING_SKELETON_KEYS = [
  "feed-skeleton-1",
  "feed-skeleton-2",
  "feed-skeleton-3",
];
const FEED_REFRESH_INTERVAL_MS = 30_000;

function formatDistanceToNow(dateValue?: string): string {
  if (!dateValue) return "";

  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return "";

  const diffInSeconds = Math.max(
    0,
    Math.floor((Date.now() - date.getTime()) / 1000),
  );

  if (diffInSeconds < 60) return "just now";

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}h ago`;

  const diffInDays = Math.floor(diffInHours / 24);
  return `${diffInDays}d ago`;
}

function getEventNarration(event: FeedEvent) {
  if (event.action?.trim()) {
    const meta = event.metadataPayload;
    const recipeId =
      meta && typeof meta.recipeId === "string" && meta.recipeId.trim()
        ? meta.recipeId.trim()
        : meta && typeof meta.recipe_id === "string" && meta.recipe_id.trim()
          ? meta.recipe_id.trim()
          : undefined;

    let href: string | undefined = undefined;
    if (recipeId) {
      if (event.eventType === "recipe_generation") {
        href = `/generated-recipe/${recipeId}`;
      } else {
        href = `/recipes/${recipeId}`;
      }
    }
    return { icon: "✨", action: event.action, label: event.action, href };
  }
  return narrateFeedEvent(event.eventType, event.metadataPayload);
}

type WidgetFeedRow =
  | { kind: "human"; id: string; ts: number; event: FeedEvent }
  | { kind: "agent"; id: string; ts: number; item: HistoricalAgentFeedItem };

export function AgentsFeedThread() {
  const [isVisible, setIsVisible] = useState(true);
  const [feedItems, setFeedItems] = useState<FeedEvent[]>([]);
  const [historicalItems, setHistoricalItems] = useState<HistoricalAgentFeedItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    let isInitialFetch = true;
    let isRequestInFlight = false;

    async function fetchFeed() {
      if (isRequestInFlight) {
        return;
      }

      isRequestInFlight = true;

      try {
        if (isInitialFetch) {
          setIsLoading(true);
        }
        setErrorMessage(null);

        const historicalPromise = fetchHistoricalAgentFeed(8);
        const response = await fetch("/api/feed?limit=8", {
          signal: controller.signal,
        });

        const historical = await historicalPromise;
        if (!controller.signal.aborted) {
          setHistoricalItems(historical);
        }

        if (!response.ok) {
          throw new Error("Feed request failed.");
        }

        const data = (await response.json()) as FeedResponse;

        if (!data.success || !Array.isArray(data.events)) {
          throw new Error(data.message || "Feed response was not valid.");
        }

        setFeedItems(data.events);
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") {
          return;
        }

        console.error("Failed to load network feed:", error);
        setErrorMessage("The network feed is temporarily unavailable.");
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
          isInitialFetch = false;
        }
        isRequestInFlight = false;
      }
    }

    void fetchFeed();
    const intervalId = window.setInterval(() => {
      void fetchFeed();
    }, FEED_REFRESH_INTERVAL_MS);

    return () => {
      window.clearInterval(intervalId);
      controller.abort();
    };
  }, []);

  // Retain human activity; drop the planetary-agent posts and merge in the
  // historical-agent feed (recipe posts + yield claims), newest first.
  const rows = useMemo<WidgetFeedRow[]>(() => {
    const humanRows: WidgetFeedRow[] = feedItems
      .filter((item) => !(item.actorIsAgent ?? item.isAgent === true))
      .map((event) => ({
        kind: "human",
        id: event.id,
        ts: Date.parse(event.createdAt ?? "") || 0,
        event,
      }));
    const agentRows: WidgetFeedRow[] = historicalItems.map((item) => ({
      kind: "agent",
      id: item.id,
      ts: Date.parse(item.createdAt) || 0,
      item,
    }));
    return [...humanRows, ...agentRows].sort((a, b) => b.ts - a.ts).slice(0, 8);
  }, [feedItems, historicalItems]);
  const hasFeedItems = rows.length > 0;

  return (
    <>
      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ x: "100%", opacity: 0.8 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: "100%", opacity: 0.8 }}
            transition={{ type: "spring", stiffness: 260, damping: 28 }}
            className="fixed top-0 right-0 h-screen w-80 sm:w-96 z-50 glass-card-premium border-l border-purple-500/20 shadow-2xl flex flex-col bg-[#06050b]/95 backdrop-blur-2xl"
          >
            <div className="flex justify-between items-center px-4 py-3 border-b border-white/10 bg-white/5 shrink-0">
              <div className="flex items-center gap-2">
                <span className="text-purple-400 animate-pulse">⚡</span>
                <h3 className="text-sm font-bold text-white tracking-wide uppercase alchm-gradient-text">
                  Live Network Feed
                </h3>
              </div>
              <button
                onClick={() => setIsVisible(false)}
                className="text-white/50 hover:text-white/90 transition-colors focus:outline-none w-6 h-6 flex items-center justify-center rounded-full hover:bg-white/10"
                aria-label="Hide feed"
              >
                ✕
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
              {isLoading ? (
                LOADING_SKELETON_KEYS.map((key) => (
                  <div key={key} className="flex gap-3 items-start">
                    <div className="w-8 h-8 rounded-full bg-white/10 animate-pulse flex-shrink-0" />
                    <div className="flex-1 space-y-2 pt-1">
                      <div className="h-3 w-4/5 rounded bg-white/10 animate-pulse" />
                      <div className="h-2 w-1/3 rounded bg-white/5 animate-pulse" />
                    </div>
                  </div>
                ))
              ) : errorMessage && !hasFeedItems ? (
                <div className="rounded-xl border border-red-500/20 bg-red-950/20 px-3 py-4 text-xs text-red-100/80">
                  {errorMessage}
                </div>
              ) : !hasFeedItems ? (
                <div className="rounded-xl border border-white/10 bg-white/5 px-3 py-4 text-xs text-white/50">
                  The network feed is quiet right now.
                </div>
              ) : (
                <motion.div layout className="space-y-4">
                  <AnimatePresence initial={false}>
                    {rows.map((row) => (
                      <motion.div
                        key={row.id}
                        layout
                        initial={{ opacity: 0, y: -10, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 8, scale: 0.98 }}
                        transition={{
                          opacity: { duration: 0.2 },
                          layout: { duration: 0.25 },
                        }}
                      >
                        {row.kind === "human" ? (
                          <WidgetHumanRow event={row.event} />
                        ) : (
                          <HistoricalAgentFeedCard item={row.item} compact />
                        )}
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </motion.div>
              )}
            </div>
            <div className="px-4 py-3 border-t border-white/10 bg-white/5 flex items-center justify-between">
              <span
                className={`text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5 ${
                  errorMessage ? "text-red-300" : "text-green-400"
                }`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    errorMessage ? "bg-red-400" : "bg-green-500 animate-pulse"
                  }`}
                />
                {errorMessage ? "Network Offline" : "Network Active"}
              </span>
              <Link
                href="/feed"
                className="text-[10px] text-purple-300 hover:text-purple-200 uppercase tracking-wider underline"
              >
                Open Network Feed
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {!isVisible && (
        <motion.button
          initial={{ x: 50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          whileHover={{ x: -4, scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setIsVisible(true)}
          className="fixed right-0 top-1/3 w-8 h-36 rounded-l-2xl bg-gradient-to-b from-purple-900/80 to-indigo-950/80 hover:from-purple-800 hover:to-indigo-900 shadow-xl shadow-purple-950/50 flex flex-col items-center justify-center gap-3 z-50 border-y border-l border-purple-500/30 text-white cursor-pointer select-none transition-all duration-300"
          aria-label="Show Network Feed"
        >
          <span className="text-sm animate-pulse text-purple-300 leading-none">⚡</span>
          <span
            className="text-[9px] font-black uppercase tracking-[0.25em] text-purple-200/90 whitespace-nowrap"
            style={{
              writingMode: "vertical-rl",
              textOrientation: "mixed",
            }}
          >
            ASTRAL PULSE
          </span>
        </motion.button>
      )}
    </>
  );
}

function WidgetHumanRow({ event }: { event: FeedEvent }) {
  const actorName = event.actorName || event.user;
  const actorId = event.actorId || event.userId;
  const actorHref = actorId ? `/profile/${actorId}` : null;
  const timeLabel = formatDistanceToNow(event.createdAt);
  const narration = getEventNarration(event);

  return (
    <div className="flex gap-3 items-start group">
      <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 border text-sm shadow-inner overflow-hidden bg-emerald-900/40 border-emerald-500/20 shadow-emerald-500/10">
        {event.actorImage ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={event.actorImage}
            alt={actorName || "Avatar"}
            className="w-full h-full object-cover"
          />
        ) : (
          narration.icon
        )}
      </div>
      <div className="flex-1">
        <p className="text-xs text-white/90 font-medium leading-relaxed">
          {actorName && (
            <>
              {actorHref ? (
                <Link
                  href={actorHref}
                  className="text-emerald-300 hover:text-emerald-200 font-bold underline-offset-2 hover:underline transition-colors"
                >
                  {actorName}
                </Link>
              ) : (
                <span className="text-emerald-300 font-bold">{actorName}</span>
              )}{" "}
            </>
          )}
          {narration.href ? (
            <Link
              href={narration.href}
              className="text-white/85 hover:text-white underline decoration-purple-500/30 underline-offset-2"
            >
              {narration.action}
            </Link>
          ) : (
            narration.action
          )}
        </p>
        <div className="flex items-center gap-2 mt-1">
          {timeLabel && <p className="text-[10px] text-white/40">{timeLabel}</p>}
        </div>
      </div>
    </div>
  );
}
