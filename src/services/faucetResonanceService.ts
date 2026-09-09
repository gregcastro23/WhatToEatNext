/**
 * Faucet Resonance Service
 *
 * Reads `faucet_claim_resonance` — the per-claim record of what set each
 * untethered daily claim's magnitude (ADR-016) — and shapes it for the admin
 * Overview panel.
 *
 * This exists because the [3,24] band was opened without a shadow-mode period.
 * The two questions it has to answer are:
 *
 *   1. Are claims spread across the band, or piling up on a rail? Rail pile-up
 *      is the first visible sign the self-normalisation has drifted — exactly
 *      the failure the 2026-pinned baseline produced out of sample.
 *   2. Is emission tracking the ~4,380 ESMS/user/year the calibration promises?
 *
 * Never fabricates. When the table is absent or empty the report says so with
 * `live: false` rather than rendering zeros as if they were measurements.
 *
 * @file src/services/faucetResonanceService.ts
 */

import { executeQuery } from "@/lib/database/connection";
import { _logger } from "@/lib/logger";
import { PROTOCOL_BAND } from "@/types/economy";

/** Bucket count across the band; 3 ESMS per bucket over [3,24]. */
const BUCKETS = 7;

export interface ResonanceBucket {
  /** Inclusive lower edge of the bucket, in ESMS. */
  from: number;
  /** Exclusive upper edge, except the top bucket which includes Y_MAX. */
  to: number;
  claims: number;
}

export interface FaucetResonanceReport {
  /** False when the source table is missing or has no rows in the window. */
  live: boolean;
  /** Why the report is not live; null when it is. */
  reason: string | null;
  windowDays: number;
  claims: number;
  claimants: number;
  /** Occupancy across the band — the headline signal. */
  buckets: ResonanceBucket[];
  /** Claims clamped to each rail, and that share of all claims. */
  atMin: number;
  atMax: number;
  railShare: number;
  meanTotal: number | null;
  minTotal: number | null;
  maxTotal: number | null;
  /** Mean resonance z. Calibration says this should sit near 1.0. */
  meanRatio: number | null;
  /**
   * Mean daily total x 365 — what a daily claimer would earn per site per year
   * at the current pace, against `annualTarget`.
   */
  annualPace: number | null;
  annualTarget: number;
  /** Distinct baseline versions seen; more than one means a year rollover. */
  baselineVersions: string[];
}

interface SummaryRow {
  claims: string;
  claimants: string;
  mean_total: string | null;
  min_total: string | null;
  max_total: string | null;
  mean_ratio: string | null;
  at_min: string;
  at_max: string;
}

interface BucketRow {
  bucket: string;
  claims: string;
}

const empty = (windowDays: number, reason: string): FaucetResonanceReport => ({
  live: false,
  reason,
  windowDays,
  claims: 0,
  claimants: 0,
  buckets: [],
  atMin: 0,
  atMax: 0,
  railShare: 0,
  meanTotal: null,
  minTotal: null,
  maxTotal: null,
  meanRatio: null,
  annualPace: null,
  annualTarget: PROTOCOL_BAND.center * 365,
  baselineVersions: [],
});

const num = (value: string | null): number | null => {
  if (value === null) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

export async function getFaucetResonance(
  windowDays = 30,
): Promise<FaucetResonanceReport> {
  const width = (PROTOCOL_BAND.max - PROTOCOL_BAND.min) / BUCKETS;

  try {
    const [summary, buckets, versions] = await Promise.all([
      executeQuery<SummaryRow>(
        `SELECT COUNT(*)                                          AS claims,
                COUNT(DISTINCT user_id)                           AS claimants,
                AVG(total_esms)                                   AS mean_total,
                MIN(total_esms)                                   AS min_total,
                MAX(total_esms)                                   AS max_total,
                AVG(resonance_ratio)                              AS mean_ratio,
                COUNT(*) FILTER (WHERE band_edge = 'min')         AS at_min,
                COUNT(*) FILTER (WHERE band_edge = 'max')         AS at_max
           FROM faucet_claim_resonance
          WHERE claim_date >= CURRENT_DATE - make_interval(days => $1)`,
        [windowDays],
      ),
      executeQuery<BucketRow>(
        // width_bucket returns BUCKETS+1 for a value exactly at the top edge;
        // LEAST folds Y_MAX back into the final bucket rather than dropping it.
        `SELECT LEAST(width_bucket(total_esms, $2, $3, $4), $4) AS bucket,
                COUNT(*)                                        AS claims
           FROM faucet_claim_resonance
          WHERE claim_date >= CURRENT_DATE - make_interval(days => $1)
          GROUP BY 1
          ORDER BY 1`,
        [windowDays, PROTOCOL_BAND.min, PROTOCOL_BAND.max, BUCKETS],
      ),
      executeQuery<{ baseline_version: string }>(
        `SELECT DISTINCT baseline_version
           FROM faucet_claim_resonance
          WHERE claim_date >= CURRENT_DATE - make_interval(days => $1)
          ORDER BY baseline_version`,
        [windowDays],
      ),
    ]);

    const [row] = summary.rows;
    const claims = row ? Number(row.claims) : 0;
    if (!row || claims === 0) {
      return empty(windowDays, "No claims recorded in this window yet.");
    }

    const counts = new Map(
      buckets.rows.map((b) => [Number(b.bucket), Number(b.claims)]),
    );
    const atMin = Number(row.at_min);
    const atMax = Number(row.at_max);
    const meanTotal = num(row.mean_total);

    return {
      live: true,
      reason: null,
      windowDays,
      claims,
      claimants: Number(row.claimants),
      buckets: Array.from({ length: BUCKETS }, (_, i) => ({
        from: PROTOCOL_BAND.min + i * width,
        to: PROTOCOL_BAND.min + (i + 1) * width,
        claims: counts.get(i + 1) ?? 0,
      })),
      atMin,
      atMax,
      railShare: (atMin + atMax) / claims,
      meanTotal,
      minTotal: num(row.min_total),
      maxTotal: num(row.max_total),
      meanRatio: num(row.mean_ratio),
      annualPace: meanTotal === null ? null : meanTotal * 365,
      annualTarget: PROTOCOL_BAND.center * 365,
      baselineVersions: versions.rows.map((v) => v.baseline_version),
    };
  } catch (error) {
    // Most likely the migration has not run yet. An honest "no source" beats a
    // panel of zeros that reads as "nobody is claiming".
    _logger.error("[faucetResonance] read failed:", error);
    return empty(windowDays, "Resonance source unavailable (is migration 84 applied?).");
  }
}
