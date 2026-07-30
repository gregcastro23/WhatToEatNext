/**
 * SQL builders for the environmental ingestion layer.
 *
 * ZERO runtime imports, deliberately. `scripts/checkEnvironmentalSqlParses.ts`
 * imports this module and PREPAREs every statement it exports against a real
 * PostgreSQL, so the gate checks exactly what ships and cannot drift from it.
 * The moment this file imports something with side effects, that gate has to
 * scrape strings instead — and a regex that stops matching reports "extracted
 * nothing", not "the SQL changed".
 *
 * Every bind parameter carries an explicit cast. A parameter used in two places
 * with two inferable types cannot be prepared at all (42P08), and that failure
 * is invisible to any test that mocks the database.
 *
 * @file src/services/environmentalQueries.ts
 */

/**
 * Idempotent insert of one reading.
 *
 * ON CONFLICT DO UPDATE so re-running the cron, or an archive backfill
 * overlapping live samples, converges instead of throwing. A live 'forecast'
 * reading is allowed to overwrite an 'archive' one for the same slot: the
 * live sample is the better measurement of what actually happened.
 *
 * Params: $1 geohash5, $2 observed_at, $3 surface_pressure_kpa,
 *         $4 dew_point_c, $5 air_temp_c, $6 source
 */
export function buildInsertObservation(): string {
  return `
    INSERT INTO environmental_observations (
      geohash5, observed_at, surface_pressure_kpa, dew_point_c, air_temp_c, source
    )
    VALUES (
      $1::varchar, $2::timestamptz, $3::numeric, $4::numeric, $5::numeric, $6::varchar
    )
    ON CONFLICT (geohash5, observed_at) DO UPDATE SET
      surface_pressure_kpa = EXCLUDED.surface_pressure_kpa,
      dew_point_c          = EXCLUDED.dew_point_c,
      air_temp_c           = EXCLUDED.air_temp_c,
      source               = EXCLUDED.source
  `;
}

/**
 * The trailing window for one geohash, newest first.
 *
 * Returns raw rows rather than aggregating in SQL: median and MAD are computed
 * in TypeScript because MAD is a median OF deviations FROM a median, which is
 * two passes Postgres has no single aggregate for. Bounded by the window, so
 * this is at most ~30 rows.
 *
 * Params: $1 geohash5, $2 window_days
 */
export function buildSelectWindowObservations(): string {
  return `
    SELECT
      observed_at,
      surface_pressure_kpa,
      dew_point_c,
      air_temp_c,
      source
    FROM environmental_observations
    WHERE geohash5 = $1::varchar
      AND observed_at >= NOW() - ($2::integer * INTERVAL '1 day')
    ORDER BY observed_at DESC
  `;
}

/**
 * Write the recomputed baseline.
 *
 * `created_at` is preserved on update so a location's first-seen date survives
 * every recomputation.
 *
 * Params: $1 geohash5, $2 elevation_m, $3 elevation_basis,
 *         $4 pressure_median_kpa, $5 pressure_mad_sigma_kpa,
 *         $6 dew_point_median_c, $7 dew_point_mad_sigma_c,
 *         $8 sample_days, $9 archive_seeded
 */
export function buildUpsertBaseline(): string {
  return `
    INSERT INTO environmental_baselines (
      geohash5, elevation_m, elevation_basis,
      pressure_median_kpa, pressure_mad_sigma_kpa,
      dew_point_median_c, dew_point_mad_sigma_c,
      sample_days, archive_seeded, last_computed_at
    )
    VALUES (
      $1::varchar, $2::numeric, $3::varchar,
      $4::numeric, $5::numeric,
      $6::numeric, $7::numeric,
      $8::integer, $9::boolean, NOW()
    )
    ON CONFLICT (geohash5) DO UPDATE SET
      elevation_m            = EXCLUDED.elevation_m,
      elevation_basis        = EXCLUDED.elevation_basis,
      pressure_median_kpa    = EXCLUDED.pressure_median_kpa,
      pressure_mad_sigma_kpa = EXCLUDED.pressure_mad_sigma_kpa,
      dew_point_median_c     = EXCLUDED.dew_point_median_c,
      dew_point_mad_sigma_c  = EXCLUDED.dew_point_mad_sigma_c,
      sample_days            = EXCLUDED.sample_days,
      archive_seeded         = EXCLUDED.archive_seeded,
      last_computed_at       = NOW()
  `;
}

