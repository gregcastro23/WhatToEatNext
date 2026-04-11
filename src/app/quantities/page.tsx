"use client";

import dynamic from "next/dynamic";
import { Suspense, useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaFire,
  FaTint,
  FaWind,
  FaMountain,
  FaBolt,
  FaSyncAlt,
  FaSun,
  FaMoon,
  FaCoins,
} from "react-icons/fa";
import AlchmKinetics from "@/components/alchm-kinetics";
import AlchmQuantitiesDisplay from "@/components/alchm-quantities-display";
import PlanetaryAspectsDisplay from "@/components/PlanetaryAspectsDisplay";
import PlanetaryContributionsChart from "@/components/PlanetaryContributionsChart";
import { QuestPanel } from "@/components/economy/QuestPanel";
import { usePremium } from "@/contexts/PremiumContext";
import type {
  TokenBalances,
  UserStreak,
  DailyYieldResult,
} from "@/types/economy";

const AlchmQuantitiesTrends = dynamic(
  () => import("@/components/alchm-quantities-trends"),
  { ssr: false }
);

// ─── Token Config ─────────────────────────────────────────────────────────────

const TOKEN_CONFIG = [
  {
    key: "Spirit" as const,
    balanceKey: "spirit" as const,
    symbol: "☉",
    icon: FaFire,
    label: "Spirit",
    subtitle: "Creative Force",
    description:
      "Governs intuitive cooking, creative impulse, and alchemical spark. Fuels innovative recipe generation.",
    color: "amber",
    bgGradient: "from-amber-500/20 via-yellow-500/10 to-transparent",
    borderColor: "border-amber-500/30",
    glowColor: "shadow-amber-500/20",
    glowHex: "rgba(251,191,36,0.35)",
    textColor: "text-amber-400",
    barColor: "from-amber-500 to-yellow-400",
    ringColor: "ring-amber-500/30",
    chartStroke: "#f59e0b",
    planet: "Sun ☉",
  },
  {
    key: "Essence" as const,
    balanceKey: "essence" as const,
    symbol: "☽",
    icon: FaTint,
    label: "Essence",
    subtitle: "Life Energy",
    description:
      "The flow of feeling, flavor connection, and emotional resonance. Amplifies personalization and intuition.",
    color: "blue",
    bgGradient: "from-blue-500/20 via-cyan-500/10 to-transparent",
    borderColor: "border-blue-500/30",
    glowColor: "shadow-blue-500/20",
    glowHex: "rgba(96,165,250,0.35)",
    textColor: "text-blue-400",
    barColor: "from-blue-500 to-cyan-400",
    ringColor: "ring-blue-500/30",
    chartStroke: "#3b82f6",
    planet: "Moon ☽",
  },
  {
    key: "Matter" as const,
    balanceKey: "matter" as const,
    symbol: "⊕",
    icon: FaMountain,
    label: "Matter",
    subtitle: "Physical Form",
    description:
      "Physical nourishment, grounding sustenance, and elemental Earth. Governs nutritional depth and satiation.",
    color: "emerald",
    bgGradient: "from-emerald-500/20 via-green-500/10 to-transparent",
    borderColor: "border-emerald-500/30",
    glowColor: "shadow-emerald-500/20",
    glowHex: "rgba(52,211,153,0.35)",
    textColor: "text-emerald-400",
    barColor: "from-emerald-500 to-green-400",
    ringColor: "ring-emerald-500/30",
    chartStroke: "#10b981",
    planet: "Earth ⊕",
  },
  {
    key: "Substance" as const,
    balanceKey: "substance" as const,
    symbol: "☿",
    icon: FaWind,
    label: "Substance",
    subtitle: "Etheric Field",
    description:
      "Building blocks, metabolic fuel, and adaptive energy. Governs the etheric substrate of all transmutations.",
    color: "purple",
    bgGradient: "from-purple-500/20 via-fuchsia-500/10 to-transparent",
    borderColor: "border-purple-500/30",
    glowColor: "shadow-purple-500/20",
    glowHex: "rgba(192,132,252,0.35)",
    textColor: "text-purple-400",
    barColor: "from-purple-500 to-fuchsia-400",
    ringColor: "ring-purple-500/30",
    chartStroke: "#8b5cf6",
    planet: "Mercury ☿",
  },
] as const;

