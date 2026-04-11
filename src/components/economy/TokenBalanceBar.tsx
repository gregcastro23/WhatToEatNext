'use client';

/**
 * Token Balance Bar
 *
 * Always-visible ESMS token balance display for the dashboard.
 * Shows Spirit 🝇, Essence 🝑, Matter 🝙, Substance 🝉 with glassmorphic styling.
 * Also shows streak count and daily claim availability.
 *
 * @file src/components/economy/TokenBalanceBar.tsx
 */

import { AnimatePresence, motion } from 'framer-motion';
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { usePremium } from '@/contexts/PremiumContext';
import { TOKEN_ECONOMY_EVENT } from '@/hooks/useTokenEconomy';
import type { TokenBalances, UserStreak, DailyYieldResult, TokenType } from '@/types/economy';
import { PlanetaryInfluenceTooltip } from './PlanetaryInfluenceTooltip';

// ─── Token Config ─────────────────────────────────────────────────────

const TOKEN_CONFIG = {
  Spirit: { symbol: '🝇', color: 'amber', gradient: 'from-amber-400 to-yellow-500', glow: 'rgba(251,191,36,0.4)' },
  Essence: { symbol: '🝑', color: 'blue', gradient: 'from-blue-400 to-cyan-400', glow: 'rgba(96,165,250,0.4)' },
  Matter: { symbol: '🝙', color: 'emerald', gradient: 'from-emerald-400 to-green-400', glow: 'rgba(52,211,153,0.4)' },
  Substance: { symbol: '🝉', color: 'purple', gradient: 'from-purple-400 to-fuchsia-400', glow: 'rgba(192,132,252,0.4)' },
} as const;

// ─── Component ────────────────────────────────────────────────────────

interface TokenBalanceBarProps {
  className?: string;
  onClaimDaily?: () => void;
}

