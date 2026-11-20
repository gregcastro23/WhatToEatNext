import { z } from "zod";
import type {
  ButcherOrderScore,
  ButcherOrderTier,
  ButcherProgressStats,
} from "@/lib/butcher/types";

/**
 * Zod-validated localStorage persistence for The Butcher's Block progress.
 *
 * @file src/lib/butcher/science/butcherProgress.ts
 */

export const BUTCHER_PROGRESS_STORAGE_KEY = "alchm.butcher.progress.v1";

const ProgressSchema = z.object({
  completedOrders: z.number().int().nonnegative(),
  currentStreak: z.number().int().nonnegative(),
  bestStreak: z.number().int().nonnegative(),
  bestScore: z.number().min(0).max(100),
  tierCompleted: z.object({
    apprentice: z.number().int().nonnegative(),
    journeyman: z.number().int().nonnegative(),
    master: z.number().int().nonnegative(),
  }),
});

export function defaultButcherProgress(): ButcherProgressStats {
  return {
    completedOrders: 0,
    currentStreak: 0,
    bestStreak: 0,
    bestScore: 0,
    tierCompleted: { apprentice: 0, journeyman: 0, master: 0 },
  };
}

export function readButcherProgress(): ButcherProgressStats {
  if (typeof window === "undefined" || typeof window.localStorage === "undefined") {
    return defaultButcherProgress();
  }
  try {
    const raw = window.localStorage.getItem(BUTCHER_PROGRESS_STORAGE_KEY);
    if (!raw) return defaultButcherProgress();
    const parsedJson: unknown = JSON.parse(raw);
    const result = ProgressSchema.safeParse(parsedJson);
    return result.success ? result.data : defaultButcherProgress();
  } catch {
    return defaultButcherProgress();
  }
}

export function recordButcherResult(
  prev: ButcherProgressStats,
  score: ButcherOrderScore,
  tier: ButcherOrderTier,
): ButcherProgressStats {
  const nextStreak = score.passed ? prev.currentStreak + 1 : 0;
  const next: ButcherProgressStats = {
    completedOrders: score.passed ? prev.completedOrders + 1 : prev.completedOrders,
    currentStreak: nextStreak,
    bestStreak: Math.max(prev.bestStreak, nextStreak),
    bestScore: Math.max(prev.bestScore, score.totalScore),
    tierCompleted: {
      ...prev.tierCompleted,
      [tier]: score.passed ? prev.tierCompleted[tier] + 1 : prev.tierCompleted[tier],
    },
  };
  if (typeof window !== "undefined" && typeof window.localStorage !== "undefined") {
    try {
      window.localStorage.setItem(BUTCHER_PROGRESS_STORAGE_KEY, JSON.stringify(next));
    } catch {
      // Ignore storage quota errors in private browsing.
    }
  }
  return next;
}
