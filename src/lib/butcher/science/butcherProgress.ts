import { z } from "zod";
import type {
  ButcherOrderScore,
  ButcherOrderTier,
  ButcherProgressStats,
  SpeciesId,
  SpeciesMasteryStats,
} from "@/lib/butcher/types";

/**
 * Zod-validated localStorage persistence for The Butcher's Block progress,
 * with the per-species mastery tracker.
 *
 * v1 (`alchm.butcher.progress.v1`) had no species dimension. Reading falls back
 * to v1 and migrates it (totals kept, mastery starts at zero — v1 never recorded
 * which species an order was for, so nothing can be attributed honestly). The
 * migrated record is written under the v2 key; the v1 key is left in place so a
 * rollback of this deploy still finds the player's original progress.
 *
 * @file src/lib/butcher/science/butcherProgress.ts
 */

export const BUTCHER_PROGRESS_STORAGE_KEY_V1 = "alchm.butcher.progress.v1";
export const BUTCHER_PROGRESS_STORAGE_KEY = "alchm.butcher.progress.v2";

export const MASTERY_SPECIES: readonly SpeciesId[] = ["beef", "pork", "lamb", "poultry", "finfish"];

export type MasteryRank = "Unranked" | "Initiate" | "Journeyman" | "Master";

/** Passes needed for each rank; "Master" also requires one Master-tier pass for that species. */
export const MASTERY_THRESHOLDS = { initiate: 1, journeyman: 3, master: 6 } as const;

const count = z.number().int().nonnegative();

const ProgressV1Schema = z.object({
  completedOrders: count,
  currentStreak: count,
  bestStreak: count,
  bestScore: z.number().min(0).max(100),
  tierCompleted: z.object({ apprentice: count, journeyman: count, master: count }),
});

const MasterySchema = z.object({ passed: count, masterPassed: count, bestScore: z.number().min(0).max(100) });

const ProgressV2Schema = ProgressV1Schema.extend({
  version: z.literal(2),
  speciesMastery: z.object({
    beef: MasterySchema, pork: MasterySchema, lamb: MasterySchema, poultry: MasterySchema, finfish: MasterySchema,
  }),
});

function emptyMastery(): Record<SpeciesId, SpeciesMasteryStats> {
  return {
    beef: { passed: 0, masterPassed: 0, bestScore: 0 },
    pork: { passed: 0, masterPassed: 0, bestScore: 0 },
    lamb: { passed: 0, masterPassed: 0, bestScore: 0 },
    poultry: { passed: 0, masterPassed: 0, bestScore: 0 },
    finfish: { passed: 0, masterPassed: 0, bestScore: 0 },
  };
}

export function defaultButcherProgress(): ButcherProgressStats {
  return {
    completedOrders: 0,
    currentStreak: 0,
    bestStreak: 0,
    bestScore: 0,
    tierCompleted: { apprentice: 0, journeyman: 0, master: 0 },
    speciesMastery: emptyMastery(),
  };
}

export function masteryRank(stats: SpeciesMasteryStats): MasteryRank {
  if (stats.passed >= MASTERY_THRESHOLDS.master && stats.masterPassed >= 1) return "Master";
  if (stats.passed >= MASTERY_THRESHOLDS.journeyman) return "Journeyman";
  if (stats.passed >= MASTERY_THRESHOLDS.initiate) return "Initiate";
  return "Unranked";
}

function storage(): Storage | null {
  if (typeof window === "undefined" || typeof window.localStorage === "undefined") return null;
  return window.localStorage;
}

function writeProgress(store: Storage, progress: ButcherProgressStats): void {
  try {
    store.setItem(BUTCHER_PROGRESS_STORAGE_KEY, JSON.stringify({ version: 2, ...progress }));
  } catch {
    // Ignore storage quota errors in private browsing.
  }
}

function parseJson(raw: string | null): unknown {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as unknown;
  } catch {
    return null;
  }
}

/** Pure migration: a valid v1 record becomes v2 with zeroed species mastery. */
export function migrateProgressV1(raw: unknown): ButcherProgressStats | null {
  const v1 = ProgressV1Schema.safeParse(raw);
  return v1.success ? { ...v1.data, speciesMastery: emptyMastery() } : null;
}

export function readButcherProgress(): ButcherProgressStats {
  const store = storage();
  if (!store) return defaultButcherProgress();
  try {
    const v2 = ProgressV2Schema.safeParse(parseJson(store.getItem(BUTCHER_PROGRESS_STORAGE_KEY)));
    if (v2.success) {
      const { version: _version, ...progress } = v2.data;
      return progress;
    }
    const migrated = migrateProgressV1(parseJson(store.getItem(BUTCHER_PROGRESS_STORAGE_KEY_V1)));
    if (migrated) {
      writeProgress(store, migrated);
      return migrated;
    }
  } catch {
    // Storage access can throw (blocked site data); fall through to defaults.
  }
  return defaultButcherProgress();
}

export function recordButcherResult(
  prev: ButcherProgressStats,
  score: ButcherOrderScore,
  tier: ButcherOrderTier,
  speciesId: SpeciesId,
): ButcherProgressStats {
  const nextStreak = score.passed ? prev.currentStreak + 1 : 0;
  const mastery = prev.speciesMastery[speciesId];
  const next: ButcherProgressStats = {
    completedOrders: score.passed ? prev.completedOrders + 1 : prev.completedOrders,
    currentStreak: nextStreak,
    bestStreak: Math.max(prev.bestStreak, nextStreak),
    bestScore: Math.max(prev.bestScore, score.totalScore),
    tierCompleted: {
      ...prev.tierCompleted,
      [tier]: score.passed ? prev.tierCompleted[tier] + 1 : prev.tierCompleted[tier],
    },
    speciesMastery: {
      ...prev.speciesMastery,
      [speciesId]: {
        passed: mastery.passed + (score.passed ? 1 : 0),
        masterPassed: mastery.masterPassed + (score.passed && tier === "master" ? 1 : 0),
        bestScore: Math.max(mastery.bestScore, score.totalScore),
      },
    },
  };
  const store = storage();
  if (store) writeProgress(store, next);
  return next;
}