export function TokenBalanceBar({ className = '', onClaimDaily }: TokenBalanceBarProps) {
  const { isPremium } = usePremium();
  const [balances, setBalances] = useState<TokenBalances | null>(null);
  const prevBalances = useRef<TokenBalances | null>(null);
  const [streak, setStreak] = useState<UserStreak | null>(null);
  const [canClaim, setCanClaim] = useState(false);
  const [claiming, setClaiming] = useState(false);
  const [claimResult, setClaimResult] = useState<DailyYieldResult | null>(null);
  const [debitFlash, setDebitFlash] = useState<string | null>(null);
  const [creditFlash, setCreditFlash] = useState<string | null>(null);
  const [hoveredToken, setHoveredToken] = useState<TokenType | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [isMobileExpanded, setIsMobileExpanded] = useState(false);

  const fetchBalances = useCallback(async () => {
    try {
      const res = await fetch('/api/economy/balance', { credentials: 'include' });
      if (!res.ok) return;
      const data = await res.json();
      if (data.success) {
        setBalances(data.balances);
        setStreak(data.streak);
        setCanClaim(data.canClaimDaily);
      }
    } catch {
      // Silently fail — economy is non-critical
    }
  }, []);

  useEffect(() => {
    if (balances) {
      // Check for debits/credits to trigger animation
      if (prevBalances.current) {
        const types: Array<keyof TokenBalances> = ['spirit', 'essence', 'matter', 'substance'];
        for (const t of types) {
          const cur = Number(balances[t] || 0);
          const prev = Number(prevBalances.current[t] || 0);
          if (cur < prev) {
            setDebitFlash(t);
            if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
              navigator.vibrate?.(15);
            }
            setTimeout(() => setDebitFlash(null), 1000);
          } else if (cur > prev) {
            setCreditFlash(t);
            if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
              navigator.vibrate?.([8, 20, 8]);
            }
            setTimeout(() => setCreditFlash(null), 1200);
          }
        }
      }
      prevBalances.current = balances;
    }
  }, [balances]);

  useEffect(() => {
    void fetchBalances();
  }, [fetchBalances]);

  // Refetch when any other component dispatches a tokenEconomy:updated event.
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const handler = () => {
      // Give the server a moment to commit any row before refetching.
      setTimeout(() => void fetchBalances(), 350);
    };
    window.addEventListener(TOKEN_ECONOMY_EVENT, handler);
    return () => window.removeEventListener(TOKEN_ECONOMY_EVENT, handler);
  }, [fetchBalances]);

  const handleClaim = async () => {
    setClaiming(true);
    setError(null);
    try {
      const res = await fetch('/api/economy/claim-daily', {
        method: 'POST',
        credentials: 'include',
      });
      const data = await res.json();
      if (data.success) {
        setClaimResult(data.yield);
        if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
          navigator.vibrate?.([10, 30, 10]);
        }
        setCanClaim(false);
        // Refresh balances
        await fetchBalances();
        // Clear animation after 5s
        setTimeout(() => setClaimResult(null), 5000);
      } else {
        setError(data.message);
      }
    } catch {
      setError('Failed to claim daily yield');
    } finally {
      setClaiming(false);
    }
    onClaimDaily?.();
  };

  const handleClaimClick = () => {
    void handleClaim();
  };

  if (!balances) return null;

  return (
    <div className={`relative ${className}`}>
      {/* Claim Result Animation */}
      {claimResult && (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20 }}
          className="absolute -top-24 left-1/2 -translate-x-1/2 z-50"
        >
          <div className="glass-card-premium rounded-2xl px-6 py-3 border border-amber-500/30 shadow-[0_0_30px_rgba(251,191,36,0.15)] whitespace-nowrap">
            <div className="text-[10px] font-black text-amber-400 uppercase tracking-[0.3em] mb-1">
              ✨ Cosmic Yield
            </div>
            <div className="flex items-center gap-3 text-xs font-bold">
              {Object.entries(TOKEN_CONFIG).map(([key, cfg]) => {
                const amount = claimResult.distribution[key.toLowerCase() as keyof typeof claimResult.distribution];
                if (!amount || amount <= 0) return null;
                return (
                  <motion.span
                    key={key}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.1 * Object.keys(TOKEN_CONFIG).indexOf(key), type: 'spring' }}
                    className="flex items-center gap-1"
                  >
                    <span className={`text-${cfg.color}-400`}>{cfg.symbol}</span>
                    <span className="text-white/90">+{amount.toFixed(1)}</span>
                  </motion.span>
                );
              })}
            </div>
          </div>
        </motion.div>
      )}

      {/* Main Balance Bar */}
      <div className="glass-card-premium rounded-[2rem] border-white/10 overflow-hidden hidden md:block">
        <div className="px-6 py-4 flex items-center justify-between flex-wrap gap-4">
          {/* Token Balances */}
          <div className="flex items-center gap-6">
            {(Object.entries(TOKEN_CONFIG) as Array<[keyof typeof TOKEN_CONFIG, typeof TOKEN_CONFIG[keyof typeof TOKEN_CONFIG]]>).map(
              ([key, cfg]) => {
                const lowerKey = key.toLowerCase() as 'spirit' | 'essence' | 'matter' | 'substance';
                const bal = balances[lowerKey];
                const isCreditFlashing = creditFlash === lowerKey;
                const isDebitFlashing = debitFlash === lowerKey;
                return (
                  <div
                    key={key}
                    className="relative flex items-center gap-2 group/token cursor-default"
                    onMouseEnter={() => setHoveredToken(key as TokenType)}
                    onMouseLeave={() => setHoveredToken(null)}
                  >
                    <motion.span
                      animate={isCreditFlashing ? { scale: [1, 1.35, 1] } : {}}
                      transition={{ type: 'spring', stiffness: 300, damping: 18 }}
                      className={`text-lg text-${cfg.color}-400 group-hover/token:scale-125 transition-transform drop-shadow-[0_0_8px_${cfg.glow}]`}
                    >
                      {cfg.symbol}
                    </motion.span>
                    <div className="flex flex-col">
                      <span className="text-[9px] text-white/30 font-black uppercase tracking-[0.2em]">
                        {key}
                      </span>
                      <motion.span
                        animate={
                          isDebitFlashing
                            ? { color: ['#ffffff', '#ef4444', '#ffffff'], scale: [1, 1.2, 1] }
                            : isCreditFlashing
                              ? { color: ['#ffffff', '#34d399', '#ffffff'], scale: [1, 1.25, 1] }
                              : {}
                        }
                        className="text-sm font-bold text-white tabular-nums"
                      >
                        {(bal || 0).toFixed(1)}
                      </motion.span>
                    </div>
                    <AnimatePresence>
                      {hoveredToken === key && (
                        <div className="absolute top-full left-1/2 -translate-x-1/2 mt-3 z-[80] pointer-events-none">
                          <PlanetaryInfluenceTooltip tokenType={key as TokenType} />
                        </div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              },
            )}
          </div>

          {/* Right Side: Streak + Claim */}
          <div className="flex items-center gap-4">
            {/* Streak */}
            {streak && streak.currentStreak > 0 && (
              <div className="flex items-center gap-2 px-3 py-1.5 bg-white/[0.04] rounded-full border border-white/5">
                <span className="text-amber-400 text-sm">🔥</span>
                <span className="text-xs font-bold text-white/80 tabular-nums">{streak.currentStreak}</span>
                <span className="text-[9px] text-white/30 font-medium">day streak</span>
              </div>
            )}

            {/* Premium Badge */}
            {isPremium && (
              <div className="px-3 py-1 bg-amber-500/20 rounded-full border border-amber-500/30 flex items-center gap-1.5 animate-pulse">
                <span className="text-[10px] text-amber-400 font-black uppercase">2x Premium</span>
              </div>
            )}

            {/* Claim Button */}
            {canClaim && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleClaimClick}
                disabled={claiming}
                className={`
                  relative px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.2em]
                  bg-gradient-to-r from-amber-500 to-purple-600
                  text-white shadow-[0_0_20px_rgba(251,191,36,0.3)]
                  hover:shadow-[0_0_30px_rgba(251,191,36,0.5)]
                  transition-all duration-300
                  disabled:opacity-50 disabled:cursor-not-allowed
                  overflow-hidden
                `}
              >
                {claiming ? (
                  <span className="flex items-center gap-1.5">
                    <motion.span
                      animate={{ rotate: 360 }}
                      transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                    >
                      ✦
                    </motion.span>
                    Aligning...
                  </span>
                ) : (
                  'Claim Cosmic Yield'
                )}
                {/* Shimmer effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full animate-[shimmer_2s_infinite]" />
              </motion.button>
            )}
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="px-6 pb-3">
            <p className="text-[10px] text-red-400/80 font-medium">{error}</p>
          </div>
        )}
      </div>

      {/* Mobile Orb View */}
      <div className="md:hidden">
        <motion.div
          className={`glass-card-premium rounded-[2rem] border-white/10 overflow-hidden cursor-pointer ${
            isMobileExpanded ? 'p-4' : 'w-14 h-14 rounded-full flex items-center justify-center p-0 mx-auto shadow-[0_0_25px_rgba(139,92,246,0.2)]'
          }`}
          onClick={() => !isMobileExpanded && setIsMobileExpanded(true)}
          layout
        >
          <AnimatePresence mode="wait">
            {!isMobileExpanded ? (
              <motion.div
                key="orb"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center justify-center relative w-full h-full"
              >
                <div className="absolute inset-0 bg-gradient-to-tr from-amber-500/20 via-purple-500/20 to-emerald-500/20 rounded-full animate-spin-slow" />
                <span className="text-xl relative z-10 text-white/80 font-serif alchm-shimmer">⚗️</span>
                {canClaim && (
                  <span className="absolute top-0 right-0 w-3 h-3 bg-amber-400 rounded-full border border-[#0f0f13] animate-ping" />
                )}
              </motion.div>
            ) : (
              <motion.div
                key="expanded"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col gap-4"
              >
                <div className="flex justify-between items-center w-full">
                  <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">Alchemical Ledger</span>
                  <button
                    className="text-white/40 hover:text-white"
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsMobileExpanded(false);
                    }}
                  >
                    ✕
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  {(Object.entries(TOKEN_CONFIG) as Array<[keyof typeof TOKEN_CONFIG, typeof TOKEN_CONFIG[keyof typeof TOKEN_CONFIG]]>).map(
                    ([key, cfg]) => {
                      const lowerKey = key.toLowerCase() as 'spirit' | 'essence' | 'matter' | 'substance';
                      const bal = balances[lowerKey];
                      return (
                        <div key={key} className="flex items-center gap-2">
                          <span className={`text-lg text-${cfg.color}-400 drop-shadow-[0_0_8px_${cfg.glow}]`}>
                            {cfg.symbol}
                          </span>
                          <div className="flex flex-col">
                            <span className="text-[9px] text-white/30 font-black uppercase tracking-[0.2em]">{key}</span>
                            <span className="text-sm font-bold text-white tabular-nums">{(bal || 0).toFixed(1)}</span>
                          </div>
                        </div>
                      );
                    }
                  )}
                </div>
                {canClaim && (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleClaimClick();
                    }}
                    disabled={claiming}
                    className="mt-2 w-full relative px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.2em] bg-gradient-to-r from-amber-500 to-purple-600 text-white shadow-[0_0_20px_rgba(251,191,36,0.3)]"
                  >
                    {claiming ? 'Aligning...' : 'Claim Daily'}
                  </motion.button>
                )}
                {streak && streak.currentStreak > 0 && (
                  <div className="flex justify-center items-center gap-2 px-3 py-1.5 bg-white/[0.04] rounded-full border border-white/5 mx-auto">
                    <span className="text-amber-400 text-sm">🔥</span>
                    <span className="text-xs font-bold text-white/80 tabular-nums">{streak.currentStreak} day streak</span>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
}
