'use client';

/**
 * Sanctum Tasks
 *
 * The "Help Us Build" section of the Profile page. Surfaces three dev-ops
 * quests that reward users for contributing to the site:
 *
 *   1. The Alchemist's Eye       — report a bug (opens BugReportModal)
 *   2. Recipe Harmonizer          — rate 3 recipes (deep-links to /recipes)
 *   3. Temporal Anchor            — complete 100% of profile preferences
 *
 * Progress is read from `/api/quests`. The quest definitions are seeded in
 * migration 18 (`database/init/18-dev-ops-quests.sql`).
 *
 * @file src/components/economy/SanctumTasks.tsx
 */

import { motion } from 'framer-motion';
import Link from 'next/link';
import React, { useCallback, useEffect, useState } from 'react';
import { TOKEN_ECONOMY_EVENT } from '@/hooks/useTokenEconomy';
import type { QuestPanelData, QuestProgress } from '@/types/economy';
import { BugReportModal } from './BugReportModal';
import { PantryModal } from './PantryModal';

// ─── Quest slugs (must match migration 18) ───────────────────────────

const QUEST_SLUGS = {
  alchemistsEye: 'achieve-alchemists-eye',
  recipeHarmonizer: 'weekly-recipe-harmonizer',
  temporalAnchor: 'achieve-temporal-anchor',
  mastersPantry: 'masters-pantry',
} as const;

// ─── Helpers ──────────────────────────────────────────────────────────

function findQuest(data: QuestPanelData | null, slug: string): QuestProgress | null {
  if (!data) return null;
  const all = [...data.daily, ...data.weekly, ...data.achievements];
  return all.find((q) => q.quest.slug === slug) || null;
}

function formatReward(quest: QuestProgress | null): string {
  if (!quest) return '';
  const type = quest.quest.tokenRewardType;
  const amt = quest.quest.tokenRewardAmount;
  return type === 'all' ? `+${amt} all tokens` : `+${amt} ${type}`;
}

// ─── Quest Row ────────────────────────────────────────────────────────

