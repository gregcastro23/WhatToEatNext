-- database/init/108-telemetry-and-feed-retention.sql
-- Add retention pruning for synthetic_probe_results, system_metrics,
-- system_health_snapshots, processed webhook_events, and feed_events so
-- Railway Postgres page-cache footprint stays bounded without touching ledger
-- tables (e.g. token_transactions).
--
-- Plain CREATE INDEX IF NOT EXISTS (no CONCURRENTLY): the deploy-time runner
-- wraps each file in a transaction.

-- Speed up range deletes on synthetic_probe_results(started_at) and
-- processed webhook_events(received_at). system_metrics("timestamp"),
-- system_health_snapshots(captured_at), and feed_events(created_at) already
-- carry btree timestamp indexes from earlier migrations.
CREATE INDEX IF NOT EXISTS idx_synthetic_probe_results_started_at
    ON synthetic_probe_results (started_at);

CREATE INDEX IF NOT EXISTS idx_webhook_events_processed_received_at
    ON webhook_events (received_at)
    WHERE status = 'processed';

CREATE OR REPLACE FUNCTION prune_telemetry_and_webhooks(
    probe_retain_days INTEGER DEFAULT 14,
    metrics_retain_days INTEGER DEFAULT 14,
    snapshot_retain_days INTEGER DEFAULT 30,
    webhook_retain_days INTEGER DEFAULT 30
)
    RETURNS TABLE (
        synthetic_probes_deleted BIGINT,
        system_metrics_deleted BIGINT,
        health_snapshots_deleted BIGINT,
        webhook_events_deleted BIGINT
    ) AS $$
DECLARE
    probes_del BIGINT;
    metrics_del BIGINT;
    snapshots_del BIGINT;
    webhooks_del BIGINT;
BEGIN
    DELETE FROM synthetic_probe_results
     WHERE started_at < NOW() - make_interval(days => probe_retain_days);
    GET DIAGNOSTICS probes_del = ROW_COUNT;

    DELETE FROM system_metrics
     WHERE "timestamp" < NOW() - make_interval(days => metrics_retain_days);
    GET DIAGNOSTICS metrics_del = ROW_COUNT;

    DELETE FROM system_health_snapshots
     WHERE captured_at < NOW() - make_interval(days => snapshot_retain_days);
    GET DIAGNOSTICS snapshots_del = ROW_COUNT;

    DELETE FROM webhook_events
     WHERE status = 'processed'
       AND received_at < NOW() - make_interval(days => webhook_retain_days);
    GET DIAGNOSTICS webhooks_del = ROW_COUNT;

    RETURN QUERY SELECT probes_del, metrics_del, snapshots_del, webhooks_del;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION prune_telemetry_and_webhooks(INTEGER, INTEGER, INTEGER, INTEGER) IS
    'Prune synthetic probes (14d), system metrics (14d), health snapshots (30d), and processed webhook_events (30d). Called by /api/cron/observability-prune.';

CREATE OR REPLACE FUNCTION prune_feed_events(
    retain_days INTEGER DEFAULT 60,
    batch_limit INTEGER DEFAULT 5000
)
    RETURNS TABLE (feed_events_deleted BIGINT) AS $$
DECLARE
    deleted BIGINT;
BEGIN
    DELETE FROM feed_events
     WHERE id IN (
         SELECT id
           FROM feed_events
          WHERE created_at < NOW() - make_interval(days => retain_days)
          ORDER BY created_at ASC
          LIMIT batch_limit
     );
    GET DIAGNOSTICS deleted = ROW_COUNT;
    RETURN QUERY SELECT deleted;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION prune_feed_events(INTEGER, INTEGER) IS
    'Delete up to batch_limit feed_events rows older than retain_days (default 60d). Called by /api/cron/observability-prune.';