// ─── Tab Definition ───────────────────────────────────────────────────────────

type Tab = "economy" | "quantities" | "kinetics" | "aspects" | "trends" | "quests";

const TABS: { id: Tab; label: string; icon: string }[] = [
  { id: "economy", label: "Token Economy", icon: "⚗️" },
  { id: "quantities", label: "Live Quantities", icon: "🔮" },
  { id: "kinetics", label: "Kinetics", icon: "⚡" },
  { id: "aspects", label: "Aspects", icon: "☌" },
  { id: "trends", label: "Trends", icon: "📈" },
  { id: "quests", label: "Quests", icon: "🎯" },
];

// ─── Spinner ──────────────────────────────────────────────────────────────────

function Spinner() {
  return (
    <div className="flex justify-center items-center h-48">
      <div className="relative">
        <div className="w-12 h-12 rounded-full border-2 border-white/10 animate-spin border-t-amber-400" />
        <div className="absolute inset-0 w-12 h-12 rounded-full border-2 border-transparent animate-spin border-b-purple-400 [animation-delay:0.15s]" />
      </div>
    </div>
  );
}

// ─── Token Card (per-token hero card with live balance + value) ───────────────

interface AlchemyData {
  quantities: {
    Spirit: number;
    Essence: number;
    Matter: number;
    Substance: number;
    ANumber: number;
    DayEssence: number;
    NightEssence: number;
  };
  dominantElement: string;
  isDiurnal?: boolean;
  heat: number;
  entropy: number;
  reactivity: number;
  energy: number;
  kalchm: number;
  monica: number;
  timestamp: string;
  error?: string;
}

