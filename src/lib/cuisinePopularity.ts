/**
 * Cuisine Popularity Signal
 *
 * Loads recent food_diary_entries → recipes joined cuisine counts to drive
 * popularity-based weighting in cuisine aggregation. Returns a normalized
 * map of cuisine name → weight in [0, 1].
 *
 * Server-only — relies on @/lib/database. Browser callers will get an
 * empty Map.
 */

import { _logger } from "@/lib/logger";

const isServerWithDB = (): boolean =>
  typeof window === "undefined" && !!process.env.DATABASE_URL;

let dbModule: typeof import("@/lib/database") | null = null;
const getDbModule = async () => {
  if (!dbModule && isServerWithDB()) {
    try {
      dbModule = await import("@/lib/database");
    } catch {
      _logger.warn("Database module not available for cuisine popularity");
    }
  }
  return dbModule;
};

export interface CuisinePopularityWeights {
  /** Raw entry count per cuisine over the window */
  rawCounts: Map<string, number>;
  /** Normalized weight per cuisine in [0, 1] (max-normalized) */
  weights: Map<string, number>;
  /** Window size used for the query */
  windowDays: number;
  /** Total entries counted */
  totalEntries: number;
}

const EMPTY_RESULT: CuisinePopularityWeights = {
  rawCounts: new Map(),
  weights: new Map(),
  windowDays: 0,
  totalEntries: 0,
};

/**
 * Load 30-day cuisine popularity weights from food_diary_entries.
 *
 * Only counts entries where food_source = 'recipe' and source_id resolves to
 * a row in the recipes table. The cuisine field on recipes drives the bucket.
 *
 * @param windowDays - Lookback window. Default 30 days.
 */
export async function loadCuisinePopularityWeights(
  windowDays = 30,
): Promise<CuisinePopularityWeights> {
  const db = await getDbModule();
  if (!db) return EMPTY_RESULT;

  try {
    const result = await db.executeQuery<{
      cuisine: string | null;
      entries: string;
    }>(
      `SELECT r.cuisine::text AS cuisine, COUNT(*)::text AS entries
       FROM food_diary_entries fde
       JOIN recipes r ON r.id::text = fde.source_id
       WHERE fde.food_source = 'recipe'
         AND fde.created_at > NOW() - ($1 || ' days')::INTERVAL
         AND r.cuisine IS NOT NULL
       GROUP BY r.cuisine`,
      [String(windowDays)],
    );

    const rawCounts = new Map<string, number>();
    let totalEntries = 0;
    let maxCount = 0;

    for (const row of result.rows) {
      if (!row.cuisine) continue;
      const count = parseInt(row.entries, 10) || 0;
      rawCounts.set(row.cuisine, count);
      totalEntries += count;
      if (count > maxCount) maxCount = count;
    }

    const weights = new Map<string, number>();
    if (maxCount > 0) {
      for (const [cuisine, count] of rawCounts) {
        weights.set(cuisine, count / maxCount);
      }
    }

    return { rawCounts, weights, windowDays, totalEntries };
  } catch (error) {
    _logger.error("loadCuisinePopularityWeights failed:", error);
    return EMPTY_RESULT;
  }
}
