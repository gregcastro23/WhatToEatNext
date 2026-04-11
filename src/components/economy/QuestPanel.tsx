'use client';

/**
 * Quest Panel
 *
 * Displays daily rituals, weekly quests, and achievements with progress tracking.
 * Reports quest events and shows token rewards on completion.
 *
 * @file src/components/economy/QuestPanel.tsx
 */

import { motion, AnimatePresence } from 'framer-motion';
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { TOKEN_ECONOMY_EVENT, emitTokenEconomyUpdate } from '@/hooks/useTokenEconomy';
import type { QuestPanelData, QuestProgress, UserStreak } from '@/types/economy';

// ─── Token Symbols ────────────────────────────────────────────────────

const TOKEN_SYMBOLS: Record<string, { symbol: string; color: string }> = {
  Spirit: { symbol: '☉', color: 'amber' },
  Essence: { symbol: '☽', color: 'blue' },
  Matter: { symbol: '⊕', color: 'emerald' },
  Substance: { symbol: '☿', color: 'purple' },
  all: { symbol: '✦', color: 'amber' },
};

// ─── Quest Card ────────────────────────────────────────────────────────

function QuestCard({ quest }: { quest: QuestProgress }) {
  const isComplete = quest.completedAt !== null;
  const progressPercent = Math.min(100, (quest.progress / quest.quest.triggerThreshold) * 100);
  const tokenCfg = TOKEN_SYMBOLS[quest.quest.tokenRewardType] || TOKEN_SYMBOLS.all;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={`
        relative rounded-2xl p-4 border transition-all duration-300
        ${isComplete
          ? 'bg-white/[0.03] border-white/5 opacity-60'
          : 'bg-white/[0.04] border-white/10 hover:border-white/20 hover:bg-white/[0.06]'
        }
      `}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            {isComplete && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="text-emerald-400 text-sm"
              >
                ✓
              </motion.span>
            )}
            <h4 className={`text-xs font-bold truncate ${isComplete ? 'text-white/40 line-through' : 'text-white/90'}`}>
              {quest.quest.title}
            </h4>
          </div>
          {quest.quest.description && (
            <p className="text-[10px] text-white/30 leading-relaxed line-clamp-2">
              {quest.quest.description}
            </p>
          )}
        </div>

        {/* Reward Badge */}
        <div className="flex items-center gap-1.5 shrink-0 px-2 py-1 bg-white/[0.04] rounded-full border border-white/5">
          <span className={`text-${tokenCfg.color}-400 text-xs`}>{tokenCfg.symbol}</span>
          <span className="text-[10px] font-bold text-white/60">+{quest.quest.tokenRewardAmount}</span>
        </div>
      </div>

      {/* Progress Bar */}
      {!isComplete && quest.quest.triggerThreshold > 1 && (
        <div className="mt-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[9px] text-white/20 font-mono">
              {quest.progress}/{quest.quest.triggerThreshold}
            </span>
            <span className="text-[9px] text-white/20 font-mono">
              {progressPercent.toFixed(0)}%
            </span>
          </div>
          <div className="h-1 bg-white/[0.06] rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progressPercent}%` }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
              className={`h-full rounded-full bg-gradient-to-r from-${tokenCfg.color}-500 to-${tokenCfg.color}-400`}
            />
          </div>
        </div>
      )}
    </motion.div>
  );
}

// ─── Quest Section ────────────────────────────────────────────────────

