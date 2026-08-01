/**
 * Environmental ingestion — the Dual-Baseline Engine's data layer.
 *
 * Responsibilities, in the order a location experiences them:
 *
 *   1. First sight  → resolve full-DEM elevation, seed the 30-day window from
 *                     the ERA5 archive, compute a baseline. Valid on day one.
 *   2. Every day    → sample the live forecast at the geohash's fixed UTC hour.
 *   3. After each   → recompute the robust median/MAD the anomaly is measured
 *      sample         against.
 *   4. Nightly      → prune raw observations past the 90-day retention.
 *
 * Raw SQL via `executeQuery`, with every statement built in
 * `environmentalQueries.ts` so the PREPARE gate can verify exactly what ships.
 *
 * @file src/services/environmentalIngestService.ts
 */

import { executeQuery } from "@/lib/database/connection";
import {
  ENVIRONMENT_GEOHASH_PRECISION,
  decodeGeohashCenter,
  encodeGeohash,
  sampleHourForGeohash,
} from "@/lib/environment/geohash";
import {
  ARCHIVE_LAG_DAYS,
  fetchArchiveSamples,
  fetchElevation,
  fetchForecastSamples,
  reduceToDailyAtHour,
  type EnvironmentSample,
} from "@/lib/environment/openMeteoClient";
import { robustStat } from "@/lib/environment/robustStats";
import { _logger } from "@/lib/logger";
import {
  buildCountObservations,
  buildInsertObservation,
  buildPruneObservations,
  buildSelectBaseline,
  buildSelectGeohashesDueForSampling,
  buildSelectWindowObservations,
  buildSummarizeBaselines,
  buildUpsertBaseline,
} from "@/services/environmentalQueries";

/** Trailing window the robust statistics are computed over. */
export const BASELINE_WINDOW_DAYS = 30;

/** Raw retention. Longer than the window so the statistic stays recomputable. */
export const OBSERVATION_RETENTION_DAYS = 90;

/**
 * Below this, MAD is too unstable to standardize against and the engine must
 * report an ABSENT confidence basis rather than a confident z-score.
 */
export const MINIMUM_CREDIBLE_SAMPLE_DAYS = 14;

export interface BaselineRow {
  geohash5: string;
  elevationM: number;
  elevationBasis: string;
  pressureMedianKpa: number;
  pressureMadSigmaKpa: number;
  dewPointMedianC: number;
  dewPointMadSigmaC: number;
  sampleDays: number;
  archiveSeeded: boolean;
  lastComputedAt: Date;
}

function toIsoDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

async function insertSamples(geohash5: string, samples: readonly EnvironmentSample[]): Promise<number> {
  const sql = buildInsertObservation();
  let written = 0;
  for (const sample of samples) {
    await executeQuery(sql, [
      geohash5,
      sample.observedAt.toISOString(),
      sample.surfacePressureKpa,
      sample.dewPointC,
      sample.airTempC,
      sample.source,
    ]);
    written++;
  }
  return written;
}

/**
 * Recompute the robust baseline for a geohash from its stored window.
 *
 * Returns null when the window is empty — an absent baseline, not a zeroed one.
 * A fabricated median here would propagate into every anomaly the location ever
 * reports.
 */
export async function recomputeBaseline(
  geohash5: string,
  elevationM: number,
  elevationBasis: string,
  archiveSeeded: boolean,
): Promise<BaselineRow | null> {
  const { rows } = await executeQuery(buildSelectWindowObservations(), [
    geohash5,
    BASELINE_WINDOW_DAYS,
  ]);
  if (rows.length === 0) return null;

  const pressures = rows.map((r: { surface_pressure_kpa: number }) => Number(r.surface_pressure_kpa));
  const dewPoints = rows.map((r: { dew_point_c: number }) => Number(r.dew_point_c));

  const pressureStat = robustStat(pressures);
  const dewPointStat = robustStat(dewPoints);

  // Distinct calendar days, not row count: an archive seed contributes many
  // hours per day, and counting rows would overstate how much independent
  // history actually stands behind the statistic.
  const distinctDays = new Set(
    rows.map((r: { observed_at: Date | string }) =>
      new Date(r.observed_at).toISOString().slice(0, 10),
    ),
  ).size;

  await executeQuery(buildUpsertBaseline(), [
    geohash5,
    elevationM,
    elevationBasis,
    pressureStat.median,
    pressureStat.madSigma,
    dewPointStat.median,
    dewPointStat.madSigma,
    distinctDays,
    archiveSeeded,
  ]);

  return {
    geohash5,
    elevationM,
    elevationBasis,
    pressureMedianKpa: pressureStat.median,
    pressureMadSigmaKpa: pressureStat.madSigma,
    dewPointMedianC: dewPointStat.median,
    dewPointMadSigmaC: dewPointStat.madSigma,
    sampleDays: distinctDays,
    archiveSeeded,
    lastComputedAt: new Date(),
  };
}

export async function getBaseline(geohash5: string): Promise<BaselineRow | null> {
  const { rows } = await executeQuery(buildSelectBaseline(), [geohash5]);
  if (rows.length === 0) return null;
  const r = rows[0];
  return {
    geohash5: r.geohash5,
    elevationM: Number(r.elevation_m),
    elevationBasis: r.elevation_basis,
    pressureMedianKpa: Number(r.pressure_median_kpa),
    pressureMadSigmaKpa: Number(r.pressure_mad_sigma_kpa),
    dewPointMedianC: Number(r.dew_point_median_c),
    dewPointMadSigmaC: Number(r.dew_point_mad_sigma_c),
    sampleDays: Number(r.sample_days),
    archiveSeeded: Boolean(r.archive_seeded),
    lastComputedAt: new Date(r.last_computed_at),
  };
}