function TokenHeroCard({
  cfg,
  balance,
  liveValue,
  isDebitFlashing,
  alchData,
}: {
  cfg: (typeof TOKEN_CONFIG)[number];
  balance: number;
  liveValue: number;
  isDebitFlashing: boolean;
  alchData: AlchemyData | null;
}) {
  const Icon = cfg.icon;
  const total = alchData
    ? (alchData.quantities.Spirit || 0) +
      (alchData.quantities.Essence || 0) +
      (alchData.quantities.Matter || 0) +
      (alchData.quantities.Substance || 0)
    : 0;
  const share = total > 0 ? (liveValue / total) * 100 : 0;
  const maxVal = 10;
  const barWidth = Math.min((liveValue / maxVal) * 100, 100);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4, scale: 1.01 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className={`relative rounded-3xl overflow-hidden border ${cfg.borderColor} bg-gradient-to-br ${cfg.bgGradient} backdrop-blur-xl shadow-2xl ${cfg.glowColor}`}
      style={{ boxShadow: `0 8px 40px ${cfg.glowHex}, 0 2px 8px rgba(0,0,0,0.4)` }}
    >
      {/* Glow orb */}
      <div
        className="absolute -top-6 -right-6 w-28 h-28 rounded-full blur-2xl opacity-40 pointer-events-none"
        style={{ background: cfg.glowHex }}
      />

      <div className="relative z-10 p-6">
        {/* Header row */}
        <div className="flex items-start justify-between mb-5">
          <div className="flex items-center gap-3">
            <div
              className={`w-11 h-11 rounded-2xl flex items-center justify-center bg-gradient-to-br ${cfg.barColor} shadow-lg`}
            >
              <Icon className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-base font-black text-white tracking-wider uppercase">
                {cfg.label}
              </h3>
              <p className="text-[10px] text-white/40 font-medium uppercase tracking-[0.25em]">
                {cfg.subtitle}
              </p>
            </div>
          </div>
          <div className={`text-3xl ${cfg.textColor} opacity-60 font-serif`}>
            {cfg.symbol}
          </div>
        </div>

        {/* Live Value (planetary quantity) */}
        <div className="mb-4">
          <div className="text-[10px] text-white/30 uppercase tracking-[0.3em] mb-1 font-bold">
            Live Planetary Value
          </div>
          <div className={`text-4xl font-black tabular-nums ${cfg.textColor}`}>
            {liveValue.toFixed(3)}
          </div>
          <div className="text-[10px] text-white/20 font-mono mt-0.5">
            {share.toFixed(1)}% of total A# · via {cfg.planet}
          </div>
        </div>

        {/* Progress bar for live value */}
        <div className="mb-5">
          <div className="h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
            <motion.div
              className={`h-full rounded-full bg-gradient-to-r ${cfg.barColor}`}
              initial={{ width: 0 }}
              animate={{ width: `${barWidth}%` }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            />
          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-white/[0.06] mb-4" />

        {/* Wallet Balance */}
        <div className="flex items-center justify-between">
          <div>
            <div className="text-[10px] text-white/30 uppercase tracking-[0.3em] mb-1 font-bold">
              Wallet Balance
            </div>
            <motion.div
              animate={
                isDebitFlashing
                  ? { color: ["#ffffff", "#ef4444", "#ffffff"], scale: [1, 1.15, 1] }
                  : {}
              }
              className={`text-2xl font-black tabular-nums ${cfg.textColor}`}
            >
              {balance.toFixed(1)}
            </motion.div>
          </div>
          <div
            className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${cfg.borderColor} ${cfg.textColor} bg-white/[0.04]`}
          >
            {cfg.label.toUpperCase()}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Economy Tab ──────────────────────────────────────────────────────────────

function EconomyTab() {
  const { isPremium } = usePremium();

  const [balances, setBalances] = useState<TokenBalances | null>(null);
  const prevBalances = useRef<TokenBalances | null>(null);
  const [streak, setStreak] = useState<UserStreak | null>(null);
  const [canClaim, setCanClaim] = useState(false);
  const [claiming, setClaiming] = useState(false);
  const [claimResult, setClaimResult] = useState<DailyYieldResult | null>(null);
  const [debitFlash, setDebitFlash] = useState<string | null>(null);
  const [economyError, setEconomyError] = useState<string | null>(null);

  const [alchData, setAlchData] = useState<AlchemyData | null>(null);
  const [alchLoading, setAlchLoading] = useState(true);

  // Fetch token balances
  const fetchBalances = useCallback(async () => {
    try {
      const res = await fetch("/api/economy/balance", { credentials: "include" });
      if (!res.ok) return;
      const data = await res.json();
      if (data.success) {
        setBalances(data.balances);
        setStreak(data.streak);
        setCanClaim(data.canClaimDaily);
      }
    } catch {
      // Non-critical
    }
  }, []);

  // Fetch live ESMS quantities
  const fetchAlchData = useCallback(async () => {
    try {
      setAlchLoading(true);
      const res = await fetch("/api/alchm-quantities");
      if (!res.ok) return;
      const data = await res.json();
      setAlchData(data);
    } catch {
      // Non-critical
    } finally {
      setAlchLoading(false);
    }
  }, []);

  // Debit flash detection
  useEffect(() => {
    if (balances && prevBalances.current) {
      const keys: Array<keyof Pick<TokenBalances, "spirit" | "essence" | "matter" | "substance">> =
        ["spirit", "essence", "matter", "substance"];
      for (const k of keys) {
        if ((balances[k] || 0) < (prevBalances.current[k] || 0)) {
          setDebitFlash(k);
          navigator.vibrate?.(15);
          setTimeout(() => setDebitFlash(null), 1000);
          break;
        }
      }
    }
    if (balances) prevBalances.current = balances;
  }, [balances]);

  useEffect(() => {
    void fetchBalances();
    void fetchAlchData();
    const interval = setInterval(() => {
      void fetchBalances();
      void fetchAlchData();
    }, 30000);
    return () => clearInterval(interval);
  }, [fetchBalances, fetchAlchData]);

  // Claim daily
  const handleClaim = async () => {
    setClaiming(true);
    setEconomyError(null);
    try {
      const res = await fetch("/api/economy/claim-daily", {
        method: "POST",
        credentials: "include",
      });
      const data = await res.json();
      if (data.success) {
        setClaimResult(data.yield);
        navigator.vibrate?.([10, 30, 10]);
        setCanClaim(false);
        await fetchBalances();
        setTimeout(() => setClaimResult(null), 5000);
      } else {
        setEconomyError(data.message);
      }
    } catch {
      setEconomyError("Failed to claim daily yield");
    } finally {
      setClaiming(false);
    }
  };

  const totalANumber = alchData
    ? (alchData.quantities.Spirit || 0) +
      (alchData.quantities.Essence || 0) +
      (alchData.quantities.Matter || 0) +
      (alchData.quantities.Substance || 0)
    : 0;

  return (
    <div className="space-y-10">
      {/* ── Hero: Claim Result Notification ── */}
      <AnimatePresence>
        {claimResult && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20 }}
            className="glass-card-premium rounded-2xl p-5 border border-amber-500/40 shadow-[0_0_40px_rgba(251,191,36,0.15)]"
          >
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <div className="text-[10px] font-black text-amber-400 uppercase tracking-[0.4em] mb-2">
                  ✨ Cosmic Paycheck Received
                </div>
                <div className="flex items-center gap-4 text-sm font-bold">
                  {TOKEN_CONFIG.map((cfg) => {
                    const amount =
                      claimResult.distribution[cfg.balanceKey];
                    if (!amount || amount <= 0) return null;
                    return (
                      <motion.span
                        key={cfg.key}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", delay: 0.1 * TOKEN_CONFIG.indexOf(cfg) }}
                        className="flex items-center gap-1.5"
                      >
                        <span className={cfg.textColor}>{cfg.symbol}</span>
                        <span className="text-white/90">+{amount.toFixed(1)}</span>
                        <span className="text-white/30 text-[10px]">{cfg.label}</span>
                      </motion.span>
                    );
                  })}
                </div>
              </div>
              <div className="text-right">
                <div className="text-[10px] text-white/30 uppercase tracking-widest">Streak</div>
                <div className="text-xl font-black text-amber-400">
                  🔥 {claimResult.streakCount}d
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Status Bar: Streak + Premium + Claim ── */}
      <div className="glass-card-premium rounded-3xl p-5 border-white/8 flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-5">
          {/* Live indicators */}
          <div className="flex items-center gap-2.5">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
            </span>
            <span className="text-[10px] font-black text-white/40 uppercase tracking-[0.3em]">
              Live Economy
            </span>
          </div>

          {alchData && (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-white/[0.03] rounded-full border border-white/5">
              {alchData.isDiurnal ? (
                <FaSun className="w-3 h-3 text-amber-400" />
              ) : (
                <FaMoon className="w-3 h-3 text-blue-400" />
              )}
              <span className="text-[10px] font-bold text-white/50">
                {alchData.isDiurnal ? "Day Sect" : "Night Sect"}
              </span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {streak && streak.currentStreak > 0 && (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-500/10 rounded-full border border-amber-500/20">
              <span className="text-amber-400 text-sm">🔥</span>
              <span className="text-xs font-bold text-amber-400 tabular-nums">
                {streak.currentStreak}
              </span>
              <span className="text-[9px] text-amber-400/50 font-medium">
                day streak
              </span>
            </div>
          )}

          {isPremium && (
            <div className="px-3 py-1.5 bg-amber-500/15 rounded-full border border-amber-500/30 flex items-center gap-1.5">
              <span className="text-[9px] text-amber-400 font-black uppercase tracking-widest">
                ✦ 2× Premium
              </span>
            </div>
          )}

          {canClaim ? (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => { void handleClaim(); }}
              disabled={claiming}
              className="relative px-6 py-2.5 rounded-full text-[10px] font-black uppercase tracking-[0.25em] bg-gradient-to-r from-amber-500 to-purple-600 text-white shadow-[0_0_25px_rgba(251,191,36,0.3)] hover:shadow-[0_0_40px_rgba(251,191,36,0.5)] transition-all duration-300 disabled:opacity-50 overflow-hidden alchm-shimmer"
            >
              {claiming ? (
                <span className="flex items-center gap-1.5">
                  <motion.span
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                  >
                    ✦
                  </motion.span>
                  Aligning...
                </span>
              ) : (
                "Claim Cosmic Paycheck"
              )}
            </motion.button>
          ) : (
            <div className="px-4 py-2 rounded-full text-[9px] font-bold text-white/20 border border-white/5 uppercase tracking-widest">
              Claimed Today ✓
            </div>
          )}
        </div>

        {economyError && (
          <p className="w-full text-[10px] text-red-400/80 font-medium pt-1">
            {economyError}
          </p>
        )}
      </div>

      {/* ── A-Number Hero ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2 glass-card-premium rounded-3xl p-7 border-white/8">
          <div className="flex items-start justify-between mb-4">
            <div>
              <div className="text-[10px] font-black text-white/30 uppercase tracking-[0.4em] mb-1">
                Total Alchemical Number
              </div>
              <div className="text-6xl font-black text-white tabular-nums tracking-tighter">
                {totalANumber.toFixed(3)}
                <span className="text-2xl text-white/20 ml-2 font-mono">A#</span>
              </div>
              <p className="text-white/20 text-xs mt-2 italic">
                Spirit + Essence + Matter + Substance — live from planetary positions
              </p>
            </div>
            <FaCoins className="w-8 h-8 text-amber-400/30" />
          </div>

          {/* Element split bar */}
          {!alchLoading && alchData && (
            <div className="mt-5">
              <div className="flex h-2 rounded-full overflow-hidden gap-0.5">
                {TOKEN_CONFIG.map((cfg) => {
                  const val = alchData.quantities[cfg.key] || 0;
                  const pct = totalANumber > 0 ? (val / totalANumber) * 100 : 25;
                  return (
                    <motion.div
                      key={cfg.key}
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 1, ease: "easeOut" }}
                      className={`h-full rounded-sm bg-gradient-to-r ${cfg.barColor}`}
                      title={`${cfg.label}: ${pct.toFixed(1)}%`}
                    />
                  );
                })}
              </div>
              <div className="flex justify-between mt-2">
                {TOKEN_CONFIG.map((cfg) => (
                  <span key={cfg.key} className={`text-[9px] font-bold ${cfg.textColor} uppercase tracking-widest`}>
                    {cfg.symbol}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Thermodynamics snapshot */}
        <div className="glass-card-premium rounded-3xl p-6 border-white/8 space-y-4">
          <div className="text-[10px] font-black text-white/30 uppercase tracking-[0.4em]">
            Thermodynamics
          </div>
          {alchData ? (
            <>
              {[
                { label: "Heat", val: alchData.heat, color: "text-orange-400" },
                { label: "Entropy", val: alchData.entropy, color: "text-red-400" },
                { label: "Reactivity", val: alchData.reactivity, color: "text-purple-400" },
                { label: "GregsEnergy", val: alchData.energy, color: "text-emerald-400" },
              ].map(({ label, val, color }) => (
                <div key={label} className="flex items-center justify-between">
                  <span className="text-[10px] text-white/30 font-medium">{label}</span>
                  <span className={`text-sm font-mono font-bold ${color} tabular-nums`}>
                    {(val ?? 0).toFixed(4)}
                  </span>
                </div>
              ))}
              <div className="h-px bg-white/5 mt-2" />
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-white/30 font-medium">K<sub>alchm</sub></span>
                <span className="text-sm font-mono font-bold text-amber-400 tabular-nums">
                  {(alchData.kalchm ?? 0).toFixed(4)}
                </span>
              </div>
            </>
          ) : (
            <div className="animate-pulse space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-4 bg-white/5 rounded" />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── 4 Token Hero Cards ── */}
      <div>
        <div className="flex items-center gap-4 mb-5">
          <div className="text-[10px] font-black text-white/30 uppercase tracking-[0.4em]">
            ESMS Token Registry
          </div>
          <div className="flex-1 h-px bg-white/5" />
          <button
            onClick={() => { void fetchAlchData(); void fetchBalances(); }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-bold text-white/30 border border-white/5 hover:border-white/10 hover:text-white/60 transition-all uppercase tracking-widest"
          >
            <FaSyncAlt className="w-3 h-3" />
            Refresh
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
          {TOKEN_CONFIG.map((cfg, i) => {
            const liveVal = alchData?.quantities[cfg.key] ?? 0;
            const walletBal = balances?.[cfg.balanceKey] ?? 0;
            const isFlashing = debitFlash === cfg.balanceKey;
            return (
              <motion.div
                key={cfg.key}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08, duration: 0.5 }}
              >
                <TokenHeroCard
                  cfg={cfg}
                  balance={walletBal}
                  liveValue={liveVal}
                  isDebitFlashing={isFlashing}
                  alchData={alchData}
                />
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* ── Natal Chart Warning (if no balances) ── */}
      {balances && !balances.lastDailyClaimAt && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="rounded-2xl p-4 bg-amber-500/[0.07] border border-amber-500/20 flex items-start gap-3"
        >
          <span className="text-amber-400 text-lg mt-0.5">⚠</span>
          <div>
            <p className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-0.5">
              First Claim Available
            </p>
            <p className="text-[11px] text-white/40 leading-relaxed">
              Claim your first Cosmic Paycheck to initialize your token ledger. 
              Daily yields are weighted by your natal chart. Complete birth data for optimal yields.
            </p>
          </div>
        </motion.div>
      )}
    </div>
  );
}

// ─── Section Wrapper (shared card style for non-economy tabs) ─────────────────

function SectionCard({
  title,
  subtitle,
  icon,
  gradientFrom,
  gradientTo,
  borderColor,
  children,
}: {
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  gradientFrom: string;
  gradientTo: string;
  borderColor: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={`rounded-3xl border ${borderColor} backdrop-blur-xl overflow-hidden`}
      style={{
        background: `linear-gradient(135deg, ${gradientFrom} 0%, ${gradientTo} 100%)`,
      }}
    >
      <div className="p-7">
        <div className="flex items-start gap-3 mb-6">
          <div className="text-2xl mt-0.5">{icon}</div>
          <div>
            <h2 className="text-xl font-black text-white">{title}</h2>
            <p className="text-sm text-white/40 mt-0.5">{subtitle}</p>
          </div>
        </div>
        {children}
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function QuantitiesPage() {
  const [activeTab, setActiveTab] = useState<Tab>("economy");

  return (
    <div className="min-h-screen bg-[#09090f]">
      {/* Background gradient */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-950/30 via-[#09090f] to-amber-950/20" />
        <div className="absolute top-0 left-1/3 w-[600px] h-[400px] bg-purple-600/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[300px] bg-amber-500/5 rounded-full blur-[100px]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-12">

        {/* ── Page Header ── */}
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-12"
        >
          <div className="flex items-center gap-3 mb-3">
            <span className="w-12 h-px bg-amber-500/30" />
            <span className="text-[10px] font-black text-white/30 uppercase tracking-[0.5em]">
              Alchm.kitchen // Transmutation Ledger
            </span>
          </div>
          <h1 className="text-5xl md:text-6xl font-black text-white tracking-tighter leading-none mb-3 alchm-gradient-text uppercase">
            Token<br />Economy
          </h1>
          <p className="text-white/30 text-sm max-w-xl leading-relaxed">
            Live Spirit, Essence, Matter & Substance quantities drawn from real-time planetary
            positions. Every alchemical transformation is denominated in ESMS.
          </p>

          {/* ESMS legend badges */}
          <div className="flex flex-wrap gap-3 mt-6">
            {TOKEN_CONFIG.map((cfg) => (
              <div
                key={cfg.key}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-full border ${cfg.borderColor} bg-white/[0.03] backdrop-blur-sm`}
              >
                <span className={`text-sm ${cfg.textColor}`}>{cfg.symbol}</span>
                <span className="text-[10px] font-bold text-white/60 uppercase tracking-wider">
                  {cfg.label}
                </span>
                <span className="text-[9px] text-white/25">= {cfg.subtitle}</span>
              </div>
            ))}
          </div>
        </motion.header>

        {/* ── Tabs ── */}
        <div className="mb-8">
          <div className="flex gap-1 p-1 bg-white/[0.03] rounded-2xl border border-white/5 overflow-x-auto scrollbar-hide">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  flex items-center gap-2 px-4 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-[0.2em] 
                  transition-all duration-300 whitespace-nowrap flex-shrink-0
                  ${activeTab === tab.id
                    ? "bg-white/10 text-white border border-white/15 shadow-inner"
                    : "text-white/30 hover:text-white/60 hover:bg-white/[0.04]"
                  }
                `}
              >
                <span>{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* ── Tab Content ── */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          >
            {activeTab === "economy" && <EconomyTab />}

            {activeTab === "quantities" && (
              <SectionCard
                title="Current Alchm Quantities"
                subtitle="Real-time ESMS values from live planetary positions — updated every 30 s"
                icon="🔮"
                gradientFrom="rgba(251,146,60,0.08)"
                gradientTo="rgba(220,38,38,0.05)"
                borderColor="border-orange-500/20"
              >
                <Suspense fallback={<Spinner />}>
                  <AlchmQuantitiesDisplay />
                </Suspense>
              </SectionCard>
            )}

            {activeTab === "kinetics" && (
              <SectionCard
                title="Kinetic Analysis"
                subtitle="ESMS velocity, acceleration, momentum, and P = IV circuit metrics"
                icon="⚡"
                gradientFrom="rgba(6,182,212,0.08)"
                gradientTo="rgba(59,130,246,0.05)"
                borderColor="border-cyan-500/20"
              >
                <Suspense fallback={<Spinner />}>
                  <AlchmKinetics />
                </Suspense>
              </SectionCard>
            )}

            {activeTab === "aspects" && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <SectionCard
                  title="Active Aspects"
                  subtitle="Major inter-planetary aspects with applying / separating status"
                  icon="☌"
                  gradientFrom="rgba(139,92,246,0.08)"
                  gradientTo="rgba(99,102,241,0.05)"
                  borderColor="border-violet-500/20"
                >
                  <Suspense fallback={<Spinner />}>
                    <PlanetaryAspectsDisplay />
                  </Suspense>
                </SectionCard>
                <SectionCard
                  title="Planetary Contributions"
                  subtitle="Live sign positions and ESMS contributions per planet"
                  icon="🪐"
                  gradientFrom="rgba(99,102,241,0.08)"
                  gradientTo="rgba(139,92,246,0.05)"
                  borderColor="border-indigo-500/20"
                >
                  <Suspense fallback={<Spinner />}>
                    <PlanetaryContributionsChart />
                  </Suspense>
                </SectionCard>
              </div>
            )}

            {activeTab === "trends" && (
              <div className="space-y-6">
                <SectionCard
                  title="Trends & Forecasts"
                  subtitle="7-day ESMS quantity history sampled every 4 h"
                  icon="📈"
                  gradientFrom="rgba(139,92,246,0.08)"
                  gradientTo="rgba(99,102,241,0.05)"
                  borderColor="border-purple-500/20"
                >
                  <Suspense fallback={<Spinner />}>
                    <AlchmQuantitiesTrends />
                  </Suspense>
                </SectionCard>

                {/* Alchemical Mathematics */}
                <div
                  className="rounded-3xl border border-indigo-500/20 backdrop-blur-xl overflow-hidden"
                  style={{ background: "linear-gradient(135deg, rgba(99,102,241,0.08) 0%, rgba(139,92,246,0.05) 100%)" }}
                >
                  <div className="p-7">
                    <div className="flex items-center gap-3 mb-6">
                      <span className="text-2xl">⚙️</span>
                      <div>
                        <h2 className="text-xl font-black text-white">Alchemical Mathematics</h2>
                        <p className="text-sm text-white/40 mt-0.5">Core formulas used in every calculation</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {[
                        {
                          emoji: "🎯", title: "A-Number",
                          color: "border-indigo-500/20", lines: [
                            { text: "A# = Spirit + Essence + Matter + Substance", mono: true, bright: false },
                            { text: "Total alchemical energy from current planetary positions.", mono: false, bright: false },
                          ]
                        },
                        {
                          emoji: "⚡", title: "Thermodynamics",
                          color: "border-green-500/20", lines: [
                            { text: "Heat = (S² + F²) / (E+M+Sub+W+A+Ea)²", mono: true, bright: false },
                            { text: "Entropy = (S² + Sub² + F² + A²) / (Ea+W)²", mono: true, bright: false },
                            { text: "GregsEnergy = Heat − Entropy × Reactivity", mono: true, bright: true },
                            { text: "Kalchm = (S^S · E^E) / (M^M · Sub^Sub)", mono: true, bright: false },
                          ]
                        },
                        {
                          emoji: "🔋", title: "P = IV Circuit",
                          color: "border-blue-500/20", lines: [
                            { text: "Q (charge) = Matter + Substance", mono: true, bright: false },
                            { text: "V (potential) = GregsEnergy / Q", mono: true, bright: false },
                            { text: "I (current) = Reactivity × Q × 0.1", mono: true, bright: false },
                            { text: "P (power) = I × V", mono: true, bright: true },
                          ]
                        },
                        {
                          emoji: "☀️", title: "Diurnal / Nocturnal Sect",
                          color: "border-amber-500/20", lines: [
                            { text: "Day 06:00–18:00 UTC → Saturn=Air, Mars=Fire …", mono: false, bright: false },
                            { text: "Night 18:00–06:00 UTC → Saturn=Earth, Mars=Water …", mono: false, bright: false },
                            { text: "Mix = 60% sign element + 40% sect element", mono: false, bright: true },
                          ]
                        },
                      ].map((block) => (
                        <div key={block.title} className={`p-4 rounded-2xl bg-white/[0.03] border ${block.color}`}>
                          <h4 className="font-bold mb-3 flex items-center gap-2 text-white/80 text-sm">
                            <span>{block.emoji}</span> {block.title}
                          </h4>
                          <div className="space-y-1.5">
                            {block.lines.map((line, i) => (
                              <p key={i} className={`text-xs ${line.mono ? "font-mono" : ""} ${line.bright ? "text-white/70 font-bold" : "text-white/35"}`}>
                                {line.text}
                              </p>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "quests" && (
              <QuestPanel className="w-full" />
            )}
          </motion.div>
        </AnimatePresence>

        {/* ── Footer ── */}
        <footer className="mt-16 pt-8 border-t border-white/5 flex items-center justify-between">
          <p className="text-[9px] font-black text-white/10 uppercase tracking-[0.5em]">
            Transmutation Ledger v4.2 // ESMS Protocol
          </p>
          <p className="text-[9px] text-white/10 font-mono">
            Auto-refreshes every 30s
          </p>
        </footer>
      </div>
    </div>
  );
}
