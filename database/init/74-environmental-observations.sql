-- Environmental Thermodynamics — Dual-Baseline Engine, ingestion tables.
--
-- Two tables by design:
--
--   environmental_observations  raw readings, 90-day retention. The audit trail.
--                               Never read on the request hot path.
--   environmental_baselines     one row per geohash. The precomputed median/MAD
--                               the daily anomaly is measured against.
--
-- Raw is retained for 90 days rather than the 30 the window needs, so the
-- statistic can be recomputed, audited, or changed without data loss. Robust
-- statistics cannot be updated incrementally the way a mean can — median and MAD
-- need the actual sample set — so the raw rows are not optional.
--
-- NOTE: the migration runner wraps each file in a transaction, so no
-- CREATE INDEX CONCURRENTLY here.

CREATE TABLE IF NOT EXISTS environmental_observations (
  -- Geohash precision 5 (~4.9 km). Finer is false precision against an ~11 km
  -- model grid, and coarser spans too much elevation in mountainous terrain.
  geohash5           VARCHAR(5)   NOT NULL,
  observed_at        TIMESTAMPTZ  NOT NULL,

  -- STATION pressure, never sea-level-adjusted (MSLP/QNH). MSLP has the altitude
  -- signal removed by construction: stored here it would make Denver read ~101
  -- kPa and silently erase the single largest term in the whole engine.
  surface_pressure_kpa  NUMERIC(7,3) NOT NULL,

  -- Dew point is the transported invariant. Relative humidity is NOT stored:
  -- it is a ratio against a temperature-dependent saturation pressure, so it
  -- does not survive the trip from outdoor air to indoor air. RH is recomputed
  -- at the indoor temperature when it is actually needed.
  dew_point_c        NUMERIC(6,3) NOT NULL,
  air_temp_c         NUMERIC(6,3) NOT NULL,

  -- 'forecast' = live sampling; 'archive' = one-time backfill seeding the window.
  -- Kept distinct so a baseline can always be attributed to how it was obtained.
  source             VARCHAR(16)  NOT NULL,

  created_at         TIMESTAMPTZ  NOT NULL DEFAULT NOW(),

  CONSTRAINT environmental_observations_pkey PRIMARY KEY (geohash5, observed_at),
  CONSTRAINT environmental_observations_source_check
    CHECK (source IN ('forecast', 'archive')),
  -- Bounds are deliberately wide enough for any real place on Earth and tight
  -- enough to reject a unit mix-up: Pa instead of kPa, or °F instead of °C.
  CONSTRAINT environmental_observations_pressure_range
    CHECK (surface_pressure_kpa > 45 AND surface_pressure_kpa < 115),
  CONSTRAINT environmental_observations_dew_point_range
    CHECK (dew_point_c > -90 AND dew_point_c < 60)
);

-- Serves the window scan: "the last N days for this geohash, newest first".
CREATE INDEX IF NOT EXISTS environmental_observations_window_idx
  ON environmental_observations (geohash5, observed_at DESC);

-- Serves the 90-day retention sweep across all geohashes.
CREATE INDEX IF NOT EXISTS environmental_observations_retention_idx
  ON environmental_observations (observed_at);


CREATE TABLE IF NOT EXISTS environmental_baselines (
  geohash5            VARCHAR(5)   PRIMARY KEY,

  -- Full-DEM elevation for the location, NOT the geohash cell centroid. This is
  -- the dominant term in the engine and the reason a p5 key is acceptable for
  -- weather but not for altitude.
  elevation_m         NUMERIC(7,2) NOT NULL,
  elevation_basis     VARCHAR(16)  NOT NULL,

  -- Robust trailing-window statistics. These are the z-score denominators.
  -- Median/MAD rather than mean/sigma: the outliers are what the engine exists
  -- to detect, and a classical sigma lets an outlier inflate the denominator
  -- that would have caught it.
  pressure_median_kpa     NUMERIC(7,3) NOT NULL,
  pressure_mad_sigma_kpa  NUMERIC(7,4) NOT NULL,
  dew_point_median_c      NUMERIC(6,3) NOT NULL,
  dew_point_mad_sigma_c   NUMERIC(6,4) NOT NULL,

  -- Days actually behind the statistics above. MAD over a handful of samples is
  -- close to meaningless, so this gates the advisory's confidence basis.
  sample_days         INTEGER      NOT NULL,

  -- True while the window was seeded from the archive rather than sampled live.
  -- Lets the engine be honest about provenance on a location's first day.
  archive_seeded      BOOLEAN      NOT NULL DEFAULT FALSE,

  last_computed_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  created_at          TIMESTAMPTZ  NOT NULL DEFAULT NOW(),

  CONSTRAINT environmental_baselines_elevation_basis_check
    CHECK (elevation_basis IN ('MEASURED', 'DERIVED', 'COMPUTED', 'ABSENT')),
  CONSTRAINT environmental_baselines_sample_days_check
    CHECK (sample_days >= 0),
  -- A negative dispersion is impossible; zero is legal and means "no observed
  -- spread", which callers must surface as an undefined z rather than Infinity.
  CONSTRAINT environmental_baselines_dispersion_check
    CHECK (pressure_mad_sigma_kpa >= 0 AND dew_point_mad_sigma_c >= 0)
);

-- Serves the staleness sweep: which baselines need recomputing.
CREATE INDEX IF NOT EXISTS environmental_baselines_staleness_idx
  ON environmental_baselines (last_computed_at);

COMMENT ON TABLE environmental_observations IS
  'Raw weather readings per geohash5, 90-day retention. Station pressure only, never MSLP.';
COMMENT ON TABLE environmental_baselines IS
  'Per-geohash climatic baseline: robust median/MAD over the trailing window, plus full-DEM elevation.';
