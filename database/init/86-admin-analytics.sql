-- database/init/86-admin-analytics.sql
-- First-party visit analytics + code-health snapshots for the admin surface.
--
-- page_views
--   One row per client-side page navigation, written by the public beacon
--   POST /api/track/pageview (src/components/analytics/PageViewTracker.tsx).
--   Before this table the admin could see API requests (request_log_entries)
--   but not a single human arriving at a page: a visitor who read the home
--   page and left produced no row anywhere.
--
--   Privacy model (the same one Plausible/Fathom use): NO raw IP and NO
--   persistent cross-day identifier. `visitor_hash` is
--   sha256(server secret ‖ UTC day ‖ ip ‖ user-agent), so it counts unique
--   visitors within a day and cannot be joined across days or reversed to an
--   IP. `session_id` is a random per-tab id held in sessionStorage. Signed-in
--   users carry `user_id` from their server-verified session only.
--
-- code_health_snapshots
--   One row per measured commit: tsc error count and ESLint errors/warnings,
--   produced by scripts/codeHealthSnapshot.ts in CI on every push to master
--   and POSTed to /api/admin/code-health/ingest. The committed ratchet
--   baselines (.lint-debt-baseline.json …) are ceilings; these rows are the
--   readings.
--
-- Plain CREATE INDEX IF NOT EXISTS (no CONCURRENTLY): the deploy-time runner
-- wraps each file in a transaction.

CREATE TABLE IF NOT EXISTS page_views (
    id BIGSERIAL PRIMARY KEY,
    at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    path TEXT NOT NULL,
    referrer_host TEXT,
    utm_source TEXT,
    utm_medium TEXT,
    utm_campaign TEXT,
    visitor_hash TEXT NOT NULL,
    session_id TEXT,
    user_id TEXT,
    country TEXT,
    region TEXT,
    city TEXT,
    device_type TEXT NOT NULL DEFAULT 'desktop'
        CHECK (device_type IN ('desktop', 'mobile', 'tablet', 'bot')),
    browser TEXT,
    os TEXT,
    is_bot BOOLEAN NOT NULL DEFAULT false
);

COMMENT ON TABLE page_views IS
    'First-party page views from /api/track/pageview. No raw IP; visitor_hash rotates daily. Pruned by prune_page_views().';

CREATE INDEX IF NOT EXISTS idx_page_views_at
    ON page_views (at DESC);

CREATE INDEX IF NOT EXISTS idx_page_views_path_at
    ON page_views (path, at DESC);

CREATE INDEX IF NOT EXISTS idx_page_views_user_at
    ON page_views (user_id, at DESC)
    WHERE user_id IS NOT NULL;

CREATE OR REPLACE FUNCTION prune_page_views(retain_days INTEGER DEFAULT 180)
    RETURNS TABLE (page_views_deleted BIGINT) AS $$
DECLARE
    deleted BIGINT;
BEGIN
    DELETE FROM page_views WHERE at < NOW() - (retain_days || ' days')::INTERVAL;
    GET DIAGNOSTICS deleted = ROW_COUNT;
    RETURN QUERY SELECT deleted;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION prune_page_views IS
    'Delete page_views rows older than retain_days (default 180). Called by /api/cron/observability-prune.';

CREATE TABLE IF NOT EXISTS code_health_snapshots (
    commit_sha TEXT NOT NULL,
    source TEXT NOT NULL CHECK (source IN ('ci', 'local')),
    measured_at TIMESTAMPTZ NOT NULL,
    committed_at TIMESTAMPTZ,
    branch TEXT,
    commit_message TEXT,
    -- NULL = that tool was not run for this snapshot (e.g. --skip-eslint),
    -- which is different from a measured 0.
    tsc_errors INTEGER,
    eslint_errors INTEGER,
    eslint_warnings INTEGER,
    payload JSONB NOT NULL,
    received_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (commit_sha, source)
);

COMMENT ON TABLE code_health_snapshots IS
    'Per-commit tsc/ESLint readings from scripts/codeHealthSnapshot.ts (CI on master push). Read by /admin/code-health.';

CREATE INDEX IF NOT EXISTS idx_code_health_snapshots_measured
    ON code_health_snapshots (measured_at DESC);
