-- database/init/36-synthetic-probes.sql
-- Synthetic probe results — cron-driven health checks exercising critical
-- flows so we catch breakage at low traffic.
--
-- Each row is one execution of one probe. The admin dashboard reads the
-- most recent row per probe_name to derive a status badge.

CREATE TABLE IF NOT EXISTS synthetic_probe_results (
    id BIGSERIAL PRIMARY KEY,
    probe_name TEXT NOT NULL,
    started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    status TEXT NOT NULL CHECK (status IN ('success', 'failure', 'timeout')),
    latency_ms INTEGER,
    http_status INTEGER,
    error_message TEXT,
    response_payload JSONB DEFAULT '{}'::jsonb
);

COMMENT ON TABLE synthetic_probe_results IS
    'Cron-driven synthetic checks of critical flows (currently: onboarding). Admin dashboard reads the latest row per probe_name.';

-- Indexed for "latest result per probe" lookups — covers ORDER BY started_at DESC LIMIT 1
CREATE INDEX IF NOT EXISTS idx_synthetic_probe_results_name_started
    ON synthetic_probe_results (probe_name, started_at DESC);

-- Indexed for time-window aggregations (e.g. "how many probes failed in last 24h?")
CREATE INDEX IF NOT EXISTS idx_synthetic_probe_results_status_started
    ON synthetic_probe_results (status, started_at DESC);