function QuestSection({
  title,
  subtitle,
  quests,
  defaultOpen = true,
}: {
  title: string;
  subtitle: string;
  quests: QuestProgress[];
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const completedCount = quests.filter(q => q.completedAt !== null).length;

  return (
    <div>
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between mb-3 group"
      >
        <div className="flex items-center gap-3">
          <h3 className="text-[10px] font-black text-white/40 uppercase tracking-[0.25em]">
            {title}
          </h3>
          <span className="text-[9px] font-bold text-white/20 px-2 py-0.5 bg-white/[0.04] rounded-full">
            {completedCount}/{quests.length}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[9px] text-white/15 italic">{subtitle}</span>
          <motion.svg
            animate={{ rotate: open ? 180 : 0 }}
            className="w-3 h-3 text-white/15"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </motion.svg>
        </div>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="space-y-2">
              {quests.map(q => (
                <QuestCard key={q.quest.slug} quest={q} />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────

interface QuestPanelProps {
  className?: string;
}

export function QuestPanel({ className = '' }: QuestPanelProps) {
  const [questData, setQuestData] = useState<QuestPanelData | null>(null);
  const [streak, setStreak] = useState<UserStreak | null>(null);
  const [loading, setLoading] = useState(true);
  const prevCompletedSlugs = useRef<Set<string>>(new Set());

  const fetchQuests = useCallback(async () => {
    try {
      const res = await fetch('/api/quests', { credentials: 'include' });
      if (!res.ok) return;
      const data = await res.json();
      if (data.success) {
        const quests: QuestPanelData = data.quests;
        // Detect newly completed quests and dispatch a credit-flash event so
        // TokenBalanceBar sparks green on any quest finished elsewhere.
        const all = [...quests.daily, ...quests.weekly, ...quests.achievements];
        const currentCompleted = new Set(
          all.filter((q) => q.completedAt).map((q) => q.quest.slug),
        );
        const newlyCompleted = all.filter(
          (q) => q.completedAt && !prevCompletedSlugs.current.has(q.quest.slug),
        );
        if (prevCompletedSlugs.current.size > 0 && newlyCompleted.length > 0) {
          for (const q of newlyCompleted) {
            const amt = q.quest.tokenRewardAmount;
            const type = q.quest.tokenRewardType;
            const credits =
              type === 'all'
                ? { spirit: amt, essence: amt, matter: amt, substance: amt }
                : { [type.toLowerCase()]: amt };
            emitTokenEconomyUpdate({ source: 'quest', credits });
          }
        }
        prevCompletedSlugs.current = currentCompleted;
        setQuestData(quests);
        setStreak(data.streak);
      }
    } catch {
      // Non-critical
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchQuests();
  }, [fetchQuests]);

  // Refresh when any other component dispatches a tokenEconomy update.
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const handler = () => {
      setTimeout(() => void fetchQuests(), 400);
    };
    window.addEventListener(TOKEN_ECONOMY_EVENT, handler);
    return () => window.removeEventListener(TOKEN_ECONOMY_EVENT, handler);
  }, [fetchQuests]);

  if (loading) {
    return (
      <div className={`glass-card-premium rounded-[2.5rem] p-8 border-white/10 ${className}`}>
        <div className="animate-pulse space-y-4">
          <div className="h-3 bg-white/5 rounded w-1/3" />
          <div className="h-12 bg-white/5 rounded-xl" />
          <div className="h-12 bg-white/5 rounded-xl" />
          <div className="h-12 bg-white/5 rounded-xl" />
        </div>
      </div>
    );
  }

  if (!questData) return null;

  return (
    <div className={`glass-card-premium rounded-[2.5rem] p-8 border-white/10 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-[10px] font-black text-white/30 uppercase tracking-[0.35em]">
            Cosmic Quests
          </h2>
          <p className="text-[9px] text-white/15 mt-0.5 italic">Rituals of attainment</p>
        </div>
        {streak && streak.currentStreak > 0 && (
          <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-500/10 rounded-full border border-amber-500/20">
            <span className="text-amber-400 text-xs">🔥</span>
            <span className="text-[10px] font-bold text-amber-400 tabular-nums">{streak.currentStreak}</span>
            <span className="text-[9px] text-amber-400/50 font-medium">day{streak.currentStreak > 1 ? 's' : ''}</span>
          </div>
        )}
      </div>

      {/* Quest Sections */}
      <div className="space-y-6">
        {questData.daily.length > 0 && (
          <QuestSection
            title="Daily Rituals"
            subtitle="Resets at midnight"
            quests={questData.daily}
            defaultOpen
          />
        )}

        {questData.weekly.length > 0 && (
          <QuestSection
            title="Weekly Quests"
            subtitle="Resets Monday"
            quests={questData.weekly}
            defaultOpen={false}
          />
        )}

        {questData.achievements.length > 0 && (
          <QuestSection
            title="Achievements"
            subtitle="One-time"
            quests={questData.achievements}
            defaultOpen={false}
          />
        )}
      </div>
    </div>
  );
}
