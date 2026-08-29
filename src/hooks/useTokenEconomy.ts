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
import { z } from 'zod';
import type {
  DailyYieldResult,
  TokenBalances,
  TokenType,
  UserStreak,
} from '@/types';

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

const tokenBalancesSchema = z.object({
  spirit: z.number().finite(),
  essence: z.number().finite(),
  matter: z.number().finite(),
  substance: z.number().finite(),
  lastDailyClaimAt: z.string().nullable(),
  lastDailyClaimAgentsAt: z.string().nullable(),
  updatedAt: z.string(),
});

const userStreakSchema = z.object({
  currentStreak: z.number().finite(),
  longestStreak: z.number().finite(),
  lastActivityDate: z.string().nullable(),
  streakFrozenUntil: z.string().nullable(),
  updatedAt: z.string(),
});

const tokenDistributionSchema = z.object({
  spirit: z.number().finite(),
  essence: z.number().finite(),
  matter: z.number().finite(),
  substance: z.number().finite(),
});

const dailyYieldSchema = z.object({
  baseTokens: z.number().finite(),
  streakMultiplier: z.number().finite(),
  holdingsMultiplier: z.number().finite(),
  totalTokens: z.number().finite(),
  distribution: tokenDistributionSchema,
  transitBonus: tokenDistributionSchema,
  newBalances: tokenBalancesSchema,
  streakCount: z.number().finite(),
  milestoneBonus: z
    .object({
      days: z.number().finite(),
      totalTokens: z.number().finite(),
    })
    .optional(),
});

const economyBalanceResponseSchema = z.object({
  success: z.literal(true),
  balances: tokenBalancesSchema,
  streak: userStreakSchema,
  canClaimDaily: z.boolean(),
});

const claimDailyResponseSchema = z.object({
  success: z.literal(true),
  yield: dailyYieldSchema,
  message: z.string(),
});

const economyErrorResponseSchema = z.object({
  success: z.literal(false),
  message: z.string().optional(),
});

// ─── Helpers ──────────────────────────────────────────────────────────

function dispatchEconomyEvent(detail: TokenEconomyEventDetail): void {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(
    new CustomEvent<TokenEconomyEventDetail>(TOKEN_ECONOMY_EVENT, { detail }),
  );
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
      const payload: unknown = await res.json();
      const parsed = economyBalanceResponseSchema.safeParse(payload);
      if (parsed.success) {
        setBalances(parsed.data.balances);
        setStreak(parsed.data.streak);
        setCanClaimDaily(parsed.data.canClaimDaily);
        setError(null);
      } else {
        setError('Invalid economy response');
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
          spirit: prev.spirit + (credits.spirit ?? 0),
          essence: prev.essence + (credits.essence ?? 0),
          matter: prev.matter + (credits.matter ?? 0),
          substance: prev.substance + (credits.substance ?? 0),
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
      const payload: unknown = await res.json();
      const parsed = claimDailyResponseSchema.safeParse(payload);
      if (!parsed.success) {
        const errorResponse = economyErrorResponseSchema.safeParse(payload);
        setError(
          errorResponse.success
            ? (errorResponse.data.message ?? 'Claim failed')
            : 'Invalid claim response',
        );
        return null;
      }
      const yieldResult: DailyYieldResult = parsed.data.yield;
      // Optimistic merge of the returned balances.
      setBalances(yieldResult.newBalances);
      setCanClaimDaily(false);
      dispatchEconomyEvent({
        source: 'claim',
        credits: yieldResult.distribution,
        yield: yieldResult,
      });
      // Light vibration for tactile feedback.
      if (
        typeof navigator !== 'undefined' &&
        typeof navigator.vibrate === 'function'
      ) {
        navigator.vibrate([10, 30, 10]);
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
