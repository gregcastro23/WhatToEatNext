'use client';

/**
 * Sanctum Tasks
 *
 * The "Help Us Build" section of the Profile page. Surveys the dev-ops
 * quests (ESMS aligned) that reward users for contributing to the site.
 *
 * @file src/components/economy/SanctumTasks.tsx
 */

import { motion } from 'framer-motion';
import Link from 'next/link';
import React, { useCallback, useEffect, useState } from 'react';
import { TOKEN_ECONOMY_EVENT } from '@/hooks/useTokenEconomy';
import type { QuestPanelData, QuestProgress } from '@/types/economy';
import { PantryModal } from './PantryModal';

// ─── Quest Action Mappings ────────────────────────────────────────────

const QUEST_ACTIONS: Record<string, { label: string; href?: string }> = {
  'weekly-recipe-harmonizer': { label: 'Rate Recipes', href: '/recipes?rate=true' },
  'achieve-temporal-anchor': { label: 'Complete Profile' /* handled by props */ },
  'masters-pantry': { label: 'Classify' /* handled by modal */ },
  'spirit-add-cooking-method': { label: 'Preferences', href: '/profile?tab=preferences' },
  'spirit-add-favorite-cuisine': { label: 'Preferences', href: '/profile?tab=preferences' },
  'spirit-add-food-preference': { label: 'Preferences', href: '/profile?tab=preferences' },
  'essence-generate-recipes-10': { label: 'Generate', href: '/recipes' },
  'essence-generate-recipes-25': { label: 'Generate', href: '/recipes' },
  'essence-generate-recipes-50': { label: 'Generate', href: '/recipes' },
  'essence-generate-premium': { label: 'Go Premium', href: '/premium' },
  'essence-generate-meal-plan': { label: 'Meal Planner', href: '/planner' },
  'substance-first-purchase': { label: 'Shop', href: '/shop' },
  'substance-premium-signup': { label: 'Upgrade', href: '/premium' },
  'substance-add-favorite-restaurant': { label: 'Restaurants', href: '/restaurants' },
  'substance-add-restaurant-dish': { label: 'Restaurants', href: '/restaurants' },
  'substance-complete-nutritional-plan': { label: 'Nutrition', href: '/profile?tab=nutrition' },
  'matter-instacart-order': { label: 'Shop Instacart', href: '/pantry' },
  'matter-add-pantry-items': { label: 'My Pantry', href: '/pantry' },
  'matter-use-posso': { label: 'Ask Posso', href: '/posso' },
  'matter-send-commensal': { label: 'Social', href: '/commensal' },
  'matter-refer-user': { label: 'Refer a Friend', href: '/profile?tab=referrals' },
};

const SANCTUM_QUEST_SLUGS = Object.keys(QUEST_ACTIONS);

// ─── Helpers ──────────────────────────────────────────────────────────

function formatReward(quest: QuestProgress): string {
  const type = quest.quest.tokenRewardType;
  const amt = quest.quest.tokenRewardAmount;
  return type === 'all' ? `+${amt} All` : `+${amt} ${type}`;
}

const TOKEN_COLORS: Record<string, string> = {
  Spirit: 'amber',
  Essence: 'blue',
  Substance: 'purple',
  Matter: 'emerald',
  all: 'white',
};

// ─── Quest Row ────────────────────────────────────────────────────────

