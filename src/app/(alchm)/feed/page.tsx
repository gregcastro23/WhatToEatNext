"use client";

import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import Link from "next/link";
import { useSession } from "next-auth/react";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { CookedDishCard } from "@/components/feed/CookedDishCard";
import { HistoricalAgentFeedCard } from "@/components/feed/HistoricalAgentFeedItems";
import { LunarTableStrip } from "@/components/feed/LunarTableStrip";
import { TransitInviteBanner } from "@/components/feed/TransitInviteBanner";
import { useLiveFeedEvents } from "@/hooks/useLiveFeedEvents";
import { firePractice } from "@/lib/economy/practiceClient";
import { narrateFeedEvent } from "@/lib/feed/eventNarration";
import type { HistoricalAgentFeedItem } from "@/lib/feed/historicalAgentFeed";
import { fetchHistoricalAgentFeed } from "@/lib/feed/historicalAgentFeedSource";
import { TOKEN_TYPES } from "@/types/economy";
import type { TokenType } from "@/types/economy";

// ─── Types ────────────────────────────────────────────────────────────────────

interface FeedEvent {
  id: string;
  actorId: string;
  actorName: string;
  actorImage?: string;
  actorIsAgent: boolean;
  actorSlug?: string;
  eventType: string;
  metadataPayload: any;
  createdAt: string;
  reactionCount?: number;
  /** Identity resolver output (PR 4): real identity rendered when true. */
  actorRevealed?: boolean;
}

interface AgentSummary {
  userId: string;
  handle: string;
  name: string;
  bio: string | null;
  dominantElement: string | null;
  monicaConstant: number | null;
  lastActionAt: string | null;
  actionCount: number;
}

interface NetworkTransaction {
  id: string;
  userId: string;
  tokenType: string;
  amount: number;
  sourceType: string;
  description: string | null;
  createdAt: string;
  actorIsAgent: boolean;
  actorName: string;
}

interface SwapRate {
  fromToken: TokenType;
  toToken: TokenType;
  rate: number;
  modifier: number;
}

