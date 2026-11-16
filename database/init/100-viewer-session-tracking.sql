-- database/init/100-viewer-session-tracking.sql
-- Upgrades page_views (migration 86) with per-view correlation ids, dwell-time
-- tracking, active-tab heartbeats, safe share/referral tags (?ref=), and
-- anonymous micro-interaction trails.
--
-- Plain CREATE INDEX IF NOT EXISTS (no CONCURRENTLY): the deploy-time runner
-- wraps each file in a transaction.

ALTER TABLE page_views
    ADD COLUMN IF NOT EXISTS view_id TEXT,
    ADD COLUMN IF NOT EXISTS duration_ms INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN IF NOT EXISTS last_seen_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    ADD COLUMN IF NOT EXISTS ref_tag TEXT,
    ADD COLUMN IF NOT EXISTS interactions JSONB NOT NULL DEFAULT '[]'::jsonb;

CREATE UNIQUE INDEX IF NOT EXISTS idx_page_views_view_id
    ON page_views (view_id)
    WHERE view_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_page_views_session_at
    ON page_views (COALESCE(session_id, visitor_hash), at DESC);

CREATE INDEX IF NOT EXISTS idx_page_views_last_seen_at
    ON page_views (last_seen_at DESC);
