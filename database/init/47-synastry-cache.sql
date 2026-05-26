-- Migration: 47-synastry-cache.sql
-- Cache layer for the synastry MCP tools (compute_synastry_overlay,
-- get_transit_natal_overlay). One row per agent×planet keeps natal
-- positions joinable; two materialized views precompute the pairwise
-- inter-aspects and a single tension/harmony/intensification score per
-- pair, so the desktop Jing Arena hot path is one indexed SELECT.

-- ─────────────────────────────────────────────────────────────────────
-- 1. Natal positions per agent
-- ─────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS agent_natal_positions (
    agent_id       TEXT             NOT NULL,
    planet         TEXT             NOT NULL,  -- 'Sun', 'Moon', 'Mercury', ..., 'ASC', 'MC'
    longitude      DOUBLE PRECISION NOT NULL,  -- absolute ecliptic, 0..360
    sign           TEXT             NOT NULL,
    degree_in_sign DOUBLE PRECISION NOT NULL,  -- 0..30
    house          SMALLINT,
    retrograde     BOOLEAN          NOT NULL DEFAULT FALSE,
    updated_at     TIMESTAMPTZ      NOT NULL DEFAULT now(),
    PRIMARY KEY (agent_id, planet)
);

CREATE INDEX IF NOT EXISTS idx_agent_natal_positions_planet
    ON agent_natal_positions(planet);

-- ─────────────────────────────────────────────────────────────────────
-- 2. Pairwise inter-aspects (canonicalized so each unordered pair
--    appears exactly once via agent_id < join condition)
-- ─────────────────────────────────────────────────────────────────────

DROP MATERIALIZED VIEW IF EXISTS synastry_aspects CASCADE;

CREATE MATERIALIZED VIEW synastry_aspects AS
WITH pairs AS (
    SELECT
        a.agent_id     AS agent_a,
        b.agent_id     AS agent_b,
        a.planet       AS planet_a,
        b.planet       AS planet_b,
        a.longitude    AS lon_a,
        b.longitude    AS lon_b,
        LEAST(
            ABS(a.longitude - b.longitude),
            360.0 - ABS(a.longitude - b.longitude)
        )              AS delta_lon
    FROM agent_natal_positions a
    JOIN agent_natal_positions b
        ON a.agent_id < b.agent_id  -- dedupe ordering, exclude self-pairs
)
SELECT
    agent_a, agent_b, planet_a, planet_b, lon_a, lon_b, delta_lon,
    CASE
        WHEN delta_lon              <= 8  THEN 'conjunction'
        WHEN ABS(delta_lon - 60)    <= 6  THEN 'sextile'
        WHEN ABS(delta_lon - 90)    <= 8  THEN 'square'
        WHEN ABS(delta_lon - 120)   <= 8  THEN 'trine'
        WHEN ABS(delta_lon - 180)   <= 10 THEN 'opposition'
    END AS aspect_type,
    CASE
        WHEN delta_lon              <= 8  THEN delta_lon
        WHEN ABS(delta_lon - 60)    <= 6  THEN ABS(delta_lon - 60)
        WHEN ABS(delta_lon - 90)    <= 8  THEN ABS(delta_lon - 90)
        WHEN ABS(delta_lon - 120)   <= 8  THEN ABS(delta_lon - 120)
        WHEN ABS(delta_lon - 180)   <= 10 THEN ABS(delta_lon - 180)
    END AS orb,
    CASE
        WHEN delta_lon              <= 8  THEN 'intensification'
        WHEN ABS(delta_lon - 60)    <= 6  THEN 'harmony'
        WHEN ABS(delta_lon - 90)    <= 8  THEN 'friction'
        WHEN ABS(delta_lon - 120)   <= 8  THEN 'harmony'
        WHEN ABS(delta_lon - 180)   <= 10 THEN 'friction'
    END AS harmonic
FROM pairs
WHERE delta_lon              <= 8
   OR ABS(delta_lon - 60)    <= 6
   OR ABS(delta_lon - 90)    <= 8
   OR ABS(delta_lon - 120)   <= 8
   OR ABS(delta_lon - 180)   <= 10;

CREATE UNIQUE INDEX idx_synastry_aspects_pk
    ON synastry_aspects(agent_a, agent_b, planet_a, planet_b);
CREATE INDEX idx_synastry_aspects_pair
    ON synastry_aspects(agent_a, agent_b);
CREATE INDEX idx_synastry_aspects_harmonic
    ON synastry_aspects(harmonic);

-- ─────────────────────────────────────────────────────────────────────
-- 3. One-row-per-pair scores (the hot path for castJingDuel)
--    Orb-decay weighting: exact aspect = 1.0, max orb = 0.0
-- ─────────────────────────────────────────────────────────────────────

DROP MATERIALIZED VIEW IF EXISTS synastry_scores;

CREATE MATERIALIZED VIEW synastry_scores AS
SELECT
    agent_a,
    agent_b,
    COALESCE(SUM(CASE WHEN harmonic = 'friction'
                      THEN 1.0 - (orb / 10.0) END), 0)::float       AS tension_score,
    COALESCE(SUM(CASE WHEN harmonic = 'harmony'
                      THEN 1.0 - (orb / 8.0) END), 0)::float         AS harmony_score,
    COALESCE(SUM(CASE WHEN harmonic = 'intensification'
                      THEN 1.0 - (orb / 8.0) END), 0)::float         AS intensification_score,
    COUNT(*)                                                          AS aspect_count,
    now()                                                             AS computed_at
FROM synastry_aspects
GROUP BY agent_a, agent_b;

CREATE UNIQUE INDEX idx_synastry_scores_pk
    ON synastry_scores(agent_a, agent_b);

-- ─────────────────────────────────────────────────────────────────────
-- 4. Refresh helper. Call from synastryTools after upserting natal
--    positions; safe to call concurrently after the views exist.
-- ─────────────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION refresh_synastry_views() RETURNS void AS $$
BEGIN
    -- CONCURRENTLY requires the view to be populated at least once; on
    -- first run, fall back to a blocking refresh.
    BEGIN
        REFRESH MATERIALIZED VIEW CONCURRENTLY synastry_aspects;
        REFRESH MATERIALIZED VIEW CONCURRENTLY synastry_scores;
    EXCEPTION WHEN OTHERS THEN
        REFRESH MATERIALIZED VIEW synastry_aspects;
        REFRESH MATERIALIZED VIEW synastry_scores;
    END;
END;
$$ LANGUAGE plpgsql;
