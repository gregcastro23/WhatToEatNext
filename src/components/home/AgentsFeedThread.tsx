"use client";

import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { useEffect, useState } from "react";
import { agentChatUrl } from "@/lib/agents/agentChatUrl";
import { ELEMENT_COLORS } from "@/lib/elementColors";
import { narrateFeedEvent } from "@/lib/feed/eventNarration";

type FeedMetadata = Record<string, unknown>;

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
    return { icon: "✨", action: event.action, label: event.action, href: undefined };
  }
  return narrateFeedEvent(event.eventType, event.metadataPayload);
}

function getPlanetarySignature(metadata?: FeedMetadata): PlanetarySignature | null {
  const signature = metadata?.planetarySignature;
  if (!signature || typeof signature !== "object") return null;
  return signature;
}

function formatPlacement(placement: SignaturePlacement): string | null {
  if (!placement.planet) return null;
  const degree = typeof placement.degree === "number" ? `${placement.degree.toFixed(1)}°` : "";
  const sign = placement.sign ? ` ${placement.sign}` : "";
  return `${placement.planet} ${degree}${sign}`.trim();
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
                    {feedItems.map((item) => {
                      const actorName = item.actorName || item.user;
                      const isAgent =
                        item.actorIsAgent ?? item.isAgent === true;
                      const actorId = item.actorId || item.userId;
                      const actorHref = actorId ? `/profile/${actorId}` : null;
                      const timeLabel = formatDistanceToNow(item.createdAt);
                      const signature = isAgent
                        ? getPlanetarySignature(item.metadataPayload)
                        : null;
                      const narration = getEventNarration(item);
                      const natalPlacements =
                        signature?.natalPositions
                          ?.map(formatPlacement)
                          .filter(Boolean)
                          .slice(0, 3) || [];

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
                            className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 border text-sm shadow-inner transition-colors overflow-hidden ${
                              isAgent
                                ? "bg-purple-900/50 border-purple-500/20 shadow-purple-500/10"
                                : "bg-emerald-900/40 border-emerald-500/20 shadow-emerald-500/10"
                            }`}
                          >
                            {item.actorImage ? (
                              /* eslint-disable-next-line @next/next/no-img-element */
                              <img
                                src={item.actorImage}
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
                                      className={`${isAgent ? "text-purple-300 hover:text-purple-200" : "text-emerald-300 hover:text-emerald-200"} font-bold underline-offset-2 hover:underline transition-colors`}
                                    >
                                      {actorName}
                                    </Link>
                                  ) : (
                                    <span
                                      className={`${isAgent ? "text-purple-300" : "text-emerald-300"} font-bold`}
                                    >
                                      {actorName}
                                    </span>
                                  )}{" "}
                                </>
                              )}
                              {isAgent && (
                                <span className="inline-block px-1 py-0.5 ml-1 mr-1 rounded text-[8px] uppercase tracking-wider bg-purple-500/20 text-purple-200">
                                  Agent
                                </span>
                              )}{" "}
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
                              {timeLabel && (
                                <p className="text-[10px] text-white/40">
                                  {timeLabel}
                                </p>
                              )}
                              {isAgent && item.actorSlug && (
                                <a
                                  href={agentChatUrl(item.actorSlug)}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-[10px] text-purple-400 hover:text-purple-300 uppercase tracking-wider font-semibold"
                                >
                                  · Chat ✦
                                </a>
                              )}
                            </div>
                            {signature && (
                              <div
                                className={`mt-2 rounded-lg border px-2 py-1.5 ${
                                  ELEMENT_COLORS[signature.dominantElement ?? ""] ??
                                  "border-purple-400/15 bg-purple-500/10 text-purple-100/70"
                                }`}
                              >
                                <div className="flex flex-wrap gap-x-2 gap-y-1 text-[9px] uppercase tracking-wider font-bold">
                                  {(signature.planetaryHour || signature.dominantPlanet) && (
                                    <span>
                                      Hour {signature.planetaryHour || signature.dominantPlanet}
                                    </span>
                                  )}
                                  {signature.sacredStat && <span>{signature.sacredStat}</span>}
                                  {signature.dominantElement && <span>{signature.dominantElement}</span>}
                                </div>
                                {natalPlacements.length > 0 && (
                                  <p className="mt-1 text-[10px] leading-snug opacity-80">
                                    Natal {natalPlacements.join(" · ")}
                                  </p>
                                )}
                              </div>
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
