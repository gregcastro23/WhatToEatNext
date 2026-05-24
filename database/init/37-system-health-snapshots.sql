-- database/init/37-system-health-snapshots.sql
-- Hourly snapshots of the full system-status payload. Pair with
-- alert_events (38) for transition detection and operator alerting.
--
-- Each row is one snapshot. The overall column is denormalized for fast
-- "show me the last 24h of overall health" queries; the full payload is
-- preserved in payload JSONB for drill-down (per-flow status, metrics,
-- recent issues at the time of capture).
--
-- Retention is a future concern — at the current write rate (1/hr) the
-- table grows ~8.8k rows/year which Postgres handles trivially. Revisit
-- if we add sub-hourly cadence or per-region splits.

CREATE TABLE IF NOT EXISTS system_health_snapshots (
    id BIGSERIAL PRIMARY KEY,
    captured_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    overall TEXT NOT NULL CHECK (overall IN ('OK', 'DEGRADED', 'INCIDENT', 'UNKNOWN')),
    flow_count INTEGER NOT NULL,
    dependency_count INTEGER NOT NULL,
    payload JSONB NOT NULL
);

COMMENT ON TABLE system_health_snapshots IS
    'Hourly point-in-time captures of the SystemStatusPayload. Source of truth for week-over-week drift detection and transition-based alerting.';

-- Indexed for "latest snapshot" lookup (alertService reads the most recent
-- vs. the new one to detect transitions).
CREATE INDEX IF NOT EXISTS idx_system_health_snapshots_captured
    ON system_health_snapshots (captured_at DESC);

-- Indexed for "last incident in window" queries.
CREATE INDEX IF NOT EXISTS idx_system_health_snapshots_overall_captured
    ON system_health_snapshots (overall, captured_at DESC);