interface SwapRateContext {
  rulingHourPlanet: string;
  rulingDayPlanet: string;
  rates: SwapRate[];
  generatedAt: string;
  validUntil: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const TAB_NAV = [
  { id: "feed", label: "Feed", icon: "⚡" },
  { id: "agents", label: "Agents", icon: "🤖" },
  { id: "transactions", label: "Transactions", icon: "🝇" },
  { id: "swap", label: "Swap", icon: "🔁" },
] as const;

type TabId = (typeof TAB_NAV)[number]["id"];

const TOKEN_VISUAL: Record<
  string,
  { symbol: string; color: string; bg: string; border: string }
> = {
  Spirit: {
    symbol: "🝇",
    color: "text-amber-400",
    bg: "bg-amber-500/10",
    border: "border-amber-400/25",
  },
  Essence: {
    symbol: "🝑",
    color: "text-blue-400",
    bg: "bg-blue-500/10",
    border: "border-blue-400/25",
  },
  Matter: {
    symbol: "🝙",
    color: "text-emerald-400",
    bg: "bg-emerald-500/10",
    border: "border-emerald-400/25",
  },
  Substance: {
    symbol: "🝉",
    color: "text-purple-400",
    bg: "bg-purple-500/10",
    border: "border-purple-400/25",
  },
};

const ELEMENT_TINT: Record<string, string> = {
  Fire: "text-amber-400",
  Water: "text-blue-400",
  Earth: "text-emerald-400",
  Air: "text-purple-400",
};

const PLANET_GLYPH: Record<string, string> = {
  Sun: "☉",
  Moon: "☽",
  Mercury: "☿",
  Venus: "♀",
  Mars: "♂",
  Jupiter: "♃",
  Saturn: "♄",
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatRelativeTime(iso: string): string {
  const then = new Date(iso).getTime();
  const diffSec = Math.max(0, Math.floor((Date.now() - then) / 1000));
  if (diffSec < 60) return `${diffSec}s ago`;
  if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
  if (diffSec < 86_400) return `${Math.floor(diffSec / 3600)}h ago`;
  return `${Math.floor(diffSec / 86_400)}d ago`;
}

function getEventNarration(event: FeedEvent) {
  return narrateFeedEvent(event.eventType, event.metadataPayload);
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function FeedPage() {
  const [activeTab, setActiveTab] = useState<TabId>("feed");
  const [events, setEvents] = useState<FeedEvent[]>([]);
  const [historicalItems, setHistoricalItems] = useState<
    HistoricalAgentFeedItem[]
  >([]);
  const [agents, setAgents] = useState<AgentSummary[]>([]);
  const [transactions, setTransactions] = useState<NetworkTransaction[]>([]);
  const [swapContext, setSwapContext] = useState<SwapRateContext | null>(null);
  const [loading, setLoading] = useState({
    feed: true,
    agents: true,
    transactions: true,
    swap: true,
  });
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [loadWarning, setLoadWarning] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const requestInFlight = useRef(false);

  const refreshAll = useCallback(async (manual = false) => {
    if (requestInFlight.current) return;
    requestInFlight.current = true;
    if (manual) setIsRefreshing(true);

    try {
      const [feedRes, agentsRes, txnRes, ratesRes, historicalRes] =
        await Promise.allSettled([
          fetch("/api/feed?limit=40"),
          fetch("/api/community/agents?limit=80"),
          fetch("/api/economy/transactions/recent?limit=40"),
          fetch("/api/economy/swap-rates"),
          fetchHistoricalAgentFeed(40),
        ]);
      let failedSources = 0;

      if (feedRes.status === "fulfilled" && feedRes.value.ok) {
        const data = await feedRes.value.json();
        if (data.success) setEvents(data.events || []);
      } else {
        failedSources += 1;
      }
      if (historicalRes.status === "fulfilled") {
        setHistoricalItems(historicalRes.value);
      } else {
        failedSources += 1;
      }
      setLoading((prev) => ({ ...prev, feed: false }));

      if (agentsRes.status === "fulfilled" && agentsRes.value.ok) {
        const data = await agentsRes.value.json();
        if (data.success) setAgents(data.agents || []);
      } else {
        failedSources += 1;
      }
      setLoading((prev) => ({ ...prev, agents: false }));

      if (txnRes.status === "fulfilled" && txnRes.value.ok) {
        const data = await txnRes.value.json();
        if (data.success) setTransactions(data.transactions || []);
      } else {
        failedSources += 1;
      }
      setLoading((prev) => ({ ...prev, transactions: false }));

      if (ratesRes.status === "fulfilled" && ratesRes.value.ok) {
        const data = await ratesRes.value.json();
        if (data.success) {
          setSwapContext({
            rulingHourPlanet: data.rulingHourPlanet,
            rulingDayPlanet: data.rulingDayPlanet,
            rates: data.rates,
            generatedAt: data.generatedAt,
            validUntil: data.validUntil,
          });
        }
      } else {
        failedSources += 1;
      }
      setLoading((prev) => ({ ...prev, swap: false }));

      if (failedSources > 0) {
        setLoadWarning(
          `${failedSources} network source${failedSources === 1 ? " is" : "s are"} temporarily unavailable. Showing the latest data we have.`,
        );
      } else {
        setLoadWarning(null);
      }
      setLastUpdated(new Date());
    } catch {
      setLoadWarning(
        "The network returned an unexpected response. Showing the latest data we have.",
      );
      setLoading({
        feed: false,
        agents: false,
        transactions: false,
        swap: false,
      });
    } finally {
      requestInFlight.current = false;
      setIsRefreshing(false);
    }
  }, []);

  // Joining the commons quietly counts (invisible practice, dedupes daily
  // server-side; silent no-op for signed-out visitors).
  useEffect(() => {
    firePractice("feed_visit");
  }, []);

  // The 30s HTTP poll stays in place: it covers agents/transactions/swap
  // rates (which have no live table yet) and is the degraded fallback for
  // the feed itself when the SpacetimeDB subscription below isn't live.
  useEffect(() => {
    void refreshAll();
    // Jittered ~30–40s poll (not a fixed setInterval): spreading each client's
    // tick over a 10s window stops thousands of tabs from hitting /api/feed and
    // its companion tickers in lockstep, which would spike DB connections at
    // influx. Re-jitter every tick so clients don't re-converge over time.
    let timer = 0;
    const schedule = () => {
      const delay = 30_000 + Math.floor(Math.random() * 10_000);
      timer = window.setTimeout(() => {
        if (document.visibilityState === "visible") void refreshAll();
        schedule();
      }, delay);
    };
    schedule();
    return () => window.clearTimeout(timer);
  }, [refreshAll]);

  // Real-time feed events pushed over the SpacetimeDB WebSocket (the
  // sanctioned exception to the polling rule — see useLiveFeedEvents).
  // Live events come from a separate store than the Postgres-backed
  // /api/feed rows, so a plain prepend cannot duplicate entries.
  const liveEvents = useLiveFeedEvents();
  const mergedEvents = useMemo(
    () => (liveEvents === null ? events : [...liveEvents, ...events]),
    [liveEvents, events],
  );

  const visibleActivityCount = useMemo(
    () =>
      mergedEvents.filter((event) => !event.actorIsAgent).length +
      historicalItems.length,
    [historicalItems.length, mergedEvents],
  );

  const tabCounts: Partial<Record<TabId, number>> = {
    feed: visibleActivityCount,
    agents: agents.length,
    transactions: transactions.length,
  };

  return (
    <div className="min-h-screen bg-[#08080e] pb-28">
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-950/20 via-[#08080e] to-amber-950/10" />
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-purple-600/5 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 pt-24 md:pt-28">
        <header className="mb-7 grid gap-5 lg:grid-cols-[minmax(0,1fr)_340px] lg:items-end">
          <div>
            <div className="inline-flex items-center gap-2 mb-4 text-[10px] font-black text-purple-300/70 uppercase tracking-[0.32em]">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.8)]" />
              The Astral Network
            </div>
            <h1 className="text-4xl md:text-6xl font-black text-white tracking-[-0.055em] leading-[0.94] mb-4">
              The kitchen is
              <br className="hidden sm:block" /> alive.
            </h1>
            <p className="text-white/48 text-sm md:text-base leading-relaxed max-w-2xl">
              Follow what alchemists are making, meet the agents shaping the
              network, and read the ESMS ledger in real time.
            </p>
          </div>

          <aside
            className="rounded-2xl border border-white/10 bg-white/[0.035] p-4 backdrop-blur-xl"
            aria-label="Network pulse"
          >
            <div className="flex items-center justify-between gap-3 mb-4">
              <span className="text-[9px] font-black text-white/35 uppercase tracking-[0.28em]">
                Network pulse
              </span>
              <span
                className={`inline-flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-widest ${liveEvents !== null ? "text-emerald-300" : "text-amber-300"}`}
              >
                <span
                  className={`h-1.5 w-1.5 rounded-full ${liveEvents !== null ? "bg-emerald-400" : "bg-amber-400"}`}
                />
                {liveEvents !== null ? "Realtime" : "30s refresh"}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <PulseMetric value={visibleActivityCount} label="Signals" />
              <PulseMetric value={agents.length} label="Agents" />
              <PulseMetric value={transactions.length} label="Ledger" />
            </div>
            {swapContext && (
              <div className="mt-4 pt-3 border-t border-white/8 flex items-center justify-between gap-3 text-xs">
                <span className="text-white/35 uppercase tracking-widest text-[9px]">
                  Ruling hour
                </span>
                <span className="text-white/75">
                  {PLANET_GLYPH[swapContext.rulingHourPlanet] || "✨"}{" "}
                  {swapContext.rulingHourPlanet}
                </span>
              </div>
            )}
          </aside>
        </header>

        <div className="mb-7 flex flex-col gap-3 border-y border-white/8 py-3 sm:flex-row sm:items-center sm:justify-between">
          <nav
            aria-label="Network sections"
            className="flex gap-1 overflow-x-auto pb-1 sm:pb-0"
          >
            {TAB_NAV.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                aria-pressed={activeTab === tab.id}
                aria-label={`${tab.label}${tabCounts[tab.id] !== undefined ? ` (${tabCounts[tab.id]})` : ""}`}
                className={`shrink-0 min-h-11 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all border ${
                  activeTab === tab.id
                    ? "bg-white text-[#0b0911] border-white shadow-lg shadow-white/10"
                    : "bg-white/[0.02] text-white/50 border-white/10 hover:text-white/80 hover:border-white/20"
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
                {tabCounts[tab.id] !== undefined && (
                  <span
                    className={`ml-2 font-mono ${activeTab === tab.id ? "text-black/45" : "text-white/25"}`}
                  >
                    {tabCounts[tab.id]}
                  </span>
                )}
              </button>
            ))}
          </nav>
          <div className="flex items-center justify-between gap-3 sm:justify-end">
            <span
              className="text-[9px] uppercase tracking-widest text-white/25"
              aria-live="polite"
            >
              {lastUpdated
                ? `Updated ${lastUpdated.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`
                : "Connecting…"}
            </span>
            <button
              type="button"
              onClick={() => {
                void refreshAll(true);
              }}
              disabled={isRefreshing}
              className="min-h-10 rounded-full border border-white/10 bg-white/[0.03] px-3 text-[9px] font-black uppercase tracking-widest text-white/55 transition hover:border-white/20 hover:text-white disabled:cursor-wait disabled:opacity-50"
            >
              <span
                aria-hidden="true"
                className={isRefreshing ? "inline-block animate-spin" : ""}
              >
                ↻
              </span>{" "}
              {isRefreshing ? "Refreshing" : "Refresh"}
            </button>
          </div>
        </div>

        {loadWarning && (
          <div
            className="mb-5 flex items-start gap-3 rounded-2xl border border-amber-400/20 bg-amber-400/[0.07] px-4 py-3 text-xs text-amber-100/75"
            role="status"
          >
            <span aria-hidden="true">◌</span>
            <p>{loadWarning}</p>
          </div>
        )}

        <AnimatePresence mode="wait">
          {activeTab === "feed" && (
            <motion.div
              key="feed"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
            >
              <FeedTab
                events={mergedEvents}
                historicalItems={historicalItems}
                loading={loading.feed}
              />
              {liveEvents !== null && (
                <div className="mt-3 text-center">
                  <span
                    className="inline-flex items-center gap-1.5 rounded-full border border-amber-300/30 bg-amber-400/10 px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-wider text-amber-300"
                    title="New events arrive instantly over the SpacetimeDB connection"
                  >
                    ⚡ {liveEvents.length} live
                  </span>
                </div>
              )}
            </motion.div>
          )}
          {activeTab === "agents" && (
            <motion.div
              key="agents"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
            >
              <AgentsTab agents={agents} loading={loading.agents} />
            </motion.div>
          )}
          {activeTab === "transactions" && (
            <motion.div
              key="transactions"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
            >
              <TransactionsTab
                transactions={transactions}
                loading={loading.transactions}
              />
            </motion.div>
          )}
          {activeTab === "swap" && (
            <motion.div
              key="swap"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
            >
              <SwapTab
                context={swapContext}
                loading={loading.swap}
                onSwapComplete={() => {
                  void refreshAll();
                }}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function PulseMetric({ value, label }: { value: number; label: string }) {
  return (
    <div>
      <p className="font-mono text-xl tabular-nums text-white">{value}</p>
      <p className="mt-0.5 text-[8px] font-bold uppercase tracking-widest text-white/30">
        {label}
      </p>
    </div>
  );
}

// ─── Feed Tab ─────────────────────────────────────────────────────────────────

type FeedRow =
  | { kind: "human"; id: string; ts: number; event: FeedEvent }
  | { kind: "agent"; id: string; ts: number; item: HistoricalAgentFeedItem };

const FEED_FILTERS = [
  { id: "all", label: "Everything" },
  { id: "people", label: "People" },
  { id: "agents", label: "Agents" },
  { id: "cosmic", label: "Cosmic" },
] as const;

type FeedFilter = (typeof FEED_FILTERS)[number]["id"];

function FeedTab({
  events,
  historicalItems,
  loading,
}: {
  events: FeedEvent[];
  historicalItems: HistoricalAgentFeedItem[];
  loading: boolean;
}) {
  const [filter, setFilter] = useState<FeedFilter>("all");
  const reduceMotion = useReducedMotion();

  // Retain human-alchemist activity; retire the planetary-agent posts (all
  // current `feed_events` agents) by filtering them out, and merge in the
  // historical-agent recipe posts + yield claims, sorted chronologically.
  const rows = useMemo<FeedRow[]>(() => {
    const humanRows: FeedRow[] = events
      .filter((event) => !event.actorIsAgent)
      .map((event) => ({
        kind: "human",
        id: event.id,
        ts: Date.parse(event.createdAt) || 0,
        event,
      }));
    const agentRows: FeedRow[] = historicalItems.map((item) => ({
      kind: "agent",
      id: item.id,
      ts: Date.parse(item.createdAt) || 0,
      item,
    }));
    return [...humanRows, ...agentRows].sort((a, b) => b.ts - a.ts);
  }, [events, historicalItems]);

  const filteredRows = useMemo(() => {
    if (filter === "all") return rows;
    return rows.filter((row) => {
      if (filter === "people") return row.kind === "human";
      if (row.kind !== "agent") return false;
      if (filter === "cosmic") return row.item.type === "planetary_resonance";
      return row.item.type !== "planetary_resonance";
    });
  }, [filter, rows]);

  const filterCounts = useMemo<Record<FeedFilter, number>>(
    () => ({
      all: rows.length,
      people: rows.filter((row) => row.kind === "human").length,
      agents: rows.filter(
        (row) =>
          row.kind === "agent" && row.item.type !== "planetary_resonance",
      ).length,
      cosmic: rows.filter(
        (row) =>
          row.kind === "agent" && row.item.type === "planetary_resonance",
      ).length,
    }),
    [rows],
  );

  if (loading) {
    return (
      <div
        className="space-y-3"
        role="status"
        aria-label="Loading network activity"
      >
        {[0, 1, 2].map((item) => (
          <div
            key={item}
            className="h-28 animate-pulse rounded-2xl border border-white/8 bg-white/[0.035]"
          />
        ))}
      </div>
    );
  }
  if (rows.length === 0) {
    return (
      <div className="glass-card-premium rounded-3xl p-10 text-center border-white/8">
        <p className="text-white/40">The astral network is quiet today.</p>
        <p className="mt-2 text-xs text-white/25">
          Historical agents will appear here as they transmute new recipes.
        </p>
      </div>
    );
  }

  return (
    <section aria-labelledby="activity-heading">
      {/* Personal invite when today's sky touches the viewer's chart */}
      <TransitInviteBanner />
      {/* The sky's standing invitation — open or upcoming lunar table */}
      <LunarTableStrip />
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[9px] font-black uppercase tracking-[0.28em] text-purple-300/55">
            Activity stream
          </p>
          <h2
            id="activity-heading"
            className="mt-1 text-xl font-bold tracking-tight text-white"
          >
            What’s happening now
          </h2>
        </div>
        <div
          className="flex gap-1 overflow-x-auto"
          aria-label="Filter network activity"
        >
          {FEED_FILTERS.map((option) => (
            <button
              key={option.id}
              type="button"
              onClick={() => setFilter(option.id)}
              aria-pressed={filter === option.id}
              aria-label={`${option.label} (${filterCounts[option.id]})`}
              className={`min-h-10 shrink-0 rounded-full border px-3 text-[9px] font-black uppercase tracking-widest transition ${
                filter === option.id
                  ? "border-purple-300/35 bg-purple-400/15 text-purple-100"
                  : "border-white/8 bg-white/[0.025] text-white/35 hover:border-white/15 hover:text-white/70"
              }`}
            >
              {option.label}{" "}
              <span className="ml-1 font-mono opacity-55">
                {filterCounts[option.id]}
              </span>
            </button>
          ))}
        </div>
      </div>

      {filteredRows.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-white/10 bg-white/[0.02] p-10 text-center">
          <p className="text-sm text-white/45">
            No signals match this view yet.
          </p>
          <button
            type="button"
            onClick={() => setFilter("all")}
            className="mt-3 text-[10px] font-bold uppercase tracking-widest text-purple-300 hover:text-purple-200"
          >
            Show everything
          </button>
        </div>
      ) : (
        <ol className="space-y-3" aria-live="polite">
          <AnimatePresence initial={false}>
            {filteredRows.map((row, index) => (
              <motion.li
                key={row.id}
                initial={reduceMotion ? false : { opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reduceMotion ? undefined : { opacity: 0, y: -4 }}
                transition={{
                  delay: reduceMotion ? 0 : Math.min(index, 6) * 0.025,
                }}
              >
                {row.kind === "human" ? (
                  <HumanFeedRow event={row.event} />
                ) : (
                  <HistoricalAgentFeedCard item={row.item} />
                )}
              </motion.li>
            ))}
          </AnimatePresence>
        </ol>
      )}
    </section>
  );
}

function HumanFeedRow({ event }: { event: FeedEvent }) {
  const narration = getEventNarration(event);
  const actorHref = `/profile/${event.actorId}`;

  // Cooked-it dish cards render as a full card, not a narration row. When
  // the actor is revealed (identity resolver, PR 4) the real name + avatar
  // head the card; concealed cards keep the pure chart-persona identity.
  if (event.metadataPayload?.card === "cooked") {
    const revealed = event.actorRevealed === true;
    return (
      <CookedDishCard
        eventId={event.id}
        createdAtLabel={formatRelativeTime(event.createdAt)}
        meta={event.metadataPayload}
        initialCount={event.reactionCount ?? 0}
        actorId={revealed ? event.actorId : undefined}
        actorName={revealed ? event.actorName : undefined}
        actorImage={revealed ? event.actorImage : undefined}
      />
    );
  }
  return (
    <div className="glass-card-premium rounded-2xl p-5 transition-all flex items-start gap-4 border-white/8 hover:border-purple-500/20">
      <div className="w-10 h-10 rounded-full glass-base flex items-center justify-center text-xl shrink-0 border border-white/5 overflow-hidden">
        {event.actorImage ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={event.actorImage}
            alt={event.actorName || "Avatar"}
            className="w-full h-full object-cover"
          />
        ) : (
          narration.icon
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-white/80">
          <Link
            href={actorHref}
            className="font-bold mr-1 underline-offset-2 hover:underline transition-colors text-white hover:text-purple-200"
          >
            {event.actorName}
          </Link>{" "}
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
        </div>
      </div>
    </div>
  );
}

// ─── Agents Tab ───────────────────────────────────────────────────────────────

function AgentsTab({
  agents,
  loading,
}: {
  agents: AgentSummary[];
  loading: boolean;
}) {
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<"active" | "name">("active");
  const visibleAgents = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return agents
      .filter(
        (agent) =>
          !normalizedQuery ||
          agent.name.toLowerCase().includes(normalizedQuery) ||
          agent.handle.toLowerCase().includes(normalizedQuery) ||
          agent.dominantElement?.toLowerCase().includes(normalizedQuery),
      )
      .sort((a, b) =>
        sort === "name"
          ? a.name.localeCompare(b.name)
          : (Date.parse(b.lastActionAt || "") || 0) -
            (Date.parse(a.lastActionAt || "") || 0),
      );
  }, [agents, query, sort]);

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500" />
      </div>
    );
  }
  if (agents.length === 0) {
    return (
      <div className="glass-card-premium rounded-3xl p-10 text-center border-white/8">
        <p className="text-white/40">No synchronized agents yet.</p>
      </div>
    );
  }
  return (
    <section aria-labelledby="agents-heading">
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[9px] font-black uppercase tracking-[0.28em] text-purple-300/55">
            Network directory
          </p>
          <h2
            id="agents-heading"
            className="mt-1 text-xl font-bold tracking-tight text-white"
          >
            Meet the agents
          </h2>
        </div>
        <div className="flex gap-2">
          <label className="min-w-0 flex-1 sm:w-64">
            <span className="sr-only">Search agents</span>
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search agents"
              className="min-h-11 w-full rounded-full border border-white/10 bg-white/[0.035] px-4 text-sm text-white outline-none placeholder:text-white/25 focus:border-purple-300/35"
            />
          </label>
          <label>
            <span className="sr-only">Sort agents</span>
            <select
              value={sort}
              onChange={(event) =>
                setSort(event.target.value as "active" | "name")
              }
              className="min-h-11 rounded-full border border-white/10 bg-[#13101b] px-3 text-xs text-white/65 outline-none focus:border-purple-300/35"
            >
              <option value="active">Recent</option>
              <option value="name">A–Z</option>
            </select>
          </label>
        </div>
      </div>

      {visibleAgents.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-white/10 bg-white/[0.02] p-10 text-center text-sm text-white/40">
          No agents match “{query}”.
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {visibleAgents.map((agent) => (
            <Link
              key={agent.userId}
              href={`/profile/${agent.userId}`}
              className="glass-card-premium rounded-2xl p-5 border-white/8 hover:border-purple-500/35 transition-all flex flex-col gap-3 group"
            >
              <div className="flex items-start justify-between">
                <div className="w-12 h-12 rounded-2xl bg-purple-900/40 border border-purple-400/20 flex items-center justify-center text-xl">
                  🤖
                </div>
                {agent.dominantElement && (
                  <span
                    className={`text-[8px] uppercase tracking-widest font-bold px-2 py-0.5 rounded-full border border-white/10 bg-white/5 ${
                      ELEMENT_TINT[agent.dominantElement] || "text-white/60"
                    }`}
                  >
                    {agent.dominantElement}
                  </span>
                )}
              </div>
              <div>
                <h3 className="font-bold text-white text-base group-hover:text-purple-200 transition-colors">
                  {agent.name}
                </h3>
                <p className="text-[10px] uppercase tracking-widest text-white/30 font-mono mt-0.5">
                  {agent.actionCount} action{agent.actionCount === 1 ? "" : "s"}
                  {agent.lastActionAt
                    ? ` · ${formatRelativeTime(agent.lastActionAt)}`
                    : ""}
                </p>
              </div>
              {agent.bio && (
                <p className="text-xs text-white/55 leading-relaxed line-clamp-3">
                  {agent.bio}
                </p>
              )}
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}

// ─── Transactions Tab ─────────────────────────────────────────────────────────

function TransactionsTab({
  transactions,
  loading,
}: {
  transactions: NetworkTransaction[];
  loading: boolean;
}) {
  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500" />
      </div>
    );
  }
  if (transactions.length === 0) {
    return (
      <div className="glass-card-premium rounded-3xl p-10 text-center border-white/8">
        <p className="text-white/40">The ledger is quiet right now.</p>
      </div>
    );
  }
  const totalVolume = transactions.reduce(
    (sum, transaction) => sum + Math.abs(transaction.amount),
    0,
  );
  const credits = transactions.filter(
    (transaction) => transaction.amount >= 0,
  ).length;

  return (
    <section aria-labelledby="ledger-heading">
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[9px] font-black uppercase tracking-[0.28em] text-purple-300/55">
            ESMS economy
          </p>
          <h2
            id="ledger-heading"
            className="mt-1 text-xl font-bold tracking-tight text-white"
          >
            Recent ledger movement
          </h2>
        </div>
        <div className="flex gap-5 text-right">
          <div>
            <p className="font-mono text-sm tabular-nums text-white">
              {totalVolume.toFixed(1)}
            </p>
            <p className="text-[8px] font-bold uppercase tracking-widest text-white/30">
              Volume
            </p>
          </div>
          <div>
            <p className="font-mono text-sm tabular-nums text-white">
              {credits}
            </p>
            <p className="text-[8px] font-bold uppercase tracking-widest text-white/30">
              Credits
            </p>
          </div>
        </div>
      </div>
      <div className="glass-card-premium rounded-3xl border-white/8 overflow-x-auto">
        <table className="w-full min-w-[680px] text-sm">
          <caption className="sr-only">
            The 40 most recent ESMS network transactions
          </caption>
          <thead>
            <tr className="text-[10px] uppercase tracking-widest text-white/30 border-b border-white/5">
              <th className="text-left px-4 py-3 font-bold">Actor</th>
              <th className="text-left px-4 py-3 font-bold">Token</th>
              <th className="text-right px-4 py-3 font-bold">Amount</th>
              <th className="text-left px-4 py-3 font-bold hidden sm:table-cell">
                Source
              </th>
              <th className="text-right px-4 py-3 font-bold">When</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((txn) => {
              const visual = TOKEN_VISUAL[txn.tokenType] || TOKEN_VISUAL.Spirit;
              const isCredit = txn.amount >= 0;
              return (
                <tr
                  key={txn.id}
                  className="border-b border-white/5 last:border-0 hover:bg-white/[0.02] transition-colors"
                >
                  <td className="px-4 py-3">
                    <Link
                      href={`/profile/${txn.userId}`}
                      className={`text-xs font-bold underline-offset-2 hover:underline ${
                        txn.actorIsAgent ? "text-amber-300" : "text-white/85"
                      }`}
                    >
                      {txn.actorName}
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest border ${visual.bg} ${visual.border} ${visual.color}`}
                    >
                      {visual.symbol} {txn.tokenType}
                    </span>
                  </td>
                  <td
                    className={`px-4 py-3 text-right font-mono tabular-nums text-sm ${isCredit ? "text-green-400" : "text-red-400"}`}
                  >
                    {isCredit ? "+" : ""}
                    {txn.amount.toFixed(2)}
                  </td>
                  <td className="px-4 py-3 text-[10px] uppercase tracking-widest text-white/40 hidden sm:table-cell">
                    {txn.sourceType.replace(/_/g, " ")}
                  </td>
                  <td className="px-4 py-3 text-right text-[10px] uppercase tracking-widest text-white/30 font-mono">
                    {formatRelativeTime(txn.createdAt)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}

// ─── Swap Tab ─────────────────────────────────────────────────────────────────

function SwapTab({
  context,
  loading,
  onSwapComplete,
}: {
  context: SwapRateContext | null;
  loading: boolean;
  onSwapComplete: () => void;
}) {
  const [fromToken, setFromToken] = useState<TokenType>("Spirit");
  const [toToken, setToToken] = useState<TokenType>("Essence");
  const [amount, setAmount] = useState<string>("1");
  const [submitting, setSubmitting] = useState(false);
  const [resultMessage, setResultMessage] = useState<{
    kind: "ok" | "error";
    text: string;
  } | null>(null);
  const { status: authStatus } = useSession();

  // Auto-fix invalid same-token selections
  useEffect(() => {
    if (fromToken === toToken) {
      const next = TOKEN_TYPES.find((t) => t !== fromToken) as TokenType;
      setToToken(next);
    }
  }, [fromToken, toToken]);

  const activeRate = useMemo(() => {
    if (!context) return null;
    return (
      context.rates.find(
        (r) => r.fromToken === fromToken && r.toToken === toToken,
      ) || null
    );
  }, [context, fromToken, toToken]);

  const numericAmount = parseFloat(amount) || 0;
  const cost = activeRate ? numericAmount * activeRate.rate : 0;

  const handleSwap = async () => {
    setResultMessage(null);
    if (!activeRate || numericAmount <= 0) {
      setResultMessage({ kind: "error", text: "Enter a positive amount." });
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/economy/swap", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ fromToken, toToken, amount: numericAmount }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setResultMessage({
          kind: "error",
          text: data.message || "Swap failed.",
        });
      } else {
        setResultMessage({
          kind: "ok",
          text: data.message || "Swap complete.",
        });
        onSwapComplete();
      }
    } catch {
      setResultMessage({ kind: "error", text: "Network error." });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || !context) {
    return (
      <div className="flex justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500" />
      </div>
    );
  }

  return (
    <div className="grid lg:grid-cols-5 gap-6">
      <section className="lg:col-span-3 glass-card-premium rounded-3xl p-6 md:p-8 border-white/8">
        <h2 className="text-[10px] font-black text-white/30 uppercase tracking-[0.4em] mb-4">
          ESMS Coin Swap
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <TokenSelect
            label="From"
            value={fromToken}
            onChange={setFromToken}
            disabled={toToken}
          />
          <TokenSelect
            label="To"
            value={toToken}
            onChange={setToToken}
            disabled={fromToken}
          />
        </div>

        <label className="block mt-6">
          <span className="text-[10px] uppercase tracking-widest text-white/40 font-bold">
            Amount of {toToken} to receive
          </span>
          <input
            type="number"
            min={0}
            step={0.01}
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="mt-2 w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-3 text-white font-mono text-lg tabular-nums focus:outline-none focus:border-purple-400/40"
          />
        </label>

        {activeRate && (
          <div className="mt-6 rounded-2xl border border-purple-400/15 bg-purple-500/8 p-4">
            <div className="flex justify-between items-center text-sm">
              <span className="text-white/60">Current rate</span>
              <span className="text-white font-mono tabular-nums">
                {activeRate.rate.toFixed(4)} {fromToken} → 1 {toToken}
              </span>
            </div>
            <div className="flex justify-between items-center text-sm mt-2">
              <span className="text-white/60">Cosmic modifier</span>
              <span
                className={`font-mono tabular-nums ${
                  activeRate.modifier < 1
                    ? "text-green-400"
                    : activeRate.modifier > 1
                      ? "text-amber-400"
                      : "text-white/70"
                }`}
              >
                ×{activeRate.modifier.toFixed(3)}
              </span>
            </div>
            <div className="flex justify-between items-center text-sm mt-2 pt-2 border-t border-white/5">
              <span className="text-white/60">You will spend</span>
              <span className="text-white font-mono tabular-nums text-base">
                {cost.toFixed(4)} {fromToken}
              </span>
            </div>
          </div>
        )}

        {authStatus === "authenticated" ? (
          <button
            onClick={() => {
              void handleSwap();
            }}
            disabled={submitting || numericAmount <= 0}
            className="mt-6 w-full px-6 py-3 rounded-2xl bg-purple-600 hover:bg-purple-500 disabled:bg-white/10 disabled:text-white/40 text-white font-black text-xs uppercase tracking-[0.3em] shadow-lg shadow-purple-900/40 transition-all"
          >
            {submitting ? "Performing rite..." : "Execute Swap"}
          </button>
        ) : (
          <Link
            href="/login"
            className="mt-6 block text-center w-full px-6 py-3 rounded-2xl bg-purple-600 hover:bg-purple-500 text-white font-black text-xs uppercase tracking-[0.3em] shadow-lg shadow-purple-900/40 transition-all"
          >
            Sign in to swap
          </Link>
        )}

        {resultMessage && (
          <div
            className={`mt-4 rounded-2xl p-3 text-xs ${
              resultMessage.kind === "ok"
                ? "bg-green-500/10 text-green-300 border border-green-500/20"
                : "bg-red-500/10 text-red-300 border border-red-500/20"
            }`}
          >
            {resultMessage.text}
          </div>
        )}

        <p className="text-[10px] uppercase tracking-widest text-white/30 mt-6">
          Rates re-roll at the top of the next planetary hour
          {context.validUntil
            ? ` (≈ ${new Date(context.validUntil).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })})`
            : ""}
          .
        </p>
      </section>

      <section className="lg:col-span-2 glass-card-premium rounded-3xl p-6 border-white/8">
        <h2 className="text-[10px] font-black text-white/30 uppercase tracking-[0.4em] mb-4">
          Live Rate Sheet
        </h2>
        <div className="space-y-2">
          {context.rates.map((rate) => {
            const fromVisual = TOKEN_VISUAL[rate.fromToken];
            const toVisual = TOKEN_VISUAL[rate.toToken];
            const favored = rate.modifier < 1;
            return (
              <button
                key={`${rate.fromToken}-${rate.toToken}`}
                onClick={() => {
                  setFromToken(rate.fromToken);
                  setToToken(rate.toToken);
                }}
                className={`w-full flex items-center justify-between text-xs px-3 py-2 rounded-xl border transition-colors ${
                  rate.fromToken === fromToken && rate.toToken === toToken
                    ? "border-purple-400/40 bg-purple-500/10"
                    : "border-white/5 hover:border-white/15 bg-white/[0.02]"
                }`}
              >
                <span className="flex items-center gap-1.5">
                  <span className={fromVisual.color}>{fromVisual.symbol}</span>
                  <span className="text-white/60">{rate.fromToken}</span>
                  <span className="text-white/30 mx-1">→</span>
                  <span className={toVisual.color}>{toVisual.symbol}</span>
                  <span className="text-white/60">{rate.toToken}</span>
                </span>
                <span
                  className={`font-mono tabular-nums ${
                    favored
                      ? "text-green-400"
                      : rate.modifier > 1
                        ? "text-amber-400"
                        : "text-white/70"
                  }`}
                >
                  {rate.rate.toFixed(3)}
                </span>
              </button>
            );
          })}
        </div>
      </section>
    </div>
  );
}

function TokenSelect({
  label,
  value,
  onChange,
  disabled,
}: {
  label: string;
  value: TokenType;
  onChange: (t: TokenType) => void;
  disabled: TokenType;
}) {
  return (
    <div>
      <span className="text-[10px] uppercase tracking-widest text-white/40 font-bold">
        {label}
      </span>
      <div className="mt-2 grid grid-cols-2 gap-2">
        {TOKEN_TYPES.map((t) => {
          const visual = TOKEN_VISUAL[t];
          const isDisabled = t === disabled;
          const isActive = t === value;
          return (
            <button
              key={t}
              onClick={() => !isDisabled && onChange(t)}
              disabled={isDisabled}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-sm transition-all ${
                isActive
                  ? `${visual.bg} ${visual.border} ${visual.color} font-bold`
                  : isDisabled
                    ? "border-white/5 bg-white/[0.02] text-white/20 cursor-not-allowed"
                    : "border-white/10 bg-white/[0.02] text-white/60 hover:text-white/85 hover:border-white/20"
              }`}
            >
              <span>{visual.symbol}</span>
              <span>{t}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