function TaskRow({
  title,
  description,
  reward,
  progress,
  total,
  completed,
  accent,
  action,
}: {
  title: string;
  description: string;
  reward: string;
  progress: number;
  total: number;
  completed: boolean;
  accent: string; // tailwind color name (e.g., 'amber')
  action: React.ReactNode;
}) {
  const pct = total > 0 ? Math.min(100, (progress / total) * 100) : 0;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 26 }}
      className={`relative rounded-2xl p-5 border transition-all duration-300 ${
        completed
          ? 'bg-white/[0.02] border-white/5 opacity-60'
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
                completed ? 'text-white/40 line-through' : 'text-white/85'
              }`}
            >
              {title}
            </h4>
            <span
              className={`text-[9px] font-bold px-2 py-0.5 rounded-full border text-${accent}-400 border-${accent}-500/20 bg-${accent}-500/5`}
            >
              {reward}
            </span>
          </div>
          <p className="text-[11px] text-white/35 leading-relaxed">{description}</p>

          {/* Progress bar — only for multi-step quests */}
          {!completed && total > 1 && (
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
        <div className="flex-shrink-0">{action}</div>
      </div>
    </motion.div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────

interface SanctumTasksProps {
  className?: string;
  /** Called when user clicks the "Complete Profile" CTA (Temporal Anchor). */
  onOpenSettings?: () => void;
}

export function SanctumTasks({ className = '', onOpenSettings }: SanctumTasksProps) {
  const [questData, setQuestData] = useState<QuestPanelData | null>(null);
  const [loading, setLoading] = useState(true);
  const [bugModalOpen, setBugModalOpen] = useState(false);
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

  // Refresh quest progress whenever the economy updates (e.g., after submission).
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const handler = () => {
      setTimeout(() => void fetchQuests(), 400);
    };
    window.addEventListener(TOKEN_ECONOMY_EVENT, handler);
    return () => window.removeEventListener(TOKEN_ECONOMY_EVENT, handler);
  }, [fetchQuests]);

  const alchemistsEye = findQuest(questData, QUEST_SLUGS.alchemistsEye);
  const recipeHarmonizer = findQuest(questData, QUEST_SLUGS.recipeHarmonizer);
  const temporalAnchor = findQuest(questData, QUEST_SLUGS.temporalAnchor);
  const mastersPantry = findQuest(questData, QUEST_SLUGS.mastersPantry);

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
              Help Us Build the Sanctum
            </h2>
            <p className="text-[11px] text-white/30 mt-1 max-w-lg leading-relaxed">
              Earn ESMS tokens by helping us refine the site. These dev-ops
              quests reward real contributions.
            </p>
          </div>
        </div>

        {loading ? (
          <div className="space-y-3 animate-pulse">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-20 bg-white/[0.03] rounded-2xl" />
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {/* 1. The Alchemist's Eye — bug report */}
            <TaskRow
              title="The Alchemist's Eye"
              description="Report a bug you've discovered. Every confirmed report earns Spirit tokens and helps us polish the Sanctum."
              reward={alchemistsEye ? formatReward(alchemistsEye) : '+15 Spirit'}
              progress={alchemistsEye?.progress ?? 0}
              total={alchemistsEye?.quest.triggerThreshold ?? 1}
              completed={!!alchemistsEye?.completedAt}
              accent="amber"
              action={
                <button
                  onClick={() => setBugModalOpen(true)}
                  disabled={!!alchemistsEye?.completedAt}
                  className="px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.2em] bg-amber-500/10 text-amber-400 border border-amber-500/30 hover:bg-amber-500/20 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {alchemistsEye?.completedAt ? 'Completed' : 'Report a Bug'}
                </button>
              }
            />

            {/* 2. Recipe Harmonizer — rate 3 recipes */}
            <TaskRow
              title="Recipe Harmonizer"
              description="Rate 3 recipes you've tried. Your ratings tune the alchemical weights for everyone."
              reward={recipeHarmonizer ? formatReward(recipeHarmonizer) : '+20 Essence'}
              progress={recipeHarmonizer?.progress ?? 0}
              total={recipeHarmonizer?.quest.triggerThreshold ?? 3}
              completed={!!recipeHarmonizer?.completedAt}
              accent="blue"
              action={
                <Link
                  href="/recipes?rate=true"
                  className="inline-block px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.2em] bg-blue-500/10 text-blue-400 border border-blue-500/30 hover:bg-blue-500/20 transition-all"
                >
                  Rate Recipes
                </Link>
              }
            />

            {/* 3. Temporal Anchor — finish preferences */}
            <TaskRow
              title="Temporal Anchor"
              description="Complete 100% of your profile preferences. A full natal signal unlocks the most accurate daily yields."
              reward={temporalAnchor ? formatReward(temporalAnchor) : '+25 all tokens'}
              progress={temporalAnchor?.progress ?? 0}
              total={temporalAnchor?.quest.triggerThreshold ?? 1}
              completed={!!temporalAnchor?.completedAt}
              accent="emerald"
              action={
                <button
                  onClick={() => onOpenSettings?.()}
                  disabled={!!temporalAnchor?.completedAt}
                  className="px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.2em] bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/20 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {temporalAnchor?.completedAt ? 'Completed' : 'Complete Profile'}
                </button>
              }
            />

            {/* 4. The Master's Pantry — classify ingredient */}
            <TaskRow
              title="The Master's Pantry"
              description="Classify an unknown ingredient's elemental properties to earn Matter (🝙) tokens."
              reward={mastersPantry ? formatReward(mastersPantry) : '+2 Matter'}
              progress={mastersPantry?.progress ?? 0}
              total={mastersPantry?.quest.triggerThreshold ?? 1}
              completed={false}
              accent="emerald"
              action={
                <button
                  onClick={() => setPantryModalOpen(true)}
                  className="px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.2em] bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/20 transition-all"
                >
                  Classify
                </button>
              }
            />
          </div>
        )}
      </div>

      <BugReportModal open={bugModalOpen} onClose={() => setBugModalOpen(false)} />
      <PantryModal open={pantryModalOpen} onClose={() => setPantryModalOpen(false)} />
    </>
  );
}
