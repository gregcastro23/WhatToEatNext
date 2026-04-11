'use client';

/**
 * Daily Alignment Widget
 *
 * Lives on the Profile Overview tab. Checks whether the user has claimed
 * their daily Cosmic Yield. If not, renders a shimmering "Align with the
 * Cosmos" button that plays a birth-element glow animation, then redirects
 * to `/quantities?tab=economy&claim=true` — where the quantities page
 * auto-executes the claim and fires the TokenRainParticles splash.
 *
 * If already claimed, shows a gentle "Aligned" state with the current streak.
 *
 * @file src/components/economy/DailyAlignmentWidget.tsx
 */

import { AnimatePresence, motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';
import { useAlchemical } from '@/contexts/AlchemicalContext/hooks';
import { useTokenEconomy } from '@/hooks/useTokenEconomy';

// ─── Element palette (for birth-element glow) ───────────────────────

const ELEMENT_GLOW: Record<string, { hex: string; ring: string; tint: string }> = {
  Fire: { hex: 'rgba(251,146,60,0.6)', ring: 'ring-orange-500/40', tint: 'from-orange-500/30' },
  Water: { hex: 'rgba(96,165,250,0.6)', ring: 'ring-blue-500/40', tint: 'from-blue-500/30' },
  Earth: { hex: 'rgba(52,211,153,0.6)', ring: 'ring-emerald-500/40', tint: 'from-emerald-500/30' },
  Air: { hex: 'rgba(192,132,252,0.6)', ring: 'ring-purple-500/40', tint: 'from-purple-500/30' },
};

const ELEMENT_SYMBOL: Record<string, string> = {
  Fire: '🜂',
  Water: '🜄',
  Earth: '🜃',
  Air: '🜁',
};

// ─── Component ────────────────────────────────────────────────────────

export function DailyAlignmentWidget() {
  const router = useRouter();
  const { balances, streak, canClaimDaily, loading } = useTokenEconomy();
  const { getDominantElement } = useAlchemical();
  const [glowing, setGlowing] = useState(false);

  const dominantElement = (() => {
    try {
      return getDominantElement() || 'Fire';
    } catch {
      return 'Fire';
    }
  })();
  const elementCfg = ELEMENT_GLOW[dominantElement] ?? ELEMENT_GLOW.Fire;

  const handleAlign = () => {
    setGlowing(true);
    // Let the glow play briefly, then deep-link into the quantities economy tab
    // with the auto-claim flag. The quantities page will execute the claim and
    // mount the TokenRainParticles splash.
    setTimeout(() => {
      router.push('/quantities?tab=economy&claim=true');
    }, 800);
  };

  if (loading) {
    return (
      <div className="glass-card-premium rounded-3xl p-6 border-white/10 animate-pulse">
        <div className="h-3 w-32 bg-white/5 rounded mb-3" />
        <div className="h-8 w-48 bg-white/5 rounded" />
      </div>
    );
  }

  // Not signed in / no data — render nothing.
  if (!balances) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{
        opacity: 1,
        y: 0,
        boxShadow: glowing
          ? `0 0 60px ${elementCfg.hex}, 0 0 120px ${elementCfg.hex}`
          : '0 0 0 rgba(0,0,0,0)',
      }}
      transition={{ type: 'spring', stiffness: 300, damping: 22 }}
      className={`relative glass-card-premium rounded-3xl p-6 border-white/10 overflow-hidden ${glowing ? `ring-2 ${elementCfg.ring}` : ''}`}
    >
      {/* Ambient glow orb tinted to the birth element */}
      <motion.div
        animate={{ opacity: glowing ? 0.9 : 0.3, scale: glowing ? 1.3 : 1 }}
        transition={{ type: 'spring', stiffness: 300, damping: 22 }}
        className={`absolute -top-12 -right-12 w-56 h-56 rounded-full blur-3xl bg-gradient-to-br ${elementCfg.tint} to-transparent pointer-events-none`}
      />

      <div className="relative z-10 flex items-center justify-between gap-5 flex-wrap">
        <div className="min-w-0">
          <div className="flex items-center gap-3 mb-2">
            <span className="w-8 h-px bg-amber-500/40" />
            <span className="text-[9px] font-black text-amber-400/70 uppercase tracking-[0.4em]">
              Daily Cosmic Alignment
            </span>
          </div>
          <h3 className="text-2xl font-black text-white tracking-tight">
            {canClaimDaily ? 'The Stars Await You' : 'Aligned with the Cosmos'}
          </h3>
          <p className="text-[11px] text-white/30 mt-1 max-w-md leading-relaxed">
            {canClaimDaily
              ? `Draw down your daily Cosmic Yield — weighted by your natal chart and amplified by your ${dominantElement} ${ELEMENT_SYMBOL[dominantElement] ?? ''} element.`
              : 'Your ESMS tokens have been harvested for today. The next alignment unlocks at midnight local time.'}
          </p>

          {/* Streak chip */}
          {streak && streak.currentStreak > 0 && (
            <div className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 bg-amber-500/10 rounded-full border border-amber-500/20">
              <span className="text-amber-400 text-sm">🔥</span>
              <span className="text-[11px] font-bold text-amber-400 tabular-nums">
                {streak.currentStreak}
              </span>
              <span className="text-[9px] text-amber-400/60 font-medium">day streak</span>
            </div>
          )}
        </div>

        {/* CTA */}
        <AnimatePresence mode="wait">
          {canClaimDaily ? (
            <motion.button
              key="align-button"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: 'spring', stiffness: 300, damping: 22 }}
              onClick={handleAlign}
              disabled={glowing}
              className="relative px-7 py-3.5 rounded-full text-[11px] font-black uppercase tracking-[0.25em] bg-gradient-to-r from-amber-500 via-purple-600 to-amber-500 text-white shadow-[0_0_30px_rgba(251,191,36,0.35)] hover:shadow-[0_0_50px_rgba(251,191,36,0.6)] transition-all duration-300 overflow-hidden alchm-shimmer disabled:opacity-70"
              style={{ backgroundSize: '200% 100%' }}
            >
              <span className="relative z-10">
                {glowing ? 'Aligning…' : 'Align with the Cosmos'}
              </span>
            </motion.button>
          ) : (
            <motion.div
              key="aligned-chip"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="px-5 py-2.5 rounded-full border border-white/10 text-[10px] font-black uppercase tracking-[0.25em] text-white/40"
            >
              ✓ Aligned Today
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
