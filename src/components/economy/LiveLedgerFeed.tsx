'use client';

/**
 * Live Ledger Feed
 *
 * Shows the user's last 3 ESMS token transactions in real time. Refetches
 * automatically every 30 s and immediately whenever a `tokenEconomy:updated`
 * event is dispatched (from claims, quest completions, etc.).
 *
 * @file src/components/economy/LiveLedgerFeed.tsx
 */

import { AnimatePresence, motion } from 'framer-motion';
import React, { useCallback, useEffect, useState } from 'react';
import { TOKEN_ECONOMY_EVENT } from '@/hooks/useTokenEconomy';
import type { TokenTransaction } from '@/types/economy';

// ─── Token visual map ────────────────────────────────────────────────

const TOKEN_VISUAL: Record<string, { symbol: string; color: string }> = {
  Spirit: { symbol: '🝇', color: 'text-amber-400' },
  Essence: { symbol: '🝑', color: 'text-blue-400' },
  Matter: { symbol: '🝙', color: 'text-emerald-400' },
  Substance: { symbol: '🝉', color: 'text-purple-400' },
};

const SOURCE_LABELS: Record<string, string> = {
  daily_yield: 'Cosmic Yield',
  quest_reward: 'Quest Reward',
  purchase: 'Shop Purchase',
  premium_purchase: 'Premium Purchase',
  transmutation: 'Transmutation',
  streak_bonus: 'Streak Bonus',
  admin: 'Admin Grant',
};

// ─── Helpers ──────────────────────────────────────────────────────────

function formatRelativeTime(iso: string): string {
  const then = new Date(iso).getTime();
  const now = Date.now();
  const diffSec = Math.max(0, Math.floor((now - then) / 1000));

  if (diffSec < 60) return 'just now';
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  const diffDay = Math.floor(diffHr / 24);
  return `${diffDay}d ago`;
}

// ─── Component ────────────────────────────────────────────────────────

interface LiveLedgerFeedProps {
  className?: string;
  limit?: number;
}

export function LiveLedgerFeed({ className = '', limit = 3 }: LiveLedgerFeedProps) {
  const [transactions, setTransactions] = useState<TokenTransaction[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTransactions = useCallback(async () => {
    try {
      const res = await fetch(`/api/economy/transactions?limit=${limit}`, {
        credentials: 'include',
      });
      if (!res.ok) {
        setLoading(false);
        return;
      }
      const data = await res.json();
      if (data.success) {
        setTransactions(data.transactions || []);
      }
    } catch {
      // Non-critical
    } finally {
      setLoading(false);
    }
  }, [limit]);

  useEffect(() => {
    void fetchTransactions();
    const interval = setInterval(() => void fetchTransactions(), 30_000);
    return () => clearInterval(interval);
  }, [fetchTransactions]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const handler = () => {
      // Give the server a moment to commit the new row before refetching.
      setTimeout(() => void fetchTransactions(), 350);
    };
    window.addEventListener(TOKEN_ECONOMY_EVENT, handler);
    return () => window.removeEventListener(TOKEN_ECONOMY_EVENT, handler);
  }, [fetchTransactions]);

  if (loading) {
    return (
      <div
        className={`glass-card-premium rounded-3xl p-6 border-white/10 animate-pulse ${className}`}
      >
        <div className="h-3 w-24 bg-white/5 rounded mb-4" />
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-10 bg-white/[0.03] rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={`glass-card-premium rounded-3xl p-6 border-white/10 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-[10px] font-black text-white/30 uppercase tracking-[0.4em]">
            Live Ledger
          </h3>
          <p className="text-[9px] text-white/15 italic mt-0.5">
            Last {limit} transmutations
          </p>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="relative flex h-1.5 w-1.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
          </span>
          <span className="text-[9px] font-black text-emerald-400/70 uppercase tracking-widest">
            Live
          </span>
        </div>
      </div>

      {transactions.length === 0 ? (
        <p className="text-[11px] text-white/25 italic text-center py-4">
          No transactions yet — claim your first Cosmic Yield to begin the ledger.
        </p>
      ) : (
        <ul className="space-y-2">
          <AnimatePresence initial={false}>
            {transactions.map((txn) => {
              const visual = TOKEN_VISUAL[txn.tokenType] || { symbol: '•', color: 'text-white/60' };
              const isCredit = txn.amount >= 0;
              const sourceLabel = SOURCE_LABELS[txn.sourceType] || txn.sourceType;
              return (
                <motion.li
                  key={txn.id}
                  layout
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 6 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 26 }}
                  className="flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl bg-white/[0.03] border border-white/5"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className={`text-lg ${visual.color}`}>{visual.symbol}</span>
                    <div className="min-w-0">
                      <div className="text-[11px] font-bold text-white/85 truncate">
                        {txn.description || sourceLabel}
                      </div>
                      <div className="text-[9px] text-white/25 uppercase tracking-wider">
                        {sourceLabel} · {formatRelativeTime(txn.createdAt)}
                      </div>
                    </div>
                  </div>
                  <div
                    className={`text-xs font-black tabular-nums flex-shrink-0 ${
                      isCredit ? 'text-emerald-400' : 'text-red-400'
                    }`}
                  >
                    {isCredit ? '+' : ''}
                    {txn.amount.toFixed(1)} {txn.tokenType}
                  </div>
                </motion.li>
              );
            })}
          </AnimatePresence>
        </ul>
      )}
    </div>
  );
}
