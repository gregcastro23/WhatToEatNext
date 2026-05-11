"use client";

import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { useEffect, useState } from "react";

type FeedMetadata = Record<string, unknown>;

interface FeedEvent {
  id: string;
  actorName?: string;
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

function getMetadataText(
  metadata: FeedMetadata | undefined,
  key: string,
): string | undefined {
  const value = metadata?.[key];
  return typeof value === "string" && value.trim().length > 0
    ? value
    : undefined;
}

function getEventIcon(eventType?: string): string {
  switch (eventType) {
    case "claim_daily":
      return "⚗️";
    case "commensal_request":
      return "🤝";
    case "recipe_generation":
      return "🍽️";
    case "insight":
      return "👁️";
    case "lab_entry":
      return "📓";
    case "made_it":
      return "✅";
    default:
      return "✨";
  }
}

function getEventAction(event: FeedEvent): string {
  if (event.action?.trim()) return event.action;

  switch (event.eventType) {
    case "claim_daily":
      return "claimed their daily alchemical yield.";
    case "commensal_request": {
      const targetName = getMetadataText(event.metadataPayload, "targetName");
      return targetName
        ? `sent a dining companion request to ${targetName}.`
        : "sent a dining companion request.";
    }
    case "recipe_generation": {
      const recipeName = getMetadataText(event.metadataPayload, "recipeName");
      return recipeName
        ? `transmuted ingredients into ${recipeName}.`
        : "transmuted ingredients into a new recipe.";
    }
    case "insight": {
      const title = getMetadataText(event.metadataPayload, "insightTitle");
      return title
        ? `channeled an alchemical insight: "${title}".`
        : "channeled a new alchemical insight.";
    }
    case "lab_entry": {
      const dishName = getMetadataText(event.metadataPayload, "dishName");
      return dishName
        ? `recorded a new experiment: ${dishName}.`
        : "recorded a new experiment in their lab book.";
    }
    case "made_it": {
      const recipeName = getMetadataText(event.metadataPayload, "recipeName");
      const rating = event.metadataPayload?.rating;
      const base = recipeName ? `prepared ${recipeName}` : "prepared a community recipe";
      return rating ? `${base} and gave it ${rating} stars.` : `${base}.`;
    }
    default:
      return event.eventType
        ? event.eventType.replaceAll("_", " ").trim()
        : "recorded network activity.";
  }
}

export function AgentsFeedThread() {
  const [isVisible, setIsVisible] = useState(true);
  const [feedItems, setFeedItems] = useState<FeedEvent[]>([]);
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

        const response = await fetch("/api/feed?limit=8", {
          signal: controller.signal,
        });

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

  const hasFeedItems = feedItems.length > 0;

  return (
    <>
      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed bottom-6 right-6 w-80 sm:w-96 z-50 glass-card-premium rounded-2xl border border-purple-500/30 shadow-2xl shadow-purple-900/30 overflow-hidden bg-[#08080e]/90 backdrop-blur-xl"
          >
            <div className="flex justify-between items-center px-4 py-3 border-b border-white/10 bg-white/5">
              <div className="flex items-center gap-2">
                <span className="text-purple-400">⚡</span>
                <h3 className="text-sm font-bold text-white tracking-wide">
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
            <div className="p-4 space-y-4 max-h-64 overflow-y-auto custom-scrollbar">
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
                    {feedItems.map((item) => {
                      const actorName = item.actorName || item.user;
                      const isAgent =
                        item.actorIsAgent ?? item.isAgent === true;
                      const timeLabel = formatDistanceToNow(item.createdAt);

                      return (
                        <motion.div
                          key={item.id}
                          layout
                          initial={{ opacity: 0, y: -10, scale: 0.98 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 8, scale: 0.98 }}
                          transition={{
                            opacity: { duration: 0.2 },
                            layout: { duration: 0.25 },
                          }}
                          className="flex gap-3 items-start group"
                        >
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 border text-sm shadow-inner transition-colors ${
                              isAgent
                                ? "bg-purple-900/50 border-purple-500/20 shadow-purple-500/10"
                                : "bg-emerald-900/40 border-emerald-500/20 shadow-emerald-500/10"
                            }`}
                          >
                            {getEventIcon(item.eventType)}
                          </div>
                          <div className="flex-1">
                            <p className="text-xs text-white/90 font-medium leading-relaxed">
                              {actorName && (
                                <>
                                  <span
                                    className={`${isAgent ? "text-purple-300" : "text-emerald-300"} font-bold`}
                                  >
                                    {actorName}
                                  </span>{" "}
                                </>
                              )}
                              {isAgent && (
                                <span className="inline-block px-1 py-0.5 ml-1 mr-1 rounded text-[8px] uppercase tracking-wider bg-purple-500/20 text-purple-200">
                                  Agent
                                </span>
                              )}
                              {getEventAction(item)}
                            </p>
                            {timeLabel && (
                              <p className="text-[10px] text-white/40 mt-1">
                                {timeLabel}
                              </p>
                            )}
                          </div>
                        </motion.div>
                      );
                    })}
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
                href="/profile#agents"
                className="text-[10px] text-purple-300 hover:text-purple-200 uppercase tracking-wider underline"
              >
                View Network
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {!isVisible && (
        <motion.button
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsVisible(true)}
          className="fixed bottom-6 right-6 w-12 h-12 rounded-full bg-purple-600 hover:bg-purple-500 shadow-lg shadow-purple-900/50 flex items-center justify-center z-50 border border-purple-400/50 text-xl"
          aria-label="Show Network Feed"
        >
          ⚡
        </motion.button>
      )}
    </>
  );
}
