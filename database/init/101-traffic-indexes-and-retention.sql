-- database/init/101-traffic-indexes-and-retention.sql
-- Partial indexes for active human visitor queries and ?ref= attribution
-- rollups, plus 14-day bot retention in prune_page_views().
--
-- Plain CREATE INDEX IF NOT EXISTS (no CONCURRENTLY): the deploy-time runner
-- wraps each file in a transaction.

CREATE INDEX IF NOT EXISTS idx_page_views_active_humans
    ON page_views (last_seen_at DESC)
    WHERE is_bot = false;

CREATE INDEX IF NOT EXISTS idx_page_views_ref_tag
    ON page_views (ref_tag, at DESC)
    WHERE ref_tag IS NOT NULL AND is_bot = false;

DROP FUNCTION IF EXISTS prune_page_views(INTEGER);

CREATE OR REPLACE FUNCTION prune_page_views(
    retain_days INTEGER DEFAULT 180,
    bot_retain_days INTEGER DEFAULT 14
)
    RETURNS TABLE (page_views_deleted BIGINT) AS $$
DECLARE
    deleted BIGINT;
BEGIN
    DELETE FROM page_views
     WHERE (is_bot = true AND at < NOW() - (bot_retain_days || ' days')::INTERVAL)
        OR (is_bot = false AND at < NOW() - (retain_days || ' days')::INTERVAL);
    GET DIAGNOSTICS deleted = ROW_COUNT;
    RETURN QUERY SELECT deleted;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION prune_page_views(INTEGER, INTEGER) IS
    'Delete human page_views older than retain_days (default 180) and bot page_views older than bot_retain_days (default 14). Called by /api/cron/observability-prune.';
