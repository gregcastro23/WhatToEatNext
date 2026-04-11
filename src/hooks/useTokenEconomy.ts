'use client';

/**
 * useTokenEconomy
 *
 * Lightweight client hook that centralizes reading + mutating the ESMS token
 * economy. Matches the codebase's existing manual-fetch style (no SWR / react-query).
 *
 * Exposes:
 *   - balances, streak, canClaimDaily, loading
 *   - refresh()                  — force refetch of /api/economy/balance
 *   - optimisticCredit(t, amt)   — flash the balance immediately; call refresh() after
 *   - claimDaily()               — POST /api/economy/claim-daily and emit events
 *
 * Emits a window `tokenEconomy:updated` CustomEvent after any mutation so that
 * siblings (TokenBalanceBar, LiveLedgerFeed, DailyAlignmentWidget, etc.) can
 * resync without a shared React context.
 *
 * @file src/hooks/useTokenEconomy.ts
 */

import { useCallback, useEffect, useState } from 'react';
import type {
  DailyYieldResult,
  TokenBalances,
  TokenType,
  UserStreak,
} from '@/types/economy';

// ─── Types ────────────────────────────────────────────────────────────

export const TOKEN_ECONOMY_EVENT = 'tokenEconomy:updated';

export interface TokenEconomyEventDetail {
  /** Which source triggered the update (e.g., 'claim', 'quest', 'optimistic'). */
  source: 'claim' | 'quest' | 'optimistic' | 'refresh';
  /** Optional per-token credit amounts for flash animations. */
  credits?: Partial<Record<Lowercase<TokenType>, number>>;
  /** Optional resulting yield for claim events. */
  yield?: DailyYieldResult;
}

export interface UseTokenEconomyResult {
  balances: TokenBalances | null;
  streak: UserStreak | null;
  canClaimDaily: boolean;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  optimisticCredit: (
    credits: Partial<Record<Lowercase<TokenType>, number>>,
    source?: TokenEconomyEventDetail['source'],
  ) => void;
  claimDaily: () => Promise<DailyYieldResult | null>;
}

// ─── Helpers ──────────────────────────────────────────────────────────

function dispatchEconomyEvent(detail: TokenEconomyEventDetail) {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent<TokenEconomyEventDetail>(TOKEN_ECONOMY_EVENT, { detail }));
}

// ─── Hook ─────────────────────────────────────────────────────────────

export function useTokenEconomy(): UseTokenEconomyResult {
  const [balances, setBalances] = useState<TokenBalances | null>(null);
  const [streak, setStreak] = useState<UserStreak | null>(null);
  const [canClaimDaily, setCanClaimDaily] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch('/api/economy/balance', { credentials: 'include' });
      if (!res.ok) {
        // Not authenticated or similar — surface silently.
        setLoading(false);
        return;
      }
      const data = await res.json();
      if (data.success) {
        setBalances(data.balances);
        setStreak(data.streak);
        setCanClaimDaily(!!data.canClaimDaily);
        setError(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load economy');
    } finally {
      setLoading(false);
    }
  }, []);

  const optimisticCredit = useCallback(
    (
      credits: Partial<Record<Lowercase<TokenType>, number>>,
      source: TokenEconomyEventDetail['source'] = 'optimistic',
    ) => {
      setBalances((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          spirit: (prev.spirit ?? 0) + (credits.spirit ?? 0),
          essence: (prev.essence ?? 0) + (credits.essence ?? 0),
          matter: (prev.matter ?? 0) + (credits.matter ?? 0),
          substance: (prev.substance ?? 0) + (credits.substance ?? 0),
        };
      });
      dispatchEconomyEvent({ source, credits });
    },
    [],
  );

  const claimDaily = useCallback(async (): Promise<DailyYieldResult | null> => {
    try {
      const res = await fetch('/api/economy/claim-daily', {
        method: 'POST',
        credentials: 'include',
      });
      const data = await res.json();
      if (!data.success) {
        setError(data.message || 'Claim failed');
        return null;
      }
      const yieldResult: DailyYieldResult = data.yield;
      // Optimistic merge of the returned balances.
      setBalances(yieldResult.newBalances);
      setCanClaimDaily(false);
      dispatchEconomyEvent({
        source: 'claim',
        credits: yieldResult.distribution,
        yield: yieldResult,
      });
      // Light vibration for tactile feedback.
      if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        navigator.vibrate?.([10, 30, 10]);
      }
      return yieldResult;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Claim failed');
      return null;
    }
  }, []);

  // Initial load.
  useEffect(() => {
    void refresh();
  }, [refresh]);

  // Listen to global economy updates from siblings (e.g., quest completions).
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const handler = () => {
      void refresh();
    };
    window.addEventListener(TOKEN_ECONOMY_EVENT, handler);
    return () => window.removeEventListener(TOKEN_ECONOMY_EVENT, handler);
  }, [refresh]);

  return {
    balances,
    streak,
    canClaimDaily,
    loading,
    error,
    refresh,
    optimisticCredit,
    claimDaily,
  };
}

/**
 * Utility for non-hook callers (e.g., quest submit handlers) to trigger a
 * site-wide economy refresh / flash without importing the full hook.
 */
export function emitTokenEconomyUpdate(detail: TokenEconomyEventDetail): void {
  dispatchEconomyEvent(detail);
}
