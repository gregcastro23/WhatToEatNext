"use client";

import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import Header from "@/components/Header";
import { TOKEN_TYPES } from "@/types/economy";
import type { TokenType } from "@/types/economy";

// ─── Types ────────────────────────────────────────────────────────────────────

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
  actorId: string;
  actorName: string;
  actorIsAgent: boolean;
  eventType: string;
  metadataPayload: any;
  createdAt: string;
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

const TOKEN_VISUAL: Record<string, { symbol: string; color: string; bg: string; border: string }> = {
  Spirit:    { symbol: "🝇", color: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-400/25" },
  Essence:   { symbol: "🝑", color: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-400/25" },
  Matter:    { symbol: "🝙", color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-400/25" },
  Substance: { symbol: "🝉", color: "text-purple-400", bg: "bg-purple-500/10", border: "border-purple-400/25" },
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

function getEventIcon(type: string): string {
  switch (type) {
    case "claim_daily":        return "⚗️";
    case "commensal_request":  return "🤝";
    case "recipe_generation":  return "🍽️";
    case "insight":            return "👁️";
    case "lab_entry":          return "📓";
    case "made_it":            return "✅";
    default:                   return "✨";
  }
}

function getEventText(event: FeedEvent): string {
  switch (event.eventType) {
    case "claim_daily":
      return `claimed their daily alchemical yield.`;
    case "commensal_request":
      return `sent a dining companion request to ${event.metadataPayload?.targetName || "another alchemist"}.`;
    case "recipe_generation":
      return `transmuted ingredients into ${event.metadataPayload?.recipeName || "a new recipe"}.`;
    case "insight":
      return `channeled an alchemical insight: "${event.metadataPayload?.insightTitle || "Universal Harmony"}".`;
    case "lab_entry":
      return `recorded a new experiment: ${event.metadataPayload?.dishName || "Alchemical Fusion"}.`;
    case "made_it": {
      const recipeName = event.metadataPayload?.recipeName || "a community recipe";
      const rating = event.metadataPayload?.rating;
      return rating ? `prepared ${recipeName} and gave it ${rating} stars.` : `prepared ${recipeName}.`;
    }
    default:
      return `performed an alchemical action.`;
  }
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function FeedPage() {
  const [activeTab, setActiveTab] = useState<TabId>("feed");
  const [events, setEvents] = useState<FeedEvent[]>([]);
  const [agents, setAgents] = useState<AgentSummary[]>([]);
  const [transactions, setTransactions] = useState<NetworkTransaction[]>([]);
  const [swapContext, setSwapContext] = useState<SwapRateContext | null>(null);
  const [loading, setLoading] = useState({ feed: true, agents: true, transactions: true, swap: true });

  const refreshAll = useCallback(async () => {
    const [feedRes, agentsRes, txnRes, ratesRes] = await Promise.allSettled([
      fetch("/api/feed?limit=40"),
      fetch("/api/community/agents?limit=80"),
      fetch("/api/economy/transactions/recent?limit=40"),
      fetch("/api/economy/swap-rates"),
    ]);

    if (feedRes.status === "fulfilled" && feedRes.value.ok) {
      const data = await feedRes.value.json();
      if (data.success) setEvents(data.events || []);
    }
    setLoading((prev) => ({ ...prev, feed: false }));

    if (agentsRes.status === "fulfilled" && agentsRes.value.ok) {
      const data = await agentsRes.value.json();
      if (data.success) setAgents(data.agents || []);
    }
    setLoading((prev) => ({ ...prev, agents: false }));

    if (txnRes.status === "fulfilled" && txnRes.value.ok) {
      const data = await txnRes.value.json();
      if (data.success) setTransactions(data.transactions || []);
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
    }
    setLoading((prev) => ({ ...prev, swap: false }));
  }, []);

  useEffect(() => {
    void refreshAll();
    const id = window.setInterval(() => {
      void refreshAll();
    }, 30_000);
    return () => window.clearInterval(id);
  }, [refreshAll]);

  return (
    <main className="min-h-screen bg-[#08080e] pb-24">
      <Header onServingsChange={() => {}} />

      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-950/20 via-[#08080e] to-amber-950/10" />
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-purple-600/5 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-4 pt-32">
        <header className="mb-10 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-base border border-white/8 mb-4">
            <span className="text-purple-400 text-lg">🌐</span>
            <span className="text-[10px] font-black text-white/40 uppercase tracking-[0.3em]">
              The Astral Network
            </span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white tracking-tighter mb-3 alchm-gradient-text uppercase">
            Live Network Feed
          </h1>
          <p className="text-white/40 text-sm max-w-xl mx-auto">
            Live updates from human alchemists and historical planetary agents — plus
            the cross-network ledger and a planetary-influenced ESMS swap floor.
          </p>

          {swapContext && (
            <div className="mt-5 inline-flex items-center gap-3 px-4 py-2 rounded-full glass-base border border-purple-400/15">
              <span className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em]">
                Now Ruling
              </span>
              <span className="text-white/85 text-sm">
                {PLANET_GLYPH[swapContext.rulingHourPlanet] || "✨"} {swapContext.rulingHourPlanet} hour
              </span>
              <span className="text-white/30">·</span>
              <span className="text-white/60 text-xs">
                {PLANET_GLYPH[swapContext.rulingDayPlanet] || "✨"} {swapContext.rulingDayPlanet} day
              </span>
            </div>
          )}
        </header>

        <nav className="flex flex-wrap justify-center gap-2 mb-8">
          {TAB_NAV.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest transition-all border ${
                activeTab === tab.id
                  ? "bg-purple-600 text-white border-purple-400 shadow-lg shadow-purple-900/40"
                  : "bg-white/[0.02] text-white/50 border-white/10 hover:text-white/80 hover:border-white/20"
              }`}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </nav>

        <AnimatePresence mode="wait">
          {activeTab === "feed" && (
            <motion.div key="feed" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <FeedTab events={events} loading={loading.feed} />
            </motion.div>
          )}
          {activeTab === "agents" && (
            <motion.div key="agents" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <AgentsTab agents={agents} loading={loading.agents} />
            </motion.div>
          )}
          {activeTab === "transactions" && (
            <motion.div key="transactions" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <TransactionsTab transactions={transactions} loading={loading.transactions} />
            </motion.div>
          )}
          {activeTab === "swap" && (
            <motion.div key="swap" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <SwapTab context={swapContext} loading={loading.swap} onSwapComplete={() => { void refreshAll(); }} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}

// ─── Feed Tab ─────────────────────────────────────────────────────────────────

function FeedTab({ events, loading }: { events: FeedEvent[]; loading: boolean }) {
  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500" />
      </div>
    );
  }
  if (events.length === 0) {
    return (
      <div className="glass-card-premium rounded-3xl p-10 text-center border-white/8">
        <p className="text-white/40">The astral network is quiet today.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <AnimatePresence>
        {events.map((event, index) => {
          const signature = event.actorIsAgent ? getPlanetarySignature(event.metadataPayload) : null;
          const natalPlacements =
            signature?.natalPositions?.map(formatPlacement).filter(Boolean).slice(0, 4) || [];
          return (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.04 }}
              className={`glass-card-premium rounded-2xl p-5 transition-all flex items-start gap-4 ${
                event.actorIsAgent
                  ? "border-amber-500/20 hover:border-amber-400/35"
                  : "border-white/8 hover:border-purple-500/20"
              }`}
            >
              <div className="w-10 h-10 rounded-full glass-base flex items-center justify-center text-xl shrink-0 border border-white/5">
                {getEventIcon(event.eventType)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-white/80">
                  <Link
                    href={`/profile/${event.actorId}`}
                    className={`font-bold mr-1 underline-offset-2 hover:underline transition-colors ${
                      event.actorIsAgent ? "text-amber-400 hover:text-amber-300" : "text-white hover:text-purple-200"
                    }`}
                  >
                    {event.actorName}
                  </Link>
                  <span className="text-white/60">{getEventText(event)}</span>
                </p>
                <div className="flex items-center gap-3 mt-2">
                  <span className="text-[10px] text-white/30 font-mono">
                    {formatRelativeTime(event.createdAt)}
                  </span>
                  {event.actorIsAgent && (
                    <span className="text-[8px] font-black uppercase tracking-widest bg-amber-500/10 text-amber-400/80 px-2 py-0.5 rounded-full border border-amber-500/20">
                      Historical Agent
                    </span>
                  )}
                </div>
                {signature && (
                  <div className="mt-3 rounded-xl border border-amber-400/15 bg-amber-500/10 px-3 py-2">
                    <div className="flex flex-wrap gap-x-3 gap-y-1 text-[10px] font-bold uppercase tracking-wider text-amber-100/75">
                      {(signature.planetaryHour || signature.dominantPlanet) && (
                        <span>Hour {signature.planetaryHour || signature.dominantPlanet}</span>
                      )}
                      {signature.planetaryDay && <span>Day {signature.planetaryDay}</span>}
                      {signature.sacredStat && <span>{signature.sacredStat}</span>}
                      {signature.dominantElement && <span>{signature.dominantElement}</span>}
                    </div>
                    {natalPlacements.length > 0 && (
                      <p className="mt-1.5 text-xs leading-relaxed text-white/55">
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
    </div>
  );
}

// ─── Agents Tab ───────────────────────────────────────────────────────────────

function AgentsTab({ agents, loading }: { agents: AgentSummary[]; loading: boolean }) {
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
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {agents.map((agent) => (
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
              {agent.lastActionAt ? ` · ${formatRelativeTime(agent.lastActionAt)}` : ""}
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
  );
}

// ─── Transactions Tab ─────────────────────────────────────────────────────────

function TransactionsTab({ transactions, loading }: { transactions: NetworkTransaction[]; loading: boolean }) {
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
  return (
    <div className="glass-card-premium rounded-3xl border-white/8 overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-[10px] uppercase tracking-widest text-white/30 border-b border-white/5">
            <th className="text-left px-4 py-3 font-bold">Actor</th>
            <th className="text-left px-4 py-3 font-bold">Token</th>
            <th className="text-right px-4 py-3 font-bold">Amount</th>
            <th className="text-left px-4 py-3 font-bold hidden sm:table-cell">Source</th>
            <th className="text-right px-4 py-3 font-bold">When</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((txn) => {
            const visual = TOKEN_VISUAL[txn.tokenType] || TOKEN_VISUAL.Spirit;
            const isCredit = txn.amount >= 0;
            return (
              <tr key={txn.id} className="border-b border-white/5 last:border-0 hover:bg-white/[0.02] transition-colors">
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
                  <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest border ${visual.bg} ${visual.border} ${visual.color}`}>
                    {visual.symbol} {txn.tokenType}
                  </span>
                </td>
                <td className={`px-4 py-3 text-right font-mono tabular-nums text-sm ${isCredit ? "text-green-400" : "text-red-400"}`}>
                  {isCredit ? "+" : ""}{txn.amount.toFixed(2)}
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
  const [resultMessage, setResultMessage] = useState<{ kind: "ok" | "error"; text: string } | null>(null);

  // Auto-fix invalid same-token selections
  useEffect(() => {
    if (fromToken === toToken) {
      const next = TOKEN_TYPES.find((t) => t !== fromToken) as TokenType;
      setToToken(next);
    }
  }, [fromToken, toToken]);

  const activeRate = useMemo(() => {
    if (!context) return null;
    return context.rates.find((r) => r.fromToken === fromToken && r.toToken === toToken) || null;
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
        setResultMessage({ kind: "error", text: data.message || "Swap failed." });
      } else {
        setResultMessage({ kind: "ok", text: data.message || "Swap complete." });
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
          <TokenSelect label="From" value={fromToken} onChange={setFromToken} disabled={toToken} />
          <TokenSelect label="To" value={toToken} onChange={setToToken} disabled={fromToken} />
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
                  activeRate.modifier < 1 ? "text-green-400" : activeRate.modifier > 1 ? "text-amber-400" : "text-white/70"
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

        <button
          onClick={() => { void handleSwap(); }}
          disabled={submitting || numericAmount <= 0}
          className="mt-6 w-full px-6 py-3 rounded-2xl bg-purple-600 hover:bg-purple-500 disabled:bg-white/10 disabled:text-white/40 text-white font-black text-xs uppercase tracking-[0.3em] shadow-lg shadow-purple-900/40 transition-all"
        >
          {submitting ? "Performing rite..." : "Execute Swap"}
        </button>

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
          {context.validUntil ? ` (≈ ${new Date(context.validUntil).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })})` : ""}.
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
                    favored ? "text-green-400" : rate.modifier > 1 ? "text-amber-400" : "text-white/70"
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
      <span className="text-[10px] uppercase tracking-widest text-white/40 font-bold">{label}</span>
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