/**
 * Read one baseline. The request hot path touches this table only.
 *
 * Params: $1 geohash5
 */
export function buildSelectBaseline(): string {
  return `
    SELECT
      geohash5,
      elevation_m,
      elevation_basis,
      pressure_median_kpa,
      pressure_mad_sigma_kpa,
      dew_point_median_c,
      dew_point_mad_sigma_c,
      sample_days,
      archive_seeded,
      last_computed_at
    FROM environmental_baselines
    WHERE geohash5 = $1::varchar
  `;
}

/**
 * Geohashes due for sampling at the given UTC hour.
 *
 * Each geohash is sampled once a day at its own derived hour, which keeps the
 * semidiurnal atmospheric tide out of the window's dispersion and spreads the
 * fleet's ingestion across the day instead of stampeding one cron minute.
 *
 * The NOT EXISTS clause makes the sweep idempotent within the hour: a geohash
 * already sampled today is skipped, so a retried or double-fired cron does not
 * double-write.
 *
 * Params: $1 sample_hour, $2 limit
 */
export function buildSelectGeohashesDueForSampling(): string {
  return `
    SELECT b.geohash5, b.elevation_m
    FROM environmental_baselines b
    WHERE MOD(
            ABS(('x' || SUBSTR(MD5(b.geohash5), 1, 8))::bit(32)::bigint),
            24
          ) = $1::integer
      AND NOT EXISTS (
        SELECT 1
        FROM environmental_observations o
        WHERE o.geohash5 = b.geohash5
          AND o.source = 'forecast'
          AND o.observed_at >= DATE_TRUNC('day', NOW())
      )
    ORDER BY b.last_computed_at ASC
    LIMIT $2::integer
  `;
}

/**
 * Baselines whose statistics have gone stale relative to their observations.
 *
 * Params: $1 max_age_hours, $2 limit
 */
export function buildSelectStaleBaselines(): string {
  return `
    SELECT geohash5, elevation_m, sample_days
    FROM environmental_baselines
    WHERE last_computed_at < NOW() - ($1::integer * INTERVAL '1 hour')
    ORDER BY last_computed_at ASC
    LIMIT $2::integer
  `;
}

/**
 * 90-day retention sweep.
 *
 * Bounded by $2 so one cron invocation cannot lock the table for an unbounded
 * span; the sweep converges across runs.
 *
 * Params: $1 retention_days, $2 batch_limit
 */
export function buildPruneObservations(): string {
  return `
    DELETE FROM environmental_observations
    WHERE ctid IN (
      SELECT ctid
      FROM environmental_observations
      WHERE observed_at < NOW() - ($1::integer * INTERVAL '1 day')
      LIMIT $2::integer
    )
  `;
}

/**
 * Fleet-wide summary for the admin surface.
 *
 * Reports what is actually in the tables — never a fabricated healthy-looking
 * shape. An empty fleet returns zeros, which the panel must render as an honest
 * "no source yet" rather than dressing up as live.
 *
 * No parameters.
 */
export function buildSummarizeBaselines(): string {
  return `
    SELECT
      COUNT(*)::integer                                              AS geohash_count,
      COUNT(*) FILTER (WHERE archive_seeded)::integer                AS archive_seeded_count,
      COUNT(*) FILTER (WHERE sample_days >= 30)::integer             AS mature_count,
      COALESCE(MIN(sample_days), 0)::integer                         AS min_sample_days,
      COALESCE(MAX(sample_days), 0)::integer                         AS max_sample_days,
      MAX(last_computed_at)                                          AS last_computed_at,
      (SELECT COUNT(*)::integer FROM environmental_observations)     AS observation_count
    FROM environmental_baselines
  `;
}

/**
 * Whether a geohash has ever been seeded, and how much history it holds.
 *
 * Drives the archive-seed decision on first sight. COUNT over a bounded window
 * with the covering index, so this stays cheap.
 *
 * Params: $1 geohash5, $2 window_days
 */
export function buildCountObservations(): string {
  return `
    SELECT
      COUNT(*)::integer                                        AS total,
      COUNT(*) FILTER (WHERE source = 'archive')::integer      AS archive_count,
      MIN(observed_at)                                         AS earliest,
      MAX(observed_at)                                         AS latest
    FROM environmental_observations
    WHERE geohash5 = $1::varchar
      AND observed_at >= NOW() - ($2::integer * INTERVAL '1 day')
  `;
}
