-- database/init/106-feed-events-action-label.sql
-- Materialize the short normalized action label (<= 120 chars) onto feed_events
-- via a lightweight BEFORE INSERT/UPDATE trigger + covering INCLUDE index so
-- ROLE_OPS_RECENT_ACTIONS_SQL satisfies an Index-Only Scan (Heap Fetches: 0)
-- without detoasting metadata_payload (~50k buffers -> <10ms).
--
-- migrate:no-transaction

-- 1. Metadata-only instant column addition.
ALTER TABLE feed_events
  ADD COLUMN IF NOT EXISTS action_label TEXT;

-- 2. Trigger function mirroring the canonical action extraction rule.
CREATE OR REPLACE FUNCTION sync_feed_events_action_label()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.action_label := LEFT(
    COALESCE(
      NULLIF(split_part(NEW.event_type, '.', 2), ''),
      NULLIF(NEW.metadata_payload->>'messageType', ''),
      NULLIF(NEW.metadata_payload->>'internalTrigger', ''),
      NULLIF(NEW.metadata_payload->>'source', ''),
      NEW.event_type::text
    ),
    120
  );
  RETURN NEW;
END;
$$;

-- 3. Attach trigger before backfill so concurrent writers populate action_label immediately.
DROP TRIGGER IF EXISTS trg_feed_events_sync_action_label ON feed_events;
CREATE TRIGGER trg_feed_events_sync_action_label
  BEFORE INSERT OR UPDATE OF event_type, metadata_payload
  ON feed_events
  FOR EACH ROW
  EXECUTE FUNCTION sync_feed_events_action_label();

-- 4. Idempotent backfill for existing rows (trigger only fires on event_type/metadata_payload updates).
UPDATE feed_events
   SET action_label = LEFT(
         COALESCE(
           NULLIF(split_part(event_type, '.', 2), ''),
           NULLIF(metadata_payload->>'messageType', ''),
           NULLIF(metadata_payload->>'internalTrigger', ''),
           NULLIF(metadata_payload->>'source', ''),
           event_type::text
         ),
         120
       )
 WHERE action_label IS NULL;

-- 5. Covering composite index with INCLUDE (action_label) for Index-Only Scans.
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_feed_events_created_role_action_label
  ON feed_events (created_at DESC, event_type, actor_id)
  INCLUDE (action_label);

-- 6. Drop the superseded expression index that Postgres could not use for Index-Only Scans.
DROP INDEX CONCURRENTLY IF EXISTS idx_feed_events_created_role_action;

-- 7. Refresh visibility map and planner statistics after backfill so Index-Only Scans get 0 heap fetches.
VACUUM ANALYZE feed_events;
