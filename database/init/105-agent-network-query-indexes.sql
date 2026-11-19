-- database/init/105-agent-network-query-indexes.sql
-- Targeted composite, partial, and expression indexes for /api/admin/agents/network
-- queries on feed_events (120k+ rows, 375 MB TOASTed metadata_payload) and
-- recipe_reflections, eliminating full sequential scans and repeated detoasting.
--
-- migrate:no-transaction
-- All indexes use CREATE INDEX CONCURRENTLY IF NOT EXISTS so deployment does not
-- block concurrent writers on production tables.

-- 1. Actor + event_type + created_at covering index for getTotals / getRoles / per-actor lookups.
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_feed_events_actor_type_created
    ON feed_events (actor_id, event_type, created_at DESC);

-- 2. Created-at + event_type + actor + normalized action expression (bounded via LEFT(..., 120)
--    to guarantee B-tree tuple limits cannot be exceeded) for 7d getRoleOps index-only scans.
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_feed_events_created_role_action
    ON feed_events (
        created_at DESC,
        event_type,
        actor_id,
        (LEFT(
            COALESCE(
                NULLIF(split_part(event_type, '.', 2), ''),
                NULLIF(metadata_payload->>'messageType', ''),
                NULLIF(metadata_payload->>'internalTrigger', ''),
                NULLIF(metadata_payload->>'source', ''),
                event_type::text
            ),
            120
        ))
    );

-- 3. Partial index covering getReasoning's latest agent feed preview scan without
--    scanning or detoasting all 120k rows.
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_feed_events_reasoning_created
    ON feed_events (created_at DESC, actor_id)
    INCLUDE (id)
    WHERE event_type IN ('agent_chat', 'recipe_generation', 'recipe_review', 'recipe_adapted', 'insight', 'lab_entry')
      AND COALESCE(
          NULLIF(metadata_payload->>'responsePreview', ''),
          NULLIF(metadata_payload->>'messagePreview', ''),
          NULLIF(metadata_payload->>'review', ''),
          NULLIF(metadata_payload->>'summary', ''),
          NULLIF(metadata_payload->>'message', '')
      ) IS NOT NULL;

-- 4. Partial covering index for agent recipe_reflections ordered by recency.
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_recipe_reflections_agent_created
    ON recipe_reflections (created_at DESC, author_id)
    WHERE is_agent = true
      AND deleted_at IS NULL
      AND COALESCE(hidden, false) = false;
