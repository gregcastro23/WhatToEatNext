-- database/init/38-alert-events.sql
-- Operator alerts emitted on system-health transitions. One row per
-- transition (e.g. payments: OK -> DEGRADED). Powers the recent-alerts
-- panel and the audit trail for "what was the operator told about, when?"
--
-- Dispatch is independent: each sink (slack, email) is logged individually
-- so a Slack failure doesn't suppress the email and vice versa.

CREATE TABLE IF NOT EXISTS alert_events (
    id BIGSERIAL PRIMARY KEY,
    triggered_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    -- "system" for the aggregate overall transition; flow id (auth, onboarding, ...)
    -- or dependency id (planetary-agents, stripe, ...) for granular ones.
    component TEXT NOT NULL,
    previous_status TEXT NOT NULL CHECK (previous_status IN ('OK', 'DEGRADED', 'INCIDENT', 'UNKNOWN')),
    current_status TEXT NOT NULL CHECK (current_status IN ('OK', 'DEGRADED', 'INCIDENT', 'UNKNOWN')),
    severity TEXT NOT NULL CHECK (severity IN ('info', 'warn', 'error')),
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    -- Snapshot rowid this transition was detected against. NULL when the
    -- alert was triggered without a snapshot (e.g. manual dispatch).
    snapshot_id BIGINT REFERENCES system_health_snapshots(id) ON DELETE SET NULL,
    -- Per-sink dispatch record. Shape: { slack: { ok: bool, error?: string },
    -- email: { ok: bool, error?: string } }. DB sink is implicit (this row).
    dispatch JSONB NOT NULL DEFAULT '{}'::jsonb
);

COMMENT ON TABLE alert_events IS
    'Operator alerts emitted on system-status transitions. One row per transition; dispatch records per-sink outcome.';

CREATE INDEX IF NOT EXISTS idx_alert_events_triggered
    ON alert_events (triggered_at DESC);

CREATE INDEX IF NOT EXISTS idx_alert_events_component_triggered
    ON alert_events (component, triggered_at DESC);

CREATE INDEX IF NOT EXISTS idx_alert_events_severity_triggered
    ON alert_events (severity, triggered_at DESC);