function TaskRow({
  quest,
  progress,
  total,
  completed,
  onOpenSettings,
  onOpenPantry,
  onClaimed,
}: {
  quest: QuestProgress;
  progress: number;
  total: number;
  completed: boolean;
  onOpenSettings?: () => void;
  onOpenPantry?: () => void;
  onClaimed?: () => void;
}) {
  const [claiming, setClaiming] = useState(false);
  const qDef = quest.quest;
  const claimed = !!quest.claimedAt;
  const pct = total > 0 ? Math.min(100, (progress / total) * 100) : 0;
  const accent = TOKEN_COLORS[qDef.tokenRewardType] || 'emerald';
  const reward = formatReward(quest);

  const actionMap = QUEST_ACTIONS[qDef.slug];
  const label = completed ? (claimed ? 'Completed' : 'Claim Reward') : (actionMap?.label || 'Start');

  // Handle specific onClick actions
  const handleAction = async () => {
    if (completed && claimed) return;
    
    if (completed && !claimed) {
      // Handle claiming
      setClaiming(true);
      try {
        const res = await fetch('/api/quests/claim', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ questSlug: qDef.slug, periodStart: quest.periodStart })
        });
        const data = await res.json();
        if (data.success) {
          // Emit event to update balances globally
          if (typeof window !== 'undefined') {
            window.dispatchEvent(new Event(TOKEN_ECONOMY_EVENT));
          }
          if (onClaimed) onClaimed();
        }
      } catch (err) {
        console.error('Failed to claim reward', err);
      } finally {
        setClaiming(false);
      }
      return;
    }

    if (qDef.slug === 'achieve-temporal-anchor') {
      onOpenSettings?.();
    } else if (qDef.slug === 'masters-pantry') {
      onOpenPantry?.();
    }
  };

  const actionNode = (completed && claimed) ? (
    <button
      disabled
      className={`px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.2em] bg-${accent}-500/5 text-${accent}-400/40 border border-${accent}-500/10 cursor-not-allowed`}
    >
      {label}
    </button>
  ) : (completed && !claimed) ? (
    <button
      onClick={() => void handleAction()}
      disabled={claiming}
      className={`px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.2em] bg-gradient-to-r from-${accent}-500 to-${accent}-600 text-white shadow-[0_0_15px_rgba(251,191,36,0.3)] hover:shadow-[0_0_25px_rgba(251,191,36,0.5)] transition-all disabled:opacity-50`}
    >
      {claiming ? 'Claiming...' : label}
    </button>
  ) : actionMap?.href ? (
    <Link
      href={actionMap.href}
      className={`inline-block px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.2em] bg-${accent}-500/10 text-${accent}-400 border border-${accent}-500/30 hover:bg-${accent}-500/20 transition-all`}
    >
      {label}
    </Link>
  ) : (
    <button
      onClick={() => void handleAction()}
      className={`px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.2em] bg-${accent}-500/10 text-${accent}-400 border border-${accent}-500/30 hover:bg-${accent}-500/20 transition-all`}
    >
      {label}
    </button>
  );

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 26 }}
      className={`relative rounded-2xl p-5 border transition-all duration-300 ${
        (completed && claimed)
          ? 'bg-white/[0.02] border-white/5 opacity-60'
          : (completed && !claimed)
          ? `bg-${accent}-500/10 border-${accent}-500/30 shadow-[0_0_20px_rgba(251,191,36,0.1)]`
          : 'bg-white/[0.04] border-white/10 hover:border-white/15 hover:bg-white/[0.06]'
      }`}
    >
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="flex-1 min-w-[220px]">
          <div className="flex items-center gap-2 mb-1">
            {completed && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="text-emerald-400 text-sm"
              >
                ✓
              </motion.span>
            )}
            <h4
              className={`text-xs font-black uppercase tracking-[0.2em] ${
                (completed && claimed) ? 'text-white/40 line-through' : 'text-white/85'
              }`}
            >
              {qDef.title}
            </h4>
            <span
              className={`text-[9px] font-bold px-2 py-0.5 rounded-full border text-${accent}-400 border-${accent}-500/20 bg-${accent}-500/5`}
            >
              {reward}
            </span>
          </div>
          <p className="text-[11px] text-white/35 leading-relaxed">{qDef.description}</p>

          {/* Progress bar — only for multi-step quests */}
          {(!completed) && total > 1 && (
            <div className="mt-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[9px] text-white/25 font-mono">
                  {progress}/{total}
                </span>
                <span className="text-[9px] text-white/25 font-mono">
                  {pct.toFixed(0)}%
                </span>
              </div>
              <div className="h-1 bg-white/[0.06] rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${pct}%` }}
                  transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                  className={`h-full rounded-full bg-gradient-to-r from-${accent}-500 to-${accent}-400`}
                />
              </div>
            </div>
          )}
        </div>
        <div className="flex-shrink-0">{actionNode}</div>
      </div>
    </motion.div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────

interface SanctumTasksProps {
  className?: string;
  onOpenSettings?: () => void;
}

