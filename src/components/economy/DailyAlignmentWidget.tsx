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
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { useAlchemical } from '@/contexts/AlchemicalContext/hooks';
import { useTokenEconomy } from '@/hooks/useTokenEconomy';
import type { AgentEventFeedItem, RecipePostFeedItem } from '@/lib/feed/historicalAgentFeed';
import { fetchHistoricalAgentFeed } from '@/lib/feed/historicalAgentFeedSource';

// Sign → element, for matching resonant agent voices to the user's element.
const SIGN_ELEMENT: Record<string, string> = {
  aries: 'Fire', leo: 'Fire', sagittarius: 'Fire',
  taurus: 'Earth', virgo: 'Earth', capricorn: 'Earth',
  gemini: 'Air', libra: 'Air', aquarius: 'Air',
  cancer: 'Water', scorpio: 'Water', pisces: 'Water',
};

function teaserLine(item: RecipePostFeedItem | AgentEventFeedItem): string {
  if (item.type === 'recipe_post') return `shared ${item.recipe.name}`;
  return 'channeled a new insight';
}

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

  // Resonant-voice teaser: the freshest post from a historical agent whose
  // sun sign shares the user's dominant element — a daily pull into the feed.
  const [resonantItem, setResonantItem] = useState<RecipePostFeedItem | AgentEventFeedItem | null>(null);
  useEffect(() => {
    let cancelled = false;
    fetchHistoricalAgentFeed()
      .then((items) => {
        if (cancelled || !Array.isArray(items)) return;
        const match = items.find((item): item is RecipePostFeedItem | AgentEventFeedItem => {
          if (item.type !== 'recipe_post' && item.type !== 'agent_event') return false;
          const sun = String(item.agent?.birthchart?.sun ?? '').toLowerCase();
          return SIGN_ELEMENT[sun] === dominantElement;
        });
        setResonantItem(match ?? null);
      })
      .catch(() => {
        /* the teaser is decoration — silence on failure */
      });
    return () => {
      cancelled = true;
    };
  }, [dominantElement]);

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

          {/* Resonant voice — deep link into the commons */}
          {resonantItem && (
            <p className="mt-3 text-[11px] text-purple-300/70">
              ✶ <span className="font-semibold text-purple-200">{resonantItem.agent.name}</span>{' '}
              (a fellow {dominantElement} voice) {teaserLine(resonantItem)} —{' '}
              <Link href="/feed" className="underline underline-offset-2 hover:text-purple-100">
                hear it in the commons
              </Link>
            </p>
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
