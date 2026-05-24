-- database/init/39-observability-persistence.sql
-- Persist the in-memory observability rings so they survive cold starts
-- (Vercel serverless rotates processes aggressively; without this we lose
-- the recent-request and slow-query history on every restart).
--
-- Strategy:
--   - Existing in-memory ring stays the fast read path for admin endpoints.
--   - Writes are mirrored to these tables via Vercel `waitUntil`
--     (fire-and-forget; no per-request latency cost).
--   - On first read after cold start, hydrate the ring from the last N rows.
--
-- These tables are append-only and bounded by a retention sweep — see the
-- retention notes below. We don't index more than necessary because the
-- admin panel only needs "last N entries" + "summarize last M minutes."

CREATE TABLE IF NOT EXISTS request_log_entries (
    id BIGSERIAL PRIMARY KEY,
    at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    method TEXT NOT NULL,
    path TEXT NOT NULL,
    status INTEGER NOT NULL,
    latency_ms INTEGER NOT NULL,
    user_id TEXT,
    ip_hash TEXT
);

COMMENT ON TABLE request_log_entries IS
    'Per-request observability mirror of the in-memory ring buffer. Append-only; retention sweep runs nightly.';

-- "Last N" reads via at DESC; "summarize last 5m" reads via at >= cutoff.
CREATE INDEX IF NOT EXISTS idx_request_log_entries_at
    ON request_log_entries (at DESC);

-- Per-path summaries (admin route-health panel).
CREATE INDEX IF NOT EXISTS idx_request_log_entries_path_at
    ON request_log_entries (path, at DESC);

CREATE TABLE IF NOT EXISTS slow_query_log_entries (
    id BIGSERIAL PRIMARY KEY,
    at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    ms INTEGER NOT NULL,
    preview TEXT NOT NULL,
    row_count INTEGER
);

COMMENT ON TABLE slow_query_log_entries IS
    'Persisted slow-query records (queries above the configured threshold). Mirror of in-memory ring.';

CREATE INDEX IF NOT EXISTS idx_slow_query_log_entries_at
    ON slow_query_log_entries (at DESC);

-- Retention helper: prune rows older than 7 days. Run manually or wire to
-- a periodic job once we have one. Designed as a function so it can be
-- called from an /api/cron/observability-prune route later.
CREATE OR REPLACE FUNCTION prune_observability_logs(retain_days INTEGER DEFAULT 7)
    RETURNS TABLE (request_log_deleted BIGINT, slow_query_log_deleted BIGINT) AS $$
DECLARE
    req_deleted BIGINT;
    slow_deleted BIGINT;
BEGIN
    DELETE FROM request_log_entries WHERE at < NOW() - (retain_days || ' days')::INTERVAL;
    GET DIAGNOSTICS req_deleted = ROW_COUNT;

    DELETE FROM slow_query_log_entries WHERE at < NOW() - (retain_days || ' days')::INTERVAL;
    GET DIAGNOSTICS slow_deleted = ROW_COUNT;

    RETURN QUERY SELECT req_deleted, slow_deleted;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION prune_observability_logs IS
    'Delete observability log rows older than retain_days (default 7). Returns deleted row counts.';
