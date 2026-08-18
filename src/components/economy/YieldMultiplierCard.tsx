'use client';

/**
 * Yield Multiplier Card (Premium-Only)
 *
 * Visualizes the breakdown of the user's daily Cosmic Yield:
 *
 *    Base 10  ×  Premium 2.0  ×  Streak {multiplier}  =  {total}
 *
 * Each multiplier contribution is rendered as a segmented bar so the user
 * can see how much each bonus adds to their total daily tokens.
 *
 * Reads:
 *   - /api/quests/streak  → currentMultiplier, nextMilestone
 *   - useTokenEconomy()   → balances (for lastDailyClaimAt)
 *
 * @file src/components/economy/YieldMultiplierCard.tsx
 */

import { motion } from 'framer-motion';
import React, { useCallback, useEffect, useState } from 'react';
import { usePremium } from '@/contexts/PremiumContext';
import { TOKEN_ECONOMY_EVENT, useTokenEconomy } from '@/hooks/useTokenEconomy';
import {
  BASE_DAILY_TOKENS,
  PREMIUM_YIELD_MULTIPLIER,
  getStreakMultiplier,
} from '@/types/economy';

// ─── Types ────────────────────────────────────────────────────────────

interface StreakResponse {
  success: boolean;
  currentMultiplier: number;
  nextMilestone: { days: number; label: string } | null;
}

// ─── Component ────────────────────────────────────────────────────────

interface YieldMultiplierCardProps {
  className?: string;
}

export function YieldMultiplierCard({ className = '' }: YieldMultiplierCardProps) {
  const { isPremium } = usePremium();
  const { streak } = useTokenEconomy();
  const [streakMultiplier, setStreakMultiplier] = useState<number>(1);
  const [nextMilestone, setNextMilestone] =
    useState<{ days: number; label: string } | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchStreak = useCallback(async () => {
    try {
      const res = await fetch('/api/quests/streak', { credentials: 'include' });
      if (!res.ok) return;
      const data = (await res.json()) as StreakResponse;
      if (data.success) {
        setStreakMultiplier(data.currentMultiplier ?? 1);
        setNextMilestone(data.nextMilestone ?? null);
      }
    } catch {
      // Non-critical — fallback to local calculation
      if (streak) {
        setStreakMultiplier(getStreakMultiplier(streak.currentStreak));
      }
    } finally {
      setLoading(false);
    }
  }, [streak]);

  useEffect(() => {
    void fetchStreak();
  }, [fetchStreak]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const handler = () => {
      setTimeout(() => void fetchStreak(), 400);
    };
    window.addEventListener(TOKEN_ECONOMY_EVENT, handler);
    return () => window.removeEventListener(TOKEN_ECONOMY_EVENT, handler);
  }, [fetchStreak]);

  if (!isPremium) return null;

  const base = BASE_DAILY_TOKENS;
  const premiumMult = PREMIUM_YIELD_MULTIPLIER;
  const streakMult = Math.max(1, streakMultiplier);
  const total = base * premiumMult * streakMult;

  // Segment widths for the visual breakdown (proportional to contribution).
  const baseContribution = base; // 10
  const premiumContribution = base * premiumMult - base; // +10
  const streakContribution = base * premiumMult * streakMult - base * premiumMult; // variable

  const totalWidth = baseContribution + premiumContribution + streakContribution;
  const pctBase = (baseContribution / totalWidth) * 100;
  const pctPremium = (premiumContribution / totalWidth) * 100;
  const pctStreak = (streakContribution / totalWidth) * 100;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 22 }}
      className={`glass-card-premium rounded-3xl p-6 border-white/10 ${className}`}
    >
      <div className="flex items-center gap-3 mb-3">
        <span className="w-8 h-px bg-amber-500/40" />
        <span className="text-[9px] font-black text-amber-400/70 uppercase tracking-[0.4em]">
          Premium Yield Multiplier
        </span>
      </div>

      <div className="flex items-baseline justify-between flex-wrap gap-3 mb-4">
        <h3 className="text-xl font-black text-white tracking-tight">
          {loading ? '—' : `${total.toFixed(1)}`}
          <span className="text-[11px] font-black text-white/30 uppercase tracking-widest ml-2">
            tokens / day
          </span>
        </h3>
        <div className="text-[10px] text-white/40 font-mono tabular-nums">
          {base} × {premiumMult.toFixed(1)} × {streakMult.toFixed(2)}
        </div>
      </div>

      {/* Segmented bar */}
      <div className="relative h-3 w-full rounded-full overflow-hidden bg-white/[0.04] border border-white/5">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pctBase}%` }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="absolute inset-y-0 left-0 bg-gradient-to-r from-white/40 to-white/25"
          style={{ width: `${pctBase}%` }}
        />
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pctPremium}%` }}
          transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="absolute inset-y-0 bg-gradient-to-r from-amber-400 to-amber-500"
          style={{ left: `${pctBase}%`, width: `${pctPremium}%` }}
        />
        {pctStreak > 0 && (
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${pctStreak}%` }}
            transition={{ duration: 0.6, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="absolute inset-y-0 bg-gradient-to-r from-purple-500 to-fuchsia-500"
            style={{ left: `${pctBase + pctPremium}%`, width: `${pctStreak}%` }}
          />
        )}
      </div>

      {/* Legend */}
      <div className="flex items-center justify-between mt-3 gap-4 text-[10px] flex-wrap">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-white/40" />
          <span className="text-white/50 font-medium">
            Base{' '}
            <span className="text-white/80 font-black tabular-nums">
              +{baseContribution.toFixed(1)}
            </span>
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-amber-400" />
          <span className="text-white/50 font-medium">
            Premium{' '}
            <span className="text-amber-400 font-black tabular-nums">
              +{premiumContribution.toFixed(1)}
            </span>
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-fuchsia-500" />
          <span className="text-white/50 font-medium">
            Streak{' '}
            <span className="text-fuchsia-400 font-black tabular-nums">
              +{streakContribution.toFixed(1)}
            </span>
          </span>
        </div>
      </div>

      {/* Next milestone hint */}
      {nextMilestone && (
        <p className="text-[10px] text-white/25 italic mt-4 leading-relaxed">
          Next milestone:{' '}
          <span className="text-white/50 font-bold not-italic">
            {nextMilestone.label}
          </span>{' '}
          at{' '}
          <span className="text-amber-400/70 font-bold not-italic tabular-nums">
            {nextMilestone.days}-day streak
          </span>
          .
        </p>
      )}
    </motion.div>
  );
}