/**
 * Seed a location's window from the ERA5 archive on first sight.
 *
 * Idempotent: a geohash that already holds archive rows is left alone, so a
 * retried cron or a second user in the same cell does not re-fetch.
 */
export async function seedFromArchive(
  latitude: number,
  longitude: number,
): Promise<BaselineRow | null> {
  const geohash5 = encodeGeohash(latitude, longitude, ENVIRONMENT_GEOHASH_PRECISION);

  const { rows: counts } = await executeQuery(buildCountObservations(), [
    geohash5,
    BASELINE_WINDOW_DAYS,
  ]);
  if (Number(counts[0]?.archive_count ?? 0) > 0) {
    return getBaseline(geohash5);
  }

  // Elevation is resolved from the caller's real coordinate, not the geohash
  // centroid — a ~5 km cell in rugged terrain spans enough elevation to move
  // the boiling point by more than a degree.
  const elevationM = await fetchElevation(latitude, longitude);

  // ERA5 lags real time, so the window ENDS where the archive has data — but it
  // must START at the edge of the baseline window, not BASELINE_WINDOW_DAYS
  // before the archive's end.
  //
  // The previous form (`start = end - 30d`) seeded days −36..−6 while
  // recomputeBaseline reads `observed_at >= NOW() - 30 days`. Six days of rows
  // were therefore outside the window at the instant they were written, and
  // sample_days topped out around 24 — so `mature_count` (sample_days >= 30)
  // could never be satisfied by a seed. Live sampling fills the recent
  // ARCHIVE_LAG_DAYS gap over the following week.
  const end = new Date(Date.now() - ARCHIVE_LAG_DAYS * 86_400_000);
  const start = new Date(Date.now() - BASELINE_WINDOW_DAYS * 86_400_000);

  const center = decodeGeohashCenter(geohash5);
  const hourly = await fetchArchiveSamples(
    center.latitude,
    center.longitude,
    elevationM,
    toIsoDate(start),
    toIsoDate(end),
  );

  const daily = reduceToDailyAtHour(hourly, sampleHourForGeohash(geohash5));
  const written = await insertSamples(geohash5, daily);

  void _logger.info("Seeded environmental baseline from archive", {
    geohash5,
    elevationM,
    daysWritten: written,
  });

  return recomputeBaseline(geohash5, elevationM, "MEASURED", true);
}

/** Take today's live sample for one geohash and refresh its baseline. */
export async function sampleGeohash(
  geohash5: string,
  elevationM: number,
): Promise<{ written: number; baseline: BaselineRow | null }> {
  const center = decodeGeohashCenter(geohash5);
  const hourly = await fetchForecastSamples(center.latitude, center.longitude, elevationM);
  const targetHour = sampleHourForGeohash(geohash5);

  const daily = reduceToDailyAtHour(hourly, targetHour).filter(
    (sample) => sample.observedAt.getTime() <= Date.now(),
  );

  const written = await insertSamples(geohash5, daily);
  const existing = await getBaseline(geohash5);
  const baseline = await recomputeBaseline(
    geohash5,
    elevationM,
    existing?.elevationBasis ?? "MEASURED",
    existing?.archiveSeeded ?? false,
  );
  return { written, baseline };
}

/** Geohashes due for sampling at the given UTC hour. */
export async function getGeohashesDueForSampling(
  utcHour: number,
  limit: number,
): Promise<Array<{ geohash5: string; elevationM: number }>> {
  const { rows } = await executeQuery(buildSelectGeohashesDueForSampling(), [utcHour, limit]);
  return rows.map((r: { geohash5: string; elevation_m: number }) => ({
    geohash5: r.geohash5,
    elevationM: Number(r.elevation_m),
  }));
}

export interface IngestionSummary {
  geohashCount: number;
  archiveSeededCount: number;
  /** Baselines with a full window behind them — the ones whose z-scores are trustworthy. */
  matureCount: number;
  minSampleDays: number;
  maxSampleDays: number;
  observationCount: number;
  lastComputedAt: Date | null;
  /**
   * False until at least one baseline exists. The admin surface must render
   * this as an honest "no source yet" rather than a healthy-looking zero.
   */
  live: boolean;
}

/** Fleet-wide ingestion health. Reports what is in the tables, never a shape. */
export async function summarizeIngestion(): Promise<IngestionSummary> {
  const { rows } = await executeQuery(buildSummarizeBaselines(), []);
  const r = rows[0] ?? {};
  const geohashCount = Number(r.geohash_count ?? 0);
  return {
    geohashCount,
    archiveSeededCount: Number(r.archive_seeded_count ?? 0),
    matureCount: Number(r.mature_count ?? 0),
    minSampleDays: Number(r.min_sample_days ?? 0),
    maxSampleDays: Number(r.max_sample_days ?? 0),
    observationCount: Number(r.observation_count ?? 0),
    lastComputedAt: r.last_computed_at ? new Date(r.last_computed_at) : null,
    live: geohashCount > 0,
  };
}

/** Retention sweep. Bounded per invocation; converges across runs. */
export async function pruneOldObservations(batchLimit = 5_000): Promise<number> {
  const result = await executeQuery(buildPruneObservations(), [
    OBSERVATION_RETENTION_DAYS,
    batchLimit,
  ]);
  return result.rowCount ?? 0;
}