export function SanctumTasks({ className = '', onOpenSettings }: SanctumTasksProps) {
  const [questData, setQuestData] = useState<QuestPanelData | null>(null);
  const [loading, setLoading] = useState(true);
  const [pantryModalOpen, setPantryModalOpen] = useState(false);

  const fetchQuests = useCallback(async () => {
    try {
      const res = await fetch('/api/quests', { credentials: 'include' });
      if (!res.ok) return;
      const data = await res.json();
      if (data.success) setQuestData(data.quests);
    } catch {
      // Non-critical
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchQuests();
  }, [fetchQuests]);

  // Refresh quest progress whenever the economy updates
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const handler = () => {
      setTimeout(() => void fetchQuests(), 400);
    };
    window.addEventListener(TOKEN_ECONOMY_EVENT, handler);
    return () => window.removeEventListener(TOKEN_ECONOMY_EVENT, handler);
  }, [fetchQuests]);

  // Filter & Group
  const allTasks = questData
    ? [...questData.weekly, ...questData.achievements]
        .filter(q => SANCTUM_QUEST_SLUGS.includes(q.quest.slug))
        .sort((a, b) => (a.quest.sortOrder ?? 0) - (b.quest.sortOrder ?? 0))
    : [];

  // Completion & reward summary
  const totalCount = allTasks.length;
  const claimableCount = allTasks.filter(q => !!q.completedAt && !q.claimedAt).length;
  const earnedCount = allTasks.filter(q => !!q.claimedAt).length;
  const claimableTokens = allTasks
    .filter(q => !!q.completedAt && !q.claimedAt)
    .reduce((sum, q) => sum + (q.quest.tokenRewardAmount || 0), 0);
  const completionPct = totalCount > 0 ? Math.round((earnedCount / totalCount) * 100) : 0;

  // Group logic
  const tasksByToken: Record<string, QuestProgress[]> = {
    All: [],
    Spirit: [],
    Essence: [],
    Substance: [],
    Matter: [],
  };

  allTasks.forEach(q => {
    const tokenType = q.quest.tokenRewardType === 'all' ? 'All' : q.quest.tokenRewardType;
    if (tasksByToken[tokenType]) {
      tasksByToken[tokenType].push(q);
    }
  });

  return (
    <>
      <div className={`glass-card-premium rounded-[2.5rem] p-8 border-white/10 ${className}`}>
        <div className="flex items-start justify-between mb-6 flex-wrap gap-3">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="w-8 h-px bg-amber-500/40" />
              <span className="text-[9px] font-black text-amber-400/70 uppercase tracking-[0.4em]">
                Sanctum Tasks
              </span>
            </div>
            <h2 className="text-xl font-black text-white tracking-tight">
              Alchemical Alignments
            </h2>
            <p className="text-[11px] text-white/30 mt-1 max-w-lg leading-relaxed">
              Earn ESMS tokens by performing actions that drive your personalized
              culinary journey and help tune the alchemical algorithms.
            </p>
          </div>

          {!loading && totalCount > 0 && (
            <div className="flex items-center gap-3 flex-wrap">
              <div className="text-right">
                <div className="text-[9px] font-bold text-white/40 uppercase tracking-[0.3em]">
                  Progress
                </div>
                <div className="text-sm font-black text-white/85">
                  {earnedCount}/{totalCount}
                  <span className="text-white/40 font-medium ml-1">({completionPct}%)</span>
                </div>
              </div>
              {claimableCount > 0 && (
                <div className="px-3 py-1.5 rounded-full bg-amber-500/15 border border-amber-500/40 shadow-[0_0_15px_rgba(251,191,36,0.15)]">
                  <div className="text-[9px] font-black text-amber-400/80 uppercase tracking-[0.2em]">
                    Claimable
                  </div>
                  <div className="text-xs font-black text-amber-200">
                    {claimableCount} task{claimableCount === 1 ? '' : 's'} · +{claimableTokens} tokens
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {!loading && totalCount > 0 && (
          <div className="mb-6 h-1 bg-white/[0.04] rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${completionPct}%` }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="h-full rounded-full bg-gradient-to-r from-amber-500 via-amber-400 to-emerald-400"
            />
          </div>
        )}

        {loading ? (
          <div className="space-y-3 animate-pulse">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-20 bg-white/[0.03] rounded-2xl" />
            ))}
          </div>
        ) : (
          <div className="space-y-8">
            {Object.entries(tasksByToken).map(([tokenType, quests]) => {
              if (quests.length === 0) return null;
              
              // We can add a subtitle for each token block
              let focusText = '';
              if (tokenType === 'Spirit') focusText = 'Focus: Onboarding & Preference Tuning';
              if (tokenType === 'Essence') focusText = 'Focus: Platform Engagement & Recipe Generation';
              if (tokenType === 'Substance') focusText = 'Focus: Economy, Premium, & External Data';
              if (tokenType === 'Matter') focusText = 'Focus: Real-World Action & Social Expansion';
              if (tokenType === 'All') focusText = 'Universal Alignments';

              return (
                <div key={tokenType} className="space-y-3">
                  <div className="flex items-center gap-2 mb-4 pl-1">
                    <h3 className="text-xs font-black uppercase tracking-[0.2em] text-white/60">
                      {tokenType}
                    </h3>
                    {focusText && (
                      <span className="text-[10px] text-white/30 italic">
                        — {focusText}
                      </span>
                    )}
                  </div>
                  <div className="space-y-3">
                    {quests.map((q) => (
                      <TaskRow
                        key={q.quest.slug}
                        quest={q}
                        progress={q.progress}
                        total={q.quest.triggerThreshold}
                        completed={!!q.completedAt}
                        onOpenSettings={onOpenSettings}
                        onOpenPantry={() => setPantryModalOpen(true)}
                      />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <PantryModal open={pantryModalOpen} onClose={() => setPantryModalOpen(false)} />
    </>
  );
}
